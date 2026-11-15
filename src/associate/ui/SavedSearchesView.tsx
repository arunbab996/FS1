import { ChevronRight, Copy, Pause, Pencil, Play, RefreshCw, Trash2, Zap } from "lucide-react";
import { DoriotMark } from "./DoriotMark";
import { Fragment, useState, type ReactNode } from "react";
import { understandQuery } from "../agent/understand";
import { criteriaFromFilters } from "../criteria";
import { SUGGESTED_PROMPTS } from "../agent/prompts";
import { INCOMING_BATCHES } from "../data/seed";
import { getPeople, resetDb, useAssociateDb } from "../db/store";
import { SCHEDULE_OPTIONS, describeSchedule, formatRunTime, scheduleKey } from "../jobs/schedule";
import { searchPeople } from "../search/search";
import * as tools from "../tools";
import type { SavedSearch, Schedule } from "../types";
import { ResultsTable } from "./ResultsTable";

/**
 * Saved searches: each one is a scheduled job. One table with name, query, schedule, next and
 * last run, and how many new matches are waiting, plus run now / pause / edit / clone / delete.
 * Expanding a row shows its new matches to triage.
 */
export function SavedSearchesView({ onToast }: { onToast: (text: string) => void }) {
  const db = useAssociateDb();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SavedSearch | null>(null);
  const [deleting, setDeleting] = useState<SavedSearch | null>(null);
  const releasedAll = db.releasedAt.length >= INCOMING_BATCHES;

  function runNow(s: SavedSearch) {
    const result = tools.run_saved_search({ search_id: s.id });
    if ("error" in result) return onToast(result.error);
    onToast(result.new_ids.length ? `${s.name}: ${result.new_ids.length} new ${result.new_ids.length === 1 ? "match" : "matches"}` : `${s.name}: nothing new since the last run`);
    if (result.new_ids.length) setOpenId(s.id);
  }

  function loadDemo() {
    const picks: [string, string, Schedule][] = [
      ["Ex-Grab AI infra, gone stealth", SUGGESTED_PROMPTS[0], { kind: "weekly", weekday: 1, hour: 8 }],
      ["India technical founders with investor interest", SUGGESTED_PROMPTS[3], { kind: "daily", hour: 8 }],
      ["Sea/Shopee fintech PMs exploring", SUGGESTED_PROMPTS[2], { kind: "weekdays", hour: 8 }],
    ];
    for (const [name, prompt, schedule] of picks) {
      const { filters, freeText } = understandQuery(prompt);
      const created = tools.create_saved_search({ name, query: freeText || prompt, filters, schedule });
      tools.run_saved_search({ search_id: created.id });
    }
    onToast("Added 3 demo searches and ran them once");
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-medium tracking-tight text-gray-950 dark:text-neutral-50">Saved searches</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              Each search runs on its schedule and only brings people you haven't seen. Anyone you triage never comes back.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={releasedAll}
              title="Demo control: releases a batch of fake profiles as if new signals arrived overnight"
              onClick={() => {
                const r = tools.release_new_signals();
                onToast(r.released ? `${r.released} new signals arrived (demo). Run a search to see who's new.` : "No more demo signals to release");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-default disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Zap className="h-3.5 w-3.5" />
              Simulate new signals
              <span className="text-xs text-gray-400">{INCOMING_BATCHES - db.releasedAt.length} left</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetDb();
                onToast("Demo data reset");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset demo
            </button>
          </div>
        </div>

        {db.savedSearches.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex justify-center"><DoriotMark size={32} /></div>
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-neutral-100">No saved searches yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-neutral-400">
              Run a search and say yes when Doriot offers to schedule it. Or load three examples to try the flow.
            </p>
            <button type="button" onClick={loadDemo} className="mt-4 cursor-pointer rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900">
              Load demo searches
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full min-w-[960px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 dark:border-neutral-800 dark:text-neutral-500">
                  <th className="w-10 py-3 pl-4" />
                  <th className="w-[22%] py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Criteria</th>
                  <th className="w-[170px] py-3 pr-4">Schedule</th>
                  <th className="w-[120px] py-3 pr-4">Next run</th>
                  <th className="w-[120px] py-3 pr-4">Last run</th>
                  <th className="w-[56px] py-3 pr-4 text-right">New</th>
                  <th className="w-[168px] py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.savedSearches.map((s) => {
                  const fresh = tools.pending_matches(s.id);
                  const open = openId === s.id;
                  return (
                    <Fragment key={s.id}>
                      <tr className={`border-b border-gray-100 last:border-0 dark:border-neutral-800 ${s.status === "paused" ? "text-gray-400 dark:text-neutral-500" : ""}`}>
                        <td className="py-3 pl-4">
                          <button type="button" onClick={() => setOpenId(open ? null : s.id)} aria-label="Show new matches" className="cursor-pointer rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800">
                            <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          <button type="button" onClick={() => setOpenId(open ? null : s.id)} title={s.name} className="block w-full cursor-pointer truncate text-left font-medium text-gray-900 hover:underline dark:text-neutral-100">
                            {s.name}
                          </button>
                          {s.status === "paused" && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 dark:bg-neutral-800">Paused</span>}
                        </td>
                        <td className="truncate py-3 pr-4 text-gray-500 dark:text-neutral-400" title={s.query}>
                          {criteriaFromFilters(s.filters).flatMap((c) => c.values).join(" · ") || s.query}
                        </td>
                        <td className="truncate py-3 pr-4" title={describeSchedule(s.schedule)}>{describeSchedule(s.schedule)}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">{s.status === "paused" ? "—" : formatRunTime(s.nextRunAt)}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">{formatRunTime(s.lastRunAt)}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={`inline-flex min-w-6 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${fresh.length ? "bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-gray-100 text-gray-400 dark:bg-neutral-800"}`}>
                            {fresh.length}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end gap-0.5">
                            <IconButton label="Run now" onClick={() => runNow(s)} icon={<Play className="h-3.5 w-3.5" />} />
                            <IconButton
                              label={s.status === "paused" ? "Resume" : "Pause"}
                              onClick={() => tools.update_saved_search({ search_id: s.id, patch: { status: s.status === "paused" ? "active" : "paused" } })}
                              icon={s.status === "paused" ? <RefreshCw className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                            />
                            <IconButton label="Edit" onClick={() => setEditing(s)} icon={<Pencil className="h-3.5 w-3.5" />} />
                            <IconButton
                              label="Clone"
                              onClick={() => {
                                tools.clone_saved_search({ search_id: s.id });
                                onToast(`Cloned “${s.name}”`);
                              }}
                              icon={<Copy className="h-3.5 w-3.5" />}
                            />
                            <IconButton label="Delete" onClick={() => setDeleting(s)} icon={<Trash2 className="h-3.5 w-3.5" />} danger />
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-neutral-800 dark:bg-neutral-950/40">
                          <td colSpan={8} className="px-4 py-4">
                            <NewMatches search={s} ids={fresh} onRun={() => runNow(s)} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EditDialog search={editing} onClose={() => setEditing(null)} onSaved={(n) => onToast(`Saved changes to “${n}”`)} />}
      {deleting && (
        <Dialog title={`Delete “${deleting.name}”?`} onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-600 dark:text-neutral-300">It stops running, and its waiting matches are removed. People you've already saved or sent stay where they are.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleting(null)} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                tools.delete_saved_search({ search_id: deleting.id });
                onToast(`Deleted “${deleting.name}”`);
                setDeleting(null);
              }}
              className="cursor-pointer rounded-lg bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function NewMatches({ search, ids, onRun }: { search: SavedSearch; ids: string[]; onRun: () => void }) {
  if (ids.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        No new matches waiting.{" "}
        <button type="button" onClick={onRun} className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-400">
          Run it now
        </button>{" "}
        to check for anyone new.
      </p>
    );
  }
  // Reasons come from re-running the search's own filters against each person.
  const all = searchPeople(getPeople(), search.query, search.filters, { limit: 200 }).hits;
  const hits = ids.map((id) => all.find((h) => h.personId === id) ?? { personId: id, score: 0, reasons: [] });
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500 dark:text-neutral-400">
        {ids.length} new {ids.length === 1 ? "match" : "matches"} to review. Save, send or dismiss each one and it won't show again.
      </p>
      <ResultsTable title={search.name} hits={hits} source={search.name} showHeader={false} pageSize={6} />
    </div>
  );
}

function EditDialog({ search, onClose, onSaved }: { search: SavedSearch; onClose: () => void; onSaved: (name: string) => void }) {
  const [name, setName] = useState(search.name);
  const [query, setQuery] = useState(search.query);
  const options = SCHEDULE_OPTIONS.some((o) => scheduleKey(o.value) === scheduleKey(search.schedule))
    ? SCHEDULE_OPTIONS
    : [{ label: describeSchedule(search.schedule), value: search.schedule }, ...SCHEDULE_OPTIONS];
  const [key, setKey] = useState(scheduleKey(search.schedule));
  const queryChanged = query.trim() !== search.query;
  const preview = queryChanged ? understandQuery(query) : null;

  return (
    <Dialog title="Edit saved search" onClose={onClose}>
      <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <label className="mt-3 block text-xs font-medium text-gray-500 dark:text-neutral-400">
        Query
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
      </label>
      {preview && (
        <div className="mt-2 flex flex-wrap gap-1">
          {preview.chips.map((chip) => (
            <span key={chip} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
              {chip}
            </span>
          ))}
        </div>
      )}
      <label className="mt-3 block text-xs font-medium text-gray-500 dark:text-neutral-400">
        Schedule
        <select value={key} onChange={(e) => setKey(e.target.value)} className={inputClass}>
          {options.map((o) => (
            <option key={scheduleKey(o.value)} value={scheduleKey(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const schedule = options.find((o) => scheduleKey(o.value) === key)?.value ?? search.schedule;
            tools.update_saved_search({
              search_id: search.id,
              patch: {
                name: name.trim() || search.name,
                schedule,
                ...(preview ? { query: preview.freeText || query.trim(), filters: preview.filters } : {}),
              },
            });
            onSaved(name.trim() || search.name);
            onClose();
          }}
          className="cursor-pointer rounded-lg bg-gray-950 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Save changes
        </button>
      </div>
    </Dialog>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900">
        <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function IconButton({ label, onClick, icon, danger }: { label: string; onClick: () => void; icon: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800 ${danger ? "hover:text-red-600" : "hover:text-gray-900 dark:hover:text-neutral-100"}`}
    >
      {icon}
    </button>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-normal text-gray-900 outline-none focus:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
const secondaryButton =
  "cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";

