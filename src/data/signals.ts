import type { Signal } from "../types";
import { achintyaProfile } from "./achintyaProfile";
import { anshuProfile } from "./anshuProfile";
import { darshanProfile } from "./darshanProfile";
import { loongProfile } from "./loongProfile";
import { paulynProfile } from "./paulynProfile";
import { skyProfile } from "./skyProfile";
import { zhipengProfile } from "./zhipengProfile";

export const signals: Signal[] = [
  {
    id: "sig-darshan",
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    photoUrl: "/avatars/darshan.jpg",
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
    photoUrl: "/avatars/skywee.jpg",
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
    photoUrl: "/avatars/achintya.jpg",
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
    photoUrl: "/avatars/zhipeng.jpg",
    tags: [
      { label: "New Company", category: "momentum" },
      { label: "Software", category: "industry" },
      { label: "Australia", category: "geography" },
    ],
    score: 6.6,
    avatarInitials: "ZH",
    headline:
      "**Zhipeng (Zippo) He** is actively building an open-source developer tool on GitHub",
    contextLine: "Brisbane, Queensland, Australia · 3.75 yrs experience",
    aiSummary:
      "A PhD candidate at QUT building robust predictive systems for tabular data, now actively building an open-source tool on GitHub alongside a self-employed full-stack AI engineering practice.",
    sourcedVia: "Open Source",
    linkedinUrl: "https://www.linkedin.com/in/zhipenghe",
    profile: zhipengProfile,
    current: [
      { company: "QUT", role: "Postdoctoral Research Fellow" },
      { company: "QUT", role: "PHD Candidate" },
      { company: "Self Employed", role: "Full-Stack AI Engineer" },
    ],
    past: [
      { company: "QUT", role: "Research Associate" },
      { company: "QUT", role: "Senior Research Assistant" },
      { company: "Suncorp Group", role: "Capstone Analyst" },
    ],
    education: [
      { company: "QUT", role: "Doctor of Philosophy (PhD)" },
      { company: "QUT", role: "Bachelor of Information Technology (Honours)" },
      { company: "Jinling Institute of Technology", role: "Bachelor of Engineering, Computer Software Engineering" },
    ],
    reasoning: {
      positives: [
        "Active open-source builder on GitHub",
        "PhD candidate in AI/predictive systems at QUT",
        "Full-stack AI engineering experience (LLM integration, agent systems)",
      ],
      negatives: ["Early career, no prior founding experience"],
    },
  },
  {
    id: "sig-paulyn",
    dateGroup: "Today · Jul 27",
    status: "Active Duplicate Signal",
    photoUrl: "/avatars/paulyn.jpg",
    tags: [
      { label: "Exploring", category: "background" },
      { label: "Australia", category: "geography" },
    ],
    score: 6.1,
    avatarInitials: "PV",
    headline:
      "**Paulyn V.** left **Qantas** and might be exploring new opportunities",
    contextLine: "Sydney, Australia · 12.5 yrs experience",
    aiSummary:
      "A Quality Engineer with 12+ years across airline and fintech (Qantas, Prospa, Philippine Airlines) who recently left Qantas and appears to be exploring new opportunities — no public venture yet.",
    sourcedVia: "Evertrace",
    linkedinUrl: "https://www.linkedin.com/in/paulynvillafuerte",
    profile: paulynProfile,
    current: [{ company: "—", role: "Exploring" }],
    past: [
      { company: "Qantas", role: "Quality Engineer" },
      { company: "Prospa.", role: "Software Development Engineer In Test" },
      { company: "Suncorp", role: "Software Test Engineer" },
    ],
    education: [
      { company: "University of Technology, Sydney", role: "Master's Degree, Information Technology" },
      { company: "De La Salle University", role: "Bachelor's Degree, Philosophy" },
    ],
    reasoning: {
      positives: [
        "Recent departure from Qantas",
        "12.5 years of QA/test engineering experience",
        "Cross-domain experience (airline + fintech)",
      ],
      negatives: ["Founder/venture intent unconfirmed"],
    },
  },
  {
    id: "sig-anshu",
    dateGroup: "Yesterday · Jul 26",
    status: "New Signal",
    useGenericAvatar: true,
    tags: [
      { label: "Stealth Signal", category: "stealth" },
      { label: "Big tech experience", category: "background" },
      { label: "Software", category: "industry" },
      { label: "United States", category: "geography" },
    ],
    score: 8.1,
    avatarInitials: "AB",
    headline: "**Anshu Bansal** entered **Stealth** and is working on something new",
    personName: "Anshu Bansal",
    contextLine: "San Francisco, California, United States · 19.6 yrs experience",
    aiSummary:
      "Anshu Bansal has quietly left public view and entered stealth — a 19+ year AI/ML leader (ex-Amazon, ex-Microsoft, CloudDefense.AI co-founder) now working on something new, flagged as a hot strategic-intelligence signal.",
    sourcedVia: "Evertrace",
    linkedinUrl: "https://www.linkedin.com/in/anshubansal",
    profile: anshuProfile,
    current: [
      { company: "AI R&D", role: "AI, LLM Inference & Edge AI R&D" },
      { company: "Forbes Technology Council", role: "Member" },
      { company: "Cloud Defense", role: "Co-Founder at CloudDefense.AI" },
    ],
    past: [
      { company: "Cloud Defense", role: "Co-Founder at CloudDefense.AI (Acquired by Accuknox Inc)" },
      { company: "TiE", role: "Angel Investor/Mentor/Volunteer" },
      { company: "Amazon", role: "Sr. Engineering Manager - Mobile Platforms and Services" },
    ],
    education: [
      { company: "Rajiv Gandhi Prodoyogiki Vishwavidyalaya, Bhopal", role: "Bachelor of Technology (B.Tech.)" },
      { company: "MIT Sloan School of Management", role: "Executive MBA" },
      { company: "Otto-von-Guericke University Magdeburg", role: "MS" },
    ],
    reasoning: {
      positives: [
        "Entered stealth — actively building something new",
        "19+ years AI/ML & engineering leadership (Amazon, Microsoft, VMware)",
        "Repeat founder (CloudDefense.AI, acquired by AccuKnox)",
        "Deep LLM inference/edge AI expertise",
      ],
      negatives: ["Stealth-mode, no public product info yet"],
    },
  },
  {
    id: "sig-loong",
    dateGroup: "Yesterday · Jul 26",
    status: "New Signal",
    photoUrl: "/avatars/loong.jpg",
    linkedinUrl: "https://www.linkedin.com/in/bzlwang/",
    tags: [
      { label: "New Company", category: "momentum" },
      { label: "Repeat Founder", category: "momentum" },
      { label: "FinTech", category: "industry" },
      { label: "Singapore", category: "geography" },
    ],
    score: 6.3,
    avatarInitials: "LW",
    headline:
      "**Loong Wang** left **QDX** and started a new company **Metal** as **'CEO and Founder'**",
    personName: "Loong Wang",
    contextLine: "Singapore · 12 yrs experience",
    aiSummary:
      "A repeat founder (Ren, Automera, QDX) rethinking drug design — now building Metal as CEO & Founder, backed by a track record of prior VC-backed companies and a prior IPO.",
    sourcedVia: "Evertrace",
    profile: loongProfile,
    current: [
      { company: "Metal", role: "CEO and Founder" },
      { company: "Automera", role: "Board Member & Founder" },
    ],
    past: [
      { company: "QDX", role: "CEO and Founder" },
      { company: "Ren", role: "Chief Technology Officer" },
      { company: "Neucode", role: "Software Developer" },
    ],
    education: [
      { company: "The Australian National University", role: "Advanced Research and Development (Computer Science) (Honours)" },
    ],
    reasoning: {
      positives: [
        "Repeat founder (Ren, Automera, QDX, now Metal)",
        "Prior VC-backed founder with a prior IPO",
        "12 years distributed systems & engineering leadership",
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
