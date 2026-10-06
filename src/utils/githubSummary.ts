import type { GithubContributionDay, GithubStats } from "../types";

/* Pure helpers behind the GitHub card: active-week math and the summary text. */

/** Weeks (Sunday-start) with at least one contribution, among the last 52 weeks in `days` (oldest first). */
export function countActiveWeeks(days: GithubContributionDay[]): number {
  const weeks = new Map<string, number>();
  for (const day of days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - date.getUTCDay());
    const key = date.toISOString().slice(0, 10);
    weeks.set(key, (weeks.get(key) ?? 0) + day.count);
  }
  return [...weeks.values()].slice(-52).filter((count) => count > 0).length;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function plural(n: number, word: string): string {
  return `${formatNumber(n)} ${word}${n === 1 ? "" : "s"}`;
}

function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : Number(k.toFixed(1))}k`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "me/relay" -> "relay" when the repo is the person's own; keeps "owner/name" otherwise. */
function shortRepo(full: string, username: string): string {
  const [owner, name] = full.split("/");
  return name && owner?.toLowerCase() === username.toLowerCase() ? name : full;
}

export type GithubSummaryInput = Pick<
  GithubStats,
  | "username"
  | "activity"
  | "mergedExternal"
  | "topRepos"
  | "languages"
  | "commitShare"
  | "stack"
  | "themes"
  | "noPublicActivity"
>;

/**
 * Two to three sentences, built only from the computed fields. Nothing here is generated or guessed:
 * every number and name in the output comes straight from `input`.
 */
export function buildSummary(input: GithubSummaryInput): string {
  const { username, activity, mergedExternal, topRepos, languages, commitShare } = input;

  if (input.noPublicActivity) {
    const base = "No public code activity on GitHub in the last 12 months.";
    return activity.privateContributions > 0
      ? `${base} ${plural(activity.privateContributions, "private contribution")} counted, details not visible.`
      : base;
  }

  const merged = mergedExternal?.total ?? 0;
  const biggest = mergedExternal?.top.find((pr) => !pr.viaMemberOrg);
  const thin = activity.activeWeeks < 8 && merged === 0;
  const sentences: string[] = [];

  // 1. How active, and what landed in other people's repos.
  const weeks = `${activity.activeWeeks} of the last 52 weeks`;
  if (thin) {
    const commits = activity.commits > 0 ? `, ${plural(activity.commits, "commit")} in the last year` : "";
    sentences.push(`Public GitHub activity is thin: active in ${weeks}${commits}.`);
  } else if (merged > 0) {
    const where = biggest ? ` (biggest: ${biggest.repo}, ${formatStars(biggest.repoStars)} stars)` : "";
    sentences.push(
      `Active in ${weeks}, with ${plural(merged, "PR")} merged into other people's repos${where}.`,
    );
  } else {
    const commits = activity.commits > 0 ? `, with ${plural(activity.commits, "commit")}` : "";
    sentences.push(`Active in ${weeks}${commits}.`);
  }

  // 2. Their best original repo, and where they carry the commits.
  const top = topRepos[0];
  const leads = commitShare.filter((c) => c.rank === 1).slice(0, 2);
  const leadText = leads.length
    ? `leads commits on ${joinList(leads.map((c) => `${shortRepo(c.repo, username)} (${c.percent}%)`))}`
    : "";
  if (top && top.stars > 0) {
    sentences.push(
      `Most-starred original repo is ${top.name} (${formatStars(top.stars)} stars)${leadText ? `; ${leadText}` : ""}.`,
    );
  } else if (leadText) {
    sentences.push(`${leadText.charAt(0).toUpperCase()}${leadText.slice(1)}.`);
  }

  // 3. What they write in.
  const langs = languages.slice(0, 3).filter((l) => l.name !== "Other");
  if (langs.length) {
    const parts = [`Mostly ${joinList(langs.map((l) => `${l.name} (${l.percent}%)`))}`];
    if (input.stack.length) parts.push(`stack includes ${joinList(input.stack.slice(0, 3))}`);
    if (input.themes.length) parts.push(`topics point to ${joinList(input.themes.slice(0, 2))}`);
    sentences.push(`${parts.join("; ")}.`);
  }

  return sentences.join(" ");
}
