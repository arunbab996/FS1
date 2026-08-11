export type TagCategory =
  | "momentum"
  | "industry"
  | "geography"
  | "background"
  | "investor-interest"
  | "stealth"
  | "thesis";

export type SignalStatus =
  | "New Signal"
  | "Repeat Signal"
  | "Active Duplicate Signal"
  | "Dormant Duplicate Signal"
  | "Passed Repeat Signal";

export interface SignalTag {
  label: string;
  category: TagCategory;
  /** Optional hover explanation, e.g. why a "Nexus to Asia Pacific" call was made for this signal. */
  description?: string;
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
  /** GPA/honours, thesis, scholarship, or a country-specific admission stat (e.g. "JEE Advanced AIR 342"). */
  detail?: string;
  /** Marks `detail` as inferred/enriched rather than sourced from the profile itself — shown with a mock-data highlight. */
  mock?: boolean;
}

export interface GithubContributionDay {
  /** ISO date, e.g. "2026-07-27". */
  date: string;
  count: number;
}

export interface GithubStats {
  username: string;
  followers: number;
  stars: number;
  publicRepos: number;
  topLanguages: string[];
  /** ~1 year of daily contribution counts, oldest first. */
  contributions: GithubContributionDay[];
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

/** The talent's own recent activity on LinkedIn — posts, comments, and reactions. */
export interface LinkedInActivityItem {
  kind: "post" | "comment" | "reaction";
  /** Short preview/snippet of the post, the comment, or the post being reacted to. */
  preview: string;
  date: string;
  url: string;
  /** For reactions, e.g. "Liked", "Celebrated", "Supported". */
  reaction?: string;
}

/** Academic/competitive credentials that signal raw talent caliber (olympiads, scholarships, honours, etc.). */
export interface PedigreeItem {
  category:
    | "school"
    | "honours"
    | "scholarship"
    | "olympiad"
    | "competitive-programming"
    | "hackathon"
    | "publication";
  label: string;
  detail?: string;
  year?: string;
  /** Marks this item as inferred/enriched rather than sourced from the profile itself — shown with a mock-data highlight. */
  mock?: boolean;
}

/** Derived signals about career trajectory — employer quality, promotion pace, stealth/departure events. */
export interface CareerSignalItem {
  kind: "employer-tier" | "early-employee" | "promotion-velocity" | "departure-event";
  label: string;
  detail: string;
}

/** Early, pre-public "intent" signals — stealth-mode flags, new domains, follow bursts — the raw material
 * behind why a signal fired at all, ahead of anything the person has announced publicly. */
export interface BehavioralSignalItem {
  kind: "stealth-mode" | "new-domain" | "new-directorship" | "follow-burst" | "topic-shift";
  label: string;
  detail: string;
  date?: string;
}

/** Founder/professional network affiliations — co-founders, accelerators, notable colleague overlap. */
export interface NetworkItem {
  kind: "co-founder" | "accelerator" | "colleague-overlap";
  label: string;
  detail?: string;
}

/** External validation — press coverage, young-leader lists, conference speaking. */
export interface RecognitionItem {
  kind: "press" | "list" | "speaking";
  label: string;
  detail?: string;
  date?: string;
  url?: string;
  /** Marks this item as inferred/enriched rather than sourced from the profile itself — shown with a mock-data highlight. */
  mock?: boolean;
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
  /** Omit when there's no recent LinkedIn activity to show. */
  linkedinActivity?: LinkedInActivityItem[];
  /** Omit when there are no notable pedigree/credential signals for this profile. */
  pedigree?: PedigreeItem[];
  /** Omit when there are no notable career-trajectory signals for this profile. */
  careerSignals?: CareerSignalItem[];
  /** Omit when there's no notable network affiliation to show. */
  network?: NetworkItem[];
  /** Omit when there's no notable press/recognition to show. */
  recognition?: RecognitionItem[];
  /** Omit when this person has no public GitHub activity to show. */
  github?: GithubStats;
  /** Omit when there are no early/pre-public intent signals worth flagging for this profile. */
  behavioralSignals?: BehavioralSignalItem[];
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
  /** Temporarily exclude from the list (e.g. mid-edit signals ahead of a demo) without deleting the data. */
  hidden?: boolean;
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
  githubUrl?: string;
  /** Show a generic silhouette instead of a photo, e.g. for anonymized stealth signals. */
  useGenericAvatar?: boolean;
  /** Name of the external investor/fund shown to be interested in this person. */
  investorInterest?: string;
  /** How many times this signal has been featured recently. */
  featuredCount?: number;
  /** Rolling window (in days) that featuredCount applies to. Defaults to 15. */
  featuredWindowDays?: number;
  /** Names of people who've screened this signal (registers a view). Omit when no one has yet. */
  viewedBy?: string[];
  current: ExperienceEntry[];
  past: ExperienceEntry[];
  education: ExperienceEntry[];
  reasoning: SignalReasoning;
  /** Rich profile detail shown in the slide-in profile drawer. */
  profile?: TalentProfile;
}
