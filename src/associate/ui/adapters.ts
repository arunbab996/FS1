import type { Signal, SignalTag } from "../../types";
import { personPhotoUrl } from "../../utils/avatars";
import type { Person, SignalType } from "../types";

/** The same tag styling (colour + icon) as signal cards elsewhere in FirstSignal. */
export const signalTags: Record<SignalType, SignalTag> = {
  "Investor Interest": { label: "Investor Interest", category: "investor-interest" },
  Stealth: { label: "Stealth", category: "stealth" },
  "New Company": { label: "New Company", category: "momentum" },
  Exploring: { label: "Exploring", category: "background" },
};

/** Maps an Associate profile onto the app's Signal shape, so the existing profile panel can show it. */
export function personToSignal(p: Person): Signal {
  return {
    id: `assoc-${p.id}`,
    dateGroup: "Today · Jul 27",
    status: "New Signal",
    tags: [signalTags[p.signal.type]],
    avatarInitials: p.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2),
    photoUrl: personPhotoUrl(p.name),
    // The panel shows the headline as the subtitle under the name.
    headline: p.headline,
    personName: p.name,
    contextLine: `${p.city}, ${p.country} · ${p.yearsExperience} yrs experience`,
    aiSummary: [p.signal.detail, p.building ? `Building: ${p.building}.` : ""].filter(Boolean).join(" "),
    noSourceInfo: true,
    current: p.roles.filter((r) => r.endYear === null).map((r) => ({ company: r.company, role: r.title })),
    past: p.roles.filter((r) => r.endYear !== null).map((r) => ({ company: r.company, role: `${r.title} · ${r.startYear}–${r.endYear}` })),
    education: [{ company: p.education, role: "" }],
    reasoning: { positives: [], negatives: [] },
  };
}

