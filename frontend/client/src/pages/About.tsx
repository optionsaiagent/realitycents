/*
 * Pacific Modernism — About Page
 * Professional bio with credentials, experience timeline, and trust signals
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import { BOOK } from "@/lib/book";
import {
  Shield,
  Award,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  Building,
  Users,
  Heart,
  Target,
} from "lucide-react";

const credentials = [
  { label: "NMLS ID", value: `#${LENDER.nmls}` },
  { label: "Company", value: LENDER.company },
  { label: "CMG NMLS", value: `#${LENDER.companyNmls}` },
  { label: "Branch NMLS", value: `#${LENDER.branchNmls}` },
  { label: "Licensed In", value: "State of Hawaii" },
  { label: "Experience", value: `${LENDER.experience} Years` },
  { label: "Location", value: "Honolulu, HI" },
];

const values = [
  {
    icon: Heart,
    title: "Client-First Approach",
    description: "Every recommendation is made with your best interests in mind. I take the time to understand your unique financial situation and goals before suggesting any loan product.",
  },
  {
    icon: Target,
    title: "Local Market Expertise",
    description: "With 25 years in Hawaii's real estate and mortgage industry, I understand the nuances of island property — from leasehold vs. fee simple to lava zone considerations on the Big Island.",
  },
  {
    icon: Users,
    title: "Strong Agent Relationships",
    description: "I've built a trusted network of real estate agents across the Hawaiian Islands, ensuring smooth transactions and effective communication throughout the homebuying process.",
  },
  {
    icon: Shield,
    title: "Transparent Communication",
    description: "No hidden fees, no surprises. I believe in clear, honest communication at every stage of the mortgage process, keeping you informed and empowered.",
  },
];

const specialties = [
  "First-Time Homebuyer Programs",
  "VA Loans for Hawaii Military",
  "FHA Loans",
  "Conventional Loans",
  "Jumbo Loans for Hawaii Properties",
  "HHFDC Down Payment Assistance",
  "Portfolio Loans",
  "USDA Loans",
  "Refinancing & Cash-Out",
  "Investment Property Financing",
];

export default function About() {
  return (
    <Layout>
      <SEO
        title="About Jay Miller — Hawaii Mortgage Lender"
        description="Meet Jay Miller, NMLS #657301 — a Hawaii mortgage loan originator with 25+ years of experience at CMG Home Loans. U.S. Army veteran, triathlete, and passionate advocate for informed homebuyers across the Hawaiian Islands."
        url="/about"
        keywords="Jay Miller mortgage, Hawaii mortgage lender, CMG Home Loans Honolulu, mortgage loan originator Hawaii, NMLS 657301, Hawaii home loan expert"
      />
      <PageHero
        title="About Jay Miller"
        subtitle="Over 25 years of dedicated mortgage expertise, helping Hawaii families achieve the dream of homeownership."
        image={IMAGES.heroAbout}
      />

      {/* ===== BIO SECTION ===== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Main bio */}
            <div className="lg:col-span-3">
              {/* Headshot */}
              <div className="mb-8 flex items-start gap-6">
                <img
                  src={IMAGES.headshot}
                  alt="Jay Miller — Mortgage Loan Originator in Hawaii"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover object-top shadow-lg shadow-navy/10 shrink-0 border-2 border-sand"
                />
                <div className="pt-2">
                  <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-2">
                    Your Mortgage Professional
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl text-navy mb-1">
                    Jay Miller
                  </h2>
                  <p className="text-muted-foreground text-sm">{LENDER.title} | NMLS #{LENDER.nmls}</p>
                  <p className="text-muted-foreground text-sm">{LENDER.company}</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  With 25 years of experience in Hawaii's real estate and mortgage industry, I'm passionate about helping clients confidently achieve their homeownership dreams. I believe an informed homebuyer is a happy homebuyer, which is why I take the time to explain every step and ensure you feel comfortable and empowered throughout the process.
                </p>
                <p>
                  Known for being responsive, accessible, and proactive, I work closely with both clients and Realtors to create a smooth, seamless experience from application to closing. With a broad range of loan options — including Conventional, VA, Jumbo, Portfolio, USDA, and FHA — I tailor solutions to fit your unique goals.
                </p>
                <p>
                  My wife, Michelle, and I are proud U.S. Army OIF and OEF Veterans who have planted roots here in beautiful Hawaii. When we're not working, you'll find us enjoying the outdoors — training for triathlons, surfing, hiking, or simply appreciating island life.
                </p>
                <p>
                  I'm also the author of{" "}
                  <Link href={BOOK.pageUrl} className="text-teal font-body font-semibold hover:underline">
                    <em>Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers</em>
                  </Link>{" "}
                  (July 2026) — the definitive guide to using your VA benefit to buy a home in Hawaii, drawn from 25 years of helping military families at the closing table.
                </p>
              </div>

              {/* Specialties */}
              <div className="mt-10">
                <h3 className="font-display text-xl text-navy mb-4">Areas of Expertise</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {specialties.map((s) => (
                    <div key={s} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-teal shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar credentials */}
            <div className="lg:col-span-2">
              <div className="bg-navy rounded-xl p-6 lg:p-8 sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-teal/20 flex items-center justify-center">
                    <Building className="w-7 h-7 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-white">{LENDER.name}</h3>
                    <p className="text-sm text-sand/60">{LENDER.title}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {credentials.map((c) => (
                    <div key={c.label} className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-xs text-sand/50 uppercase tracking-wider">{c.label}</span>
                      <span className="text-sm text-white font-body font-medium">{c.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <a
                    href={`tel:${LENDER.phone}`}
                    className="flex items-center gap-2.5 text-sm text-sand/80 hover:text-gold transition-colors"
                  >
                    <Phone className="w-4 h-4 text-teal" />
                    {LENDER.phone}
                  </a>
                  <a
                    href={`mailto:${LENDER.email}`}
                    className="flex items-center gap-2.5 text-sm text-sand/80 hover:text-gold transition-colors"
                  >
                    <Mail className="w-4 h-4 text-teal" />
                    {LENDER.email}
                  </a>
                  <div className="flex items-center gap-2.5 text-sm text-sand/80">
                    <MapPin className="w-4 h-4 text-teal" />
                    {LENDER.address.full}
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-3 rounded-md font-body font-semibold text-sm transition-all"
                >
                  Contact Jay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE BOOK ===== */}
      <section className="bg-navy py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12 max-w-4xl mx-auto">
            <Link href={BOOK.pageUrl} className="shrink-0">
              <img
                src={BOOK.cover}
                alt={`${BOOK.fullTitle} — book cover`}
                className="w-40 lg:w-48 rounded-lg shadow-2xl shadow-black/50 ring-1 ring-white/10 hover:scale-[1.03] transition-transform duration-500"
                loading="lazy"
              />
            </Link>
            <div className="text-center md:text-left">
              <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-2">
                Published Author
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-white mb-3">
                Zero Down in Paradise
              </h2>
              <p className="text-sm text-teal-light font-body font-medium mb-3">{BOOK.subtitle}</p>
              <p className="text-sand/70 text-sm leading-relaxed mb-6">
                Jay's complete playbook for buying a home in Hawaii with your VA loan — entitlement, BAH,
                condo approvals, leasehold vs. fee simple, and the zero-down strategies that actually work
                in the islands. Published {BOOK.published}.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                <a
                  href={BOOK.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-md font-body font-bold text-sm transition-all hover:shadow-lg hover:shadow-gold/30"
                >
                  Get It on Amazon <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href={BOOK.pageUrl}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-md font-body font-semibold text-sm transition-all border border-white/20"
                >
                  About the Book
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section className="bg-sand py-20 lg:py-28">
        <div className="container">
          <SectionHeading
            label="Why Choose Jay"
            title="Built on Trust, Driven by Results"
            description="The principles that guide every client interaction and mortgage recommendation."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-6 lg:p-8 border border-border">
                <div className="w-11 h-11 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-teal" />
                </div>
                <h3 className="font-display text-lg text-navy mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CMG HOME LOANS ===== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold">Our Company</span>
            </div>
            <div className="flex justify-center mb-6">
              <img src={IMAGES.cmgLogo} alt="CMG Home Loans" className="h-12 object-contain" />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              CMG Mortgage, Inc. dba CMG Home Loans (NMLS #{LENDER.companyNmls}) is a well-established mortgage lender offering a comprehensive suite of loan products. With a commitment to innovation and customer service, CMG provides the backing and resources that enable Jay to deliver exceptional results for Hawaii homebuyers. From conventional and government-backed loans to specialized programs for unique Hawaii property situations, CMG's diverse product portfolio ensures there's a solution for every borrower.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-md font-body font-semibold text-sm transition-all"
              >
                Try Our Calculator <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white hover:bg-sand text-navy px-6 py-3 rounded-md font-body font-semibold text-sm transition-all border border-navy/10"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
