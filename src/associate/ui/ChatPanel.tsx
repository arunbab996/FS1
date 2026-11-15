import { ArrowUp, CalendarClock, Check, Copy, Inbox, ListPlus, Pencil, Square, UsersRound } from "lucide-react";
import { useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { CURRENT_USER_NAME, useCurrentUserAvatarUrl } from "../../utils/currentUser";
import type { Block } from "../agent/agent";
import { clearChat, finishStreaming, resolveAction, sendMessage, useChat, type ChatMessage } from "../agent/chatStore";
import { SUGGESTIONS } from "../agent/prompts";
import { understandQuery } from "../agent/understand";
import { AGENT_NAME } from "../brand";
import { criterionTone } from "../criteria";
import { getPerson, useAssociateDb } from "../db/store";
import { SCHEDULE_OPTIONS, describeSchedule, scheduleInSentence, scheduleKey } from "../jobs/schedule";
import { pending_matches } from "../tools";
import { DoriotMark } from "./DoriotMark";
import { PersonCard } from "./PersonCard";
import { ResultsTable } from "./ResultsTable";
import { AskContext, GoToTabContext } from "./context";

const STEP_MS = 380;

export function ChatPanel() {
  const chat = useChat();
  const db = useAssociateDb();
  const goTo = useContext(GoToTabContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const firstName = CURRENT_USER_NAME.split(" ")[0];
  const streaming = Boolean(chat.streamingId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages.length, chat.streamingId]);

  function submit(text: string) {
    if (!text.trim() || streaming) return;
    sendMessage(text);
    setInput("");
  }

  function edit(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  const composer = (
    <Composer
      inputRef={inputRef}
      value={input}
      onChange={setInput}
      onSubmit={() => submit(input)}
      streaming={streaming}
      onStop={() => chat.streamingId && finishStreaming(chat.streamingId)}
    />
  );

  if (chat.messages.length === 0) {
    return (
      <AskContext.Provider value={submit}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-[720px] flex-col items-center justify-center px-6 py-12">
            <DoriotMark size={46} />
            <h1 className="mt-5 text-center text-[26px] font-medium tracking-tight text-gray-900 dark:text-neutral-50">
              Hey {firstName}, who are we looking for?
            </h1>
            <p className="mt-2 max-w-[520px] text-center text-sm text-gray-500 dark:text-neutral-400">
              {AGENT_NAME} searches FirstSignal's people and signals, explains every match, and keeps watching on a schedule.
            </p>
            <div className="mt-8 w-full">{composer}</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  title={s.prompt}
                  onClick={() => submit(s.prompt)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-[0_1px_1px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>

            {db.savedSearches.length > 0 && (
              <div className="mt-12 w-full">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-neutral-500">Watching</p>
                  <button type="button" onClick={() => goTo("searches")} className="cursor-pointer text-xs text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                    All saved searches →
                  </button>
                </div>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
                  {db.savedSearches.slice(0, 3).map((s) => {
                    const fresh = pending_matches(s.id).length;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => submit(`Run ${s.name}`)}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                      >
                        <CalendarClock className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-neutral-100">{s.name}</span>
                        <span className="text-xs text-gray-400 dark:text-neutral-500">{describeSchedule(s.schedule)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${fresh ? "bg-gray-950 text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-gray-100 text-gray-400 dark:bg-neutral-800"}`}>
                          {fresh} new
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </AskContext.Provider>
    );
  }

  return (
    <AskContext.Provider value={submit}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[900px] px-6 pt-8 pb-10">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={clearChat} className="cursor-pointer rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800">
                New search
              </button>
            </div>
            <div className="space-y-8">
              {chat.messages.map((m) => (
                <Message key={m.id} message={m} streaming={chat.streamingId === m.id} onEdit={edit} onAsk={submit} />
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[104px] h-10 bg-gradient-to-t from-white to-transparent dark:from-neutral-950" />
        <div className="shrink-0 bg-white dark:bg-neutral-950">
          <div className="mx-auto max-w-[900px] px-6 pt-1 pb-5">{composer}</div>
        </div>
      </div>
    </AskContext.Provider>
  );
}

function Composer({
  inputRef,
  value,
  onChange,
  onSubmit,
  streaming,
  onStop,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  streaming: boolean;
  onStop: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl border border-gray-200 bg-white px-4 pt-3 pb-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-shadow focus-within:shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-neutral-900"
    >
      <textarea
        ref={inputRef}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Describe the founders you're looking for…"
        className="w-full resize-none bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
      />
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
          <UsersRound className="h-3.5 w-3.5" />
          People · FirstSignal data
        </span>
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-950 px-3.5 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Square className="h-3 w-3 fill-current" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Send"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gray-950 text-white transition-opacity hover:bg-gray-800 disabled:cursor-default disabled:opacity-25 dark:bg-neutral-100 dark:text-neutral-950"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

/** The user's request, with the phrases that became filters highlighted in their criterion colour. */
function HighlightedQuery({ text }: { text: string }) {
  const { spans } = understandQuery(text);
  const lower = text.toLowerCase();
  const marks: { start: number; end: number; kind: keyof typeof criterionTone }[] = [];
  for (const span of spans) {
    const start = lower.indexOf(span.text.toLowerCase());
    if (start < 0 || !span.text) continue;
    const end = start + span.text.length;
    if (marks.some((m) => start < m.end && end > m.start)) continue;
    marks.push({ start, end, kind: span.kind });
  }
  marks.sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  marks.forEach((m, i) => {
    if (m.start > cursor) parts.push(text.slice(cursor, m.start));
    parts.push(
      <mark key={i} className={`rounded-md px-1 py-px ring-1 ${criterionTone[m.kind].mark}`}>
        {text.slice(m.start, m.end)}
      </mark>,
    );
    cursor = m.end;
  });
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function Message({ message, streaming, onEdit, onAsk }: { message: ChatMessage; streaming: boolean; onEdit: (t: string) => void; onAsk: (t: string) => void }) {
  const [avatar] = useCurrentUserAvatarUrl();
  const [copied, setCopied] = useState(false);
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-2">
        <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
        <p className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-2.5 text-[15px] leading-7 text-gray-900 dark:bg-neutral-800 dark:text-neutral-100">
          <HighlightedQuery text={message.text ?? ""} />
        </p>
        <div className="flex gap-0.5 text-gray-400">
          <button type="button" title="Edit" aria-label="Edit" onClick={() => onEdit(message.text ?? "")} className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Copy"
            aria-label="Copy"
            onClick={() => {
              navigator.clipboard?.writeText(message.text ?? "").catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0">
        <DoriotMark size={22} active={streaming} />
      </span>
      <div className="min-w-0 flex-1">
        <StreamedBlocks id={message.id} blocks={message.blocks ?? []} streaming={streaming} onAsk={onAsk} />
      </div>
    </div>
  );
}

/**
 * Reveals an assistant reply block by block: the working steps tick off, then text types out,
 * then results appear. Stop (or finishing) shows everything at once.
 */
function StreamedBlocks({ id, blocks, streaming, onAsk }: { id: string; blocks: Block[]; streaming: boolean; onAsk: (t: string) => void }) {
  const [shown, setShown] = useState(streaming ? 0 : blocks.length);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!streaming) return;
    if (shown >= blocks.length) {
      finishStreaming(id);
      return;
    }
    const block = blocks[shown];
    if (block.kind === "text" && chars < block.text.length) {
      const t = setTimeout(() => setChars((c) => Math.min(block.text.length, c + 7)), 12);
      return () => clearTimeout(t);
    }
    const delay = block.kind === "steps" ? block.steps.length * STEP_MS + 150 : block.kind === "tool" ? 450 : block.kind === "text" ? 60 : 120;
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      setChars(0);
    }, delay);
    return () => clearTimeout(t);
  }, [streaming, shown, chars, blocks, id]);

  const visible = streaming ? blocks.slice(0, shown + 1) : blocks;
  return (
    <div className="space-y-4">
      {visible.map((block, i) => {
        const isCurrent = streaming && i === shown;
        if (block.kind === "text") {
          const text = isCurrent ? block.text.slice(0, chars) : block.text;
          return (
            <p key={i} className="text-[15px] leading-relaxed text-gray-800 dark:text-neutral-200">
              {text}
              {isCurrent && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-gray-300 align-[-0.15em]" />}
            </p>
          );
        }
        if (block.kind === "steps") return <Steps key={i} block={block} running={isCurrent} />;
        if (isCurrent && block.kind !== "tool") return null;
        return <BlockView key={i} block={block} running={isCurrent} onAsk={onAsk} />;
      })}
    </div>
  );
}

function Spinner() {
  return <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-gray-300 border-t-gray-700 dark:border-neutral-600 dark:border-t-neutral-200" />;
}

/** "Thought for 1.4s" and a checklist of what the agent did, ticking off one step at a time. */
function Steps({ block, running }: { block: Extract<Block, { kind: "steps" }>; running: boolean }) {
  const [done, setDone] = useState(running ? 0 : block.steps.length);
  useEffect(() => {
    if (!running || done >= block.steps.length) return;
    const t = setTimeout(() => setDone((d) => d + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [running, done, block.steps.length]);
  const complete = !running || done >= block.steps.length;
  const count = running ? done : block.steps.length;

  return (
    <div>
      <p className={`text-sm ${complete ? "text-gray-400 dark:text-neutral-500" : "animate-pulse text-gray-500 dark:text-neutral-400"}`}>
        {complete ? `Thought for ${block.seconds}s` : "Thinking…"}
      </p>
      <ul className="mt-2.5 space-y-2">
        {block.steps.map((step, i) => {
          if (i > count) return null;
          const finished = i < count;
          return (
            <li key={step} className={`flex items-center gap-2.5 text-sm ${finished ? "text-gray-700 dark:text-neutral-300" : "text-gray-500 dark:text-neutral-400"}`}>
              {finished ? <Check className="h-3.5 w-3.5 text-gray-900 dark:text-neutral-100" /> : <Spinner />}
              {step}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const TOOL_LABELS: Record<string, string> = {
  get_profile: "Read the profile",
  find_similar: "Found lookalikes",
  run_saved_search: "Ran saved search",
  list_saved_searches: "Checked your saved searches",
  search_people: "Searched",
};

function BlockView({ block, running, onAsk }: { block: Block; running: boolean; onAsk: (t: string) => void }) {
  switch (block.kind) {
    case "tool":
      return (
        <p className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-neutral-400">
          {running ? <Spinner /> : <Check className="h-3.5 w-3.5 text-gray-900 dark:text-neutral-100" />}
          {TOOL_LABELS[block.name] ?? block.name}
          <span className="text-gray-400 dark:text-neutral-500">· {block.summary}</span>
        </p>
      );
    case "results":
      return block.total > 0 ? (
        <div className="space-y-3">
          <span className="inline-flex rounded-xl bg-gray-100 px-3.5 py-2 text-sm text-gray-800 dark:bg-neutral-800 dark:text-neutral-100">
            Found {block.total} {block.total === 1 ? "person" : "people"} matching your criteria
          </span>
          <ResultsTable title={block.title} hits={block.hits} total={block.total} filters={block.filters} />
        </div>
      ) : null;
    case "profile":
      return <PersonCard personId={block.personId} reasons={[]} />;
    case "action":
      return <ActionCard actionId={block.actionId} />;
    case "searches":
      return <SearchList ids={block.ids} onAsk={onAsk} />;
    case "suggestions":
      return (
        <div className="flex flex-wrap gap-2">
          {block.items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onAsk(item)}
              className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {item}
            </button>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/** A write the agent proposed. Nothing happens until the investor confirms here (or replies "yes"). */
function ActionCard({ actionId }: { actionId: string }) {
  const chat = useChat();
  const goTo = useContext(GoToTabContext);
  const action = chat.actions[actionId];
  const [name, setName] = useState(action?.type === "create_saved_search" ? action.name : "");
  const [key, setKey] = useState(action?.type === "create_saved_search" ? scheduleKey(action.schedule) : "");
  if (!action) return null;
  const pending = action.status === "pending";

  const shell = "rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900";
  const iconBox = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200";
  const status =
    action.status === "cancelled" ? (
      <p className="mt-2 text-sm text-gray-400">Not now — nothing was saved.</p>
    ) : null;

  if (action.type === "create_saved_search") {
    const options = SCHEDULE_OPTIONS.some((o) => scheduleKey(o.value) === scheduleKey(action.schedule))
      ? SCHEDULE_OPTIONS
      : [{ label: describeSchedule(action.schedule), value: action.schedule }, ...SCHEDULE_OPTIONS];
    const selected = options.find((o) => scheduleKey(o.value) === key)?.value ?? action.schedule;
    return (
      <div className={shell}>
        <div className="flex gap-3">
          <span className={iconBox}>
            <CalendarClock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">
              {action.status === "confirmed" ? `Watching “${action.name}”` : `Want me to run this ${scheduleInSentence(selected).replace(/ at .*/, "")}?`}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">
              {action.status === "confirmed"
                ? `Runs ${scheduleInSentence(action.schedule)}. Only people you haven't seen will show up.`
                : "I'll only bring you people you haven't seen. Anyone you triage never comes back."}
            </p>
            {pending && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Search name"
                  className="min-w-[220px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  aria-label="Schedule"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  {options.map((o) => (
                    <option key={scheduleKey(o.value)} value={scheduleKey(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => resolveAction(actionId, true, { name, schedule: selected })}
                  className="cursor-pointer rounded-lg bg-gray-950 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Schedule
                </button>
                <button type="button" onClick={() => resolveAction(actionId, false)} className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800">
                  Not now
                </button>
              </div>
            )}
            {action.status === "confirmed" && (
              <button type="button" onClick={() => goTo("searches")} className="mt-2 cursor-pointer text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 dark:text-neutral-100">
                Open Saved searches
              </button>
            )}
            {status}
          </div>
        </div>
      </div>
    );
  }

  const person = getPerson(action.personId);
  const isInbox = action.type === "send_to_inbox";
  return (
    <div className={shell}>
      <div className="flex gap-3">
        <span className={iconBox}>{isInbox ? <Inbox className="h-4 w-4" /> : <ListPlus className="h-4 w-4" />}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">
            {action.status === "confirmed"
              ? isInbox
                ? `Sent ${person?.name} to your Inbox`
                : `Saved ${person?.name} to ${action.list}`
              : isInbox
                ? `Send ${person?.name} to your Inbox?`
                : `Save ${person?.name} to ${action.list}?`}
          </p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">
            {isInbox ? `They'll appear in My View marked “From ${AGENT_NAME}”.` : "Saved people stop showing up in saved searches."}
          </p>
          {pending && (
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => resolveAction(actionId, true)} className="cursor-pointer rounded-lg bg-gray-950 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900">
                {isInbox ? "Send" : "Save"}
              </button>
              <button type="button" onClick={() => resolveAction(actionId, false)} className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800">
                Cancel
              </button>
            </div>
          )}
          {status}
        </div>
      </div>
    </div>
  );
}

function SearchList({ ids, onAsk }: { ids: string[]; onAsk: (t: string) => void }) {
  const db = useAssociateDb();
  const searches = db.savedSearches.filter((s) => ids.includes(s.id));
  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {searches.map((s) => (
        <div key={s.id} className="flex items-center gap-3 px-4 py-3">
          <CalendarClock className="h-4 w-4 shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-neutral-100">{s.name}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {describeSchedule(s.schedule)} · {pending_matches(s.id).length} new
            </p>
          </div>
          <button type="button" onClick={() => onAsk(`Run ${s.name}`)} className="cursor-pointer rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-200">
            Run now
          </button>
        </div>
      ))}
    </div>
  );
}
