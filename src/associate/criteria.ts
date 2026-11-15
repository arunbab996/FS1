import { describeWithin } from "./agent/understand";
import type { CriterionKind } from "./agent/understand";
import type { SearchFilters } from "./types";

/** One filter, phrased like a query builder row: where [field] [operator] [values]. */
export interface Criterion {
  kind: CriterionKind;
  field: string;
  operator: string;
  values: string[];
}

/** Turns structured filters into readable criteria, in a stable order. */
export function criteriaFromFilters(f: SearchFilters): Criterion[] {
  const out: Criterion[] = [];
  if (f.pastCompanies?.length) out.push({ kind: "company", field: "Worked at", operator: "is any of", values: f.pastCompanies });
  if (f.backgrounds?.length) out.push({ kind: "background", field: "Background", operator: "is any of", values: f.backgrounds });
  if (f.repeatFounder) out.push({ kind: "founder", field: "Founder history", operator: "is", values: ["Repeat founder"] });
  if (f.signalTypes?.length) out.push({ kind: "signal", field: "Signal", operator: "is any of", values: f.signalTypes });
  if (f.withinDays) out.push({ kind: "time", field: "Signal date", operator: "within", values: [describeWithin(f.withinDays)] });
  if (f.sectors?.length) out.push({ kind: "sector", field: "Building in", operator: "is any of", values: f.sectors });
  if (f.countries?.length) out.push({ kind: "location", field: "Based in", operator: "is any of", values: f.countries.length > 4 ? [`${f.countries.length} countries`] : f.countries });
  return out;
}

/** Pastel pill colours per criterion kind, echoing a query-builder look. */
export const criterionTone: Record<CriterionKind, { pill: string; mark: string }> = {
  company: { pill: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300", mark: "bg-indigo-100/80 text-indigo-900 ring-indigo-200 dark:bg-indigo-500/25 dark:text-indigo-100 dark:ring-indigo-400/30" },
  background: { pill: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300", mark: "bg-pink-100/80 text-pink-900 ring-pink-200 dark:bg-pink-500/25 dark:text-pink-100 dark:ring-pink-400/30" },
  founder: { pill: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", mark: "bg-amber-100/80 text-amber-900 ring-amber-200 dark:bg-amber-500/25 dark:text-amber-100 dark:ring-amber-400/30" },
  signal: { pill: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300", mark: "bg-violet-100/80 text-violet-900 ring-violet-200 dark:bg-violet-500/25 dark:text-violet-100 dark:ring-violet-400/30" },
  time: { pill: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300", mark: "bg-orange-100/80 text-orange-900 ring-orange-200 dark:bg-orange-500/25 dark:text-orange-100 dark:ring-orange-400/30" },
  sector: { pill: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", mark: "bg-sky-100/80 text-sky-900 ring-sky-200 dark:bg-sky-500/25 dark:text-sky-100 dark:ring-sky-400/30" },
  location: { pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", mark: "bg-emerald-100/80 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/25 dark:text-emerald-100 dark:ring-emerald-400/30" },
};
