import { Activity, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { getPerson } from "../../associate/db/store";
import { personToSignal } from "../../associate/ui/adapters";
import { ProfileDrawer } from "../../components/ProfileDrawer";
import { ActivityFeed } from "./ActivityFeed";
import { InvestorDirectory } from "./InvestorDirectory";

type Screen = "activity" | "investors";

/**
 * Investor Tracking: what the investors you track are doing on X (Activity), and who you track
 * (Investors). Firms are folders; track a whole firm or pick individual investors.
 */
export function InvestorTrackingView() {
  const [screen, setScreen] = useState<Screen>("activity");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const person = profileId ? getPerson(profileId) : undefined;
  const signal = useMemo(() => (person ? personToSignal(person) : null), [person]);

  function openProfile(id: string) {
    setProfileId(id);
    setDrawerOpen(true);
  }

  return (
    <main className="relative flex min-h-0 flex-1 flex-col bg-white dark:bg-neutral-950">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_15%_0%,rgba(147,197,253,0.18),transparent),radial-gradient(50%_100%_at_85%_0%,rgba(253,186,116,0.14),transparent)]" />
      <header className="relative mx-auto flex w-full max-w-[860px] shrink-0 flex-wrap items-center justify-between gap-4 px-8 pt-8 pb-4">
        <div>
          <h1 className="text-[26px] font-medium tracking-tight text-gray-950 dark:text-neutral-50">Investor Tracking</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">See who the investors you follow are following on X, before the round is announced.</p>
        </div>
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-neutral-800">
          {(
            [
              { id: "activity", label: "Activity", icon: Activity },
              { id: "investors", label: "Investors", icon: Users },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium ${
                screen === id
                  ? "bg-white text-gray-950 shadow-sm dark:bg-neutral-950 dark:text-neutral-50"
                  : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {screen === "activity" ? (
          <ActivityFeed onOpenProfile={openProfile} onManage={() => setScreen("investors")} />
        ) : (
          <InvestorDirectory />
        )}
      </div>

      {signal && <ProfileDrawer signal={signal} open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </main>
  );
}
