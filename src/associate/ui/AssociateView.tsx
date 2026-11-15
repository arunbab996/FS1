import { BookmarkCheck, Coffee, MessageSquareText, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProfileDrawer } from "../../components/ProfileDrawer";
import { getPerson, useAssociateDb } from "../db/store";
import { get_briefing } from "../tools";
import { BriefingView } from "./BriefingView";
import { ChatPanel } from "./ChatPanel";
import { SavedSearchesView } from "./SavedSearchesView";
import { personToSignal } from "./adapters";
import { GoToTabContext, OpenProfileContext } from "./context";

export type AssociateTab = "chat" | "searches" | "briefing";

/**
 * The AI Associate: chat, saved searches and the morning briefing, as three tabs of one view.
 * It hosts the profile panel once, so any card can open it.
 */
export function AssociateView({ initialTab = "chat", toast, onToast }: { initialTab?: AssociateTab; toast: string | null; onToast: (text: string) => void }) {
  const db = useAssociateDb();
  const [tab, setTab] = useState<AssociateTab>(initialTab);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setTab(initialTab), [initialTab]);

  const person = profileId ? getPerson(profileId) : undefined;
  const signal = useMemo(() => (person ? personToSignal(person) : null), [person]);
  const briefingTotal = get_briefing().reduce((sum, g) => sum + g.personIds.length, 0);

  const tabs: { id: AssociateTab; label: string; icon: typeof Sparkles; count?: number }[] = [
    { id: "chat", label: "Chat", icon: MessageSquareText },
    { id: "searches", label: "Saved searches", icon: BookmarkCheck, count: db.savedSearches.length },
    { id: "briefing", label: "Morning briefing", icon: Coffee, count: briefingTotal },
  ];

  return (
    <OpenProfileContext.Provider
      value={(id) => {
        setProfileId(id);
        setDrawerOpen(true);
      }}
    >
      <GoToTabContext.Provider value={setTab}>
        <main className="relative flex min-h-0 flex-1 flex-col bg-[#faf9f7] dark:bg-neutral-950">
          <header className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-200 bg-white/70 px-6 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-neutral-100">AI Associate</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">Prototype · demo data</span>
            </div>
            <nav className="flex gap-1">
              {tabs.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
                    tab === id
                      ? "bg-gray-100 font-medium text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {count ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${id === "briefing" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 dark:bg-neutral-700 dark:text-neutral-200"}`}>
                      {count}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </header>

          {tab === "chat" && <ChatPanel />}
          {tab === "searches" && <SavedSearchesView onToast={onToast} />}
          {tab === "briefing" && <BriefingView onOpenSearches={() => setTab("searches")} />}

          {toast && (
            <div role="status" className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900">
              {toast}
            </div>
          )}
        </main>

        {signal && <ProfileDrawer signal={signal} open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
      </GoToTabContext.Provider>
    </OpenProfileContext.Provider>
  );
}
