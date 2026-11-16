import { Radar } from "lucide-react";
import { useState } from "react";
import { useAssociateDb } from "../../associate/db/store";
import { newsMoney } from "../news";
import { MISS_META, median, radarRows, weeks, type MissKind, type RadarRow } from "../radar";
import { timeAgo } from "../time";
import { FirmLogo } from "./common";

const SCALE_DAYS = 90;

/**
 * A mini timeline to the round: where we flagged the founder and where the winning fund first
 * engaged, measured back from the announcement on the right.
 */
function Timeline({ row }: { row: RadarRow }) {
  const pos = (days: number) => `${100 - (Math.min(days, SCALE_DAYS) / SCALE_DAYS) * 100}%`;
  return (
    <div className="relative h-5 w-full min-w-[160px]">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200 dark:bg-neutral-700" />
      {row.firmEngagedDaysBefore !== undefined && (
        <span
          title={`${row.firm.name} first engaged ${weeks(row.firmEngagedDaysBefore)} before the round: ${row.firmEngagedHow}`}
          style={{ left: pos(row.firmEngagedDaysBefore) }}
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-900 dark:border-neutral-900 dark:bg-neutral-100"
        />
      )}
      {row.weFlaggedDaysBefore !== undefined && (
        <span
          title={`We flagged them ${weeks(row.weFlaggedDaysBefore)} before the round`}
          style={{ left: pos(row.weFlaggedDaysBefore) }}
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 dark:border-neutral-900"
        />
      )}
      <span className="absolute top-1/2 right-0 h-3 w-0.5 -translate-y-1/2 rounded bg-emerald-500" title="Round announced" />
    </div>
  );
}

export function RadarView({ onOpenProfile }: { onOpenProfile: (personId: string) => void }) {
  useAssociateDb();
  const [filter, setFilter] = useState<MissKind | "all">("all");
  const rows = radarRows();
  const counts: Record<MissKind, number> = { "never-saw": 0, "saw-no-action": 0, "met-lost": 0 };
  for (const r of rows) counts[r.miss] += 1;
  const shown = rows.filter((r) => filter === "all" || r.miss === filter);

  const ourLead = median(rows.flatMap((r) => (r.weFlaggedDaysBefore !== undefined ? [r.weFlaggedDaysBefore] : [])));
  const theirLead = median(rows.flatMap((r) => (r.firmEngagedDaysBefore !== undefined ? [r.firmEngagedDaysBefore] : [])));
  const capital = rows.reduce((sum, r) => sum + (r.deal.amountUsdM ?? 0), 0);

  return (
    <div className="mx-auto max-w-[860px] px-8 pb-16">
      <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900">
          <Radar className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-gray-950 dark:text-neutral-50">Radar</p>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-300">
            Every time another fund backs an APAC startup, we check if we&rsquo;d seen that founder. Then we learn why we missed it: we never saw them, we saw them but didn&rsquo;t act, or we met them and lost.
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-neutral-400">
        <span className="font-medium text-gray-900 dark:text-neutral-100">{rows.length} rounds</span> other funds led in the last 30 days · {newsMoney(capital)} raised
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {(Object.keys(MISS_META) as MissKind[]).map((kind) => {
          const meta = MISS_META[kind];
          const share = rows.length ? Math.round((counts[kind] / rows.length) * 100) : 0;
          const active = filter === kind;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setFilter(active ? "all" : kind)}
              className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
                active ? "border-gray-900 bg-gray-50 dark:border-neutral-200 dark:bg-neutral-800" : "border-gray-200 bg-white hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <p className="text-xs text-gray-500 dark:text-neutral-400">{meta.gap}</p>
              <p className="mt-1 text-sm font-medium text-gray-950 dark:text-neutral-50">{meta.label}</p>
              <p className="mt-2 text-2xl font-medium tracking-tight text-gray-950 dark:text-neutral-50">
                {counts[kind]} <span className="text-sm font-normal text-gray-400">· {share}%</span>
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${share}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {ourLead !== undefined && theirLead !== undefined && (
        <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-neutral-900 dark:text-neutral-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> We flag founders a median of <span className="font-medium text-gray-950 dark:text-neutral-50">{weeks(ourLead)}</span> before the round.
          </span>{" "}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-900 dark:bg-neutral-100" /> Winning funds first engaged a median of <span className="font-medium text-gray-950 dark:text-neutral-50">{weeks(theirLead)}</span> before.
          </span>{" "}
          {ourLead >= theirLead ? "We usually see founders first; the gap is acting on it." : "Winning funds usually get there first; earlier signals would close the gap."}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-950 dark:text-neutral-50">
          {filter === "all" ? "All rounds" : MISS_META[filter].label}
          <span className="ml-1.5 font-normal text-gray-400">{shown.length}</span>
        </h2>
        <p className="flex items-center gap-3 text-xs text-gray-400 dark:text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> We flagged
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-900 dark:bg-neutral-100" /> Winning fund engaged
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-0.5 rounded bg-emerald-500" /> Round · last {SCALE_DAYS} days
          </span>
        </p>
      </div>

      <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {shown.map((row) => {
          const meta = MISS_META[row.miss];
          return (
            <li key={row.deal.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_170px]">
              <div className="flex min-w-0 items-center gap-3">
                <FirmLogo firm={row.firm} size={34} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-950 dark:text-neutral-50">
                    {row.deal.company}{" "}
                    <span className="font-normal text-gray-400">
                      · {row.deal.round} {row.deal.amountUsdM !== undefined && newsMoney(row.deal.amountUsdM)}
                    </span>
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
                    Led by {row.firm.name} · {timeAgo(row.deal.at)} ago
                    {row.founder && (
                      <>
                        {" · "}
                        <button type="button" onClick={() => onOpenProfile(row.founder!.id)} className="cursor-pointer font-medium text-gray-700 hover:underline dark:text-neutral-200">
                          {row.founder.name}
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="min-w-0 text-xs text-gray-500 dark:text-neutral-400 max-sm:col-span-2 max-sm:row-start-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.tone}`}>{meta.label}</span>
                <p className="mt-1 truncate">
                  {row.miss === "never-saw"
                    ? `Not in FirstSignal. ${row.firm.name} engaged ${weeks(row.firmEngagedDaysBefore!)} before.`
                    : row.miss === "saw-no-action"
                      ? `Flagged ${weeks(row.weFlaggedDaysBefore!)} before; nobody reached out.`
                      : `Met ${timeAgo(row.metOn!)} ago; ${row.firm.name} won.`}
                </p>
              </div>
              <Timeline row={row} />
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-gray-400 dark:text-neutral-500">
        Demo data: rounds, meetings and each fund&rsquo;s first touch are invented for the prototype. Live, they&rsquo;d come from round announcements, the CRM and intro and follow activity.
      </p>
    </div>
  );
}
