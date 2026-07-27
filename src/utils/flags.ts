const countryFlags: Record<string, string> = {
  Australia: "🇦🇺",
  India: "🇮🇳",
  Singapore: "🇸🇬",
};

export function countryFlag(countryName: string): string | undefined {
  return countryFlags[countryName];
}
