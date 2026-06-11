/*
 * Pacific Modernism — VA Loan Kaneohe MCBH Hub Page
 * Marines, Marine Corps Base Hawaii
 */
import VALoanBasePage, { type BasePageData } from "./VALoanBase";

const DATA: BasePageData = {
  slug: "va-loan-kaneohe-mcbh",
  installationName: "Marine Corps Base Hawaii (Kaneohe Bay)",
  branch: "U.S. Marine Corps",
  unit: "Marine Corps Base Hawaii",
  heroSubtitle: "Buy a Home on Oahu with $0 Down",
  openingParagraph: "You just got orders to MCBH Kaneohe Bay and you're looking at the Windward side of Oahu for the first time. Good news: this is one of the most beautiful parts of the island — and the neighborhoods around base are some of the best for families. The trade-off is that Windward side homes tend to cost more per square foot than Leeward. But with VA's $0 down and Oahu's low property tax, the math often works better than you'd expect. Here's the breakdown.",
  neighborhoods: [
    {
      name: "Kailua",
      commute: "10–15 min",
      priceRange: "$500K–$1M condo/townhome / $1M–$2M SFH",
      whyFamilies: "Kailua Beach is consistently rated one of America's best beaches. Charming downtown with restaurants, boutiques, and farmers markets. Excellent schools (Kailua High, Le Jardin). Walkable, bikeable, and feels like a small beach town despite being 20 minutes from Honolulu.",
      vaNote: "Higher price point but strong appreciation history. With full VA entitlement there's no loan limit for $0 down, so even Kailua's premium homes are accessible. Older homes (1950s–70s) are common — budget for pre-inspection. Termite and roof are the most common VA appraisal flags here.",
    },
    {
      name: "Kaneohe",
      commute: "5–10 min",
      priceRange: "$400K–$800K condo/townhome / $750K–$1.7M SFH",
      whyFamilies: "Closest town to MCBH gate. More affordable than Kailua with similar mountain/ocean views. Windward Mall for shopping, great local restaurants. Temple Valley and Haiku Plantations are popular family neighborhoods. Feels more local, less touristy than Kailua.",
      vaNote: "Best value on the Windward side for military families. Newer townhome communities (Aikahi Park, Kaneohe Bay View) are mostly VA-approved. Older homes may have moisture issues from Windward rain — VA appraisers check for this. Get a good home inspector.",
    },
    {
      name: "Enchanted Lake",
      commute: "8–12 min",
      priceRange: "$900K–$1.6M SFH",
      whyFamilies: "Quiet residential neighborhood between Kailua and Kaneohe. Good schools, parks, and a small shopping center. Homes are 1960s–80s era with larger lots. Popular with senior NCOs and officers who want space without Kailua prices.",
      vaNote: "Mostly single-family homes — no condo approval issues. Older construction means VA appraisers will check roof age, termite history, and electrical. Homes here hold value well and rent easily if you PCS.",
    },
    {
      name: "Hawaii Kai",
      commute: "25–35 min",
      priceRange: "$500K–$1M condo/townhome / $900K–$2M SFH",
      whyFamilies: "East Honolulu community with marina, shopping, and excellent schools (Kaiser High). Feels upscale and suburban. Good for families who want to be between base and Honolulu. Hanauma Bay nearby for weekend snorkeling.",
      vaNote: "Longer commute via H-3 and Kalanianaole Highway but reverse-commute direction. Mix of older and newer homes. Marina-front condos are desirable but check VA approval status. Townhomes in Hawaii Kai are generally VA-friendly.",
    },
  ],
  commuteNote: "The Windward side commute reality: Kaneohe is closest and cheapest. Kailua is the lifestyle play — worth the premium if beach access and walkability matter to your family. Hawaii Kai adds 15–20 minutes but gives you access to east Honolulu amenities. Avoid living in town (Honolulu/Waikiki) and commuting to MCBH — the H-3 tunnel backs up badly in the morning.",
  faqs: [
    {
      q: "I'm a Marine — is the VA loan process different for me?",
      a: "No. VA loans work identically for all branches. Marines, Soldiers, Sailors, Airmen — same benefits, same $0 down, same process. VA requires you to occupy the home as your primary residence for 12 months. If you receive PCS orders before 12 months, that satisfies the requirement. I can pull your COE electronically in about 5 minutes once you send me your info.",
    },
    {
      q: "Is there a VA loan limit for Oahu in 2026?",
      a: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit for Honolulu County only matters if you have reduced entitlement from a prior VA loan that hasn't been restored. This is especially relevant on the Windward side where Kailua homes can push above $1M.",
    },
    {
      q: "Is it worth buying on the Windward side if I might PCS in 3 years?",
      a: "Usually yes. Windward side homes appreciate well and rent easily to the next wave of MCBH Marines. Kailua especially has strong rental demand from both military and civilian tenants. If you buy at $800K today and rent it for $3,500–$4,000/month when you leave, the numbers often work. I can run a hold-vs-sell analysis for your specific scenario.",
    },
    {
      q: "When does Jay order the VA appraisal?",
      a: "I order VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. On the Windward side, where older homes are common, this is especially important — get your inspection done early in the contract so we can identify any VA-flaggable items before committing to the appraisal fee.",
    },
    {
      q: "What about the rain on the Windward side — does that affect VA appraisals?",
      a: "Windward Oahu gets more rain than the Leeward side, and VA appraisers know this. They'll look for moisture intrusion, mold, proper drainage, and gutter condition. Older homes without gutters or with flat roofs get flagged more often. This isn't a dealbreaker — it just means you want a good pre-inspection so there are no surprises. I'll flag potential issues before you even make an offer.",
    },
  ],
  seoTitle: "VA Loan Guide for MCBH Kaneohe Bay — Buy a Home on Oahu",
  seoDescription: "PCS'ing to Marine Corps Base Hawaii? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best Windward side neighborhoods (Kailua, Kaneohe, Enchanted Lake), and $0-down options for Marines at MCBH Kaneohe Bay.",
  seoKeywords: "VA loan Kaneohe, VA loan MCBH, Marine Corps Base Hawaii housing, buying a home Kailua, VA loan Windward Oahu, Marines home loan Hawaii",
  otherBases: [
    { name: "Schofield Barracks", href: "/va-loan-schofield-barracks" },
    { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam" },
    { name: "Fort Shafter", href: "/va-loan-fort-shafter" },
    { name: "Tripler AMC", href: "/va-loan-tripler" },
  ],
};

export default function VALoanKaneohe() {
  return <VALoanBasePage data={DATA} />;
}
