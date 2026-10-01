/*
 * Pacific Modernism — Military Installation VA Loan Hub Page
 * Shared component for all 5 base-specific pages
 * Deep navy/teal palette, gold accents, conversational authority
 */
import { Link } from "wouter";
import condoData from "@/data/va-approved-condos-oahu.json";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import ShareGuide from "@/components/ShareGuide";
import { LENDER, IMAGES, IMAGE_ALTS, PRE_APPROVAL_URL } from "@/lib/constants";
import { getBAH, getCOLA, type PayGrade } from "@/lib/militaryPayData";
import { DEFAULT_PROPERTY_TAX_RATE, defaultMonthlyPropertyTax, monthlyPI, vaFundingFeeRate } from "@/lib/loanMath";
import ContactActions from "@/components/ContactActions";
import PCSCallout from "@/components/PCSCallout";
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
} from "lucide-react";

// PRE_APPROVAL_URL now imported from constants

// Shared BAH table — 2026 Honolulu County, from militaryPayData (not hand-typed).

const condoCount = condoData.totalApproved.toLocaleString();

const money0 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const BAH_RANKS: PayGrade[] = [
  "E-5", "E-6", "E-7", "E-8", "E-9",
  "W-1", "W-2", "W-3", "W-4", "W-5",
  "O-1", "O-2", "O-3", "O-4", "O-5", "O-6",
];

const BAH_TABLE = BAH_RANKS.map((rank) => ({
  rank,
  dep: money0(getBAH(rank, true)),
  noDep: money0(getBAH(rank, false)),
}));

// Purchase price where PITI ≈ BAH with dependents.
// 5.75%, 30-year, $0 down, first-use VA fee financed, 0.35% Honolulu tax, $200/mo insurance.
const SCENARIO_RATE = 5.75;
const SCENARIO_INSURANCE = 200;
const SCENARIO_FEE_PCT = vaFundingFeeRate(0, true, false);

function priceForBah(bah: number): number {
  const feeMult = 1 + SCENARIO_FEE_PCT / 100;
  const perDollar = monthlyPI(1, SCENARIO_RATE, 30);
  const taxPerDollar = (DEFAULT_PROPERTY_TAX_RATE / 100) / 12;
  const price = (bah - SCENARIO_INSURANCE) / (feeMult * perDollar + taxPerDollar);
  return Math.max(0, Math.round(price / 1000) * 1000);
}

function pitiAtPrice(price: number): number {
  const loan = price * (1 + SCENARIO_FEE_PCT / 100);
  return Math.round(monthlyPI(loan, SCENARIO_RATE, 30) + defaultMonthlyPropertyTax(price) + SCENARIO_INSURANCE);
}

const PAYMENT_SCENARIOS = BAH_RANKS.map((rank) => {
  const bah = getBAH(rank, true);
  const price = priceForBah(bah);
  return { rank, bah: money0(bah), price: money0(price), piti: money0(pitiAtPrice(price)) };
});

const COLA_EXAMPLE = getCOLA("E-5", 6, 1);
const TAX_ON_600K = defaultMonthlyPropertyTax(600_000);

export interface Neighborhood {
  name: string;
  commute: string;
  priceRange: string;
  whyFamilies: string;
  vaNote: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface BasePageData {
  slug: string;
  installationName: string;
  branch: string;
  unit: string;
  heroSubtitle: string;
  openingParagraph: string;
  neighborhoods: Neighborhood[];
  commuteNote: string;
  faqs: FAQItem[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  otherBases: { name: string; href: string }[];
}

export default function VALoanBasePage({ data }: { data: BasePageData }) {
  const HERO_IMAGE = "/images/heroes/page-military-calculator.webp";

  return (
    <Layout>
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        url={`https://realitycents.com/${data.slug}`}
        keywords={data.seoKeywords}
        type="website"
      />

      <PageHero
        title={`VA Loan Guide for ${data.installationName}`}
        subtitle={data.heroSubtitle}
        image={HERO_IMAGE}
        imageAlt={IMAGE_ALTS.heroMilitary}
      />

      {/* Opening */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-body">
            {data.openingParagraph}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-sm font-body font-medium">
              <Shield className="w-4 h-4" /> {data.branch}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-full text-sm font-body font-medium">
              <Users className="w-4 h-4" /> {data.unit}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/10 text-navy rounded-full text-sm font-body font-medium dark:bg-white/10 dark:text-sand">
              <DollarSign className="w-4 h-4" /> $0 Down VA Loan
            </span>
          </div>
        </div>
      </section>

      {/* BAH Table */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            The Quick Numbers — What Your BAH Buys Near {data.installationName}
          </h2>
          <p className="text-foreground/70 font-body mb-6">
            All Oahu installations use the same Honolulu County BAH rate. Here's what that looks like by rank in 2026:
          </p>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left font-body font-semibold">Rank</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">BAH w/ Dependents</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">BAH w/o Dependents</th>
                </tr>
              </thead>
              <tbody>
                {BAH_TABLE.map((row, i) => (
                  <tr key={row.rank} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <td className="px-4 py-3 font-body font-semibold text-foreground">{row.rank}</td>
                    <td className="px-4 py-3 text-right font-body text-foreground">{row.dep}</td>
                    <td className="px-4 py-3 text-right font-body text-foreground/70">{row.noDep}</td>
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
              <strong className="text-gold">Key insight:</strong> BAH is tax-free income, which helps VA buyers qualify for more house than their base pay alone would suggest.{" "}
              <Link href="/contact" className="text-teal hover:underline font-medium">
                Ask me how this affects your purchase power →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Payment Scenarios */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            What Does BAH Actually Buy Near {data.installationName} Right Now?
          </h2>
          <p className="text-foreground/70 font-body mb-2">
            With full VA entitlement, there is no loan limit for $0 down; how much you can borrow depends on your income, debts, residual income, and lender approval. Here's how your BAH maps to realistic purchase scenarios by rank:
          </p>
          <p className="text-foreground/60 font-body text-sm mb-6">
            Each scenario shows a purchase price where your BAH (with dependents) covers approximately 100% of the total monthly PITI payment.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left font-body font-semibold">Rank</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">BAH w/dep</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">Purchase Price</th>
                  <th className="px-4 py-3 text-right font-body font-semibold">Est. PITI</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_SCENARIOS.map((row, i) => (
                  <tr key={row.rank} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <td className="px-4 py-3 font-body font-semibold text-foreground">{row.rank}</td>
                    <td className="px-4 py-3 text-right font-body text-foreground/70">{row.bah}</td>
                    <td className="px-4 py-3 text-right font-body font-semibold text-teal">{row.price}</td>
                    <td className="px-4 py-3 text-right font-body text-foreground">{row.piti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-foreground/60 font-body">
            Estimates assume 5.75% rate, VA funding fee financed ({SCENARIO_FEE_PCT}% first use, $0 down), Honolulu County property tax {DEFAULT_PROPERTY_TAX_RATE}%, $200/mo insurance, single family home. Not a rate quote — <Link href="/contact" className="text-teal hover:underline">contact me for current rates</Link>.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-teal/5 border border-teal/20 rounded-lg">
              <p className="text-sm font-body text-foreground/80">
                <strong>Hawaii's secret weapon:</strong> Property tax at {DEFAULT_PROPERTY_TAX_RATE}% is the lowest in the country. A $600K home costs just {money0(TAX_ON_600K)}/month in property tax — compared to $500+/month in Texas or $750+/month in New Jersey.
              </p>
            </div>
            <div className="p-4 bg-teal/5 border border-teal/20 rounded-lg">
              <p className="text-sm font-body text-foreground/80">
                <strong>COLA boost:</strong> Oahu COLA (index 120) pays about 20% of the DoD &ldquo;spendable income&rdquo; amount for your grade and dependents — not a percent of base pay. See the Military Calculator for your figure. Example: an E-5 with 6 years of service and 1 dependent receives about {money0(COLA_EXAMPLE)}/month (travel.dod.mil CY 2026 Spendable Income Table, effective Feb 1, 2026; formula DoD FMR Vol 7A Ch 68).
              </p>
            </div>
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

      {/* Neighborhoods */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Best Neighborhoods for {data.installationName} Families
          </h2>
          <p className="text-foreground/70 font-body mb-8">
            These are the areas where I see most {data.branch} families buying near {data.installationName}. Each has trade-offs — here's the honest breakdown:
          </p>

          <div className="space-y-6">
            {data.neighborhoods.map((hood) => (
              <div key={hood.name} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <h3 className="text-lg font-display font-bold text-foreground">{hood.name}</h3>
                  <span className="inline-flex items-center gap-1.5 text-sm text-foreground/60 font-body">
                    <Clock className="w-4 h-4 text-teal" />
                    {hood.commute} to gate
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal/10 text-teal rounded-md text-xs font-body font-medium">
                    <DollarSign className="w-3 h-3" />
                    {hood.priceRange}
                  </span>
                </div>
                <p className="text-sm text-foreground/70 font-body mb-2">
                  <strong>Why families choose it:</strong> {hood.whyFamilies}
                </p>
                <p className="text-sm text-foreground/60 font-body">
                  <strong className="text-teal">VA note:</strong> {hood.vaNote}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-navy/5 border border-navy/10 rounded-lg dark:bg-white/5 dark:border-white/10">
            <p className="text-sm font-body text-foreground/70 italic">
              {data.commuteNote}
            </p>
          </div>
        </div>
      </section>

      {/* VA Condo Section */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            VA Condo Loans Near {data.installationName} — What You Need to Know
          </h2>
          <p className="text-foreground/70 font-body mb-4">
            Condos can be a smart entry point — especially for E-5s and below where single-family homes near {data.installationName} are out of reach. But not every condo is VA-eligible. The project must be on the VA's approved list.
          </p>
          <p className="text-foreground/70 font-body mb-6">
            I maintain a searchable database of all <strong>{condoCount} VA-approved condos on Oahu</strong> — updated regularly from the VA's own records. Before you fall in love with a condo, send me the address. I'll check VA approval status before you write an offer.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/va-approved-condos-oahu"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-body font-semibold transition-all hover:shadow-lg"
            >
              <Building2 className="w-4 h-4" />
              Search VA-Approved Condos →
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
            <p className="text-sm font-body text-foreground/80">
              <strong className="text-gold">Not on the list?</strong> Don't panic. I can submit a Lender Submitted Condo Approval to the Regional VA Loan Center as part of your purchase transaction — usually full project approval within 2–3 weeks. No problem meeting contract deadlines in a 45-day purchase agreement.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
            Using Your VA Loan at {data.installationName} — Common Questions
          </h2>

          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-display font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-foreground/70 font-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
            More VA Loan Resources
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/knowledge-base/va-loans-hawaii-military" className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all">
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">How to Buy a House in Hawaii With a VA Loan and $0 Down</h3>
              <p className="text-xs text-foreground/60 font-body mt-1">The step-by-step process, the Hawaii costs to budget, and the rules, from COE to closing.</p>
            </Link>
            <Link href="/knowledge-base/va-loan-house-hacking-hawaii" className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all">
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">VA House Hacking in Hawaii</h3>
              <p className="text-xs text-foreground/60 font-body mt-1">Buy a multi-unit property with $0 down and let tenants cover your mortgage.</p>
            </Link>
            <Link href="/knowledge-base/va-funding-fee-hawaii" className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all">
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">VA Funding Fee Explained</h3>
              <p className="text-xs text-foreground/60 font-body mt-1">What it costs, who's exempt, and whether to finance or pay upfront.</p>
            </Link>
            <Link href="/knowledge-base/va-second-tier-entitlement-hawaii" className="group p-4 bg-card border border-border rounded-xl hover:border-teal/40 hover:shadow-md transition-all">
              <h3 className="text-sm font-display font-bold text-foreground group-hover:text-teal transition-colors">Using Multiple VA Loans</h3>
              <p className="text-xs text-foreground/60 font-body mt-1">Second-tier entitlement, bonus entitlement, and how to use your VA loan more than once.</p>
            </Link>
          </div>

          {/* Other bases */}
          <div className="mt-8">
            <h3 className="text-lg font-display font-bold text-foreground mb-4">Other Oahu Installations</h3>
            <div className="flex flex-wrap gap-2">
              {data.otherBases.map((base) => (
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

      {/* Share This Guide */}
      <PCSCallout baseSlug={data.slug} />

      <section className="py-8">
        <div className="container max-w-4xl">
          <ShareGuide
            installationName={data.installationName}
            url={`https://realitycents.com/${data.slug}`}
          />
        </div>
      </section>

      {/* CTA Section */}
      <ContactActions
        variant="full"
        headline="Ready to Run the Numbers?"
        subtext="Send me your orders, your rank, and whether you have dependents. I’ll put together a real pre-approval scenario — usually same day — so you know exactly what you’re working with before you start touring homes."
        preApprovalLabel="Start Your Pre-Approval"
        showNmls
      />

      {/* External Resources */}
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
              href="https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/60 hover:text-teal transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              VA Certificate of Eligibility
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
            BAH table and payment scenarios current as of May 2026. Marked for quarterly review.
          </p>
        </div>
      </section>
    </Layout>
  );
}
