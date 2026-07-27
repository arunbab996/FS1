import { useState, type ReactNode } from "react";
import type { ExperienceEntry } from "../types";
import { companyLogoUrl } from "../utils/avatars";

function EntryRow({
  entry,
  trailing,
}: {
  entry: ExperienceEntry;
  trailing?: ReactNode;
}) {
  const isBlank = entry.company === "—";

  return (
    <div className="flex items-center gap-1.5">
      {isBlank ? (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-200 text-xs text-gray-400 dark:bg-neutral-700 dark:text-neutral-400">
          —
        </div>
      ) : (
        <img
          src={companyLogoUrl(entry.company)}
          alt=""
          className="h-5 w-5 shrink-0 rounded bg-white object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug font-medium break-words text-gray-900 dark:text-neutral-50">
          {entry.company}
        </p>
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-xs leading-snug break-words text-gray-500 dark:text-neutral-400">
            {entry.role}
          </p>
          {trailing}
        </div>
      </div>
    </div>
  );
}

export function ExperienceColumn({
  label,
  entries,
}: {
  label: string;
  entries: ExperienceEntry[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [primary, ...rest] = entries;

  return (
    <div className="min-w-0 max-w-56 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800">
      <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-neutral-400">
        {label}
      </p>
      <div className="mt-0.5">
        <EntryRow
          entry={primary}
          trailing={
            rest.length > 0 && !expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="shrink-0 text-xs font-medium whitespace-nowrap text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                (+{rest.length} more)
              </button>
            ) : undefined
          }
        />
      </div>

      {expanded && (
        <div className="mt-1 flex flex-col gap-1">
          {rest.map((entry, i) => (
            <EntryRow key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
