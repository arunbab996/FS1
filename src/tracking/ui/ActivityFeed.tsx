import { Check, Inbox, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAssociateDb } from "../../associate/db/store";
import * as associateTools from "../../associate/tools";
import { TwitterIcon } from "../../components/icons/TwitterIcon";
import { FOLLOW_EVENTS, firmById, investorById, targetKey, type FollowEvent, type FollowTarget } from "../data";
import { trackedInvestorIds, useTracking } from "../store";
import { timeAgo } from "../time";
import { Avatar, CompanyTile, FirmLogo } from "./common";

type Filter = "all" | "person" | "company" | "outside";

const DAY_MS = 86_400_000;
const PAGE = 40;

/** Day buckets like Instagram's activity tab. */
function bucketOf(iso: string, now = Date.now()): string {
  const days = (now - new Date(iso).getTime()) / DAY_MS;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (new Date(iso) >= start) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return "This week";
  return "Earlier this month";
}

/** An X handle. Demo handles are invented, so they only become links once live X data is in. */
function Handle({ handle }: { handle: string }) {
  return (
    <span
      title="Demo handle — opens on X once live data is connected"
      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-neutral-800 dark:text-neutral-300"
    >
      <TwitterIcon className="h-2.5 w-2.5" />@{handle}
    </span>
  );
}

function TargetThumb({ target }: { target: FollowTarget }) {
  return target.kind === "person" ? <Avatar name={target.name} size={40} /> : <CompanyTile name={target.name} size={40} />;
}

export function ActivityFeed({ onOpenProfile, onManage }: { onOpenProfile: (personId: string) => void; onManage: () => void }) {
  const prefs = useTracking();
  const db = useAssociateDb();
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const [confirmSend, setConfirmSend] = useState<string | null>(null);

  const tracked = trackedInvestorIds(prefs);
  const events = FOLLOW_EVENTS.filter((e) => tracked.has(e.investorId));
  const firmCount = new Set([...tracked].map((id) => investorById.get(id)!.firmId)).size;
  const weekCount = events.filter((e) => Date.now() - new Date(e.at).getTime() < 7 * DAY_MS).length;

  // Convergence: several tracked investors following the same person or company within two weeks.
  const recent = events.filter((e) => Date.now() - new Date(e.at).getTime() < 14 * DAY_MS);
  const groups = new Map<string, FollowEvent[]>();
  for (const e of recent) groups.set(targetKey(e.target), [...(groups.get(targetKey(e.target)) ?? []), e]);
  const converging = [...groups.values()]
    .map((list) => list.filter((e, i) => list.findIndex((x) => x.investorId === e.investorId) === i))
    .filter((list) => list.length >= 2)
    .sort((a, b) => b.length - a.length || new Date(b[0].at).getTime() - new Date(a[0].at).getTime())
    .slice(0, 3);

  const filtered = events.filter((e) =>
    filter === "all" ? true : filter === "outside" ? !e.target.personId : e.target.kind === filter,
  );
  const visible = filtered.slice(0, limit);
  const buckets: [string, FollowEvent[]][] = [];
  for (const e of visible) {
    const b = bucketOf(e.at);
    const last = buckets[buckets.length - 1];
    if (last && last[0] === b) last[1].push(e);
    else buckets.push([b, [e]]);
  }

  if (tracked.size === 0) {
    return (
      <div className="mx-auto max-w-[760px] px-8 py-16 text-center">
        <p className="text-base font-medium text-gray-900 dark:text-neutral-100">You're not tracking anyone yet</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">Pick the firms and investors you want to follow, and their activity on X shows up here.</p>
        <button type="button" onClick={onManage} className="mt-5 cursor-pointer rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900">
          Choose investors to track
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Tracking <span className="font-medium text-gray-900 dark:text-neutral-100">{tracked.size} investors</span> at {firmCount} {firmCount === 1 ? "firm" : "firms"} · {weekCount} follows this week ·{" "}
          <button type="button" onClick={onManage} className="cursor-pointer font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 dark:text-neutral-100">
            Manage
          </button>
        </p>
        <div className="flex gap-1.5">
          {(
            [
              ["all", "All"],
              ["person", "Founders"],
              ["company", "Companies"],
              ["outside", "Not in FirstSignal"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setFilter(id);
                setLimit(PAGE);
              }}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
                filter === id
                  ? "bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {converging.length > 0 && filter === "all" && (
        <section className="mt-4">
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-gray-950 dark:text-neutral-50">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Converging
            <span className="font-normal text-gray-400 dark:text-neutral-500">· several investors you track followed the same person</span>
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {converging.map((list) => {
              const target = list[0].target;
              const triage = target.personId ? db.triage[target.personId] : undefined;
              const firms = [...new Set(list.map((e) => firmById.get(investorById.get(e.investorId)!.firmId)!.name))];
              return (
                <div key={targetKey(target)} className="flex flex-col rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/70 to-white p-4 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-neutral-900">
                  <div className="flex items-center gap-3">
                    <TargetThumb target={target} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-950 dark:text-neutral-50">{target.name}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-neutral-400">{target.bio}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {list.slice(0, 4).map((e) => (
                        <span key={e.id} className="rounded-full ring-2 ring-white dark:ring-neutral-900">
                          <Avatar name={investorById.get(e.investorId)!.name} size={24} />
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-neutral-300">
                      <span className="font-medium text-gray-900 dark:text-neutral-100">{list.length} investors</span> followed · latest {timeAgo(list[0].at)} ago
                    </p>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 dark:text-neutral-400">{firms.join(" · ")}</p>
                  <div className="mt-auto pt-3">
                    {!target.personId ? (
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Not in FirstSignal yet — a coverage gap</p>
                    ) : triage ? (
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                        {triage.status === "sent" ? "In your Inbox" : triage.status === "saved" ? "On your list" : "You passed"}
                      </p>
                    ) : confirmSend === target.personId ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600 dark:text-neutral-300">Send to your Inbox?</span>
                        <button
                          type="button"
                          onClick={() => {
                            associateTools.send_to_inbox({ person_id: target.personId!, source: "Investor Tracking" });
                            setConfirmSend(null);
                          }}
                          className="cursor-pointer rounded-md bg-gray-950 px-2 py-1 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                        >
                          Send
                        </button>
                        <button type="button" onClick={() => setConfirmSend(null)} className="cursor-pointer text-gray-500 hover:text-gray-900">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-neutral-400">You haven't reached out.</span>
                        <button
                          type="button"
                          onClick={() => setConfirmSend(target.personId!)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-gray-950 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900"
                        >
                          <Inbox className="h-3 w-3" />
                          Send to Inbox
                        </button>
                        <button type="button" onClick={() => onOpenProfile(target.personId!)} className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-300">
                          Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {buckets.map(([bucket, list]) => (
        <section key={bucket} className="mt-8">
          <h2 className="text-sm font-medium text-gray-950 dark:text-neutral-50">{bucket}</h2>
          <ul className="mt-2">
            {list.map((e) => {
              const investor = investorById.get(e.investorId)!;
              const firm = firmById.get(investor.firmId)!;
              const others = (groups.get(targetKey(e.target))?.length ?? 1) - 1;
              return (
                <li key={e.id} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-gray-50 dark:hover:bg-neutral-900">
                  <span className="relative shrink-0">
                    <Avatar name={investor.name} size={44} />
                    <span className="absolute -right-1 -bottom-1 rounded-md ring-2 ring-white dark:ring-neutral-950">
                      <FirmLogo firm={firm} size={18} />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-gray-700 dark:text-neutral-300">
                      <span className="font-medium text-gray-950 dark:text-neutral-50">{investor.name}</span> from{" "}
                      <span className="font-medium text-gray-950 dark:text-neutral-50">{firm.name}</span> followed{" "}
                      {e.target.personId ? (
                        <button type="button" onClick={() => onOpenProfile(e.target.personId!)} className="cursor-pointer font-medium text-gray-950 hover:underline dark:text-neutral-50">
                          {e.target.name}
                        </button>
                      ) : (
                        <span className="font-medium text-gray-950 dark:text-neutral-50">{e.target.name}</span>
                      )}{" "}
                      on X <span className="text-gray-400 dark:text-neutral-500">· {timeAgo(e.at)}</span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Handle handle={e.target.handle} />
                      <span className="truncate text-xs text-gray-500 dark:text-neutral-400">{e.target.bio}</span>
                      {others > 0 && (
                        <span className="rounded-md bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                          +{others} more you track
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {e.target.personId ? (
                      <button
                        type="button"
                        onClick={() => onOpenProfile(e.target.personId!)}
                        className="hidden cursor-pointer rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 sm:inline dark:border-neutral-700 dark:text-neutral-300"
                      >
                        In FirstSignal
                      </button>
                    ) : (
                      <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 sm:inline dark:bg-amber-500/15 dark:text-amber-300">
                        Not in FirstSignal
                      </span>
                    )}
                    <TargetThumb target={e.target} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {filtered.length === 0 && <p className="mt-10 text-center text-sm text-gray-500 dark:text-neutral-400">No activity of this kind from the investors you track.</p>}
      {filtered.length > limit && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-200">
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
