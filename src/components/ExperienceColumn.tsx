import { EyeOff } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import type { ExperienceEntry } from "../types";
import { companyLogoUrl } from "../utils/avatars";

/** Placeholder "companies" for someone in stealth or between roles — no real logo to show. */
const stealthLabels = new Set(["—", "Exploring", "Stealth", "Stealth Startup"]);

function EntryRow({
  entry,
  trailing,
}: {
  entry: ExperienceEntry;
  trailing?: ReactNode;
}) {
  const isStealth = stealthLabels.has(entry.company);

  return (
    <div className="flex items-center gap-2">
      {isStealth ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
          <EyeOff className="h-4 w-4" />
        </div>
      ) : (
        <img
          src={companyLogoUrl(entry.company)}
          alt=""
          className="h-9 w-9 shrink-0 rounded-md bg-white object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-snug font-medium text-gray-900 dark:text-neutral-50">
          {entry.company}
        </p>
        <div className="flex items-center justify-between gap-1.5">
          <p className="min-w-0 flex-1 truncate text-xs leading-snug text-gray-500 dark:text-neutral-400">
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
      <p className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-neutral-400">
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
