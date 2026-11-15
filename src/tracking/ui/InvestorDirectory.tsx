import { Check, ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { TwitterIcon } from "../../components/icons/TwitterIcon";
import { FIRMS, FOLLOW_EVENTS, INVESTORS } from "../data";
import { isTracked, setFirmTracked, setInvestorTracked, useTracking } from "../store";
import { Avatar, FirmLogo } from "./common";

const MONTH_MS = 30 * 86_400_000;

/** Follows per investor in the last 30 days, to show who's active. */
const followCounts = new Map<string, number>();
for (const e of FOLLOW_EVENTS) {
  if (Date.now() - new Date(e.at).getTime() < MONTH_MS) followCounts.set(e.investorId, (followCounts.get(e.investorId) ?? 0) + 1);
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors ${checked ? "bg-gray-950 dark:bg-neutral-100" : "bg-gray-200 dark:bg-neutral-700"}`}
    >
      <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform dark:bg-neutral-950 ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

/**
 * Every firm we track, as folders. Track a whole firm (everyone there, including people who join
 * later) or open it and pick individual investors. Each user chooses their own list.
 */
export function InvestorDirectory() {
  const prefs = useTracking();
  const [query, setQuery] = useState("");
  const [onlyTracked, setOnlyTracked] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set(prefs.firms.slice(0, 1)));

  const q = query.trim().toLowerCase();
  const trackedTotal = INVESTORS.filter((v) => isTracked(prefs, v)).length;
  const trackedFirms = new Set(INVESTORS.filter((v) => isTracked(prefs, v)).map((v) => v.firmId)).size;

  const firms = FIRMS.map((firm) => {
    const people = INVESTORS.filter((v) => v.firmId === firm.id);
    const firmMatches = !q || firm.name.toLowerCase().includes(q);
    const shown = people.filter((v) => (firmMatches || v.name.toLowerCase().includes(q) || v.handle.includes(q)) && (!onlyTracked || isTracked(prefs, v)));
    return { firm, people, shown, trackedCount: people.filter((v) => isTracked(prefs, v)).length };
  }).filter((f) => f.shown.length > 0);

  function toggleOpen(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-[860px] px-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          You track <span className="font-medium text-gray-900 dark:text-neutral-100">{trackedTotal} of {INVESTORS.length} investors</span> at {trackedFirms} of {FIRMS.length} firms
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus-within:border-gray-400 dark:border-neutral-700 dark:bg-neutral-900">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search firms or investors"
              className="w-48 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-neutral-100"
            />
          </label>
          <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium dark:bg-neutral-800">
            {[
              [false, "All"],
              [true, "Tracking"],
            ].map(([value, label]) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setOnlyTracked(value as boolean)}
                className={`cursor-pointer rounded-md px-3 py-1 ${onlyTracked === value ? "bg-white text-gray-950 shadow-sm dark:bg-neutral-950 dark:text-neutral-50" : "text-gray-500 dark:text-neutral-400"}`}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {firms.map(({ firm, people, shown, trackedCount }) => {
          const whole = prefs.firms.includes(firm.id);
          const expanded = open.has(firm.id) || Boolean(q);
          return (
            <div key={firm.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => toggleOpen(firm.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left" aria-expanded={expanded}>
                  <ChevronRight className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
                  <FirmLogo firm={firm} size={34} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-950 dark:text-neutral-50">{firm.name}</span>
                    <span className="block truncate text-xs text-gray-500 dark:text-neutral-400">
                      {firm.hq} · {firm.focus} · {people.length} investors
                    </span>
                  </span>
                </button>
                <span
                  className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${
                    whole
                      ? "bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : trackedCount
                        ? "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200"
                        : "text-gray-400"
                  }`}
                >
                  {whole ? "Whole firm" : trackedCount ? `${trackedCount} of ${people.length} tracked` : "Not tracked"}
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
                  Track firm
                  <Switch checked={whole} onChange={() => setFirmTracked(firm.id, !whole)} label={`Track all of ${firm.name}`} />
                </span>
              </div>
              {expanded && (
                <ul className="border-t border-gray-100 bg-gray-50/60 py-1 dark:border-neutral-800 dark:bg-neutral-950/40">
                  {shown.map((investor) => {
                    const tracked = isTracked(prefs, investor);
                    const follows = followCounts.get(investor.id) ?? 0;
                    return (
                      <li key={investor.id} className="flex items-center gap-3 py-2 pr-4 pl-[60px]">
                        <Avatar name={investor.name} size={34} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-gray-950 dark:text-neutral-50">
                            {investor.name} <span className="text-gray-400 dark:text-neutral-500">· {investor.title}</span>
                          </p>
                          <p className="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-neutral-400">
                            <TwitterIcon className="h-2.5 w-2.5" />@{investor.handle} · {follows} {follows === 1 ? "follow" : "follows"} in the last 30 days
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInvestorTracked(investor, !tracked)}
                          title={tracked && whole ? "Tracked as part of the whole firm. Click to stop tracking just this person." : undefined}
                          className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                            tracked
                              ? "bg-gray-950 text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                          }`}
                        >
                          {tracked ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          {tracked ? "Tracking" : "Track"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
        {firms.length === 0 && <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-neutral-400">No firms or investors match that.</p>}
      </div>
    </div>
  );
}
