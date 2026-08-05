/** Bands match the app's own Score filter (≥ 8 / > 5 & < 8 / ≤ 5). */
export function scoreColorClasses(score: number): string {
  if (score >= 8) {
    return "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/25";
  }
  if (score > 5) {
    return "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/25";
  }
  return "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25";
}

/** Text-only variant of scoreColorClasses, for plain (non-badge) score labels. */
export function scoreTextClasses(score: number): string {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score > 5) return "text-orange-600 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}
