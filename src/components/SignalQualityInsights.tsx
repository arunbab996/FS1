import { userActivityStatsForRange, type TimeRange } from "../data/reportsData";
import { countryAvgScoreStats, investorAvgScoreStats } from "../data/signalScoreInsights";
import { initials, sourcerColor } from "../utils/analystAvatar";
import { countryFlag } from "../utils/flags";

/** Red (weak signals) to green (strong signals) on a 0-10 scale, matching the heatmap's color language. */
function scoreColor(score: number): string {
  const clamped = Math.max(0, Math.min(10, score));
  return `hsl(${(clamped / 10) * 120}, 65%, 45%)`;
}

function CountryScoreChart() {
  const sorted = [...countryAvgScoreStats].sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">Average signal score by market</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
        How strong the signals sourced from each market tend to be, out of 10.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {sorted.map((c) => (
          <div key={c.country} className="flex items-center gap-2.5">
            <div className="flex w-32 shrink-0 items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-neutral-50">
              <span>{countryFlag(c.country)}</span>
              <span className="truncate">{c.country}</span>
            </div>
            <div className="relative h-4 flex-1 rounded bg-gray-100 dark:bg-neutral-800">
              <div
                className="h-4 rounded"
                style={{ width: `${(c.avgScore / 10) * 100}%`, backgroundColor: scoreColor(c.avgScore) }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-gray-900 dark:text-neutral-50">
              {c.avgScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const NOTE_STYLES = {
  quantityOverQuality: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  hiddenGem: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
} as const;

/** Ranked by quality, not volume — the direct complement to the (volume-ranked) Leaderboard tab. */
function QualityLeaderboard({ range }: { range: TimeRange }) {
  const volumeByUser = new Map(userActivityStatsForRange(range).map((r) => [r.user, r.reviewed]));
  const rows = investorAvgScoreStats.map((s) => ({
    user: s.user,
    avgScore: s.avgScore,
    volume: volumeByUser.get(s.user) ?? 0,
  }));

  const byScore = [...rows].sort((a, b) => b.avgScore - a.avgScore);
  const byVolume = [...rows].sort((a, b) => b.volume - a.volume);
  const volumeRankOf = new Map(byVolume.map((r, i) => [r.user, i + 1]));
  const medianVolume = median(rows.map((r) => r.volume));
  const medianScore = median(rows.map((r) => r.avgScore));

  const top = byScore[0];
  const quantityOverQuality = byScore.filter((r) => r.volume >= medianVolume && r.avgScore < medianScore);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">Quality leaderboard</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
        Ranked by average signal score, not outreach volume — who's actually finding the best people, not just the
        most.
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Analyst</th>
              <th className="px-3 py-2">Avg signal score</th>
              <th className="px-3 py-2 text-right">Outreach volume</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {byScore.map((r, i) => {
              const rank = i + 1;
              const volumeRank = volumeRankOf.get(r.user)!;
              const isQuantityOverQuality = r.volume >= medianVolume && r.avgScore < medianScore;
              const isHiddenGem = r.volume < medianVolume && r.avgScore >= medianScore;
              return (
                <tr
                  key={r.user}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                >
                  <td className="px-3 py-2.5 text-sm font-semibold text-gray-400 dark:text-neutral-500">#{rank}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${sourcerColor(r.user)}`}
                      >
                        {initials(r.user)}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-neutral-50">{r.user}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: `${(r.avgScore / 10) * 100}%`, backgroundColor: scoreColor(r.avgScore) }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                        {r.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600 dark:text-neutral-300">
                    {r.volume.toLocaleString()}{" "}
                    <span className="text-gray-400 dark:text-neutral-500">(#{volumeRank} by volume)</span>
                  </td>
                  <td className="px-3 py-2.5">
                    {isQuantityOverQuality && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${NOTE_STYLES.quantityOverQuality}`}>
                        High volume, lower quality
                      </span>
                    )}
                    {isHiddenGem && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${NOTE_STYLES.hiddenGem}`}>
                        Fewer calls, high quality
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600 dark:bg-neutral-800/60 dark:text-neutral-300">
        <strong className="text-gray-900 dark:text-neutral-50">{top.user}</strong> has the highest average signal
        score this period ({top.avgScore.toFixed(1)}).
        {quantityOverQuality.length > 0 && (
          <>
            {" "}
            <strong className="text-amber-700 dark:text-amber-400">
              {quantityOverQuality.map((o) => o.user).join(", ")}
            </strong>{" "}
            {quantityOverQuality.length === 1 ? "makes" : "make"} above-median calls but the people reached out to
            score below the team median, worth a quality check rather than reading volume alone as success.
          </>
        )}
      </div>
    </div>
  );
}

export function SignalQualityInsights({ range }: { range: TimeRange }) {
  return (
    <div className="flex flex-col gap-4">
      <CountryScoreChart />
      <QualityLeaderboard range={range} />
    </div>
  );
}
