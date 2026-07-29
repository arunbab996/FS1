const countryFlags: Record<string, string> = {
  Australia: "🇦🇺",
  India: "🇮🇳",
  Singapore: "🇸🇬",
  "United States": "🇺🇸",
};

export function countryFlag(countryName: string): string | undefined {
  return countryFlags[countryName];
}
