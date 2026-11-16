import { Briefcase, Newspaper, Rocket, UserPlus } from "lucide-react";
import { useState } from "react";
import { getPerson, useAssociateDb } from "../../associate/db/store";
import { FIRMS, INVESTORS } from "../data";
import { NEWS, firmsIn, newsMoney, type NewsItem, type NewsKind } from "../news";
import { isTracked, useTracking } from "../store";
import { timeAgo } from "../time";
import { FirmLogo } from "./common";

const DAY_MS = 86_400_000;

const KIND_META: Record<NewsKind, { label: string; icon: typeof Briefcase; tone: string }> = {
  deal: { label: "Funding round", icon: Briefcase, tone: "text-emerald-700 dark:text-emerald-300" },
  people: { label: "People move", icon: UserPlus, tone: "text-sky-700 dark:text-sky-300" },
  portfolio: { label: "Portfolio news", icon: Rocket, tone: "text-violet-700 dark:text-violet-300" },
};

/**
 * What happened before the round, for deals in companies we knew: did FirstSignal flag the founder
 * first, and did anyone reach out? Companies we never saw are coverage gaps.
 */
function DealInsight({ item, onOpenProfile }: { item: NewsItem; onOpenProfile: (id: string) => void }) {
  const db = useAssociateDb();
  if (item.kind !== "deal") return null;
  if (!item.founderId) {
    return (
      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
        <span className="font-medium">Not in FirstSignal</span> · we never flagged this company or its founders. A coverage gap.
      </p>
    );
  }
  const founder = getPerson(item.founderId);
  if (!founder) return null;
  const lead = Math.round((new Date(item.at).getTime() - new Date(founder.signal.date).getTime()) / DAY_MS);
  const leadText = lead >= 14 ? `${Math.round(lead / 7)} weeks` : `${Math.max(lead, 1)} ${lead === 1 ? "day" : "days"}`;
  const triage = db.triage[founder.id];
  const outcome = triage
    ? triage.status === "dismissed"
      ? { text: "You passed on them.", tone: "text-gray-600 dark:text-neutral-300" }
      : { text: "You'd reached out.", tone: "text-emerald-700 dark:text-emerald-300" }
    : { text: "No one reached out — a speed or routing gap.", tone: "text-amber-700 dark:text-amber-300" };
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-neutral-800/60 dark:text-neutral-300">
      <span>
        FirstSignal flagged{" "}
        <button type="button" onClick={() => onOpenProfile(founder.id)} className="cursor-pointer font-medium text-gray-900 hover:underline dark:text-neutral-100">
          {founder.name}
        </button>{" "}
        {lead > 0 ? `${leadText} before this round` : "around the same time as this round"} ({founder.signal.type}).
      </span>
      <span className={`font-medium ${outcome.tone}`}>{outcome.text}</span>
    </p>
  );
}

/**
 * News from the firms you track: rounds they led or joined, people moves and portfolio milestones.
 * A firm counts as tracked when you track it whole or track anyone there.
 */
export function NewsFeed({ onOpenProfile, onManage }: { onOpenProfile: (personId: string) => void; onManage: () => void }) {
  const prefs = useTracking();
  const [kind, setKind] = useState<NewsKind | "all">("all");
  const trackedFirms = new Set(INVESTORS.filter((v) => isTracked(prefs, v)).map((v) => v.firmId));
  const [firmFilter, setFirmFilter] = useState<string>("all");

  const relevant = NEWS.filter((n) => firmsIn(n).some((f) => trackedFirms.has(f.id)));
  const shown = relevant.filter((n) => (kind === "all" || n.kind === kind) && (firmFilter === "all" || firmsIn(n).some((f) => f.id === firmFilter)));
  const deals = relevant.filter((n) => n.kind === "deal");
  const capital = deals.reduce((sum, n) => sum + (n.amountUsdM ?? 0), 0);
  const missed = deals.filter((n) => !n.founderId).length;
  const trackedFirmList = FIRMS.filter((f) => trackedFirms.has(f.id));

  if (trackedFirms.size === 0) {
    return (
      <div className="mx-auto max-w-[760px] px-8 py-16 text-center">
        <p className="text-base font-medium text-gray-900 dark:text-neutral-100">No firms tracked yet</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">Track a firm, or anyone at one, and its news shows up here.</p>
        <button type="button" onClick={onManage} className="mt-5 cursor-pointer rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900">
          Choose firms to track
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          <span className="font-medium text-gray-900 dark:text-neutral-100">{deals.length} rounds</span> from {trackedFirms.size} firms you track in the last 30 days · {newsMoney(capital)} raised ·{" "}
          {missed} not in FirstSignal
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["all", "All"],
              ["deal", "Rounds"],
              ["people", "People"],
              ["portfolio", "Portfolio"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
                kind === id
                  ? "bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {label}
            </button>
          ))}
          <select
            value={firmFilter}
            onChange={(e) => setFirmFilter(e.target.value)}
            aria-label="Filter by firm"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="all">All tracked firms</option>
            {trackedFirmList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
        <Newspaper className="h-3.5 w-3.5" />
        Demo headlines, invented for the prototype: the companies and people are made up.
      </p>

      <ul className="mt-5 space-y-3">
        {shown.map((item) => {
          const meta = KIND_META[item.kind];
          const Icon = meta.icon;
          const firms = firmsIn(item);
          return (
            <li key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex gap-3">
                <FirmLogo firm={firms[0]} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-gray-500 dark:text-neutral-400">
                    <span className={`inline-flex items-center gap-1 font-medium ${meta.tone}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    <span>·</span>
                    <span>{firms[0].name}</span>
                    <span>·</span>
                    <span>{timeAgo(item.at)} ago</span>
                  </p>
                  <h3 className="mt-1 text-[15px] leading-snug font-medium text-gray-950 dark:text-neutral-50">{item.headline}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-neutral-300">{item.summary}</p>
                  {item.kind === "deal" && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {item.round && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{item.round}</span>}
                      {item.amountUsdM !== undefined && <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-200">{newsMoney(item.amountUsdM)}</span>}
                      {firms.length > 1 && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-neutral-400">
                          with
                          {firms.slice(1).map((f) => (
                            <span key={f.id} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 dark:border-neutral-700">
                              <FirmLogo firm={f} size={12} />
                              {f.name}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  )}
                  <DealInsight item={item} onOpenProfile={onOpenProfile} />
                </div>
              </div>
            </li>
          );
        })}
        {shown.length === 0 && <p className="py-10 text-center text-sm text-gray-500 dark:text-neutral-400">No news of this kind from the firms you track.</p>}
      </ul>
    </div>
  );
}
