import { useSyncExternalStore } from "react";
import { SEED_PEOPLE } from "../data/seed";
import type {
  InboxItem,
  Person,
  PersonList,
  SavedSearch,
  SearchRun,
  TriageRecord,
} from "../types";

/**
 * A tiny in-browser database for the prototype. The seed people are read-only; everything an
 * investor does (lists, Inbox sends, triage, saved searches and their runs) lives here and is kept
 * in localStorage, so it survives reloads on the deployed prototype without a backend.
 *
 * Only the tools layer should write to it. Swapping this file for real API calls is the path to a
 * hosted version.
 */

export interface AssociateDb {
  version: 1;
  /** When each "Simulate new signals" batch was released (index 0 = batch 1). */
  releasedAt: string[];
  lists: PersonList[];
  inbox: InboxItem[];
  triage: Record<string, TriageRecord>;
  savedSearches: SavedSearch[];
  runs: SearchRun[];
}

const STORAGE_KEY = "fs_associate_db_v1";

function emptyDb(): AssociateDb {
  return {
    version: 1,
    releasedAt: [],
    lists: [{ id: "list-shortlist", name: "Shortlist", personIds: [] }],
    inbox: [],
    triage: {},
    savedSearches: [],
    runs: [],
  };
}

function load(): AssociateDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AssociateDb;
      if (parsed.version === 1) return parsed;
    }
  } catch {
    // Storage blocked or corrupt: start fresh for this visit.
  }
  return emptyDb();
}

let db: AssociateDb = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable (private window); changes still apply for this visit.
  }
}

export function getDb(): AssociateDb {
  return db;
}

/** Apply a change immutably, save it, and notify subscribers. */
export function updateDb(change: (draft: AssociateDb) => AssociateDb): void {
  db = change(db);
  persist();
  peopleCache = null;
  for (const listener of listeners) listener();
}

export function resetDb(): void {
  updateDb(() => emptyDb());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders when the database changes. */
export function useAssociateDb(): AssociateDb {
  return useSyncExternalStore(subscribe, getDb, getDb);
}

let peopleCache: Person[] | null = null;

/**
 * Everyone currently in the database: the seed profiles plus any incoming batch that has been
 * released. A released person's signal is dated to the moment their batch arrived.
 */
export function getPeople(): Person[] {
  if (peopleCache) return peopleCache;
  const released = db.releasedAt;
  peopleCache = SEED_PEOPLE.filter((p) => !p.incomingBatch || p.incomingBatch <= released.length).map((p) =>
    p.incomingBatch ? { ...p, signal: { ...p.signal, date: released[p.incomingBatch - 1] } } : p,
  );
  return peopleCache;
}

export function getPerson(id: string): Person | undefined {
  return getPeople().find((p) => p.id === id);
}
