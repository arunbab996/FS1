import {
  ArrowRight,
  ArrowUp,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Eye,
  LayoutGrid,
  List,
  MessageSquare,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  Undo2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Signal, SignalTag } from "../types";
import { personPhotoUrl } from "../utils/avatars";
import { tagColorClasses, tagIcon } from "../utils/tags";
import { CURRENT_USER_NAME } from "../utils/currentUser";
import { ProfileDrawer } from "./ProfileDrawer";

/**
 * "My View" — a v2 take on the Inbox, laid out as a morning brief: a written summary, an ask box,
 * the top five thesis matches to triage, and an FYI feed. Hidden behind a display-settings toggle.
 * All content here is static demo copy; names that have a real signal open its profile drawer.
 */

// The same tag styling (colour + icon) as the signal cards elsewhere in the app.
const tagByLabel = {
  "Investor Interest": { label: "Investor Interest", category: "investor-interest" },
  Stealth: { label: "Stealth", category: "stealth" },
  "New Company": { label: "New Company", category: "momentum" },
  Exploring: { label: "Exploring", category: "background" },
} satisfies Record<string, SignalTag>;

interface Match {
  id: string;
  name: string;
  tag: keyof typeof tagByLabel;
  summary: string;
}

const matches: Match[] = [
  {
    id: "achintya",
    name: "Achintya Gupta",
    tag: "Investor Interest",
    summary:
      "3one4 Capital started following him yesterday. This would be his second company in consumer essentials.",
  },
  {
    id: "sky",
    name: "Sky Wee",
    tag: "Investor Interest",
    summary:
      "Accel is now tracking him. He left his last company two weeks ago and is building in software.",
  },
  {
    id: "priya",
    name: "Priya Nair",
    tag: "Stealth",
    summary: 'Left Kestrel Pay after five years. Her LinkedIn now just says "Stealth".',
  },
  {
    id: "daniel",
    name: "Daniel Tan",
    tag: "New Company",
    summary: "Incorporated Loomwork Labs last week with a former teammate from Northwind AI.",
  },
  {
    id: "meera",
    name: "Meera Iyer",
    tag: "Exploring",
    summary:
      'Changed her headline to "Exploring what\'s next" after six years at a Series C logistics company.',
  },
];

interface Fyi {
  icon: LucideIcon;
  title: string;
  detail: string;
  label: string;
  highlight?: boolean;
}

const thingsToKnow: Fyi[] = [
  {
    icon: TrendingUp,
    title: "Lena Ho picked up two investor follows",
    detail: "You passed in September · Peak XV and Antler followed this week",
    label: "Revisit a pass",
    highlight: true,
  },
  {
    icon: Eye,
    title: "Rohan Mehta went stealth",
    detail: "Left Cobalt Robotics as VP Engineering · 2h ago",
    label: "Tracker",
  },
  {
    icon: Bookmark,
    title: '3 new people match "Ex-unicorn PMs in Jakarta"',
    detail: "Saved search · since yesterday",
    label: "Saved search",
  },
  {
    icon: MessageSquare,
    title: "Kai Wong posted about leaving Halcyon",
    detail: '"Last day today. Taking a few months to build something." · this morning',
    label: "Social activity",
  },
  {
    icon: Users,
    title: "2 teammates are also looking at Sky Wee",
    detail: "Team activity · check in before you reach out",
    label: "Team",
  },
];

const suggestions: { icon: LucideIcon; text: string }[] = [
  { icon: CircleHelp, text: "Why is Achintya in my inbox?" },
  { icon: UserRound, text: "Who left a top company this week?" },
];

const scopes = ["My thesis", "All signals", "Tracked list"] as const;
type Scope = (typeof scopes)[number];

type Decision = "pursue" | "pass";

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function TagPill({ tag: label }: { tag: keyof typeof tagByLabel }) {
  const tag: SignalTag = tagByLabel[label];
  const Icon = tagIcon(tag);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tagColorClasses(tag.category)}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {tag.label}
    </span>
  );
}

function PersonPhoto({ name, inline = false }: { name: string; inline?: boolean }) {
  const [failed, setFailed] = useState(false);
  // Inline photos sit in the brief's running text, so they're small and nudged onto the baseline.
  const size = inline ? "inline-flex h-6 w-6 align-[-0.35em] text-[10px]" : "flex h-10 w-10 text-xs";
  if (failed) {
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);
    return (
      <span className={`${size} shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300`}>
        {initials}
      </span>
    );
  }
  return (
    <img
      src={personPhotoUrl(name)}
      alt={name}
      onError={() => setFailed(true)}
      className={`${inline ? "inline-block h-6 w-6 align-[-0.35em]" : "h-10 w-10"} shrink-0 rounded-full object-cover`}
    />
  );
}

function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-neutral-50">
        {children}
      </h2>
      {aside}
    </div>
  );
}

function DecisionButtons({
  decision,
  onDecide,
}: {
  decision: Decision | undefined;
  onDecide: (decision: Decision | null) => void;
}) {
  if (decision) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
            decision === "pursue"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
              : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {decision === "pursue" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {decision === "pursue" ? "Pursuing" : "Passed"}
        </span>
        <button
          type="button"
          onClick={() => onDecide(null)}
          className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </button>
      </div>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => onDecide("pass")}
        className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        Pass
      </button>
      <button
        type="button"
        onClick={() => onDecide("pursue")}
        className="cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Pursue
      </button>
    </div>
  );
}

export function InboxV2View({
  signals,
  onOpenFullInbox,
}: {
  signals: Signal[];
  onOpenFullInbox: () => void;
}) {
  const [now] = useState(() => new Date());
  const firstName = CURRENT_USER_NAME.split(" ")[0];
  const dateLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const [layout, setLayout] = useState<"cards" | "list">("list");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("My thesis");
  const [scopeOpen, setScopeOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [drawerSignal, setDrawerSignal] = useState<Signal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) setScopeOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reviewedCount = matches.filter((m) => decisions[m.id]).length;
  const remaining = matches.length - reviewedCount;

  function signalFor(name: string): Signal | undefined {
    return signals.find((s) => s.personName === name);
  }

  function openProfile(name: string) {
    const signal = signalFor(name);
    if (!signal) return;
    setDrawerSignal(signal);
    setDrawerOpen(true);
  }

  function decide(id: string, decision: Decision | null) {
    setDecisions((prev) => {
      const next = { ...prev };
      if (decision) next[id] = decision;
      else delete next[id];
      return next;
    });
  }

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAskedQuestion(trimmed);
    setQuestion("");
  }

  function personName(name: string) {
    if (!signalFor(name)) return <span className="font-semibold text-gray-950 dark:text-neutral-50">{name}</span>;
    return (
      <button
        type="button"
        onClick={() => openProfile(name)}
        className="cursor-pointer font-semibold text-gray-950 underline decoration-gray-300 decoration-2 underline-offset-[6px] hover:decoration-gray-500 dark:text-neutral-50 dark:decoration-neutral-600 dark:hover:decoration-neutral-400"
      >
        {name}
      </button>
    );
  }

  return (
    <main id="main-scroll" className="relative flex-1 overflow-y-auto bg-[#faf9f7] dark:bg-neutral-950">
      <div aria-hidden className="today-backdrop pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
      <div className="relative mx-auto max-w-[920px] px-6 pt-10 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
            <Sun className="h-4 w-4" />
            {dateLabel}
          </p>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Customise
          </button>
        </div>

        <h1 className="mt-5 font-serif text-4xl leading-tight font-semibold tracking-tight text-gray-950 sm:text-[44px] dark:text-neutral-50">
          {greeting(now)}, {firstName}.
        </h1>

        {/* Written brief */}
        <div className="mt-5 space-y-4 text-base leading-[1.85] text-gray-800 dark:text-neutral-200">
          <p>
            <PersonPhoto name="Achintya Gupta" inline /> {personName("Achintya Gupta")} is your strongest
            match today. 3one4 Capital started following him yesterday and he&rsquo;s a repeat founder in
            consumer essentials, so start there. <PersonPhoto name="Sky Wee" inline />{" "}
            {personName("Sky Wee")} is a close second. Accel is tracking him after he left his last
            company.
          </p>
          <p>
            From your tracked list, <PersonPhoto name="Rohan Mehta" inline /> {personName("Rohan Mehta")}{" "}
            went stealth and <PersonPhoto name="Lena Ho" inline /> {personName("Lena Ho")}, who you
            passed on in September, picked up two investor follows.
          </p>
        </div>

        {/* Ask box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus-within:border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-neutral-600"
        >
          <label htmlFor="ask-firstsignal" className="text-xs font-medium text-gray-500 dark:text-neutral-400">
            Ask FirstSignal
          </label>
          <textarea
            id="ask-firstsignal"
            ref={inputRef}
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(question);
              }
            }}
            placeholder="Ask about a founder, your thesis, or tell me what to do..."
            className="mt-1 w-full resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="relative" ref={scopeRef}>
              <button
                type="button"
                onClick={() => setScopeOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Scope: {scope}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${scopeOpen ? "rotate-180" : ""}`} />
              </button>
              {scopeOpen && (
                <div className="absolute top-full left-0 z-20 mt-1.5 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {scopes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setScope(option);
                        setScopeOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left text-sm ${
                        option === scope
                          ? "font-medium text-blue-700 dark:text-blue-400"
                          : "text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {option}
                      {option === scope && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Send"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gray-950 text-white transition-opacity hover:bg-gray-800 disabled:cursor-default disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>

        {askedQuestion && (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-gray-900 dark:text-neutral-100">{askedQuestion}</p>
              <button
                type="button"
                onClick={() => setAskedQuestion(null)}
                aria-label="Dismiss"
                className="cursor-pointer text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-gray-500 dark:text-neutral-400">
              Searching {scope.toLowerCase()}… Answers aren&rsquo;t wired up in this prototype yet.
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map(({ icon: Icon, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => {
                setQuestion(text);
                inputRef.current?.focus();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Icon className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
              {text}
            </button>
          ))}
        </div>

        {/* Inbox */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionTitle
              aside={
                <>
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-500">
                    {remaining}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-neutral-400">Matched to your thesis today</span>
                </>
              }
            >
              Your inbox
            </SectionTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm whitespace-nowrap text-gray-500 dark:text-neutral-400">
                  {reviewedCount} of {matches.length} reviewed
                </span>
                <span className="h-1 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
                  <span
                    className="block h-full rounded-full bg-blue-600 transition-[width] dark:bg-blue-500"
                    style={{ width: `${(reviewedCount / matches.length) * 100}%` }}
                  />
                </span>
              </div>
              <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-neutral-800">
                {(
                  [
                    { value: "cards", label: "Cards", icon: LayoutGrid },
                    { value: "list", label: "List", icon: List },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLayout(value)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                      layout === value
                        ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-950 dark:text-neutral-50"
                        : "text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {layout === "list" ? (
            <ul className="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5 dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
              {matches.map((m) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-4 py-4 transition-opacity ${decisions[m.id] ? "opacity-60" : ""}`}
                >
                  <PersonPhoto name={m.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {personName(m.name)}
                      <TagPill tag={m.tag} />
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{m.summary}</p>
                  </div>
                  <DecisionButtons decision={decisions[m.id]} onDecide={(d) => decide(m.id, d)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-opacity dark:border-neutral-700 dark:bg-neutral-900 ${
                    decisions[m.id] ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PersonPhoto name={m.name} />
                    <div className="min-w-0">
                      {personName(m.name)}
                      <div className="mt-1">
                        <TagPill tag={m.tag} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm text-gray-600 dark:text-neutral-400">{m.summary}</p>
                  <div className="mt-4 flex justify-end">
                    <DecisionButtons decision={decisions[m.id]} onDecide={(d) => decide(m.id, d)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-gray-500 dark:text-neutral-400">
              Top 5 of today&rsquo;s 20 matches · also sent to your Slack digest at 8:00
            </p>
            <button
              type="button"
              onClick={onOpenFullInbox}
              className="flex cursor-pointer items-center gap-1 font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 dark:text-neutral-100 dark:hover:text-neutral-300"
            >
              Open full inbox <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Things to know */}
        <section className="mt-12">
          <SectionTitle>
            Things to know
          </SectionTitle>
          <ul className="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5 dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
            {thingsToKnow.map(({ icon: Icon, title, detail, label, highlight }) => (
              <li key={title} className="flex items-center gap-4 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-950 dark:text-neutral-50">{title}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-neutral-400">{detail}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                    highlight
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {drawerSignal && (
        <ProfileDrawer signal={drawerSignal} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
    </main>
  );
}
