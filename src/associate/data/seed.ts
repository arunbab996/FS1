import type { Background, Person, Role, SignalType } from "../types";

/**
 * The AI Associate's seed database: ~200 fake APAC profiles (plus 30 held back as "incoming"
 * signals), generated deterministically so every load gives the same people. Names are invented
 * combinations; employers are real companies so searches like "ex-Grab" behave realistically.
 *
 * A handful of profiles are planted so each suggested prompt in the chat returns real matches,
 * and the held-back batches are skewed the same way so a re-run of a saved search finds new people.
 */

// Deterministic RNG (mulberry32) so the database is identical on every load.
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
const rand = rng(20261110);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const chance = (p: number) => rand() < p;

type Gender = "he" | "she";

interface CountryPool {
  cities: string[];
  first: [string, Gender][];
  last: string[];
  companies: string[];
  schools: string[];
}

const countries: Record<string, CountryPool> = {
  Singapore: {
    cities: ["Singapore"],
    first: [
      ["Wei Jie", "he"], ["Jun Hao", "he"], ["Marcus", "he"], ["Darren", "he"], ["Aaron", "he"], ["Zhi Wei", "he"],
      ["Hui Min", "she"], ["Shu Ting", "she"], ["Rachel", "she"], ["Joanne", "she"], ["Clarice", "she"], ["Li Ting", "she"],
    ],
    last: ["Tan", "Lim", "Ng", "Ong", "Koh", "Chua", "Teo", "Goh", "Seah", "Yeo", "Sim", "Toh"],
    companies: ["Grab", "Sea", "Shopee", "Garena", "Carousell", "Ninja Van", "Lazada", "Nium", "ByteDance", "Google", "Stripe", "Airwallex", "Advance.ai"],
    schools: ["National University of Singapore", "Nanyang Technological University", "Singapore Management University", "SUTD"],
  },
  Indonesia: {
    cities: ["Jakarta", "Jakarta", "Bandung", "Surabaya"],
    first: [
      ["Rizky", "he"], ["Dimas", "he"], ["Fajar", "he"], ["Bayu", "he"], ["Arif", "he"], ["Kevin", "he"],
      ["Putri", "she"], ["Ayu", "she"], ["Nadia", "she"], ["Sari", "she"], ["Intan", "she"], ["Michelle", "she"],
    ],
    last: ["Pratama", "Wijaya", "Santoso", "Saputra", "Halim", "Kurniawan", "Hidayat", "Gunawan", "Setiawan", "Tanoto"],
    companies: ["Gojek", "GoTo", "Tokopedia", "Traveloka", "Bukalapak", "Xendit", "Kredivo", "Ajaib", "eFishery", "Shopee", "Grab"],
    schools: ["Universitas Indonesia", "Institut Teknologi Bandung", "Binus University", "Universitas Gadjah Mada"],
  },
  India: {
    cities: ["Bengaluru", "Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune"],
    first: [
      ["Arjun", "he"], ["Karthik", "he"], ["Vikram", "he"], ["Siddharth", "he"], ["Aditya", "he"], ["Nikhil", "he"],
      ["Ananya", "she"], ["Shreya", "she"], ["Kavya", "she"], ["Ishita", "she"], ["Neha", "she"], ["Divya", "she"],
    ],
    last: ["Sharma", "Iyer", "Reddy", "Menon", "Rao", "Kapoor", "Agarwal", "Bhat", "Krishnan", "Joshi", "Desai", "Kulkarni"],
    companies: ["Flipkart", "Swiggy", "Zomato", "Razorpay", "Paytm", "PhonePe", "CRED", "Meesho", "Zerodha", "Freshworks", "Postman", "Google", "Microsoft", "Amazon"],
    schools: ["IIT Bombay", "IIT Delhi", "IIT Madras", "BITS Pilani", "IISc Bengaluru", "IIM Ahmedabad"],
  },
  Vietnam: {
    cities: ["Ho Chi Minh City", "Ho Chi Minh City", "Hanoi"],
    first: [
      ["Minh", "he"], ["Huy", "he"], ["Tuan", "he"], ["Duc", "he"], ["Khanh", "he"],
      ["Linh", "she"], ["Trang", "she"], ["Thao", "she"], ["Mai", "she"], ["Phuong", "she"],
    ],
    last: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do"],
    companies: ["VNG", "MoMo", "Tiki", "Grab", "Shopee", "VNPay", "FPT Software"],
    schools: ["Hanoi University of Science and Technology", "HCMC University of Technology", "RMIT Vietnam", "Foreign Trade University"],
  },
  Philippines: {
    cities: ["Manila", "Manila", "Cebu"],
    first: [
      ["Miguel", "he"], ["Paolo", "he"], ["Carlo", "he"], ["Joaquin", "he"],
      ["Bianca", "she"], ["Andrea", "she"], ["Patricia", "she"], ["Isabel", "she"],
    ],
    last: ["Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Mendoza", "Villanueva", "Ramos"],
    companies: ["GCash", "Maya", "Grab", "Shopee", "Lazada", "Kumu", "Globe Telecom"],
    schools: ["Ateneo de Manila University", "University of the Philippines Diliman", "De La Salle University"],
  },
  Thailand: {
    cities: ["Bangkok"],
    first: [
      ["Natthapong", "he"], ["Kittipong", "he"], ["Thanakorn", "he"], ["Chayut", "he"],
      ["Siriporn", "she"], ["Ploy", "she"], ["Pim", "she"], ["Arisa", "she"],
    ],
    last: ["Srisuk", "Chaiyaporn", "Wongsakul", "Rattanakorn", "Suwannarat", "Boonmee"],
    companies: ["Agoda", "LINE MAN Wongnai", "Ascend Money", "Lazada", "Grab", "Bitkub"],
    schools: ["Chulalongkorn University", "Mahidol University", "KMUTT"],
  },
  Malaysia: {
    cities: ["Kuala Lumpur", "Kuala Lumpur", "Penang"],
    first: [
      ["Aiman", "he"], ["Hafiz", "he"], ["Jason", "he"], ["Daniel", "he"],
      ["Farah", "she"], ["Nurul", "she"], ["Mei Ling", "she"], ["Siti", "she"],
    ],
    last: ["Abdullah", "Rahman", "Ismail", "Lee", "Wong", "Lim", "Tan", "Chong"],
    companies: ["Grab", "Carsome", "Fave", "Lazada", "Shopee", "Boost"],
    schools: ["University of Malaya", "Universiti Teknologi Malaysia", "Monash University Malaysia"],
  },
  Australia: {
    cities: ["Sydney", "Sydney", "Melbourne"],
    first: [
      ["Liam", "he"], ["Jack", "he"], ["Noah", "he"], ["Ethan", "he"],
      ["Olivia", "she"], ["Chloe", "she"], ["Emily", "she"], ["Grace", "she"],
    ],
    last: ["Walsh", "Murphy", "Chen", "Nguyen", "Patel", "Kelly", "Fraser", "Harding"],
    companies: ["Canva", "Atlassian", "Airwallex", "SafetyCulture", "Afterpay", "Culture Amp", "Google"],
    schools: ["University of Sydney", "UNSW Sydney", "University of Melbourne", "Monash University"],
  },
};

const countryWeights: [string, number][] = [
  ["Singapore", 5], ["Indonesia", 5], ["India", 6], ["Vietnam", 3], ["Philippines", 2], ["Thailand", 2], ["Malaysia", 2], ["Australia", 2],
];

const titles: Record<Background, string[]> = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer", "Engineering Manager", "Head of Engineering", "VP Engineering"],
  Product: ["Product Manager", "Senior Product Manager", "Group Product Manager", "Head of Product", "Director of Product"],
  "Data & ML": ["Data Scientist", "ML Engineer", "Senior ML Engineer", "Head of Data", "Applied Scientist"],
  Design: ["Product Designer", "Senior Product Designer", "Design Lead", "Head of Design"],
  Operations: ["Operations Manager", "Head of Operations", "Country Manager", "BizOps Lead", "Growth Lead"],
  Research: ["Research Scientist", "Research Engineer", "Senior Research Scientist"],
};

const backgroundWeights: [Background, number][] = [
  ["Engineering", 8], ["Product", 5], ["Data & ML", 4], ["Operations", 3], ["Design", 2], ["Research", 2],
];

const building: Record<string, string[]> = {
  "AI infra": [
    "Inference tooling for teams running open-weight models on their own GPUs",
    "A cheaper serving layer for fine-tuned LLMs in Southeast Asian languages",
    "Evaluation and monitoring for production LLM apps",
    "GPU scheduling and cost control for ML training jobs",
  ],
  "Developer tools": [
    "A testing platform that writes and maintains integration tests",
    "Internal developer portals for mid-size engineering teams",
    "Code review tooling for monorepos",
  ],
  Fintech: [
    "Embedded lending for SME sellers on marketplaces",
    "Cross-border payouts for freelancers paid in USD",
    "A treasury tool for regional finance teams",
    "Payments infrastructure for QR-first markets",
  ],
  Commerce: [
    "Live-commerce tooling for small brands",
    "A B2B ordering app for neighbourhood stores",
    "Returns and reverse logistics for online sellers",
  ],
  Logistics: [
    "Route planning for last-mile fleets in tier-2 cities",
    "A freight marketplace for cross-border trucking",
  ],
  Healthtech: [
    "Clinic management software for independent GPs",
    "Remote monitoring for chronic-disease patients",
  ],
  Climate: [
    "Carbon accounting for manufacturers exporting to the EU",
    "EV fleet charging and financing",
  ],
  "B2B SaaS": [
    "Workflow automation for HR teams across APAC payroll rules",
    "Procurement software for mid-market companies",
  ],
  Consumer: [
    "A social app for hobby communities",
    "A creator membership platform for local-language creators",
  ],
  Edtech: [
    "AI tutoring for secondary-school maths",
    "Upskilling bootcamps paid through income share",
  ],
  "Data infra": [
    "A data pipeline tool for analytics teams without data engineers",
    "Real-time feature stores for fraud models",
  ],
};
const sectorNames = Object.keys(building);

const funds = [
  "Peak XV", "Accel", "Lightspeed", "East Ventures", "Antler", "Openspace", "Insignia Ventures", "Vertex Ventures",
  "Jungle Ventures", "Elevation Capital", "Blume Ventures", "Monk's Hill", "AC Ventures", "Square Peg", "Blackbird",
];

const startupFirst = ["Loom", "Kite", "Tern", "Nimbus", "Pilot", "Quill", "Atlas", "Ember", "Lumen", "Strata", "Vale", "Orbit", "Haven", "Mosaic", "Relay", "Sable", "Tidal", "Weave"];
const startupLast = ["Labs", "AI", "Works", "HQ", "Systems", "Stack", "Pay", "Health", "Logic"];

const thisYear = new Date().getFullYear();

function weighted<T>(items: [T, number][]): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [item, w] of items) {
    roll -= w;
    if (roll <= 0) return item;
  }
  return items[0][0];
}

const usedNames = new Set<string>();
function makeName(pool: CountryPool): [string, Gender] {
  for (let i = 0; i < 50; i++) {
    const [first, gender] = pick(pool.first);
    const name = `${first} ${pick(pool.last)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return [name, gender];
    }
  }
  const [first, gender] = pick(pool.first);
  const name = `${first} ${pick(pool.last)} ${usedNames.size}`;
  usedNames.add(name);
  return [name, gender];
}

function startupName() {
  return `${pick(startupFirst)} ${pick(startupLast)}`;
}

/** What a planted profile must have; anything left out is random. */
interface Spec {
  country?: string;
  background?: Background;
  signal?: SignalType;
  lastCompany?: string;
  sector?: string;
  daysAgo?: [number, number];
  repeatFounder?: boolean;
  incomingBatch?: number;
}

let counter = 0;

function makePerson(spec: Spec = {}): Person {
  counter += 1;
  const country = spec.country ?? weighted(countryWeights);
  const pool = countries[country];
  const [name, pronoun] = makeName(pool);
  const background = spec.background ?? weighted(backgroundWeights);
  const signalType: SignalType =
    spec.signal ?? weighted<SignalType>([["Stealth", 3], ["New Company", 3], ["Exploring", 2], ["Investor Interest", 3]]);
  const sector = spec.sector ?? pick(sectorNames);
  const sectors = chance(0.25) ? [sector, pick(sectorNames.filter((s) => s !== sector))] : [sector];

  // Career: one to three past roles, most recent first.
  const lastCompany = spec.lastCompany ?? pick(pool.companies);
  const tenure = int(2, 7);
  const leftYear = thisYear - (signalType === "Exploring" || signalType === "Stealth" ? 0 : int(0, 1));
  const lastTitle = pick(titles[background].slice(1));
  const roles: Role[] = [{ company: lastCompany, title: lastTitle, startYear: leftYear - tenure, endYear: leftYear }];
  let cursor = leftYear - tenure;
  const earlier = int(1, 2);
  for (let i = 0; i < earlier; i++) {
    const company = pick(pool.companies.filter((c) => !roles.some((r) => r.company === c)));
    const years = int(1, 4);
    roles.push({ company, title: pick(titles[background].slice(0, 3)), startYear: cursor - years, endYear: cursor });
    cursor -= years;
  }

  const repeatFounder = spec.repeatFounder ?? chance(0.18);
  let previousStartup: string | undefined;
  if (repeatFounder) {
    previousStartup = startupName();
    const years = int(2, 4);
    roles.push({ company: previousStartup, title: "Co-founder", startYear: cursor - years, endYear: cursor });
    cursor -= years;
  }

  // Current position and the signal that surfaced them.
  const [minDays, maxDays] = spec.daysAgo ?? [1, 170];
  const daysAgo = int(minDays, maxDays);
  const obj = pronoun === "he" ? "him" : "her";
  let headline: string;
  let detail: string;
  let investor: string | undefined;
  let buildingText = pick(building[sector]);

  switch (signalType) {
    case "Stealth":
      roles.unshift({ company: "Stealth", title: "Founder", startYear: thisYear, endYear: null });
      headline = `Founder, Stealth · ex-${lastCompany}`;
      detail = `Left ${lastCompany} after ${tenure} years as ${lastTitle}. LinkedIn now says "Stealth".`;
      break;
    case "New Company": {
      const company = startupName();
      const role = background === "Engineering" || background === "Data & ML" || background === "Research" ? "Co-founder & CTO" : "Co-founder & CEO";
      roles.unshift({ company, title: role, startYear: thisYear, endYear: null });
      headline = `${role}, ${company}`;
      detail = `Incorporated ${company} with a former ${lastCompany} teammate.`;
      break;
    }
    case "Exploring":
      headline = `Exploring what's next · ex-${lastTitle} at ${lastCompany}`;
      detail = `Changed headline to "Exploring what's next" after ${tenure} years at ${lastCompany}.`;
      buildingText = chance(0.5) ? "" : `Interested in ${sector.toLowerCase()}: ${buildingText.charAt(0).toLowerCase()}${buildingText.slice(1)}`;
      break;
    case "Investor Interest":
      investor = pick(funds);
      if (chance(0.6)) {
        roles.unshift({ company: "Stealth", title: "Founder", startYear: thisYear, endYear: null });
        headline = `Building in ${sector} · ex-${lastCompany}`;
        detail = `${investor} started following ${obj} on X, weeks after ${pronoun} left ${lastCompany}.`;
      } else {
        roles[0] = { ...roles[0], endYear: null };
        headline = `${lastTitle} at ${lastCompany}`;
        detail = `${investor} started following ${obj} on X.`;
      }
      break;
  }

  const firstStart = roles[roles.length - 1].startYear;
  const signalDate = new Date();
  signalDate.setHours(9, 0, 0, 0);
  signalDate.setDate(signalDate.getDate() - daysAgo);

  return {
    id: `p${String(counter).padStart(3, "0")}`,
    name,
    pronoun,
    headline,
    city: pick(pool.cities),
    country,
    background,
    yearsExperience: thisYear - firstStart,
    roles,
    education: pick(pool.schools),
    building: buildingText,
    sectors,
    repeatFounder,
    previousStartup,
    signal: { type: signalType, date: signalDate.toISOString(), detail, investor },
    incomingBatch: spec.incomingBatch,
  };
}

function repeat(n: number, spec: () => Spec): Person[] {
  return Array.from({ length: n }, () => makePerson(spec()));
}

const sea = ["Singapore", "Indonesia", "Vietnam", "Malaysia"];

/** Planted so each suggested prompt has real matches (and some near-misses to filter out). */
function planted(batch?: number, scale = 1): Person[] {
  const n = (count: number) => Math.max(1, Math.round(count * scale));
  const days: [number, number] | undefined = batch ? [0, 0] : undefined;
  return [
    // "Ex-Grab engineers who went stealth in the last 3 months, building in AI infra"
    ...repeat(n(6), () => ({ country: pick(sea), background: "Engineering", signal: "Stealth", lastCompany: "Grab", sector: "AI infra", daysAgo: days ?? [3, 80], incomingBatch: batch })),
    // "Repeat founders in Indonesia who started a new company recently"
    ...repeat(n(5), () => ({ country: "Indonesia", signal: "New Company", repeatFounder: true, daysAgo: days ?? [2, 50], incomingBatch: batch })),
    // "Fintech product leaders from Sea or Shopee exploring what's next"
    ...repeat(n(5), () => ({ country: pick(["Singapore", "Indonesia", "Vietnam"]), background: "Product", signal: "Exploring", lastCompany: pick(["Sea", "Shopee"]), sector: "Fintech", daysAgo: days ?? [3, 90], incomingBatch: batch })),
    // "Technical founders in India with investor interest in the last 30 days"
    ...repeat(n(6), () => ({ country: "India", background: pick<Background>(["Engineering", "Data & ML"]), signal: "Investor Interest", daysAgo: days ?? [1, 28], incomingBatch: batch })),
    // "Ex-Gojek or Tokopedia engineers building developer tools"
    ...repeat(n(5), () => ({ country: "Indonesia", background: "Engineering", signal: pick<SignalType>(["Stealth", "New Company"]), lastCompany: pick(["Gojek", "Tokopedia"]), sector: "Developer tools", daysAgo: days ?? [3, 120], incomingBatch: batch })),
    // "ML researchers in Singapore who went stealth"
    ...repeat(n(5), () => ({ country: "Singapore", background: pick<Background>(["Research", "Data & ML"]), signal: "Stealth", sector: pick(["AI infra", "Data infra", "Healthtech"]), daysAgo: days ?? [3, 120], incomingBatch: batch })),
  ];
}

function nearMisses(): Person[] {
  return [
    // Ex-Grab stealth engineers, but not AI infra / too long ago.
    ...repeat(2, () => ({ country: "Singapore", background: "Engineering", signal: "Stealth", lastCompany: "Grab", sector: "Fintech", daysAgo: [10, 60] })),
    ...repeat(2, () => ({ country: "Vietnam", background: "Engineering", signal: "Stealth", lastCompany: "Grab", sector: "AI infra", daysAgo: [130, 170] })),
  ];
}

function build(): Person[] {
  const people = [...planted(), ...nearMisses()];
  while (people.length < 200) people.push(makePerson());
  // Three incoming batches of 10, released one at a time by "Simulate new signals".
  for (const batch of [1, 2, 3]) {
    const incoming = planted(batch, 0.25);
    while (incoming.length < 10) incoming.push(makePerson({ incomingBatch: batch, daysAgo: [0, 0] }));
    people.push(...incoming.slice(0, 10));
  }
  return people;
}

export const SEED_PEOPLE: Person[] = build();
export const INCOMING_BATCHES = 3;
