import { ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { GithubStats } from "../types";
import { hasGithubDetails, languageColor } from "../utils/github";
import { GithubDetails } from "./GithubDetails";
import { GithubIcon } from "./icons/GithubIcon";

function levelClasses(count: number): string {
  if (count === 0) return "bg-gray-100 dark:bg-neutral-800";
  if (count <= 2) return "bg-green-200 dark:bg-green-900";
  if (count <= 5) return "bg-green-300 dark:bg-green-700";
  if (count <= 8) return "bg-green-500 dark:bg-green-600";
  return "bg-green-700 dark:bg-green-400";
}

function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
      {children}
    </p>
  );
}

function Heatmap({ calendar }: { calendar: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  let week: { date: string; count: number }[] = [];
  const firstDay = new Date(`${calendar[0]?.date}T00:00:00`).getDay();
  for (let i = 0; i < firstDay; i++) week.push({ date: "", count: -1 });
  for (const day of calendar) {
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

  return (
    <div>
      <div className="overflow-x-auto">
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

/** "960 commits · 142 PRs · ..." with anything that is zero left out. */
function CountsLine({ github }: { github: GithubStats }) {
  const { activity, mergedExternal } = github;
  const parts: { value: number; label: string }[] = [
    { value: activity.commits, label: "commits" },
    { value: activity.pullRequests, label: "PRs" },
    { value: activity.reviews, label: "reviews" },
    { value: activity.issues, label: "issues" },
    { value: activity.privateContributions, label: "private" },
    { value: mergedExternal?.total ?? 0, label: "merged into others' repos" },
  ].filter((p) => p.value > 0);

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-neutral-400">
      <span className="font-semibold text-gray-700 dark:text-neutral-200">
        Active {activity.activeWeeks} of 52 weeks
      </span>
      {parts.map((part) => (
        <span key={part.label} className="flex items-center gap-2">
          <span className="text-gray-300 dark:text-neutral-600">·</span>
          <span>
            <span className="font-semibold text-gray-700 dark:text-neutral-200">
              {part.value.toLocaleString()}
            </span>{" "}
            {part.label}
          </span>
        </span>
      ))}
    </p>
  );
}

function Languages({ github }: { github: GithubStats }) {
  return (
    <div className="mt-4">
      <BlockLabel>Languages</BlockLabel>
      <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
        {github.languages.map((lang) => (
          <span
            key={lang.name}
            title={`${lang.name} ${lang.percent}%`}
            style={{
              width: `${lang.percent}%`,
              backgroundColor: lang.name === "Other" ? "#C4C4C4" : (lang.color ?? languageColor(lang.name)),
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {github.languages.map((lang) => (
          <span key={lang.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-neutral-300">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: lang.name === "Other" ? "#C4C4C4" : (lang.color ?? languageColor(lang.name)) }}
            />
            <span className="font-medium">{lang.name}</span>
            <span className="text-gray-400 dark:text-neutral-500">{lang.percent}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CommitShare({ github }: { github: GithubStats }) {
  return (
    <div className="mt-4">
      <BlockLabel>Commit share on team repos</BlockLabel>
      <div className="mt-2 flex flex-col gap-2">
        {github.commitShare.map((row) => {
          const [owner, name] = row.repo.split("/");
          const label = owner?.toLowerCase() === github.username.toLowerCase() && name ? name : row.repo;
          return (
            <div key={row.repo} className="flex items-center gap-3 text-xs">
              <span className="w-36 shrink-0 truncate font-medium text-gray-700 dark:text-neutral-200" title={row.repo}>
                {label}
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="w-9 shrink-0 text-right font-semibold text-gray-700 dark:text-neutral-200">
                {row.percent}%
              </span>
              <span className="w-24 shrink-0 text-right text-gray-400 dark:text-neutral-500">
                {row.rank === 1 ? "Top contributor" : `#${row.rank} of ${row.contributors}`}
              </span>
            </div>
          );
        })}
      </div>
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { basics, activity } = github;
  const showDetails = hasGithubDetails(github);

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={githubUrl ?? `https://github.com/${github.username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline dark:text-neutral-50"
          >
            <GithubIcon className="h-4 w-4" />@{github.username}
            <ExternalLink className="h-3 w-3 text-gray-400 dark:text-neutral-500" />
          </a>
          <span className="text-xs text-gray-400 dark:text-neutral-500">
            Since {new Date(basics.createdAt).getUTCFullYear()} · {basics.followers.toLocaleString()} followers ·{" "}
            {basics.totalStars.toLocaleString()} stars · {basics.publicRepos.toLocaleString()} repos
          </span>
        </div>
        {!github.noPublicActivity && (
          <p className="shrink-0 text-xs text-gray-400 dark:text-neutral-500">
            <span className="font-semibold text-gray-600 dark:text-neutral-300">
              {activity.totalContributions.toLocaleString()}
            </span>{" "}
            contributions in the past year
          </p>
        )}
      </div>

      {github.noPublicActivity ? (
        <div className="mt-3 rounded-lg border border-dashed border-gray-200 px-4 py-5 text-center dark:border-neutral-700">
          <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">No public code activity</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            {activity.privateContributions > 0
              ? `${activity.privateContributions.toLocaleString()} private contributions in the last 12 months. GitHub doesn't show what they were.`
              : "Nothing public in the last 12 months."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
            <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300">{github.summary}</p>
          </div>

          {activity.calendar.length > 0 && (
            <div className="mt-4">
              <Heatmap calendar={activity.calendar} />
              <CountsLine github={github} />
            </div>
          )}
          {github.languages.length > 0 && <Languages github={github} />}
          {github.commitShare.length > 0 && <CommitShare github={github} />}
        </>
      )}

      {showDetails && (
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Details
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
          </button>
          {detailsOpen && <GithubDetails github={github} />}
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400 dark:text-neutral-500">Public data only</p>
    </div>
  );
}
