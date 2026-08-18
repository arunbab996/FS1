import { fakeInvestors } from "./investors";

function fakeInvestorIndex(user: string): number {
  const i = fakeInvestors.indexOf(user);
  return i === -1 ? 0 : i;
}

export type ReportChannel =
  | "linkedin"
  | "twitter"
  | "oss"
  | "strategy"
  | "ev"
  | "yc"
  | "ph"
  | "pl"
  | "fp"
  | "bl"
  | "hn";

export const REPORT_CHANNELS: { id: ReportChannel; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter" },
  { id: "oss", label: "OSS" },
  { id: "strategy", label: "Specter" },
  { id: "ev", label: "Evertrace" },
  { id: "yc", label: "YC" },
  { id: "ph", label: "Product Hunt" },
  { id: "pl", label: "Peerlist" },
  { id: "fp", label: "Futurepedia" },
  { id: "bl", label: "Beta List" },
  { id: "hn", label: "Hacker News" },
];

export type TimeRange = "week" | "month" | "quarter" | "year";

export const TIME_RANGE_OPTIONS: { id: TimeRange; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
];

/** Fraction of the annual figure a given range represents, roughly matching calendar buckets. */
const RANGE_SCALE: Record<TimeRange, number> = {
  week: 1 / 48,
  month: 1 / 12,
  quarter: 1 / 4,
  year: 1,
};

/** picked = signals an investor actually engaged with; total = signals sourced through that channel. */
export interface ChannelCount {
  picked: number;
  total: number;
}

/**
 * How much raw data a channel needs to review before one signal is worth pushing to the
 * platform. Curated/referral channels (Strategy, YC, PH…) are near-1:1 since someone already
 * vetted the lead. Broad automated scrapes (LinkedIn, Twitter, OSS, EV) review a lot of noise
 * for every signal that clears the bar.
 */
const CHANNEL_REVIEW_MULTIPLIER: Record<ReportChannel, number> = {
  linkedin: 34,
  twitter: 58,
  oss: 16,
  ev: 85,
  strategy: 1.1,
  yc: 1.3,
  ph: 1.5,
  pl: 1.2,
  fp: 1,
  bl: 1,
  hn: 1,
};

export interface CountryAnnualStats {
  country: string;
  channels: Partial<Record<ReportChannel, ChannelCount>>;
  /** Of picked-up signals, how many convert into an actual founder meeting (annualized). */
  founderMeetingRate: number;
}

// Annualized base figures, deliberately mirroring the lopsided real-world shape Alex flagged:
// the US/India/Australia dominate volume, while SE Asia markets like Thailand/Vietnam/Philippines
// are thin enough that it's genuinely unclear whether that's low activity or thin coverage.
export const countryAnnualStats: CountryAnnualStats[] = [
  {
    country: "United States",
    channels: {
      linkedin: { picked: 36, total: 2340 },
      twitter: { picked: 168, total: 11676 },
      oss: { picked: 12, total: 1176 },
      strategy: { picked: 216, total: 1104 },
      ev: { picked: 0, total: 5532 },
      yc: { picked: 228, total: 1488 },
      ph: { picked: 84, total: 84 },
      fp: { picked: 12, total: 12 },
      bl: { picked: 12, total: 12 },
    },
    founderMeetingRate: 0.18,
  },
  {
    country: "India",
    channels: {
      linkedin: { picked: 0, total: 1356 },
      twitter: { picked: 12, total: 348 },
      oss: { picked: 48, total: 324 },
      strategy: { picked: 204, total: 204 },
      ev: { picked: 0, total: 7272 },
      yc: { picked: 0, total: 72 },
      ph: { picked: 48, total: 96 },
      pl: { picked: 84, total: 84 },
      fp: { picked: 0, total: 12 },
      bl: { picked: 12, total: 12 },
      hn: { picked: 12, total: 12 },
    },
    founderMeetingRate: 0.22,
  },
  {
    country: "Australia",
    channels: {
      linkedin: { picked: 204, total: 2484 },
      twitter: { picked: 48, total: 168 },
      oss: { picked: 12, total: 36 },
      strategy: { picked: 60, total: 60 },
      ev: { picked: 0, total: 2316 },
      yc: { picked: 12, total: 12 },
      ph: { picked: 12, total: 12 },
      fp: { picked: 12, total: 12 },
    },
    founderMeetingRate: 0.31,
  },
  {
    country: "Singapore",
    channels: {
      linkedin: { picked: 132, total: 3756 },
      twitter: { picked: 12, total: 48 },
      oss: { picked: 0, total: 60 },
      strategy: { picked: 84, total: 84 },
      ev: { picked: 0, total: 1692 },
      yc: { picked: 24, total: 36 },
      ph: { picked: 24, total: 24 },
    },
    founderMeetingRate: 0.27,
  },
  {
    country: "China",
    channels: {
      linkedin: { picked: 24, total: 108 },
      twitter: { picked: 24, total: 24 },
      oss: { picked: 12, total: 72 },
      strategy: { picked: 12, total: 12 },
      ev: { picked: 0, total: 696 },
    },
    founderMeetingRate: 0.12,
  },
  {
    country: "South Korea",
    channels: {
      linkedin: { picked: 0, total: 24 },
      twitter: { picked: 0, total: 12 },
      oss: { picked: 12, total: 36 },
      ev: { picked: 0, total: 264 },
    },
    founderMeetingRate: 0.08,
  },
  {
    country: "Malaysia",
    channels: {
      linkedin: { picked: 24, total: 336 },
      ev: { picked: 0, total: 168 },
    },
    founderMeetingRate: 0.14,
  },
  {
    country: "Indonesia",
    channels: {
      linkedin: { picked: 0, total: 60 },
      strategy: { picked: 24, total: 24 },
      ev: { picked: 0, total: 360 },
      pl: { picked: 12, total: 12 },
    },
    founderMeetingRate: 0.1,
  },
  {
    country: "Vietnam",
    channels: {
      linkedin: { picked: 0, total: 48 },
      oss: { picked: 12, total: 60 },
      ev: { picked: 0, total: 204 },
      fp: { picked: 12, total: 12 },
    },
    founderMeetingRate: 0.09,
  },
  {
    country: "Philippines",
    channels: {
      linkedin: { picked: 0, total: 36 },
      ev: { picked: 0, total: 120 },
    },
    founderMeetingRate: 0.05,
  },
  {
    country: "Thailand",
    channels: {
      linkedin: { picked: 0, total: 12 },
      oss: { picked: 0, total: 12 },
      ev: { picked: 0, total: 96 },
    },
    founderMeetingRate: 0.04,
  },
];

/** Per-analyst funnel: how much they reviewed, how many they shortlisted, how many calls got set up (annualized). */
export interface UserActivityAnnual {
  user: string;
  reviewed: number;
  shortlisted: number;
  callsSetUp: number;
}

export const userActivityAnnualStats: UserActivityAnnual[] = [
  { user: "Alex Rankin", reviewed: 1980, shortlisted: 234, callsSetUp: 58 },
  { user: "Joshua Lim", reviewed: 1840, shortlisted: 216, callsSetUp: 54 },
  { user: "Raynard Lao", reviewed: 1620, shortlisted: 204, callsSetUp: 48 },
  { user: "Hongfei Xia", reviewed: 1240, shortlisted: 158, callsSetUp: 37 },
  { user: "Roy Ong", reviewed: 980, shortlisted: 112, callsSetUp: 26 },
];

/** A lead an analyst reached out to, or a call set up with, sampled from real signal data for authenticity. */
export interface ActivityLead {
  person: string;
  company: string;
  role: string;
}

const ACTIVITY_LEAD_POOL: ActivityLead[] = [
  { person: "Darshan P.", company: "FinishKit", role: "Founder" },
  { person: "Sky Wee", company: "Stealth Startup", role: "Co-Founder" },
  { person: "Achintya Gupta", company: "Reo.Dev", role: "Co-Founder & CEO" },
  { person: "Zhipeng He", company: "QUT Spinout", role: "Postdoctoral Researcher" },
  { person: "Paulyn V.", company: "Exploring", role: "ex-Qantas" },
  { person: "Anshu Bansal", company: "Stealth", role: "ex-Cloud Defense" },
  { person: "Loong Wang", company: "Metal", role: "CEO & Founder" },
  { person: "Mei Lin", company: "Vitalis Health", role: "Co-founder & CEO" },
  { person: "Aayush Sharma", company: "Exploring", role: "ex-Founder" },
];

export interface AnalystActivityDetail {
  reachedOut: ActivityLead[];
  shortlisted: ActivityLead[];
  callsSetUp: ActivityLead[];
}

/** Deterministic rotating slice of the shared lead pool, so each analyst's "recent activity" sample differs. */
export function analystActivityDetail(user: string): AnalystActivityDetail {
  const offset = Math.max(fakeInvestorIndex(user), 0);
  const pick = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => ACTIVITY_LEAD_POOL[(start + i) % ACTIVITY_LEAD_POOL.length]);
  return {
    reachedOut: pick(offset, 3),
    shortlisted: pick(offset + 3, 2),
    callsSetUp: pick(offset + 5, 1),
  };
}

export type UserActivityRangeStats = UserActivityAnnual;

export function userActivityStatsForRange(range: TimeRange): UserActivityRangeStats[] {
  return userActivityAnnualStats.map((row) => ({
    user: row.user,
    reviewed: scale(row.reviewed, range),
    shortlisted: scale(row.shortlisted, range),
    callsSetUp: scale(row.callsSetUp, range),
  }));
}

function scale(value: number, range: TimeRange): number {
  return Math.round(value * RANGE_SCALE[range]);
}

/** Deterministic 0.65–1.55x jitter per country+channel, so review ratios vary realistically instead of repeating the same % in every row. */
function reviewJitter(country: string, channel: string): number {
  let hash = 0;
  const key = `${country}:${channel}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return 0.65 + (Math.abs(hash) % 900) / 1000;
}

/** pushed = signals that cleared the bar and reached the platform; reviewed = all raw data looked at (signal + noise). */
export interface ChannelReview {
  pushed: number;
  reviewed: number;
}

export interface CountryRangeStats {
  country: string;
  channels: Partial<Record<ReportChannel, ChannelCount>>;
  review: Partial<Record<ReportChannel, ChannelReview>>;
  totalSourced: number;
  totalPicked: number;
  founderMeetings: number;
}

export function countryStatsForRange(range: TimeRange): CountryRangeStats[] {
  return countryAnnualStats.map((row) => {
    const channels: Partial<Record<ReportChannel, ChannelCount>> = {};
    const review: Partial<Record<ReportChannel, ChannelReview>> = {};
    let totalSourced = 0;
    let totalPicked = 0;
    for (const [channel, count] of Object.entries(row.channels) as [ReportChannel, ChannelCount][]) {
      const total = scale(count.total, range);
      const picked = Math.min(total, scale(count.picked, range));
      channels[channel] = { total, picked };
      const multiplier = CHANNEL_REVIEW_MULTIPLIER[channel] * reviewJitter(row.country, channel);
      const reviewed = scale(Math.round(count.total * multiplier), range);
      review[channel] = { pushed: total, reviewed: Math.max(reviewed, total) };
      totalSourced += total;
      totalPicked += picked;
    }
    return {
      country: row.country,
      channels,
      review,
      totalSourced,
      totalPicked,
      founderMeetings: Math.round(totalPicked * row.founderMeetingRate),
    };
  });
}

/**
 * Coverage-gap heuristic, straight from Alex's ask: flag countries whose volume is far
 * below the field average, since that's as likely to mean "we don't have eyes there" as
 * "there's nothing happening there."
 */
export function findCoverageGaps(rows: CountryRangeStats[]): CountryRangeStats[] {
  const nonZero = rows.filter((r) => r.totalSourced > 0).sort((a, b) => a.totalSourced - b.totalSourced);
  if (nonZero.length === 0) return [];
  const mid = Math.floor(nonZero.length / 2);
  const median =
    nonZero.length % 2 === 0
      ? (nonZero[mid - 1].totalSourced + nonZero[mid].totalSourced) / 2
      : nonZero[mid].totalSourced;
  // Median (not mean) so a couple of dominant markets like the US don't drag the bar down for everyone else.
  return rows
    .filter((r) => r.totalSourced < median * 0.35)
    .sort((a, b) => a.totalSourced - b.totalSourced);
}
