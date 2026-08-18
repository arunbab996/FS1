/** Stable color per analyst, so the same person's initials always match across sections. */
const SOURCER_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-fuchsia-500",
];

export function sourcerColor(user: string): string {
  let hash = 0;
  for (let i = 0; i < user.length; i++) hash = (hash * 31 + user.charCodeAt(i)) | 0;
  return SOURCER_COLORS[Math.abs(hash) % SOURCER_COLORS.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
