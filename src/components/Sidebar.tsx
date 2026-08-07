import { ChevronDown, Command, LogOut, Moon, Search, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navItems, type NavView } from "../data/nav";
import { personPhotoUrl } from "../utils/avatars";
import { CURRENT_USER_AVATAR_SEED, CURRENT_USER_NAME } from "../utils/currentUser";

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
        checked ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function Sidebar({
  isDark,
  onToggleDark,
  activeView,
  onSelectView,
  showInboxSection,
  onToggleShowInboxSection,
}: {
  isDark: boolean;
  onToggleDark: () => void;
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  showInboxSection: boolean;
  onToggleShowInboxSection: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="flex h-full w-[256px] shrink-0 flex-col border-r border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center">
          <img
            src="/firstsignal-logo.png"
            alt="FirstSignal"
            className="h-9 w-auto dark:hidden"
          />
          <img
            src="/firstsignal-logo-dark.png"
            alt="FirstSignal"
            className="hidden h-9 w-auto dark:block"
          />
        </div>
        <button
          type="button"
          onClick={onToggleDark}
          className="flex h-6 w-11 items-center rounded-full bg-gray-100 px-0.5 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          aria-label="Toggle theme"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform dark:bg-neutral-950 ${
              isDark ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {isDark ? (
              <Moon className="h-3 w-3 text-neutral-300" />
            ) : (
              <Sun className="h-3 w-3 text-amber-500" />
            )}
          </span>
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-left">Search for anything</span>
          <span className="flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <Command className="h-3 w-3" />K
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <ul className="flex flex-col gap-0.5">
          {navItems
            .filter((item) => item.view !== "inbox" || showInboxSection)
            .map((item) => {
              const Icon = item.icon;
              const isActive = item.view !== undefined && item.view === activeView;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.view ? () => onSelectView(item.view!) : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 font-medium text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gray-600 dark:text-neutral-400" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-neutral-700 dark:text-neutral-200">
                        {item.badge}
                      </span>
                    )}
                    {item.collapsible && (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-500 dark:text-neutral-400" />
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </nav>

      <div
        ref={menuRef}
        className="relative flex items-center gap-2.5 border-t border-gray-200 px-4 py-3 dark:border-neutral-700"
      >
        {menuOpen && (
          <div className="absolute bottom-full left-3 z-20 mb-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <p className="px-1 pb-2 text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
              Display settings
            </p>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-1.5">
              <span className="text-sm text-gray-700 dark:text-neutral-200">
                Show Inbox (preview)
              </span>
              <MiniToggle checked={showInboxSection} onChange={onToggleShowInboxSection} />
            </label>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg text-left"
        >
          <img
            src={personPhotoUrl(CURRENT_USER_AVATAR_SEED)}
            alt="AB"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-neutral-100">
            {CURRENT_USER_NAME}
          </span>
        </button>
        <button
          type="button"
          className="text-gray-500 transition-colors hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-100"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
