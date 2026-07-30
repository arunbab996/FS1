import { ListFilter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { activeFilterCount, type SignalFilters } from "../utils/signalFilters";
import { FilterDialog, type FilterOptions } from "./FilterDialog";

export function TopBar({
  filters,
  onFiltersChange,
  filterOptions,
  searchQuery,
  onSearchQueryChange,
}: {
  filters: SignalFilters;
  onFiltersChange: (filters: SignalFilters) => void;
  filterOptions: FilterOptions;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const count = activeFilterCount(filters);

  // Stay in sync when the query is cleared/changed from outside the input
  // (e.g. the empty-state "Clear search and filters" action).
  useEffect(() => {
    setSearchDraft(searchQuery);
  }, [searchQuery]);

  function runSearch() {
    onSearchQueryChange(searchDraft);
  }

  return (
    <div className="grid grid-cols-[1fr_minmax(0,56rem)_1fr] items-center gap-4 border-b border-gray-200 bg-white px-6 py-2.5 dark:border-neutral-700 dark:bg-neutral-950">
      <div className="flex items-center gap-5 overflow-x-auto">
        <span className="shrink-0 border-b-2 border-blue-600 py-1 text-sm font-semibold whitespace-nowrap text-gray-900 dark:border-blue-500 dark:text-neutral-50">
          All
        </span>
      </div>

      <div className="relative w-full">
        <button
          type="button"
          onClick={runSearch}
          aria-label="Search"
          className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        <input
          type="text"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          placeholder="Search in All Signals..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
        />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium transition-colors ${
            count > 0
              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          }`}
        >
          <ListFilter className="h-3.5 w-3.5" />
          Filters
          {count > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white dark:bg-blue-500">
              {count}
            </span>
          )}
        </button>
      </div>

      <FilterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        options={filterOptions}
      />
    </div>
  );
}
