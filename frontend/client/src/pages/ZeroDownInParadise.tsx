/*
 * Pacific Modernism — Zero Down in Paradise hub
 * Answer-first Hawaii VA playbook page: Book + Person + FAQPage schema,
 * Jay-approved copy (2026-09-06), canonical KB/tool URLs.
 */
import type { ReactNode } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import { BOOK } from "@/lib/book";
import {
  HONOLULU_CONFORMING_LIMIT_2026,
  IMAGES,
  IMAGE_ALTS,
  LENDER,
  SITE,
} from "@/lib/constants";
import condoData from "@/data/va-approved-condos-oahu.json";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle,
  ExternalLink,
  FileText,
  Home as HomeIcon,
  KeyRound,
  Landmark,
  Mail,
  MapPin,
  Medal,
  Phone,
  Shield,
} from "lucide-react";

const HONOLULU_LIMIT = HONOLULU_CONFORMING_LIMIT_2026.toLocaleString("en-US");
const CONDO_COUNT = condoData.totalApproved.toLocaleString("en-US");

const PERSON_ID = `${SITE.url}/#jaymiller`;
const ORG_ID = `${SITE.url}/#business`;
const LINKEDIN = "https://www.linkedin.com/in/jay-miller-534bb5173/";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Zero Down in Paradise?",
    a: "Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers is a 164-page paperback (July 2026, ISBN 979-8-9963553-0-3) by Jay Miller that explains how to buy a home in Hawaii using a VA loan.",
  },
  {
    q: "Who is Jay Miller (NMLS #657301)?",
    a: "Jay Miller is a U.S. Army veteran and Mortgage Loan Consultant / Sales Manager at CMG Home Loans in Honolulu with 25+ years of Hawaii lending experience. He is a Certified Mortgage Advisor (CMA) and the author of Zero Down in Paradise.",
  },
  {
    q: "Can I use a VA loan to buy in Hawaii with zero down?",
    a: "Yes, if you are eligible and have full entitlement, and you meet lender credit, income, and property requirements. There is no PMI on VA loans. Lender maximums for $0-down amounts may still apply.",
  },
  {
    q: "Is there a VA loan limit in Hawaii?",
    a: `With full entitlement, no VA loan limit for $0 down. With reduced entitlement, county conforming limits apply. Honolulu County's 2026 single-family conforming limit is $${HONOLULU_LIMIT}.`,
  },
  {
    q: "Are Hawaii condos VA-approved?",
    a: "Not automatically. Many Hawaii condos are VA-approved, but you must verify the specific project before writing an offer. Use RealityCents' VA condo tools and have your lender confirm.",
  },
  {
    q: "Can VA loans be used on Hawaii leasehold property?",
    a: "Often yes, if the remaining lease term meets VA requirements (commonly at least 14 years beyond loan maturity). Always confirm with your lender on the specific lease.",
  },
  {
    q: "Does BAH count as income for a Hawaii VA loan?",
    a: "Yes. Basic Allowance for Housing typically counts toward qualification. Hawaii BAH is among the highest in the country, which can materially increase buying power — estimate with the Military Buying Power Calculator.",
  },
  {
    q: "What is the VA funding fee, and who is exempt?",
    a: "The VA funding fee is a one-time fee (often financeable) in place of PMI. First-use $0-down purchasers commonly pay a percentage of the loan amount; veterans receiving VA disability compensation are generally exempt. See the book and Veterans Guide for current percentages and exceptions.",
  },
  {
    q: "Where can I buy Zero Down in Paradise?",
    a: `On Amazon (ASIN ${BOOK.asin}).`,
  },
  {
    q: "How is this different from generic VA loan guides?",
    a: "It is written for Hawaii: high-cost entitlement math, BAH/COLA, VA condos, leasehold, J-1, local tax exemptions, and island closing realities — by a Hawaii-based VA lender who is also a veteran.",
  },
  {
    q: "What free tools does RealityCents offer for VA buyers?",
    a: "VA remaining eligibility calculator, military buying power calculator, VA condo lookup, Pearl Harbor and Schofield VA pages, and a full Veterans Guide plus related knowledge-base articles on house hacking, assumable VA loans, and funding-fee tax treatment.",
  },
  {
    q: "How do I get started with a Hawaii VA loan?",
    a: "1) Get your Certificate of Eligibility (COE). 2) Get pre-approved with a VA-experienced Hawaii lender. 3) Work with an agent who understands military / PCS timelines. 4) Verify condo approval and leasehold terms before you commit. Call (808) 429-0811 or start with the Veterans Guide.",
  },
];

const TOPICS = [
  {
    icon: KeyRound,
    title: "Full entitlement and loan limits",
    description:
      "How $0-down works even in Honolulu's high-cost market, and what changes when entitlement is reduced.",
  },
  {
    icon: Calculator,
    title: "BAH and COLA as buying power",
    description: "How military allowances factor into qualification in Hawaii.",
  },
  {
    icon: Landmark,
    title: "VA condo approval",
    description: "Why you verify the project before you fall in love with the unit.",
  },
  {
    icon: FileText,
    title: "Leasehold vs fee simple",
    description: "Remaining lease term rules that can make or break a VA loan.",
  },
  {
    icon: CheckCircle,
    title: "J-1 inspection contingency",
    description: "Hawaii-specific contract timing buyers need to respect.",
  },
  {
    icon: HomeIcon,
    title: "Property tax exemptions",
    description: "Filings every Hawaii buyer should know about.",
  },
  {
    icon: Shield,
    title: "IRRRL, cash-out, and assumable strategies",
    description: "Ways VA financing can support long-term wealth, not just the first purchase.",
  },
  {
    icon: BookOpen,
    title: "2026 VA funding fee tax deduction",
    description: "A rule many borrowers never hear from their lender.",
  },
  {
    icon: Medal,
    title: "Closing-table stories",
    description: "What works, what fails, and how to avoid expensive mistakes.",
  },
];

const TOOLS = [
  {
    href: "/va-eligibility-calculator",
    title: "VA Remaining Eligibility Calculator",
    note: `Estimate remaining $0-down capacity using Honolulu County's 2026 conforming limit of $${HONOLULU_LIMIT}.`,
  },
  {
    href: "/military-calculator",
    title: "Military Buying Power Calculator",
    note: "BAH, BAS, COLA, and qualifying income framing.",
  },
  {
    href: "/va-approved-condos-oahu",
    title: "VA Condo Lookup",
    note: `Search ${CONDO_COUNT}+ VA-approved condo projects on Oahu.`,
  },
  {
    href: "/knowledge-base/va-loans-hawaii-military",
    title: "VA Loans in Hawaii guide",
    note: "Free web companion to the book.",
  },
  {
    href: "/va-loan-pearl-harbor-hickam",
    title: "VA loan — Pearl Harbor / Hickam",
    note: "Base-area buying for Joint Base Pearl Harbor-Hickam.",
  },
  {
    href: "/va-loan-schofield-barracks",
    title: "VA loan — Schofield Barracks",
    note: "Base-area buying for the 25th Infantry Division.",
  },
  {
    href: "/knowledge-base/va-loan-house-hacking-hawaii",
    title: "VA loan house hacking in Hawaii",
    note: "Duplex/fourplex math with VA.",
  },
  {
    href: "/knowledge-base/va-assumable-loans-pros-cons",
    title: "VA assumable loans",
    note: "Inheriting a below-market VA rate.",
  },
  {
    href: "/knowledge-base/va-funding-fee-tax-deductible",
    title: "Is the VA funding fee tax deductible?",
    note: "2026 tax treatment of the funding fee.",
  },
];

const PAGE_SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${SITE.url}${BOOK.pageUrl}#book`,
    name: BOOK.fullTitle,
    alternateName: BOOK.title,
    author: { "@id": PERSON_ID },
    isbn: BOOK.isbn,
    numberOfPages: BOOK.pages,
    bookFormat: "https://schema.org/Paperback",
    datePublished: BOOK.datePublished,
    dateModified: BOOK.lastUpdatedIso,
    inLanguage: "en-US",
    image: BOOK.cover,
    url: `${SITE.url}${BOOK.pageUrl}`,
    publisher: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      url: BOOK.amazonUrl,
      priceCurrency: "USD",
      price: "19.99",
      availability: "https://schema.org/InStock",
    },
    about: [
      { "@type": "Thing", name: "VA loans" },
      { "@type": "Thing", name: "Hawaii real estate" },
      { "@type": "Thing", name: "Military homebuying" },
    ],
    sameAs: BOOK.amazonUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Jay Miller",
    jobTitle: "Sales Manager & Mortgage Loan Consultant",
    description:
      "U.S. Army veteran and Certified Mortgage Advisor. VA loan specialist with 25 years of mortgage experience in Honolulu. NMLS #657301.",
    url: `${SITE.url}/about`,
    image: IMAGES.headshot,
    identifier: {
      "@type": "PropertyValue",
      name: "NMLS",
      value: LENDER.nmls,
    },
    worksFor: {
      "@type": "Organization",
      name: LENDER.company,
      address: {
        "@type": "PostalAddress",
        streetAddress: LENDER.address.street,
        addressLocality: LENDER.address.city,
        addressRegion: LENDER.address.state,
        postalCode: LENDER.address.zip,
        addressCountry: "US",
      },
    },
    sameAs: [SITE.url, LINKEDIN, "https://www.instagram.com/jaymillercmg"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: `${SITE.url}/favicon-180x180.png`, width: 300, height: 60 },
    founder: { "@id": PERSON_ID },
    sameAs: [LINKEDIN, "https://www.instagram.com/jaymillercmg"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE.url}${BOOK.pageUrl}#faq`,
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: BOOK.title, item: `${SITE.url}${BOOK.pageUrl}` },
    ],
  },
];

function AmazonButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <a
      href={BOOK.amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default function ZeroDownInParadise() {
  return (
    <Layout>
      <SEO
        title="Zero Down in Paradise: Hawaii VA Loan Playbook | Jay Miller"
        description="Hawaii VA loan playbook by Army veteran & NMLS #657301 lender Jay Miller. Zero-down buying, condos, leasehold, BAH, funding fee — plus free RealityCents tools."
        url={BOOK.pageUrl}
        image={BOOK.cover}
        imageAlt={`${BOOK.fullTitle} — book cover`}
        keywords="Zero Down in Paradise book, Hawaii VA loan playbook, Jay Miller NMLS 657301, VA loan Hawaii zero down, military homebuying Hawaii, VA condo Hawaii, BAH Hawaii VA loan"
        schema={PAGE_SCHEMAS}
      />

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.heroZeroDown}
            alt={IMAGE_ALTS.heroZeroDown}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/82 to-navy/60" />
        </div>

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal-light mb-3">
                <BookOpen className="w-4 h-4" />
                Hawaii VA Playbook
              </span>
              <div className="w-16 h-0.5 bg-teal mb-6" aria-hidden="true" />
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-[1.08]">
                Zero Down in Paradise
                <span className="block text-xl sm:text-2xl lg:text-3xl text-sand/90 font-display mt-3 leading-snug">
                  The Hawaii VA Loan Playbook for Military Homebuyers
                </span>
              </h1>
              <p className="text-base lg:text-lg text-teal-light font-body font-medium mb-6">
                By Jay Miller — U.S. Army veteran · NMLS #{LENDER.nmls} · {LENDER.company}, Honolulu
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <AmazonButton className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40 hover:scale-105 ring-2 ring-gold/50">
                  Get It on Amazon <ArrowRight className="w-5 h-5" />
                </AmazonButton>
                <Link
                  href="/knowledge-base/va-loans-hawaii-military"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all backdrop-blur-sm border border-white/20"
                >
                  Read the Free Veterans Guide
                </Link>
              </div>
              <p className="text-xs text-sand/50 mt-4">
                Paperback · {BOOK.pages} pages · ISBN {BOOK.isbn}
              </p>
            </div>

            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <a
                href={BOOK.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${BOOK.fullTitle} on Amazon`}
                className="block"
              >
                <img
                  src={BOOK.cover}
                  alt={`${BOOK.fullTitle} — book cover`}
                  className="w-56 sm:w-64 lg:w-80 rounded-lg shadow-2xl shadow-black/50 ring-1 ring-white/10 hover:scale-[1.02] transition-transform duration-500"
                  loading="eager"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BYLINE ===== */}
      <section className="bg-sand/60 border-b border-border">
        <div className="container py-6">
          <p className="text-sm text-navy font-body font-medium">
            Jay Miller, CMA · NMLS #{LENDER.nmls} · U.S. Army veteran · Sales Manager, {LENDER.company} · 25 years Hawaii mortgage experience
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Published {BOOK.published} · Paperback, {BOOK.pages} pages · ISBN {BOOK.isbn}
            {" · "}
            <a
              href={BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal font-semibold hover:underline"
            >
              Get it on Amazon
            </a>
            {" · "}
            Last updated: {BOOK.lastUpdated}
          </p>
        </div>
      </section>

      {/* ===== WHAT IS ===== */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-6">
            What is Zero Down in Paradise?
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <em>Zero Down in Paradise</em> is Jay Miller’s Hawaii-specific VA loan playbook for military
              homebuyers ({BOOK.pages} pages, {BOOK.published}, ISBN {BOOK.isbn}).
            </p>
            <p>
              Hawaii is one of the most expensive housing markets in America. For service members arriving
              on PCS orders to Joint Base Pearl Harbor-Hickam, Schofield Barracks, Marine Corps Base Hawaii,
              or other installations across the islands, the sticker shock is real. This book is the field
              guide to using your VA benefit in that market — written by a 25-year Hawaii lender and Army
              veteran who has helped hundreds of military families close VA loans here.
            </p>
            <p>
              It is not a generic mainland VA pamphlet. It covers entitlement and loan limits in a high-cost
              county, BAH and COLA as purchasing power, VA condo approval, leasehold vs fee simple, the J-1
              inspection contingency, property tax exemptions, IRRRL and assumable strategies, and the
              funding-fee rules most buyers only hear about at the closing table.
            </p>
          </div>
          <AmazonButton className="inline-flex items-center gap-2 mt-8 text-teal font-body font-semibold hover:underline">
            Get Zero Down in Paradise on Amazon <ExternalLink className="w-4 h-4" />
          </AmazonButton>
        </div>
      </section>

      {/* ===== ZERO DOWN ===== */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-6">
            Can you buy a home in Hawaii with a VA loan and zero down?
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-navy">Yes.</strong> Eligible veterans and active-duty service members
              with full VA entitlement can purchase a primary residence in Hawaii with $0 down and no PMI.
              You still need lender approval based on income, credit, residual income, and the property.
            </p>
            <p>
              That $0-down benefit is especially powerful in Hawaii, where a conventional 20% down payment
              on an $800,000 home is $160,000. VA financing removes that cash hurdle when you qualify and
              have full entitlement. Many lenders still set their own maximum loan amount for $0-down VA
              purchases — ask your lender what their cap is.
            </p>
            <p>
              For the full walkthrough, see the free companion guide:{" "}
              <Link
                href="/knowledge-base/va-loans-hawaii-military"
                className="text-teal font-semibold hover:underline"
              >
                VA Loans in Hawaii: A Complete Guide for Military Homebuyers
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ===== LOAN LIMIT ===== */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-6">
            Is there a VA loan limit in Hawaii?
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-navy">
                With full entitlement, there is no VA loan limit for a $0-down purchase
              </strong>{" "}
              — you can buy at whatever price a lender will approve. With <em>reduced</em> entitlement (for
              example, an existing VA loan still outstanding), county conforming limits apply. For Honolulu
              County, the 2026 single-family conforming limit referenced in our Veterans Guide is{" "}
              <strong className="text-navy">${HONOLULU_LIMIT}</strong>; always confirm the current FHFA/VA
              figures for the county where you are buying.
            </p>
            <p>
              If you are unsure how much entitlement you have left, use the{" "}
              <Link href="/va-eligibility-calculator" className="text-teal font-semibold hover:underline">
                VA Remaining Eligibility Calculator
              </Link>{" "}
              and read the entitlement section of the{" "}
              <Link
                href="/knowledge-base/va-loans-hawaii-military"
                className="text-teal font-semibold hover:underline"
              >
                Veterans Guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHAT'S INSIDE ===== */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-10 text-center">
            What’s inside the book?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOPICS.map((t) => (
              <div key={t.title} className="bg-white rounded-xl p-6 border border-border">
                <div className="w-11 h-11 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <t.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-lg text-navy mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO SHOULD READ ===== */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-6">
            Who should read Zero Down in Paradise?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            <strong className="text-navy">
              This book is for military buyers navigating Hawaii — PCS arrivals, veterans, and Reserve
              members with VA eligibility — not for generic mainland first-time buyers.
            </strong>
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              Active-duty service members PCSing to Oahu, Maui, Kauai, or the Big Island
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              Veterans and Reserve members using or restoring VA entitlement
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              First-time military buyers — from an E-5 condo purchase to an O-4 single-family home in places like Mililani
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              Veterans returning to the islands years after their last assignment
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-6">
            If you want the free web overview first, start with the{" "}
            <Link
              href="/knowledge-base/va-loans-hawaii-military"
              className="text-teal font-semibold hover:underline"
            >
              Veterans Guide
            </Link>
            . If you want the full playbook in hand, get the book.
          </p>
        </div>
      </section>

      {/* ===== TOOLS ===== */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-3 text-center">
            Hawaii VA tools that pair with the book
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Use these free RealityCents tools alongside the playbook. The remaining-eligibility
            calculator uses Honolulu County’s 2026 single-family conforming limit of ${HONOLULU_LIMIT}
            when entitlement is reduced.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left font-body font-semibold">Tool</th>
                  <th className="px-4 py-3 text-left font-body font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((tool) => (
                  <tr key={tool.href} className="border-t border-border">
                    <td className="px-4 py-3 font-body font-semibold text-navy whitespace-nowrap">
                      <Link href={tool.href} className="text-teal hover:underline">
                        {tool.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{tool.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== ABOUT THE AUTHOR ===== */}
      <section className="bg-navy py-16 lg:py-24 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <img
                src={IMAGES.headshot}
                alt="Jay Miller — author of Zero Down in Paradise"
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl object-cover object-top shadow-lg border-2 border-gold/30 shrink-0"
              />
              <div className="text-center sm:text-left">
                <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-2">
                  About the author
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-4">Jay Miller</h2>
                <p className="text-sand/70 leading-relaxed mb-4">
                  <strong className="text-white">Jay Miller</strong> is a Sales Manager and Mortgage Loan
                  Consultant at {LENDER.company} in Honolulu, Hawaii (NMLS #{LENDER.nmls} · Branch NMLS #
                  {LENDER.branchNmls}). He is a U.S. Army veteran, Certified Mortgage Advisor (CMA), and a
                  25-year Hawaii lending veteran specializing in VA loans, conventional and jumbo
                  financing, and the island-specific issues that trip up mainland playbooks — leasehold,
                  condo approval, and high-cost qualification.
                </p>
                <p className="text-sand/70 leading-relaxed mb-6">
                  He created{" "}
                  <a href={SITE.url} className="text-teal-light hover:underline">
                    RealityCents
                  </a>{" "}
                  to give military and civilian buyers clear mortgage education without pressure.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-sand/80">
                  <li className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-4 h-4 text-teal" />
                    <a href={`tel:${LENDER.phone}`} className="hover:text-gold">
                      {LENDER.phone}
                    </a>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4 text-teal" />
                    <a href={`mailto:${LENDER.email}`} className="hover:text-gold">
                      {LENDER.email}
                    </a>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-4 h-4 text-teal" />
                    {LENDER.address.full}
                  </li>
                </ul>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-md font-body font-semibold text-sm transition-all"
                >
                  About Jay Miller <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 lg:py-20" id="faq">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-10">FAQ</h2>
          <dl className="divide-y divide-border border-y border-border">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-5">
                <dt>
                  <h3 className="font-display text-lg text-navy">{faq.q}</h3>
                </dt>
                <dd className="mt-2 text-muted-foreground leading-relaxed text-[15px]">
                  {faq.q === "Where can I buy Zero Down in Paradise?" ? (
                    <>
                      On{" "}
                      <a
                        href={BOOK.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal font-semibold hover:underline"
                      >
                        Amazon
                      </a>{" "}
                      (ASIN {BOOK.asin}).
                    </>
                  ) : faq.q === "Does BAH count as income for a Hawaii VA loan?" ? (
                    <>
                      Yes. Basic Allowance for Housing typically counts toward qualification. Hawaii BAH is
                      among the highest in the country, which can materially increase buying power —
                      estimate with the{" "}
                      <Link href="/military-calculator" className="text-teal font-semibold hover:underline">
                        Military Buying Power Calculator
                      </Link>
                      .
                    </>
                  ) : faq.q === "Are Hawaii condos VA-approved?" ? (
                    <>
                      Not automatically. Many Hawaii condos are VA-approved, but you must verify the
                      specific project before writing an offer. Use RealityCents’{" "}
                      <Link
                        href="/va-approved-condos-oahu"
                        className="text-teal font-semibold hover:underline"
                      >
                        VA condo lookup
                      </Link>{" "}
                      and have your lender confirm.
                    </>
                  ) : faq.q === "How do I get started with a Hawaii VA loan?" ? (
                    <>
                      1) Get your Certificate of Eligibility (COE). 2) Get pre-approved with a
                      VA-experienced Hawaii lender. 3) Work with an agent who understands military / PCS
                      timelines. 4) Verify condo approval and leasehold terms before you commit. Call{" "}
                      {LENDER.phone} or start with the{" "}
                      <Link
                        href="/knowledge-base/va-loans-hawaii-military"
                        className="text-teal font-semibold hover:underline"
                      >
                        Veterans Guide
                      </Link>
                      .
                    </>
                  ) : faq.q === "What free tools does RealityCents offer for VA buyers?" ? (
                    <>
                      <Link href="/va-eligibility-calculator" className="text-teal font-semibold hover:underline">
                        VA remaining eligibility calculator
                      </Link>
                      ,{" "}
                      <Link href="/military-calculator" className="text-teal font-semibold hover:underline">
                        military buying power calculator
                      </Link>
                      ,{" "}
                      <Link href="/va-approved-condos-oahu" className="text-teal font-semibold hover:underline">
                        VA condo lookup
                      </Link>
                      , and a full{" "}
                      <Link
                        href="/knowledge-base/va-loans-hawaii-military"
                        className="text-teal font-semibold hover:underline"
                      >
                        Veterans Guide
                      </Link>{" "}
                      plus related knowledge-base articles on house hacking, assumable VA loans, and
                      funding-fee tax treatment.
                    </>
                  ) : (
                    faq.a
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== GET THE PLAYBOOK ===== */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-6">Get the playbook</h2>
          <AmazonButton className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40">
            Buy Zero Down in Paradise on Amazon <ArrowRight className="w-5 h-5" />
          </AmazonButton>
          <p className="text-sm text-muted-foreground mt-6">
            Questions about a Hawaii VA purchase? Jay Miller, NMLS #{LENDER.nmls} · {LENDER.phone} ·{" "}
            {LENDER.email}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-6 leading-relaxed max-w-2xl mx-auto">
            Equal Housing Lender. This is educational content, not a commitment to lend. All loans subject
            to credit approval and property eligibility. Approvals are not guaranteed. $0-down VA
            purchases require full entitlement and lender approval. NMLS Consumer Access:{" "}
            <a
              href="https://www.nmlsconsumeraccess.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-navy"
            >
              nmlsconsumeraccess.org
            </a>
            .
          </p>
        </div>
      </section>

      <ContactActions
        variant="full"
        background="navy"
        headline="Questions About Your VA Eligibility?"
        subtext="Reach out to Jay Miller for a no-pressure conversation about your zero-down options in Hawaii. NMLS #657301."
        preApprovalLabel="Start Your Pre-Approval"
      />
    </Layout>
  );
}
