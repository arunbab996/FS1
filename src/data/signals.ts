import type { Signal } from "../types";

export const signals: Signal[] = [
  {
    id: "sig-darshan",
    dateGroup: "Today · Jul 27",
    tags: [
      { label: "Repeat founder", category: "momentum" },
      { label: "Fintech", category: "industry" },
      { label: "Australia", category: "geography" },
    ],
    score: 7.7,
    avatarInitials: "DP",
    headline:
      "**Darshan P.**, founder of **FinishKit**, updated his profile and resurfaced in your tracked network",
    contextLine:
      "Via Raynard Lao's network · Featured 5x in 90 days · Sydney, Australia",
    current: [{ company: "FinishKit", role: "Founder" }],
    past: [
      { company: "ASX", role: "Quant data analyst" },
      { company: "Blackbird", role: "Analyst intern" },
    ],
    education: [{ company: "UNSW", role: "BSc Commerce" }],
    reasoning: {
      positives: [
        "Repeat founder (FinishKit)",
        "Quant background at ASX",
        "Close to tracked investor",
      ],
      negatives: ["No public traction yet"],
    },
  },
  {
    id: "sig-zippo",
    dateGroup: "Today · Jul 27",
    tags: [
      { label: "Open source", category: "momentum" },
      { label: "Software", category: "industry" },
      { label: "Australia", category: "geography" },
    ],
    score: 6.6,
    avatarInitials: "ZH",
    headline:
      "**Zhipeng (Zippo) H.** is actively building an open-source developer tool on GitHub",
    contextLine: "GitHub commit spike this week · Brisbane, Australia",
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
    tags: [
      { label: "New opportunity", category: "momentum" },
      { label: "Big tech experience", category: "background" },
      { label: "Australia", category: "geography" },
    ],
    score: 6.1,
    avatarInitials: "PV",
    headline:
      "**Paulyn V.** left **Qantas** and might be searching for a new opportunity",
    contextLine: "Headline changed 2 days ago · Sydney, Australia",
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
    tags: [
      { label: "New company", category: "momentum" },
      { label: "Serial founder", category: "momentum" },
      { label: "VC backed", category: "background" },
    ],
    score: 8.2,
    avatarInitials: "LW",
    headline:
      "**Loong W.** left **QDX** and started a new company **Metal** as CEO and Founder",
    contextLine: "Company registered this week · Singapore",
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
    tags: [
      { label: "New opportunity", category: "momentum" },
      { label: "India", category: "geography" },
    ],
    score: 5.6,
    avatarInitials: "AK",
    headline:
      "**Aayush K.** left his role and might be searching for a new opportunity",
    contextLine: "Via tracked network · Mumbai, India",
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
    tags: [
      { label: "Repeat founder", category: "momentum" },
      { label: "Health tech", category: "industry" },
      { label: "Singapore", category: "geography" },
    ],
    score: 7.1,
    avatarInitials: "ML",
    headline:
      "**Mei L.**, co-founder of **Vitalis Health**, was featured in TechCrunch's 'Ones to Watch' list",
    contextLine:
      "Via tracked network · Featured 3x in 30 days · Singapore",
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
