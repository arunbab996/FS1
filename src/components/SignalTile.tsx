import { ChevronDown, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Signal } from "../types";
import { personPhotoUrl } from "../utils/avatars";
import { countryFlag } from "../utils/flags";
import { scoreColorClasses } from "../utils/score";
import { tagColorClasses } from "../utils/tags";
import { AssignInvestorButton } from "./AssignInvestorButton";
import { ExperienceColumn } from "./ExperienceColumn";
import { Highlight } from "./Highlight";
import { LinkedinIcon } from "./icons/LinkedinIcon";
import { TwitterIcon } from "./icons/TwitterIcon";

export function SignalTile({ signal }: { signal: Signal }) {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 transition-[box-shadow,border-color] hover:border-gray-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-neutral-600">

      {/* Row 1 — tags + score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {signal.tags.map((tag) => (
            <span
              key={tag.label}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagColorClasses(tag.category)}`}
            >
              {tag.label}
              {tag.category === "geography" && countryFlag(tag.label) && (
                <span className="ml-1">{countryFlag(tag.label)}</span>
              )}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowReasoning((v) => !v)}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold transition-colors ${scoreColorClasses(signal.score)}`}
        >
          {signal.score.toFixed(1)}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              showReasoning ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Row 2 — event headline */}
      <div className="mt-2 flex gap-2.5">
        <img
          src={personPhotoUrl(signal.id)}
          alt={signal.avatarInitials}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="text-sm leading-snug text-gray-700 dark:text-neutral-200">
            <Highlight text={signal.headline} />
          </p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-400">
            {signal.contextLine}
          </p>
        </div>
      </div>

      {/* Score reasoning panel */}
      {showReasoning && (
        <div className="mt-2 rounded-lg bg-gray-50 p-2 dark:bg-neutral-800">
          <p className="text-xs font-medium text-gray-500 dark:text-neutral-300">
            Why {signal.score.toFixed(1)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {signal.reasoning.positives.map((point) => (
              <span
                key={point}
                className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-400"
              >
                + {point}
              </span>
            ))}
            {signal.reasoning.negatives.map((point) => (
              <span
                key={point}
                className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
              >
                − {point}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Row 3 — Current / Past / Education */}
      <div className="mt-2 flex gap-1.5">
        <ExperienceColumn label="Current" entries={signal.current} />
        <ExperienceColumn label="Past" entries={signal.past} />
        <ExperienceColumn label="Education" entries={signal.education} />
      </div>

      {/* Row 4 — action bar */}
      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-neutral-700">
        <AssignInvestorButton />

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="View LinkedIn"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <LinkedinIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="View on Twitter/X"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <TwitterIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Send email"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <Mail className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-neutral-700" />
          <button
            type="button"
            aria-label="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
