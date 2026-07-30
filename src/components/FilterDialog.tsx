import {
  Activity,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gauge,
  GraduationCap,
  Globe,
  MapPin,
  Plus,
  Radio,
  Search,
  Settings2,
  Tags,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  datePresets,
  emptyFilters,
  emptyScoreFilter,
  isScoreFilterActive,
  scoreMax,
  scoreMin,
  scoreOperatorLabels,
  scoreOperators,
  toISODate,
  type DateFilter,
  type ScoreFilter,
  type ScoreOperator,
  type SignalFilters,
} from "../utils/signalFilters";

type CategoryId =
  | "signalTypes"
  | "sources"
  | "industries"
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
  { id: "signalTypes", label: "Signal Type", icon: Tags },
  { id: "sources", label: "Signal Source", icon: Radio },
  { id: "industries", label: "Industry", icon: Briefcase },
  { id: "countries", label: "Country", icon: Globe, searchable: true },
  { id: "locations", label: "Location", icon: MapPin, searchable: true },
  { id: "education", label: "Education", icon: GraduationCap, searchable: true },
  { id: "score", label: "Signal Score", icon: Gauge },
  { id: "statuses", label: "Signal Status", icon: Activity },
  { id: "assignedTo", label: "Assigned to", icon: UserCheck },
  { id: "date", label: "Signal Date", icon: Calendar },
];

type MultiCategoryId = Exclude<CategoryId, "score" | "date">;

export interface FilterOptions {
  signalTypes: string[];
  sources: string[];
  industries: string[];
  countries: string[];
  locations: string[];
  education: string[];
  statuses: string[];
  assignedTo: string[];
}

function categoryCount(id: CategoryId, filters: SignalFilters): number {
  if (id === "score") return isScoreFilterActive(filters.score) ? 1 : 0;
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

  const totalActive = categories.reduce((sum, c) => sum + categoryCount(c.id, draft), 0);

  function handleApply() {
    onFiltersChange(draft);
    onClose();
  }

  function renderOptionList(id: MultiCategoryId, values: string[]) {
    const filtered = activeMeta.searchable
      ? values.filter((v) => v.toLowerCase().includes(search.toLowerCase()))
      : values;

    return (
      <div className="flex flex-col gap-2">
        {activeMeta.searchable && (
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeMeta.label.toLowerCase()}...`}
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
                  checked={draft[id].includes(value)}
                  onChange={() => toggleValue(id, value)}
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[min(640px,85vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
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
            {activeCategory === "education" && renderOptionList("education", options.education)}
            {activeCategory === "statuses" && renderOptionList("statuses", options.statuses)}
            {activeCategory === "assignedTo" && renderOptionList("assignedTo", options.assignedTo)}

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
