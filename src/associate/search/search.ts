import type { Person, SearchFilters, SearchHit, SearchResult } from "../types";
import { buildIndex, cosine, embedQuery, profileText, sharedTerms, type VectorIndex } from "./vectors";

/** Days since a person's signal fired. */
export function daysSince(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));
}

export function relativeDays(iso: string, now = Date.now()): string {
  const d = daysSince(iso, now);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  return `${Math.round(d / 30)} months ago`;
}

function yearRange(start: number, end: number | null) {
  return `${start}–${end ?? "now"}`;
}

/** Whether a person passes every structured filter that's set. */
export function passesFilters(p: Person, f: SearchFilters, now = Date.now()): boolean {
  if (f.pastCompanies?.length && !p.roles.some((r) => f.pastCompanies!.includes(r.company))) return false;
  if (f.signalTypes?.length && !f.signalTypes.includes(p.signal.type)) return false;
  if (f.withinDays && daysSince(p.signal.date, now) > f.withinDays) return false;
  if (f.sectors?.length && !p.sectors.some((s) => f.sectors!.includes(s))) return false;
  if (f.countries?.length && !f.countries.includes(p.country)) return false;
  if (f.backgrounds?.length && !f.backgrounds.includes(p.background)) return false;
  if (f.repeatFounder && !p.repeatFounder) return false;
  return true;
}

/**
 * Why a person matched, one line per filter, each quoting their profile. Nothing here is written
 * by a model, so a reason can never describe something the profile doesn't say.
 */
export function matchReasons(p: Person, f: SearchFilters, queryText: string, now = Date.now()): string[] {
  const reasons: string[] = [];
  if (f.pastCompanies?.length) {
    const role = p.roles.find((r) => f.pastCompanies!.includes(r.company));
    if (role) {
      reasons.push(`${role.endYear === null ? "At" : "Ex-"}${role.endYear === null ? " " : ""}${role.company}: ${role.title}, ${yearRange(role.startYear, role.endYear)}`);
    }
  }
  if (f.signalTypes?.length || f.withinDays) {
    reasons.push(`${p.signal.type} ${relativeDays(p.signal.date, now)}: ${p.signal.detail}`);
  }
  if (f.sectors?.length) {
    const sector = p.sectors.find((s) => f.sectors!.includes(s));
    reasons.push(p.building ? `${sector}: “${p.building}”` : `Focus area: ${sector}`);
  }
  if (f.backgrounds?.length) {
    const lastJob = p.roles.find((r) => r.company !== "Stealth" && !r.title.startsWith("Co-founder")) ?? p.roles[0];
    reasons.push(`${p.background} background: ${lastJob.title}, ${p.yearsExperience} years' experience`);
  }
  if (f.repeatFounder && p.previousStartup) {
    const prev = p.roles.find((r) => r.company === p.previousStartup);
    reasons.push(`Repeat founder: co-founded ${p.previousStartup}${prev ? ` (${yearRange(prev.startYear, prev.endYear)})` : ""}`);
  }
  if (f.countries?.length) reasons.push(`Based in ${p.city}, ${p.country}`);
  if (reasons.length === 0) {
    const terms = sharedTerms(queryText, p).slice(0, 4);
    if (terms.length) reasons.push(`Profile mentions ${terms.map((t) => `“${t}”`).join(", ")}`);
    if (p.building) reasons.push(`Building: “${p.building}”`);
  }
  return reasons.slice(0, 4);
}

let cached: { key: string; index: VectorIndex } | null = null;
function indexFor(people: Person[]): VectorIndex {
  const key = `${people.length}:${people[people.length - 1]?.id}`;
  if (!cached || cached.key !== key) cached = { key, index: buildIndex(people) };
  return cached.index;
}

export interface SearchOptions {
  limit?: number;
  /** People to leave out, e.g. those already triaged. */
  excludeIds?: Set<string>;
  now?: number;
}

/**
 * Semantic search with structured filters: filter first, then rank what's left by vector
 * similarity to the query, with a small boost for fresher signals.
 */
export function searchPeople(
  people: Person[],
  queryText: string,
  filters: SearchFilters,
  { limit = 20, excludeIds, now = Date.now() }: SearchOptions = {},
): SearchResult {
  const index = indexFor(people);
  const q = embedQuery(index, queryText);
  const hasFilters = Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v)));
  const byId = new Map(people.map((p) => [p.id, p]));

  const scored: SearchHit[] = [];
  index.ids.forEach((id, i) => {
    const p = byId.get(id)!;
    if (excludeIds?.has(id)) return;
    if (!passesFilters(p, filters, now)) return;
    const similarity = q.size ? cosine(q, index.vectors[i]) : 0;
    // With no filters, similarity alone decides; require a real overlap so unrelated people don't appear.
    if (!hasFilters && similarity < 0.08) return;
    const freshness = 1 - Math.min(daysSince(p.signal.date, now), 180) / 180;
    scored.push({ personId: id, score: (hasFilters ? 0.5 : 0) + similarity + 0.25 * freshness, reasons: [] });
  });

  scored.sort((a, b) => b.score - a.score);
  const hits = scored.slice(0, limit).map((hit) => ({
    ...hit,
    reasons: matchReasons(byId.get(hit.personId)!, filters, queryText, now),
  }));
  return { query: queryText, filters, total: scored.length, hits };
}

/** People who look like this one: same background and focus, shared employers, nearby. */
export function findSimilar(people: Person[], person: Person, { limit = 5, excludeIds }: SearchOptions = {}): SearchHit[] {
  const index = indexFor(people);
  const self = embedQuery(index, profileText(person));
  const companies = new Set(person.roles.map((r) => r.company).filter((c) => c !== "Stealth"));
  return people
    .filter((p) => p.id !== person.id && !excludeIds?.has(p.id))
    .map((p) => {
      const i = index.ids.indexOf(p.id);
      const shared = p.roles.map((r) => r.company).filter((c) => companies.has(c));
      const sharedSectors = p.sectors.filter((s) => person.sectors.includes(s));
      let score = cosine(self, index.vectors[i]);
      if (p.background === person.background) score += 0.3;
      score += 0.3 * sharedSectors.length + 0.25 * new Set(shared).size;
      if (p.country === person.country) score += 0.1;
      if (p.signal.type === person.signal.type) score += 0.1;

      const reasons: string[] = [];
      if (shared.length) reasons.push(`Also worked at ${[...new Set(shared)].join(", ")}`);
      if (sharedSectors.length) reasons.push(`Same focus: ${sharedSectors.join(", ")}${p.building ? ` (“${p.building}”)` : ""}`);
      if (p.background === person.background) reasons.push(`${p.background} background, ${p.yearsExperience} years`);
      if (p.signal.type === person.signal.type) reasons.push(`Also ${p.signal.type.toLowerCase()}: ${p.signal.detail}`);
      return { personId: p.id, score, reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
