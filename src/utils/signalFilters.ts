import type { Signal } from "../types";
import { stripMarkdown } from "./text";

export const UNASSIGNED = "Unassigned" as const;

/** Canonical signal-type taxonomy — the "what happened" tags, not descriptive traits. */
export const signalTypeOptions = [
  "New Company",
  "Stealth Signal",
  "Exploring",
  "Investor Interest",
  "Ecosystem (Credit Providers)",
  "Company Incorporation",
  "Patent",
  "Grant",
  "Hackathon",
  "Research Paper",
  "Government",
  "Legal",
  "Student Club",
] as const;

/** Base country list (mirrors the old "View by: Country" filter), plus whatever else shows up in real data. */
const coreCountries = [
  "Singapore",
  "Philippines",
  "Thailand",
  "Indonesia",
  "Vietnam",
  "Australia",
  "Malaysia",
  "India",
  "China",
];

export const scoreMin = 0;
export const scoreMax = 10;

export const scoreOperators = ["gte", "lte", "eq", "range"] as const;
export type ScoreOperator = (typeof scoreOperators)[number];

export const scoreOperatorLabels: Record<ScoreOperator, string> = {
  gte: "Greater than or equal to",
  lte: "Smaller than or equal to",
  eq: "Equal to",
  range: "Between (range)",
};

export interface ScoreFilter {
  operator: ScoreOperator | null;
  value: number | null;
  min: number | null;
  max: number | null;
}

export const emptyScoreFilter: ScoreFilter = {
  operator: null,
  value: null,
  min: null,
  max: null,
};

export function isScoreFilterActive(filter: ScoreFilter): boolean {
  if (filter.operator === null) return false;
  if (filter.operator === "range") return filter.min !== null || filter.max !== null;
  return filter.value !== null;
}

export const datePresets = [
  "All dates",
  "Last week",
  "Last 2 weeks",
  "Last month",
  "Last 3 months",
  "Custom date",
] as const;
export type DatePreset = (typeof datePresets)[number];

export interface DateFilter {
  preset: DatePreset;
  /** ISO "YYYY-MM-DD", only meaningful when preset is "Custom date". */
  customStart?: string;
  customEnd?: string;
}

export interface SignalFilters {
  signalTypes: string[];
  sources: string[];
  industries: string[];
  countries: string[];
  locations: string[];
  education: string[];
  score: ScoreFilter;
  statuses: string[];
  assignedTo: string[];
  date: DateFilter;
}

export const emptyFilters: SignalFilters = {
  signalTypes: [],
  sources: [],
  industries: [],
  countries: [],
  locations: [],
  education: [],
  score: emptyScoreFilter,
  statuses: [],
  assignedTo: [],
  date: { preset: "All dates" },
};

/** Counts active filter *categories*, not the number of options selected within each. */
export function activeFilterCount(filters: SignalFilters): number {
  return (
    (filters.signalTypes.length > 0 ? 1 : 0) +
    (filters.sources.length > 0 ? 1 : 0) +
    (filters.industries.length > 0 ? 1 : 0) +
    (filters.countries.length > 0 ? 1 : 0) +
    (filters.locations.length > 0 ? 1 : 0) +
    (filters.education.length > 0 ? 1 : 0) +
    (isScoreFilterActive(filters.score) ? 1 : 0) +
    (filters.statuses.length > 0 ? 1 : 0) +
    (filters.assignedTo.length > 0 ? 1 : 0) +
    (filters.date.preset !== "All dates" ? 1 : 0)
  );
}

export function signalTypeLabels(signal: Signal): string[] {
  return signal.tags
    .filter((tag) => tag.category !== "industry" && tag.category !== "geography")
    .map((tag) => tag.label);
}

export function signalIndustryLabels(signal: Signal): string[] {
  return signal.tags.filter((tag) => tag.category === "industry").map((tag) => tag.label);
}

export function signalCountryLabels(signal: Signal): string[] {
  return signal.tags.filter((tag) => tag.category === "geography").map((tag) => tag.label);
}

/** Raw location string as shown under the headline, e.g. "Brisbane, Queensland, Australia". */
export function signalLocation(signal: Signal): string {
  return signal.contextLine.split(" · ")[0] ?? signal.contextLine;
}

export function signalSource(signal: Signal): string | undefined {
  return signal.sourcedVia ?? signal.sourcedBy;
}

export function signalEducationLabels(signal: Signal): string[] {
  return signal.education.map((entry) => entry.company);
}

export function signalAssignedTo(signal: Signal): string {
  return signal.assignedInvestor ?? UNASSIGNED;
}

/** The mock data only carries relative labels ("Today"/"Yesterday"), so map them to real calendar dates. */
const dateGroupCalendarDates: Record<Signal["dateGroup"], Date> = {
  "Today · Jul 27": new Date(2026, 6, 27),
  "Yesterday · Jul 26": new Date(2026, 6, 26),
};

export function signalDate(signal: Signal): Date {
  return dateGroupCalendarDates[signal.dateGroup];
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateRangeForFilter(filter: DateFilter): [Date, Date] | null {
  const today = new Date();
  switch (filter.preset) {
    case "All dates":
      return null;
    case "Last week":
      return [addDays(today, -7), today];
    case "Last 2 weeks":
      return [addDays(today, -14), today];
    case "Last month":
      return [addDays(today, -30), today];
    case "Last 3 months":
      return [addDays(today, -90), today];
    case "Custom date": {
      if (!filter.customStart || !filter.customEnd) return null;
      return [parseISODate(filter.customStart), parseISODate(filter.customEnd)];
    }
  }
}

function matchesDate(signal: Signal, filter: DateFilter): boolean {
  const range = dateRangeForFilter(filter);
  if (!range) return true;
  const [start, end] = range;
  const time = signalDate(signal).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    23,
    59,
    59,
  ).getTime();
  return time >= startTime && time <= endTime;
}

function matchesAny(selected: string[], values: string[]): boolean {
  return selected.length === 0 || values.some((v) => selected.includes(v));
}

function matchesScore(score: number, filter: ScoreFilter): boolean {
  switch (filter.operator) {
    case null:
      return true;
    case "gte":
      return filter.value === null || score >= filter.value;
    case "lte":
      return filter.value === null || score <= filter.value;
    case "eq":
      return filter.value === null || Math.abs(score - filter.value) < 0.05;
    case "range":
      return (
        (filter.min === null || score >= filter.min) && (filter.max === null || score <= filter.max)
      );
  }
}

export function signalMatchesFilters(signal: Signal, filters: SignalFilters): boolean {
  if (!matchesScore(signal.score, filters.score)) return false;
  if (!matchesAny(filters.signalTypes, signalTypeLabels(signal))) return false;
  if (!matchesAny(filters.industries, signalIndustryLabels(signal))) return false;
  if (!matchesAny(filters.countries, signalCountryLabels(signal))) return false;
  if (!matchesAny(filters.locations, [signalLocation(signal)])) return false;
  if (!matchesAny(filters.education, signalEducationLabels(signal))) return false;
  if (filters.sources.length > 0) {
    const source = signalSource(signal);
    if (!source || !filters.sources.includes(source)) return false;
  }
  if (filters.statuses.length > 0 && !filters.statuses.includes(signal.status)) return false;
  if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(signalAssignedTo(signal))) {
    return false;
  }
  if (!matchesDate(signal, filters.date)) return false;
  return true;
}

/** Free-text search across name, headline, companies, schools, and tags. */
export function signalMatchesSearch(signal: Signal, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    signal.personName,
    stripMarkdown(signal.headline),
    signal.contextLine,
    ...signal.tags.map((t) => t.label),
    ...signal.current.map((e) => `${e.company} ${e.role}`),
    ...signal.past.map((e) => `${e.company} ${e.role}`),
    ...signal.education.map((e) => `${e.company} ${e.role}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

/** All distinct filter option values found across a set of signals, for populating the filter dialog. */
export function deriveFilterOptions(signals: Signal[]) {
  const industries = new Set<string>();
  const countries = new Set<string>(coreCountries);
  const locations = new Set<string>();
  const education = new Set<string>();
  const sources = new Set<string>();
  const statuses = new Set<string>();
  const assignedTo = new Set<string>();

  for (const signal of signals) {
    signalIndustryLabels(signal).forEach((v) => industries.add(v));
    signalCountryLabels(signal).forEach((v) => countries.add(v));
    locations.add(signalLocation(signal));
    signalEducationLabels(signal).forEach((v) => education.add(v));
    const source = signalSource(signal);
    if (source) sources.add(source);
    statuses.add(signal.status);
    assignedTo.add(signalAssignedTo(signal));
  }

  return {
    signalTypes: [...signalTypeOptions],
    industries: [...industries].sort(),
    countries: [...countries].sort(),
    locations: [...locations].sort(),
    education: [...education].sort(),
    sources: [...sources].sort(),
    statuses: [...statuses].sort(),
    assignedTo: [...assignedTo].sort(),
  };
}
