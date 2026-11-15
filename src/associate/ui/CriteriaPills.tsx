import { criteriaFromFilters, criterionTone } from "../criteria";
import type { SearchFilters } from "../types";

/**
 * Filters shown like query-builder rows: "where [Worked at] is any of [Grab]". Read-only here;
 * edit a saved search to change them.
 */
export function CriteriaPills({ filters, compact = false }: { filters: SearchFilters; compact?: boolean }) {
  const criteria = criteriaFromFilters(filters);
  if (criteria.length === 0) return <span className="text-xs text-gray-400 dark:text-neutral-500">Ranked by meaning only</span>;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {criteria.map((c, i) => (
        <span key={c.field} className="inline-flex items-center gap-1 text-xs">
          {!compact && <span className="text-gray-400 dark:text-neutral-500">{i === 0 ? "where" : "and"}</span>}
          <span className={`rounded-md px-1.5 py-0.5 font-medium ${criterionTone[c.kind].pill}`}>{c.field}</span>
          {!compact && <span className="text-gray-400 dark:text-neutral-500">{c.operator}</span>}
          <span className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
            {c.values.join(", ")}
          </span>
        </span>
      ))}
    </div>
  );
}
