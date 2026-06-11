/*
 * Pacific Modernism — VA Loan Schofield Barracks Hub Page
 * Army, 25th Infantry Division, high PCS volume
 */
import VALoanBasePage, { type BasePageData } from "./VALoanBase";

const DATA: BasePageData = {
  slug: "va-loan-schofield-barracks",
  installationName: "Schofield Barracks",
  branch: "U.S. Army",
  unit: "25th Infantry Division",
  heroSubtitle: "Buy a Home on Oahu with $0 Down",
  openingParagraph: "You just got orders to Schofield Barracks and you're doing the math on Hawaii housing. Renting feels like the safe play — but if you have VA eligibility and you're here for a standard 3-year tour, I'd push you to run the numbers on buying first. The 25th ID has one of the highest PCS volumes on Oahu, which means there's always inventory turning over in the neighborhoods around post. Here's everything you need to know about using your VA loan at Schofield.",
  neighborhoods: [
    {
      name: "Mililani",
      commute: "10–12 min",
      priceRange: "$400K–$800K townhome / $750K–$1.8M SFH",
      whyFamilies: "Top-rated schools (Mililani High, Mililani Middle), planned community feel, parks and pools everywhere. The closest thing to a mainland suburb you'll find on Oahu. Huge military community — your neighbors get it.",
      vaNote: "Strong SFH inventory in VA price range. Townhomes in Mililani Mauka are VA-eligible and popular with E-5/E-6 families. Low appraisal risk — lots of recent comps.",
    },
    {
      name: "Wahiawa",
      commute: "5–10 min",
      priceRange: "$600K–$900K SFH",
      whyFamilies: "Closest town to the gate. Older homes with larger lots, more affordable than Mililani. Tight-knit community with a local feel — less of a military bubble. Most affordable option this close to post.",
      vaNote: "Best value near Schofield. Some homes are older (1960s–70s) so VA appraisers may flag deferred maintenance — roof, termite, water heater. Budget for a pre-inspection. Leasehold properties exist here — avoid them with VA.",
    },
    {
      name: "Royal Kunia",
      commute: "~15 min",
      priceRange: "$750K–$1.1M SFH",
      whyFamilies: "Newer construction (2000s+), military-friendly community about 15 minutes from the gate. Quiet streets, mountain views, gated sections. Very popular with senior NCOs and officers who want newer construction without sacrificing too much commute.",
      vaNote: "Limited inventory — homes sell fast here because of proximity to the gate. When one hits the market, move quickly. All fee simple, no condo issues. VA appraisals typically clean due to newer construction.",
    },
    {
      name: "Waikele / Waipahu",
      commute: "15–20 min",
      priceRange: "$400K–$800K condo/townhome / $750K–$1.4M SFH",
      whyFamilies: "Waikele is a newer planned community with good schools and easy H-2 access. Waipahu has more affordable options and is close to Costco, Target, and the Waikele outlets. Good for families who want convenience without Mililani prices.",
      vaNote: "Waikele townhomes are mostly VA-approved. Waipahu condos — check the VA list first. Some older walk-ups have HOA issues that block VA approval. I maintain a searchable database of all approved projects.",
    },
    {
      name: "Kapolei",
      commute: "20–30 min",
      priceRange: "$400K–$800K townhome / $750K–$1.2M SFH",
      whyFamilies: "Newest construction on Oahu — modern floor plans, energy-efficient, community pools. Best shopping and restaurants on the west side. Growing fast with new schools and infrastructure.",
      vaNote: "New construction means fewer VA appraisal issues. HOA fees for single-family homes run $100–$200/mo; condos and townhomes are typically $400–$500/mo. Longer commute to Schofield but H-1/H-2 interchange is manageable outside rush hour.",
    },
  ],
  commuteNote: "Real talk on commutes: Wahiawa is closest to the gate at 5–10 minutes. Mililani is the sweet spot for schools and community at about 10–12 minutes. Royal Kunia is about 15 minutes but offers newer construction. Kapolei is worth the drive if you want the newest homes and don't mind 25–30 minutes each way. Wahiawa is most affordable but the town itself is rougher around the edges — drive it before you commit.",
  faqs: [
    {
      q: "Can I use my VA loan for a 3-year tour at Schofield?",
      a: "Yes. VA requires you to occupy the home as your primary residence for 12 months — your intent must be to live there at the time of purchase. If you receive military orders before 12 months, that satisfies the occupancy requirement. After occupancy is met, you can rent it when you PCS out. Many 25th ID families keep their Oahu home as a rental and use remaining entitlement at their next duty station.",
    },
    {
      q: "Is there a VA loan limit for Oahu in 2026?",
      a: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit for Honolulu County only matters if you have reduced entitlement from a prior VA loan that hasn't been restored. Most first-time VA buyers have full entitlement and face no cap on purchase price.",
    },
    {
      q: "Should I buy a house or a condo near Schofield?",
      a: "Depends on your rank and family size. E-5 and below often find condos/townhomes more realistic in the $400K–$800K range. E-6+ can stretch into single-family homes in Wahiawa or Mililani. Condos must be VA-approved — check my VA Condo Lookup tool before falling in love with a unit. Single-family homes have no approval requirement.",
    },
    {
      q: "How long does a VA loan take to close in Hawaii?",
      a: "Typically 30–45 days from accepted offer to keys. VA appraisals on Oahu currently take 7–10 business days. I order the appraisal after clearing the home inspection period — this protects you from paying for an appraisal on a home you might walk away from due to inspection issues. Get your inspection done early in the contract to keep the timeline tight.",
    },
    {
      q: "Can I buy a home before arriving on island?",
      a: "Yes — I work with PCS'ing families remotely all the time. You can get pre-approved, tour homes virtually with your agent, and even go under contract before boots hit the ground. VA allows you to close up to 60 days before reporting. The key is starting your pre-approval early — ideally as soon as you have orders in hand. I'll coordinate with your agent on timing so you're not stuck in temporary housing longer than necessary.",
    },
  ],
  seoTitle: "VA Loan Guide for Schofield Barracks — Buy a Home on Oahu",
  seoDescription: "PCS'ing to Schofield Barracks? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Mililani, Wahiawa, Royal Kunia), and $0-down purchase options for 25th Infantry Division families.",
  seoKeywords: "VA loan Schofield Barracks, buying a home near Schofield Barracks, VA loan Mililani, VA loan Wahiawa, VA loan Royal Kunia, 25th Infantry Division home loan, military home buying Oahu",
  otherBases: [
    { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam" },
    { name: "Kaneohe MCBH", href: "/va-loan-kaneohe-mcbh" },
    { name: "Fort Shafter", href: "/va-loan-fort-shafter" },
    { name: "Tripler AMC", href: "/va-loan-tripler" },
  ],
};

export default function VALoanSchofield() {
  return <VALoanBasePage data={DATA} />;
}
