export type TagCategory = "momentum" | "industry" | "geography" | "background";

export type SignalStatus =
  | "New Signal"
  | "Repeat Signal"
  | "Active Duplicate Signal"
  | "Dormant Duplicate Signal"
  | "Passed Repeat Signal";

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
  status: SignalStatus;
  tags: SignalTag[];
  score: number;
  avatarInitials: string;
  /** Headline text. Wrap entities in **double asterisks** to bold them. */
  headline: string;
  contextLine: string;
  aiSummary: string;
  /** Who originally sourced/surfaced this signal, e.g. a network contact. */
  sourcedBy?: string;
  /** Pre-filled investor assignment, if this signal already has one. */
  assignedInvestor?: string;
  assignedStage?: string;
  current: ExperienceEntry[];
  past: ExperienceEntry[];
  education: ExperienceEntry[];
  reasoning: SignalReasoning;
}
