/**
 * Shared types for the AI Associate. Everything here is plain data, so the same shapes can later be
 * served by a real backend or an MCP server without the UI changing.
 */

export type SignalType = "Stealth" | "New Company" | "Exploring" | "Investor Interest";

export type Background = "Engineering" | "Product" | "Data & ML" | "Design" | "Operations" | "Research";

export interface Role {
  company: string;
  title: string;
  startYear: number;
  /** null means current. */
  endYear: number | null;
}

export interface PersonSignal {
  type: SignalType;
  /** ISO date the signal fired. */
  date: string;
  /** One factual line describing the signal, e.g. "Left Grab after 6 years; LinkedIn now says Stealth". */
  detail: string;
  /** For Investor Interest: the fund that started following. */
  investor?: string;
}

/** A fake APAC profile from the seed database. No real people. */
export interface Person {
  id: string;
  name: string;
  pronoun: "he" | "she";
  headline: string;
  city: string;
  country: string;
  background: Background;
  yearsExperience: number;
  /** Most recent first. */
  roles: Role[];
  education: string;
  /** What they're building or exploring, in their own words. Empty when unknown. */
  building: string;
  sectors: string[];
  repeatFounder: boolean;
  previousStartup?: string;
  signal: PersonSignal;
  /** Seed profiles held back until "Simulate new signals" releases their batch. */
  incomingBatch?: number;
}

/** Structured filters the search tool applies before ranking. All optional; empty means "any". */
export interface SearchFilters {
  pastCompanies?: string[];
  signalTypes?: SignalType[];
  withinDays?: number;
  sectors?: string[];
  countries?: string[];
  backgrounds?: Background[];
  repeatFounder?: boolean;
}

export interface SearchHit {
  personId: string;
  score: number;
  /** Why this person matched, each line quoting their profile. */
  reasons: string[];
}

export interface SearchResult {
  query: string;
  filters: SearchFilters;
  total: number;
  hits: SearchHit[];
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Schedule =
  | { kind: "daily"; hour: number }
  | { kind: "weekdays"; hour: number }
  | { kind: "weekly"; weekday: Weekday; hour: number };

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  schedule: Schedule;
  status: "active" | "paused";
  createdAt: string;
  nextRunAt: string;
  lastRunAt: string | null;
  /** Everyone any run has already returned, so later runs report only net-new people. */
  seenIds: string[];
  /** Net-new people from runs, in the order found. Triaged people drop out when read. */
  newIds: string[];
}

export interface SearchRun {
  id: string;
  searchId: string;
  at: string;
  matched: number;
  newIds: string[];
}

export type TriageStatus = "saved" | "sent" | "dismissed";

export interface TriageRecord {
  status: TriageStatus;
  at: string;
  listId?: string;
}

export interface PersonList {
  id: string;
  name: string;
  personIds: string[];
}

export interface InboxItem {
  personId: string;
  investor: string;
  sentAt: string;
  /** Where it came from, e.g. the chat or a saved search name. */
  source: string;
}
