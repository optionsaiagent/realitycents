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
  heroHome: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663400630719/LwWrAiqUAqXXtoPV.webp",
  heroAbout: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/hero-about-EsnkFiRvVsBcaRW2EoCfyF.webp",
  heroCalculator: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/hero-calculator-ns6YWqEans9Dy2XHepWyYa.webp",
  heroGuide: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/hero-guide-HnGwhxkwfPL9fhRJh8qtra.webp",
  heroAgents: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/hero-agents-LWASAU7UeVXHYoSUTMYBkU.webp",
  headshot: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/jay-miller-headshot-2026_4148a98a.png",
  cmgLogo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/cmg-home-loans-logo_209ebfc7.png",
  logo: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663400630719/XGnwLupIzEAfsONv.png?Expires=1804142424&Signature=fSb3-SGBGqQ92krzeY2hYCAzd9d2HgsvvD6vcDpzS8Eh5AYOJZ3oWYZmt3mEtkBzyUUmHrov9D7iVGTZTENyEBVzRyyCR48Nu4sZPfSkqm39luJaSs1O5BZ6kJ5yyaItGMLFu0W3atdPcPbC6sUkEuZtxVYaFpW8LAwGSPJDhPw7Z8QWOiUL-PqRLEF8Wn51KNNX3gZcTeCdUB98~cczAvuh5ZI4xYGEI3ThLQgNQoya74-Ek9ODnp4gWqVJPSPGDC2pFQ8qy8ECqD3eOd-l3qcOVUDsVcmLHADHfcfTeIdKx1LbKRSl5ZUA9Z-vZrGS7QPKSySDXBvH5Pz2NWBS-A__&Key-Pair-Id=K2HSFNDJXOU9YS",
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
  { label: "Homebuying Guide", href: "/guide" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/frequently-asked-questions" },
] as const;
