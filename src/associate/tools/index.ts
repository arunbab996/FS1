import { CURRENT_USER_NAME } from "../../utils/currentUser";
import { INCOMING_BATCHES } from "../data/seed";
import { getDb, getPeople, getPerson, updateDb } from "../db/store";
import { nextRunAfter } from "../jobs/schedule";
import { findSimilar as rankSimilar, searchPeople } from "../search/search";
import type {
  Person,
  SavedSearch,
  Schedule,
  SearchFilters,
  SearchHit,
  SearchResult,
  TriageStatus,
} from "../types";

/**
 * The tools layer: plain, framework-agnostic functions over the Associate's database. The agent
 * calls these and nothing else, and the same functions (with `toolDefinitions` below as their
 * schemas) are what a Claude tool-use loop or an MCP server would expose later.
 *
 * Read tools never change anything. Write tools (save_to_list, send_to_inbox, mark_triaged,
 * create_saved_search, ...) are only called after the investor confirms, either by clicking an
 * action on a card or by confirming an action the agent proposed.
 */

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const nowIso = () => new Date().toISOString();

function triagedIds(): Set<string> {
  return new Set(Object.keys(getDb().triage));
}

// ── Read tools ───────────────────────────────────────────────────────────────

export function search_people(args: { query: string; filters?: SearchFilters; limit?: number; exclude_triaged?: boolean }): SearchResult {
  return searchPeople(getPeople(), args.query, args.filters ?? {}, {
    limit: args.limit ?? 20,
    excludeIds: args.exclude_triaged ? triagedIds() : undefined,
  });
}

export function get_profile(args: { person_id: string }): Person | { error: string } {
  return getPerson(args.person_id) ?? { error: `No person with id ${args.person_id}` };
}

export function find_similar(args: { person_id: string; limit?: number }): SearchHit[] | { error: string } {
  const person = getPerson(args.person_id);
  if (!person) return { error: `No person with id ${args.person_id}` };
  return rankSimilar(getPeople(), person, { limit: args.limit ?? 5 });
}

export function list_saved_searches(): SavedSearch[] {
  return getDb().savedSearches;
}

/** Net-new people from a search's runs that nobody has triaged yet. */
export function pending_matches(searchId: string): string[] {
  const search = getDb().savedSearches.find((s) => s.id === searchId);
  if (!search) return [];
  const triage = getDb().triage;
  return search.newIds.filter((id) => !triage[id]);
}

export interface BriefingGroup {
  search: SavedSearch;
  personIds: string[];
}

/** The morning briefing: untriaged net-new matches across every saved search, grouped by search. */
export function get_briefing(): BriefingGroup[] {
  return getDb()
    .savedSearches.map((search) => ({ search, personIds: pending_matches(search.id) }))
    .filter((g) => g.personIds.length > 0)
    .sort((a, b) => b.personIds.length - a.personIds.length);
}

// ── Write tools (confirmed by the investor first) ────────────────────────────

export function mark_triaged(args: { person_id: string; status: TriageStatus; list_id?: string }): { ok: true } {
  updateDb((db) => ({
    ...db,
    triage: { ...db.triage, [args.person_id]: { status: args.status, at: nowIso(), listId: args.list_id } },
  }));
  return { ok: true };
}

/** Undo a triage decision, so the person can show up again. */
export function clear_triage(args: { person_id: string }): { ok: true } {
  updateDb((db) => {
    const triage = { ...db.triage };
    delete triage[args.person_id];
    return {
      ...db,
      triage,
      lists: db.lists.map((l) => ({ ...l, personIds: l.personIds.filter((id) => id !== args.person_id) })),
      inbox: db.inbox.filter((i) => i.personId !== args.person_id),
    };
  });
  return { ok: true };
}

export function save_to_list(args: { person_id: string; list: string }): { ok: true; list_id: string; list_name: string } {
  const existing = getDb().lists.find((l) => l.name.toLowerCase() === args.list.toLowerCase());
  const listId = existing?.id ?? uid("list");
  const listName = existing?.name ?? args.list;
  updateDb((db) => ({
    ...db,
    lists: existing
      ? db.lists.map((l) => (l.id === listId && !l.personIds.includes(args.person_id) ? { ...l, personIds: [...l.personIds, args.person_id] } : l))
      : [...db.lists, { id: listId, name: listName, personIds: [args.person_id] }],
  }));
  mark_triaged({ person_id: args.person_id, status: "saved", list_id: listId });
  return { ok: true, list_id: listId, list_name: listName };
}

export function send_to_inbox(args: { person_id: string; investor?: string; source?: string }): { ok: true; investor: string } {
  const investor = args.investor ?? CURRENT_USER_NAME;
  updateDb((db) => ({
    ...db,
    inbox: [
      { personId: args.person_id, investor, sentAt: nowIso(), source: args.source ?? "AI Associate" },
      ...db.inbox.filter((i) => i.personId !== args.person_id),
    ],
  }));
  mark_triaged({ person_id: args.person_id, status: "sent" });
  return { ok: true, investor };
}

export function create_saved_search(args: { name: string; query: string; filters: SearchFilters; schedule: Schedule }): SavedSearch {
  const created: SavedSearch = {
    id: uid("search"),
    name: args.name,
    query: args.query,
    filters: args.filters,
    schedule: args.schedule,
    status: "active",
    createdAt: nowIso(),
    nextRunAt: nextRunAfter(args.schedule, new Date()).toISOString(),
    lastRunAt: null,
    seenIds: [],
    newIds: [],
  };
  updateDb((db) => ({ ...db, savedSearches: [created, ...db.savedSearches] }));
  return created;
}

export function update_saved_search(args: {
  search_id: string;
  patch: Partial<Pick<SavedSearch, "name" | "query" | "filters" | "schedule" | "status">>;
}): SavedSearch | { error: string } {
  const current = getDb().savedSearches.find((s) => s.id === args.search_id);
  if (!current) return { error: "Saved search not found" };
  const next: SavedSearch = { ...current, ...args.patch };
  if (args.patch.schedule || (args.patch.status === "active" && current.status === "paused")) {
    next.nextRunAt = nextRunAfter(next.schedule, new Date()).toISOString();
  }
  updateDb((db) => ({ ...db, savedSearches: db.savedSearches.map((s) => (s.id === next.id ? next : s)) }));
  return next;
}

export function clone_saved_search(args: { search_id: string }): SavedSearch | { error: string } {
  const current = getDb().savedSearches.find((s) => s.id === args.search_id);
  if (!current) return { error: "Saved search not found" };
  return create_saved_search({ name: `${current.name} (copy)`, query: current.query, filters: current.filters, schedule: current.schedule });
}

export function delete_saved_search(args: { search_id: string }): { ok: true } {
  updateDb((db) => ({
    ...db,
    savedSearches: db.savedSearches.filter((s) => s.id !== args.search_id),
    runs: db.runs.filter((r) => r.searchId !== args.search_id),
  }));
  return { ok: true };
}

export interface RunResult {
  search_id: string;
  matched: number;
  new_ids: string[];
}

/**
 * Run a saved search and keep only net-new people: anyone an earlier run already returned, or
 * that the investor has triaged, is left out. New people are added to the search's queue for the
 * Saved searches page and the morning briefing.
 */
export function run_saved_search(args: { search_id: string }): RunResult | { error: string } {
  const search = getDb().savedSearches.find((s) => s.id === args.search_id);
  if (!search) return { error: "Saved search not found" };
  const result = searchPeople(getPeople(), search.query, search.filters, { limit: 100, excludeIds: triagedIds() });
  const seen = new Set(search.seenIds);
  const newIds = result.hits.map((h) => h.personId).filter((id) => !seen.has(id));
  const at = new Date();
  updateDb((db) => ({
    ...db,
    savedSearches: db.savedSearches.map((s) =>
      s.id === search.id
        ? {
            ...s,
            lastRunAt: at.toISOString(),
            nextRunAt: nextRunAfter(s.schedule, at).toISOString(),
            seenIds: [...s.seenIds, ...newIds],
            newIds: [...newIds, ...s.newIds],
          }
        : s,
    ),
    runs: [{ id: uid("run"), searchId: search.id, at: at.toISOString(), matched: result.total, newIds }, ...db.runs].slice(0, 200),
  }));
  return { search_id: search.id, matched: result.total, new_ids: newIds };
}

/** The jobs layer's entry point: run every active search whose next run is due. */
export function run_due_searches(now = new Date()): RunResult[] {
  return getDb()
    .savedSearches.filter((s) => s.status === "active" && new Date(s.nextRunAt) <= now)
    .map((s) => run_saved_search({ search_id: s.id }))
    .filter((r): r is RunResult => !("error" in r));
}

// ── Demo controls (not agent tools) ──────────────────────────────────────────

/** Release the next batch of held-back profiles, as if new signals arrived overnight. */
export function release_new_signals(): { released: number; remaining: number } {
  const released = getDb().releasedAt.length;
  if (released >= INCOMING_BATCHES) return { released: 0, remaining: 0 };
  const before = getPeople().length;
  updateDb((db) => ({ ...db, releasedAt: [...db.releasedAt, nowIso()] }));
  return { released: getPeople().length - before, remaining: INCOMING_BATCHES - released - 1 };
}

// ── Schemas, in Anthropic tool-use format (also usable as MCP tool schemas) ──

const filtersSchema = {
  type: "object",
  description: "Structured filters applied before ranking. Leave a field out to allow any value.",
  properties: {
    pastCompanies: { type: "array", items: { type: "string" }, description: "Employers the person has worked at, e.g. Grab, Gojek." },
    signalTypes: { type: "array", items: { enum: ["Stealth", "New Company", "Exploring", "Investor Interest"] } },
    withinDays: { type: "integer", description: "Only signals from the last N days." },
    sectors: { type: "array", items: { type: "string" }, description: "Focus areas, e.g. AI infra, Fintech, Developer tools." },
    countries: { type: "array", items: { type: "string" } },
    backgrounds: { type: "array", items: { enum: ["Engineering", "Product", "Data & ML", "Design", "Operations", "Research"] } },
    repeatFounder: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export const toolDefinitions = [
  {
    name: "search_people",
    description: "Search FirstSignal people by meaning plus structured filters. Returns ranked hits with match reasons quoted from each profile. Only describe people this returns.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The investor's request in plain language, used for similarity ranking." },
        filters: filtersSchema,
        limit: { type: "integer" },
        exclude_triaged: { type: "boolean" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_profile",
    description: "Get one person's full profile by id.",
    input_schema: { type: "object", properties: { person_id: { type: "string" } }, required: ["person_id"], additionalProperties: false },
  },
  {
    name: "find_similar",
    description: "Find people who look like a given person (background, focus, shared employers).",
    input_schema: { type: "object", properties: { person_id: { type: "string" }, limit: { type: "integer" } }, required: ["person_id"], additionalProperties: false },
  },
  {
    name: "save_to_list",
    description: "Save a person to a named list (created if new). Requires the investor's confirmation.",
    input_schema: { type: "object", properties: { person_id: { type: "string" }, list: { type: "string" } }, required: ["person_id", "list"], additionalProperties: false },
  },
  {
    name: "send_to_inbox",
    description: "Send a person to an investor's Inbox. Notifies them, so requires confirmation.",
    input_schema: { type: "object", properties: { person_id: { type: "string" }, investor: { type: "string" } }, required: ["person_id"], additionalProperties: false },
  },
  {
    name: "mark_triaged",
    description: "Record that the investor triaged a person, so saved searches stop showing them.",
    input_schema: {
      type: "object",
      properties: { person_id: { type: "string" }, status: { enum: ["saved", "sent", "dismissed"] } },
      required: ["person_id", "status"],
      additionalProperties: false,
    },
  },
  {
    name: "create_saved_search",
    description: "Save a search as a scheduled job. Requires confirmation.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        query: { type: "string" },
        filters: filtersSchema,
        schedule: {
          type: "object",
          properties: { kind: { enum: ["daily", "weekdays", "weekly"] }, weekday: { type: "integer", minimum: 0, maximum: 6 }, hour: { type: "integer", minimum: 0, maximum: 23 } },
          required: ["kind", "hour"],
        },
      },
      required: ["name", "query", "filters", "schedule"],
      additionalProperties: false,
    },
  },
  {
    name: "list_saved_searches",
    description: "List the investor's saved searches with schedule, next and last run.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "run_saved_search",
    description: "Run a saved search now. Returns only net-new people since earlier runs, excluding anyone triaged.",
    input_schema: { type: "object", properties: { search_id: { type: "string" } }, required: ["search_id"], additionalProperties: false },
  },
] as const;
