// RealityCents Site Constants
// Pacific Modernism Design — Deep navy authority, teal trust, warm sand approachability

export const SITE = {
  name: "RealityCents",
  tagline: "Your Trusted Mortgage Resource in Hawaii",
  description: "Mortgage education, tools, and lending services for Hawaii homebuyers and real estate professionals.",
  url: "https://realitycents.com",
} as const;

export const LENDER = {
  name: "Jay Miller",
  title: "Mortgage Loan Originator",
  nmls: "657301",
  company: "CMG Home Loans",
  branchNmls: "2475890",
  companyNmls: "1820",
  phone: "(808) 429-0811",
  email: "jaym@cmghomeloans.com",
  website: "www.jay-miller.com",
  address: {
    street: "500 Ala Moana Blvd, Suite 6-200",
    city: "Honolulu",
    state: "HI",
    zip: "96813",
    full: "500 Ala Moana Blvd, Suite 6-200, Honolulu, HI 96813",
  },
  experience: "25+",
} as const;

export const IMAGES = {
  heroHome: "/images/heroes/page-home.webp",
  heroAbout: "/images/heroes/page-about.webp",
  heroCalculator: "/images/heroes/page-calculator.webp",
  heroGuide: "/images/heroes/page-guide.webp",
  heroAgents: "/images/heroes/page-agents.webp",
  heroAdvisors: "/images/heroes/page-advisors.webp",
  heroZeroDown: "/images/heroes/page-zero-down-in-paradise.webp",
  headshot: "/images/jay-miller-headshot.webp",
  cmgLogo: "/images/cmg-home-loans-logo.png",
  logo: "/images/realitycents-logo.png",
} as const;

export const IMAGE_ALTS = {
  heroHome: "Honolulu and Diamond Head seen from the water along the Waikiki coastline",
  heroAbout: "Modest single-story Hawaii home with glowing windows at dusk, framed by palm trees",
  heroCalculator: "Hawaii home workspace with a desk, notebook, and a window view of tropical hills",
  heroGuide: "Hawaii beach at sunset seen from a beachfront home patio with palm trees and lounge chairs",
  heroAgents: "Bright Hawaii home office with a laptop and potted plants looking out onto palm trees",
  heroAdvisors: "Bright, uncluttered Hawaii home office with a white desk, black chair, and daylight through window blinds",
  heroMilitary: "Quiet sunlit residential street in Hawaii lined with plantation-style homes and palm trees",
  heroZeroDown: "Modest plantation-style Hawaii home with a lanai, palms, and Koʻolau mountains in late-afternoon light",
} as const;

/** 2026 FHFA single-family conforming limits used for reduced-entitlement VA math. */
export const HONOLULU_CONFORMING_LIMIT_2026 = 1_249_125;

export const HAWAII_COUNTY_CONFORMING_LIMITS_2026 = [
  { id: "honolulu", name: "Honolulu County (Oahu)", limit: 1_249_125 },
  { id: "maui", name: "Maui County", limit: 1_299_500 },
  { id: "kalawao", name: "Kalawao County", limit: 1_299_500 },
  { id: "kauai", name: "Kauai County", limit: 1_007_250 },
  { id: "hawaii", name: "Hawaii County (Big Island)", limit: 862_500 },
] as const;

export const PRE_APPROVAL_URL = "https://www.jay-miller.com";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "The Book: Zero Down in Paradise", href: "/zero-down-in-paradise" },
  { label: "Agent Tools", href: "/agents" },
  { label: "Calculator", href: "/calculator" },
  { label: "Advanced Calculator", href: "/advanced-calculator" },
  { label: "Military Buying Power", href: "/military-calculator" },
  { label: "VA Remaining Eligibility", href: "/va-eligibility-calculator" },
  { label: "VA Condo Lookup", href: "/va-approved-condos-oahu" },
  { label: "Homebuying Guide", href: "/guide" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/frequently-asked-questions" },
] as const;
