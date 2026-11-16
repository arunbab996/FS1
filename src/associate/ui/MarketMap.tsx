import { ChevronRight, LayoutGrid } from "lucide-react";
import { AGENT_NAME } from "../brand";
import type { MarketMap as MarketMapData } from "../tools";
import type { SearchFilters } from "../types";
import { CriteriaPills } from "./CriteriaPills";
import { useOpenProfile } from "./context";

const TILE_COLOURS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

function colourFor(name: string): string {
  const hash = [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return TILE_COLOURS[hash % TILE_COLOURS.length];
}

/**
 * A market map: one box per sector (or country), each holding its startups as tiles. Named
 * companies are solid; stealth founders are dashed. Clicking a tile opens the founder.
 */
export function MarketMap({ title, map, filters }: { title: string; map: MarketMapData; filters: SearchFilters }) {
  const openProfile = useOpenProfile();
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="flex min-w-0 items-center gap-1.5 text-gray-500 dark:text-neutral-400">
            <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
            <span>{AGENT_NAME} market map</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium text-gray-900 dark:text-neutral-100">{title}</span>
          </p>
          <p className="text-gray-500 dark:text-neutral-400">
            {map.total} startups · by {map.groupBy}
          </p>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <CriteriaPills filters={filters} />
          <span className="flex items-center gap-3 text-xs text-gray-400 dark:text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded border border-gray-300 bg-white dark:border-neutral-600 dark:bg-neutral-800" /> Named company
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded border border-dashed border-gray-400" /> Stealth
            </span>
          </span>
        </div>
      </div>
      <div className="grid gap-3 bg-gray-50/70 p-3 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))] dark:bg-neutral-950/40">
        {map.groups.map((group) => (
          <section key={group.label} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-2.5 flex items-baseline justify-between gap-2">
              <h4 className="truncate text-xs font-semibold tracking-wide text-gray-900 uppercase dark:text-neutral-100">{group.label}</h4>
              <span className="text-xs text-gray-400 dark:text-neutral-500">{group.companies.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.companies.map((c) => (
                <button
                  key={`${group.label}-${c.personId}`}
                  type="button"
                  onClick={() => openProfile(c.personId)}
                  title={`${c.stealth ? `${c.founder} (stealth)` : `${c.company} · founded by ${c.founder}`} · ${c.city}, ${c.country} · ${c.signalType}`}
                  className={`inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs text-gray-800 hover:border-gray-400 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800 ${
                    c.stealth ? "border border-dashed border-gray-300 dark:border-neutral-600" : "border border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold ${c.stealth ? "bg-gray-100 text-gray-500 dark:bg-neutral-800" : colourFor(c.company)}`}>
                    {(c.stealth ? c.founder : c.company).charAt(0)}
                  </span>
                  <span className="truncate">{c.stealth ? c.founder : c.company}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
