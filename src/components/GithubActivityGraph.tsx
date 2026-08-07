import type { GithubStats } from "../types";
import { GithubIcon } from "./icons/GithubIcon";

function levelClasses(count: number): string {
  if (count === 0) return "bg-gray-100 dark:bg-neutral-800";
  if (count <= 2) return "bg-green-200 dark:bg-green-900";
  if (count <= 5) return "bg-green-300 dark:bg-green-700";
  if (count <= 8) return "bg-green-500 dark:bg-green-600";
  return "bg-green-700 dark:bg-green-400";
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3 dark:border-neutral-700">
      <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        {label}
      </p>
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

  const total = github.contributions.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline dark:text-neutral-50"
        >
          <GithubIcon className="h-4 w-4" />@{github.username}
        </a>
        <p className="text-xs text-gray-400 dark:text-neutral-500">
          {total} contributions in the past year
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatTile label="Followers" value={github.followers} />
        <StatTile label="Stars" value={github.stars} />
        <StatTile label="Public repos" value={github.publicRepos} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {github.topLanguages.map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {lang}
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
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
