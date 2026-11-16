import { useEffect, useMemo, useState } from "react";
import { ProfileDrawer } from "../../components/ProfileDrawer";
import { clearChat } from "../agent/chatStore";
import { AGENT_NAME, AGENT_TAGLINE } from "../brand";
import { getPerson, useAssociateDb } from "../db/store";
import { get_briefing } from "../tools";
import { BriefingView } from "./BriefingView";
import { ChatPanel } from "./ChatPanel";
import { AgentMark } from "./AgentMark";
import { SavedSearchesView } from "./SavedSearchesView";
import { personToSignal } from "./adapters";
import { GoToTabContext, OpenProfileContext } from "./context";

export type AssociateTab = "chat" | "searches" | "briefing";

/**
 * The AI Associate (named in brand.ts): chat, saved searches and the morning briefing, as three tabs of one
 * view. It hosts the profile panel once, so any row or card can open it.
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

  const tabs: { id: AssociateTab; label: string; count?: number }[] = [
    { id: "chat", label: "Search" },
    { id: "searches", label: "Saved searches", count: db.savedSearches.length },
    { id: "briefing", label: "Morning briefing", count: briefingTotal },
  ];

  return (
    <OpenProfileContext.Provider
      value={(id) => {
        setProfileId(id);
        setDrawerOpen(true);
      }}
    >
      <GoToTabContext.Provider value={setTab}>
        <main className="relative flex min-h-0 flex-1 flex-col bg-white dark:bg-neutral-950">
          {/* Soft pastel wash behind the header, as on Synaptic's product tabs. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_20%_0%,rgba(147,197,253,0.22),transparent),radial-gradient(50%_100%_at_85%_0%,rgba(196,181,253,0.22),transparent)]" />
          <header className="relative flex shrink-0 items-end justify-between gap-6 border-b border-gray-100 px-6 dark:border-neutral-800">
            {/* The logo goes home: the Search tab with a fresh conversation. */}
            <button
              type="button"
              onClick={() => {
                clearChat();
                setTab("chat");
              }}
              title={`${AGENT_NAME} home`}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg py-3.5 hover:opacity-80"
            >
              <AgentMark size={24} />
              <span className="text-[15px] font-semibold tracking-tight text-gray-950 dark:text-neutral-50">{AGENT_NAME}</span>
              <span className="text-xs text-gray-400 dark:text-neutral-500">{AGENT_TAGLINE}</span>
            </button>
            <nav className="flex gap-6">
              {tabs.map(({ id, label, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 pt-3.5 text-sm transition-colors ${
                    tab === id
                      ? "border-gray-950 font-medium text-gray-950 dark:border-neutral-100 dark:text-neutral-50"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  {label}
                  {count ? (
                    <span className={`rounded-full px-1.5 py-px text-[11px] font-medium ${id === "briefing" ? "bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-300"}`}>
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
            <div role="status" className="pointer-events-none absolute bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900">
              {toast}
            </div>
          )}
        </main>

        {signal && <ProfileDrawer signal={signal} open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
      </GoToTabContext.Provider>
    </OpenProfileContext.Provider>
  );
}
