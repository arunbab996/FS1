const favicon = (domain: string) => `https://www.google.com/s2/favicons?sz=256&domain=${domain}`;

/** Maps demo company/school names to a recognizable real brand's favicon, so screenshots read like
 * real profiles instead of a wall of generated initials. Real orgs point at their own domain;
 * the invented startups borrow a well-known brand for flavour. The names in the data are unchanged. */
const logoOverrides: Record<string, string> = {
  // Invented companies — borrow a recognizable brand
  Metal: favicon("meta.com"),
  QDX: favicon("google.com"),
  Ren: favicon("amazon.com"),
  Neucode: favicon("netflix.com"),
  FinishKit: favicon("vercel.com"),
  "Reo.Dev": favicon("stripe.com"),
  Phyllo: favicon("plaid.com"),
  Automera: favicon("databricks.com"),
  "Nexawork AI": favicon("notion.so"),
  "Cloud Defense": favicon("snyk.io"),
  "Sky Ventures": favicon("a16z.com"),
  "AI R&D": favicon("openai.com"),
  FindWork: favicon("indeed.com"),
  Metahunter: favicon("upwork.com"),
  "Vitalis Health": favicon("teladochealth.com"),

  // Real companies — their own logo
  Amazon: favicon("amazon.com"),
  Microsoft: favicon("microsoft.com"),
  Facebook: favicon("facebook.com"),
  Instagram: favicon("instagram.com"),
  YouTube: favicon("youtube.com"),
  TikTok: favicon("tiktok.com"),
  Binance: favicon("binance.com"),
  Forbes: favicon("forbes.com"),
  "Forbes Technology Council": favicon("forbes.com"),
  VMware: favicon("vmware.com"),
  "Expedia, Inc.": favicon("expedia.com"),
  "H&R Block": favicon("hrblock.com"),
  "Britannia Industries Limited": favicon("britannia.co.in"),
  "McKinsey & Company": favicon("mckinsey.com"),
  Grab: favicon("grab.com"),
  Flipkart: favicon("flipkart.com"),
  Razorpay: favicon("razorpay.com"),
  "Sea Group": favicon("sea.com"),
  Qantas: favicon("qantas.com"),
  ASX: favicon("asx.com.au"),
  Suncorp: favicon("suncorp.com.au"),
  "Suncorp Group": favicon("suncorp.com.au"),
  "Prospa.": favicon("prospa.com"),
  "Philippine Airlines": favicon("philippineairlines.com"),
  TiE: favicon("tie.org"),

  // Universities
  "Stanford University": favicon("stanford.edu"),
  "The Australian National University": favicon("stanford.edu"),
  "MIT Sloan School of Management": favicon("mit.edu"),
  "Indian Institute of Technology, Delhi": favicon("iitd.ac.in"),
  "IIT Delhi": favicon("iitd.ac.in"),
  "IIT Bombay": favicon("iitb.ac.in"),
  "Indian School of Business": favicon("isb.edu"),
  "National University of Singapore": favicon("nus.edu.sg"),
  "University of Technology, Sydney": favicon("uts.edu.au"),
  "University of Technology Sydney": favicon("uts.edu.au"),
  UNSW: favicon("unsw.edu.au"),
  "De La Salle University": favicon("dlsu.edu.ph"),
  QUT: favicon("qut.edu.au"),
  "QUT (Queensland University of Technology)": favicon("qut.edu.au"),
  "Republic Polytechnic": favicon("rp.edu.sg"),
  "Otto-von-Guericke University Magdeburg": favicon("ovgu.de"),
  "Rajiv Gandhi Prodoyogiki Vishwavidyalaya, Bhopal": favicon("rgpv.ac.in"),
  "Jinling Institute of Technology": favicon("jit.edu.cn"),
};

/** Deterministic placeholder logo for a company/school name, for mockup purposes. */
export function companyLogoUrl(name: string): string {
  return (
    logoOverrides[name] ??
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      name,
    )}&backgroundType=gradientLinear&fontWeight=600`
  );
}

/** Deterministic placeholder headshot photo, for mockup purposes. */
export function personPhotoUrl(seed: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
}
