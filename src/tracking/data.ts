import { SEED_PEOPLE } from "../associate/data/seed";
import type { Person } from "../associate/types";

/**
 * Demo data for Investor Tracking: APAC funds, the people at them, and a month of who they
 * followed on X. Fund names are real, as elsewhere in the prototype's demo data; every investor and
 * every follow is invented. Handles are made up too, so they aren't linked to X until live data
 * replaces this file.
 *
 * Followed founders are drawn from the AI Associate's seed people, so a follow can open the same
 * profile, and some targets are deliberately not in FirstSignal (a coverage gap worth seeing).
 */

export interface Firm {
  id: string;
  name: string;
  domain: string;
  hq: string;
  focus: string;
}

export interface Investor {
  id: string;
  firmId: string;
  name: string;
  title: string;
  handle: string;
}

export interface FollowTarget {
  kind: "person" | "company";
  name: string;
  handle: string;
  /** One line under the name, e.g. "Co-founder & CTO, Haven Stack · Jakarta". */
  bio: string;
  /** Set when the target is a person in FirstSignal; opens their profile. */
  personId?: string;
}

export interface FollowEvent {
  id: string;
  investorId: string;
  at: string;
  target: FollowTarget;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(91102026);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];

export const FIRMS: Firm[] = [
  { id: "peak-xv", name: "Peak XV Partners", domain: "peakxv.com", hq: "Bengaluru · Singapore", focus: "Seed to growth, India & SEA" },
  { id: "accel", name: "Accel", domain: "accel.com", hq: "Bengaluru", focus: "Early stage, India" },
  { id: "lightspeed", name: "Lightspeed", domain: "lsvp.com", hq: "Singapore · Delhi", focus: "Seed to growth, India & SEA" },
  { id: "east-ventures", name: "East Ventures", domain: "east.vc", hq: "Jakarta · Singapore", focus: "Seed, Indonesia" },
  { id: "antler", name: "Antler", domain: "antler.co", hq: "Singapore", focus: "Day zero, APAC" },
  { id: "openspace", name: "Openspace Ventures", domain: "openspace.vc", hq: "Singapore", focus: "Series A–B, SEA" },
  { id: "insignia", name: "Insignia Ventures Partners", domain: "insignia.vc", hq: "Singapore", focus: "Seed to Series A, SEA" },
  { id: "vertex", name: "Vertex Ventures SEA & India", domain: "vertexventures.sg", hq: "Singapore", focus: "Early stage, SEA & India" },
  { id: "jungle", name: "Jungle Ventures", domain: "jungle-ventures.com", hq: "Singapore", focus: "Series A–B, SEA & India" },
  { id: "elevation", name: "Elevation Capital", domain: "elevationcapital.com", hq: "Gurugram", focus: "Seed to Series A, India" },
  { id: "blume", name: "Blume Ventures", domain: "blume.vc", hq: "Mumbai", focus: "Seed, India" },
  { id: "monks-hill", name: "Monk's Hill Ventures", domain: "monkshill.com", hq: "Singapore", focus: "Series A, SEA" },
  { id: "ac-ventures", name: "AC Ventures", domain: "acv.vc", hq: "Jakarta", focus: "Seed to Series A, Indonesia" },
  { id: "square-peg", name: "Square Peg", domain: "squarepeg.vc", hq: "Sydney · Singapore", focus: "Early stage, Australia & SEA" },
  { id: "blackbird", name: "Blackbird", domain: "blackbird.vc", hq: "Sydney", focus: "Pre-seed to Series A, Australia" },
];

const FIRST = ["Aditi", "Rahul", "Mei", "Kenji", "Farhan", "Priyanka", "Daniel", "Sofia", "Wen", "Arjun", "Nadia", "Marcus", "Hana", "Vikas", "Elaine", "Ravi", "Clara", "Jonas", "Sana", "Tomas", "Isha", "Benjamin", "Yuki", "Amir", "Leah", "Kiran", "Grace", "Hugo", "Tanvi", "Reza", "Naomi", "Dev", "Chloe", "Imran", "Ming", "Ana"];
const LAST = ["Mehra", "Tan", "Kapur", "Lim", "Suryadi", "Nair", "Ho", "Bose", "Wong", "Iskandar", "Chandra", "Ong", "Rao", "Leung", "Hartono", "Banerjee", "Goh", "Pillai", "Teo", "Malhotra", "Kwok", "Santoso", "Dutta", "Chua"];
const TITLES = ["Partner", "Partner", "Principal", "Vice President", "Associate", "Associate", "Scout", "Venture Partner"];

const usedNames = new Set<string>();
function investorName(): string {
  for (;;) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
}

function handleFor(name: string, suffix = ""): string {
  return `${name.toLowerCase().replace(/[^a-z]/g, "")}${suffix}`;
}

export const INVESTORS: Investor[] = FIRMS.flatMap((firm, i) => {
  const count = 3 + ((i * 7) % 4);
  return Array.from({ length: count }, (_, j) => {
    const name = investorName();
    return {
      id: `${firm.id}-${j + 1}`,
      firmId: firm.id,
      name,
      title: j === 0 ? "Managing Partner" : pick(TITLES),
      handle: handleFor(name, pick(["", "_vc", "", "_"])),
    };
  });
});

export const firmById = new Map(FIRMS.map((f) => [f.id, f]));
export const investorById = new Map(INVESTORS.map((v) => [v.id, v]));

// One fixed handle per person, so the same founder reads the same everywhere.
const personHandles = new Map<string, string>();
function personHandle(p: Person): string {
  if (!personHandles.has(p.id)) personHandles.set(p.id, handleFor(p.name, pick(["", "_", "", "hq"])));
  return personHandles.get(p.id)!;
}

function personTarget(p: Person): FollowTarget {
  return {
    kind: "person",
    name: p.name,
    handle: personHandle(p),
    bio: `${p.headline} · ${p.city}`,
    personId: p.id,
  };
}

function companyTarget(p: Person): FollowTarget | null {
  const company = p.roles.find((r) => r.endYear === null && r.company !== "Stealth");
  if (!company) return null;
  return {
    kind: "company",
    name: company.company,
    handle: handleFor(company.company, "hq"),
    bio: `Startup · ${p.city} · founded by ${p.name}`,
    personId: p.id,
  };
}

/** People and companies nobody in FirstSignal has flagged yet. */
const OUTSIDE: FollowTarget[] = [
  { kind: "person", name: "Joel Fernandes", handle: "joelbuilds", bio: "Building in stealth · ex-Swiggy · Bengaluru" },
  { kind: "company", name: "Tidepool Robotics", handle: "tidepoolrobotics", bio: "Startup · Singapore · warehouse robotics" },
  { kind: "person", name: "Lina Hartati", handle: "linahartati", bio: "Founder, Stealth · ex-Traveloka · Jakarta" },
  { kind: "company", name: "Kopi Labs", handle: "kopilabs", bio: "Startup · Ho Chi Minh City · AI for F&B chains" },
  { kind: "person", name: "Sameer Qureshi", handle: "sameerq", bio: "Exploring what's next · ex-Razorpay · Mumbai" },
  { kind: "company", name: "Monsoon Data", handle: "monsoondata", bio: "Startup · Pune · data infra for insurers" },
];

const now = Date.now();
let eventCounter = 0;

function event(investorId: string, target: FollowTarget, hoursAgo: number): FollowEvent {
  eventCounter += 1;
  return { id: `ev${eventCounter}`, investorId, at: new Date(now - hoursAgo * 3_600_000).toISOString(), target };
}

function buildEvents(): FollowEvent[] {
  const visible = SEED_PEOPLE.filter((p) => !p.incomingBatch);
  const recentFirst = [...visible].sort((a, b) => new Date(b.signal.date).getTime() - new Date(a.signal.date).getTime());
  const events: FollowEvent[] = [];

  // Convergence: a few founders followed by several investors at different firms within days.
  // Mostly people tracked by default, so the demo shows it before anyone changes their list.
  const converging = recentFirst.filter((p) => p.signal.type !== "Exploring").slice(0, 5);
  const byFirm = (firmId: string) => pick(INVESTORS.filter((v) => v.firmId === firmId)).id;
  converging.forEach((person, i) => {
    const followers = [byFirm("peak-xv"), byFirm("east-ventures"), pick(["antler-1", "accel-2", "lightspeed-1"])];
    if (i % 2 === 0) followers.push(pick(["antler-1", "accel-2", "lightspeed-1"].filter((id) => !followers.includes(id))));
    if (i % 3 === 0) followers.push(byFirm(pick(["jungle", "openspace", "blume", "monks-hill"])));
    followers.forEach((investorId, j) => {
      events.push(event(investorId, personTarget(person), 2 + i * 20 + j * 7 + rand() * 5));
    });
  });

  // Everyday follow activity across the last month, denser in recent days.
  for (let i = 0; i < 150; i++) {
    const investor = pick(INVESTORS);
    const hoursAgo = Math.pow(rand(), 1.6) * 30 * 24;
    const roll = rand();
    let target: FollowTarget | null;
    if (roll < 0.12) target = pick(OUTSIDE);
    else if (roll < 0.3) target = companyTarget(pick(recentFirst.slice(0, 80)));
    else target = personTarget(pick(recentFirst.slice(0, 120)));
    if (target) events.push(event(investor.id, target, hoursAgo));
  }

  // One follow per investor and target: keep the most recent.
  const seen = new Set<string>();
  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .filter((e) => {
      const key = `${e.investorId}|${targetKey(e.target)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Identifies a follow target across events, e.g. for spotting several investors on one founder. */
export function targetKey(t: FollowTarget): string {
  return `${t.kind}:${t.personId ?? t.handle}`;
}

export const FOLLOW_EVENTS: FollowEvent[] = buildEvents();

export function firmLogoUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
}

