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
