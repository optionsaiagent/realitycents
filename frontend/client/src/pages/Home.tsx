/*
 * Pacific Modernism — Home Page
 * Panoramic hero with gradient overlay, feature cards with frosted glass,
 * staggered layout sections, gold accent details
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import WaveDivider from "@/components/WaveDivider";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import { getFeaturedArticles } from "@/lib/articles";
import { BOOK } from "@/lib/book";
import {
  Calculator,
  BookOpen,
  Users,
  MapPin,
  ArrowRight,
  Shield,
  Star,
  Home as HomeIcon,
  ChevronRight,
  FileText,
  Handshake,
  FileCheck,
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Mortgage Calculator",
    description: "Advanced calculator with amortization schedules, payment breakdowns, and scenario comparisons.",
    href: "/calculator",
    color: "bg-teal/10 text-teal",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Expert articles on Hawaii mortgages, loan types, credit tips, and the homebuying process.",
    href: "/knowledge-base",
    color: "bg-gold/10 text-gold",
  },
  {
    icon: FileText,
    title: "Homebuying Guide",
    description: "Free comprehensive guide to buying a home in Hawaii — from pre-approval to closing day.",
    href: "/guide",
    color: "bg-teal/10 text-teal-dark",
  },
  {
    icon: Handshake,
    title: "Agent Partnership",
    description: "Exclusive partnership program for Hawaii real estate agents.",
    href: "/contact",
    color: "bg-gold/10 text-gold",
  },
];



const loanTypes = [
  { name: "Conventional", desc: "Traditional financing with competitive rates for qualified borrowers" },
  { name: "FHA", desc: "Government-backed loans with lower down payment requirements" },
  { name: "VA", desc: "Exclusive benefits for veterans and active military in Hawaii" },
  { name: "Jumbo", desc: "Financing for Hawaii's premium properties above conforming limits" },
  { name: "USDA", desc: "100% financing for eligible rural Hawaii properties" },
  { name: "HHFDC Programs", desc: "Hawaii-specific down payment assistance and affordable mortgage programs" },
];

export default function Home() {

  return (
    <Layout>
      <SEO
        title="Hawaii Mortgage Education & Lending"
        description="Hawaii's trusted mortgage resource. Jay Miller, NMLS #657301, CMG Home Loans — expert mortgage guidance, free homebuying guide, mortgage calculator, and 25+ years of Hawaii real estate expertise. Serving Oahu, Maui, Kauai, and the Big Island."
        url="/"
        keywords="Hawaii mortgage, Hawaii home loans, mortgage lender Honolulu, Jay Miller mortgage, CMG Home Loans Hawaii, FHA loans Hawaii, VA loans Hawaii, first time homebuyer Hawaii, Hawaii mortgage calculator, Oahu home loans"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the conforming loan limit in Hawaii?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Hawaii is a high-cost state. For 2026, the conforming loan limit for a single-family home in Honolulu County is $1,249,125 — significantly higher than the national baseline of $806,500. Loans above this limit are considered jumbo loans and require different qualification standards."
              }
            },
            {
              "@type": "Question",
              "name": "What is the minimum down payment for a home in Hawaii?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Down payment requirements vary by loan type. VA loans (for eligible veterans and military) require 0% down. FHA loans require 3.5% down with a 580+ credit score. Conventional loans can go as low as 3% down for first-time buyers. Jumbo loans typically require 10–20% down. There are also 0% down portfolio loan options available up to $998,000 for buyers who meet certain requirements — contact Jay for details."
              }
            },
            {
              "@type": "Question",
              "name": "What is a leasehold property in Hawaii and can I get a mortgage on one?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A leasehold property means you own the structure but lease the land from a landowner (often the Bishop Estate or other large landowners). Mortgages on leasehold properties are available but have additional requirements. For conventional loans, lenders require at least 5 years remaining on the lease term after the loan term expires — meaning a 30-year loan requires at least 35 years remaining on the lease. Some lenders restrict leasehold financing entirely. Fee simple (owning both land and structure) is generally preferred by lenders."
              }
            },
            {
              "@type": "Question",
              "name": "How long does mortgage pre-approval take in Hawaii?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A standard pre-approval typically takes 1 business day once all required documents are received. Required documents include pay stubs, W-2s, tax returns, bank statements, and a government-issued ID. A fully underwritten pre-approval (TBD approval) takes longer but provides stronger negotiating power in Hawaii's competitive market."
              }
            },
            {
              "@type": "Question",
              "name": "What are typical closing costs in Hawaii?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Closing costs in Hawaii typically range from 1.5–2% of the purchase price. Buyers pay lender fees, title insurance, escrow fees, prepaid interest, and property tax impounds. On an $800,000 purchase, expect approximately $12,000–$16,000 in total closing costs."
              }
            },
            {
              "@type": "Question",
              "name": "Can I use a VA loan to buy a condo in Hawaii?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, VA loans can be used to purchase condos in Hawaii, but the condo project must be VA-approved. The VA maintains a list of approved condo projects. Many Honolulu condo buildings are VA-approved, but it's important to verify approval status before making an offer. Your lender can check VA approval status and help navigate the process."
              }
            }
          ]
        }}
      />
      {/* ===== HERO ===== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.heroHome}
            alt="Honolulu coastline aerial view"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-transparent" />
        </div>

        <div className="container relative z-10 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Hawaii's Trusted Mortgage Resource
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-[1.1]">
              Your Path to<br />
              <span className="text-teal-light">Homeownership</span><br />
              in Paradise
            </h1>
            <p className="text-lg md:text-xl text-sand/80 leading-relaxed mb-8 max-w-lg">
              Expert mortgage guidance, powerful tools, and personalized service to help you navigate Hawaii's unique real estate market.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={PRE_APPROVAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40 hover:scale-105 ring-2 ring-gold/50"
              >
                <FileCheck className="w-5 h-5" />
                Start Your Pre-Approval
              </a>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all hover:shadow-lg hover:shadow-teal/25"
              >
                <Calculator className="w-4 h-4" />
                Calculate Your Payment
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all backdrop-blur-sm border border-white/20"
              >
                Free Guide
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warm-white to-transparent" />
      </section>



      {/* ===== FEATURES ===== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <SectionHeading
            label="What We Offer"
            title="Everything You Need to Buy a Home in Hawaii"
            description="From your first mortgage calculation to closing day, we provide the tools, knowledge, and personal guidance to make your Hawaii homeownership dream a reality."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-6 lg:p-8 rounded-xl border border-border bg-card hover:shadow-lg hover:shadow-navy/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl text-navy mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-body font-semibold text-teal group-hover:gap-2.5 transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="bg-navy py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <img src={IMAGES.heroAbout} alt="Jay Miller, Hawaii Mortgage Loan Originator, CMG Home Loans" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-5 mb-6">
                <img
                  src={IMAGES.headshot}
                  alt="Jay Miller"
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover object-top shadow-lg border-2 border-gold/30 shrink-0"
                />
                <div>
                  <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-1">
                    Meet Your Lender
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-white">
                    Jay Miller
                  </h2>
                  <p className="text-sm text-sand/60">{LENDER.experience} Years in Hawaii Mortgages</p>
                </div>
              </div>
              <p className="text-sand/70 leading-relaxed mb-6">
                With 25 years of experience in Hawaii's real estate and mortgage industry, I'm passionate about helping clients confidently achieve their homeownership dreams. Known for being responsive, accessible, and proactive, I work closely with both clients and Realtors to create a smooth, seamless experience from application to closing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-teal" />
                  <span className="text-sm text-sand/80">NMLS #{LENDER.nmls}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gold" />
                  <span className="text-sm text-sand/80">Top-Rated Lender</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-teal" />
                  <span className="text-sm text-sand/80">Honolulu, HI</span>
                </div>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-md font-body font-semibold text-sm transition-all"
              >
                About Jay Miller
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {loanTypes.map((loan) => (
                  <div key={loan.name} className="glass-dark rounded-lg p-4">
                    <h4 className="font-display text-white text-base mb-1">{loan.name}</h4>
                    <p className="text-xs text-sand/60 leading-relaxed">{loan.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOOK BANNER — Zero Down in Paradise ===== */}
      <section className="bg-navy py-16 lg:py-20 relative overflow-hidden border-t border-white/5">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Cover */}
            <a
              href={BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${BOOK.fullTitle} on Amazon`}
              className="shrink-0"
            >
              <img
                src={BOOK.cover}
                alt={`${BOOK.fullTitle} — book cover`}
                className="w-44 sm:w-52 lg:w-56 rounded-lg shadow-2xl shadow-black/50 ring-1 ring-white/10 hover:scale-[1.03] transition-transform duration-500"
                loading="lazy"
              />
            </a>

            {/* Copy */}
            <div className="text-center lg:text-left max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-3">
                <BookOpen className="w-4 h-4" />
                New Book by Jay Miller
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-3 leading-tight">
                Zero Down in Paradise
              </h2>
              <p className="text-teal-light font-body font-medium mb-4">
                {BOOK.subtitle}
              </p>
              <p className="text-sand/70 leading-relaxed mb-7">
                The definitive guide to buying a home in Hawaii with your VA loan — entitlement, BAH,
                condo approvals, leasehold vs. fee simple, and every zero-down strategy that actually
                works in the islands. Written from 25 years at the closing table.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                <a
                  href={BOOK.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-7 py-3.5 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40 hover:scale-105"
                >
                  Get It on Amazon <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href={BOOK.pageUrl}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all backdrop-blur-sm border border-white/20"
                >
                  About the Book <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED ARTICLES — curated must-reads ===== */}
      {(() => {
        const featuredArticles = getFeaturedArticles();
        return (
          <section className="py-20 lg:py-28 bg-sand">
            <div className="container">
              <SectionHeading
                label="Featured Articles"
                title="Must-Reads for Hawaii Buyers"
                description="Stay informed about the issues and strategies shaping Hawaii's real estate market right now."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/knowledge-base/${article.slug}`}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="relative h-48 lg:h-56 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-gold text-navy px-3 py-1 rounded-full text-xs font-body font-bold uppercase tracking-wide">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-2">
                        {article.category} &middot; {article.readTime}
                      </span>
                      <h3 className="font-display text-lg lg:text-xl text-navy mb-2 group-hover:text-teal transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-body font-semibold text-teal group-hover:gap-3 transition-all mt-auto">
                        Read Full Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  href="/knowledge-base"
                  className="inline-flex items-center gap-2 bg-white hover:bg-white/80 text-navy px-6 py-3 rounded-md font-body font-semibold text-sm transition-all border border-navy/10 shadow-sm hover:shadow-md"
                >
                  Browse All Articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Homebuyers CTA */}
            <div className="relative rounded-xl overflow-hidden group">
              <img
                src={IMAGES.heroGuide}
                alt="Hawaii coastline"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/60 to-navy/30" />
              <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-end min-h-[320px]">
                <div className="flex items-center gap-2 mb-3">
                  <HomeIcon className="w-5 h-5 text-gold" />
                  <span className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold">For Homebuyers</span>
                </div>
                <h3 className="font-display text-2xl lg:text-3xl text-white mb-3">
                  Start Your Hawaii Homebuying Journey
                </h3>
                <p className="text-sand/70 text-sm mb-5 max-w-md">
                  Download our free comprehensive guide and get the knowledge you need to navigate Hawaii's unique real estate market.
                </p>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-md font-body font-semibold text-sm transition-all self-start"
                >
                  Get Free Guide <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Agents CTA */}
            <div className="relative rounded-xl overflow-hidden group">
              <img
                src={IMAGES.heroAgents}
                alt="Professional meeting"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/60 to-navy/30" />
              <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-end min-h-[320px]">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-gold" />
                  <span className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold">For Real Estate Agents</span>
                </div>
                <h3 className="font-display text-2xl lg:text-3xl text-white mb-3">
                  Partner With a Trusted Lender
                </h3>
                <p className="text-sand/70 text-sm mb-5 max-w-md">
                  Access our exclusive agent CRM, co-branded marketing materials, and dedicated support to grow your business.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-md font-body font-semibold text-sm transition-all self-start"
                >
                  Learn About Partnership <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-3">Common Questions</span>
              <h2 className="font-display text-3xl md:text-4xl text-navy">Hawaii Mortgage FAQ</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "What is the conforming loan limit in Hawaii?",
                  a: "Hawaii is a high-cost state. For 2026, the conforming loan limit for a single-family home in Honolulu County is $1,249,125 — significantly higher than the national baseline of $806,500. Loans above this limit are jumbo loans and require different qualification standards."
                },
                {
                  q: "What is the minimum down payment for a home in Hawaii?",
                  a: "Down payment requirements vary by loan type. VA loans (for eligible veterans and military) require 0% down. FHA loans require 3.5% down with a 580+ credit score. Conventional loans can go as low as 3% down for first-time buyers. Jumbo loans typically require 10–20% down. There are also 0% down portfolio loan options available up to $998,000 for buyers who meet certain requirements — contact Jay for details."
                },
                {
                  q: "What is a leasehold property in Hawaii and can I get a mortgage on one?",
                  a: "A leasehold property means you own the structure but lease the land from a landowner (often the Bishop Estate or other large landowners). Mortgages on leasehold properties are available but have additional requirements. For conventional loans, lenders require at least 5 years remaining on the lease term after the loan term expires — meaning a 30-year loan requires at least 35 years remaining on the lease. Some lenders restrict leasehold financing entirely. Fee simple (owning both land and structure) is generally preferred by lenders."
                },
                {
                  q: "How long does mortgage pre-approval take in Hawaii?",
                  a: "A standard pre-approval typically takes 1 business day once all required documents are received. Required documents include pay stubs, W-2s, tax returns, bank statements, and a government-issued ID. A fully underwritten pre-approval (TBD approval) takes longer but provides stronger negotiating power in Hawaii's competitive market."
                },
                {
                  q: "What are typical closing costs in Hawaii?",
                  a: "Closing costs in Hawaii typically range from 1.5–2% of the purchase price. Buyers pay lender fees, title insurance, escrow fees, prepaid interest, and property tax impounds. On an $800,000 purchase, expect approximately $12,000–$16,000 in total closing costs."
                },
                {
                  q: "Can I use a VA loan to buy a condo in Hawaii?",
                  a: "Yes, VA loans can be used to purchase condos in Hawaii, but the condo project must be VA-approved. Many Honolulu condo buildings are VA-approved. Your lender can verify approval status before you make an offer."
                },
              ].map((item, i) => (
                <details key={i} className="group border border-border rounded-lg overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-sand/30 hover:bg-sand/60 transition-colors">
                    <span className="font-body font-semibold text-navy text-sm md:text-base pr-4">{item.q}</span>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT BAR ===== */}
      <ContactActions
        variant="full"
        background="sand"
        headline="Ready to Get Started?"
        subtext="Contact Jay Miller today for a free consultation and personalized mortgage guidance."
        preApprovalLabel="Start Your Pre-Approval"
      />
    </Layout>
  );
}
