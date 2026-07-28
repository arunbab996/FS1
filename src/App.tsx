import { useState } from "react";
import { DateGroupHeader } from "./components/DateGroupHeader";
import { FooterBar } from "./components/FooterBar";
import { Sidebar } from "./components/Sidebar";
import { SignalTile } from "./components/SignalTile";
import { TopBar } from "./components/TopBar";
import { signals } from "./data/signals";
import type { Signal } from "./types";

function groupByDate(items: Signal[]) {
  const groups: { label: string; signals: Signal[] }[] = [];
  for (const signal of items) {
    const existing = groups.find((g) => g.label === signal.dateGroup);
    if (existing) {
      existing.signals.push(signal);
    } else {
      groups.push({ label: signal.dateGroup, signals: [signal] });
    }
  }
  return groups;
}

function App() {
  const groups = groupByDate(signals);
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-[#eceef1] text-gray-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Sidebar isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />

          <main id="main-scroll" className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.label} className="flex flex-col gap-2">
                  <DateGroupHeader label={group.label} />
                  <div className="flex flex-col gap-2">
                    {group.signals.map((signal) => (
                      <SignalTile key={signal.id} signal={signal} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>

          <FooterBar />
        </div>
      </div>
    </div>
  );
}

export default App;
