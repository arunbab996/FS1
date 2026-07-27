import { ChevronDown } from "lucide-react";

export function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-neutral-700 dark:bg-neutral-950">
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="border-b-2 border-blue-600 pb-2 text-sm font-semibold text-gray-900 dark:text-neutral-50"
        >
          All
        </button>
        <button
          type="button"
          className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          View all
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-neutral-400">
          View by:
        </span>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Saved filter
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-400" />
        </button>
      </div>
    </div>
  );
}
