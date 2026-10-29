import { Sparkles } from "lucide-react";
import { useRef, useState } from "react";

/** Same hover bubble as AiSummaryBubble, explaining why a signal was auto assigned. */
export function AutoAssignBubble({ reason }: { reason: string }) {
  const [show, setShow] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleEnter() {
    const rect = triggerRef.current?.getBoundingClientRect();
    setPlacement(rect && rect.top < 200 ? "bottom" : "top");
    setShow(true);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Auto assigned"
        className="flex h-5 w-5 items-center justify-center rounded-full text-amber-400 transition-colors hover:text-amber-500 dark:hover:text-amber-300"
      >
        <Sparkles className="h-3.5 w-3.5" />
      </button>

      <div
        className={`absolute left-0 z-30 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800 ${
          placement === "top"
            ? "bottom-full mb-2 origin-bottom-left"
            : "top-full mt-2 origin-top-left"
        } ${
          show
            ? "translate-y-0 scale-100 opacity-100"
            : `pointer-events-none scale-95 opacity-0 ${
                placement === "top" ? "translate-y-1" : "-translate-y-1"
              }`
        }`}
      >
        <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 text-xs font-semibold text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Auto assigned
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-neutral-100">{reason}</p>
        {placement === "top" ? (
          <span className="absolute top-full left-3 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
        ) : (
          <span className="absolute bottom-full left-3 h-2.5 w-2.5 translate-y-1/2 rotate-45 border-t border-l border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
        )}
      </div>
    </span>
  );
}
