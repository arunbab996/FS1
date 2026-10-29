import { Check, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Same hover bubble as AiSummaryBubble, explaining why a signal was auto assigned, with the
 * approve / reject choice inside it so it doesn't take up room on the tile.
 */
export function AutoAssignBubble({
  reason,
  approved,
  onApprove,
  onReject,
}: {
  reason: string;
  approved: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [show, setShow] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleEnter() {
    const rect = triggerRef.current?.getBoundingClientRect();
    setPlacement(rect && rect.top < 260 ? "bottom" : "top");
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

      {/* The padding (not a margin) bridges the gap to the trigger, so the bubble stays open while
          the cursor travels onto its buttons. */}
      <div
        className={`absolute left-0 z-30 w-72 transition-all duration-200 ease-out ${
          placement === "top" ? "bottom-full pb-2 origin-bottom-left" : "top-full pt-2 origin-top-left"
        } ${
          show
            ? "translate-y-0 scale-100 opacity-100"
            : `pointer-events-none scale-95 opacity-0 ${
                placement === "top" ? "translate-y-1" : "-translate-y-1"
              }`
        }`}
      >
        <div className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 text-xs font-semibold text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Auto assigned
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-neutral-100">{reason}</p>

          <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-700">
            {approved ? (
              <span className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Match approved
              </span>
            ) : (
              <>
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                  Suggested match
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onApprove}
                    className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={onReject}
                    className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>

          {placement === "top" ? (
            <span className="absolute top-full left-3 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
          ) : (
            <span className="absolute bottom-full left-3 h-2.5 w-2.5 translate-y-1/2 rotate-45 border-t border-l border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
          )}
        </div>
      </div>
    </span>
  );
}
