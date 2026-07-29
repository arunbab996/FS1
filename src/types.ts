export type TagCategory =
  | "momentum"
  | "industry"
  | "geography"
  | "background"
  | "investor-interest"
  | "stealth";

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
  /** Omit when the source profile doesn't list dates for this entry. */
  period?: string;
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
  /** Omit when the source profile has no follower count. */
  followers?: number;
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
  /** Sourcing/CRM connection details — omit when not available for this profile. */
  lastAnalystConnection?: string;
  lastConnectedDate?: string;
  lastStatus?: string;
  activity: ProfileActivityItem[];
}

export interface Signal {
  id: string;
  dateGroup: "Today · Jul 27" | "Yesterday · Jul 26";
  status: SignalStatus;
  tags: SignalTag[];
  score: number;
  avatarInitials: string;
  /** Real photo path/URL (e.g. "/avatars/darshan.jpg"). Falls back to a placeholder when omitted. */
  photoUrl?: string;
  /** Headline text. Wrap entities in **double asterisks** to bold them. */
  headline: string;
  /**
   * Explicit person name, for headlines where the person isn't the first
   * bolded entity (e.g. "**Accel** is interested in **Sky Wee**"). Falls
   * back to the first bolded entity in the headline when omitted.
   */
  personName?: string;
  contextLine: string;
  aiSummary: string;
  /** Who originally sourced/surfaced this signal, e.g. a network contact. */
  sourcedBy?: string;
  /** Which external tool/data source this signal was sourced via, e.g. "Specter". */
  sourcedVia?: string;
  /** Pre-filled investor assignment, if this signal already has one. */
  assignedInvestor?: string;
  assignedStage?: string;
  linkedinUrl?: string;
  /** Show a generic silhouette instead of a photo, e.g. for anonymized stealth signals. */
  useGenericAvatar?: boolean;
  /** Name of the external investor/fund shown to be interested in this person. */
  investorInterest?: string;
  /** How many times this signal has been featured recently. */
  featuredCount?: number;
  /** Rolling window (in days) that featuredCount applies to. Defaults to 15. */
  featuredWindowDays?: number;
  current: ExperienceEntry[];
  past: ExperienceEntry[];
  education: ExperienceEntry[];
  reasoning: SignalReasoning;
  /** Rich profile detail shown in the slide-in profile drawer. */
  profile?: TalentProfile;
}
