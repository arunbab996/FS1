import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

const pages = [1, 2, 3, 4, 5];

export function FooterBar() {
  return (
    <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 dark:border-neutral-700 dark:bg-neutral-950">
      <span className="text-sm text-gray-500 dark:text-neutral-400">
        1 - 10 of 45,672 signals
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label="First page"
        >
          <ChevronFirst className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors ${
              page === 1
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label="Last page"
        >
          <ChevronLast className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
