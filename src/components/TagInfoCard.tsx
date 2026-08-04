import { useRef, useState, type ReactNode } from "react";
import type { SignalTag } from "../types";
import { tagAccentTextClasses, tagIcon } from "../utils/tags";

/**
 * Rich hover card for a tag that carries an explanation (e.g. why a
 * "Nexus to Asia Pacific" call was made). Shares the AI Summary bubble's
 * card shell and motion, but themed to the tag's own category color so the
 * two read as related but distinct surfaces.
 */
export function TagInfoCard({ tag, children }: { tag: SignalTag; children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const Icon = tagIcon(tag);
  const accent = tagAccentTextClasses(tag.category);

  function handleEnter() {
    const rect = triggerRef.current?.getBoundingClientRect();
    setPlacement(rect && rect.top < 200 ? "bottom" : "top");
    setShow(true);
  }

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      <div
        className={`absolute left-0 z-30 w-64 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xl transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800 ${
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
        <div
          className={`flex items-center gap-1.5 border-b border-gray-100 pb-2 text-xs font-semibold dark:border-neutral-700 ${accent}`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {tag.label}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-neutral-100">
          {tag.description}
        </p>
        {placement === "top" ? (
          <span className="absolute top-full left-4 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
        ) : (
          <span className="absolute bottom-full left-4 h-2.5 w-2.5 translate-y-1/2 rotate-45 border-t border-l border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800" />
        )}
      </div>
    </span>
  );
}
