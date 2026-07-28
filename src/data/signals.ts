import type { Signal } from "../types";
import { achintyaProfile } from "./achintyaProfile";
import { darshanProfile } from "./darshanProfile";
import { skyProfile } from "./skyProfile";

export const signals: Signal[] = [
  {
    id: "sig-darshan",
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    tags: [
      { label: "New Company", category: "momentum" },
      { label: "Software", category: "industry" },
      { label: "Australia", category: "geography" },
    ],
    score: 7.7,
    avatarInitials: "DP",
    headline:
      "**Darshan P.** left **ASX** and started a new company **FinishKit** as **'Founder'**",
    contextLine: "Sydney, Australia · 5.5 yrs experience",
    aiSummary:
      "Building FinishKit, an AI-powered code quality tool for engineering teams — solving reliability and review problems in AI-generated code.",
    sourcedBy: "Raynard Lao",
    assignedInvestor: "Raynard Lao",
    assignedStage: "Prospecting",
    linkedinUrl: "https://www.linkedin.com/in/darshan-patel-au/",
    profile: darshanProfile,
    current: [{ company: "FinishKit", role: "Founder" }],
    past: [
      { company: "ASX", role: "Quant Data Engineer" },
      { company: "ASX", role: "Graduate, Quant & Data Science" },
      { company: "ASX", role: "Graduate, Tech & Data" },
      { company: "ASX", role: "Graduate, Commercial Management" },
    ],
    education: [
      { company: "UNSW", role: "Bachelor of Science, Biotechnology" },
    ],
    reasoning: {
      positives: [
        "New company (FinishKit)",
        "Quant & data engineering background at ASX",
        "Technical, AI-focused product",
      ],
      negatives: ["No public traction yet"],
    },
  },
  {
    id: "sig-sky",
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    tags: [
      { label: "Investor interest", category: "investor-interest" },
      { label: "Repeat Founder", category: "momentum" },
      { label: "Software", category: "industry" },
      { label: "Singapore", category: "geography" },
    ],
    score: 6.6,
    avatarInitials: "SW",
    headline: "**Accel** is interested in **Sky Wee**",
    personName: "Sky Wee",
    contextLine: "Singapore · 13 yrs experience",
    aiSummary:
      "Building a stealth-mode venture after years as a top crypto KOL and Web3 operator — already drawing investor interest from Accel, and featured twice on the network's radar in the past two weeks.",
    sourcedVia: "Specter",
    linkedinUrl: "https://www.linkedin.com/in/skywee97",
    investorInterest: "Accel",
    featuredCount: 2,
    featuredWindowDays: 15,
    profile: skyProfile,
    current: [
      { company: "Stealth Startup", role: "Co-Founder" },
      { company: "Nexawork AI", role: "Co-Founder" },
      { company: "Mars Growth Capital", role: "Strategic Partner" },
    ],
    past: [
      { company: "Premier Pure Pte Ltd", role: "Business Development Manager" },
      { company: "Metahunter", role: "Chief Influencer Officer" },
      { company: "APBA Pte Ltd", role: "Human Resources" },
    ],
    education: [
      { company: "Republic Polytechnic", role: "Diploma of Education" },
      { company: "National University of Singapore", role: "Non-degree program" },
    ],
    reasoning: {
      positives: [
        "Investor interest from Accel",
        "Massive audience (4M+ followers across TikTok, Instagram, YouTube)",
        "Serial co-founder across multiple ventures",
      ],
      negatives: [
        "Stealth-mode, limited public product info",
        "Extremely high role turnover (29 roles across 35 companies)",
      ],
    },
  },
  {
    id: "sig-achintya",
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    tags: [
      { label: "Investor interest", category: "investor-interest" },
      { label: "Repeat Founder", category: "momentum" },
      { label: "Essentials", category: "industry" },
      { label: "India", category: "geography" },
    ],
    score: 8,
    avatarInitials: "AG",
    headline: "**3one4** is interested in **Achintya Gupta**",
    personName: "Achintya Gupta",
    contextLine: "Bengaluru, India · 15.7 yrs experience",
    aiSummary:
      "Repeat founder (Phyllo, now Reo.Dev) with deep BFSI/fintech GTM experience — already drawing investor interest from 3one4 Capital.",
    sourcedVia: "January Capital",
    linkedinUrl: "https://www.linkedin.com/in/achintyagupta",
    investorInterest: "3one4",
    profile: achintyaProfile,
    current: [{ company: "Reo.Dev", role: "Co-Founder and CEO" }],
    past: [
      { company: "Phyllo", role: "Co-Founder" },
      { company: "Finvolv", role: "Chief Business Officer" },
      { company: "Finvolv", role: "Director of Sales and Marketing" },
    ],
    education: [
      { company: "Indian Institute of Technology, Delhi", role: "B.Tech (dual degree), Chemical Engineering" },
      { company: "Indian School of Business", role: "MBA, Marketing & IT Management" },
      { company: "Indian Business School of Advanced Management Studies", role: "Marketing and Tech" },
    ],
    reasoning: {
      positives: [
        "Investor interest from 3one4 Capital",
        "Repeat founder (Phyllo, Reo.Dev)",
        "Deep GTM/BFSI operating experience (Finvolv, 6+ years)",
        "IIT Delhi + ISB pedigree",
      ],
      negatives: ["Fundraise stage/timing not yet public"],
    },
  },
  {
    id: "sig-zippo",
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    tags: [
      { label: "Open source", category: "momentum" },
      { label: "Software", category: "industry" },
      { label: "Australia", category: "geography" },
    ],
    score: 6.6,
    avatarInitials: "ZH",
    headline:
      "**Zhipeng (Zippo) H.** is actively building an open-source developer tool on GitHub",
    contextLine: "Brisbane, Australia · 4 yrs experience",
    aiSummary:
      "Building an open-source CLI for streamlining local development environments, focused on fast, reproducible builds for small engineering teams.",
    current: [{ company: "QUT", role: "PhD candidate" }],
    past: [{ company: "QUT", role: "Research assistant" }],
    education: [{ company: "QUT", role: "BInfTech" }],
    reasoning: {
      positives: ["Active OSS momentum", "Deep technical background"],
      negatives: ["No prior founding experience"],
    },
  },
  {
    id: "sig-paulyn",
    dateGroup: "Today · Jul 27",
    status: "Active Duplicate Signal",
    tags: [
      { label: "New opportunity", category: "momentum" },
      { label: "Big tech experience", category: "background" },
      { label: "Australia", category: "geography" },
    ],
    score: 6.1,
    avatarInitials: "PV",
    headline:
      "**Paulyn V.** left **Qantas** and might be searching for a new opportunity",
    contextLine: "Sydney, Australia · 9 yrs experience",
    aiSummary:
      "Recently left Qantas after 4 years as a quality engineer. No public venture yet, but her network activity suggests she's exploring opportunities in aviation and logistics.",
    current: [{ company: "—", role: "Exploring" }],
    past: [
      { company: "Qantas", role: "Quality engineer" },
      { company: "Cebu Pacific", role: "Systems engineer" },
      { company: "Accenture", role: "Associate consultant" },
    ],
    education: [
      { company: "De La Salle University", role: "Bachelor's degree" },
    ],
    reasoning: {
      positives: ["Recent departure signal", "Engineering background"],
      negatives: ["Founder intent unconfirmed"],
    },
  },
  {
    id: "sig-loong",
    dateGroup: "Yesterday · Jul 26",
    status: "New Signal",
    tags: [
      { label: "New Company", category: "momentum" },
      { label: "Serial founder", category: "momentum" },
      { label: "VC backed", category: "background" },
    ],
    score: 8.2,
    avatarInitials: "LW",
    headline:
      "**Loong W.** left **QDX** and started a new company **Metal** as CEO and Founder",
    contextLine: "Singapore · 13 yrs experience",
    aiSummary:
      "Building Metal, developer infrastructure for deploying and scaling AI inference workloads across cloud providers, drawing on his experience scaling QDX.",
    current: [{ company: "Metal", role: "CEO and Founder" }],
    past: [
      { company: "QDX", role: "CEO and Founder" },
      { company: "Ren", role: "CTO and Founder" },
    ],
    education: [{ company: "NUS", role: "BComp" }],
    reasoning: {
      positives: [
        "Serial founder",
        "Previous company VC backed",
        "Fresh incorporation",
      ],
      negatives: ["Team not yet visible"],
    },
  },
  {
    id: "sig-aayush",
    dateGroup: "Yesterday · Jul 26",
    status: "Dormant Duplicate Signal",
    tags: [
      { label: "New opportunity", category: "momentum" },
      { label: "India", category: "geography" },
    ],
    score: 5.6,
    avatarInitials: "AK",
    headline:
      "**Aayush K.** left his role and might be searching for a new opportunity",
    contextLine: "Mumbai, India · 8 yrs experience",
    aiSummary:
      "Recently left Razorpay after leading product for SMB lending. Exploring new opportunities in fintech and consumer credit, per recent network activity.",
    current: [{ company: "—", role: "Exploring" }],
    past: [
      { company: "Razorpay", role: "Product manager" },
      { company: "Flipkart", role: "Senior associate" },
    ],
    education: [
      { company: "IIT Bombay", role: "BTech, Computer Science" },
    ],
    reasoning: {
      positives: [
        "Strong product background",
        "Fintech domain experience",
      ],
      negatives: ["Founder intent unconfirmed"],
    },
  },
  {
    id: "sig-mei",
    dateGroup: "Yesterday · Jul 26",
    status: "Passed Repeat Signal",
    tags: [
      { label: "Repeat founder", category: "momentum" },
      { label: "Health tech", category: "industry" },
      { label: "Singapore", category: "geography" },
    ],
    score: 7.1,
    avatarInitials: "ML",
    headline:
      "**Mei L.**, co-founder of **Vitalis Health**, was featured in TechCrunch's 'Ones to Watch' list",
    contextLine: "Singapore · 15 yrs experience",
    aiSummary:
      "Building Vitalis Health, a preventive-care platform combining wearable data with clinician-led coaching for early detection of chronic disease.",
    current: [{ company: "Vitalis Health", role: "Co-founder & CEO" }],
    past: [
      { company: "Grab", role: "Senior product manager" },
      { company: "Sea Group", role: "Product lead" },
      { company: "McKinsey & Company", role: "Business analyst" },
    ],
    education: [{ company: "Stanford University", role: "MBA" }],
    reasoning: {
      positives: [
        "Repeat founder (Vitalis Health)",
        "Strong operator background at Grab",
        "High media momentum",
      ],
      negatives: ["Stage/fundraise status unclear"],
    },
  },
];
