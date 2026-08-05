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
