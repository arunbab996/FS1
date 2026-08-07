import type { GithubContributionDay } from "../types";

/** Deterministic pseudo-random daily contribution history, for mockup GitHub activity graphs. */
export function generateContributions(
  seed: string,
  days: number,
  endDate: Date,
): GithubContributionDay[] {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;

  function next() {
    state = (state * 1103515245 + 12345) >>> 0;
    return state / 0xffffffff;
  }

  const out: GithubContributionDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const r = next();
    // Skew toward quiet days with the occasional heavy one, like a real contribution graph.
    const count = r < 0.32 ? 0 : Math.round(r * r * 12);
    out.push({ date: date.toISOString().slice(0, 10), count });
  }
  return out;
}
