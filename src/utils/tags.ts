import type { TagCategory } from "../types";

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
  }
}
