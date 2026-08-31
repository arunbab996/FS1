import { useMemo, useState } from "react";
import { FooterBar } from "./components/FooterBar";
import { InboxView } from "./components/InboxView";
import { ProfileSettings } from "./components/ProfileSettings";
import { ReportsView } from "./components/ReportsView";
import { Sidebar } from "./components/Sidebar";
import { SignalTable } from "./components/SignalTable";
import { SignalTile } from "./components/SignalTile";
import { TopBar, type ViewMode } from "./components/TopBar";
import { demoInboxInvestor } from "./data/inboxInvestor";
import type { NavView } from "./data/nav";
import { signals } from "./data/signals";
import {
  deriveFilterOptions,
  emptyFilters,
  signalMatchesFilters,
  signalMatchesSearch,
  type SavedSearch,
  type SignalFilters,
} from "./utils/signalFilters";

function App() {
  const [isDark, setIsDark] = useState(false);
  const [filters, setFilters] = useState<SignalFilters>(emptyFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [activeSavedSearchId, setActiveSavedSearchId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<NavView>("equity-signals");
  const [showInboxSection, setShowInboxSection] = useState(false);

  const visibleSignals = useMemo(() => signals.filter((signal) => !signal.hidden), []);
  const filterOptions = useMemo(() => deriveFilterOptions(visibleSignals), [visibleSignals]);
  const results = visibleSignals.filter(
    (signal) => signalMatchesFilters(signal, filters) && signalMatchesSearch(signal, searchQuery),
  );

  // Manually editing/clearing filters leaves whatever saved-search tab was active, if any.
  function handleFiltersChange(next: SignalFilters) {
    setFilters(next);
    setActiveSavedSearchId(null);
  }

  function handleSelectAllTab() {
    setFilters(emptyFilters);
    setActiveSavedSearchId(null);
  }

  function handleSelectSavedSearch(search: SavedSearch) {
    setFilters(search.filters);
    setActiveSavedSearchId(search.id);
  }

  function handleSaveSearch(name: string) {
    const id = crypto.randomUUID();
    setSavedSearches((prev) => [...prev, { id, name, filters }]);
    setActiveSavedSearchId(id);
  }

  function handleDeleteSavedSearch(id: string) {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    setActiveSavedSearchId((current) => (current === id ? null : current));
  }

  function handleToggleShowInboxSection() {
    setShowInboxSection((prev) => {
      const next = !prev;
      if (!next) setActiveView("equity-signals");
      return next;
    });
  }

  function handleReviewSavedSearch(search: SavedSearch) {
    handleSelectSavedSearch(search);
    setActiveView("equity-signals");
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-[#eceef1] text-gray-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Sidebar
          isDark={isDark}
          onToggleDark={() => setIsDark((v) => !v)}
          activeView={activeView}
          onSelectView={setActiveView}
          showInboxSection={showInboxSection}
          onToggleShowInboxSection={handleToggleShowInboxSection}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {activeView === "inbox" ? (
            <InboxView
              investor={demoInboxInvestor}
              signals={visibleSignals}
              savedSearches={savedSearches}
              onReviewSavedSearch={handleReviewSavedSearch}
              onGoToEquitySignals={() => setActiveView("equity-signals")}
            />
          ) : activeView === "reports" ? (
            <ReportsView />
          ) : activeView === "profile" ? (
            <ProfileSettings />
          ) : (
            <>
              <TopBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                filterOptions={filterOptions}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                savedSearches={savedSearches}
                activeSavedSearchId={activeSavedSearchId}
                onSaveSearch={handleSaveSearch}
                onDeleteSavedSearch={handleDeleteSavedSearch}
                onSelectAllTab={handleSelectAllTab}
                onSelectSavedSearch={handleSelectSavedSearch}
              />

              <main id="main-scroll" className="flex-1 overflow-y-auto px-6 py-4">
                {results.length > 0 ? (
                  viewMode === "table" ? (
                    <SignalTable signals={results} />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {results.map((signal) => (
                        <SignalTile key={signal.id} signal={signal} />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                      No signals match your search or filters
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectAllTab();
                        setSearchQuery("");
                      }}
                      className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Clear search and filters
                    </button>
                  </div>
                )}
              </main>
            </>
          )}

          {activeView !== "reports" && activeView !== "profile" && <FooterBar />}
        </div>
      </div>
    </div>
  );
}

export default App;
