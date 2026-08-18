import {
  AlertTriangle,
  CalendarClock,
  MousePointerClick,
  Radar,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  analystActivityDetail,
  countryStatsForRange,
  findCoverageGaps,
  REPORT_CHANNELS,
  TIME_RANGE_OPTIONS,
  userActivityStatsForRange,
  type CountryRangeStats,
  type ReportChannel,
  type TimeRange,
  type UserActivityRangeStats,
} from "../data/reportsData";
import { initials, sourcerColor } from "../utils/analystAvatar";
import { countryFlag } from "../utils/flags";
import { AnalystProfileDrawer } from "./AnalystProfileDrawer";
import { HoverPopup } from "./HoverPopup";

type ReportTab = "ess" | "outbound" | "aggregated" | "shortlist" | "agent-review";
type SubTab = "country" | "source-country";

const REPORT_TABS: { id: ReportTab; label: string }[] = [
  { id: "ess", label: "ESS" },
  { id: "outbound", label: "Outbound Progress" },
  { id: "aggregated", label: "Aggregated Signals Data" },
  { id: "shortlist", label: "Shortlist Report" },
  { id: "agent-review", label: "Signal Agent Review" },
];

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "country", label: "Signal By Country" },
  { id: "source-country", label: "Source by Country" },
];

const CHANNEL_COLORS: Record<ReportChannel, string> = {
  linkedin: "#3b82f6",
  twitter: "#38bdf8",
  oss: "#8b5cf6",
  strategy: "#f59e0b",
  ev: "#94a3b8",
  yc: "#f97316",
  ph: "#ec4899",
  pl: "#14b8a6",
  fp: "#a3e635",
  bl: "#f43f5e",
  hn: "#eab308",
};

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-neutral-800/60">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={`mt-1 text-2xl font-bold ${
          tone === "warning" && Number(value) > 0
            ? "text-amber-600 dark:text-amber-400"
            : "text-gray-900 dark:text-neutral-50"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{sub}</p>}
    </div>
  );
}

/** Horizontal, sorted-by-volume bar chart so concentration (e.g. "AU is disproportionate") jumps out visually. */
function CountryShareChart({
  rows,
  gapCountries,
}: {
  rows: CountryRangeStats[];
  gapCountries: Set<string>;
}) {
  const sorted = [...rows].filter((r) => r.totalSourced > 0).sort((a, b) => b.totalSourced - a.totalSourced);
  const max = sorted[0]?.totalSourced ?? 1;
  const grandTotal = rows.reduce((s, r) => s + r.totalSourced, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">Signal volume by country</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
        Sorted by total signals sourced, highest first
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {sorted.map((row) => {
          const width = Math.max((row.totalSourced / max) * 100, 2);
          const isGap = gapCountries.has(row.country);
          return (
            <div key={row.country} className="flex items-center gap-2.5">
              <div className="flex w-32 shrink-0 items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-neutral-200">
                <span>{countryFlag(row.country)}</span>
                <span className="truncate">{row.country}</span>
              </div>
              <div className="relative h-5 flex-1 rounded bg-gray-100 dark:bg-neutral-800">
                <div
                  className={`h-5 rounded ${isGap ? "bg-amber-400 dark:bg-amber-500" : "bg-blue-500 dark:bg-blue-500"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="flex w-28 shrink-0 items-center justify-end gap-1.5 text-right text-xs">
                <span className="font-semibold text-gray-900 dark:text-neutral-50">
                  {row.totalSourced.toLocaleString()}
                </span>
                <span className="text-gray-400 dark:text-neutral-500">
                  ({pct(row.totalSourced, grandTotal)}%)
                </span>
                {isGap && <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChannelMixBar({ channels }: { channels: CountryRangeStats["channels"] }) {
  const entries = (Object.entries(channels) as [ReportChannel, { total: number }][])
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);
  const total = entries.reduce((s, [, v]) => s + v.total, 0);
  if (total === 0) return <div className="h-1.5 w-24 rounded-full bg-gray-100 dark:bg-neutral-800" />;

  return (
    <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
      {entries.map(([channel, v]) => (
        <div
          key={channel}
          style={{ width: `${(v.total / total) * 100}%`, backgroundColor: CHANNEL_COLORS[channel] }}
          title={`${REPORT_CHANNELS.find((c) => c.id === channel)?.label}: ${v.total}`}
        />
      ))}
    </div>
  );
}

/** Red (mostly noise) → green (high signal) gradient, continuous rather than bucketed. */
function heatColor(rate: number): string {
  const clamped = Math.max(0, Math.min(100, rate));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 72%, 45%)`;
}

const HEAT_GRADIENT = `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(50)}, ${heatColor(100)})`;

interface HeatSelection {
  country: string;
  channel: ReportChannel;
  pushed: number;
  reviewed: number;
  rate: number;
}

/**
 * Interactive country × channel heatmap of the signal-to-noise ratio (signals pushed to the
 * platform ÷ total data reviewed). Hover for a quick peek, click a tile to pin the full
 * plain-language breakdown in the side panel — built for a non-technical reader, not just analysts.
 */
function SignalQualityHeatmap({ rows }: { rows: CountryRangeStats[] }) {
  const [selected, setSelected] = useState<HeatSelection | null>(null);
  const usedChannels = REPORT_CHANNELS.filter((c) => rows.some((r) => (r.review[c.id]?.reviewed ?? 0) > 0));
  const sorted = [...rows].sort((a, b) => b.totalSourced - a.totalSourced);

  function select(country: string, channel: ReportChannel, pushed: number, reviewed: number) {
    const rate = reviewed > 0 ? Math.round((pushed / reviewed) * 1000) / 10 : 0;
    setSelected({ country, channel, pushed, reviewed, rate });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">Signal quality by country &amp; source</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
        Each tile is signals pushed to the platform ÷ total data reviewed for that channel. Hover for a peek, click to
        pin the details.
      </p>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        <div className="overflow-x-auto lg:flex-1">
          <table className="border-separate [border-spacing:6px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white dark:bg-neutral-900" />
                {usedChannels.map((c) => (
                  <th
                    key={c.id}
                    className="px-0.5 pb-1 text-center text-[10px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.country}>
                  <td className="sticky left-0 bg-white pr-2 text-right text-xs font-medium whitespace-nowrap text-gray-700 dark:bg-neutral-900 dark:text-neutral-200">
                    <span className="inline-flex items-center gap-1.5">
                      {countryFlag(row.country)} {row.country}
                    </span>
                  </td>
                  {usedChannels.map((c) => {
                    const cell = row.review[c.id];
                    const hasData = (cell?.reviewed ?? 0) > 0;
                    const rate = hasData ? Math.round((cell!.pushed / cell!.reviewed) * 1000) / 10 : 0;
                    const isSelected = selected?.country === row.country && selected.channel === c.id;
                    const tile = (
                      <button
                        type="button"
                        disabled={!hasData}
                        onClick={() => hasData && select(row.country, c.id, cell!.pushed, cell!.reviewed)}
                        style={hasData ? { backgroundColor: heatColor(rate) } : undefined}
                        className={`flex h-11 w-11 items-center justify-center rounded-lg text-xs font-semibold transition-transform ${
                          hasData
                            ? "text-white cursor-pointer hover:scale-110"
                            : "cursor-default border border-dashed border-gray-200 bg-gray-50 text-gray-300 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-600"
                        } ${isSelected ? "ring-2 ring-offset-1 ring-gray-900 dark:ring-neutral-50 dark:ring-offset-neutral-900" : ""}`}
                      >
                        {hasData ? `${Math.round(rate)}` : ""}
                      </button>
                    );
                    return (
                      <td key={c.id} className="p-0 text-center">
                        {hasData ? (
                          <HoverPopup
                            variant="card"
                            width={200}
                            trigger={tile}
                            content={
                              <div className="text-xs">
                                <p className="font-semibold text-gray-900 dark:text-neutral-50">
                                  {countryFlag(row.country)} {row.country} · {c.label}
                                </p>
                                <p className="mt-1 text-gray-500 dark:text-neutral-400">
                                  {cell!.pushed.toLocaleString()} pushed / {cell!.reviewed.toLocaleString()} reviewed
                                </p>
                                <p className="mt-0.5 font-semibold" style={{ color: heatColor(rate) }}>
                                  {rate}% signal
                                </p>
                              </div>
                            }
                          />
                        ) : (
                          tile
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 lg:w-80 lg:shrink-0">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
              Signal quality
            </p>
            <div className="mt-2 h-2.5 w-full rounded-full" style={{ backgroundImage: HEAT_GRADIENT }} />
            <div className="mt-1 flex justify-between text-[11px] text-gray-400 dark:text-neutral-500">
              <span>Mostly noise</span>
              <span>High signal</span>
            </div>
          </div>

          <div className="flex-1 rounded-lg bg-gray-50 px-3.5 py-3 dark:bg-neutral-800/60">
            {selected ? (
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-700 dark:text-neutral-200">
                  <strong>
                    {countryFlag(selected.country)} {selected.country} ·{" "}
                    {REPORT_CHANNELS.find((c) => c.id === selected.channel)?.label}
                  </strong>{" "}
                  pushed <strong>{selected.pushed.toLocaleString()}</strong> signals to the platform out of{" "}
                  <strong>{selected.reviewed.toLocaleString()}</strong> reviewed — a{" "}
                  <strong>{selected.rate}%</strong> signal-to-noise ratio
                  {selected.rate >= 45
                    ? ", one of the cleaner channels for this market."
                    : selected.rate > 0
                      ? ", meaning most of what gets reviewed here doesn't end up as a real signal."
                      : "."}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="shrink-0 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-neutral-500">
                <MousePointerClick className="h-3.5 w-3.5" />
                Click any tile to see the full breakdown here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalByCountryTable({ rows }: { rows: CountryRangeStats[] }) {
  const sorted = [...rows].sort((a, b) => b.totalSourced - a.totalSourced);
  const totals = rows.reduce(
    (acc, r) => ({
      sourced: acc.sourced + r.totalSourced,
      picked: acc.picked + r.totalPicked,
      meetings: acc.meetings + r.founderMeetings,
    }),
    { sourced: 0, picked: 0, meetings: 0 },
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-400">
            <th className="px-4 py-2.5">Country</th>
            <th className="px-4 py-2.5">Channel mix</th>
            <th className="px-4 py-2.5 text-right">Sourced</th>
            <th className="px-4 py-2.5 text-right">Picked up</th>
            <th className="px-4 py-2.5 text-right">Pickup rate</th>
            <th className="px-4 py-2.5 text-right">Founder meetings</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const rate = pct(row.totalPicked, row.totalSourced);
            return (
              <tr
                key={row.country}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-neutral-50">
                    <span>{countryFlag(row.country)}</span>
                    {row.country}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <ChannelMixBar channels={row.channels} />
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-neutral-200">
                  {row.totalSourced.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-neutral-200">
                  {row.totalPicked.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className={`font-semibold ${
                      rate >= 15
                        ? "text-emerald-600 dark:text-emerald-400"
                        : rate > 0
                          ? "text-gray-700 dark:text-neutral-300"
                          : "text-gray-400 dark:text-neutral-600"
                    }`}
                  >
                    {rate}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-neutral-200">
                  {row.founderMeetings.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-50">
            <td className="px-4 py-2.5" colSpan={2}>
              Total
            </td>
            <td className="px-4 py-2.5 text-right">{totals.sourced.toLocaleString()}</td>
            <td className="px-4 py-2.5 text-right">{totals.picked.toLocaleString()}</td>
            <td className="px-4 py-2.5 text-right">{pct(totals.picked, totals.sourced)}%</td>
            <td className="px-4 py-2.5 text-right">{totals.meetings.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** A funnel bar: reviewed is the full-width baseline, shortlisted and calls-set-up are proportionally narrower segments. */
function FunnelBar({ reviewed, shortlisted, callsSetUp }: { reviewed: number; shortlisted: number; callsSetUp: number }) {
  const shortlistedPct = reviewed > 0 ? Math.min((shortlisted / reviewed) * 100, 100) : 0;
  const callsPct = reviewed > 0 ? Math.min((callsSetUp / reviewed) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-neutral-800" />
      <div className="relative -mt-3.5 h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-500/15">
        <div className="h-2 rounded-full bg-blue-400 dark:bg-blue-500/60" style={{ width: `${shortlistedPct}%` }} />
      </div>
      <div className="relative -mt-3.5 h-2 w-full overflow-hidden rounded-full">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${callsPct}%` }} />
      </div>
    </div>
  );
}

function TeamActivityGrid({
  rows,
  onSelectUser,
}: {
  rows: UserActivityRangeStats[];
  onSelectUser: (user: string) => void;
}) {
  const totals = rows.reduce(
    (acc, r) => ({
      reviewed: acc.reviewed + r.reviewed,
      shortlisted: acc.shortlisted + r.shortlisted,
      callsSetUp: acc.callsSetUp + r.callsSetUp,
    }),
    { reviewed: 0, shortlisted: 0, callsSetUp: 0 },
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Users} label="Signals reviewed" value={totals.reviewed.toLocaleString()} />
        <StatTile
          icon={TrendingUp}
          label="Shortlisted"
          value={totals.shortlisted.toLocaleString()}
          sub={`${pct(totals.shortlisted, totals.reviewed)}% of reviewed`}
        />
        <StatTile
          icon={CalendarClock}
          label="Calls set up"
          value={totals.callsSetUp.toLocaleString()}
          sub={`${pct(totals.callsSetUp, totals.shortlisted)}% of shortlisted`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <button
            type="button"
            key={row.user}
            onClick={() => onSelectUser(row.user)}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5"
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white ${sourcerColor(row.user)}`}
              >
                {initials(row.user)}
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">{row.user}</p>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-neutral-50">{row.reviewed.toLocaleString()}</p>
                <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                  Reviewed
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {row.shortlisted.toLocaleString()}
                </p>
                <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                  Shortlisted
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {row.callsSetUp.toLocaleString()}
                </p>
                <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                  Calls set up
                </p>
              </div>
            </div>

            <div className="mt-3.5">
              <FunnelBar reviewed={row.reviewed} shortlisted={row.shortlisted} callsSetUp={row.callsSetUp} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-neutral-700">
      <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">{label} isn&rsquo;t wired up yet</p>
      <p className="text-xs text-gray-400 dark:text-neutral-500">Check back once this report has data behind it.</p>
    </div>
  );
}

export function ReportsView() {
  const [reportTab, setReportTab] = useState<ReportTab>("ess");
  const [subTab, setSubTab] = useState<SubTab>("country");
  const [range, setRange] = useState<TimeRange>("month");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const countryRows = useMemo(() => countryStatsForRange(range), [range]);
  const teamRows = useMemo(() => userActivityStatsForRange(range), [range]);
  const selectedUserStats = teamRows.find((r) => r.user === selectedUser) ?? null;
  const selectedUserActivity = useMemo(
    () => (selectedUser ? analystActivityDetail(selectedUser) : null),
    [selectedUser],
  );
  const gaps = useMemo(() => findCoverageGaps(countryRows), [countryRows]);
  const gapCountries = useMemo(() => new Set(gaps.map((g) => g.country)), [gaps]);

  const totals = useMemo(
    () =>
      countryRows.reduce(
        (acc, r) => ({
          sourced: acc.sourced + r.totalSourced,
          picked: acc.picked + r.totalPicked,
          meetings: acc.meetings + r.founderMeetings,
        }),
        { sourced: 0, picked: 0, meetings: 0 },
      ),
    [countryRows],
  );

  const topCountry = useMemo(
    () => [...countryRows].filter((r) => r.totalSourced > 0).sort((a, b) => b.totalSourced - a.totalSourced)[0],
    [countryRows],
  );
  const topShare = topCountry ? pct(topCountry.totalSourced, totals.sourced) : 0;

  const rangeLabel = TIME_RANGE_OPTIONS.find((o) => o.id === range)?.label.toLowerCase() ?? "this month";

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-neutral-50">Reports</h1>

          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as TimeRange)}
              className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pr-8 pl-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {TIME_RANGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <CalendarClock className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-neutral-700">
          {REPORT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportTab(tab.id)}
              className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                reportTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {reportTab === "outbound" ? (
          <TeamActivityGrid rows={teamRows} onSelectUser={setSelectedUser} />
        ) : reportTab !== "ess" ? (
          <ComingSoon label={REPORT_TABS.find((t) => t.id === reportTab)!.label} />
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3">
              <StatTile icon={Radar} label="Signals sourced" value={totals.sourced.toLocaleString()} />
              <StatTile
                icon={TrendingUp}
                label="Picked up by investors"
                value={totals.picked.toLocaleString()}
                sub={`${pct(totals.picked, totals.sourced)}% pickup rate`}
              />
              <StatTile icon={Users} label="Founder meetings" value={totals.meetings.toLocaleString()} />
              <StatTile
                icon={AlertTriangle}
                label="Markets flagged for coverage gaps"
                value={gaps.length}
                tone="warning"
                sub={gaps.length > 0 ? gaps.map((g) => g.country).join(", ") : "None right now"}
              />
            </div>

            {topCountry && (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong>{topCountry.country}</strong> accounts for <strong>{topShare}%</strong> of all signals
                  sourced {rangeLabel} — the highest of any market.
                  {gaps.length > 0 && (
                    <>
                      {" "}
                      Meanwhile <strong>{gaps.map((g) => g.country).join(", ")}</strong>{" "}
                      {gaps.length === 1 ? "shows" : "show"} unusually low volume — that could mean genuinely few
                      signals there, or thin channel coverage worth double-checking.
                    </>
                  )}
                </p>
              </div>
            )}

            <CountryShareChart rows={countryRows} gapCountries={gapCountries} />

            <div className="flex items-center gap-1 border-b border-gray-200 dark:border-neutral-700">
              {SUB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubTab(tab.id)}
                  className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    subTab === tab.id
                      ? "border-gray-900 text-gray-900 dark:border-neutral-50 dark:text-neutral-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {subTab === "country" && <SignalQualityHeatmap rows={countryRows} />}
            {subTab === "source-country" && <SignalByCountryTable rows={countryRows} />}
          </>
        )}
      </div>

      <AnalystProfileDrawer
        user={selectedUser}
        stats={selectedUserStats}
        activity={selectedUserActivity}
        open={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
