/** Color classes for the "Sourced via [tool]" badge, keyed by source name. */
export function sourcedViaColorClasses(source: string): string {
  switch (source) {
    case "Specter":
      return "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400";
    case "January Capital":
      return "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-300";
    case "Evertrace":
      return "bg-gray-100 text-gray-600 dark:bg-neutral-700/50 dark:text-neutral-300";
    case "Open Source":
      return "bg-[#e5efe9] text-[#004225] dark:bg-[#004225]/25 dark:text-[#6fbf9a]";
    default:
      return "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-300";
  }
}
