import { signals } from "../data/signals";

/** Color classes for the "Sourced via [tool]" badge, keyed by source name — each using that
 * brand's actual color (verified against official brand pages where available). */
export function sourcedViaColorClasses(source: string): string {
  switch (source) {
    case "YC":
      return "bg-[#F26625]/10 text-[#F26625] dark:bg-[#F26625]/20 dark:text-[#FF9A5C]";
    case "Product Hunt":
      return "bg-[#DA552F]/10 text-[#DA552F] dark:bg-[#DA552F]/20 dark:text-[#FF8E68]";
    case "Peerlist":
      return "bg-[#14B8A6]/10 text-[#0F9488] dark:bg-[#14B8A6]/20 dark:text-[#5EEAD4]";
    case "Futurepedia":
      return "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#C4B5FD]";
    case "BetaList":
      return "bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#93C5FD]";
    case "Hacker News":
      return "bg-[#FF6600]/10 text-[#FF6600] dark:bg-[#FF6600]/20 dark:text-[#FFA047]";
    case "X (Formerly Twitter)":
      return "bg-black/5 text-black dark:bg-white/10 dark:text-white";
    default:
      return "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-300";
  }
}

/** Discovery channels shown as each signal's "Sourced via" tag. */
const discoverySources = [
  "YC",
  "Product Hunt",
  "Peerlist",
  "Futurepedia",
  "BetaList",
  "Hacker News",
];

/** Stable signal id -> discovery channel assignment, cycled in data order so every channel
 * actually gets used (a per-id hash can easily skip one in a small dataset) and each signal
 * always gets the same one. Only signals that aren't already "Sourced by" a person need one. */
const discoverySourceMap: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  let i = 0;
  for (const signal of signals) {
    if (signal.sourcedBy) continue;
    map[signal.id] = discoverySources[i % discoverySources.length];
    i += 1;
  }
  return map;
})();

export function discoverySourceFor(signalId: string): string {
  return discoverySourceMap[signalId] ?? discoverySources[0];
}
