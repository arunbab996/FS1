import type { SignalStatus } from "../types";

export function signalStatusColorClasses(status: SignalStatus): string {
  switch (status) {
    case "New Signal":
      return "text-green-500 dark:text-green-400";
    case "Repeat Signal":
      return "text-teal-500 dark:text-teal-400";
    case "Active Duplicate Signal":
      return "text-red-500 dark:text-red-400";
    case "Dormant Duplicate Signal":
      return "text-orange-500 dark:text-orange-400";
    case "Passed Repeat Signal":
      return "text-blue-500 dark:text-blue-400";
  }
}

/** Pastel pill variant of signalStatusColorClasses, for badge-style status labels. */
export function signalStatusPillClasses(status: SignalStatus): string {
  switch (status) {
    case "New Signal":
      return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400";
    case "Repeat Signal":
      return "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400";
    case "Active Duplicate Signal":
      return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    case "Dormant Duplicate Signal":
      return "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400";
    case "Passed Repeat Signal":
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
  }
}
