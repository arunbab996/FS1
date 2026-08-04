import { useMemo, useState } from "react";
import { FooterBar } from "./components/FooterBar";
import { Sidebar } from "./components/Sidebar";
import { SignalTable } from "./components/SignalTable";
import { SignalTile } from "./components/SignalTile";
import { TopBar, type ViewMode } from "./components/TopBar";
import { signals } from "./data/signals";
import {
  deriveFilterOptions,
  emptyFilters,
  signalMatchesFilters,
  signalMatchesSearch,
  type SignalFilters,
} from "./utils/signalFilters";

function App() {
  const [isDark, setIsDark] = useState(false);
  const [filters, setFilters] = useState<SignalFilters>(emptyFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const visibleSignals = useMemo(() => signals.filter((signal) => !signal.hidden), []);
  const filterOptions = useMemo(() => deriveFilterOptions(visibleSignals), [visibleSignals]);
  const results = visibleSignals.filter(
    (signal) => signalMatchesFilters(signal, filters) && signalMatchesSearch(signal, searchQuery),
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-[#eceef1] text-gray-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Sidebar isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
                    setFilters(emptyFilters);
                    setSearchQuery("");
                  }}
                  className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </main>

          <FooterBar />
        </div>
      </div>
    </div>
  );
}

export default App;
