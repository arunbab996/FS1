import type { GithubBasics, GithubContributionDay, GithubStats } from "../types";

/** Compact number format for GitHub stat displays, e.g. 18400 -> "18.4k". */
export function formatCompact(n: number): string {
  if (n < 1000) return n.toLocaleString();
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

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

/** "3 wks ago" style, for push dates and PR dates. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const days = Math.floor((now - Date.parse(iso)) / 86_400_000);
  if (!Number.isFinite(days) || days < 0) return "";
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} wk${weeks === 1 ? "" : "s"} ago`;
  }
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  const years = Math.floor(days / 365);
  return `${years} yr${years === 1 ? "" : "s"} ago`;
}

/** Approximate GitHub-linguist colors, for languages GitHub didn't send a color for. */
export function languageColor(lang: string): string {
  switch (lang) {
    case "TypeScript":
      return "#3178C6";
    case "JavaScript":
      return "#F1E05A";
    case "Python":
      return "#3572A5";
    case "Rust":
      return "#DEA584";
    case "Haskell":
      return "#5E5086";
    case "Java":
      return "#B07219";
    case "SQL":
      return "#E38C00";
    case "C++":
      return "#F34B7D";
    case "CUDA":
      return "#3A4E3A";
    case "Jupyter Notebook":
      return "#DA5B0B";
    case "Go":
      return "#00ADD8";
    default:
      return "#8B8B8B";
  }
}

/** Only http(s) links get rendered as links: profile fields are typed by the person, not by us. */
export function safeHref(url: string | undefined): string | undefined {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

export function hasProfileExtras(basics: GithubBasics): boolean {
  return Boolean(
    basics.bio ||
      basics.company ||
      basics.location ||
      basics.websiteUrl ||
      basics.twitterUsername ||
      basics.socialAccounts.length ||
      basics.orgs.length ||
      basics.pinned.length,
  );
}

/** Whether the collapsed Details area has anything in it. */
export function hasGithubDetails(github: GithubStats): boolean {
  return Boolean(
    github.mergedExternal?.top.length ||
      github.topRepos.length ||
      github.stack.length ||
      github.themes.length ||
      hasProfileExtras(github.basics),
  );
}
