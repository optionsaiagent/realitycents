/*
 * Pacific Modernism — VA Loan Fort Shafter Hub Page
 * Army, USARPAC headquarters
 */
import VALoanBasePage, { type BasePageData } from "./VALoanBase";

const DATA: BasePageData = {
  slug: "va-loan-fort-shafter",
  installationName: "Fort Shafter",
  branch: "U.S. Army",
  unit: "USARPAC Headquarters",
  heroSubtitle: "Buy a Home on Oahu with $0 Down",
  openingParagraph: "You just got orders to Fort Shafter — USARPAC headquarters — and you're looking at the urban core of Honolulu for the first time. Fort Shafter is unique among Oahu installations: it's right in the city, which means you have access to neighborhoods that feel nothing like a typical military town. The trade-off is higher prices closer to base, but the surrounding areas offer everything from affordable condos to family homes with mountain views. Here's how to make your VA loan work at Shafter.",
  neighborhoods: [
    {
      name: "Salt Lake / Moanalua",
      commute: "5–8 min",
      priceRange: "$350K–$800K condo / $750K–$1.4M SFH",
      whyFamilies: "Closest residential area to Fort Shafter's gate. Salt Lake has affordable condos perfect for junior officers or single soldiers building equity. Moanalua has nicer single-family homes with mountain views. Moanalua Gardens is a beautiful park. Easy access to H-1 in both directions.",
      vaNote: "Salt Lake condos are heavily military — many are VA-approved but some older buildings have reserve issues. Always verify on my VA Condo Lookup before offering. Moanalua SFH homes are clean for VA. The Aloha Stadium redevelopment will boost this area's value significantly.",
    },
    {
      name: "Aliamanu / Foster Village",
      commute: "5–10 min",
      priceRange: "$450K–$750K townhome / $700K–$1.1M SFH",
      whyFamilies: "Military-heavy neighborhoods adjacent to both Fort Shafter and Tripler. Aliamanu Military Reservation (AMR) housing is nearby, so the community understands military life. Foster Village has affordable townhomes. Aliamanu has single-family homes with views. Red Hill Elementary is well-regarded.",
      vaNote: "Foster Village townhomes are mostly VA-approved and popular with E-5/E-6 families. Aliamanu SFH homes are older (1960s–70s) — expect VA appraisers to check roof and termite. Good value for the proximity to base.",
    },
    {
      name: "Kalihi Valley",
      commute: "5–10 min",
      priceRange: "$650K–$1.1M SFH",
      whyFamilies: "Affordable single-family homes with larger lots, close to base. Upper Kalihi Valley is quiet with mountain views. Lower Kalihi is more urban. Diverse community with great local food. Kamehameha Schools campus nearby.",
      vaNote: "Some of the most affordable SFH options near Fort Shafter. Older homes — VA appraisers will check the basics (roof, termite, water heater, electrical). Steep driveways in upper Kalihi can sometimes be flagged. Worth the inspection for the price point.",
    },
    {
      name: "Aiea",
      commute: "10–15 min",
      priceRange: "$350K–$700K condo / $700K–$1.2M SFH",
      whyFamilies: "Pearlridge Mall, great restaurants, mountain views from upper Aiea. Aiea Heights has stunning panoramic views. Good schools. Close to both Fort Shafter and Pearl Harbor — great if your spouse works at JBPHH. Easy H-1 access.",
      vaNote: "Upper Aiea homes can have steep driveways and access issues — VA appraisers sometimes flag these. Lower Aiea condos near Pearlridge are hit-or-miss on VA approval. Verify before offering. Aiea Heights SFH homes are generally clean for VA.",
    },
    {
      name: "Nuuanu / Pacific Heights",
      commute: "8–12 min",
      priceRange: "$900K–$1.5M SFH",
      whyFamilies: "Upscale residential area with lush vegetation, cooler temperatures, and historic homes. Popular with senior officers (O-4+) who want a prestigious address close to downtown Honolulu. Beautiful views, quiet streets, excellent schools nearby.",
      vaNote: "Higher price point but with full VA entitlement there's no loan limit for $0 down. Older homes with character — some may need updates that VA appraisers flag. Worth it for the lifestyle if your budget supports it. Strong appreciation history.",
    },
  ],
  commuteNote: "Fort Shafter's urban location is a double-edged sword: you're close to everything Honolulu offers, but you're also in city traffic. Salt Lake, Aliamanu, and Foster Village give you the shortest commutes (under 10 min). Aiea adds 5–10 minutes but gets you more house for the money. Nuuanu is the premium play for senior officers. Avoid living in Waikiki and commuting — it looks close on a map but H-1 westbound in the morning is brutal.",
  faqs: [
    {
      q: "I'm stationed at Fort Shafter but might move to Camp Smith — should that affect where I buy?",
      a: "Camp Smith is on Moanalua Ridge, about 10 minutes from Fort Shafter. If there's any chance you'll rotate to Camp Smith, buy in Salt Lake, Moanalua, or Aiea — you'll be close to both. VA requires you to occupy the home for 12 months as your primary residence. If you receive orders to a different installation before 12 months, that satisfies the occupancy requirement.",
    },
    {
      q: "Is there a VA loan limit for Oahu in 2026?",
      a: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit for Honolulu County only matters if you have reduced entitlement from a prior VA loan that hasn't been restored. This covers even the nicer homes in Nuuanu and Pacific Heights.",
    },
    {
      q: "Are Salt Lake condos a good investment?",
      a: "They can be — but you need to be selective. Salt Lake condos range from $350K–$800K and rent well to the next wave of military buyers. The key is finding a VA-approved building with healthy reserves and low HOA fees. Some older buildings have deferred maintenance that makes them poor investments. I'll help you identify the good ones — check my VA Condo Lookup tool for the full approved list.",
    },
    {
      q: "When does Jay order the VA appraisal?",
      a: "I order VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. Near Fort Shafter, where older homes are common in Aliamanu and Kalihi, this is especially important — get your inspection done early in the contract to keep the timeline on track.",
    },
    {
      q: "How does Honolulu COLA affect my buying power?",
      a: "Honolulu COLA adds approximately 8.9% to your base pay — it's taxable but it's real money that supplements your take-home beyond what BAH covers. While I can't use COLA directly for qualifying (it's not guaranteed long-term), it gives you a larger monthly cushion for utilities, maintenance, and the general cost of living in Hawaii. Factor it into your comfort level when deciding how much house to buy.",
    },
  ],
  seoTitle: "VA Loan Guide for Fort Shafter — Buy a Home on Oahu",
  seoDescription: "PCS'ing to Fort Shafter? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Salt Lake, Aliamanu, Aiea, Nuuanu), and $0-down options for USARPAC Army personnel on Oahu.",
  seoKeywords: "VA loan Fort Shafter, buying a home near Fort Shafter, VA loan Salt Lake, VA loan Aliamanu, USARPAC housing, Army home loan Honolulu",
  otherBases: [
    { name: "Schofield Barracks", href: "/va-loan-schofield-barracks" },
    { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam" },
    { name: "Kaneohe MCBH", href: "/va-loan-kaneohe-mcbh" },
    { name: "Tripler AMC", href: "/va-loan-tripler" },
  ],
};

export default function VALoanFortShafter() {
  return <VALoanBasePage data={DATA} />;
}
