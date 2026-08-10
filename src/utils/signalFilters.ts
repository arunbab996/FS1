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

/** Fixed seniority taxonomy, inferred from job title keywords — not an explicit data field. */
export const seniorityLevelOptions = [
  "Executive / Founder",
  "VP / Director",
  "Manager",
  "Individual Contributor",
] as const;

/** Fixed education-level taxonomy, inferred from degree text/badge — not an explicit data field. */
export const educationLevelOptions = ["PhD", "Master's", "Bachelor's", "Other"] as const;

/** FirstSignal's own sourcing engines, plus discovery channels — always offered, regardless of what's in the mock data. */
const coreSources = [
  "Scout",
  "Watcher",
  "YC",
  "Product Hunt",
  "Peerlist",
  "Futurepedia",
  "BetaList",
  "Hacker News",
  "X (Formerly Twitter)",
];

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
  "South Korea",
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

function isNumericFilterActive(filter: {
  operator: ScoreOperator | null;
  value: number | null;
  min: number | null;
  max: number | null;
}): boolean {
  if (filter.operator === null) return false;
  if (filter.operator === "range") return filter.min !== null || filter.max !== null;
  return filter.value !== null;
}

export function isScoreFilterActive(filter: ScoreFilter): boolean {
  return isNumericFilterActive(filter);
}

/** A generic numeric range filter (same shape as ScoreFilter), reused for fields like years of experience. */
export interface RangeFilter {
  operator: ScoreOperator | null;
  value: number | null;
  min: number | null;
  max: number | null;
}

export const emptyRangeFilter: RangeFilter = {
  operator: null,
  value: null,
  min: null,
  max: null,
};

export function isRangeFilterActive(filter: RangeFilter): boolean {
  return isNumericFilterActive(filter);
}

/** Whether a scoped list filter should match against a signal's current roles, past roles, or both. */
export type FilterScope = "current" | "past" | "both";

/** A multi-select filter (companies, job titles) that can be scoped to current/past/both roles. */
export interface ScopedListFilter {
  values: string[];
  scope: FilterScope;
}

export const emptyScopedListFilter: ScopedListFilter = { values: [], scope: "both" };

/** LinkedIn-style company headcount buckets, used as a discrete multi-select in the Companies filter. */
export const companySizeRanges = [
  { id: "1-10", label: "1-10", min: 1, max: 10 },
  { id: "11-50", label: "11-50", min: 11, max: 50 },
  { id: "51-200", label: "51-200", min: 51, max: 200 },
  { id: "201-500", label: "201-500", min: 201, max: 500 },
  { id: "501-1000", label: "501-1,000", min: 501, max: 1000 },
  { id: "1001-5000", label: "1,001-5,000", min: 1001, max: 5000 },
  { id: "5001-10000", label: "5,001-10,000", min: 5001, max: 10000 },
  { id: "10001+", label: "10,001+", min: 10001, max: null },
] as const;

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
  companies: ScopedListFilter;
  companySize: string[];
  companyFoundedYear: RangeFilter;
  companyTagline: string;
  currentJobTitles: string[];
  pastJobTitles: string[];
  seniorityLevel: string | null;
  educationLevels: string[];
  fieldOfStudy: string;
  graduationYear: RangeFilter;
  yearsOfExperience: RangeFilter;
  score: ScoreFilter;
  statuses: string[];
  assignedTo: string[];
  date: DateFilter;
}

/** A named snapshot of a filter combination, saved so it can be reapplied without reconfiguring. */
export interface SavedSearch {
  id: string;
  name: string;
  filters: SignalFilters;
}

export const emptyFilters: SignalFilters = {
  signalTypes: [],
  sources: [],
  industries: [],
  countries: [],
  locations: [],
  education: [],
  companies: emptyScopedListFilter,
  companySize: [],
  companyFoundedYear: emptyRangeFilter,
  companyTagline: "",
  currentJobTitles: [],
  pastJobTitles: [],
  seniorityLevel: null,
  educationLevels: [],
  fieldOfStudy: "",
  graduationYear: emptyRangeFilter,
  yearsOfExperience: emptyRangeFilter,
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
    (filters.companies.values.length > 0 ? 1 : 0) +
    (filters.companySize.length > 0 ? 1 : 0) +
    (isRangeFilterActive(filters.companyFoundedYear) ? 1 : 0) +
    (filters.companyTagline.trim().length > 0 ? 1 : 0) +
    (filters.currentJobTitles.length > 0 ? 1 : 0) +
    (filters.pastJobTitles.length > 0 ? 1 : 0) +
    (filters.seniorityLevel !== null ? 1 : 0) +
    (filters.educationLevels.length > 0 ? 1 : 0) +
    (filters.fieldOfStudy.trim().length > 0 ? 1 : 0) +
    (isRangeFilterActive(filters.graduationYear) ? 1 : 0) +
    (isRangeFilterActive(filters.yearsOfExperience) ? 1 : 0) +
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

/** "—" is the placeholder company for a not-currently-employed signal (e.g. "Exploring") — not a real company. */
export function signalCurrentCompanies(signal: Signal): string[] {
  return signal.current.map((entry) => entry.company).filter((c) => c && c !== "—");
}

export function signalPastCompanies(signal: Signal): string[] {
  return signal.past.map((entry) => entry.company).filter((c) => c && c !== "—");
}

export function signalCurrentTitles(signal: Signal): string[] {
  return signal.current.map((entry) => entry.role).filter(Boolean);
}

export function signalPastTitles(signal: Signal): string[] {
  return signal.past.map((entry) => entry.role).filter(Boolean);
}

/** Parsed from the "X yrs experience" fragment of contextLine — null when it can't be determined. */
export function signalYearsExperience(signal: Signal): number | null {
  const yearsText = signal.contextLine.split(" · ")[1];
  if (!yearsText) return null;
  const match = yearsText.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

/** Keyword heuristic — there's no explicit seniority field, so this is inferred from the title text. */
function classifySeniority(title: string): (typeof seniorityLevelOptions)[number] {
  const t = title.toLowerCase();
  if (/\b(founder|co-founder|ceo|cto|coo|cfo|chief|president)\b/.test(t)) return "Executive / Founder";
  if (/\b(vp|vice president|director|head of|general partner)\b/.test(t)) return "VP / Director";
  if (/\bmanager\b/.test(t)) return "Manager";
  return "Individual Contributor";
}

/** Seniority levels seen across a signal's current + past titles combined. */
export function signalSeniorityLevels(signal: Signal): string[] {
  const titles = [...signalCurrentTitles(signal), ...signalPastTitles(signal)];
  return [...new Set(titles.map(classifySeniority))];
}

/** Keyword heuristic over degree text/badge — there's no separate structured "level" field. */
function classifyEducationLevel(text: string): (typeof educationLevelOptions)[number] {
  const t = text.toLowerCase();
  if (t.includes("phd") || t.includes("doctor")) return "PhD";
  if (t.includes("master") || t.includes("mba")) return "Master's";
  if (t.includes("bachelor") || /\bb\.?tech\b/.test(t) || /\bb\.?e\.?\b/.test(t) || t.includes("undergrad")) {
    return "Bachelor's";
  }
  return "Other";
}

export function signalEducationLevels(signal: Signal): string[] {
  if (signal.profile) {
    return [...new Set(signal.profile.education.map((e) => classifyEducationLevel(e.badge ?? e.degree)))];
  }
  return [...new Set(signal.education.map((e) => classifyEducationLevel(e.role)))];
}

/** Most recent graduation year, parsed from a profile education entry's period (e.g. "Jan 2021 -
 * Dec 2023" -> 2023). Only available for signals with a full profile — "Present" (still studying)
 * and signals without profile/period data return null. */
export function signalGraduationYear(signal: Signal): number | null {
  if (!signal.profile) return null;
  const years = signal.profile.education
    .map((e) => e.period)
    .filter((p): p is string => !!p && !p.includes("Present"))
    .map((p) => {
      const match = p.match(/\d{4}(?!.*\d{4})/);
      return match ? parseInt(match[0], 10) : null;
    })
    .filter((y): y is number => y !== null);
  return years.length ? Math.max(...years) : null;
}

function parseMetaNumber(companyMeta: string[] | undefined, prefix: string): number | null {
  const entry = companyMeta?.find((m) => m.startsWith(prefix));
  if (!entry) return null;
  const digits = entry.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

/** Headcounts for a signal's companies (current + past), parsed from each rich-profile position's
 * "Headcount: N" metadata — empty when the signal has no full profile or no headcount data. */
export function signalCompanySizes(signal: Signal): number[] {
  if (!signal.profile) return [];
  return signal.profile.positions
    .map((p) => parseMetaNumber(p.companyMeta, "Headcount:"))
    .filter((n): n is number => n !== null);
}

/** Founding years for a signal's companies (current + past), parsed from "Founded: MMM YYYY" metadata. */
export function signalCompanyFoundedYears(signal: Signal): number[] {
  if (!signal.profile) return [];
  return signal.profile.positions
    .map((p) => parseMetaNumber(p.companyMeta, "Founded:"))
    .filter((n): n is number => n !== null);
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

function matchesRangeValue(value: number, filter: RangeFilter): boolean {
  switch (filter.operator) {
    case null:
      return true;
    case "gte":
      return filter.value === null || value >= filter.value;
    case "lte":
      return filter.value === null || value <= filter.value;
    case "eq":
      return filter.value === null || Math.abs(value - filter.value) < 0.05;
    case "range":
      return (
        (filter.min === null || value >= filter.min) && (filter.max === null || value <= filter.max)
      );
  }
}

function matchesRange(value: number | null, filter: RangeFilter): boolean {
  if (filter.operator === null) return true;
  if (value === null) return false;
  return matchesRangeValue(value, filter);
}

/** Like matchesRange, but for signals with multiple candidate values (e.g. several past companies'
 * headcounts) — matches if any one of them satisfies the filter. */
function matchesRangeAny(values: number[], filter: RangeFilter): boolean {
  if (filter.operator === null) return true;
  if (values.length === 0) return false;
  return values.some((v) => matchesRangeValue(v, filter));
}

function matchesTextContains(signal: Signal, query: string): boolean {
  if (!query.trim()) return true;
  if (!signal.profile) return false;
  const q = query.toLowerCase();
  return signal.profile.positions.some((p) => p.description?.toLowerCase().includes(q));
}

/** Matches a signal's degree text (e.g. "Bachelor of Science, Biotechnology") against a free-text query. */
function matchesFieldOfStudy(signal: Signal, query: string): boolean {
  if (!query.trim()) return true;
  if (!signal.profile) return false;
  const q = query.toLowerCase();
  return signal.profile.education.some((e) => e.degree.toLowerCase().includes(q));
}

/** Matches a signal's company headcounts against the selected LinkedIn-style size buckets. */
function matchesCompanySizeBuckets(sizes: number[], selectedIds: string[]): boolean {
  if (selectedIds.length === 0) return true;
  if (sizes.length === 0) return false;
  const buckets = companySizeRanges.filter((b) => selectedIds.includes(b.id));
  return sizes.some((size) => buckets.some((b) => size >= b.min && (b.max === null || size <= b.max)));
}

/** Matches a scoped multi-select filter against a signal's current and/or past values, per its scope. */
function matchesScopedList(filter: ScopedListFilter, currentValues: string[], pastValues: string[]): boolean {
  if (filter.values.length === 0) return true;
  const pool =
    filter.scope === "current"
      ? currentValues
      : filter.scope === "past"
        ? pastValues
        : [...currentValues, ...pastValues];
  return filter.values.some((v) => pool.includes(v));
}

export function signalMatchesFilters(signal: Signal, filters: SignalFilters): boolean {
  if (!matchesScore(signal.score, filters.score)) return false;
  if (!matchesAny(filters.signalTypes, signalTypeLabels(signal))) return false;
  if (!matchesAny(filters.industries, signalIndustryLabels(signal))) return false;
  if (!matchesAny(filters.countries, signalCountryLabels(signal))) return false;
  if (!matchesAny(filters.locations, [signalLocation(signal)])) return false;
  if (!matchesAny(filters.education, signalEducationLabels(signal))) return false;
  if (
    !matchesScopedList(filters.companies, signalCurrentCompanies(signal), signalPastCompanies(signal))
  ) {
    return false;
  }
  if (!matchesCompanySizeBuckets(signalCompanySizes(signal), filters.companySize)) return false;
  if (!matchesRangeAny(signalCompanyFoundedYears(signal), filters.companyFoundedYear)) return false;
  if (!matchesTextContains(signal, filters.companyTagline)) return false;
  if (!matchesAny(filters.currentJobTitles, signalCurrentTitles(signal))) return false;
  if (!matchesAny(filters.pastJobTitles, signalPastTitles(signal))) return false;
  if (filters.seniorityLevel !== null && !signalSeniorityLevels(signal).includes(filters.seniorityLevel)) {
    return false;
  }
  if (!matchesAny(filters.educationLevels, signalEducationLevels(signal))) return false;
  if (!matchesFieldOfStudy(signal, filters.fieldOfStudy)) return false;
  if (!matchesRange(signalGraduationYear(signal), filters.graduationYear)) return false;
  if (!matchesRange(signalYearsExperience(signal), filters.yearsOfExperience)) return false;
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
  const sources = new Set<string>(coreSources);
  const statuses = new Set<string>();
  const assignedTo = new Set<string>();
  const companies = new Set<string>();
  const currentJobTitles = new Set<string>();
  const pastJobTitles = new Set<string>();

  for (const signal of signals) {
    signalIndustryLabels(signal).forEach((v) => industries.add(v));
    signalCountryLabels(signal).forEach((v) => countries.add(v));
    locations.add(signalLocation(signal));
    signalEducationLabels(signal).forEach((v) => education.add(v));
    // "Sourced via [tool]" tags are provenance labels, not a filterable source — only
    // "Sourced by [person]" entries (and the core engines above) populate this filter.
    if (signal.sourcedBy) sources.add(signal.sourcedBy);
    statuses.add(signal.status);
    assignedTo.add(signalAssignedTo(signal));
    signalCurrentCompanies(signal).forEach((v) => companies.add(v));
    signalPastCompanies(signal).forEach((v) => companies.add(v));
    signalCurrentTitles(signal).forEach((v) => currentJobTitles.add(v));
    signalPastTitles(signal).forEach((v) => pastJobTitles.add(v));
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
    companies: [...companies].sort(),
    currentJobTitles: [...currentJobTitles].sort(),
    pastJobTitles: [...pastJobTitles].sort(),
  };
}
