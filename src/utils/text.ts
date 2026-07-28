/** Pulls the first **bolded** entity out of a headline — by convention, the person's name. */
export function extractPersonName(headline: string): string {
  const match = headline.match(/\*\*(.+?)\*\*/);
  return match ? match[1] : headline;
}

/** Strips ** markdown bold markers, for plain-text contexts. */
export function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "");
}
