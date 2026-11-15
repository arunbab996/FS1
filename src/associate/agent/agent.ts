import { getDb, getPeople, getPerson } from "../db/store";
import { DEFAULT_SCHEDULE, scheduleInSentence, shortSchedule } from "../jobs/schedule";
import { relativeDays } from "../search/search";
import * as tools from "../tools";
import type { Person, Schedule, SearchFilters, SearchHit } from "../types";
import { SUGGESTED_PROMPTS } from "./prompts";
import { describeWithin, understandQuery, understandSchedule } from "./understand";

/**
 * The agent layer. `respond` reads one message, decides which tools to call, and returns the
 * blocks the chat renders. It only ever describes people that a tool returned.
 *
 * This prototype has no model API, so the decisions here are rules. With the Anthropic API, this
 * file becomes a tool-use loop: Claude gets `toolDefinitions` from the tools layer, the same tool
 * functions run on its calls, and its tool results map onto the same blocks. Writes stay behind
 * the same confirmation step either way.
 */

export type ActionStatus = "pending" | "confirmed" | "cancelled";

export type PendingAction =
  | { id: string; type: "create_saved_search"; status: ActionStatus; name: string; query: string; filters: SearchFilters; schedule: Schedule; chips: string[] }
  | { id: string; type: "send_to_inbox"; status: ActionStatus; personId: string }
  | { id: string; type: "save_to_list"; status: ActionStatus; personId: string; list: string };

export type Block =
  | { kind: "text"; text: string }
  /** The agent's working steps, shown as a checklist that ticks off while the reply streams. */
  | { kind: "steps"; steps: string[]; seconds: number }
  | { kind: "tool"; name: string; summary: string }
  | { kind: "results"; title: string; total: number; hits: SearchHit[]; filters?: SearchFilters }
  | { kind: "profile"; personId: string }
  | { kind: "action"; actionId: string }
  | { kind: "searches"; ids: string[] }
  | { kind: "suggestions"; items: string[] };

export interface AgentContext {
  lastSearch?: { query: string; filters: SearchFilters; chips: string[]; hits: SearchHit[] };
  /** The person the conversation is about, for "her", "him", "this person". */
  focusPersonId?: string;
  /** The most recent action awaiting a yes/no. */
  pendingActionId?: string;
}

export interface AgentTurn {
  blocks: Block[];
  context: AgentContext;
  /** New actions this turn proposed, for the chat to track. */
  actions: PendingAction[];
  /** Set when the message was a yes/no answer to a pending action. */
  resolve?: { actionId: string; confirm: boolean };
}

const uid = () => Math.random().toString(36).slice(2, 9);

const ORDINALS: Record<string, number> = { first: 0, top: 0, "1st": 0, second: 1, "2nd": 1, third: 2, "3rd": 2, fourth: 3, "4th": 3, fifth: 4, "5th": 4 };

/** Works out which person a message is about: a name, "the second one", or a pronoun. */
function resolvePerson(input: string, ctx: AgentContext): Person | undefined {
  const text = input.toLowerCase();
  const hits = ctx.lastSearch?.hits ?? [];
  const candidates = [...hits.map((h) => getPerson(h.personId)!).filter(Boolean), ...getPeople()];
  const byFullName = candidates.find((p) => text.includes(p.name.toLowerCase()));
  if (byFullName) return byFullName;
  const byFirstName = hits.map((h) => getPerson(h.personId)!).find((p) => p && new RegExp(`\\b${p.name.split(" ")[0].toLowerCase()}\\b`).test(text));
  if (byFirstName) return byFirstName;
  // "the second one", "the top match" — but not "first-time founders".
  const ordinal = Object.entries(ORDINALS).find(([word]) => new RegExp(`\\bthe ${word}\\b(?!-)`).test(text));
  if (ordinal && hits[ordinal[1]]) return getPerson(hits[ordinal[1]].personId);
  const numbered = text.match(/#\s?(\d)\b|\bnumber (\d)\b/);
  if (numbered) {
    const i = Number(numbered[1] ?? numbered[2]) - 1;
    if (hits[i]) return getPerson(hits[i].personId);
  }
  if (/\b(her|him|them|this person|that person|this one|that one|this founder)\b/.test(text)) {
    return getPerson(ctx.focusPersonId ?? hits[0]?.personId ?? "");
  }
  return undefined;
}

function searchName(filters: SearchFilters, fallback: string): string {
  const parts: string[] = [];
  if (filters.pastCompanies?.length) parts.push(`Ex-${filters.pastCompanies.join("/")}`);
  if (filters.repeatFounder) parts.push("Repeat founders");
  if (filters.backgrounds?.length) parts.push(filters.backgrounds.length > 2 ? "Technical" : filters.backgrounds.join("/"));
  if (filters.signalTypes?.length) parts.push(filters.signalTypes.join("/"));
  if (filters.sectors?.length) parts.push(filters.sectors.join("/"));
  if (filters.countries?.length && filters.countries.length <= 2) parts.push(filters.countries.join("/"));
  return parts.length ? parts.join(" · ") : fallback.slice(0, 48);
}

function summariseProfile(p: Person): string {
  const past = p.roles.filter((r) => r.endYear !== null && r.company !== "Stealth").map((r) => `${r.title} at ${r.company} (${r.startYear}–${r.endYear})`);
  const parts = [
    `${p.name} — ${p.headline}, based in ${p.city}, ${p.country}.`,
    past.length ? `Before this: ${past.join("; ")}.` : "",
    p.repeatFounder && p.previousStartup ? `Previously co-founded ${p.previousStartup}.` : "",
    `Latest signal (${relativeDays(p.signal.date)}): ${p.signal.detail}`,
    p.building ? `Building: “${p.building}”.` : "",
    `${p.education}.`,
  ];
  return parts.filter(Boolean).join(" ");
}

function resultsSummary(total: number, hits: SearchHit[]): string {
  if (total === 0) return "";
  const top = getPerson(hits[0].personId)!;
  const triage = getDb().triage;
  const already = hits.filter((h) => triage[h.personId]).length;
  const lines = [
    `Found ${total} ${total === 1 ? "person" : "people"}. ${top.name} is the strongest match — ${hits[0].reasons[0]?.replace(/\.$/, "") ?? top.headline}.`,
  ];
  if (already) lines.push(`${already} of them you've already triaged; they're marked on their cards.`);
  return lines.join(" ");
}

function proposeSchedule(ctx: AgentContext, schedule: Schedule): { action: PendingAction; text: string } | null {
  const last = ctx.lastSearch;
  if (!last) return null;
  const action: PendingAction = {
    id: uid(),
    type: "create_saved_search",
    status: "pending",
    name: searchName(last.filters, last.query),
    query: last.query,
    filters: last.filters,
    schedule,
    chips: last.chips,
  };
  return { action, text: `Want me to run this ${shortSchedule(schedule)}? I'll only bring you people you haven't seen.` };
}

const YES = /^(yes|yep|yeah|sure|ok|okay|do it|go ahead|confirm|please do|sounds good)\b/i;
const NO = /^(no|nope|not now|cancel|don'?t|skip)\b/i;

function newSearch(input: string, ctx: AgentContext, refine?: SearchFilters): AgentTurn {
  const understood = understandQuery(input);
  const filters: SearchFilters = refine ? { ...refine, ...understood.filters } : understood.filters;
  const chips = refine ? understandChips(filters) : understood.chips;
  const query = refine && ctx.lastSearch ? `${ctx.lastSearch.query} ${understood.freeText}`.trim() : understood.freeText || input;
  const hasFilters = Object.keys(filters).length > 0;

  if (!hasFilters && understood.freeText.split(" ").filter(Boolean).length < 2) {
    return {
      blocks: [
        { kind: "text", text: "Tell me who you're looking for — a background, a company they left, a signal like stealth or a new company, a sector and a place. For example:" },
        { kind: "suggestions", items: SUGGESTED_PROMPTS.slice(0, 3) },
      ],
      context: ctx,
      actions: [],
    };
  }

  const blocks: Block[] = [];
  let result = tools.search_people({ query, filters, limit: 20 });
  const criteriaCount = Object.keys(filters).length;
  blocks.push({
    kind: "steps",
    seconds: Math.round((0.8 + Math.min(query.length, 120) / 80) * 10) / 10,
    steps: [
      criteriaCount ? `Read your request · ${criteriaCount} ${criteriaCount === 1 ? "criterion" : "criteria"}` : "Read your request",
      `Searched ${getPeople().length} FirstSignal profiles`,
      "Ranked by fit and signal freshness",
      "Checked why each person matches",
    ],
  });

  let usedFilters = filters;
  let usedChips = chips;
  if (result.total === 0) {
    // Relax one constraint at a time and say which one.
    const relaxations: [keyof SearchFilters, string][] = [
      ["withinDays", filters.withinDays ? `the ${describeWithin(filters.withinDays).toLowerCase()} limit` : ""],
      ["sectors", "the sector"],
      ["backgrounds", "the background"],
      ["countries", "the location"],
    ];
    for (const [key, label] of relaxations) {
      if (!filters[key]) continue;
      const relaxed = { ...filters };
      delete relaxed[key];
      const retry = tools.search_people({ query, filters: relaxed, limit: 20 });
      if (retry.total > 0) {
        blocks.push({ kind: "text", text: `No exact matches. Without ${label}, there ${retry.total === 1 ? "is 1 person" : `are ${retry.total} people`}:` });
        result = retry;
        usedFilters = relaxed;
        usedChips = understandChips(relaxed);
        break;
      }
    }
    if (result.total === 0) {
      blocks.push({ kind: "text", text: "I couldn't find anyone matching that in FirstSignal's data, even with looser filters. Try a broader description, or one of these:" });
      blocks.push({ kind: "suggestions", items: SUGGESTED_PROMPTS.slice(3) });
      return { blocks, context: ctx, actions: [] };
    }
  } else {
    blocks.push({ kind: "text", text: resultsSummary(result.total, result.hits) });
  }

  blocks.push({ kind: "results", title: usedChips.join(" · ") || query, total: result.total, hits: result.hits, filters: usedFilters });
  const context: AgentContext = {
    ...ctx,
    lastSearch: { query, filters: usedFilters, chips: usedChips, hits: result.hits },
    focusPersonId: result.hits[0]?.personId,
  };

  const offer = proposeSchedule(context, DEFAULT_SCHEDULE);
  const actions: PendingAction[] = [];
  if (offer) {
    blocks.push({ kind: "action", actionId: offer.action.id });
    actions.push(offer.action);
    context.pendingActionId = offer.action.id;
  }
  return { blocks, context, actions };
}

/** Chips for a filter set, reusing the parser's wording. */
function understandChips(filters: SearchFilters): string[] {
  const chips: string[] = [];
  if (filters.sectors?.length) chips.push(`Building in ${filters.sectors.join(" or ")}`);
  if (filters.withinDays) chips.push(describeWithin(filters.withinDays));
  if (filters.signalTypes?.length) chips.push(`Signal: ${filters.signalTypes.join(" or ")}`);
  if (filters.repeatFounder) chips.push("Repeat founder");
  if (filters.pastCompanies?.length) chips.push(`Worked at ${filters.pastCompanies.join(" or ")}`);
  if (filters.countries?.length) chips.push(filters.countries.length > 3 ? `Region: ${filters.countries.length} countries` : `Based in ${filters.countries.join(" or ")}`);
  if (filters.backgrounds?.length) chips.push(`Background: ${filters.backgrounds.join(", ")}`);
  return chips;
}

export function respond(input: string, ctx: AgentContext): AgentTurn {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. A yes/no answer to the action the agent just proposed.
  if (ctx.pendingActionId && (YES.test(text) || NO.test(text))) {
    return { blocks: [], context: { ...ctx, pendingActionId: undefined }, actions: [], resolve: { actionId: ctx.pendingActionId, confirm: YES.test(text) } };
  }

  // 2. Scheduling the last search: "run this every Monday", "save this as a daily search".
  const schedule = understandSchedule(lower);
  if (ctx.lastSearch && (schedule || /\b(save|schedule|watch|track|keep (an eye|watching))\b.*\b(this|it|search)\b/.test(lower))) {
    const offer = proposeSchedule(ctx, schedule ?? DEFAULT_SCHEDULE)!;
    return {
      blocks: [
        { kind: "text", text: `Here's the job I'd set up — ${scheduleInSentence(offer.action.type === "create_saved_search" ? offer.action.schedule : DEFAULT_SCHEDULE)}. Confirm and it goes on your Saved searches page.` },
        { kind: "action", actionId: offer.action.id },
      ],
      context: { ...ctx, pendingActionId: offer.action.id },
      actions: [offer.action],
    };
  }

  // 3. Saved searches and the briefing.
  if (/\b(my )?saved searches\b|\bwhat am i (tracking|watching)\b|\bmy (jobs|searches)\b/.test(lower) && !/\brun\b/.test(lower)) {
    const searches = tools.list_saved_searches();
    return {
      blocks: searches.length
        ? [{ kind: "tool", name: "list_saved_searches", summary: `${searches.length} saved` }, { kind: "searches", ids: searches.map((s) => s.id) }]
        : [{ kind: "text", text: "You don't have any saved searches yet. Run a search and I'll offer to schedule it." }],
      context: ctx,
      actions: [],
    };
  }
  const runMatch = lower.match(/\brun (?:my )?(?:saved search )?["“']?(.+?)["”']?\s*(?:now)?$/);
  if (runMatch) {
    const wanted = runMatch[1].replace(/\b(saved search|search)\b/g, "").trim();
    const search = tools.list_saved_searches().find((s) => s.name.toLowerCase().includes(wanted) || wanted.includes(s.name.toLowerCase()));
    if (search) {
      const run = tools.run_saved_search({ search_id: search.id });
      if ("error" in run) return { blocks: [{ kind: "text", text: run.error }], context: ctx, actions: [] };
      const hits: SearchHit[] = run.new_ids.map((id) => ({ personId: id, score: 1, reasons: tools.search_people({ query: search.query, filters: search.filters, limit: 100 }).hits.find((h) => h.personId === id)?.reasons ?? [] }));
      return {
        blocks: [
          { kind: "tool", name: "run_saved_search", summary: `${search.name} · ${run.matched} match in total` },
          run.new_ids.length
            ? { kind: "text", text: `${run.new_ids.length} new since the last run. Everyone else you've already seen.` }
            : { kind: "text", text: "Nothing new since the last run — everyone matching has already been shown to you." },
          ...(run.new_ids.length ? [{ kind: "results" as const, title: search.name, total: run.new_ids.length, hits, filters: search.filters }] : []),
        ],
        context: { ...ctx, lastSearch: { query: search.query, filters: search.filters, chips: understandChips(search.filters), hits }, focusPersonId: hits[0]?.personId },
        actions: [],
      };
    }
  }
  if (/\bbriefing\b|\bwhat'?s new\b|\bnew matches\b/.test(lower)) {
    const groups = tools.get_briefing();
    const total = groups.reduce((sum, g) => sum + g.personIds.length, 0);
    return {
      blocks: total
        ? [
            { kind: "text", text: `${total} new ${total === 1 ? "match" : "matches"} across ${groups.length} saved ${groups.length === 1 ? "search" : "searches"}. The full list is on the Briefing tab.` },
            ...groups.map((g) => ({ kind: "results" as const, title: g.search.name, total: g.personIds.length, hits: g.personIds.slice(0, 3).map((id) => ({ personId: id, score: 1, reasons: [] })) })),
          ]
        : [{ kind: "text", text: "You're all caught up — no untriaged matches from your saved searches." }],
      context: ctx,
      actions: [],
    };
  }

  // 4. Follow-ups about a person.
  const person = resolvePerson(text, ctx);
  if (person) {
    const focus = { ...ctx, focusPersonId: person.id };
    if (/\bsimilar\b|\blooks? like\b|\bwho else\b|\bmore like\b/.test(lower)) {
      const similar = tools.find_similar({ person_id: person.id, limit: 5 });
      if ("error" in similar) return { blocks: [{ kind: "text", text: similar.error }], context: focus, actions: [] };
      return {
        blocks: [
          { kind: "tool", name: "find_similar", summary: `Compared against ${getPeople().length} profiles` },
          { kind: "text", text: `${similar.length} people who look like ${person.name.split(" ")[0]} — similar background, focus and employers:` },
          { kind: "results", title: `Similar to ${person.name}`, total: similar.length, hits: similar },
        ],
        context: { ...focus, lastSearch: { query: `similar to ${person.name}`, filters: {}, chips: [], hits: similar } },
        actions: [],
      };
    }
    if (/\binbox\b/.test(lower)) {
      const action: PendingAction = { id: uid(), type: "send_to_inbox", status: "pending", personId: person.id };
      return { blocks: [{ kind: "action", actionId: action.id }], context: { ...focus, pendingActionId: action.id }, actions: [action] };
    }
    const listMatch = lower.match(/\b(?:save|add|put)\b.*?\b(?:to|in|on)\b (?:my |the )?(.+?)(?: list)?$/);
    if (listMatch || /\b(save|shortlist)\b/.test(lower)) {
      const list = listMatch?.[1] && !/^(her|him|them|list)$/.test(listMatch[1]) ? listMatch[1].replace(/\b\w/g, (c) => c.toUpperCase()) : "Shortlist";
      const action: PendingAction = { id: uid(), type: "save_to_list", status: "pending", personId: person.id, list };
      return { blocks: [{ kind: "action", actionId: action.id }], context: { ...focus, pendingActionId: action.id }, actions: [action] };
    }
    if (/\b(dismiss|pass on|not interested|skip)\b/.test(lower)) {
      tools.mark_triaged({ person_id: person.id, status: "dismissed" });
      return { blocks: [{ kind: "text", text: `Dismissed ${person.name}. Saved searches won't show ${person.pronoun === "he" ? "him" : "her"} again.` }], context: focus, actions: [] };
    }
    tools.get_profile({ person_id: person.id });
    return {
      blocks: [
        { kind: "tool", name: "get_profile", summary: person.name },
        { kind: "text", text: summariseProfile(person) },
        { kind: "profile", personId: person.id },
      ],
      context: focus,
      actions: [],
    };
  }

  // 5. A refinement of the last search ("only in Singapore", "just the last month").
  if (ctx.lastSearch && /^(only|just|now|and|but|also|narrow|limit|filter|make it|what about|how about)\b/.test(lower)) {
    return newSearch(text, ctx, ctx.lastSearch.filters);
  }

  // 6. Otherwise, a new search.
  return newSearch(text, ctx);
}
