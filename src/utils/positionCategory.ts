import type { PositionCategory } from "../types";

export function positionCategoryBarClasses(category: PositionCategory): string {
  switch (category) {
    case "corporate":
      return "bg-blue-500 dark:bg-blue-500";
    case "academia":
      return "bg-emerald-500 dark:bg-emerald-500";
    case "founder":
      return "bg-amber-500 dark:bg-amber-500";
    case "consulting":
      return "bg-gray-400 dark:bg-neutral-500";
  }
}

export function positionCategoryDotClasses(category: PositionCategory): string {
  switch (category) {
    case "corporate":
      return "bg-blue-500";
    case "academia":
      return "bg-emerald-500";
    case "founder":
      return "bg-amber-500";
    case "consulting":
      return "bg-gray-400";
  }
}

export const positionCategoryLabels: Record<PositionCategory, string> = {
  corporate: "Corporate",
  academia: "Academia",
  founder: "Founder",
  consulting: "Consulting",
};
