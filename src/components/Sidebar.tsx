import { ChevronDown, Command, LogOut, Moon, Search, Sun } from "lucide-react";
import { navItems } from "../data/nav";
import { personPhotoUrl } from "../utils/avatars";
import { LogoMark } from "./icons/LogoMark";

export function Sidebar({
  isDark,
  onToggleDark,
}: {
  isDark: boolean;
  onToggleDark: () => void;
}) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-[15px] font-semibold text-gray-900 dark:text-neutral-50">
            FirstSignal
          </span>
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
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm text-gray-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-left">Search for anything</span>
          <span className="flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <Command className="h-3 w-3" />K
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                    item.active
                      ? "bg-gray-100 font-medium text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-gray-500 dark:text-neutral-400" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-neutral-700 dark:text-neutral-200">
                      {item.badge}
                    </span>
                  )}
                  {item.collapsible && (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-neutral-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-gray-200 px-4 py-3 dark:border-neutral-700">
        <img
          src={personPhotoUrl("peter-gregory")}
          alt="AB"
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
        <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-neutral-100">
          Arun Baburaj
        </span>
        <button
          type="button"
          className="text-gray-400 transition-colors hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-100"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
