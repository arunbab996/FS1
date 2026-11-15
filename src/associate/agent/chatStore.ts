import { useSyncExternalStore } from "react";
import { CURRENT_USER_NAME } from "../../utils/currentUser";
import { getPerson } from "../db/store";
import { scheduleInSentence } from "../jobs/schedule";
import * as tools from "../tools";
import type { Schedule } from "../types";
import { respond, type AgentContext, type Block, type PendingAction } from "./agent";

/**
 * Conversation state for the chat panel. Kept at module level so switching tabs or views doesn't
 * lose the conversation. Pending actions live here until the investor confirms or cancels them;
 * only then does the matching write tool run.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  blocks?: Block[];
}

interface ChatState {
  messages: ChatMessage[];
  context: AgentContext;
  actions: Record<string, PendingAction & { resultText?: string }>;
  /** Id of the assistant message currently being revealed, for the streaming effect. */
  streamingId: string | null;
}

let state: ChatState = { messages: [], context: {}, actions: {}, streamingId: null };
const listeners = new Set<() => void>();
const uid = () => Math.random().toString(36).slice(2, 10);

function set(next: Partial<ChatState>) {
  state = { ...state, ...next };
  for (const l of listeners) l();
}

export function useChat(): ChatState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function sendMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const userMessage: ChatMessage = { id: uid(), role: "user", text: trimmed };
  const turn = respond(trimmed, state.context);
  const actions = { ...state.actions };
  for (const action of turn.actions) actions[action.id] = action;
  set({ messages: [...state.messages, userMessage], context: turn.context, actions });

  if (turn.resolve) {
    resolveAction(turn.resolve.actionId, turn.resolve.confirm);
    return;
  }
  const reply: ChatMessage = { id: uid(), role: "assistant", blocks: turn.blocks };
  set({ messages: [...state.messages, reply], streamingId: reply.id });
}

export function finishStreaming(id: string) {
  if (state.streamingId === id) set({ streamingId: null });
}

export function clearChat() {
  set({ messages: [], context: {}, actions: {}, streamingId: null });
}

function say(text: string) {
  const reply: ChatMessage = { id: uid(), role: "assistant", blocks: [{ kind: "text", text }] };
  set({ messages: [...state.messages, reply], streamingId: reply.id });
}

/**
 * Confirm or cancel an action the agent proposed. Confirming runs the write tool; the investor
 * can adjust a saved search's name and schedule on the card before confirming.
 */
export function resolveAction(id: string, confirm: boolean, edits?: { name?: string; schedule?: Schedule }) {
  const action = state.actions[id];
  if (!action || action.status !== "pending") return;
  if (!confirm) {
    set({ actions: { ...state.actions, [id]: { ...action, status: "cancelled" } }, context: { ...state.context, pendingActionId: undefined } });
    say("No problem — nothing was saved.");
    return;
  }

  let resultText = "";
  let updated: PendingAction = { ...action, status: "confirmed" };
  if (action.type === "create_saved_search") {
    const name = edits?.name?.trim() || action.name;
    const schedule = edits?.schedule ?? action.schedule;
    const created = tools.create_saved_search({ name, query: action.query, filters: action.filters, schedule });
    updated = { ...action, name, schedule, status: "confirmed" };
    resultText = `Saved “${created.name}”. It runs ${scheduleInSentence(schedule)}, and each run only brings people you haven't seen or triaged. You'll find it on the Saved searches tab.`;
  } else if (action.type === "send_to_inbox") {
    const sent = tools.send_to_inbox({ person_id: action.personId, source: "AI Associate" });
    resultText = `Sent ${getPerson(action.personId)?.name} to ${sent.investor === CURRENT_USER_NAME ? "your" : `${sent.investor}'s`} Inbox. They'll show up in My View.`;
  } else if (action.type === "save_to_list") {
    const saved = tools.save_to_list({ person_id: action.personId, list: action.list });
    resultText = `Saved ${getPerson(action.personId)?.name} to ${saved.list_name}.`;
  }
  set({
    actions: { ...state.actions, [id]: { ...updated, resultText } },
    context: { ...state.context, pendingActionId: undefined },
  });
  say(resultText);
}
