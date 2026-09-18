import { CheckSquare, Eye, Folder, Mail, Reply, Send, Square, UserPlus } from "lucide-react";
import { useState } from "react";
import type {
  EmailInteraction,
  InteractionItem,
  InteractionPerson,
  LinkedInTouchpoint,
  MeetingInteraction,
  MeetingNotesInteraction,
} from "../types";

type Filter = "all" | "outbound" | "email" | "notes" | "meeting";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "outbound", label: "Outbound" },
  { id: "email", label: "Email" },
  { id: "notes", label: "Notes" },
  { id: "meeting", label: "Meeting" },
];

const tagToneClasses: Record<MeetingNotesInteraction["tags"][number]["tone"], string> = {
  stage: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  temperature: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  visibility: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
};

function PersonChip({ person, size = "sm" }: { person: InteractionPerson; size?: "sm" | "xs" }) {
  const dim = size === "xs" ? "h-5 w-5" : "h-6 w-6";
  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${person.colorClasses}`}
    >
      {person.initials}
    </span>
  );
}

function linkedinActionMeta(action: LinkedInTouchpoint["action"]) {
  switch (action) {
    case "Sent":
      return { icon: Send, classes: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" };
    case "Replied":
      return { icon: Reply, classes: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400" };
    case "Opened":
      return { icon: Eye, classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" };
    case "Invite Accepted":
    case "Invite Done":
      return { icon: UserPlus, classes: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400" };
    case "Visit Done":
      return { icon: Eye, classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" };
  }
}

function LinkedInRow({ item }: { item: LinkedInTouchpoint }) {
  const meta = linkedinActionMeta(item.action);
  const Icon = meta.icon;
  return (
    <div className="rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-sm dark:border-neutral-700">
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.classes}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${meta.classes}`}>
              LinkedIn {item.action}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-gray-200 px-1.5 py-0.5 text-xs text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
              <Folder className="h-2.5 w-2.5" />
              {item.campaign}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
            <PersonChip person={item.from} size="xs" />
            {item.from.name}
            <span className="text-gray-300 dark:text-neutral-600">→</span>
            <PersonChip person={item.to} size="xs" />
            {item.to.name}
          </div>
          {item.preview && (
            <p className="mt-1.5 text-sm text-gray-700 dark:text-neutral-300">{item.preview}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs whitespace-nowrap text-gray-400 dark:text-neutral-500">
            {item.date} · {item.time}
          </p>
          <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            {item.direction}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmailRow({ item }: { item: EmailInteraction }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-sm dark:border-neutral-700">
      <div className="flex items-start gap-3">
        <PersonChip person={item.from} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-neutral-50">{item.from.name}</span>
            <span className="text-xs text-gray-400 dark:text-neutral-500">@{item.from.domain}</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {item.direction}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-800 dark:text-neutral-200">{item.subject}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">TO {item.to.join(", ")}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs whitespace-nowrap text-gray-400 dark:text-neutral-500">{item.date}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
            <Mail className="h-2.5 w-2.5" />
            Email
          </span>
        </div>
      </div>
    </div>
  );
}

const meetingStatusTileClasses: Record<MeetingInteraction["status"], string> = {
  Confirmed: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-500/10",
  Tentative: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-500/10",
  Cancelled: "border-gray-200 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800",
};

function MeetingRow({ item }: { item: MeetingInteraction }) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-sm dark:border-neutral-700">
      <div
        className={`flex w-11 shrink-0 flex-col items-center justify-center rounded-lg border py-1 ${meetingStatusTileClasses[item.status]}`}
      >
        <span className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
          {item.month}
        </span>
        <span className="text-base font-bold text-gray-900 dark:text-neutral-50">{item.day}</span>
        <span className="text-[10px] text-gray-400 dark:text-neutral-500">{item.weekday}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">{item.title}</p>
        <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          {item.status}
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {item.attendees.map((a, i) => (
              <span key={i} className="ring-2 ring-white dark:ring-neutral-900">
                <PersonChip person={a} size="xs" />
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400 dark:text-neutral-500">{item.attendees.length} attendees</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-medium whitespace-nowrap text-gray-700 dark:text-neutral-300">
          {item.durationLabel}
        </p>
        <p className="text-xs whitespace-nowrap text-gray-400 dark:text-neutral-500">{item.timeRange}</p>
        <span className="mt-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
          Meeting
        </span>
      </div>
    </div>
  );
}

function MeetingNotesCard({ item }: { item: MeetingNotesInteraction }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-sm dark:border-neutral-700">
      <div className="flex flex-wrap items-center gap-3">
        {item.attendees.map((a, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-neutral-300">
            <PersonChip person={a} size="xs" />
            {a.name}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-bold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        Action Items
      </p>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {item.actionItems.map((ai, i) =>
          ai.done ? (
            <div
              key={i}
              className="flex items-start gap-2 text-sm text-gray-400 line-through dark:text-neutral-500"
            >
              <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {ai.text}
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-neutral-300">
              <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-neutral-600" />
              {ai.text}
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-blue-600 dark:text-blue-400">
        {item.hashtags.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
        Attendees:{" "}
        {item.mentionedAttendees.map((n) => (
          <span key={n} className="text-blue-600 dark:text-blue-400">
            @{n}{" "}
          </span>
        ))}
        {item.extraMentionCount ? (
          <span className="text-blue-600 underline dark:text-blue-400">+{item.extraMentionCount} others</span>
        ) : null}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <PersonChip person={item.author} />
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-neutral-50">{item.author.name}</p>
            <p className="text-xs text-gray-400 dark:text-neutral-500">{item.date}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t.label}
              className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tagToneClasses[t.tone]}`}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InteractionsTimeline({ items }: { items: InteractionItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [affinityOn, setAffinityOn] = useState(false);

  const visible = items.filter((item) => {
    switch (filter) {
      case "all":
        return true;
      case "outbound":
        return (item.kind === "linkedin" || item.kind === "email") && item.direction === "Outbound";
      case "email":
        return item.kind === "email";
      case "notes":
        return item.kind === "meeting-notes";
      case "meeting":
        return item.kind === "meeting";
    }
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-neutral-800">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                filter === opt.id
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
                  : "text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAffinityOn((v) => !v)}
          className="flex shrink-0 items-center gap-2 text-xs font-medium text-gray-500 dark:text-neutral-400"
        >
          Affinity
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${
              affinityOn ? "bg-blue-600" : "bg-gray-200 dark:bg-neutral-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                affinityOn ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-3 border-l-2 border-gray-200 pl-5 dark:border-neutral-700">
        {visible.map((item, i) => {
          const isNewDay = i === 0 || visible[i - 1].date !== item.date;
          return (
            <div key={i}>
              {isNewDay && (
                <div className={`relative flex items-center gap-2 pb-2 ${i === 0 ? "" : "pt-1"}`}>
                  <span className="absolute -left-[25px] h-2.5 w-2.5 rounded-full border-2 border-gray-900 bg-white dark:border-neutral-100 dark:bg-neutral-900" />
                  <span className="text-[10px] font-bold tracking-wide text-gray-900 uppercase dark:text-neutral-100">
                    {item.date}
                  </span>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-neutral-800" />
                </div>
              )}
              {item.kind === "linkedin" && <LinkedInRow item={item} />}
              {item.kind === "email" && <EmailRow item={item} />}
              {item.kind === "meeting" && <MeetingRow item={item} />}
              {item.kind === "meeting-notes" && <MeetingNotesCard item={item} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
