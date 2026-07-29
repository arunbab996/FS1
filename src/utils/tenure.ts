/** Human-readable tenure label, e.g. 7 -> "7 mos", 38 -> "3 yrs 2 mos". */
export function formatTenureLabel(months: number): string {
  if (months < 1) return "<1 mo";
  if (months < 12) return `${months} mo${months === 1 ? "" : "s"}`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const yearsLabel = `${years} yr${years === 1 ? "" : "s"}`;
  if (remainder === 0) return yearsLabel;
  return `${yearsLabel} ${remainder} mo${remainder === 1 ? "" : "s"}`;
}
