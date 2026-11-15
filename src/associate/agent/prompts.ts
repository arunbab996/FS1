/**
 * Suggested prompts on the chat home, written from the investor's thesis (technical founders
 * across Southeast Asia and India). The seed data guarantees each one returns real matches.
 */
export const SUGGESTED_PROMPTS = [
  "Ex-Grab engineers who went stealth in the last 3 months, building in AI infra",
  "Repeat founders in Indonesia who started a new company recently",
  "Fintech product leaders from Sea or Shopee exploring what's next",
  "Technical founders in India with investor interest in the last 30 days",
  "Ex-Gojek or Tokopedia engineers building developer tools",
  "ML researchers in Singapore who went stealth",
];

/** Short labels for the suggestion pills; clicking one sends the full prompt. */
export const SUGGESTIONS: { label: string; prompt: string; dot: string }[] = [
  { label: "Ex-Grab AI infra, gone stealth", prompt: SUGGESTED_PROMPTS[0], dot: "bg-violet-500" },
  { label: "Repeat founders in Indonesia", prompt: SUGGESTED_PROMPTS[1], dot: "bg-amber-500" },
  { label: "Sea & Shopee fintech PMs exploring", prompt: SUGGESTED_PROMPTS[2], dot: "bg-sky-500" },
  { label: "India founders with investor interest", prompt: SUGGESTED_PROMPTS[3], dot: "bg-pink-500" },
  { label: "Gojek & Tokopedia devtools engineers", prompt: SUGGESTED_PROMPTS[4], dot: "bg-indigo-500" },
  { label: "Singapore ML researchers in stealth", prompt: SUGGESTED_PROMPTS[5], dot: "bg-emerald-500" },
];
