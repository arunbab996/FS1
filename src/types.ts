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

export type PositionCategory = "corporate" | "academia" | "founder" | "consulting";

export interface ProfilePosition {
  company: string;
  title: string;
  period: string;
  months: number;
  category: PositionCategory;
  tag?: string;
  description?: string;
  companyMeta?: string[];
}

export interface ProfileEducationEntry {
  school: string;
  badge?: string;
  degree: string;
  period: string;
}

export interface ProfileActivityItem {
  kind:
    | "sourced"
    | "connected"
    | "linkedin-sent"
    | "linkedin-replied"
    | "linkedin-opened"
    | "meeting"
    | "status";
  text: string;
  date: string;
  direction?: "Outbound" | "Inbound";
  tags?: string[];
}

export interface TalentProfile {
  titleLine: string;
  connections: number;
  followers: number;
  rolesHeld: number;
  avgTenureMonths: number;
  location: string;
  overview: string;
  aiSummaryGenerated: string;
  positions: ProfilePosition[];
  education: ProfileEducationEntry[];
  skills: string[];
  insights: {
    totalMonths: number;
    avgMonths: number;
    longestMonths: number;
    shortestMonths: number;
    roles: number;
    companies: number;
    earlierRolesCount: number;
  };
  lastAnalystConnection: string;
  lastConnectedDate: string;
  lastStatus: string;
  activity: ProfileActivityItem[];
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
  linkedinUrl?: string;
  current: ExperienceEntry[];
  past: ExperienceEntry[];
  education: ExperienceEntry[];
  reasoning: SignalReasoning;
  /** Rich profile detail shown in the slide-in profile drawer. */
  profile?: TalentProfile;
}
