/*
 * Pacific Modernism — VA Remaining Eligibility Calculator
 * Educational remaining-entitlement math for Hawaii counties.
 * Uses 2026 FHFA conforming limits. Not a commitment to lend.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import {
  HAWAII_COUNTY_CONFORMING_LIMITS_2026,
  HONOLULU_CONFORMING_LIMIT_2026,
  IMAGES,
  LENDER,
  SITE,
} from "@/lib/constants";
import { BOOK } from "@/lib/book";
import { ArrowRight, Info, Shield } from "lucide-react";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function VAEligibilityCalculator() {
  const [countyId, setCountyId] = useState<(typeof HAWAII_COUNTY_CONFORMING_LIMITS_2026)[number]["id"]>(
    "honolulu"
  );
  const [existingBalance, setExistingBalance] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(HONOLULU_CONFORMING_LIMIT_2026);

  const county =
    HAWAII_COUNTY_CONFORMING_LIMITS_2026.find((c) => c.id === countyId) ??
    HAWAII_COUNTY_CONFORMING_LIMITS_2026[0];

  const result = useMemo(() => {
    const countyLimit = county.limit;
    const maxGuaranty = countyLimit * 0.25;
    const fullEntitlement = existingBalance <= 0;
    const entitlementUsed = existingBalance * 0.25;
    const remainingEntitlement = Math.max(0, maxGuaranty - entitlementUsed);
    const zeroDownCapacity = remainingEntitlement * 4;
    let downPayment = 0;
    if (!fullEntitlement && purchasePrice > zeroDownCapacity) {
      downPayment = 0.25 * (purchasePrice - zeroDownCapacity);
    }
    return {
      countyLimit,
      maxGuaranty,
      fullEntitlement,
      remainingEntitlement,
      zeroDownCapacity,
      downPayment,
    };
  }, [county.limit, existingBalance, purchasePrice]);

  return (
    <Layout>
      <SEO
        title="VA Remaining Eligibility Calculator — Hawaii 2026"
        description={`Estimate remaining VA $0-down capacity in Hawaii. Honolulu County's 2026 single-family conforming limit is $${HONOLULU_CONFORMING_LIMIT_2026.toLocaleString("en-US")}. Educational tool by Jay Miller, NMLS #657301.`}
        url="/va-eligibility-calculator"
        keywords="VA remaining eligibility calculator, VA entitlement Hawaii, Honolulu conforming limit 2026, VA remaining entitlement, zero down VA Hawaii"
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "VA Remaining Eligibility Calculator",
            url: `${SITE.url}/va-eligibility-calculator`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: { "@type": "Person", name: "Jay Miller", url: `${SITE.url}/about` },
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          },
        ]}
      />

      <PageHero
        title="VA Remaining Eligibility Calculator"
        subtitle={`Estimate remaining $0-down capacity when entitlement is reduced. Honolulu County 2026 single-family conforming limit: $${HONOLULU_CONFORMING_LIMIT_2026.toLocaleString("en-US")}.`}
        image={IMAGES.heroZeroDown}
        compact
      />

      <section className="py-12 lg:py-16">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  County where you are buying
                </label>
                <select
                  value={countyId}
                  onChange={(e) =>
                    setCountyId(e.target.value as (typeof HAWAII_COUNTY_CONFORMING_LIMITS_2026)[number]["id"])
                  }
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                >
                  {HAWAII_COUNTY_CONFORMING_LIMITS_2026.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {fmt(c.limit)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  Outstanding VA loan balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={existingBalance}
                    onChange={(e) => setExistingBalance(Math.max(0, Number(e.target.value) || 0))}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-7 pr-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter $0 if you have no active VA loan (full entitlement).
                </p>
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  Purchase price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value) || 0))}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-7 pr-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used only to estimate a down payment if you exceed remaining $0-down capacity.
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-teal/5 border border-teal/20">
                <Info className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Confirm remaining entitlement on your Certificate of Eligibility. This is an educational
                  estimate using 25% of the county conforming limit minus 25% of an outstanding VA balance.
                  Lender approval and property eligibility still apply.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="bg-navy px-6 py-4">
                  <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">
                    2026 estimate · {county.name}
                  </p>
                  <p className="text-white font-display text-2xl">
                    {result.fullEntitlement ? "Full entitlement" : "Reduced entitlement"}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {result.fullEntitlement ? (
                    <p className="text-muted-foreground leading-relaxed">
                      With <strong className="text-navy">full entitlement</strong>, there is no VA loan
                      limit for a $0-down purchase — you can buy at whatever price a lender will approve.
                      The county conforming limit of{" "}
                      <strong className="text-navy">{fmt(result.countyLimit)}</strong> does not cap a
                      full-entitlement $0-down loan.
                    </p>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      With reduced entitlement, remaining $0-down capacity is based on the county
                      conforming limit minus your outstanding VA loan balance.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-sand/40 rounded-lg p-4">
                      <p className="text-xs text-navy/50 font-body">County conforming limit</p>
                      <p className="text-xl font-display text-navy tabular-nums">{fmt(result.countyLimit)}</p>
                    </div>
                    <div className="bg-sand/40 rounded-lg p-4">
                      <p className="text-xs text-navy/50 font-body">VA maximum guaranty (25%)</p>
                      <p className="text-xl font-display text-navy tabular-nums">{fmt(result.maxGuaranty)}</p>
                    </div>
                    <div className="bg-sand/40 rounded-lg p-4">
                      <p className="text-xs text-navy/50 font-body">Remaining entitlement</p>
                      <p className="text-xl font-display text-navy tabular-nums">
                        {result.fullEntitlement ? "Full" : fmt(result.remainingEntitlement)}
                      </p>
                    </div>
                    <div className="bg-teal/5 rounded-lg p-4 border border-teal/20">
                      <p className="text-xs text-navy/50 font-body">Est. $0-down capacity</p>
                      <p className="text-xl font-display text-teal tabular-nums">
                        {result.fullEntitlement ? "No VA cap" : fmt(result.zeroDownCapacity)}
                      </p>
                    </div>
                  </div>

                  {purchasePrice > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-navy font-body font-medium mb-1">
                        At a {fmt(purchasePrice)} purchase price
                      </p>
                      {result.fullEntitlement || result.downPayment <= 0 ? (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Estimated down payment from remaining entitlement math:{" "}
                          <strong className="text-navy">$0</strong>. You still need lender approval based
                          on income, credit, residual income, and the property. Lenders may set their own
                          $0-down caps.
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Estimated down payment on the amount above remaining $0-down capacity:{" "}
                          <strong className="text-navy">{fmt(result.downPayment)}</strong> (25% of the
                          difference). Not a commitment to lend.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-teal/5 px-6 py-3 border-t border-teal/20">
                  <p className="text-xs text-navy/60 leading-relaxed">
                    <strong className="text-navy/80">Honolulu County 2026 (1-unit):</strong>{" "}
                    {fmt(HONOLULU_CONFORMING_LIMIT_2026)}. Full entitlement = no VA loan-limit cap. Jay
                    Miller, NMLS #{LENDER.nmls}.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/military-calculator"
                  className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-3 rounded-md font-body font-semibold text-sm"
                >
                  Military Buying Power Calculator <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={BOOK.pageUrl}
                  className="inline-flex items-center justify-center gap-2 border border-border hover:border-teal text-navy px-5 py-3 rounded-md font-body font-semibold text-sm"
                >
                  Read the full playbook
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-10 leading-relaxed max-w-3xl">
            <Shield className="w-3.5 h-3.5 inline mr-1 text-teal" />
            Equal Housing Lender. Educational content, not a commitment to lend. All loans subject to
            credit approval and property eligibility. Approvals are not guaranteed. $0-down VA purchases
            require full entitlement (or remaining capacity) and lender approval. NMLS Consumer Access:{" "}
            <a
              href="https://www.nmlsconsumeraccess.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              nmlsconsumeraccess.org
            </a>
            .
          </p>
        </div>
      </section>

      <ContactActions
        variant="full"
        background="sand"
        headline="Want this run on your Certificate of Eligibility?"
        subtext={`Jay Miller, NMLS #${LENDER.nmls}, can confirm remaining entitlement and lender $0-down caps for a Hawaii VA purchase.`}
        preApprovalLabel="Start Your Pre-Approval"
      />
    </Layout>
  );
}
