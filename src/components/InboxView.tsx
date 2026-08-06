import {
  ArrowRight,
  ChevronDown,
  CircleCheck,
  Info,
  PartyPopper,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InvestorProfile } from "../data/inboxInvestor";
import type { Signal } from "../types";
import { personPhotoUrl } from "../utils/avatars";
import { countryFlag } from "../utils/flags";
import { scoreTextClasses } from "../utils/score";
import {
  signalDate,
  signalLocation,
  signalMatchesFilters,
  signalMatchesSearch,
  type SavedSearch,
} from "../utils/signalFilters";
import { signalStatusPillClasses } from "../utils/signalStatus";
import { tagColorClasses, tagIcon } from "../utils/tags";
import { extractPersonName } from "../utils/text";
import { Highlight } from "./Highlight";
import { HoverPopup } from "./HoverPopup";
import { ProfileDrawer } from "./ProfileDrawer";
import { SignalScreenStatus } from "./SignalScreenStatus";

type Tab = "all" | "thesis" | "saved";
type SortBy = "fit" | "newest";

function dedupeById(signals: Signal[]): Signal[] {
  const seen = new Set<string>();
  const result: Signal[] = [];
  for (const signal of signals) {
    if (seen.has(signal.id)) continue;
    seen.add(signal.id);
    result.push(signal);
  }
  return result;
}

function ThesisCard({ investor }: { investor: InvestorProfile }) {
  return (
    <>
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        {investor.name}&rsquo;s thesis
      </p>
      <p className="mt-1.5 text-sm text-gray-700 dark:text-neutral-200">{investor.thesisSummary}</p>
      {investor.filters.countries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {investor.filters.countries.map((label) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
            >
              {countryFlag(label) && <span>{countryFlag(label)}</span>}
              {label}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value)!;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gray-100 px-3.5 py-2 text-xs font-medium whitespace-nowrap text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        {current.label}
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform dark:text-neutral-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-1.5 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center truncate px-3 py-1.5 text-left text-sm ${
                value === option.value
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

function InboxRow({
  signal,
  selected,
  checked,
  delayMs,
  onToggleSelect,
  onOpen,
  onScreen,
}: {
  signal: Signal;
  selected: boolean;
  checked: boolean;
  delayMs: number;
  onToggleSelect: () => void;
  onOpen: () => void;
  onScreen: () => void;
}) {
  const name = signal.personName ?? extractPersonName(signal.headline);
  const location = signalLocation(signal);
  const country = location.split(", ").pop() ?? "";
  const flag = countryFlag(country);
  const topReason = signal.reasoning.positives[0];
  const dateLabel = signal.dateGroup.split(" · ")[0];
  const hasInvestorInterest = Boolean(signal.investorInterest);
  const visibleTags = signal.tags.slice(0, 2);
  const extraTagCount = signal.tags.length - visibleTags.length;

  function handleRowClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, input")) return;
    onOpen();
  }

  return (
    <div
      onClick={handleRowClick}
      style={{ animationDelay: `${delayMs}ms` }}
      className={`animate-inbox-row-in group flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3.5 py-4 transition-[box-shadow,border-color] dark:bg-neutral-900 ${
        selected
          ? "border-blue-300 shadow-sm dark:border-blue-500/40"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-neutral-700 dark:hover:border-neutral-600"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggleSelect}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
      />

      <Star
        className={`h-4 w-4 shrink-0 ${
          hasInvestorInterest ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-neutral-600"
        }`}
      />

      <img
        src={signal.photoUrl ?? personPhotoUrl(signal.id)}
        alt={signal.avatarInitials}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-gray-100 dark:ring-neutral-800"
      />

      <div className="w-36 shrink-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-neutral-50">{name}</p>
        <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-neutral-500">
          {dateLabel} ·{" "}
          <span className={`font-semibold ${scoreTextClasses(signal.score)}`}>
            {signal.score.toFixed(1)}
          </span>
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-neutral-200">
          <Highlight text={signal.headline} />
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-xs text-gray-500 dark:text-neutral-400">
            {flag && <span>{flag}</span>}
            <span className="truncate">{topReason ?? location}</span>
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {visibleTags.map((tag) => {
              const Icon = tagIcon(tag);
              return (
                <span
                  key={tag.label}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${tagColorClasses(tag.category)}`}
                >
                  {Icon && <Icon className="h-2.5 w-2.5" />}
                  {tag.label}
                </span>
              );
            })}
            {extraTagCount > 0 && (
              <span className="text-[11px] font-medium text-gray-400 dark:text-neutral-500">
                +{extraTagCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-1">
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <SignalScreenStatus signal={signal} onScreen={onScreen} />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${signalStatusPillClasses(signal.status)}`}
        >
          {signal.status}
        </span>
      </div>
    </div>
  );
}

export function InboxView({
  investor,
  signals,
  savedSearches,
  onReviewSavedSearch,
  onGoToEquitySignals,
}: {
  investor: InvestorProfile;
  signals: Signal[];
  savedSearches: SavedSearch[];
  onReviewSavedSearch: (search: SavedSearch) => void;
  onGoToEquitySignals: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [sortBy, setSortBy] = useState<SortBy>("fit");
  const [savedSearchFilter, setSavedSearchFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [screenedIds, setScreenedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function isUnscreened(signal: Signal): boolean {
    return (signal.viewedBy?.length ?? 0) === 0 && !screenedIds.has(signal.id);
  }

  function screenIds(ids: string[]) {
    setScreenedIds((prev) => new Set([...prev, ...ids]));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const thesisMatches = useMemo(
    () => signals.filter((s) => signalMatchesFilters(s, investor.filters) && isUnscreened(s)),
    [signals, investor, screenedIds],
  );

  const savedSearchSections = useMemo(
    () =>
      savedSearches.map((search) => ({
        search,
        matches: signals.filter((s) => signalMatchesFilters(s, search.filters) && isUnscreened(s)),
      })),
    [signals, savedSearches, screenedIds],
  );
  const allSavedMatches = useMemo(
    () => dedupeById(savedSearchSections.flatMap((s) => s.matches)),
    [savedSearchSections],
  );
  const allMatches = useMemo(
    () => dedupeById([...thesisMatches, ...allSavedMatches]),
    [thesisMatches, allSavedMatches],
  );

  const selectedSearch = savedSearches.find((s) => s.id === savedSearchFilter);
  const savedTabMatches =
    savedSearchFilter === "all"
      ? allSavedMatches
      : (savedSearchSections.find((s) => s.search.id === savedSearchFilter)?.matches ?? []);

  const listForTab = tab === "all" ? allMatches : tab === "thesis" ? thesisMatches : savedTabMatches;
  const sorted = useMemo(() => {
    const copy = [...listForTab];
    copy.sort((a, b) =>
      sortBy === "fit" ? b.score - a.score : signalDate(b).getTime() - signalDate(a).getTime(),
    );
    return copy;
  }, [listForTab, sortBy]);
  const visible = useMemo(
    () => sorted.filter((s) => signalMatchesSearch(s, query)),
    [sorted, query],
  );
  const allVisibleSelected = visible.length > 0 && visible.every((s) => selectedIds.has(s.id));

  function openProfile(signal: Signal) {
    setLastSignal(signal);
    setOpenId(signal.id);
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visible.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...visible.map((s) => s.id)]));
    }
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: allMatches.length },
    { id: "thesis", label: "Thesis Match", count: thesisMatches.length },
    { id: "saved", label: "Saved Searches", count: allSavedMatches.length },
  ];

  function handleHeaderAction() {
    if (tab === "saved" && selectedSearch) {
      onReviewSavedSearch(selectedSearch);
    } else {
      onGoToEquitySignals();
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex w-full flex-col">
        <div className="grid grid-cols-[1fr_minmax(0,32rem)_1fr] items-center gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-neutral-50">
              Inbox
            </h1>
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
              {allMatches.length}
            </span>
          </div>

          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your Inbox"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
            />
          </div>

          <div className="flex shrink-0 items-center justify-end">
            <button
              type="button"
              onClick={handleHeaderAction}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium whitespace-nowrap text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Open in Equity Signals
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400">
          Curated for {investor.name} · {investor.firm}
          <HoverPopup
            variant="card"
            width={260}
            trigger={
              <button
                type="button"
                className="flex cursor-pointer items-center text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            }
            content={<ThesisCard investor={investor} />}
          />
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? "border-gray-900 text-gray-900 dark:border-neutral-50 dark:text-neutral-50"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
              >
                {t.label}
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-2.5 flex shrink-0 items-center gap-2">
            {tab === "saved" && (
              <FilterChip
                value={savedSearchFilter}
                onChange={setSavedSearchFilter}
                options={[
                  { value: "all", label: "All saved searches" },
                  ...savedSearches.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            )}
            <FilterChip
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "fit", label: "Sort: Best fit" },
                { value: "newest", label: "Sort: Newest" },
              ]}
            />
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-2 dark:border-neutral-700 dark:bg-neutral-900">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-200">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={() => screenIds(visible.filter((s) => selectedIds.has(s.id)).map((s) => s.id))}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              <CircleCheck className="h-3.5 w-3.5" />
              Screen selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {visible.length > 0 ? (
            visible.map((signal, i) => (
              <InboxRow
                key={signal.id}
                signal={signal}
                selected={signal.id === openId}
                checked={selectedIds.has(signal.id)}
                delayMs={Math.min(i, 8) * 35}
                onToggleSelect={() => toggleSelect(signal.id)}
                onOpen={() => openProfile(signal)}
                onScreen={() => screenIds([signal.id])}
              />
            ))
          ) : sorted.length > 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <Search className="h-6 w-6 text-gray-300 dark:text-neutral-600" />
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                No matches for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : tab === "saved" && savedSearches.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                No saved searches yet
              </p>
              <p className="max-w-xs text-xs text-gray-400 dark:text-neutral-500">
                Save a filter in Equity Signals and new matches will show up here too.
              </p>
              <button
                type="button"
                onClick={onGoToEquitySignals}
                className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Go to Equity Signals
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <PartyPopper className="h-6 w-6 text-indigo-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">Inbox zero</p>
              <p className="max-w-xs text-xs text-gray-400 dark:text-neutral-500">
                Nothing new here yet — we'll surface signals the moment they match and haven't been
                screened by the team.
              </p>
            </div>
          )}
        </div>
      </div>

      {lastSignal && (
        <ProfileDrawer signal={lastSignal} open={openId !== null} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
