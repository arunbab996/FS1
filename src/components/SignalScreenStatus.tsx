import { CircleCheck, Eye } from "lucide-react";
import { useState } from "react";
import type { Signal } from "../types";
import { personPhotoUrl } from "../utils/avatars";
import { CURRENT_USER_AVATAR_SEED, CURRENT_USER_NAME } from "../utils/currentUser";
import { HoverPopup } from "./HoverPopup";

function avatarSeedFor(name: string): string {
  return name === CURRENT_USER_NAME ? CURRENT_USER_AVATAR_SEED : name;
}

function ViewedByCard({ viewers }: { viewers: string[] }) {
  return (
    <>
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        Viewed by
      </p>
      {viewers.length > 0 ? (
        <div className="mt-2 flex flex-col gap-2">
          {viewers.map((name) => (
            <div key={name} className="flex items-center gap-2">
              <img
                src={personPhotoUrl(avatarSeedFor(name))}
                alt={name}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-sm font-medium text-gray-800 dark:text-neutral-100">
                {name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-sm text-gray-400 dark:text-neutral-500">No views yet</p>
      )}
    </>
  );
}

/**
 * Eye/view-count + "Screen" control, grouped in one pill since screening a
 * signal is what registers a view. Each person's view only counts once.
 */
export function SignalScreenStatus({
  signal,
  onScreen,
}: {
  signal: Signal;
  /** Called in addition to the internal state update, e.g. so a parent list can remove the row. */
  onScreen?: () => void;
}) {
  const [viewedBy, setViewedBy] = useState<string[]>(signal.viewedBy ?? []);
  const screened = viewedBy.includes(CURRENT_USER_NAME);

  function handleScreen() {
    if (screened) return;
    setViewedBy((prev) => [...prev, CURRENT_USER_NAME]);
    onScreen?.();
  }

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white py-0.5 pr-1 pl-2 dark:border-neutral-700 dark:bg-neutral-900">
      <HoverPopup
        variant="card"
        width={200}
        trigger={
          <span className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-neutral-400">
            <Eye className="h-3.5 w-3.5" />
            {viewedBy.length}
          </span>
        }
        content={<ViewedByCard viewers={viewedBy} />}
      />
      <span className="h-3.5 w-px bg-gray-200 dark:bg-neutral-700" />
      <button
        type="button"
        onClick={handleScreen}
        className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors ${
          screened
            ? "text-green-600 dark:text-green-400"
            : "cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        }`}
      >
        <CircleCheck className="h-3.5 w-3.5" />
        {screened ? "Screened" : "Screen"}
        {screened && (
          <img
            src={personPhotoUrl(CURRENT_USER_AVATAR_SEED)}
            alt={CURRENT_USER_NAME}
            className="h-4 w-4 shrink-0 rounded-full object-cover"
          />
        )}
      </button>
    </div>
  );
}
