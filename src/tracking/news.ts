import { SEED_PEOPLE } from "../associate/data/seed";
import type { Person } from "../associate/types";
import { FIRMS, INVESTORS, type Firm } from "./data";

/**
 * Demo news for Investor Tracking: what the firms you track have been up to. To keep invented
 * news harmless, every story is about a made-up company or a made-up person, never a real
 * fund close, and none is credited to a real publication. Live news would replace this file.
 *
 * Deals are mostly in companies whose founders are in FirstSignal's seed data, so a story can show
 * whether we saw the founder before the round, which is the start of classifying misses.
 */

export type NewsKind = "deal" | "people" | "portfolio";

export interface NewsItem {
  id: string;
  kind: NewsKind;
  at: string;
  /** The tracked firm the story is about; co-investors are listed separately. */
  firmId: string;
  coInvestorIds: string[];
  headline: string;
  summary: string;
  round?: string;
  amountUsdM?: number;
  company?: string;
  /** The founder in FirstSignal, when the company is one we already knew. */
  founderId?: string;
}

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
const rand = rng(16112026);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];

const ROUNDS: { round: string; min: number; max: number }[] = [
  { round: "Pre-seed", min: 0.5, max: 2 },
  { round: "Seed", min: 2, max: 6 },
  { round: "Seed", min: 2, max: 6 },
  { round: "Series A", min: 8, max: 25 },
];

/** Companies nobody in FirstSignal has flagged: deals here are coverage gaps. */
const UNKNOWN_COMPANIES: { name: string; city: string; what: string }[] = [
  { name: "Tidepool Robotics", city: "Singapore", what: "warehouse picking robots for 3PLs" },
  { name: "Kopi Labs", city: "Ho Chi Minh City", what: "AI ordering and inventory for F&B chains" },
  { name: "Monsoon Data", city: "Pune", what: "claims data infrastructure for insurers" },
  { name: "Saltpan Energy", city: "Chennai", what: "solar-plus-storage financing for factories" },
  { name: "Lumbung", city: "Jakarta", what: "working capital for rural grocery stores" },
];

const DAY = 86_400_000;
const now = Date.now();
let counter = 0;

function money(m: number): string {
  return m < 1 ? `$${Math.round(m * 1000)}K` : `$${Math.round(m * 10) / 10}M`;
}

/** Lower-case the first letter, unless it starts an acronym like "AI". */
function lowerFirst(text: string): string {
  return /^[A-Z]{2}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

/** The startup a person founded and still runs; never their employer. */
function founded(p: Person): { company: string } | null {
  const role = p.roles.find((r) => r.endYear === null && r.company !== "Stealth" && /founder/i.test(r.title));
  return role ? { company: role.company } : null;
}

function build(): NewsItem[] {
  const items: NewsItem[] = [];
  const add = (item: Omit<NewsItem, "id">) => items.push({ ...item, id: `news${++counter}` });
  const founders = SEED_PEOPLE.filter((p) => !p.incomingBatch && founded(p) && p.building);
  const usedCompanies = new Set<string>();

  // Deals: a tracked firm leads, sometimes with co-investors.
  for (let i = 0; i < 45; i++) {
    const firm = pick(FIRMS);
    const others = FIRMS.filter((f) => f.id !== firm.id);
    const co = rand() < 0.5 ? [pick(others).id] : rand() < 0.5 ? [pick(others).id, pick(others).id] : [];
    const { round, min, max } = pick(ROUNDS);
    const amount = Math.round((min + rand() * (max - min)) * 10) / 10;
    const daysAgo = Math.pow(rand(), 1.4) * 30;
    const unknown = rand() < 0.2;

    if (unknown) {
      const c = pick(UNKNOWN_COMPANIES);
      if (usedCompanies.has(c.name)) continue;
      usedCompanies.add(c.name);
      add({
        kind: "deal",
        at: new Date(now - daysAgo * DAY).toISOString(),
        firmId: firm.id,
        coInvestorIds: [...new Set(co)],
        headline: `${firm.name} leads ${money(amount)} ${round} in ${c.name}`,
        summary: `${c.city}-based ${c.name} is building ${c.what}. The round was announced ${co.length ? "with participation from existing angels and co-investors" : "as a solo lead"}.`,
        round,
        amountUsdM: amount,
        company: c.name,
      });
      continue;
    }

    const founder = pick(founders);
    const company = founded(founder)!.company;
    if (usedCompanies.has(company)) continue;
    usedCompanies.add(company);
    // The round lands after the founder's signal, so "we saw them first" is plausible.
    const signalAge = (now - new Date(founder.signal.date).getTime()) / DAY;
    const announced = Math.min(daysAgo, Math.max(0, signalAge - 3));
    add({
      kind: "deal",
      at: new Date(now - announced * DAY).toISOString(),
      firmId: firm.id,
      coInvestorIds: [...new Set(co)],
      headline: `${firm.name} leads ${money(amount)} ${round} in ${company}`,
      summary: `${company}, founded by ${founder.name} in ${founder.city}, is building ${lowerFirst(founder.building)}.`,
      round,
      amountUsdM: amount,
      company,
      founderId: founder.id,
    });
  }

  // People moves at tracked firms (invented people only).
  const moved = new Set<string>();
  for (let i = 0; i < 8; i++) {
    const investor = pick(INVESTORS.filter((v) => v.title !== "Managing Partner"));
    // One story per person, so nobody both joins and gets promoted.
    if (moved.has(investor.id)) continue;
    moved.add(investor.id);
    const firm = FIRMS.find((f) => f.id === investor.firmId)!;
    const promoted = rand() < 0.5;
    add({
      kind: "people",
      at: new Date(now - Math.pow(rand(), 1.2) * 30 * DAY).toISOString(),
      firmId: firm.id,
      coInvestorIds: [],
      headline: promoted ? `${investor.name} promoted to ${investor.title === "Partner" ? "General Partner" : "Partner"} at ${firm.name}` : `${investor.name} joins ${firm.name} as ${investor.title}`,
      summary: promoted
        ? `${investor.name} will lead more early-stage deals across ${firm.focus.split(", ").pop()}.`
        : `${investor.name} will focus on ${pick(["AI infrastructure", "fintech", "B2B software", "consumer", "climate"])} in ${firm.focus.split(", ").pop()}.`,
    });
  }

  // Portfolio milestones for companies a tracked firm backed.
  const backed = items.filter((n) => n.kind === "deal" && n.company);
  const milestoned = new Set<string>();
  for (let i = 0; i < 8 && backed.length; i++) {
    const deal = pick(backed);
    if (milestoned.has(deal.company!)) continue;
    milestoned.add(deal.company!);
    const firm = FIRMS.find((f) => f.id === deal.firmId)!;
    const milestone = pick([
      `${deal.company} launches in ${pick(["Vietnam", "the Philippines", "Malaysia", "Indonesia", "Thailand"])}`,
      `${deal.company} passes ${pick(["10,000", "50,000", "100,000"])} customers`,
      `${deal.company} signs its first enterprise customer in ${pick(["Singapore", "India", "Australia"])}`,
    ]);
    add({
      kind: "portfolio",
      at: new Date(Math.min(now, new Date(deal.at).getTime() + rand() * 10 * DAY)).toISOString(),
      firmId: firm.id,
      coInvestorIds: [],
      headline: milestone,
      summary: `${deal.company} is backed by ${firm.name}, which led its ${deal.round} ${deal.amountUsdM ? `(${money(deal.amountUsdM)})` : ""}.`.replace(" .", "."),
      company: deal.company,
      founderId: deal.founderId,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export const NEWS: NewsItem[] = build();

export function newsMoney(m: number): string {
  return money(m);
}

/** Every firm a story involves, lead first. */
export function firmsIn(item: NewsItem): Firm[] {
  return [item.firmId, ...item.coInvestorIds].map((id) => FIRMS.find((f) => f.id === id)!).filter(Boolean);
}
