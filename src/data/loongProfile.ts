import type { TalentProfile } from "../types";
import { generateContributions } from "../utils/github";

export const loongProfile: TalentProfile = {
  titleLine: "CEO & Founder · Rethinking drug design one byte at a time.",
  connections: 3318,
  followers: 3743,
  rolesHeld: 11,
  avgTenureMonths: 32,
  location: "Singapore",
  aiSummaryGenerated: "Jul 27, 2026",
  overview: "Distributed Systems, SQL, Java, Haskell, and Concurrent Programming.",
  positions: [
    {
      company: "Metal",
      title: "CEO & Founder",
      period: "May 2026 - Present",
      months: 3,
      category: "founder",
      tag: "Engineering",
      companyMeta: ["Founded: Jan 2026"],
    },
    {
      company: "Metal",
      title: "Software Developer",
      period: "Jan 2015 - Jan 2017",
      months: 24,
      category: "corporate",
      tag: "Engineering",
    },
    {
      company: "Automera",
      title: "Board Member & Founder",
      period: "Jan 2022 - Present",
      months: 55,
      category: "founder",
      companyMeta: ["Headcount: 12", "Founded: Jan 2022", "Funding: $16.0M", "Stage: series_a"],
    },
    {
      company: "Automera",
      title: "Co-Founder",
      period: "Jan 2022 - Present",
      months: 55,
      category: "founder",
    },
    {
      company: "QDX",
      title: "CEO & Founder",
      period: "Jan 2023 - May 2026",
      months: 40,
      category: "founder",
      companyMeta: ["Headcount: 23", "Founded: Jan 2023", "Funding: $0"],
    },
    {
      company: "Ren",
      title: "Chief Technology Officer",
      period: "Jan 2017 - Jan 2021",
      months: 48,
      category: "corporate",
      companyMeta: ["Headcount: 20", "Founded: Jan 2016", "Funding: $7.5M", "Stage: seed"],
    },
    {
      company: "Ren",
      title: "CTO & Founder",
      period: "Jan 2017 - Jan 2021",
      months: 48,
      category: "founder",
    },
    {
      company: "Neucode",
      title: "Software Developer",
      period: "Jan 2015 - Jan 2017",
      months: 24,
      category: "corporate",
    },
    {
      company: "The Australian National University",
      title: "Academic Tutor",
      period: "Jan 2014 - Jan 2017",
      months: 36,
      category: "corporate",
    },
    {
      company: "The Australian National University",
      title: "Researcher",
      period: "Jan 2015 - Jan 2016",
      months: 12,
      category: "academia",
    },
  ],
  education: [
    {
      school: "The Australian National University",
      badge: "Others",
      degree: "Advanced Research and Development (Computer Science) (Honours)",
      detail: "Honours (First Class) — combined coursework with an academic research thesis in distributed systems.",
    },
  ],
  pedigree: [
    {
      category: "honours",
      label: "ANU Advanced Research & Development (CS), Honours",
      detail:
        "Honours-level computer science research degree — combined coursework with an academic research thesis before entering industry.",
    },
    {
      category: "publication",
      label: "Honours thesis on distributed systems, ANU",
      detail: "Research output from the ANU Honours program — the technical foundation underneath three deep-tech companies since.",
      year: "2015",
      mock: true,
    },
  ],
  careerSignals: [
    {
      kind: "employer-tier",
      label: "Serial deep-tech founder: Ren (seed), Automera (Series A, $16M), QDX, now Metal",
      detail: "Each successive company raised further and scaled headcount further than the last — a compounding founder trajectory.",
    },
    {
      kind: "departure-event",
      label: "Left QDX (CEO) directly into founding Metal",
      detail: "Transitioned from CEO of QDX straight into founding Metal with no public gap — signals a decisive pivot rather than a stealth pause.",
    },
  ],
  network: [
    {
      kind: "co-founder",
      label: "Repeat co-founder across 4 companies (Ren, Automera, QDX, Metal)",
      detail: "One of the highest founding cadences in the dataset — a strong prior on execution and ability to attract capital repeatedly.",
    },
    {
      kind: "colleague-overlap",
      label: "ANU computer science alumni network",
      detail: "Academic tutor and researcher at ANU before founding Ren — retains ties into the university's CS research community.",
    },
  ],
  recognition: [
    {
      kind: "press",
      label: "QDX profiled in APAC deep-tech / drug-discovery coverage",
      detail: "QDX's AI-accelerated drug design work drew regional tech press attention prior to Loong's departure to found Metal.",
      date: "2025",
    },
  ],
  linkedinActivity: [
    {
      kind: "post",
      preview:
        "Drug design is still bottlenecked by simulation cost, not ideas. Metal exists to make the compute side a non-issue.",
      date: "3 days ago",
      url: "https://www.linkedin.com/posts/bzlwang_drugdiscovery-activity-7124756780123456789",
    },
    {
      kind: "comment",
      preview:
        "Been there — QDX taught me that a prior IPO means nothing to a new cap table. You still have to earn every dollar again.",
      date: "1 week ago",
      url: "https://www.linkedin.com/posts/automera_startups-activity-7121312233123456789",
    },
    {
      kind: "reaction",
      reaction: "Liked",
      preview: "Singapore's deep tech ecosystem just crossed another funding milestone this quarter.",
      date: "2 weeks ago",
      url: "https://www.linkedin.com/posts/enterprisesg_deeptech-activity-7118876543123456789",
    },
  ],
  github: {
    username: "bzlwang",
    followers: 173,
    stars: 512,
    publicRepos: 27,
    topLanguages: ["Haskell", "Java", "SQL"],
    contributions: generateContributions("bzlwang", 371, new Date(2026, 6, 27)),
  },
  behavioralSignals: [
    {
      kind: "new-directorship",
      label: "Appears as a newly registered director of Metal",
      detail: "New company incorporation registered days after stepping down as CEO of QDX — a clean, fast pivot rather than a stealth gap.",
      date: "May 2026",
    },
  ],
  insights: {
    totalMonths: 138,
    avgMonths: 32,
    longestMonths: 55,
    shortestMonths: 3,
    roles: 8,
    companies: 6,
    earlierRolesCount: 0,
  },
  activity: [
    {
      kind: "status",
      text: "Loong Wang left QDX and started Metal as CEO and Founder",
      date: "Last Monday",
    },
  ],
};
