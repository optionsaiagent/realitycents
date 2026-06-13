/*
 * Pacific Modernism — VA Loan Fort Shafter — Dedicated Enhanced Page
 * Army (USARPAC HQ), senior NCOs and officers
 * Standalone comprehensive page with JSON-LD schema, quarterly update flags,
 * and detailed content for all sections.
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import ShareGuide from "@/components/ShareGuide";
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import {
  Phone,
  Mail,
  MapPin,
  Shield,
  Clock,
  DollarSign,
  Home,
  ExternalLink,
  ArrowRight,
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
    name: "Salt Lake / Aliamanu",
    commute: "5 min",
    priceSFH: "$600K–$850K (condos/townhomes)",
    priceTH: null,
    whyFamilies:
      "Closest to post, military community feel. Affordable condos great for junior personnel. Very convenient to Fort Shafter's main gate.",
    vaNote:
      "Condo-heavy — verify VA project approval. Some buildings have deferred maintenance that can block VA financing.",
  },
  {
    name: "Moanalua",
    commute: "5–10 min",
    priceSFH: "$800K–$1.1M",
    priceTH: null,
    whyFamilies:
      "Quiet, established, good schools. Moanalua Gardens nearby. Suburban feel minutes from both Fort Shafter and H-1. Popular with families.",
    vaNote:
      "Mostly fee simple single-family — strong for VA. Clean appraisals on well-maintained homes.",
  },
  {
    name: "Kalihi / Foster Village",
    commute: "5 min",
    priceSFH: "$700K–$900K",
    priceTH: null,
    whyFamilies:
      "Urban, walkable to post, affordable. Local restaurants, easy access to downtown Honolulu. Quick commute in either direction.",
    vaNote:
      "Older housing stock — MPR awareness important. Some multi-family properties — confirm zoning for VA single-family financing.",
  },
  {
    name: "Aiea / Pearl City",
    commute: "15 min",
    priceSFH: "$750K–$1.1M",
    priceTH: null,
    whyFamilies:
      "More space, suburban feel, good schools. Pearlridge Mall, Pearl Highlands nearby. Larger lots than Salt Lake or Kalihi. Family-oriented neighborhoods.",
    vaNote:
      "Mix of properties — confirm fee simple on older properties. Some leasehold exists in this area.",
  },
  {
    name: "Manoa / Makiki",
    commute: "10–15 min",
    priceSFH: "$900K–$1.3M",
    priceTH: null,
    whyFamilies:
      "Upscale Honolulu neighborhoods, walkable, university area. Restaurants, coffee shops, hiking trails. City lifestyle with residential quiet.",
    vaNote:
      "Higher price point, some older homes. Mostly fee simple. Well-maintained properties pass VA appraisal cleanly.",
  },
];

// ─── FAQ Data ───────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "I used my VA loan at my last duty station. Can I use it again at Fort Shafter?",
    a: "Yes — with remaining entitlement. Honolulu County's 2026 limit is $1,209,750. Subtract your current VA loan balance from that figure to find your available 100% financing ceiling. Above that, a 25% partial down payment applies on the difference only.",
    hasLink: true,
  },
  {
    q: "Can I qualify on BAH alone?",
    a: "BAH counts as qualifying income when documented on your LES. Most lenders — including me — can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Shafter personnel tend to be higher-ranking — your BAH covers more of the payment than junior ranks. Call me and we'll run it in 10 minutes.",
    hasLink: false,
  },
  {
    q: "I'm a senior officer. Are there homes above the VA loan limit?",
    a: "The 2026 Honolulu County limit is $1,209,750. Above that, you can still use VA — you'd put 25% down on the amount above the limit only. For a $1.4M home, that's about $47,500 down instead of the $280,000 conventional would require. Still a massive advantage.",
    hasLink: false,
  },
  {
    q: "Should I buy or rent if I'm only here 2–3 years?",
    a: "Honest answer: at your rank, the math almost always favors buying. Your BAH covers a significant portion of the payment, Oahu appreciation has historically supported short holds, and your rental demand when you PCS is built in — Fort Shafter always has incoming personnel who need housing. I'll give you a straight opinion when we talk — not a sales pitch.",
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
      "Army veteran and Certified Mortgage Advisor specializing in VA loans for USARPAC and Fort Shafter personnel PCS'ing to Oahu. 25+ years of Hawaii mortgage lending experience.",
    url: "https://realitycents.com/va-loan-fort-shafter",
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
        name: "VA Loan Fort Shafter",
        item: "https://realitycents.com/va-loan-fort-shafter",
      },
    ],
  },
];

// ─── Page Component ─────────────────────────────────────────────────────────
export default function VALoanFortShafter() {
  const HERO_IMAGE =
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/military-calculator-hero-TWFMScyJuU9vBfeWbD2r8g.webp";

  return (
    <Layout>
      <SEO
        title="VA Loan Guide for Fort Shafter — Buy a Home on Oahu with $0 Down"
        description="PCS'ing to Fort Shafter? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best neighborhoods (Salt Lake, Moanalua, Kalihi, Aiea, Manoa/Makiki), VA condo rules, and $0-down purchase options for USARPAC Army personnel on Oahu."
        url="https://realitycents.com/va-loan-fort-shafter"
        keywords="VA loan Fort Shafter, buying a home near Fort Shafter, VA loan Honolulu, USARPAC home loan, military home loan Honolulu"
        type="website"
        schema={PAGE_SCHEMA}
      />

      <PageHero
        title="VA Loan Guide for Fort Shafter"
        subtitle="Buy a Home on Oahu with $0 Down"
        image={HERO_IMAGE}
        imageAlt="Military housing near Fort Shafter, Honolulu Oahu Hawaii"
      />

      {/* ─── Opening Section ─────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            VA Loan Guide for Fort Shafter — Buy a Home on Oahu with $0 Down
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-body">
            You're heading to Fort Shafter — home of USARPAC and one of the most centrally
            located Army installations in the Pacific. Your location in urban Honolulu means you
            have neighborhood options that range from walkable city living to quiet suburban
            streets, all within 15 minutes of post. Here's how to maximize your VA loan near
            Shafter.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-sm font-body font-medium">
              <Shield className="w-4 h-4" /> U.S. Army
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-full text-sm font-body font-medium">
              <Users className="w-4 h-4" /> USARPAC / Fort Shafter
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
              The Quick Numbers — What Your BAH Buys Near Fort Shafter
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
              qualifying income is higher than the dollar amount shown. At the ranks typical for
              Fort Shafter (E-7+, O-3+), this gross-up makes a significant difference in
              purchasing power.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Payment Scenarios Section ───────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              What Does BAH Actually Buy Near Fort Shafter Right Now?
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
            Best Neighborhoods for Fort Shafter Personnel
          </h2>
          <p className="text-foreground/70 font-body mb-8">
            Fort Shafter personnel tend to be more senior — E-7+ and field-grade officers. The
            neighborhoods closest to Shafter give you urban Honolulu access that other bases
            don't have.
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
                    {hood.priceSFH}
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
              One honest note: Fort Shafter personnel tend to be more senior — E-7+ and
              field-grade officers. Your BAH and purchasing power reflect that. If you want the
              city lifestyle, Makiki and Moanalua deliver. If you want suburban space, Pearl City
              is 15 minutes away.
            </p>
          </div>
        </div>
      </section>

      {/* ─── VA Condo Section ────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            VA Condo Loans Near Fort Shafter — What You Need to Know
          </h2>
          <p className="text-foreground/70 font-body mb-4">
            The Salt Lake and Kalihi areas near Fort Shafter have significant condo inventory.
            VA financing requires the entire condo project to be VA-approved — not just the
            individual unit. This is a step many buyers skip and then lose deals over.
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
            Using Your VA Loan at Fort Shafter — Common Questions
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
            Why Work With a Local VA Lender at Fort Shafter?
          </h2>
          <div className="prose prose-lg max-w-none font-body text-foreground/80">
            <p className="leading-relaxed">
              I'm Jay Miller, NMLS #657301, with CMG Home Loans in Honolulu. I'm an Army veteran
              — my wife Michelle and I both served, and we chose to plant roots here after our
              time in uniform. I've been doing VA loans on Oahu for 25 years. I work with USARPAC
              and Shafter personnel regularly. At your rank, the math almost always favors buying
              — let me show you why.
            </p>
            <p className="leading-relaxed mt-4">
              When you're PCS'ing to Hawaii for a senior assignment, you don't need a call
              center. You need someone who knows the Honolulu market at the $900K–$1.3M price
              point and can tell you why the Manoa house is worth the premium — or isn't.
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
                { name: "Schofield Barracks", href: "/va-loan-schofield-barracks" },
                { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam" },
                { name: "Kaneohe MCBH", href: "/va-loan-kaneohe-mcbh" },
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
            installationName="Fort Shafter"
            url="https://realitycents.com/va-loan-fort-shafter"
          />
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-navy text-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Run the Numbers?
          </h2>
          <p className="text-lg text-sand/80 font-body max-w-2xl mx-auto mb-4">
            Send me your orders, your rank, and whether you have dependents. I'll put together a
            real pre-approval scenario — usually same day — so you know exactly what you're
            working with before you start touring homes.
          </p>
          <p className="text-sm text-sand/60 font-body mb-8">
            Jay Miller, CMA | Army Veteran | NMLS #657301 | 25 years doing VA loans on Oahu
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href={PRE_APPROVAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-lg text-base font-body font-bold transition-all hover:shadow-lg hover:shadow-gold/30"
            >
              Get Pre-Approved
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="tel:8084290811"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-lg text-base font-body font-semibold transition-all hover:shadow-lg"
            >
              <Phone className="w-5 h-5" />
              Call/Text: 808-429-0811
            </a>
            <a
              href="mailto:jaym@cmghomeloans.com"
              className="inline-flex items-center gap-2 border-2 border-sand/30 text-sand/80 hover:border-teal hover:text-teal px-6 py-3 rounded-lg text-base font-body font-semibold transition-all"
            >
              <Mail className="w-5 h-5" />
              jaym@cmghomeloans.com
            </a>
          </div>

          <p className="mt-8 text-xs text-sand/50 font-body">
            NMLS #{LENDER.nmls} | CMG Home Loans NMLS #{LENDER.branchNmls} |{" "}
            {LENDER.address.full}
          </p>
        </div>
      </section>

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
