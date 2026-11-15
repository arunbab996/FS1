import { ArrowDownWideNarrow, Check, ChevronRight, Inbox, ListPlus, MessageSquare, Undo2, UsersRound, X } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { CURRENT_USER_NAME } from "../../utils/currentUser";
import { AGENT_NAME } from "../brand";
import { getPerson, useAssociateDb } from "../db/store";
import * as tools from "../tools";
import type { SearchFilters, SearchHit } from "../types";
import { CriteriaPills } from "./CriteriaPills";
import { PersonAvatar, SignalPill } from "./common";
import { useAsk, useOpenProfile } from "./context";

/**
 * Search results as a scannable table: select rows for bulk actions, read the strongest reason
 * inline, expand a row for every reason and the per-person actions. Reasons come from the search
 * tool, quoted from each profile. Sending to the Inbox notifies someone, so it asks first.
 */
export function ResultsTable({
  title,
  hits,
  total,
  filters,
  source,
  showHeader = true,
  pageSize = 8,
}: {
  title: string;
  hits: SearchHit[];
  total?: number;
  filters?: SearchFilters;
  /** Shown on Inbox items sent from here, e.g. a saved search's name. */
  source?: string;
  showHeader?: boolean;
  pageSize?: number;
}) {
  const db = useAssociateDb();
  const ask = useAsk();
  const openProfile = useOpenProfile();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmSend, setConfirmSend] = useState<string[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? hits : hits.slice(0, pageSize);
  const firstName = CURRENT_USER_NAME.split(" ")[0];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulk(action: "save" | "dismiss") {
    for (const id of selected) {
      if (action === "save") tools.save_to_list({ person_id: id, list: "Shortlist" });
      else tools.mark_triaged({ person_id: id, status: "dismissed" });
    }
    setSelected(new Set());
  }

  function send(ids: string[]) {
    for (const id of ids) tools.send_to_inbox({ person_id: id, source: source ?? AGENT_NAME });
    setConfirmSend(null);
    setSelected(new Set());
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900">
      {showHeader && (
        <div className="border-b border-gray-100 px-4 py-3 dark:border-neutral-800">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="flex min-w-0 items-center gap-1.5 text-gray-500 dark:text-neutral-400">
              <span>{AGENT_NAME} search</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-medium text-gray-900 dark:text-neutral-100">{title}</span>
            </p>
            <p className="text-gray-500 dark:text-neutral-400">
              Showing {hits.length}
              {total && total > hits.length ? ` of ${total}` : ""} {hits.length === 1 ? "result" : "results"}
            </p>
          </div>
          {filters && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <CriteriaPills filters={filters} />
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-neutral-500">
                <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                Sorted by relevance
              </span>
            </div>
          )}
        </div>
      )}

      {(selected.size > 0 || confirmSend) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-800/60">
          {confirmSend ? (
            <>
              <span className="text-gray-700 dark:text-neutral-200">
                Send {confirmSend.length === 1 ? getPerson(confirmSend[0])?.name : `${confirmSend.length} people`} to {firstName}'s Inbox?
              </span>
              <button type="button" onClick={() => send(confirmSend)} className={darkButton}>
                Send
              </button>
              <button type="button" onClick={() => setConfirmSend(null)} className={textButton}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-900 dark:text-neutral-100">{selected.size} selected</span>
              <span className="h-4 w-px bg-gray-200 dark:bg-neutral-700" />
              <button type="button" onClick={() => bulk("save")} className={textButton}>
                <ListPlus className="h-3.5 w-3.5" /> Save to Shortlist
              </button>
              <button type="button" onClick={() => setConfirmSend([...selected])} className={textButton}>
                <Inbox className="h-3.5 w-3.5" /> Send to Inbox
              </button>
              <button type="button" onClick={() => bulk("dismiss")} className={textButton}>
                <X className="h-3.5 w-3.5" /> Dismiss
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className={`${textButton} ml-auto`}>
                Clear
              </button>
            </>
          )}
        </div>
      )}

      <table className="w-full table-fixed text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 dark:border-neutral-800 dark:text-neutral-500">
            <th className="w-10 py-2 pl-4" />
            <th className="py-2 pr-3 font-medium">Person</th>
            <th className="w-[180px] py-2 pr-3 font-medium">Signal</th>
            <th className="hidden w-[34%] py-2 pr-3 font-medium lg:table-cell">Why they match</th>
            <th className="w-[96px] py-2 pr-4" />
          </tr>
        </thead>
        <tbody>
          {visible.map((hit) => {
            const person = getPerson(hit.personId);
            if (!person) return null;
            const triage = db.triage[hit.personId];
            const open = openId === hit.personId;
            const listName = triage?.listId ? db.lists.find((l) => l.id === triage.listId)?.name : undefined;
            return (
              <Fragment key={hit.personId}>
                <tr
                  onClick={() => setOpenId(open ? null : hit.personId)}
                  className={`group cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50/80 dark:border-neutral-800 dark:hover:bg-neutral-800/40 ${triage?.status === "dismissed" ? "opacity-50" : ""} ${open ? "bg-gray-50/80 dark:bg-neutral-800/40" : ""}`}
                >
                  <td className="py-3 pl-4 align-top" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(hit.personId)}
                      disabled={Boolean(triage)}
                      onChange={() => toggle(hit.personId)}
                      aria-label={`Select ${person.name}`}
                      className="mt-2 h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-gray-900 disabled:cursor-default disabled:opacity-30"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <PersonAvatar name={person.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900 dark:text-neutral-100">{person.name}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
                          {person.headline} · {person.city}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <SignalPill type={person.signal.type} date={person.signal.date} />
                  </td>
                  <td className="hidden py-3 pr-3 lg:table-cell">
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-300">{hit.reasons[0] ?? person.signal.detail}</p>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {triage ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${triage.status === "dismissed" ? "bg-gray-100 text-gray-500 dark:bg-neutral-800" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"}`}>
                        {triage.status === "saved" ? "Saved" : triage.status === "sent" ? "In Inbox" : "Dismissed"}
                      </span>
                    ) : (
                      <span className="inline-flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <RowIcon label="Save to Shortlist" onClick={() => tools.save_to_list({ person_id: hit.personId, list: "Shortlist" })} icon={<ListPlus className="h-3.5 w-3.5" />} />
                        <RowIcon label="Send to Inbox" onClick={() => setConfirmSend([hit.personId])} icon={<Inbox className="h-3.5 w-3.5" />} />
                        <RowIcon label="Dismiss" onClick={() => tools.mark_triaged({ person_id: hit.personId, status: "dismissed" })} icon={<X className="h-3.5 w-3.5" />} />
                      </span>
                    )}
                  </td>
                </tr>
                {open && (
                  <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-neutral-800 dark:bg-neutral-800/40">
                    <td />
                    <td colSpan={4} className="pr-4 pb-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">Why {person.name.split(" ")[0]} matches</p>
                        <ul className="mt-2 space-y-1.5">
                          {(hit.reasons.length ? hit.reasons : [person.signal.detail]).map((reason) => (
                            <li key={reason} className="flex gap-2 text-sm text-gray-700 dark:text-neutral-200">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
                          {person.yearsExperience} yrs · {person.education}
                          {person.roles.filter((r) => r.endYear !== null && r.company !== "Stealth").length > 0 &&
                            ` · Ex-${[...new Set(person.roles.filter((r) => r.endYear !== null && r.company !== "Stealth").map((r) => r.company))].join(", ")}`}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {triage ? (
                            <>
                              <span className="text-xs text-gray-500 dark:text-neutral-400">
                                {triage.status === "saved" ? `Saved to ${listName ?? "list"}` : triage.status === "sent" ? "Sent to Inbox" : "Dismissed"}
                              </span>
                              <button type="button" onClick={() => tools.clear_triage({ person_id: hit.personId })} className={textButton}>
                                <Undo2 className="h-3.5 w-3.5" /> Undo
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => tools.save_to_list({ person_id: hit.personId, list: "Shortlist" })} className={outlineButton}>
                                <ListPlus className="h-3.5 w-3.5" /> Save to Shortlist
                              </button>
                              <button type="button" onClick={() => setConfirmSend([hit.personId])} className={outlineButton}>
                                <Inbox className="h-3.5 w-3.5" /> Send to Inbox
                              </button>
                              <button type="button" onClick={() => tools.mark_triaged({ person_id: hit.personId, status: "dismissed" })} className={outlineButton}>
                                <X className="h-3.5 w-3.5" /> Dismiss
                              </button>
                            </>
                          )}
                          <span className="flex-1" />
                          <button type="button" onClick={() => ask(`Tell me more about ${person.name}`)} className={textButton}>
                            <MessageSquare className="h-3.5 w-3.5" /> Ask about {person.name.split(" ")[0]}
                          </button>
                          <button type="button" onClick={() => ask(`Who else looks like ${person.name}?`)} className={textButton}>
                            <UsersRound className="h-3.5 w-3.5" /> Find similar
                          </button>
                          <button type="button" onClick={() => openProfile(hit.personId)} className={darkButton}>
                            Open profile
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {hits.length > pageSize && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full cursor-pointer border-t border-gray-100 py-2.5 text-center text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
        >
          {expanded ? "Show fewer" : `Show ${hits.length - pageSize} more`}
        </button>
      )}
    </div>
  );
}

function RowIcon({ label, onClick, icon }: { label: string; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {icon}
    </button>
  );
}

const darkButton =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gray-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white";
const outlineButton =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";
const textButton =
  "inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";
