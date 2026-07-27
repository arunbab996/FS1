export const viewByOptions = ["Saved filter", "Country", "Geo", "Score"] as const;

export type ViewByOption = (typeof viewByOptions)[number];

export const tabsByViewOption: Record<ViewByOption, string[]> = {
  "Saved filter": ["All", "View all"],
  Country: ["All", "SG", "PH", "TH", "ID", "VN", "AU", "MY", "IN", "CN"],
  Geo: ["All", "Asia", "Oceania", "Europe", "United States"],
  Score: ["All", "≥ 8", "> 5 & < 8", "≤ 5"],
};
