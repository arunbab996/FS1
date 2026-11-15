import { createContext, useContext } from "react";

/** Lets any card open the profile panel, which the Associate view hosts once. */
export const OpenProfileContext = createContext<(personId: string) => void>(() => {});
export const useOpenProfile = () => useContext(OpenProfileContext);

/** Lets cards ask the chat a follow-up ("Tell me more about…"). */
export const AskContext = createContext<(text: string) => void>(() => {});
export const useAsk = () => useContext(AskContext);

/** Lets chat cards jump to another Associate tab (e.g. Saved searches). */
export const GoToTabContext = createContext<(tab: "chat" | "searches" | "briefing") => void>(() => {});
