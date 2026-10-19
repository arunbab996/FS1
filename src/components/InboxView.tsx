import {
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  PartyPopper,
  Search,
  Sparkles,
  Star,
  Undo2,
  User,
  X,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { InvestorProfile } from "../data/inboxInvestor";
import type { InboxDecision, Signal } from "../types";
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

type Tab = "all" | "thesis" | "saved" | "pursuing" | "passed";
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

const DECISION_LABEL: Record<InboxDecision, string> = { pursue: "Pursuing", pass: "Passed" };

function decisionPillClasses(decision: InboxDecision): string {
  return decision === "pursue"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
    : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400";
}

/** Why a signal landed in this investor's Inbox: their thesis and/or which saved searches caught it. */
function routedVia(
  signal: Signal,
  investor: InvestorProfile,
  savedSearches: SavedSearch[],
): string[] {
  const reasons: string[] = [];
  if (signalMatchesFilters(signal, investor.filters)) reasons.push("Your thesis");
  for (const search of savedSearches) {
    if (signalMatchesFilters(signal, search.filters)) reasons.push(`Saved search: ${search.name}`);
  }
  return reasons;
}

function PassButton({ onClick, large }: { onClick: () => void; large?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 bg-red-50 font-medium whitespace-nowrap text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 ${
        large ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      <X className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      Pass
    </button>
  );
}

function PursueButton({ onClick, large }: { onClick: () => void; large?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 font-medium whitespace-nowrap text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400 ${
        large ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Check className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      Pursue
    </button>
  );
}

function UndoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
    >
      <Undo2 className="h-3.5 w-3.5" />
      Undo
    </button>
  );
}

/** Pinned under the profile drawer: the call to make once you've read the profile. */
function DecisionBar({
  decision,
  routed,
  onDecide,
}: {
  decision: InboxDecision | undefined;
  routed: string[];
  onDecide: (decision: InboxDecision | null) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="min-w-0 truncate text-xs text-gray-400 dark:text-neutral-500">
        {routed.length > 0 ? `Routed to you via ${routed.join(" · ")}` : ""}
      </p>
      {decision ? (
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${decisionPillClasses(decision)}`}
          >
            {DECISION_LABEL[decision]}
          </span>
          <UndoButton onClick={() => onDecide(null)} />
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <PassButton large onClick={() => onDecide("pass")} />
          <PursueButton large onClick={() => onDecide("pursue")} />
        </div>
      )}
    </div>
  );
}

function InboxRow({
  signal,
  routed,
  selected,
  checked,
  delayMs,
  decision,
  onToggleSelect,
  onOpen,
  onDecide,
}: {
  signal: Signal;
  routed: string[];
  selected: boolean;
  checked: boolean;
  delayMs: number;
  decision: InboxDecision | undefined;
  onToggleSelect: () => void;
  onOpen: () => void;
  onDecide: (decision: InboxDecision | null) => void;
}) {
  const name = signal.personName ?? extractPersonName(signal.headline);
  const location = signalLocation(signal);
  const country = location.split(", ").pop() ?? "";
  const flag = countryFlag(country);
  const topReason = signal.reasoning.positives[0];
  const dateLabel = signal.dateGroup.split(" · ")[0];
  const hasInvestorInterest = Boolean(signal.investorInterest);
  const visibleTags = signal.tags.slice(0, 3);
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
      className={`animate-inbox-row-in group flex cursor-pointer items-center gap-4 rounded-xl border bg-white px-4 py-3.5 transition-[box-shadow,border-color] dark:bg-neutral-900 ${
        selected
          ? "border-blue-300 shadow-sm dark:border-blue-500/40"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-neutral-700 dark:hover:border-neutral-600"
      }`}
    >
      {/* Photo, which turns into the select checkbox on hover */}
      <div className="relative h-11 w-11 shrink-0">
        {signal.useGenericAvatar ? (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 transition-opacity dark:bg-neutral-700 ${
              checked ? "opacity-0" : "group-hover:opacity-0"
            }`}
          >
            <User className="h-5 w-5 text-gray-400 dark:text-neutral-400" />
          </div>
        ) : (
          <img
            src={signal.photoUrl ?? personPhotoUrl(signal.id)}
            alt={signal.avatarInitials}
            className={`h-11 w-11 rounded-full object-cover ring-1 ring-gray-100 transition-opacity dark:ring-neutral-800 ${
              checked ? "opacity-0" : "group-hover:opacity-0"
            }`}
          />
        )}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-gray-50 transition-opacity dark:bg-neutral-800 ${
            checked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggleSelect}
            aria-label={`Select ${name}`}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
          />
        </div>
      </div>

      <div className="w-44 shrink-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-neutral-50">
          <span className="truncate">{name}</span>
          {hasInvestorInterest && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
          <span className="shrink-0">{dateLabel}</span>
          {routed[0] && (
            <span className="min-w-0 truncate rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
              {routed[0]}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-neutral-100">
          <Highlight text={signal.headline} />
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-neutral-400">
          {flag && <span className="shrink-0">{flag}</span>}
          <span className="truncate">{topReason ?? location}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1">
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

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${signalStatusPillClasses(signal.status)}`}
          >
            {signal.status}
          </span>
          {signal.score !== undefined && (
            <span
              title="Signal score"
              className={`rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-bold dark:border-neutral-700 ${scoreTextClasses(signal.score)}`}
            >
              {signal.score.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex h-8 items-center gap-2">
          {decision ? (
            <>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${decisionPillClasses(decision)}`}
              >
                {DECISION_LABEL[decision]}
              </span>
              <UndoButton onClick={() => onDecide(null)} />
            </>
          ) : (
            <>
              <PassButton onClick={() => onDecide("pass")} />
              <PursueButton onClick={() => onDecide("pursue")} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function InboxView({
  investor,
  signals,
  savedSearches,
  decisions,
  onDecide,
  onReviewSavedSearch,
  onGoToEquitySignals,
}: {
  investor: InvestorProfile;
  signals: Signal[];
  savedSearches: SavedSearch[];
  decisions: Record<string, InboxDecision>;
  onDecide: (ids: string[], decision: InboxDecision | null) => void;
  onReviewSavedSearch: (search: SavedSearch) => void;
  onGoToEquitySignals: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [sortBy, setSortBy] = useState<SortBy>("fit");
  const [savedSearchFilter, setSavedSearchFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{
    ids: string[];
    decision: InboxDecision;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function isUnscreened(signal: Signal): boolean {
    return (signal.viewedBy?.length ?? 0) === 0 && !decisions[signal.id];
  }

  function decide(ids: string[], decision: InboxDecision | null) {
    onDecide(ids, decision);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (!decision) {
      setToast(null);
      return;
    }
    const first = signals.find((s) => s.id === ids[0]);
    const firstName = first ? (first.personName ?? extractPersonName(first.headline)) : "";
    setToast({
      ids,
      decision,
      label:
        ids.length === 1
          ? `${decision === "pursue" ? "Pursuing" : "Passed on"} ${firstName}`
          : `${decision === "pursue" ? "Pursuing" : "Passed on"} ${ids.length} signals`,
    });
  }

  /** Decide from the open profile, then move on to the next signal still waiting for a call. */
  function decideOpen(signal: Signal, decision: InboxDecision | null) {
    const wasPending = !decisions[signal.id];
    const index = visible.findIndex((s) => s.id === signal.id);
    const next = visible[index + 1] ?? visible[index - 1];
    decide([signal.id], decision);
    if (decision && wasPending && (tab === "all" || tab === "thesis" || tab === "saved")) {
      if (next) openProfile(next);
      else setOpenId(null);
    }
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
    [signals, investor, decisions],
  );

  const savedSearchSections = useMemo(
    () =>
      savedSearches.map((search) => ({
        search,
        matches: signals.filter((s) => signalMatchesFilters(s, search.filters) && isUnscreened(s)),
      })),
    [signals, savedSearches, decisions],
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

  const pursuing = useMemo(
    () => signals.filter((s) => decisions[s.id] === "pursue"),
    [signals, decisions],
  );
  const passed = useMemo(() => signals.filter((s) => decisions[s.id] === "pass"), [signals, decisions]);

  const listForTab =
    tab === "all"
      ? allMatches
      : tab === "thesis"
        ? thesisMatches
        : tab === "saved"
          ? savedTabMatches
          : tab === "pursuing"
            ? pursuing
            : passed;
  const sorted = useMemo(() => {
    const copy = [...listForTab];
    copy.sort((a, b) =>
      sortBy === "fit" ? (b.score ?? 0) - (a.score ?? 0) : signalDate(b).getTime() - signalDate(a).getTime(),
    );
    return copy;
  }, [listForTab, sortBy]);
  const visible = useMemo(
    () => sorted.filter((s) => signalMatchesSearch(s, query)),
    [sorted, query],
  );
  const selectedVisibleIds = visible.filter((s) => selectedIds.has(s.id)).map((s) => s.id);
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
    { id: "pursuing", label: "Pursuing", count: pursuing.length },
    { id: "passed", label: "Passed", count: passed.length },
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
              <Fragment key={t.id}>
                {t.id === "pursuing" && (
                  <span className="mb-2.5 h-4 w-px bg-gray-200 dark:bg-neutral-700" />
                )}
                <button
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
              </Fragment>
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

        {selectedIds.size > 0 && tab !== "pursuing" && tab !== "passed" && (
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
            <PassButton onClick={() => decide(selectedVisibleIds, "pass")} />
            <PursueButton onClick={() => decide(selectedVisibleIds, "pursue")} />
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
                routed={routedVia(signal, investor, savedSearches)}
                selected={signal.id === openId}
                checked={selectedIds.has(signal.id)}
                delayMs={Math.min(i, 8) * 35}
                decision={decisions[signal.id]}
                onToggleSelect={() => toggleSelect(signal.id)}
                onOpen={() => openProfile(signal)}
                onDecide={(decision) => decide([signal.id], decision)}
              />
            ))
          ) : sorted.length > 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <Search className="h-6 w-6 text-gray-300 dark:text-neutral-600" />
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                No matches for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : tab === "pursuing" || tab === "passed" ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              {tab === "pursuing" ? (
                <Check className="h-6 w-6 text-emerald-500" />
              ) : (
                <X className="h-6 w-6 text-gray-300 dark:text-neutral-600" />
              )}
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                {tab === "pursuing" ? "Nothing pursued yet" : "Nothing passed yet"}
              </p>
              <p className="max-w-xs text-xs text-gray-400 dark:text-neutral-500">
                {tab === "pursuing"
                  ? "Signals you pursue show up here so you can follow up."
                  : "Signals you pass on are kept here, in case you change your mind."}
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
        <ProfileDrawer
          signal={lastSignal}
          open={openId !== null}
          onClose={() => setOpenId(null)}
          footer={
            <DecisionBar
              decision={decisions[lastSignal.id]}
              routed={routedVia(lastSignal, investor, savedSearches)}
              onDecide={(decision) => decideOpen(lastSignal, decision)}
            />
          }
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-4 rounded-xl bg-gray-900 py-2.5 pr-3 pl-4 text-sm text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
        >
          <span className="font-medium">{toast.label}</span>
          <button
            type="button"
            onClick={() => {
              onDecide(toast.ids, null);
              setToast(null);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white dark:text-neutral-600 dark:hover:bg-black/5 dark:hover:text-neutral-900"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
