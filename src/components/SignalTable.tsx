import { Rss, User } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Signal } from "../types";
import { companyLogoUrl, personPhotoUrl } from "../utils/avatars";
import { countryFlag } from "../utils/flags";
import { signalLocation } from "../utils/signalFilters";
import { signalStatusColorClasses } from "../utils/signalStatus";
import { sourcedViaColorClasses } from "../utils/sourcedVia";
import { tagAccentTextClasses, tagColorClasses, tagIcon } from "../utils/tags";
import { extractPersonName, stripMarkdown } from "../utils/text";
import { AssignInvestorButton } from "./AssignInvestorButton";
import { Highlight } from "./Highlight";
import { LinkedinIcon } from "./icons/LinkedinIcon";
import { ProfileDrawer } from "./ProfileDrawer";

const columnHeaders: { label: string; className?: string }[] = [
  { label: "Person", className: "w-56" },
  { label: "Signal" },
  { label: "Score", className: "w-16" },
  { label: "Current", className: "w-40" },
  { label: "Source", className: "w-28" },
  { label: "Status", className: "w-36" },
  { label: "Date", className: "w-16" },
  { label: "Assigned", className: "w-56" },
  { label: "", className: "w-14" },
];

/**
 * Shows `content` in a floating popup on hover, positioned via viewport
 * coordinates (not CSS absolute) so it can escape the table's horizontal
 * scroll container without being clipped by its overflow.
 */
function HoverPopup({
  trigger,
  content,
  width,
  variant = "dark",
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
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
              style={width ? { top: coords.top, left: coords.left, width } : { top: coords.top, left: coords.left, maxWidth: 280 }}
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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "text-green-600 dark:text-green-400"
      : score >= 6
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";
  return <span className={`text-sm font-semibold ${color}`}>{score.toFixed(1)}</span>;
}

function SignalTableRow({
  signal,
  onOpenProfile,
}: {
  signal: Signal;
  onOpenProfile: () => void;
}) {
  function handleRowClick(event: React.MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, a")) return;
    onOpenProfile();
  }

  const shortDate = signal.dateGroup.split(" · ")[1];
  const location = signalLocation(signal);
  const flag = countryFlag(location.split(", ").pop() ?? "");
  const current = signal.current[0];
  const visibleTags = signal.tags.slice(0, 2);
  const extraTagCount = signal.tags.length - visibleTags.length;

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60"
    >
      <td className="w-56 overflow-hidden px-4 py-2.5">
        <div className="flex items-center gap-2">
          {signal.useGenericAvatar ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700">
              <User className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-400" />
            </div>
          ) : (
            <img
              src={signal.photoUrl ?? personPhotoUrl(signal.id)}
              alt={signal.avatarInitials}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-50">
              {signal.personName ?? extractPersonName(signal.headline)}
            </p>
            <HoverPopup
              trigger={
                <p className="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-neutral-400">
                  {flag && <span>{flag}</span>}
                  {location}
                </p>
              }
              content={<p className="leading-relaxed text-white">{location}</p>}
            />
          </div>
        </div>
      </td>

      <td className="overflow-hidden px-4 py-2.5">
        <HoverPopup
          width={320}
          trigger={
            <p className="truncate text-sm text-gray-700 dark:text-neutral-300">
              <Highlight text={signal.headline} />
            </p>
          }
          content={
            <>
              <p className="leading-relaxed text-white">{stripMarkdown(signal.headline)}</p>
              <p className="mt-1.5 text-neutral-300">{signal.contextLine}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {signal.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </>
          }
        />
        <div className="mt-1 flex items-center gap-1">
          {visibleTags.map((tag) => {
            const Icon = tagIcon(tag);
            const chip = (
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${tagColorClasses(tag.category)}`}
              >
                {Icon && <Icon className="h-3 w-3" />}
                {tag.label}
              </span>
            );
            return tag.description ? (
              <HoverPopup
                key={tag.label}
                variant="card"
                trigger={chip}
                content={
                  <>
                    <div
                      className={`flex items-center gap-1.5 border-b border-gray-100 pb-2 text-xs font-semibold dark:border-neutral-700 ${tagAccentTextClasses(tag.category)}`}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {tag.label}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-neutral-100">
                      {tag.description}
                    </p>
                  </>
                }
              />
            ) : (
              <span key={tag.label}>{chip}</span>
            );
          })}
          {extraTagCount > 0 && (
            <span className="shrink-0 text-[11px] font-medium text-gray-400 dark:text-neutral-500">
              +{extraTagCount}
            </span>
          )}
        </div>
      </td>

      <td className="w-16 px-4 py-2.5">
        <ScoreBadge score={signal.score} />
      </td>

      <td className="w-40 overflow-hidden px-4 py-2.5">
        {current ? (
          <div className="flex items-center gap-1.5">
            <img
              src={companyLogoUrl(current.company)}
              alt=""
              className="h-5 w-5 shrink-0 rounded bg-white object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-gray-800 dark:text-neutral-200">
                {current.company}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
                {current.role}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-300 dark:text-neutral-600">—</span>
        )}
      </td>

      <td className="w-28 overflow-hidden px-4 py-2.5">
        {signal.sourcedVia || signal.sourcedBy ? (
          <span
            className={`block max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-medium ${
              signal.sourcedVia
                ? sourcedViaColorClasses(signal.sourcedVia)
                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400"
            }`}
          >
            {signal.sourcedVia ?? signal.sourcedBy}
          </span>
        ) : (
          <span className="text-xs text-gray-300 dark:text-neutral-600">—</span>
        )}
      </td>

      <td className="w-36 overflow-hidden px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-gray-600 dark:text-neutral-300">
          <Rss className={`h-3.5 w-3.5 shrink-0 ${signalStatusColorClasses(signal.status)}`} />
          <span className="truncate">{signal.status}</span>
        </span>
      </td>

      <td className="w-16 overflow-hidden px-4 py-2.5">
        <span className="text-xs whitespace-nowrap text-gray-500 dark:text-neutral-400">
          {shortDate}
        </span>
      </td>

      <td className="w-56 overflow-hidden px-4 py-2.5">
        <AssignInvestorButton signal={signal} />
      </td>

      <td className="w-14 px-4 py-2.5">
        {signal.linkedinUrl ? (
          <a
            href={signal.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View LinkedIn"
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
          </a>
        ) : (
          <button
            type="button"
            aria-label="View LinkedIn"
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-300 dark:text-neutral-600"
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

export function SignalTable({ signals }: { signals: Signal[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);

  function openProfile(signal: Signal) {
    setLastSignal(signal);
    setOpenId(signal.id);
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-700">
        <table className="w-full min-w-[1250px] table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900">
              {columnHeaders.map((header) => (
                <th
                  key={header.label}
                  className={`px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-neutral-400 ${header.className ?? ""}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-neutral-800 dark:bg-neutral-900">
            {signals.map((signal) => (
              <SignalTableRow
                key={signal.id}
                signal={signal}
                onOpenProfile={() => openProfile(signal)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {lastSignal && (
        <ProfileDrawer signal={lastSignal} open={openId !== null} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
