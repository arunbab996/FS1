export const investorStages = [
  "Prospecting",
  "Pre Contacted",
  "Contacted",
  "Introductory",
  "Initial Due Diligence",
  "Active Due Diligence",
  "Closing",
  "Completion",
  "Auto Passed",
  "Auto Lost",
  "Passed",
  "Lost",
  "Auto Pause",
  "Pause",
] as const;

export type InvestorStage = (typeof investorStages)[number];
