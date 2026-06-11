/*
 * Pacific Modernism — VA Loan Tripler AMC Hub Page
 * Army Medical, Tripler Army Medical Center
 */
import VALoanBasePage, { type BasePageData } from "./VALoanBase";

const DATA: BasePageData = {
  slug: "va-loan-tripler",
  installationName: "Tripler Army Medical Center",
  branch: "U.S. Army Medical",
  unit: "Tripler Army Medical Center",
  heroSubtitle: "Buy a Home on Oahu with $0 Down",
  openingParagraph: "You just got orders to Tripler Army Medical Center — the pink palace on Moanalua Ridge — and you're figuring out where to live on Oahu. Tripler is unique: it draws medical professionals from all branches, many of whom are higher-ranking officers or senior NCOs with families. The location on Moanalua Ridge gives you quick access to both the H-1 corridor and the neighborhoods surrounding Fort Shafter and JBPHH. Here's how to use your VA loan to buy near Tripler.",
  neighborhoods: [
    {
      name: "Moanalua / Salt Lake",
      commute: "3–8 min",
      priceRange: "$350K–$800K condo / $750K–$1.4M SFH",
      whyFamilies: "Literally at the base of Moanalua Ridge where Tripler sits. Salt Lake has affordable condos for residents and junior staff. Moanalua has single-family homes with mountain views and the beautiful Moanalua Gardens park. Shortest possible commute — some Tripler staff walk to work.",
      vaNote: "Salt Lake condos: many are VA-approved but verify on my VA Condo Lookup. Some older buildings have reserve issues. Moanalua SFH homes are generally clean for VA. The Aloha Stadium redevelopment will significantly boost property values in this area over the next 5 years.",
    },
    {
      name: "Aliamanu / Red Hill",
      commute: "5–10 min",
      priceRange: "$450K–$750K townhome / $700K–$1.1M SFH",
      whyFamilies: "Military-heavy neighborhoods adjacent to Tripler. Aliamanu Military Reservation (AMR) is right here. Red Hill has affordable single-family homes. Foster Village has VA-friendly townhomes. Red Hill Elementary is well-regarded. Strong military community — your neighbors understand the lifestyle.",
      vaNote: "Foster Village townhomes are mostly VA-approved and very popular with military families. Red Hill and Aliamanu SFH homes are older (1960s–70s) — VA appraisers check roof, termite, and electrical. Good value for the proximity. Easy resale to the next military buyer.",
    },
    {
      name: "Aiea Heights",
      commute: "10–12 min",
      priceRange: "$700K–$1.2M SFH",
      whyFamilies: "Stunning panoramic views of Pearl Harbor and the ocean. Quiet residential streets, mature landscaping, cooler temperatures at elevation. Popular with Tripler physicians and senior officers who want space and views. Pearlridge Mall nearby for shopping.",
      vaNote: "Some homes have steep driveways that VA appraisers occasionally flag for access concerns. Otherwise clean for VA. Homes here hold value well — strong appreciation history. Larger lots mean more privacy.",
    },
    {
      name: "Pearl City",
      commute: "12–18 min",
      priceRange: "$350K–$800K condo / $750K–$1.5M SFH",
      whyFamilies: "Established neighborhood with a local feel. Larger lots, mature trees, good schools. Pearl City Shopping Center and Pearl Highlands for errands. More affordable than Aiea Heights with similar commute time. Easy H-1 access to both Tripler and JBPHH.",
      vaNote: "Mix of older and newer homes. Older homes (1960s–70s) may need termite clearance and roof certification for VA. Pearl City condos — check my VA-approved list first. Newer townhome communities are generally VA-friendly.",
    },
    {
      name: "Kalihi Valley / Pacific Heights",
      commute: "8–15 min",
      priceRange: "$650K–$1.1M SFH (Kalihi) / $900K–$1.4M (Pacific Heights)",
      whyFamilies: "Kalihi Valley offers affordable SFH options close to Tripler. Pacific Heights is the premium play — lush, quiet, prestigious. Both are close to downtown Honolulu for dining and culture. Good for medical professionals who want urban access.",
      vaNote: "Kalihi Valley: older homes, check the basics on VA inspection. Pacific Heights: higher price point but with full entitlement there's no loan limit for $0 down. Older homes with character — some may need updates. Both areas are close to Tripler via Likelike Highway or surface streets.",
    },
  ],
  commuteNote: "Tripler's hilltop location means you're above the traffic — literally. Coming from Moanalua, Salt Lake, or Aliamanu, you're driving uphill to work and downhill to home, which is the opposite of the H-1 congestion pattern. Aiea Heights and Pearl City add 10–15 minutes but give you more house. The key advantage: Tripler staff rarely deal with the worst of Oahu's traffic because the base is accessed from above the highway.",
  faqs: [
    {
      q: "I'm a military physician — does my income affect VA loan eligibility?",
      a: "VA loans have no maximum income limit. Whether you're an E-5 medic or an O-6 surgeon, you qualify based on service, not income. Higher income actually helps — it increases your purchase power. VA requires you to occupy the home for 12 months as your primary residence. If you receive PCS orders before 12 months, that satisfies the requirement.",
    },
    {
      q: "Is there a VA loan limit for Oahu in 2026?",
      a: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit for Honolulu County only matters if you have reduced entitlement from a prior VA loan that hasn't been restored. For Tripler physicians buying in the $800K–$1.2M range, full entitlement means no cap and no down payment.",
    },
    {
      q: "My spouse also works at Tripler — can we both use our VA eligibility?",
      a: "If both spouses are veterans or active duty, you can combine entitlements on a single property. This is rare but powerful. More commonly, one spouse uses their VA loan for the primary residence while the other preserves their entitlement for a future investment property. I'll help you strategize based on your long-term plans.",
    },
    {
      q: "When does Jay order the VA appraisal?",
      a: "I order VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. Near Tripler, where many homes are older (Aliamanu, Kalihi, Red Hill), this is especially important — get your inspection done early in the contract so we can identify any issues before committing to the appraisal fee.",
    },
    {
      q: "I'm doing a residency at Tripler — is it worth buying for just 3–4 years?",
      a: "Often yes, especially at current rent levels. When you finish residency and PCS, you can rent the home out — Tripler always has incoming residents and medical staff who need housing. Oahu's rental market near military installations is extremely strong. Many of my physician clients cover their full mortgage payment with rent and build equity while stationed elsewhere. You can use remaining VA entitlement to buy at your next duty station.",
    },
  ],
  seoTitle: "VA Loan Guide for Tripler Army Medical Center — Buy a Home on Oahu",
  seoDescription: "PCS'ing to Tripler AMC? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Moanalua, Aliamanu, Aiea Heights, Pearl City), and $0-down options for Army medical personnel on Oahu.",
  seoKeywords: "VA loan Tripler, buying a home near Tripler AMC, VA loan Moanalua, VA loan Aiea, Tripler Army Medical Center housing, military doctor home loan Hawaii",
  otherBases: [
    { name: "Schofield Barracks", href: "/va-loan-schofield-barracks" },
    { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam" },
    { name: "Kaneohe MCBH", href: "/va-loan-kaneohe-mcbh" },
    { name: "Fort Shafter", href: "/va-loan-fort-shafter" },
  ],
};

export default function VALoanTripler() {
  return <VALoanBasePage data={DATA} />;
}
