export type TagCategory = "momentum" | "industry" | "geography" | "background";

export interface SignalTag {
  label: string;
  category: TagCategory;
}

export interface ExperienceEntry {
  company: string;
  role: string;
}

export interface SignalReasoning {
  positives: string[];
  negatives: string[];
}

export interface Signal {
  id: string;
  dateGroup: "Today · Jul 27" | "Yesterday · Jul 26";
  tags: SignalTag[];
  score: number;
  avatarInitials: string;
  /** Headline text. Wrap entities in **double asterisks** to bold them. */
  headline: string;
  contextLine: string;
  current: ExperienceEntry[];
  past: ExperienceEntry[];
  education: ExperienceEntry[];
  reasoning: SignalReasoning;
}
