import {
  Activity,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gauge,
  GraduationCap,
  Globe,
  History,
  MapPin,
  Plus,
  Radio,
  Search,
  Settings2,
  Tags,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { companyLogoUrl } from "../utils/avatars";
import {
  datePresets,
  educationLevelOptions,
  emptyFilters,
  emptyRangeFilter,
  emptyScoreFilter,
  isRangeFilterActive,
  isScoreFilterActive,
  scoreMax,
  scoreMin,
  scoreOperatorLabels,
  scoreOperators,
  seniorityLevelOptions,
  toISODate,
  type DateFilter,
  type FilterScope,
  type RangeFilter,
  type ScoreFilter,
  type ScoreOperator,
  type SignalFilters,
} from "../utils/signalFilters";

type CategoryId =
  | "signalTypes"
  | "sources"
  | "industries"
  | "companies"
  | "experience"
  | "countries"
  | "locations"
  | "education"
  | "score"
  | "statuses"
  | "assignedTo"
  | "date";

interface Category {
  id: CategoryId;
  label: string;
  icon: typeof Tags;
  searchable?: boolean;
}

const categories: Category[] = [
  { id: "signalTypes", label: "Signal Type", icon: Tags, searchable: true },
  { id: "sources", label: "Signal Source", icon: Radio },
  { id: "industries", label: "Industry", icon: Briefcase },
  { id: "companies", label: "Companies", icon: Building2, searchable: true },
  { id: "experience", label: "Experience", icon: History },
  { id: "countries", label: "Country", icon: Globe, searchable: true },
  { id: "locations", label: "Location", icon: MapPin, searchable: true },
  { id: "education", label: "Education", icon: GraduationCap, searchable: true },
  { id: "score", label: "Signal Score", icon: Gauge },
  { id: "statuses", label: "Signal Status", icon: Activity },
  { id: "assignedTo", label: "Assigned to", icon: UserCheck },
  { id: "date", label: "Signal Date", icon: Calendar },
];

type MultiCategoryId = Exclude<CategoryId, "score" | "date" | "companies" | "experience">;

export interface FilterOptions {
  signalTypes: string[];
  sources: string[];
  industries: string[];
  countries: string[];
  locations: string[];
  education: string[];
  statuses: string[];
  assignedTo: string[];
  companies: string[];
  currentJobTitles: string[];
  pastJobTitles: string[];
}

function categoryCount(id: CategoryId, filters: SignalFilters): number {
  if (id === "score") return isScoreFilterActive(filters.score) ? 1 : 0;
  if (id === "companies") {
    return (
      filters.companies.values.length +
      (isRangeFilterActive(filters.companySize) ? 1 : 0) +
      (isRangeFilterActive(filters.companyFoundedYear) ? 1 : 0) +
      (filters.companyTagline.trim().length > 0 ? 1 : 0)
    );
  }
  if (id === "experience") {
    return (
      filters.currentJobTitles.length +
      filters.pastJobTitles.length +
      filters.seniorityLevels.length +
      (isRangeFilterActive(filters.yearsOfExperience) ? 1 : 0)
    );
  }
  if (id === "education") {
    return (
      filters.education.length +
      filters.educationLevels.length +
      (isRangeFilterActive(filters.graduationYear) ? 1 : 0)
    );
  }
  if (id === "date") return filters.date.preset !== "All dates" ? 1 : 0;
  return filters[id].length;
}

function getCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  let trailing = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, trailing), inMonth: false });
    trailing += 1;
  }
  return cells;
}

const weekdayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function CheckboxList({
  values,
  selected,
  onToggle,
  searchable,
  searchLabel,
  search = "",
  onSearchChange,
}: {
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
  searchLabel?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const filtered = searchable
    ? values.filter((v) => v.toLowerCase().includes(search.toLowerCase()))
    : values;

  return (
    <div className="flex flex-col gap-2">
      {searchable && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={`Search ${(searchLabel ?? "").toLowerCase()}...`}
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-2.5 pl-8 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          />
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="px-1 py-2 text-sm text-gray-400 dark:text-neutral-500">
          {values.length === 0 ? "No options available." : "No matches."}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {filtered.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 hover:bg-white dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onToggle(value)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600"
              />
              {value}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/** Type-ahead search: no persistent option list, just a dropdown of matches as you type, plus
 * selected values shown as removable chips above the input. */
function SearchSelect({
  values,
  selected,
  onToggle,
  placeholder,
  renderIcon,
}: {
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder: string;
  renderIcon?: (value: string) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matches = query.trim()
    ? values
        .filter((v) => v.toLowerCase().includes(query.toLowerCase()) && !selected.includes(v))
        .slice(0, 8)
    : [];

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <span
              key={value}
              className="flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pr-2 pl-1.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
            >
              {renderIcon?.(value)}
              {value}
              <button
                type="button"
                onClick={() => onToggle(value)}
                aria-label={`Remove ${value}`}
                className="cursor-pointer text-blue-400 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative" ref={containerRef}>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-2.5 pl-8 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-500"
        />
        {open && query.trim() && (
          <div className="absolute top-full left-0 z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {matches.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400 dark:text-neutral-500">No matches.</p>
            ) : (
              matches.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    onToggle(value);
                    setQuery("");
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  {renderIcon?.(value)}
                  {value}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const scopeOptions: { id: FilterScope; label: string }[] = [
  { id: "current", label: "Current" },
  { id: "past", label: "Past" },
  { id: "both", label: "Current + Past" },
];

/** Segmented control for whether a scoped list filter matches current roles, past roles, or both. */
function ScopeToggle({
  scope,
  onChange,
}: {
  scope: FilterScope;
  onChange: (scope: FilterScope) => void;
}) {
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-gray-200 p-0.5 dark:border-neutral-700">
      {scopeOptions.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
            scope === opt.id
              ? "bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Generic operator + value(s) numeric filter panel — same shape as ScorePanel, reused for fields like years of experience. */
function RangePanel({
  filter,
  onChange,
  min,
  max,
  step,
  anyLabel,
  valueLabel,
  helpText,
}: {
  filter: RangeFilter;
  onChange: (filter: RangeFilter) => void;
  min: number;
  max: number;
  step: number;
  anyLabel: string;
  valueLabel: string;
  helpText: string;
}) {
  function selectOperator(value: string) {
    if (value === "any") {
      onChange(emptyRangeFilter);
    } else {
      onChange({ ...emptyRangeFilter, operator: value as ScoreOperator });
    }
  }

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Condition</span>
        <select
          value={filter.operator ?? "any"}
          onChange={(e) => selectOperator(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="any">{anyLabel}</option>
          {scoreOperators.map((op) => (
            <option key={op} value={op}>
              {scoreOperatorLabels[op]}
            </option>
          ))}
        </select>
      </label>

      {filter.operator && filter.operator !== "range" && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">{valueLabel}</span>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            placeholder="e.g. 5"
            value={filter.value ?? ""}
            onChange={(e) =>
              onChange({ ...filter, value: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="w-32 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
          />
        </label>
      )}

      {filter.operator === "range" && (
        <div className="flex items-center gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Min</span>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              placeholder={String(min)}
              value={filter.min ?? ""}
              onChange={(e) =>
                onChange({ ...filter, min: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
            />
          </label>
          <span className="mt-5 text-gray-300 dark:text-neutral-600">–</span>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Max</span>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              placeholder={String(max)}
              value={filter.max ?? ""}
              onChange={(e) =>
                onChange({ ...filter, max: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-neutral-500">{helpText}</p>
    </div>
  );
}

export function FilterDialog({
  open,
  onClose,
  filters,
  onFiltersChange,
  options,
}: {
  open: boolean;
  onClose: () => void;
  filters: SignalFilters;
  onFiltersChange: (filters: SignalFilters) => void;
  options: FilterOptions;
}) {
  const [draft, setDraft] = useState<SignalFilters>(filters);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("signalTypes");
  const [search, setSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Re-sync the working draft from the last-applied filters every time the dialog opens,
  // so edits made without hitting Apply are discarded rather than lingering.
  useEffect(() => {
    if (open) setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setSearch("");
  }, [activeCategory]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const activeMeta = categories.find((c) => c.id === activeCategory)!;

  if (!open) return null;

  function toggleValue(id: MultiCategoryId, value: string) {
    const current = draft[id];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setDraft({ ...draft, [id]: next });
  }

  function toggleScopedValue(id: "companies", value: string) {
    const current = draft[id];
    const nextValues = current.values.includes(value)
      ? current.values.filter((v) => v !== value)
      : [...current.values, value];
    setDraft({ ...draft, [id]: { ...current, values: nextValues } });
  }

  function toggleListValue(
    id: "currentJobTitles" | "pastJobTitles" | "seniorityLevels" | "educationLevels",
    value: string,
  ) {
    const current = draft[id];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setDraft({ ...draft, [id]: next });
  }

  const totalActive = categories.reduce(
    (sum, c) => sum + (categoryCount(c.id, draft) > 0 ? 1 : 0),
    0,
  );

  function handleApply() {
    onFiltersChange(draft);
    onClose();
  }

  function renderOptionList(id: MultiCategoryId, values: string[]) {
    return (
      <CheckboxList
        values={values}
        selected={draft[id]}
        onToggle={(value) => toggleValue(id, value)}
        searchable={activeMeta.searchable}
        searchLabel={activeMeta.label}
        search={search}
        onSearchChange={setSearch}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[min(640px,85vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-50">
            All Filters
            {totalActive > 0 && (
              <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {totalActive} active
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex w-52 shrink-0 flex-col gap-0.5 overflow-y-auto bg-white p-2 dark:bg-neutral-900">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCount(cat.id, draft);
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                  {count > 0 && (
                    <span
                      className={`flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                        active
                          ? "bg-blue-600 text-white dark:bg-blue-500"
                          : "bg-gray-200 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-black/20">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-50">
              {activeMeta.label}
            </h3>

            {activeCategory === "signalTypes" && renderOptionList("signalTypes", options.signalTypes)}
            {activeCategory === "sources" && renderOptionList("sources", options.sources)}
            {activeCategory === "industries" && renderOptionList("industries", options.industries)}
            {activeCategory === "countries" && renderOptionList("countries", options.countries)}
            {activeCategory === "locations" && renderOptionList("locations", options.locations)}
            {activeCategory === "education" && (
              <div className="flex flex-col gap-6">
                <div>
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    School
                  </span>
                  <SearchSelect
                    values={options.education}
                    selected={draft.education}
                    onToggle={(value) => toggleValue("education", value)}
                    placeholder="Search schools..."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Education level
                  </span>
                  <CheckboxList
                    values={[...educationLevelOptions]}
                    selected={draft.educationLevels}
                    onToggle={(value) => toggleListValue("educationLevels", value)}
                  />
                  <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
                    Inferred from each signal's degree text — not an explicit data field.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-3 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Graduation year
                  </span>
                  <RangePanel
                    filter={draft.graduationYear}
                    onChange={(graduationYear) => setDraft({ ...draft, graduationYear })}
                    min={1970}
                    max={2030}
                    step={1}
                    anyLabel="Any year"
                    valueLabel="Year"
                    helpText="Only available for signals with detailed profile data and a completed (non-ongoing) degree."
                  />
                </div>
              </div>
            )}
            {activeCategory === "statuses" && renderOptionList("statuses", options.statuses)}
            {activeCategory === "assignedTo" && renderOptionList("assignedTo", options.assignedTo)}

            {activeCategory === "companies" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Where</span>
                  <ScopeToggle
                    scope={draft.companies.scope}
                    onChange={(scope) =>
                      setDraft({ ...draft, companies: { ...draft.companies, scope } })
                    }
                  />
                </div>
                <SearchSelect
                  values={options.companies}
                  selected={draft.companies.values}
                  onToggle={(value) => toggleScopedValue("companies", value)}
                  placeholder="Search companies..."
                  renderIcon={(value) => (
                    <img
                      src={companyLogoUrl(value)}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded object-cover"
                    />
                  )}
                />

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Company industry
                  </span>
                  <SearchSelect
                    values={options.industries}
                    selected={draft.industries}
                    onToggle={(value) => toggleValue("industries", value)}
                    placeholder="Search industries..."
                  />
                  <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
                    Same list as the Industry filter — applies to each signal overall, not scoped by
                    company history.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-3 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Company size (current + past, headcount)
                  </span>
                  <RangePanel
                    filter={draft.companySize}
                    onChange={(companySize) => setDraft({ ...draft, companySize })}
                    min={0}
                    max={1000000}
                    step={1}
                    anyLabel="Any size"
                    valueLabel="Headcount"
                    helpText="Only available for signals with detailed profile data — most of the mock dataset doesn't have a headcount on file."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-3 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Company founded date (year, current + past)
                  </span>
                  <RangePanel
                    filter={draft.companyFoundedYear}
                    onChange={(companyFoundedYear) => setDraft({ ...draft, companyFoundedYear })}
                    min={1900}
                    max={2030}
                    step={1}
                    anyLabel="Any founding year"
                    valueLabel="Year"
                    helpText="Only available for signals with detailed profile data."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Company tagline
                  </span>
                  <input
                    type="text"
                    value={draft.companyTagline}
                    onChange={(e) => setDraft({ ...draft, companyTagline: e.target.value })}
                    placeholder="e.g. AI-powered analytics, Fintech for SMBs..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
                  />
                  <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
                    We don't have a dedicated tagline field, so this searches each company's
                    description text — only populated for signals with detailed profile data.
                  </p>
                </div>
              </div>
            )}

            {activeCategory === "experience" && (
              <div className="flex flex-col gap-6">
                <div>
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Current job title
                  </span>
                  <SearchSelect
                    values={options.currentJobTitles}
                    selected={draft.currentJobTitles}
                    onToggle={(value) => toggleListValue("currentJobTitles", value)}
                    placeholder="Search current job titles..."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Past job title
                  </span>
                  <SearchSelect
                    values={options.pastJobTitles}
                    selected={draft.pastJobTitles}
                    onToggle={(value) => toggleListValue("pastJobTitles", value)}
                    placeholder="Search past job titles..."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Seniority level
                  </span>
                  <CheckboxList
                    values={[...seniorityLevelOptions]}
                    selected={draft.seniorityLevels}
                    onToggle={(value) => toggleListValue("seniorityLevels", value)}
                  />
                  <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
                    Inferred from job title keywords — not an explicit data field.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
                  <span className="mb-3 block text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Years of experience
                  </span>
                  <RangePanel
                    filter={draft.yearsOfExperience}
                    onChange={(yearsOfExperience) => setDraft({ ...draft, yearsOfExperience })}
                    min={0}
                    max={50}
                    step={0.5}
                    anyLabel="Any experience"
                    valueLabel="Years"
                    helpText="Based on each signal's total years of experience."
                  />
                </div>
              </div>
            )}

            {activeCategory === "score" && (
              <ScorePanel
                score={draft.score}
                onChange={(score) => setDraft({ ...draft, score })}
              />
            )}

            {activeCategory === "date" && (
              <DatePanel
                date={draft.date}
                onChange={(date) => setDraft({ ...draft, date })}
                calendarMonth={calendarMonth}
                onCalendarMonthChange={setCalendarMonth}
              />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setDraft(emptyFilters)}
            disabled={totalActive === 0}
            className="cursor-pointer text-sm font-medium text-rose-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-400 dark:hover:text-rose-300"
          >
            Clear all filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            Apply
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-gray-100 bg-gray-50 px-5 py-2 dark:border-neutral-800 dark:bg-black/20">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Signal
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Manage Sources
          </button>
        </div>
      </div>
    </div>
  );
}

function ScorePanel({
  score,
  onChange,
}: {
  score: ScoreFilter;
  onChange: (score: ScoreFilter) => void;
}) {
  function selectOperator(value: string) {
    if (value === "any") {
      onChange(emptyScoreFilter);
    } else {
      onChange({ ...emptyScoreFilter, operator: value as ScoreOperator });
    }
  }

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Condition</span>
        <select
          value={score.operator ?? "any"}
          onChange={(e) => selectOperator(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="any">Any score</option>
          {scoreOperators.map((op) => (
            <option key={op} value={op}>
              {scoreOperatorLabels[op]}
            </option>
          ))}
        </select>
      </label>

      {score.operator && score.operator !== "range" && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Score value</span>
          <input
            type="number"
            min={scoreMin}
            max={scoreMax}
            step={0.1}
            placeholder="e.g. 7.5"
            value={score.value ?? ""}
            onChange={(e) =>
              onChange({ ...score, value: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="w-32 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
          />
        </label>
      )}

      {score.operator === "range" && (
        <div className="flex items-center gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Min</span>
            <input
              type="number"
              min={scoreMin}
              max={scoreMax}
              step={0.1}
              placeholder="0"
              value={score.min ?? ""}
              onChange={(e) =>
                onChange({ ...score, min: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
            />
          </label>
          <span className="mt-5 text-gray-300 dark:text-neutral-600">–</span>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Max</span>
            <input
              type="number"
              min={scoreMin}
              max={scoreMax}
              step={0.1}
              placeholder="10"
              value={score.max ?? ""}
              onChange={(e) =>
                onChange({ ...score, max: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-neutral-500">Signals are scored 0–10.</p>
    </div>
  );
}

function DatePanel({
  date,
  onChange,
  calendarMonth,
  onCalendarMonthChange,
}: {
  date: DateFilter;
  onChange: (date: DateFilter) => void;
  calendarMonth: Date;
  onCalendarMonthChange: (date: Date) => void;
}) {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const cells = useMemo(() => getCalendarCells(calendarMonth), [calendarMonth]);

  function selectPreset(preset: (typeof datePresets)[number]) {
    if (preset === "Custom date") {
      onChange({
        preset,
        customStart: date.customStart ?? todayISO,
        customEnd: date.customEnd ?? todayISO,
      });
    } else {
      onChange({ preset });
    }
  }

  function handleDayClick(day: Date) {
    const iso = toISODate(day);
    const { customStart, customEnd } = date;
    if (!customStart || (customStart && customEnd)) {
      onChange({ preset: "Custom date", customStart: iso, customEnd: undefined });
    } else if (iso < customStart) {
      onChange({ preset: "Custom date", customStart: iso, customEnd: undefined });
    } else {
      onChange({ preset: "Custom date", customStart, customEnd: iso });
    }
  }

  function changeMonth(delta: number) {
    onCalendarMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1));
  }

  const monthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex gap-5">
      <div className="flex w-40 shrink-0 flex-col gap-0.5">
        {datePresets.map((preset) => (
          <label
            key={preset}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 hover:bg-white dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <input
              type="radio"
              name="date-preset"
              checked={date.preset === preset}
              onChange={() => selectPreset(preset)}
              className="h-3.5 w-3.5 cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600"
            />
            {preset}
          </label>
        ))}
      </div>

      {date.preset === "Custom date" && (
        <div className="min-w-0 flex-1 border-l border-gray-200 pl-5 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date.customStart ?? ""}
              onChange={(e) => onChange({ ...date, customStart: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <span className="shrink-0 text-gray-300 dark:text-neutral-600">–</span>
            <input
              type="date"
              value={date.customEnd ?? ""}
              onChange={(e) => onChange({ ...date, customEnd: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
            {weekdayLabels.map((w) => (
              <span key={w} className="text-[11px] font-medium text-gray-400 dark:text-neutral-500">
                {w}
              </span>
            ))}
            {cells.map(({ date: cellDate, inMonth }, i) => {
              const iso = toISODate(cellDate);
              const isStart = iso === date.customStart;
              const isEnd = iso === date.customEnd;
              const inRange =
                date.customStart &&
                date.customEnd &&
                iso > date.customStart &&
                iso < date.customEnd;
              const isToday = iso === todayISO;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => handleDayClick(cellDate)}
                  className={`mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-sm transition-colors disabled:cursor-default disabled:text-gray-300 dark:disabled:text-neutral-700 ${
                    isStart || isEnd
                      ? "bg-gray-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : inRange
                        ? "bg-blue-100 text-gray-700 dark:bg-blue-500/20 dark:text-neutral-200"
                        : isToday
                          ? "font-semibold text-blue-600 dark:text-blue-400"
                          : inMonth
                            ? "text-gray-700 hover:bg-white dark:text-neutral-200 dark:hover:bg-neutral-800"
                            : "text-gray-300 dark:text-neutral-700"
                  }`}
                >
                  {cellDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
