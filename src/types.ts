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
  /** Omit when the source has no such classification. */
  category?: PositionCategory;
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

export interface GithubBasics {
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
  websiteUrl?: string;
  twitterUsername?: string;
  socialAccounts: { provider: string; url: string }[];
  /** ISO timestamp the account was created. */
  createdAt: string;
  followers: number;
  following: number;
  /** Every public repo they own, forks included. */
  publicRepos: number;
  /** Public repos they own that are not forks. */
  originalRepos: number;
  /** Stars across their original repos (tutorial/course repos excluded). */
  totalStars: number;
  orgs: { login: string; name?: string }[];
  pinned: { name: string; description?: string; stars: number; language?: string }[];
}

export interface GithubActivity {
  totalContributions: number;
  /** Weeks with at least one contribution, out of the last 52. */
  activeWeeks: number;
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  /** A count only: GitHub shows what they were to nobody. Zero unless the person opted in. */
  privateContributions: number;
  /** About a year of daily counts, oldest first. */
  calendar: GithubContributionDay[];
}

export interface GithubMergedPr {
  /** "owner/name" of the repo the PR landed in. */
  repo: string;
  repoStars: number;
  title: string;
  mergedAt: string;
  url: string;
  /** The repo belongs to an org the person is a public member of. */
  viaMemberOrg: boolean;
}

export interface GithubMergedExternal {
  /** Merged PRs into repos the person doesn't own. */
  total: number;
  distinctRepos: number;
  /** True when `total` is larger than the PRs we paged through, so `distinctRepos` is a floor. */
  sampled: boolean;
  /** Of the PRs we looked at, how many went into orgs they belong to. */
  fromMemberOrgs: number;
  /** Up to 10, biggest repos first. */
  top: GithubMergedPr[];
}

export interface GithubRepoQuality {
  /** Positive-only: false means "couldn't see tests at the repo root", not "has none". */
  tests: boolean;
  ci: boolean;
  /** SPDX id, "Custom" for a license file GitHub can't classify, null when there's none. */
  license: string | null;
  readme: boolean;
  releases: number;
}

export interface GithubTopRepo {
  name: string;
  description?: string;
  url: string;
  stars: number;
  forks: number;
  language?: string;
  pushedAt?: string;
  topics: string[];
  quality?: GithubRepoQuality;
}

export interface GithubLanguageShare {
  name: string;
  percent: number;
  /** Hex color from GitHub's language list, when it gave one. */
  color?: string;
}

export interface GithubCommitShare {
  /** "owner/name". */
  repo: string;
  /** Their share of commits among non-bot contributors. */
  percent: number;
  /** 1 = top contributor. */
  rank: number;
  contributors: number;
}

/** Everything the GitHub card renders. Each field is something GitHub's API returns, or is computed from what it returns. */
export interface GithubStats {
  username: string;
  basics: GithubBasics;
  activity: GithubActivity;
  mergedExternal?: GithubMergedExternal;
  /** Top original repos by stars, up to 5. */
  topRepos: GithubTopRepo[];
  languages: GithubLanguageShare[];
  commitShare: GithubCommitShare[];
  /** Notable frameworks/libraries found in dependency files. */
  stack: string[];
  /** Topic themes, e.g. "AI/ML", "Dev tools". */
  themes: string[];
  /** 2-3 sentences, built only from the fields above. */
  summary: string;
  /** No public code activity in the last 12 months, no original repos, no merged outside PRs. */
  noPublicActivity: boolean;
  fetchedAt: string;
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

/** A short-form person reference for the Interactions timeline — just enough to render an initials chip. */
export interface InteractionPerson {
  name: string;
  initials: string;
  /** Tailwind bg/text pair for the initials chip, e.g. "bg-amber-100 text-amber-700". Kept consistent per person across the timeline. */
  colorClasses: string;
}

interface InteractionBase {
  date: string;
}

/** One outbound/inbound LinkedIn touchpoint — an invite, a message, or a passive open/visit. */
export interface LinkedInTouchpoint extends InteractionBase {
  kind: "linkedin";
  action: "Sent" | "Replied" | "Opened" | "Invite Accepted" | "Invite Done" | "Visit Done";
  /** The outreach sequence/campaign this belongs to, e.g. "[FS] RL - Stealth". */
  campaign: string;
  from: InteractionPerson;
  to: InteractionPerson;
  /** Message text — omitted for passive actions like Opened/Visit Done. */
  preview?: string;
  time: string;
  direction: "Outbound" | "Inbound";
}

/** One inbound/outbound email in the thread. */
export interface EmailInteraction extends InteractionBase {
  kind: "email";
  from: InteractionPerson & { domain: string };
  to: string[];
  subject: string;
  direction: "Outbound" | "Inbound";
}

/** A calendar meeting tied to this signal. */
export interface MeetingInteraction extends InteractionBase {
  kind: "meeting";
  title: string;
  status: "Confirmed" | "Tentative" | "Cancelled";
  /** Pre-split for the day-tile layout, e.g. month "JUL", day "23", weekday "Thu". */
  month: string;
  day: string;
  weekday: string;
  organizer: InteractionPerson;
  attendees: InteractionPerson[];
  durationLabel: string;
  timeRange: string;
}

/** An AI-generated meeting summary — action items, tags, and who attended. */
export interface MeetingNotesInteraction extends InteractionBase {
  kind: "meeting-notes";
  attendees: InteractionPerson[];
  actionItems: { text: string; done: boolean }[];
  hashtags: string[];
  mentionedAttendees: string[];
  extraMentionCount?: number;
  author: InteractionPerson;
  tags: { label: string; tone: "stage" | "temperature" | "visibility" }[];
}

export type InteractionItem =
  | LinkedInTouchpoint
  | EmailInteraction
  | MeetingInteraction
  | MeetingNotesInteraction;

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

/**
 * Provenance carried by credentials items that come from the structured people file: a short tag
 * (School, Papers, Award...), how the claim was made, how sure we are, and the evidence behind it.
 */
export interface CredentialMeta {
  tag?: string;
  claimType?: "self_reported" | "derived";
  confidence?: "high" | "medium";
  evidence?: { field: string; quote: string; url: string | null };
}

/** Academic/competitive credentials that signal raw talent caliber (olympiads, scholarships, honours, etc.). */
export interface PedigreeItem extends CredentialMeta {
  /** Omit when the source has no such classification: the card then falls back to a generic icon. */
  category?:
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
export interface CareerSignalItem extends CredentialMeta {
  /** Omit when the source has no such classification: the card then falls back to a generic icon. */
  kind?: "employer-tier" | "early-employee" | "promotion-velocity" | "departure-event";
  label: string;
  detail: string;
  year?: string;
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
export interface NetworkItem extends CredentialMeta {
  /** Omit when the source has no such classification: the card then falls back to a generic icon. */
  kind?: "co-founder" | "accelerator" | "colleague-overlap";
  label: string;
  detail?: string;
  year?: string;
}

/** External validation — press coverage, young-leader lists, conference speaking. */
export interface RecognitionItem extends CredentialMeta {
  /** Omit when the source has no such classification: the card then falls back to a generic icon. */
  kind?: "press" | "list" | "speaking";
  label: string;
  detail?: string;
  date?: string;
  url?: string;
  /** Marks this item as inferred/enriched rather than sourced from the profile itself — shown with a mock-data highlight. */
  mock?: boolean;
}

/** Concrete results the person has delivered (shipped, grown, raised, sold). */
export interface TrackRecordItem extends CredentialMeta {
  label: string;
  detail?: string;
  year?: string;
}

/** Founder DNA exactly as supplied by the source, for profiles where it is not derived from positions. */
export interface FounderDnaSummary {
  label: string;
  subtitle: string;
  venturesCounted: number;
  ventures: string[];
}

export interface TalentProfile {
  titleLine: string;
  /** Omit when the source profile has no connection count. */
  connections?: number;
  /** Omit when the source profile has no follower count. */
  followers?: number;
  rolesHeld: number;
  avgTenureMonths: number;
  /** Omit when the source profile has no location. */
  location?: string;
  /** Omit when the source profile has no About text: the Overview block is then hidden. */
  overview?: string;
  /** Omit when the AI summary is placeholder text rather than a generated one. */
  aiSummaryGenerated?: string;
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
  /** Omit when there are no concrete results to show. */
  trackRecord?: TrackRecordItem[];
  /** One-line career trajectory, shown at the top of Career Signals. */
  careerSummary?: string;
  /** When set, shown as-is in the Insights tab instead of the tile derived from positions. */
  founderDna?: FounderDnaSummary;
  /** Skills as listed on the source profile. Stored, not yet shown anywhere in the design. */
  skills?: string[];
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
  /** Rich touchpoint timeline (LinkedIn, email, meetings, meeting notes) shown in the Interactions tab. Omit when there's none to show. */
  interactions?: InteractionItem[];
}

export interface Signal {
  id: string;
  dateGroup: "Today · Jul 27" | "Yesterday · Jul 26";
  status: SignalStatus;
  /** Temporarily exclude from the list (e.g. mid-edit signals ahead of a demo) without deleting the data. */
  hidden?: boolean;
  tags: SignalTag[];
  /** Omit when the signal has no score yet: score UI is then hidden. */
  score?: number;
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
  /** Skip the "sourced via" pill, for people with no known discovery source. */
  noSourceInfo?: boolean;
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

/** An investor's call on a signal that was routed to their Inbox. */
export type InboxDecision = "pursue" | "pass";
