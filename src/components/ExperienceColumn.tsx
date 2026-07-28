import { useRef, useState, type ReactNode } from "react";
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

function MoreEntriesBubble({ entries }: { entries: ExperienceEntry[] }) {
  const [show, setShow] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleEnter() {
    const rect = triggerRef.current?.getBoundingClientRect();
    setPlacement(rect && rect.top < 260 ? "bottom" : "top");
    setShow(true);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className="shrink-0 text-xs font-medium whitespace-nowrap text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        (+{entries.length} more)
      </button>

      <div
        className={`absolute left-0 z-30 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800 ${
          placement === "top"
            ? "bottom-full mb-2 origin-bottom-left"
            : "top-full mt-2 origin-top-left"
        } ${
          show
            ? "translate-y-0 scale-100 opacity-100"
            : `pointer-events-none scale-95 opacity-0 ${
                placement === "top" ? "translate-y-1" : "-translate-y-1"
              }`
        }`}
      >
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <EntryRow key={i} entry={entry} />
          ))}
        </div>
      </div>
    </span>
  );
}

export function ExperienceColumn({
  label,
  entries,
}: {
  label: string;
  entries: ExperienceEntry[];
}) {
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
            rest.length > 0 ? <MoreEntriesBubble entries={rest} /> : undefined
          }
        />
      </div>
    </div>
  );
}
