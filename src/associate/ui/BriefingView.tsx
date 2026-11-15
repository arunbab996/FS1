import { Coffee, Inbox, ListPlus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CURRENT_USER_NAME } from "../../utils/currentUser";
import { getPeople, getPerson, useAssociateDb } from "../db/store";
import { describeSchedule, formatRunTime } from "../jobs/schedule";
import { searchPeople } from "../search/search";
import * as tools from "../tools";
import { PersonAvatar, SignalPill } from "./common";
import { useOpenProfile } from "./context";

/**
 * The morning briefing: every untriaged net-new match across all saved searches, grouped by
 * search. Short and scannable: one line per person, the strongest reason, and triage buttons.
 */
export function BriefingView({ onOpenSearches }: { onOpenSearches: () => void }) {
  useAssociateDb();
  const groups = tools.get_briefing();
  const total = groups.reduce((sum, g) => sum + g.personIds.length, 0);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const firstName = CURRENT_USER_NAME.split(" ")[0];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[820px] px-6 py-8">
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
          <Coffee className="h-4 w-4" />
          {today} · Morning briefing
        </p>
        <h1 className="mt-3 font-serif text-[34px] leading-tight font-semibold tracking-tight text-gray-950 dark:text-neutral-50">
          {total ? `${total} new ${total === 1 ? "match" : "matches"}, ${firstName}.` : `You're all caught up, ${firstName}.`}
        </h1>
        <p className="mt-2 text-[15px] text-gray-600 dark:text-neutral-300">
          {total
            ? `Across ${groups.length} saved ${groups.length === 1 ? "search" : "searches"}. Only people you haven't seen; anyone you triage drops off.`
            : "Nothing new from your saved searches. New matches land here after each scheduled run."}
        </p>

        {total === 0 && (
          <button type="button" onClick={onOpenSearches} className="mt-5 cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
            Go to Saved searches
          </button>
        )}

        <div className="mt-8 space-y-8">
          {groups.map(({ search, personIds }) => {
            const hits = searchPeople(getPeople(), search.query, search.filters, { limit: 200 }).hits;
            return (
              <section key={search.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-950 dark:text-neutral-50">
                    {search.name} <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 align-[0.1em] text-xs font-semibold text-white">{personIds.length}</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {describeSchedule(search.schedule)} · last run {formatRunTime(search.lastRunAt)}
                  </p>
                </div>
                <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
                  {personIds.map((id) => (
                    <BriefingRow key={id} personId={id} reason={hits.find((h) => h.personId === id)?.reasons[0]} source={search.name} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BriefingRow({ personId, reason, source }: { personId: string; reason?: string; source: string }) {
  const person = getPerson(personId);
  const openProfile = useOpenProfile();
  const [confirmSend, setConfirmSend] = useState(false);
  if (!person) return null;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <button type="button" onClick={() => openProfile(personId)} className="shrink-0 cursor-pointer">
        <PersonAvatar name={person.name} size="sm" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => openProfile(personId)} className="cursor-pointer text-sm font-semibold text-gray-950 hover:underline dark:text-neutral-50">
            {person.name}
          </button>
          <SignalPill type={person.signal.type} date={person.signal.date} />
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-neutral-400" title={reason}>
          {person.headline} · {person.city}
          {reason && <> · {reason}</>}
        </p>
      </div>
      {confirmSend ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600 dark:text-neutral-300">
          Send to Inbox?
          <button type="button" onClick={() => tools.send_to_inbox({ person_id: personId, source })} className="cursor-pointer rounded-md bg-blue-600 px-2 py-1 font-semibold text-white hover:bg-blue-700">
            Send
          </button>
          <button type="button" onClick={() => setConfirmSend(false)} className="cursor-pointer rounded-md px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-neutral-800">
            Cancel
          </button>
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <RowButton label="Save to Shortlist" onClick={() => tools.save_to_list({ person_id: personId, list: "Shortlist" })} icon={<ListPlus className="h-4 w-4" />} />
          <RowButton label="Send to Inbox" onClick={() => setConfirmSend(true)} icon={<Inbox className="h-4 w-4" />} />
          <RowButton label="Dismiss" onClick={() => tools.mark_triaged({ person_id: personId, status: "dismissed" })} icon={<X className="h-4 w-4" />} />
        </div>
      )}
    </li>
  );
}

function RowButton({ label, onClick, icon }: { label: string; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {icon}
    </button>
  );
}

