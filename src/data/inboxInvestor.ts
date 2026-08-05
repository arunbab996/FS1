import { emptyFilters, type SignalFilters } from "../utils/signalFilters";

/** An external investor's shared sourcing preferences, used to curate their personalized Inbox. */
export interface InvestorProfile {
  name: string;
  firm: string;
  avatarSeed: string;
  thesisSummary: string;
  filters: SignalFilters;
}

/** Single hardcoded demo profile for now — later this'd be one of many investors we curate for. */
export const demoInboxInvestor: InvestorProfile = {
  name: "Kevin Tan",
  firm: "Meridian Capital",
  avatarSeed: "kevin-tan-meridian",
  thesisSummary: "Early-stage technical founders across Southeast Asia and India",
  filters: {
    ...emptyFilters,
    countries: [
      "Singapore",
      "India",
      "Indonesia",
      "Vietnam",
      "Philippines",
      "Thailand",
      "Malaysia",
    ],
  },
};
