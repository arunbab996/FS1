import { useRef, useState } from "react";
import type { SignalReasoning } from "../types";
import { scoreColorClasses } from "../utils/score";

export function ScoreReasoningBubble({
  score,
  reasoning,
}: {
  score: number;
  reasoning: SignalReasoning;
}) {
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
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold transition-colors ${scoreColorClasses(score)}`}
      >
        {score.toFixed(1)}/10
      </button>

      <div
        className={`absolute right-0 z-30 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800 ${
          placement === "top"
            ? "bottom-full mb-2 origin-bottom-right"
            : "top-full mt-2 origin-top-right"
        } ${
          show
            ? "translate-y-0 scale-100 opacity-100"
            : `pointer-events-none scale-95 opacity-0 ${
                placement === "top" ? "translate-y-1" : "-translate-y-1"
              }`
        }`}
      >
        <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
          Why {score.toFixed(1)}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {reasoning.positives.map((point) => (
            <span
              key={point}
              className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-400"
            >
              + {point}
            </span>
          ))}
          {reasoning.negatives.map((point) => (
            <span
              key={point}
              className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
            >
              − {point}
            </span>
          ))}
        </div>
        {placement === "top" ? (
          <span className="absolute top-full right-4 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
        ) : (
          <span className="absolute bottom-full right-4 h-2.5 w-2.5 translate-y-1/2 rotate-45 border-t border-l border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
        )}
      </div>
    </span>
  );
}
