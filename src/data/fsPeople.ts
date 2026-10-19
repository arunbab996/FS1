import type {
  CareerSignalItem,
  CredentialMeta,
  ExperienceEntry,
  NetworkItem,
  PedigreeItem,
  ProfileEducationEntry,
  ProfilePosition,
  RecognitionItem,
  Signal,
  TalentProfile,
  TrackRecordItem,
} from "../types";
import raw from "./fs_people.json";

/**
 * Builds Signals from fs_people.json (placeholder data drafted by Claude, standing in for what the
 * OpenAI prompts will produce). Names, text and numbers are passed through untouched; the only
 * things computed here are durations and counts that come straight from the experience dates.
 */

interface RawEvidence {
  field: string;
  quote: string;
  url: string | null;
}

interface RawCredential {
  title: string;
  detail: string;
  year: number | null;
  tag: string | null;
  claim_type: "self_reported" | "derived";
  confidence: "high" | "medium";
  evidence: RawEvidence | null;
}

interface RawPerson {
  name: string;
  linkedin_url: string;
  headline: string | null;
  current_title: string | null;
  location: string | null;
  about: string | null;
  credentials: {
    career_summary: string;
    pedigree: RawCredential[];
    career_signals: RawCredential[];
    affiliations: RawCredential[];
    recognition_media: RawCredential[];
    track_record: RawCredential[];
  };
  founder_dna: {
    label: string;
    subtitle: string;
    ventures_counted: number;
    ventures: string[];
  };
  experience: {
    company: string;
    title: string;
    start: string | null;
    end: string | null;
    location: string | null;
    description: string | null;
  }[];
  education: {
    school: string;
    qualification: string | null;
    start: string | null;
    end: string | null;
  }[];
  skills: string[];
}

const people = (raw as unknown as { people: RawPerson[] }).people;

/** "Now" for the dates in this file: the day it was generated. Used for open-ended ("present") roles. */
const REFERENCE_MONTH = "2026-10";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthIndex(ym: string): number {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + (month - 1);
}

function monthLabel(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Dates are YYYY-MM and `end: null` means present. A range with neither date is left blank. */
function periodLabel(start: string | null, end: string | null): string {
  if (start && end) return `${monthLabel(start)} - ${monthLabel(end)}`;
  if (start) return `${monthLabel(start)} - Present`;
  if (end) return `Until ${monthLabel(end)}`;
  return "";
}

function monthsBetween(start: string | null, end: string | null): number {
  if (!start) return 0;
  return Math.max(0, monthIndex(end ?? REFERENCE_MONTH) - monthIndex(start));
}

function credentialMeta(item: RawCredential): CredentialMeta {
  return {
    ...(item.tag ? { tag: item.tag } : {}),
    claimType: item.claim_type,
    confidence: item.confidence,
    ...(item.evidence ? { evidence: item.evidence } : {}),
  };
}

function year(item: RawCredential): { year?: string } {
  return item.year !== null ? { year: String(item.year) } : {};
}

function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((w) => w && !w.startsWith("("));
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function slugOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSignal(person: RawPerson): Signal {
  const { credentials: c } = person;
  const title = person.headline ?? person.current_title ?? "";

  const positions: ProfilePosition[] = person.experience.map((e) => ({
    company: e.company,
    title: e.title,
    period: periodLabel(e.start, e.end),
    months: monthsBetween(e.start, e.end),
    ...(e.description ? { description: e.description } : {}),
  }));

  const education: ProfileEducationEntry[] = person.education.map((e) => ({
    school: e.school,
    degree: e.qualification ?? "",
    ...(e.start || e.end ? { period: periodLabel(e.start, e.end) } : {}),
  }));

  // A role is current when it has a start date and no end date. A role with neither date is
  // undated, which we don't read as "current".
  const current: ExperienceEntry[] = person.experience
    .filter((e) => e.start && !e.end)
    .map((e) => ({ company: e.company, role: e.title }));
  const past: ExperienceEntry[] = person.experience
    .filter((e) => !(e.start && !e.end))
    .map((e) => ({ company: e.company, role: e.title }));

  const datedMonths = positions.filter((p) => p.months > 0).map((p) => p.months);
  const starts = person.experience.flatMap((e) => (e.start ? [monthIndex(e.start)] : []));
  const totalMonths = starts.length ? monthIndex(REFERENCE_MONTH) - Math.min(...starts) : 0;
  const avgMonths = datedMonths.length
    ? Math.round(datedMonths.reduce((a, b) => a + b, 0) / datedMonths.length)
    : 0;
  const yearsLabel = totalMonths
    ? `${(totalMonths / 12).toFixed(1).replace(/\.0$/, "")} yrs experience`
    : "";

  const pedigree: PedigreeItem[] = c.pedigree.map((i) => ({
    label: i.title,
    detail: i.detail,
    ...year(i),
    ...credentialMeta(i),
  }));
  const careerSignals: CareerSignalItem[] = c.career_signals.map((i) => ({
    label: i.title,
    detail: i.detail,
    ...year(i),
    ...credentialMeta(i),
  }));
  const network: NetworkItem[] = c.affiliations.map((i) => ({
    label: i.title,
    detail: i.detail,
    ...year(i),
    ...credentialMeta(i),
  }));
  const recognition: RecognitionItem[] = c.recognition_media.map((i) => ({
    label: i.title,
    detail: i.detail,
    ...(i.year !== null ? { date: String(i.year) } : {}),
    ...credentialMeta(i),
  }));
  const trackRecord: TrackRecordItem[] = c.track_record.map((i) => ({
    label: i.title,
    detail: i.detail,
    ...year(i),
    ...credentialMeta(i),
  }));

  const profile: TalentProfile = {
    titleLine: title,
    ...(person.location ? { location: person.location } : {}),
    ...(person.about ? { overview: person.about } : {}),
    rolesHeld: positions.length,
    avgTenureMonths: avgMonths,
    positions,
    education,
    ...(pedigree.length ? { pedigree } : {}),
    ...(careerSignals.length ? { careerSignals } : {}),
    ...(network.length ? { network } : {}),
    ...(recognition.length ? { recognition } : {}),
    ...(trackRecord.length ? { trackRecord } : {}),
    careerSummary: c.career_summary,
    founderDna: {
      label: person.founder_dna.label,
      subtitle: person.founder_dna.subtitle,
      venturesCounted: person.founder_dna.ventures_counted,
      ventures: person.founder_dna.ventures,
    },
    ...(person.skills.length ? { skills: person.skills } : {}),
    insights: {
      totalMonths,
      avgMonths,
      longestMonths: datedMonths.length ? Math.max(...datedMonths) : 0,
      shortestMonths: datedMonths.length ? Math.min(...datedMonths) : 0,
      roles: positions.length,
      companies: new Set(positions.map((p) => p.company)).size,
      earlierRolesCount: 0,
    },
    // Empty on purpose: the Social Activity and Interactions tabs show, with nothing in them yet.
    linkedinActivity: [],
    interactions: [],
    activity: [],
  };

  return {
    id: `sig-fs-${slugOf(person.name)}`,
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    tags: [],
    avatarInitials: initialsOf(person.name),
    headline: `**${person.name}** · ${title}`,
    personName: person.name,
    contextLine: [person.location ?? "", yearsLabel].filter((_, i) => i === 0 || yearsLabel).join(" · "),
    aiSummary: c.career_summary,
    linkedinUrl: person.linkedin_url,
    useGenericAvatar: true,
    noSourceInfo: true,
    current,
    past,
    education: person.education.map((e) => ({ company: e.school, role: e.qualification ?? "" })),
    reasoning: { positives: [], negatives: [] },
    profile,
  };
}

export const fsPeopleSignals: Signal[] = people.map(buildSignal);
