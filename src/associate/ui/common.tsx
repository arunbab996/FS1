import { useState } from "react";
import { personPhotoUrl } from "../../utils/avatars";
import { tagColorClasses, tagIcon } from "../../utils/tags";
import { relativeDays } from "../search/search";
import type { SignalType } from "../types";
import { signalTags } from "./adapters";

export function SignalPill({ type, date }: { type: SignalType; date?: string }) {
  const tag = signalTags[type];
  const Icon = tagIcon(tag);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tagColorClasses(tag.category)}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {tag.label}
      {date && <span className="opacity-70">· {relativeDays(date)}</span>}
    </span>
  );
}

export function PersonAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const box = size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs";
  if (failed) {
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);
    return (
      <span className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300`}>
        {initials}
      </span>
    );
  }
  return <img src={personPhotoUrl(name)} alt={name} onError={() => setFailed(true)} className={`${box} shrink-0 rounded-full object-cover`} />;
}

