import { ArrowUp, BookmarkCheck, CalendarClock, Check, ChevronDown, Inbox, ListPlus, RotateCcw, Sparkles, Wrench } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { demoInboxInvestor } from "../../data/inboxInvestor";
import type { Block } from "../agent/agent";
import { clearChat, finishStreaming, resolveAction, sendMessage, useChat, type ChatMessage } from "../agent/chatStore";
import { SUGGESTED_PROMPTS } from "../agent/prompts";
import { getPerson, useAssociateDb } from "../db/store";
import { SCHEDULE_OPTIONS, describeSchedule, scheduleInSentence, formatRunTime, scheduleKey } from "../jobs/schedule";
import { pending_matches } from "../tools";
import { PersonCard } from "./PersonCard";
import { AskContext, GoToTabContext } from "./context";

export function ChatPanel() {
  const chat = useChat();
  const db = useAssociateDb();
  const goTo = useContext(GoToTabContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages.length, chat.streamingId]);

  function submit(text: string) {
    if (!text.trim() || chat.streamingId) return;
    sendMessage(text);
    setInput("");
  }

  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(input);
      }}
      className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm focus-within:border-gray-300 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <textarea
        ref={inputRef}
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(input);
          }
        }}
        placeholder="Describe who you're looking for, or ask about a founder…"
        className="w-full resize-none bg-transparent px-1 text-[15px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="px-1 text-xs text-gray-400 dark:text-neutral-500">Searches FirstSignal data only · Enter to send</span>
        <button
          type="submit"
          disabled={!input.trim() || Boolean(chat.streamingId)}
          aria-label="Send"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gray-950 text-white hover:bg-gray-800 disabled:cursor-default disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-950"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </form>
  );

  return (
    <AskContext.Provider value={submit}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[820px] px-6 py-8">
            {chat.messages.length === 0 ? (
              <div>
                <h1 className="font-serif text-4xl leading-tight font-semibold tracking-tight text-gray-950 dark:text-neutral-50">Who are we looking for?</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
                  Tuned to your thesis: {demoInboxInvestor.thesisSummary.charAt(0).toLowerCase() + demoInboxInvestor.thesisSummary.slice(1)}. I search FirstSignal's people and signals, show you why each person matches, and can keep watching on a schedule.
                </p>
                <div className="mt-6">{composer}</div>
                <p className="mt-6 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">Try</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submit(prompt)}
                      className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                {db.savedSearches.length > 0 && (
                  <>
                    <div className="mt-8 flex items-center justify-between">
                      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">Your saved searches</p>
                      <button type="button" onClick={() => goTo("searches")} className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                        View all
                      </button>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {db.savedSearches.slice(0, 3).map((s) => {
                        const fresh = pending_matches(s.id).length;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => submit(`Run ${s.name}`)}
                            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-left hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-900"
                          >
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-neutral-100">{s.name}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">{describeSchedule(s.schedule)}</p>
                            <p className={`mt-2 text-xs font-medium ${fresh ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>{fresh ? `${fresh} new to review` : "Nothing new"}</p>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearChat}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  >
                    <RotateCcw className="h-3 w-3" />
                    New conversation
                  </button>
                </div>
                {chat.messages.map((m) => (
                  <Message key={m.id} message={m} streaming={chat.streamingId === m.id} onAsk={submit} />
                ))}
              </div>
            )}
          </div>
        </div>
        {chat.messages.length > 0 && (
          <div className="border-t border-gray-200 bg-[#faf9f7]/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
            <div className="mx-auto max-w-[820px] px-6 py-3">{composer}</div>
          </div>
        )}
      </div>
    </AskContext.Provider>
  );
}

function Message({ message, streaming, onAsk }: { message: ChatMessage; streaming: boolean; onAsk: (t: string) => void }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-gray-900 px-4 py-2.5 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900">{message.text}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <StreamedBlocks id={message.id} blocks={message.blocks ?? []} streaming={streaming} onAsk={onAsk} />
      </div>
    </div>
  );
}

/**
 * Reveals an assistant reply block by block, typing text out, so the reply reads as streamed.
 * Tool steps pause briefly as if the call were running.
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
      const t = setTimeout(() => setChars((c) => Math.min(block.text.length, c + 6)), 12);
      return () => clearTimeout(t);
    }
    const delay = block.kind === "tool" ? 450 : block.kind === "text" ? 60 : 120;
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      setChars(0);
    }, delay);
    return () => clearTimeout(t);
  }, [streaming, shown, chars, blocks, id]);

  const visible = streaming ? blocks.slice(0, shown + 1) : blocks;
  return (
    <div className="space-y-3">
      {visible.map((block, i) => {
        const isCurrent = streaming && i === shown;
        if (block.kind === "text") {
          const text = isCurrent ? block.text.slice(0, chars) : block.text;
          return (
            <p key={i} className="text-[15px] leading-relaxed text-gray-800 dark:text-neutral-200">
              {text}
              {isCurrent && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-gray-400 align-[-0.15em]" />}
            </p>
          );
        }
        if (isCurrent && block.kind !== "tool") return null;
        return <BlockView key={i} block={block} running={isCurrent} onAsk={onAsk} />;
      })}
    </div>
  );
}

function BlockView({ block, running, onAsk }: { block: Block; running: boolean; onAsk: (t: string) => void }) {
  switch (block.kind) {
    case "tool":
      return (
        <p className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 dark:text-neutral-500">
          {running ? <Wrench className="h-3 w-3 animate-pulse" /> : <Check className="h-3 w-3 text-emerald-500" />}
          {block.name}
          <span className="font-sans">· {running ? "running…" : block.summary}</span>
        </p>
      );
    case "criteria":
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-neutral-400">Here's how I read that:</span>
          {block.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
              {chip}
            </span>
          ))}
        </div>
      );
    case "results":
      return <Results block={block} />;
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
              className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
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

function Results({ block }: { block: Extract<Block, { kind: "results" }> }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? block.hits : block.hits.slice(0, 5);
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500 dark:text-neutral-400">
        <span className="font-medium text-gray-700 dark:text-neutral-200">{block.total} {block.total === 1 ? "match" : "matches"}</span>
        {block.title && <> · {block.title}</>}
      </p>
      <div className="space-y-2">
        {visible.map((hit) => (
          <PersonCard key={hit.personId} personId={hit.personId} reasons={hit.reasons} />
        ))}
      </div>
      {block.hits.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-neutral-50"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Show fewer" : `Show ${block.hits.length - 5} more`}
        </button>
      )}
    </div>
  );
}

/** A write the agent proposed. Nothing happens until the investor confirms here (or replies "yes"). */
function ActionCard({ actionId }: { actionId: string }) {
  const chat = useChat();
  const goTo = useContext(GoToTabContext);
  const action = chat.actions[actionId];
  const [name, setName] = useState(action?.type === "create_saved_search" ? action.name : "");
  const [scheduleKeyValue, setScheduleKeyValue] = useState(action?.type === "create_saved_search" ? scheduleKey(action.schedule) : "");
  if (!action) return null;

  const done = action.status !== "pending";
  const shell = `rounded-xl border p-4 ${done ? "border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900/60" : "border-blue-200 bg-blue-50/60 dark:border-blue-500/30 dark:bg-blue-500/10"}`;
  const buttons = (confirmLabel: string, onConfirm: () => void) =>
    done ? (
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400">
        {action.status === "confirmed" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
        {action.status === "confirmed" ? "Done" : "Cancelled"}
      </p>
    ) : (
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onConfirm} className="cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => resolveAction(actionId, false)}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
        >
          Not now
        </button>
      </div>
    );

  if (action.type === "create_saved_search") {
    const options = SCHEDULE_OPTIONS.some((o) => scheduleKey(o.value) === scheduleKey(action.schedule))
      ? SCHEDULE_OPTIONS
      : [{ label: describeSchedule(action.schedule), value: action.schedule }, ...SCHEDULE_OPTIONS];
    const selected = options.find((o) => scheduleKey(o.value) === scheduleKeyValue)?.value ?? action.schedule;
    return (
      <div className={shell}>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-neutral-100">
          <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {done && action.status === "confirmed" ? `Scheduled · ${scheduleInSentence(action.schedule)}` : "Save as a scheduled search"}
        </p>
        {!done && (
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_200px]">
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Runs
              <select
                value={scheduleKeyValue}
                onChange={(e) => setScheduleKeyValue(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {options.map((o) => (
                  <option key={scheduleKey(o.value)} value={scheduleKey(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {action.chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {action.chips.map((chip) => (
              <span key={chip} className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                {chip}
              </span>
            ))}
          </div>
        )}
        {!done && <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">Each run shows only people you haven't seen. Triaged people never come back.</p>}
        {buttons("Save and schedule", () => resolveAction(actionId, true, { name, schedule: selected }))}
        {done && action.status === "confirmed" && (
          <button type="button" onClick={() => goTo("searches")} className="mt-1 cursor-pointer text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
            Open Saved searches →
          </button>
        )}
      </div>
    );
  }

  const person = getPerson(action.personId);
  const isInbox = action.type === "send_to_inbox";
  return (
    <div className={shell}>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-neutral-100">
        {isInbox ? <Inbox className="h-4 w-4 text-blue-600" /> : <ListPlus className="h-4 w-4 text-blue-600" />}
        {isInbox ? `Send ${person?.name} to your Inbox?` : `Save ${person?.name} to ${action.list}?`}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {isInbox ? "They'll appear in My View with “From AI Associate”, and saved searches will stop showing them." : "Saved searches will stop showing them once they're on a list."}
      </p>
      {buttons(isInbox ? "Send to Inbox" : "Save", () => resolveAction(actionId, true))}
    </div>
  );
}

function SearchList({ ids, onAsk }: { ids: string[]; onAsk: (t: string) => void }) {
  const db = useAssociateDb();
  const searches = db.savedSearches.filter((s) => ids.includes(s.id));
  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
      {searches.map((s) => (
        <div key={s.id} className="flex items-center gap-3 px-4 py-3">
          <BookmarkCheck className="h-4 w-4 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-neutral-100">{s.name}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {describeSchedule(s.schedule)} · next {formatRunTime(s.nextRunAt)} · {pending_matches(s.id).length} new
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
