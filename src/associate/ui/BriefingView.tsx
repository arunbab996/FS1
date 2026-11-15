import { CURRENT_USER_NAME } from "../../utils/currentUser";
import { AGENT_NAME } from "../brand";
import { getPeople, useAssociateDb } from "../db/store";
import { describeSchedule, formatRunTime } from "../jobs/schedule";
import { searchPeople } from "../search/search";
import * as tools from "../tools";
import { CriteriaPills } from "./CriteriaPills";
import { AgentMark } from "./AgentMark";
import { ResultsTable } from "./ResultsTable";

/**
 * The morning briefing: every untriaged net-new match across all saved searches, grouped by
 * search, with the strongest reason inline. Triage a row and it drops off.
 */
export function BriefingView({ onOpenSearches }: { onOpenSearches: () => void }) {
  useAssociateDb();
  const groups = tools.get_briefing();
  const total = groups.reduce((sum, g) => sum + g.personIds.length, 0);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const firstName = CURRENT_USER_NAME.split(" ")[0];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[960px] px-6 py-10">
        <div className="flex items-start gap-4">
          <AgentMark size={36} />
          <div>
            <p className="text-sm text-gray-400 dark:text-neutral-500">{today} · Morning briefing</p>
            <h1 className="mt-1 text-[26px] font-medium tracking-tight text-gray-950 dark:text-neutral-50">
              {total ? `${total} new ${total === 1 ? "founder" : "founders"} to look at, ${firstName}.` : `You're all caught up, ${firstName}.`}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">
              {total
                ? `${AGENT_NAME} ran your ${groups.length} saved ${groups.length === 1 ? "search" : "searches"}. These are only people you haven't seen; anyone you triage drops off.`
                : "Nothing new from your saved searches. New matches land here after each scheduled run."}
            </p>
            {total === 0 && (
              <button type="button" onClick={onOpenSearches} className="mt-4 cursor-pointer rounded-lg bg-gray-950 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900">
                Go to Saved searches
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {groups.map(({ search, personIds }) => {
            const hits = searchPeople(getPeople(), search.query, search.filters, { limit: 200 }).hits;
            const groupHits = personIds.map((id) => hits.find((h) => h.personId === id) ?? { personId: id, score: 0, reasons: [] });
            return (
              <section key={search.id}>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-medium text-gray-950 dark:text-neutral-50">
                      {search.name}
                      <span className="rounded-full bg-gray-950 px-1.5 py-px text-[11px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">{personIds.length}</span>
                    </h2>
                    <div className="mt-1.5">
                      <CriteriaPills filters={search.filters} compact />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-neutral-500">
                    {describeSchedule(search.schedule)} · last run {formatRunTime(search.lastRunAt)}
                  </p>
                </div>
                <ResultsTable title={search.name} hits={groupHits} source={search.name} showHeader={false} pageSize={6} />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
