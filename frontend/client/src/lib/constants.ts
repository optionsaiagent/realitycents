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
} as const;

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
  { label: "VA Condo Lookup", href: "/va-approved-condos-oahu" },
  { label: "Homebuying Guide", href: "/guide" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/frequently-asked-questions" },
] as const;
