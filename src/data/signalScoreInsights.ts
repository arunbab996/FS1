/**
 * Standalone mock data for the "Signal Quality" section — average signal score by market and
 * by analyst. Deliberately kept separate from reportsData.ts so this new, still-settling section
 * can't touch anything the rest of Reports already depends on.
 */

export interface CountryAvgScore {
  country: string;
  avgScore: number;
}

export const countryAvgScoreStats: CountryAvgScore[] = [
  { country: "Australia", avgScore: 8.1 },
  { country: "Singapore", avgScore: 7.9 },
  { country: "United States", avgScore: 7.4 },
  { country: "India", avgScore: 6.8 },
  { country: "Malaysia", avgScore: 6.9 },
  { country: "South Korea", avgScore: 6.5 },
  { country: "China", avgScore: 6.2 },
  { country: "Indonesia", avgScore: 6.1 },
  { country: "Vietnam", avgScore: 5.8 },
  { country: "Philippines", avgScore: 5.4 },
  { country: "Thailand", avgScore: 5.2 },
];

export interface InvestorAvgScore {
  user: string;
  avgScore: number;
}

// Deliberately gives Alex Rankin (the current outreach-volume leader on the Leaderboard) a
// below-median score, and Roy Ong (lower volume) the highest — a built-in example of exactly
// the "lots of calls, lower quality" pattern this section exists to surface.
export const investorAvgScoreStats: InvestorAvgScore[] = [
  { user: "Alex Rankin", avgScore: 5.6 },
  { user: "Joshua Lim", avgScore: 7.8 },
  { user: "Raynard Lao", avgScore: 8.4 },
  { user: "Hongfei Xia", avgScore: 7.1 },
  { user: "Roy Ong", avgScore: 8.6 },
];
