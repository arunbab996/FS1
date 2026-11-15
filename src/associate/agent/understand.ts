import type { Background, Schedule, SearchFilters, SignalType, Weekday } from "../types";

/**
 * Turns a plain-English request into structured search filters. In the no-API prototype this is a
 * rule-based parser; with the Anthropic API, Claude fills the same `SearchFilters` shape when it
 * calls the `search_people` tool, and this file goes away.
 */

export interface Understood {
  filters: SearchFilters;
  /** Human-readable versions of each filter, shown as "Here's how I read that" chips. */
  chips: string[];
  /** Words left after filters are pulled out, used for similarity ranking. */
  freeText: string;
}

const COMPANIES: [string, RegExp][] = [
  ["Grab", /\bgrab\b/i],
  ["Sea", /\bSea\b(?!\s*region)|\bsea (group|limited)\b/],
  ["Shopee", /\bshopee\b/i],
  ["Garena", /\bgarena\b/i],
  ["Carousell", /\bcarousell\b/i],
  ["Ninja Van", /\bninja ?van\b/i],
  ["Lazada", /\blazada\b/i],
  ["Nium", /\bnium\b/i],
  ["ByteDance", /\bbyte ?dance\b|\btiktok\b/i],
  ["Google", /\bgoogle\b/i],
  ["Stripe", /\bstripe\b/i],
  ["Airwallex", /\bairwallex\b/i],
  ["Advance.ai", /\badvance\.?ai\b/i],
  ["Gojek", /\bgo-?jek\b/i],
  ["GoTo", /\bgoto\b/i],
  ["Tokopedia", /\btokopedia\b|\btokped\b/i],
  ["Traveloka", /\btraveloka\b/i],
  ["Bukalapak", /\bbukalapak\b/i],
  ["Xendit", /\bxendit\b/i],
  ["Kredivo", /\bkredivo\b/i],
  ["Ajaib", /\bajaib\b/i],
  ["eFishery", /\befishery\b/i],
  ["Flipkart", /\bflipkart\b/i],
  ["Swiggy", /\bswiggy\b/i],
  ["Zomato", /\bzomato\b/i],
  ["Razorpay", /\brazorpay\b/i],
  ["Paytm", /\bpaytm\b/i],
  ["PhonePe", /\bphone ?pe\b/i],
  ["CRED", /\bcred\b/i],
  ["Meesho", /\bmeesho\b/i],
  ["Zerodha", /\bzerodha\b/i],
  ["Freshworks", /\bfreshworks\b/i],
  ["Postman", /\bpostman\b/i],
  ["Microsoft", /\bmicrosoft\b/i],
  ["Amazon", /\bamazon\b|\baws\b/i],
  ["VNG", /\bvng\b/i],
  ["MoMo", /\bmomo\b/i],
  ["Tiki", /\btiki\b/i],
  ["VNPay", /\bvnpay\b/i],
  ["FPT Software", /\bfpt\b/i],
  ["GCash", /\bgcash\b/i],
  ["Maya", /\bpaymaya\b|\bmaya\b(?= (bank|alumni|payments))/i],
  ["Kumu", /\bkumu\b/i],
  ["Agoda", /\bagoda\b/i],
  ["LINE MAN Wongnai", /\bline ?man\b|\bwongnai\b/i],
  ["Ascend Money", /\bascend money\b|\btruemoney\b/i],
  ["Bitkub", /\bbitkub\b/i],
  ["Carsome", /\bcarsome\b/i],
  ["Canva", /\bcanva\b/i],
  ["Atlassian", /\batlassian\b/i],
  ["SafetyCulture", /\bsafety ?culture\b/i],
  ["Afterpay", /\bafterpay\b/i],
  ["Culture Amp", /\bculture ?amp\b/i],
];

const SIGNALS: [SignalType, RegExp][] = [
  ["Stealth", /\bstealth\b/i],
  ["New Company", /\bnew (company|companies|startup|startups|venture)\b|\bstarted (a|their|his|her)? ?(new )?(company|startup)\b|\bincorporated\b|\bfounded (a|their)\b|\blaunched a (company|startup)\b/i],
  ["Exploring", /\bexploring\b|\bwhat'?s next\b|\bopen to work\b|\bbetween roles\b|\btaking a break\b/i],
  ["Investor Interest", /\binvestor interest\b|\binvestors? (are )?(following|tracking)\b|\bvc interest\b|\bfunds? following\b|\btracked by (investors|vcs|funds)\b|\bfollowed by (investors|vcs|funds)\b/i],
];

const SECTORS: [string, RegExp][] = [
  ["AI infra", /\bai infra(structure)?\b|\bml infra(structure)?\b|\bllm (infra|ops|tooling|infrastructure)\b|\binference\b|\bmlops\b|\bgpus?\b|\bmodel serving\b/i],
  ["Developer tools", /\bdev(eloper)? ?tools?\b|\bdevtools\b|\bdeveloper platforms?\b/i],
  ["Fintech", /\bfintech\b|\bpayments?\b|\blending\b|\bneobanks?\b|\binsurtech\b|\bwealth ?tech\b/i],
  ["Commerce", /\be-?commerce\b|\bcommerce\b|\bmarketplaces?\b|\bretail\b/i],
  ["Logistics", /\blogistics\b|\bsupply chain\b|\bfreight\b|\blast-?mile\b/i],
  ["Healthtech", /\bhealth ?tech\b|\bhealthcare\b|\bmedtech\b|\bhealth\b/i],
  ["Climate", /\bclimate\b|\bcarbon\b|\bclean ?tech\b|\bsustainability\b|\bev\b/i],
  ["B2B SaaS", /\bb2b saas\b|\bsaas\b|\benterprise software\b/i],
  ["Consumer", /\bconsumer\b|\bsocial apps?\b|\bcreator economy\b/i],
  ["Edtech", /\bed ?tech\b|\beducation\b/i],
  ["Data infra", /\bdata infra(structure)?\b|\bdata tooling\b|\bdata platforms?\b|\bdata pipelines?\b/i],
];

const SEA = ["Singapore", "Indonesia", "Vietnam", "Philippines", "Thailand", "Malaysia"];
const COUNTRIES: [string[], RegExp][] = [
  [SEA, /\bSEA\b|\bsouth-?east asia\b|\bsoutheast asian\b/],
  [[...SEA, "India", "Australia"], /\bapac\b|\basia pacific\b/i],
  [["Singapore"], /\bsingapore(an)?\b|\bSG\b/i],
  [["Indonesia"], /\bindonesia(n)?\b|\bjakarta\b|\bbandung\b|\bsurabaya\b/i],
  [["India"], /\bindia(n)?\b|\bbengaluru\b|\bbangalore\b|\bmumbai\b|\bdelhi\b|\bhyderabad\b|\bpune\b/i],
  [["Vietnam"], /\bviet ?nam(ese)?\b|\bho chi minh\b|\bhcmc\b|\bsaigon\b|\bhanoi\b/i],
  [["Philippines"], /\bphilippines\b|\bfilipino\b|\bmanila\b|\bcebu\b/i],
  [["Thailand"], /\bthailand\b|\bthai\b|\bbangkok\b/i],
  [["Malaysia"], /\bmalaysia(n)?\b|\bkuala lumpur\b|\bpenang\b/i],
  [["Australia"], /\baustralia(n)?\b|\bsydney\b|\bmelbourne\b/i],
];

const BACKGROUNDS: [Background[], RegExp][] = [
  [["Engineering", "Data & ML", "Research"], /\btechnical\b/i],
  [["Data & ML", "Research"], /\bml researchers?\b|\bai researchers?\b/i],
  [["Engineering"], /\bengineers?\b|\bengineering\b|\bdevelopers?\b|\bswes?\b|\bctos?\b/i],
  [["Product"], /\bproduct (managers?|leaders?|leads?|people|folks)\b|\bpms?\b|\bcpos?\b|\bproduct\b/i],
  [["Data & ML"], /\bdata scientists?\b|\bml engineers?\b|\bmachine learning\b|\bml\b/i],
  [["Design"], /\bdesigners?\b|\bdesign leads?\b/i],
  [["Operations"], /\boperators?\b|\boperations\b|\bops\b|\bgrowth\b|\bbizops\b|\bgeneral managers?\b|\bcountry managers?\b/i],
  [["Research"], /\bresearchers?\b|\bresearch scientists?\b|\bphds?\b/i],
];

const NUMBER_WORDS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, nine: 9, twelve: 12 };

function parseWithin(text: string): [number, string] | null {
  const m = text.match(/\b(?:in |over |within )?(?:the )?(?:last|past)\s+(\d+|a|an|one|two|three|four|five|six|nine|twelve)?\s*(day|week|month|year)s?\b/i);
  if (m) {
    const n = m[1] ? (NUMBER_WORDS[m[1].toLowerCase()] ?? Number(m[1])) : 1;
    const unit = m[2].toLowerCase();
    const days = n * (unit === "day" ? 1 : unit === "week" ? 7 : unit === "month" ? 30 : 365);
    return [days, m[0]];
  }
  const fixed: [RegExp, number][] = [
    [/\btoday\b/i, 1],
    [/\byesterday\b/i, 2],
    [/\bthis week\b/i, 7],
    [/\bthis month\b/i, 30],
    [/\bthis quarter\b/i, 90],
    [/\brecent(ly)?\b|\blately\b/i, 60],
  ];
  for (const [re, days] of fixed) {
    const hit = text.match(re);
    if (hit) return [days, hit[0]];
  }
  return null;
}

export function describeWithin(days: number): string {
  if (days <= 1) return "Today";
  if (days % 30 === 0) return `Last ${days / 30 === 1 ? "month" : `${days / 30} months`}`;
  if (days % 7 === 0) return `Last ${days / 7 === 1 ? "week" : `${days / 7} weeks`}`;
  return `Last ${days} days`;
}

export function understandQuery(input: string): Understood {
  let rest = ` ${input} `;
  const filters: SearchFilters = {};
  const chips: string[] = [];
  const take = (re: RegExp) => {
    rest = rest.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`), " ");
  };

  // Sectors and recency first, so their words ("data", "product") don't read as backgrounds.
  const sectors = SECTORS.filter(([, re]) => re.test(rest)).map(([name, re]) => (take(re), name));
  if (sectors.length) {
    filters.sectors = sectors;
    chips.push(`Building in ${sectors.join(" or ")}`);
  }

  const within = parseWithin(rest);
  if (within) {
    filters.withinDays = within[0];
    rest = rest.replace(within[1], " ");
    chips.push(describeWithin(within[0]));
  }

  const signals = SIGNALS.filter(([, re]) => re.test(rest)).map(([name, re]) => (take(re), name));
  if (signals.length) {
    filters.signalTypes = signals;
    chips.push(`Signal: ${signals.join(" or ")}`);
  }

  if (/\b(repeat|serial|second-time|2nd-time) founders?\b|\bpreviously founded\b|\bfounded (a company )?before\b/i.test(rest)) {
    filters.repeatFounder = true;
    take(/\b(repeat|serial|second-time|2nd-time) founders?\b|\bpreviously founded\b|\bfounded (a company )?before\b/i);
    chips.push("Repeat founder");
  }

  const companies = COMPANIES.filter(([, re]) => re.test(rest)).map(([name, re]) => (take(re), name));
  if (companies.length) {
    filters.pastCompanies = companies;
    chips.push(`Worked at ${companies.join(" or ")}`);
  }

  const countrySet = new Set<string>();
  for (const [names, re] of COUNTRIES) {
    if (re.test(rest)) {
      names.forEach((c) => countrySet.add(c));
      take(re);
    }
  }
  if (countrySet.size) {
    filters.countries = [...countrySet];
    chips.push(countrySet.size > 3 ? `Region: ${countrySet.size} countries` : `Based in ${[...countrySet].join(" or ")}`);
  }

  const backgroundSet = new Set<Background>();
  for (const [names, re] of BACKGROUNDS) {
    if (re.test(rest)) {
      names.forEach((b) => backgroundSet.add(b));
      take(re);
    }
  }
  if (backgroundSet.size) {
    filters.backgrounds = [...backgroundSet];
    chips.push(`Background: ${[...backgroundSet].join(", ")}`);
  }

  const freeText = rest
    .replace(/\b(ex|former|alumni|from|who|that|and|or|in|at|the|with|of|went|go|gone|are|is|building|built|left|leaving|people|founders?|operators?|show me|find me|find|search for|look for|any|some|all)\b/gi, " ")
    .replace(/[-–,.?!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { filters, chips, freeText };
}

/** "every Monday", "daily", "every weekday at 9" → a schedule. Defaults to Mondays at 8:00. */
export function understandSchedule(input: string): Schedule | null {
  const text = input.toLowerCase();
  const hourMatch = text.match(/\bat (\d{1,2})(?::\d{2})?\s*(am|pm)?\b/);
  let hour = 8;
  if (hourMatch) {
    hour = Number(hourMatch[1]) % 12;
    if (hourMatch[2] === "pm") hour += 12;
    else if (!hourMatch[2] && Number(hourMatch[1]) === 12) hour = 12;
    else if (!hourMatch[2]) hour = Number(hourMatch[1]);
  }
  if (/\bevery ?day\b|\bdaily\b|\beach day\b/.test(text)) return { kind: "daily", hour };
  if (/\bweekdays?\b|\bevery work ?day\b/.test(text)) return { kind: "weekdays", hour };
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const day = days.findIndex((d) => text.includes(d));
  if (day >= 0) return { kind: "weekly", weekday: day as Weekday, hour };
  if (/\bweekly\b|\bevery week\b|\bonce a week\b/.test(text)) return { kind: "weekly", weekday: 1, hour };
  return null;
}
