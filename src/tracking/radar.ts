import { getDb, getPerson } from "../associate/db/store";
import type { Person } from "../associate/types";
import { FOLLOW_EVENTS, INVESTORS, firmById, type Firm } from "./data";
import { NEWS, type NewsItem } from "./news";

/**
 * Radar: for every APAC round another fund leads, did we see the founder first, and if we missed
 * the deal, why? Three kinds of miss:
 *   - never saw them: the founder wasn't in FirstSignal (a coverage gap)
 *   - saw them, didn't act: we flagged them but nobody reached out (a speed or routing gap)
 *   - met them and lost: we reached out or met, and another fund won (a competitive gap)
 *
 * It also records when the winning fund first engaged, to compare with when we flagged them.
 * Meetings and the winning fund's first touch are demo data here; with live data they'd come from
 * the CRM and from follow and intro activity.
 */

export type MissKind = "never-saw" | "saw-no-action" | "met-lost";

export const MISS_META: Record<MissKind, { label: string; gap: string; tone: string; bar: string }> = {
  "never-saw": {
    label: "Never saw them",
    gap: "Coverage gap",
    tone: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
    bar: "bg-amber-400",
  },
  "saw-no-action": {
    label: "Saw them, didn't act",
    gap: "Speed or routing gap",
    tone: "bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200",
    bar: "bg-orange-500",
  },
  "met-lost": {
    label: "Met them and lost",
    gap: "Competitive gap",
    tone: "bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    bar: "bg-rose-500",
  },
};

export interface RadarRow {
  deal: NewsItem;
  firm: Firm;
  founder?: Person;
  miss: MissKind;
  /** Days before the round that FirstSignal flagged the founder. */
  weFlaggedDaysBefore?: number;
  /** Days before the round the winning fund first engaged, and how. */
  firmEngagedDaysBefore?: number;
  firmEngagedHow?: string;
  /** Set for "met and lost": when we met them. */
  metOn?: string;
}

const DAY = 86_400_000;

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Demo-only facts that would come from the CRM and intro data: fixed per deal so they don't jump around. */
function demoFacts(deal: NewsItem) {
  const seed = [...deal.id].reduce((sum, c) => sum * 31 + c.charCodeAt(0), 7) | 0;
  const rand = rng(seed);
  return {
    met: rand() < 0.3,
    metDaysBefore: 5 + Math.floor(rand() * 30),
    engagedDaysBefore: 10 + Math.floor(rand() * 70),
    engagedHow: ["a partner met them at a demo day", "a scout introduced them", "an associate cold-emailed them", "an angel in their network made an intro"][Math.floor(rand() * 4)],
  };
}

function daysBetween(earlier: string, later: string): number {
  return Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / DAY);
}

export function radarRows(): RadarRow[] {
  const triage = getDb().triage;
  return NEWS.filter((n) => n.kind === "deal").map((deal) => {
    const firm = firmById.get(deal.firmId)!;
    const founder = deal.founderId ? getPerson(deal.founderId) : undefined;
    const facts = demoFacts(deal);

    // The winning fund's first touch: a real follow by someone at the firm if we have one, else demo data.
    const firmInvestors = new Set(INVESTORS.filter((v) => v.firmId === deal.firmId).map((v) => v.id));
    const follow = founder
      ? FOLLOW_EVENTS.filter((e) => firmInvestors.has(e.investorId) && e.target.personId === founder.id && e.at < deal.at).at(-1)
      : undefined;
    const firmEngagedDaysBefore = follow ? daysBetween(follow.at, deal.at) : facts.engagedDaysBefore;
    const firmEngagedHow = follow ? "an investor there followed them on X" : facts.engagedHow;

    if (!founder) {
      return { deal, firm, miss: "never-saw" as const, firmEngagedDaysBefore, firmEngagedHow };
    }
    const weFlaggedDaysBefore = Math.max(0, daysBetween(founder.signal.date, deal.at));
    const reachedOut = triage[founder.id] && triage[founder.id].status !== "dismissed";
    const met = reachedOut || facts.met;
    return {
      deal,
      firm,
      founder,
      miss: met ? ("met-lost" as const) : ("saw-no-action" as const),
      weFlaggedDaysBefore,
      firmEngagedDaysBefore,
      firmEngagedHow,
      metOn: met ? new Date(new Date(deal.at).getTime() - Math.min(facts.metDaysBefore, weFlaggedDaysBefore) * DAY).toISOString() : undefined,
    };
  });
}

export function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function weeks(days: number): string {
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  return `${Math.round(days / 7)} weeks`;
}
