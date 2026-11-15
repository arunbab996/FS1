import type { Schedule, Weekday } from "../types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function hourLabel(hour: number): string {
  const suffix = hour < 12 ? "am" : "pm";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

export function describeSchedule(s: Schedule): string {
  if (s.kind === "daily") return `Every day at ${hourLabel(s.hour)}`;
  if (s.kind === "weekdays") return `Weekdays at ${hourLabel(s.hour)}`;
  return `Every ${DAY_NAMES[s.weekday]} at ${hourLabel(s.hour)}`;
}

/** For mid-sentence use: "every Monday at 8am" (day names keep their capital). */
export function scheduleInSentence(s: Schedule): string {
  const text = describeSchedule(s);
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Short form for chips and buttons, e.g. "every Monday". */
export function shortSchedule(s: Schedule): string {
  if (s.kind === "daily") return "every day";
  if (s.kind === "weekdays") return "every weekday";
  return `every ${DAY_NAMES[s.weekday]}`;
}

/** The first run time strictly after `from`. */
export function nextRunAfter(s: Schedule, from: Date): Date {
  const next = new Date(from);
  next.setMinutes(0, 0, 0);
  next.setHours(s.hour);
  if (next <= from) next.setDate(next.getDate() + 1);
  for (let i = 0; i < 8; i++) {
    const day = next.getDay() as Weekday;
    const ok = s.kind === "daily" || (s.kind === "weekdays" ? day !== 0 && day !== 6 : day === s.weekday);
    if (ok) return next;
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export const DEFAULT_SCHEDULE: Schedule = { kind: "weekly", weekday: 1, hour: 8 };

/** Options offered in schedule pickers. */
export const SCHEDULE_OPTIONS: { label: string; value: Schedule }[] = [
  { label: "Every Monday at 8am", value: { kind: "weekly", weekday: 1, hour: 8 } },
  { label: "Every day at 8am", value: { kind: "daily", hour: 8 } },
  { label: "Weekdays at 8am", value: { kind: "weekdays", hour: 8 } },
  { label: "Every Friday at 4pm", value: { kind: "weekly", weekday: 5, hour: 16 } },
];

export function scheduleKey(s: Schedule): string {
  return s.kind === "weekly" ? `weekly-${s.weekday}-${s.hour}` : `${s.kind}-${s.hour}`;
}

export function formatRunTime(iso: string | null, now = new Date()): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}
