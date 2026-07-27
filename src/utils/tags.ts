import type { TagCategory } from "../types";

export function tagColorClasses(category: TagCategory): string {
  switch (category) {
    case "momentum":
      return "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400";
    case "industry":
      return "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400";
    case "geography":
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    case "background":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  }
}
