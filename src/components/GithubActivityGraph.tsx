import { ExternalLink, FolderGit2, Star, Users } from "lucide-react";
import type { GithubStats } from "../types";
import { GithubIcon } from "./icons/GithubIcon";

function levelClasses(count: number): string {
  if (count === 0) return "bg-gray-100 dark:bg-neutral-800";
  if (count <= 2) return "bg-green-200 dark:bg-green-900";
  if (count <= 5) return "bg-green-300 dark:bg-green-700";
  if (count <= 8) return "bg-green-500 dark:bg-green-600";
  return "bg-green-700 dark:bg-green-400";
}

/** Approximate GitHub-linguist colors, for the small dot next to each language chip. */
function languageColor(lang: string): string {
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
    default:
      return "#8B8B8B";
  }
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-neutral-800/60">
      <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-neutral-50">{value}</p>
    </div>
  );
}

export function GithubActivityGraph({
  github,
  githubUrl,
}: {
  github: GithubStats;
  githubUrl?: string;
}) {
  const weeks: { date: string; count: number }[][] = [];
  let week: { date: string; count: number }[] = [];
  const firstDay = new Date(`${github.contributions[0].date}T00:00:00`).getDay();
  for (let i = 0; i < firstDay; i++) week.push({ date: "", count: -1 });
  for (const day of github.contributions) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push({ date: "", count: -1 });
    weeks.push(week);
  }

  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const firstReal = w.find((d) => d.count !== -1);
    if (!firstReal) return;
    const date = new Date(`${firstReal.date}T00:00:00`);
    if (date.getMonth() !== lastMonth) {
      monthLabels.push({ weekIndex: wi, label: date.toLocaleDateString("en-US", { month: "short" }) });
      lastMonth = date.getMonth();
    }
  });

  const total = github.contributions.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline dark:text-neutral-50"
        >
          <GithubIcon className="h-4 w-4" />
          @{github.username}
          <ExternalLink className="h-3 w-3 text-gray-400 dark:text-neutral-500" />
        </a>
        <p className="text-xs text-gray-400 dark:text-neutral-500">
          <span className="font-semibold text-gray-600 dark:text-neutral-300">{total}</span>{" "}
          contributions in the past year
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatTile icon={Users} label="Followers" value={github.followers} />
        <StatTile icon={Star} label="Stars" value={github.stars} />
        <StatTile icon={FolderGit2} label="Public repos" value={github.publicRepos} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {github.topLanguages.map((lang) => (
          <span
            key={lang}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-neutral-300"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: languageColor(lang) }}
            />
            {lang}
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-[3px]">
          {weeks.map((_, wi) => (
            <span
              key={wi}
              className="w-2.5 shrink-0 text-[10px] whitespace-nowrap text-gray-400 dark:text-neutral-500"
            >
              {monthLabels.find((m) => m.weekIndex === wi)?.label}
            </span>
          ))}
        </div>
        <div className="mt-1 grid w-max grid-flow-col grid-rows-7 gap-[3px]">
          {weeks.flat().map((day, i) =>
            day.count === -1 ? (
              <div key={i} className="h-2.5 w-2.5" />
            ) : (
              <div
                key={i}
                title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                className={`h-2.5 w-2.5 rounded-[2px] ${levelClasses(day.count)}`}
              />
            ),
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5">
        <span className="text-[11px] text-gray-400 dark:text-neutral-500">Less</span>
        {[0, 1, 3, 6, 10].map((count) => (
          <div key={count} className={`h-2.5 w-2.5 rounded-[2px] ${levelClasses(count)}`} />
        ))}
        <span className="text-[11px] text-gray-400 dark:text-neutral-500">More</span>
      </div>
    </div>
  );
}
