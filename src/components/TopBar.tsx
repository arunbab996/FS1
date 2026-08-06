import {
  Bookmark,
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  Search,
  Table2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { countryFlag, countryShortName } from "../utils/flags";
import {
  activeFilterCount,
  emptyFilters,
  type SavedSearch,
  type SignalFilters,
} from "../utils/signalFilters";
import { FilterDialog, type FilterOptions } from "./FilterDialog";

export type ViewMode = "cards" | "table";
type ViewBy = "saved" | "country";
const viewByOptions: { id: ViewBy; label: string }[] = [
  { id: "saved", label: "Saved search" },
  { id: "country", label: "Country" },
];

/** Compact dropdown for switching what row 2's tabs group by. */
function ViewBySelect({ value, onChange }: { value: ViewBy; onChange: (value: ViewBy) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = viewByOptions.find((o) => o.id === value)!;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-sm font-medium whitespace-nowrap text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {current.label}
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform dark:text-neutral-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {viewByOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-sm ${
                value === option.id
                  ? "font-medium text-blue-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A trigger + popover pairing for browsing/applying/deleting saved searches. Rendered via a
 * portal into document.body — its trigger lives inside the row 2 tab strip, which is
 * horizontally scrollable, and an absolutely-positioned child there gets clipped by that
 * ancestor's overflow. Portaling escapes it and lets the panel float freely, with a small
 * pop-in animation instead of appearing instantly.
 */
function SavedSearchesMenu({
  trigger,
  savedSearches,
  onSelect,
  onDelete,
}: {
  trigger: (props: { onClick: () => void }) => ReactNode;
  savedSearches: SavedSearch[];
  onSelect: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelWidth = 264;
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 16);
    setCoords({ top: rect.bottom + 8, left: Math.max(left, 16) });
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  }

  function handleClose() {
    setVisible(false);
    window.setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        handleClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={anchorRef} className="inline-flex shrink-0">
      {trigger({ onClick: () => (open ? handleClose() : handleOpen()) })}

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: coords.top, left: coords.left, width: 264 }}
            className={`fixed z-[60] origin-top-left rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl transition-all duration-150 ease-out dark:border-neutral-700 dark:bg-neutral-800 ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-95 opacity-0"
            }`}
          >
            <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
              Saved searches
            </p>
            {savedSearches.map((search) => (
              <div key={search.id} className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(search);
                    handleClose();
                  }}
                  className="min-w-0 flex-1 cursor-pointer truncate rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  {search.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(search.id)}
                  aria-label={`Delete ${search.name}`}
                  className="shrink-0 cursor-pointer rounded-md p-1.5 text-gray-300 hover:bg-gray-100 hover:text-red-500 dark:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

function SaveSearchModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSave() {
    if (!name.trim()) return;
    onSave(name.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-neutral-900">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-50">
            Save filter as...
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">
            Saved search name
          </span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            placeholder="e.g. Hot Fintech Founders — SEA"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
          />
        </label>

        <div className="mt-5 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopBar({
  filters,
  onFiltersChange,
  filterOptions,
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  savedSearches,
  onSaveSearch,
  onDeleteSavedSearch,
  activeSavedSearchId,
  onSelectAllTab,
  onSelectSavedSearch,
}: {
  filters: SignalFilters;
  onFiltersChange: (filters: SignalFilters) => void;
  filterOptions: FilterOptions;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  savedSearches: SavedSearch[];
  onSaveSearch: (name: string) => void;
  onDeleteSavedSearch: (id: string) => void;
  activeSavedSearchId: string | null;
  onSelectAllTab: () => void;
  onSelectSavedSearch: (search: SavedSearch) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [viewBy, setViewBy] = useState<ViewBy>("saved");
  const count = activeFilterCount(filters);

  // "Active" in country mode means the filters are exactly "this one country, nothing else" —
  // mirrors how a saved-search tab is only "active" when its filters are the ones currently applied.
  const activeCountry =
    filters.countries.length === 1 &&
    filters.signalTypes.length === 0 &&
    filters.sources.length === 0 &&
    filters.industries.length === 0 &&
    filters.locations.length === 0 &&
    filters.education.length === 0 &&
    filters.statuses.length === 0 &&
    filters.assignedTo.length === 0 &&
    filters.date.preset === "All dates"
      ? filters.countries[0]
      : null;

  function selectCountryTab(country: string) {
    onFiltersChange({ ...emptyFilters, countries: [country] });
  }

  // Stay in sync when the query is cleared/changed from outside the input
  // (e.g. the empty-state "Clear search and filters" action).
  useEffect(() => {
    setSearchDraft(searchQuery);
  }, [searchQuery]);

  function runSearch() {
    onSearchQueryChange(searchDraft);
  }

  return (
    <div className="border-b border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-950">
      {/* Row 1 — search + view controls */}
      <div className="grid grid-cols-[1fr_minmax(0,56rem)_1fr] items-center gap-4 px-6 py-2.5">
        <h1 className="whitespace-nowrap text-lg font-semibold text-gray-900 dark:text-neutral-50">
          Equity Signals
        </h1>
        <div className="relative w-full min-w-0">
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

        <div className="flex min-w-max shrink-0 items-center justify-end gap-2">
          <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5 dark:border-neutral-600 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              aria-label="Card view"
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                viewMode === "cards"
                  ? "bg-gray-100 text-gray-900 dark:bg-neutral-700 dark:text-neutral-50"
                  : "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              aria-label="Table view"
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-gray-100 text-gray-900 dark:bg-neutral-700 dark:text-neutral-50"
                  : "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
            </button>
          </div>
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

          {count > 0 && (
            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300 dark:hover:bg-green-500/25"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save Filter
            </button>
          )}
        </div>
      </div>

      {/* Row 2 — view tabs */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-1.5 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={onSelectAllTab}
            className={`shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-sm font-semibold whitespace-nowrap transition-colors ${
              (viewBy === "saved" ? activeSavedSearchId === null : activeCountry === null)
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            All
          </button>

          {viewBy === "saved" ? (
            <>
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  type="button"
                  onClick={() => onSelectSavedSearch(search)}
                  className={`flex max-w-[180px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSavedSearchId === search.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{search.name}</span>
                </button>
              ))}
              {savedSearches.length > 0 ? (
                <>
                  <span className="mx-1 h-4 w-px shrink-0 bg-gray-200 dark:bg-neutral-700" />
                  <SavedSearchesMenu
                    savedSearches={savedSearches}
                    onSelect={onSelectSavedSearch}
                    onDelete={onDeleteSavedSearch}
                    trigger={({ onClick }) => (
                      <button
                        type="button"
                        onClick={onClick}
                        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      >
                        View all
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => (count > 0 ? setSaveModalOpen(true) : setDialogOpen(true))}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  Create a Saved Search
                </button>
              )}
            </>
          ) : (
            filterOptions.countries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => selectCountryTab(country)}
                title={country}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCountry === country
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {countryFlag(country) && <span className="shrink-0">{countryFlag(country)}</span>}
                {countryShortName(country)}
              </button>
            ))
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 pl-2">
          <span className="text-xs text-gray-400 dark:text-neutral-500">View by:</span>
          <ViewBySelect value={viewBy} onChange={setViewBy} />
        </div>
      </div>

      <SaveSearchModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={onSaveSearch}
      />

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
