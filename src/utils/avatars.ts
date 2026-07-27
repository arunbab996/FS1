/** Deterministic placeholder logo for a company/school name, for mockup purposes. */
export function companyLogoUrl(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name,
  )}&backgroundType=gradientLinear&fontWeight=600`;
}

/** Deterministic placeholder headshot photo, for mockup purposes. */
export function personPhotoUrl(seed: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
}
