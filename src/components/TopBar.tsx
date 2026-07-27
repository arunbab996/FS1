import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { tabsByViewOption, viewByOptions, type ViewByOption } from "../data/viewBy";

export function TopBar() {
  const [viewBy, setViewBy] = useState<ViewByOption>("Saved filter");
  const [activeTab, setActiveTab] = useState("All");
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

  const tabs = tabsByViewOption[viewBy];

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-2.5 dark:border-neutral-700 dark:bg-neutral-950">
      <div className="flex items-center gap-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 py-1 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-blue-600 font-semibold text-gray-900 dark:border-blue-500 dark:text-neutral-50"
                : "border-transparent font-medium text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div ref={menuRef} className="relative flex shrink-0 items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-neutral-400">
          View by:
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          {viewBy}
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-400 transition-transform dark:text-neutral-400 ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {viewByOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setViewBy(option);
                  setActiveTab("All");
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs ${
                  viewBy === option
                    ? "font-medium text-blue-600 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
