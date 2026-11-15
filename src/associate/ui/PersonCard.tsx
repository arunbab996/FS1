import { Check, ChevronDown, Inbox, ListPlus, MessageSquare, Plus, Undo2, UsersRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CURRENT_USER_NAME } from "../../utils/currentUser";
import { AGENT_NAME } from "../brand";
import { getPerson, useAssociateDb } from "../db/store";
import * as tools from "../tools";
import { PersonAvatar, SignalPill } from "./common";
import { useAsk, useOpenProfile } from "./context";

/**
 * A compact, scannable founder card. Every "why they match" line comes from the search tool, which
 * quotes the profile. Clicking an action on the card is the investor's confirmation; sending to
 * the Inbox notifies someone, so it asks once more inline.
 */
export function PersonCard({ personId, reasons, source }: { personId: string; reasons: string[]; source?: string }) {
  const db = useAssociateDb();
  const person = getPerson(personId);
  const openProfile = useOpenProfile();
  const ask = useAsk();
  const [confirmingSend, setConfirmingSend] = useState(false);
  const [listMenu, setListMenu] = useState(false);
  const [newList, setNewList] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setListMenu(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!person) return null;
  const triage = db.triage[personId];
  const firstName = person.name.split(" ")[0];
  const pastCompanies = [...new Set(person.roles.filter((r) => r.endYear !== null && r.company !== "Stealth").map((r) => r.company))];
  const listName = triage?.listId ? db.lists.find((l) => l.id === triage.listId)?.name : undefined;

  function saveTo(list: string) {
    tools.save_to_list({ person_id: personId, list });
    setListMenu(false);
    setNewList("");
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 transition-opacity dark:border-neutral-700 dark:bg-neutral-900 ${triage?.status === "dismissed" ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => openProfile(personId)} className="shrink-0 cursor-pointer" aria-label={`Open ${person.name}'s profile`}>
          <PersonAvatar name={person.name} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={() => openProfile(personId)}
              className="cursor-pointer text-sm font-semibold text-gray-950 hover:underline dark:text-neutral-50"
            >
              {person.name}
            </button>
            <SignalPill type={person.signal.type} date={person.signal.date} />
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-neutral-300">{person.headline}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
            {person.city}, {person.country}
            {pastCompanies.length > 0 && <> · Ex-{pastCompanies.slice(0, 3).join(", ")}</>}
            {person.repeatFounder && <> · Repeat founder</>}
          </p>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-neutral-800/60">
          <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">Why {firstName} matches</p>
          <ul className="mt-1 space-y-1">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-1.5 text-xs text-gray-700 dark:text-neutral-300">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {triage ? (
          <>
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                triage.status === "dismissed"
                  ? "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              }`}
            >
              {triage.status === "dismissed" ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {triage.status === "saved" ? `Saved to ${listName ?? "list"}` : triage.status === "sent" ? "Sent to Inbox" : "Dismissed"}
            </span>
            <button
              type="button"
              onClick={() => tools.clear_triage({ person_id: personId })}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
          </>
        ) : confirmingSend ? (
          <span className="inline-flex flex-wrap items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-800 dark:bg-neutral-800 dark:text-neutral-200">
            Send {firstName} to {CURRENT_USER_NAME.split(" ")[0]}'s Inbox?
            <button
              type="button"
              onClick={() => {
                tools.send_to_inbox({ person_id: personId, source: source ?? AGENT_NAME });
                setConfirmingSend(false);
              }}
              className="cursor-pointer rounded-md bg-gray-950 px-2 py-0.5 font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900"
            >
              Send
            </button>
            <button type="button" onClick={() => setConfirmingSend(false)} className="cursor-pointer rounded-md px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700">
              Cancel
            </button>
          </span>
        ) : (
          <>
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setListMenu((v) => !v)} className={actionButton}>
                <ListPlus className="h-3.5 w-3.5" />
                Save
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {listMenu && (
                <div className="absolute top-full left-0 z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {db.lists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => saveTo(list.name)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {list.name}
                      <span className="text-xs text-gray-400">{list.personIds.length}</span>
                    </button>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newList.trim()) saveTo(newList.trim());
                    }}
                    className="mt-1 flex items-center gap-1 border-t border-gray-100 pt-1 dark:border-neutral-700"
                  >
                    <Plus className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <input
                      value={newList}
                      onChange={(e) => setNewList(e.target.value)}
                      placeholder="New list…"
                      className="w-full bg-transparent px-1 py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-neutral-100"
                    />
                  </form>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setConfirmingSend(true)} className={actionButton}>
              <Inbox className="h-3.5 w-3.5" />
              Send to Inbox
            </button>
            <button type="button" onClick={() => tools.mark_triaged({ person_id: personId, status: "dismissed" })} className={actionButton}>
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </>
        )}
        <span className="flex-1" />
        <button type="button" onClick={() => ask(`Tell me more about ${person.name}`)} className={ghostButton}>
          <MessageSquare className="h-3.5 w-3.5" />
          Tell me more
        </button>
        <button type="button" onClick={() => ask(`Who else looks like ${person.name}?`)} className={ghostButton}>
          <UsersRound className="h-3.5 w-3.5" />
          Similar
        </button>
      </div>
    </div>
  );
}

const actionButton =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";
const ghostButton =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";
