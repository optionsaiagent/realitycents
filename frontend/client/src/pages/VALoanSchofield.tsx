/*
 * Pacific Modernism — VA Loan Schofield Barracks — Dedicated Enhanced Page
 * Army, 25th Infantry Division, high PCS volume
 * Standalone comprehensive page with JSON-LD schema, quarterly update flags,
 * and detailed content for all sections.
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import ShareGuide from "@/components/ShareGuide";
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import {
  MapPin,
  Shield,
  Clock,
  DollarSign,
  Home,
  ExternalLink,
  CheckCircle2,
  Building2,
  Calculator,
  Users,
  Star,
  RefreshCw,
} from "lucide-react";

// ─── Quarterly Update Badge ─────────────────────────────────────────────────
function QuarterlyBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-full text-xs font-body font-medium">
      <RefreshCw className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── BAH Table Data — 2026 Honolulu County ──────────────────────────────────
const BAH_TABLE = [
  { rank: "E-4 & below", dep: "$3,183", noDep: "$2,598" },
  { rank: "E-5", dep: "$3,663", noDep: "$2,997" },
  { rank: "E-6", dep: "$3,861", noDep: "$3,153" },
  { rank: "E-7", dep: "$4,098", noDep: "$3,348" },
  { rank: "O-3", dep: "$4,434", noDep: "$3,618" },
  { rank: "O-4", dep: "$4,719", noDep: "$3,879" },
  { rank: "O-5", dep: "$4,959", noDep: "$4,224" },
];

// ─── Payment Scenarios ──────────────────────────────────────────────────────
const PAYMENT_SCENARIOS = [
  { scenario: "E-5 w/ dependents", price: "$750,000", piti: "~$5,100", bahCovers: "~72%" },
  { scenario: "E-7 w/ dependents", price: "$850,000", piti: "~$5,800", bahCovers: "~71%" },
  { scenario: "O-3 w/ dependents", price: "$950,000", piti: "~$6,500", bahCovers: "~68%" },
  { scenario: "O-5 w/ dependents", price: "$1,100,000", piti: "~$7,500", bahCovers: "~66%" },
];

// ─── Neighborhoods ──────────────────────────────────────────────────────────
const NEIGHBORHOODS = [
  {
    name: "Mililani",
    commute: "15–20 min via H-2",
    priceSFH: "$800K–$1.1M",
    priceTH: "$550K–$750K",
    whyFamilies:
      "Top-rated schools, walkable, established military community, clean and well-maintained",
    vaNote:
      "Mix of fee simple and leasehold — confirm fee simple before making an offer",
  },
  {
    name: "Wahiawa",
    commute: "5–10 min (closest off-base option)",
    priceSFH: "$600K–$800K",
    priceTH: null,
    whyFamilies:
      "Closest to post, most affordable, tight-knit community",
    vaNote:
      "Older housing stock — VA appraisal MPR awareness important here",
  },
  {
    name: "Waikele / Waipahu",
    commute: "20–25 min via H-1/H-2",
    priceSFH: "$700K–$950K",
    priceTH: null,
    whyFamilies:
      "Newer construction, Waikele Premium Outlets nearby, slightly easier H-1 access for spouses commuting to Honolulu",
    vaNote:
      "Mostly fee simple, generally strong for VA appraisal",
  },
  {
    name: "Kapolei / Ewa Beach",
    commute: "30–40 min (longer but popular)",
    priceSFH: "$700K–$1M",
    priceTH: null,
    whyFamilies:
      "Newer developments, beach access, second city feel, Ho\u2018opili and Koa Ridge have VA-approved new construction",
    vaNote:
      "D.R. Horton Hawaii actively pursues VA approval on new phases — worth calling me before you buy new construction here",
  },
];

// ─── FAQ Data ───────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "I used my VA loan on the mainland. Can I use it again at Schofield?",
    a: "Yes — with remaining entitlement. Honolulu County's 2026 limit is $1,209,750. Subtract your current VA loan balance from that figure to find your available 100% financing ceiling. Above that, a 25% partial down payment applies on the difference.",
    hasLink: true,
  },
  {
    q: "Can I qualify on BAH alone?",
    a: "BAH counts as qualifying income when documented on your LES. Most lenders — including me — can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Whether it's sufficient alone depends on your full debt picture. Call me and we'll run it in 10 minutes.",
    hasLink: false,
  },
  {
    q: "How long does VA loan approval take? I have a short PCS window.",
    a: "A VA loan doesn't take longer than conventional — the appraisal process is comparable. The variable is condo approval status and seller education. I close VA loans on Oahu regularly and know how to set timelines that work with PCS constraints.",
    hasLink: false,
  },
  {
    q: "Should I buy or rent if I'm only here 2–3 years?",
    a: "Honest answer: it depends on when in the market cycle you're buying and where you think Hawaii appreciation goes. But historically, Oahu values have supported short holds better than most markets. I'll give you a straight opinion when we talk — not a sales pitch.",
    hasLink: false,
  },
];

// ─── JSON-LD Schema ─────────────────────────────────────────────────────────
const PAGE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://realitycents.com/#business",
    name: "Jay Miller — VA Loan Specialist, CMG Home Loans",
    description:
      "Army veteran and Certified Mortgage Advisor specializing in VA loans for military families PCS'ing to Schofield Barracks and Oahu. 25+ years of Hawaii mortgage lending experience.",
    url: "https://realitycents.com/va-loan-schofield-barracks",
    telephone: "(808) 429-0811",
    email: "jaym@cmghomeloans.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "500 Ala Moana Blvd, Suite 6-200",
      addressLocality: "Honolulu",
      addressRegion: "HI",
      postalCode: "96813",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 21.3069,
      longitude: -157.8583,
    },
    areaServed: {
      "@type": "Place",
      name: "Oahu, Hawaii",
    },
    priceRange: "$$",
    image: "https://realitycents.com/og-image.jpg",
    additionalType: "https://schema.org/MortgageLender",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://realitycents.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "VA Loan Schofield Barracks",
        item: "https://realitycents.com/va-loan-schofield-barracks",
      },
    ],
  },
];

// ─── Page Component ─────────────────────────────────────────────────────────
export default function VALoanSchofield() {
  const HERO_IMAGE =
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/military-calculator-hero-TWFMScyJuU9vBfeWbD2r8g.webp";

  return (
    <Layout>
      <SEO
        title="VA Loan Guide for Schofield Barracks — Buy a Home on Oahu with $0 Down"
        description="PCS'ing to Schofield Barracks? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best neighborhoods (Mililani, Wahiawa, Kapolei), VA condo rules, and $0-down purchase options for 25th Infantry Division families on Oahu."
        url="https://realitycents.com/va-loan-schofield-barracks"
        keywords="VA loan Schofield Barracks, buying a home near Schofield Barracks, VA loan Wahiawa, VA loan Mililani, 25th Infantry Division home loan"
        type="website"
        schema={PAGE_SCHEMA}
      />

      <PageHero
        title="VA Loan Guide for Schofield Barracks"
        subtitle="Buy a Home on Oahu with $0 Down"
        image={HERO_IMAGE}
        imageAlt="Military housing near Schofield Barracks, Oahu Hawaii"
      />

      {/* ─── Opening Section ─────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            VA Loan Guide for Schofield Barracks — Buy a Home on Oahu with $0 Down
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-body">
            You just got orders to Schofield Barracks and you're doing the math on Hawaii housing.
            Renting feels like the safe play — but if you have VA eligibility and you're staying 2+
            years, I'd push you to run the numbers on buying first. Here's everything you need to
            know about using your VA loan at Schofield.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-sm font-body font-medium">
              <Shield className="w-4 h-4" /> U.S. Army
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-full text-sm font-body font-medium">
              <Users className="w-4 h-4" /> 25th Infantry Division
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/10 text-navy rounded-full text-sm font-body font-medium dark:bg-white/10 dark:text-sand">
              <DollarSign className="w-4 h-4" /> $0 Down VA Loan
            </span>
          </div>
        </div>
      </section>

      {/* ─── BAH Table Section ───────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              The Quick Numbers — What Your BAH Buys Near Schofield
            </h2>
            <QuarterlyBadge label="Updated Q1 2026" />
          </div>
          <p className="text-foreground/70 font-body mb-6">
            All Oahu installations use the same Honolulu County BAH rate. Here's what that looks
            like by rank in 2026.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left font-body font-semibold">Rank</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">
                    With Dependents
                  </th>
                  <th className="px-4 py-3 text-right font-body font-semibold">
                    Without Dependents
                  </th>
                </tr>
              </thead>
              <tbody>
                {BAH_TABLE.map((row, i) => (
                  <tr
                    key={row.rank}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}
                  >
                    <td className="px-4 py-3 font-body font-semibold text-foreground">
                      {row.rank}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-foreground">
                      {row.dep}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-foreground/70">
                      {row.noDep}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-foreground/60 font-body">
            Source:{" "}
            <a
              href="https://www.defensetravel.dod.mil/site/bahCalc.cfm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              DoD BAH Calculator
            </a>
            , Honolulu County 2026. Always verify at militaryonesource.mil.
          </p>

          <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
            <p className="text-sm font-body text-foreground/80">
              <strong className="text-gold">Key insight:</strong> BAH is tax-free. Most VA
              lenders can gross it up by 25% for qualifying purposes — meaning your effective
              qualifying income is higher than the dollar amount shown. Ask me how this affects
              your purchase power.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Payment Scenarios Section ───────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              What Does BAH Actually Buy Near Schofield Right Now?
            </h2>
            <QuarterlyBadge label="Rate-dependent · Q1 2026" />
          </div>
          <p className="text-foreground/70 font-body mb-2">
            The 2026 Honolulu County VA loan limit is{" "}
            <strong className="text-foreground">$1,209,750</strong> — meaning you can buy up to
            that price with $0 down if you have full entitlement. Here's how that maps to
            realistic scenarios by rank.
          </p>
          <div className="flex items-center gap-2 mb-6">
            <QuarterlyBadge label="Loan limit updates Jan 2026" />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left font-body font-semibold">Scenario</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">
                    Purchase Price
                  </th>
                  <th className="px-4 py-3 text-right font-body font-semibold">
                    Est. Monthly PITI
                  </th>
                  <th className="px-4 py-3 text-right font-body font-semibold">
                    BAH Covers...
                  </th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_SCENARIOS.map((row, i) => (
                  <tr
                    key={row.scenario}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}
                  >
                    <td className="px-4 py-3 font-body font-semibold text-foreground">
                      {row.scenario}
                    </td>
                    <td className="px-4 py-3 text-right font-body font-semibold text-teal">
                      {row.price}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-foreground">
                      {row.piti}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-foreground/70">
                      {row.bahCovers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-foreground/60 font-body">
            Estimates assume 6.75% rate, VA funding fee financed, Honolulu County property tax
            0.31%, $200/mo insurance. Not a rate quote.
          </p>

          <div className="mt-6 p-5 bg-teal/5 border border-teal/20 rounded-lg">
            <p className="text-sm font-body text-foreground/80 leading-relaxed">
              The gap between BAH and PITI is real — but context matters. Hawaii's property tax
              rate of 0.31% is the lowest in the country. On a $900,000 home, that's roughly
              $232/month in property tax — compare that to $845/month in San Diego on the same
              home. COLA also supplements your take-home in ways that make the math more workable
              than it first appears.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/military-calculator"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-body font-semibold transition-all hover:shadow-lg"
            >
              <Calculator className="w-4 h-4" />
              Run Your Numbers →
            </Link>
            <a
              href={PRE_APPROVAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-lg text-sm font-body font-semibold transition-all hover:shadow-lg"
            >
              Get Pre-Approved
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Neighborhoods Section ───────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Best Neighborhoods for Schofield Barracks Families
          </h2>
          <p className="text-foreground/70 font-body mb-8">
            Where you live relative to Schofield's Lyman Gate or Foote Gate will define your
            daily life. Here's how the closest neighborhoods stack up.
          </p>

          <div className="space-y-6">
            {NEIGHBORHOODS.map((hood) => (
              <div
                key={hood.name}
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {hood.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-sm text-foreground/60 font-body">
                    <Clock className="w-4 h-4 text-teal" />
                    {hood.commute}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal/10 text-teal rounded-md text-xs font-body font-medium">
                    <Home className="w-3 h-3" />
                    SFH: {hood.priceSFH}
                  </span>
                  {hood.priceTH && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy/10 text-navy dark:bg-white/10 dark:text-sand rounded-md text-xs font-body font-medium">
                      <Building2 className="w-3 h-3" />
                      TH: {hood.priceTH}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/70 font-body mb-2">
                  <strong>Why families choose it:</strong> {hood.whyFamilies}
                </p>
                <p className="text-sm text-foreground/60 font-body">
                  <strong className="text-teal">VA consideration:</strong> {hood.vaNote}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-navy/5 border border-navy/10 rounded-lg dark:bg-white/5 dark:border-white/10">
            <p className="text-sm font-body text-foreground/70 italic">
              One honest note: Avoid judging by price alone. A $750K home in Wahiawa with a
              7-minute commute beats a $750K home in Ewa Beach with a 45-minute commute if
              you're doing PT at 5am and have kids in school.
            </p>
          </div>
        </div>
      </section>

      {/* ─── VA Condo Section ────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            VA Condo Loans Near Schofield — What You Need to Know
          </h2>
          <p className="text-foreground/70 font-body mb-4">
            Condos are common in the Schofield area price range, but VA financing requires the
            entire condo project to be VA-approved — not just the individual unit. This is a step
            many buyers skip and then lose deals over.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/va-approved-condos-oahu"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-body font-semibold transition-all hover:shadow-lg"
            >
              <Building2 className="w-4 h-4" />
              Search VA-Approved Condos on Oahu →
            </Link>
          </div>

          <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
            <p className="text-sm font-body text-foreground/80">
              <strong className="text-gold">Before you fall in love with a condo:</strong> Send
              me the address. I'll check VA approval status before you write an offer.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
            Using Your VA Loan at Schofield — Common Questions
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-base font-display font-bold text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-foreground/70 font-body leading-relaxed">
                  {faq.a}
                  {faq.hasLink && (
                    <>
                      {" "}
                      <Link
                        href="/knowledge-base/multiple-va-loans-hawaii"
                        className="text-teal hover:underline font-medium"
                      >
                        Learn more about using multiple VA loans →
                      </Link>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Work With a Local VA Lender ─────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Why Work With a Local VA Lender at Schofield?
          </h2>
          <div className="prose prose-lg max-w-none font-body text-foreground/80">
            <p className="leading-relaxed">
              I'm Jay Miller, NMLS #657301, with CMG Home Loans in Honolulu. I'm an Army veteran
              — my wife Michelle and I both served, and we chose to plant roots here after our
              time in uniform. I've been doing VA loans on Oahu for 25 years. I know Schofield, I
              know Mililani, I know what the VA appraiser will flag at a Wahiawa property and what
              they won't.
            </p>
            <p className="leading-relaxed mt-4">
              When you're PCS'ing to Hawaii from the mainland, you don't need a call center. You
              need someone who's driven Kamehameha Highway at rush hour and can tell you why the
              Waikele house is worth the commute — or isn't.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Cross-links / Other Bases ───────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
            More VA Loan Resources
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/knowledge-base/va-loans-hawaii-military"
              className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all"
            >
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">
                VA Loans in Hawaii — Complete Guide
              </h3>
              <p className="text-xs text-foreground/60 font-body mt-1">
                Everything about VA loan benefits, eligibility, and Hawaii-specific rules.
              </p>
            </Link>
            <Link
              href="/knowledge-base/va-loan-house-hacking-hawaii"
              className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all"
            >
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">
                VA House Hacking in Hawaii
              </h3>
              <p className="text-xs text-foreground/60 font-body mt-1">
                Buy a multi-unit property with $0 down and let tenants cover your mortgage.
              </p>
            </Link>
            <Link
              href="/knowledge-base/va-funding-fee-guide"
              className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all"
            >
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">
                VA Funding Fee Explained
              </h3>
              <p className="text-xs text-foreground/60 font-body mt-1">
                What it costs, who's exempt, and whether to finance or pay upfront.
              </p>
            </Link>
            <Link
              href="/knowledge-base/multiple-va-loans-hawaii"
              className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all"
            >
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">
                Using Multiple VA Loans
              </h3>
              <p className="text-xs text-foreground/60 font-body mt-1">
                Second-tier entitlement, bonus entitlement, and how to use your VA loan more
                than once.
              </p>
            </Link>
          </div>

          {/* Other bases */}
          <div className="mt-8">
            <h3 className="text-lg font-display font-bold text-foreground mb-4">
              Other Oahu Installations
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam" },
                { name: "Kaneohe MCBH", href: "/va-loan-kaneohe-mcbh" },
                { name: "Fort Shafter", href: "/va-loan-fort-shafter" },
                { name: "Tripler AMC", href: "/va-loan-tripler" },
              ].map((base) => (
                <Link
                  key={base.href}
                  href={base.href}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted border border-border rounded-lg text-sm font-body font-medium text-foreground/70 hover:text-teal hover:border-teal/40 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {base.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Share This Guide ────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="container max-w-4xl">
          <ShareGuide
            installationName="Schofield Barracks"
            url="https://realitycents.com/va-loan-schofield-barracks"
          />
        </div>
      </section>

      {/* CTA Section */}
      <ContactActions
        variant="full"
        headline="Ready to Run the Numbers?"
        subtext="Send me your orders, your rank, and whether you have dependents. I'll put together a real pre-approval scenario — usually same day — so you know exactly what you're working with before you start touring homes."
        preApprovalLabel="Get Pre-Approved"
        showNmls
      />

      {/* ─── External Resources Footer ───────────────────────────────────── */}
      <section className="py-8 border-t border-border">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-body">
            <a
              href="https://www.defensetravel.dod.mil/site/bahCalc.cfm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/60 hover:text-teal transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              DoD BAH Calculator
            </a>
            <span className="text-foreground/30">|</span>
            <a
              href="https://www.va.gov/housing-assistance/home-loans/how-to-apply/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/60 hover:text-teal transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              VA.gov Certificate of Eligibility
            </a>
            <span className="text-foreground/30">|</span>
            <a
              href="https://lgy.va.gov/lgyhub/condo-report"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/60 hover:text-teal transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              VA Condo Lookup (Official)
            </a>
          </div>
          <p className="text-center text-xs text-foreground/40 font-body mt-4">
            BAH table, payment scenarios, and loan limit current as of Q1 2026. Marked for
            quarterly review.
          </p>
        </div>
      </section>
    </Layout>
  );
}
