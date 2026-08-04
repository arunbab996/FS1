import { Building2, Compass, EyeOff, Tag, Waypoints } from "lucide-react";
import type { SignalTag, TagCategory } from "../types";

export function tagIcon(tag: SignalTag) {
  if (tag.category === "investor-interest") return Tag;
  if (tag.category === "stealth") return EyeOff;
  if (tag.category === "thesis") return Waypoints;
  if (tag.label === "New Company") return Building2;
  if (tag.label === "Exploring") return Compass;
  return undefined;
}

export function tagColorClasses(category: TagCategory): string {
  switch (category) {
    case "momentum":
      return "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400";
    case "industry":
      return "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400";
    case "geography":
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    case "background":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
    case "investor-interest":
      return "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400";
    case "stealth":
      return "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400";
    case "thesis":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400";
  }
}

/** Text-only accent color for a category, e.g. for popover headers on a neutral card background. */
export function tagAccentTextClasses(category: TagCategory): string {
  switch (category) {
    case "momentum":
      return "text-teal-600 dark:text-teal-400";
    case "industry":
      return "text-cyan-600 dark:text-cyan-400";
    case "geography":
      return "text-blue-600 dark:text-blue-400";
    case "background":
      return "text-amber-600 dark:text-amber-400";
    case "investor-interest":
      return "text-pink-600 dark:text-pink-400";
    case "stealth":
      return "text-purple-600 dark:text-purple-400";
    case "thesis":
      return "text-indigo-600 dark:text-indigo-400";
  }
}
