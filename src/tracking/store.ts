import { useSyncExternalStore } from "react";
import { INVESTORS, type Investor } from "./data";

/**
 * Who this user tracks: whole firms (everyone there, including people who join later) and/or
 * hand-picked investors. Each user chooses their own, kept in their browser for the prototype.
 */
export interface TrackingPrefs {
  firms: string[];
  investors: string[];
}

const KEY = "fs_investor_tracking_v1";
const DEFAULTS: TrackingPrefs = { firms: ["peak-xv", "east-ventures"], investors: ["antler-1", "accel-2", "lightspeed-1"] };

function load(): TrackingPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as TrackingPrefs;
  } catch {
    // Storage blocked or corrupt: fall back to the defaults for this visit.
  }
  return DEFAULTS;
}

let prefs = load();
const listeners = new Set<() => void>();

function save(next: TrackingPrefs) {
  prefs = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: changes still apply for this visit.
  }
  for (const l of listeners) l();
}

export function useTracking(): TrackingPrefs {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => prefs,
  );
}

export function isTracked(p: TrackingPrefs, investor: Investor): boolean {
  return p.firms.includes(investor.firmId) || p.investors.includes(investor.id);
}

export function trackedInvestorIds(p: TrackingPrefs): Set<string> {
  return new Set(INVESTORS.filter((v) => isTracked(p, v)).map((v) => v.id));
}

/** Track or stop tracking a whole firm. Stopping keeps no individual picks at that firm. */
export function setFirmTracked(firmId: string, on: boolean) {
  const firmInvestorIds = new Set(INVESTORS.filter((v) => v.firmId === firmId).map((v) => v.id));
  save({
    firms: on ? [...new Set([...prefs.firms, firmId])] : prefs.firms.filter((f) => f !== firmId),
    investors: prefs.investors.filter((id) => !firmInvestorIds.has(id)),
  });
}

/**
 * Track or stop tracking one investor. Stopping one person at a fully tracked firm switches that
 * firm to individual picks: everyone else there stays tracked.
 */
export function setInvestorTracked(investor: Investor, on: boolean) {
  if (!on && prefs.firms.includes(investor.firmId)) {
    const others = INVESTORS.filter((v) => v.firmId === investor.firmId && v.id !== investor.id).map((v) => v.id);
    save({ firms: prefs.firms.filter((f) => f !== investor.firmId), investors: [...new Set([...prefs.investors, ...others])] });
    return;
  }
  save({
    firms: prefs.firms,
    investors: on ? [...new Set([...prefs.investors, investor.id])] : prefs.investors.filter((id) => id !== investor.id),
  });
}
