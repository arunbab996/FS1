import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Shows `content` in a floating popup on hover, positioned via viewport
 * coordinates (not CSS absolute) so it can escape scroll/overflow containers
 * without being clipped.
 */
export function HoverPopup({
  trigger,
  content,
  width,
  variant = "dark",
}: {
  trigger: ReactNode;
  content: ReactNode;
  /** Fixed popup width in px. Omit for a compact tooltip that hugs its content (capped at 280px). */
  width?: number;
  /** "dark": plain dark tooltip (default). "card": white/dark bordered card with a smooth fade/scale-in, for richer content. */
  variant?: "dark" | "card";
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleEnter() {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const popupWidth = width ?? (variant === "card" ? 256 : 280);
    const left = Math.min(rect.left, window.innerWidth - popupWidth - 16);
    setCoords({ top: rect.bottom + 6, left: Math.max(left, 16) });
    if (variant === "card") requestAnimationFrame(() => setVisible(true));
  }

  function handleLeave() {
    setVisible(false);
    setCoords(null);
  }

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {trigger}
      {coords &&
        createPortal(
          variant === "card" ? (
            <div
              style={{ top: coords.top, left: coords.left, width: width ?? 256 }}
              className={`fixed z-[60] origin-top-left rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xl transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800 ${
                visible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0"
              }`}
            >
              {content}
            </div>
          ) : (
            <div
              style={
                width
                  ? { top: coords.top, left: coords.left, width }
                  : { top: coords.top, left: coords.left, maxWidth: 280 }
              }
              className="pointer-events-none fixed z-[60] rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-white shadow-xl dark:bg-neutral-700"
            >
              {content}
            </div>
          ),
          document.body,
        )}
    </div>
  );
}
