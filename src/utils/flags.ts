const countryFlags: Record<string, string> = {
  Australia: "🇦🇺",
  India: "🇮🇳",
  Singapore: "🇸🇬",
  "United States": "🇺🇸",
  Philippines: "🇵🇭",
  Thailand: "🇹🇭",
  Indonesia: "🇮🇩",
  Vietnam: "🇻🇳",
  Malaysia: "🇲🇾",
  China: "🇨🇳",
  "South Korea": "🇰🇷",
};

export function countryFlag(countryName: string): string | undefined {
  return countryFlags[countryName];
}

/** ISO 3166-1 alpha-2 shortform, for compact "View by: Country" tabs. */
const countryShortNames: Record<string, string> = {
  Australia: "AU",
  India: "IN",
  Singapore: "SG",
  "United States": "US",
  Philippines: "PH",
  Thailand: "TH",
  Indonesia: "ID",
  Vietnam: "VN",
  Malaysia: "MY",
  China: "CN",
  "South Korea": "KR",
};

export function countryShortName(countryName: string): string {
  return countryShortNames[countryName] ?? countryName;
}
