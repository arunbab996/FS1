/** Color classes for the "Sourced via [tool]" badge, keyed by source name. */
export function sourcedViaColorClasses(source: string): string {
  switch (source) {
    case "Specter":
      return "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400";
    case "January Capital":
      return "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-300";
    default:
      return "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-300";
  }
}
