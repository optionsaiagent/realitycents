/*
 * Pacific Modernism — Zero Down in Paradise Book Page
 * Standalone page for Jay Miller's book: cover, description, who it's for,
 * key topics, author bio, and Amazon purchase CTA.
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import { BOOK } from "@/lib/book";
import { IMAGES, LENDER, SITE } from "@/lib/constants";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Shield,
  Star,
  MapPin,
  Medal,
  Home as HomeIcon,
  KeyRound,
  Landmark,
  FileText,
  Percent,
  RefreshCcw,
} from "lucide-react";

const audience = [
  {
    icon: Medal,
    title: "Active-Duty Service Members",
    description:
      "PCSing to Pearl Harbor-Hickam, Schofield Barracks, MCBH Kaneohe, Fort Shafter, Tripler, or Camp Smith — and wondering if buying on Oahu is even possible on military pay.",
  },
  {
    icon: Shield,
    title: "Veterans & Reserve Members",
    description:
      "Separated, retired, or serving in the Guard or Reserve with VA eligibility — including veterans returning to the islands years after their last assignment.",
  },
  {
    icon: HomeIcon,
    title: "First-Time Military Buyers",
    description:
      "E-5s buying a first condo, O-4s looking at single-family homes in Mililani, and every rank in between — anyone who wants to buy in Hawaii with zero down.",
  },
];

const topics = [
  {
    icon: KeyRound,
    title: "VA Entitlement, Demystified",
    description:
      "How full entitlement removes loan limits entirely — even in Honolulu's high-cost market — and what reduced entitlement means for your buying power.",
  },
  {
    icon: Percent,
    title: "BAH & COLA as Purchasing Power",
    description:
      "How lenders count your housing allowance and cost-of-living adjustment, and what that means for the price point you can actually qualify for.",
  },
  {
    icon: Landmark,
    title: "Hawaii's Condo Approval Maze",
    description:
      "Navigating VA condo project approval requirements — the step most mainland lenders get wrong — plus how to verify a building before you write an offer.",
  },
  {
    icon: FileText,
    title: "Leasehold vs. Fee Simple",
    description:
      "Hawaii's most misunderstood property distinction, the J-1 inspection contingency, and closing on time when recording runs days behind the mainland.",
  },
  {
    icon: RefreshCcw,
    title: "Wealth-Building Strategies",
    description:
      "The IRRRL refinance, cash-out refi, and assumable loan strategies that turn a single VA purchase into long-term wealth.",
  },
  {
    icon: Star,
    title: "The 2026 Funding Fee Tax Deduction",
    description:
      "The new VA funding fee tax deduction most lenders haven't told their clients about, plus Hawaii's property tax exemptions every buyer must file.",
  },
];

export default function ZeroDownInParadise() {
  return (
    <Layout>
      <SEO
        title="Zero Down in Paradise — The Hawaii VA Loan Playbook | Book by Jay Miller"
        description="Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers, by Jay Miller. The definitive guide to buying a home in Hawaii with your VA loan — entitlement, BAH, condo approvals, leasehold vs. fee simple, and zero-down strategies. Available on Amazon."
        url={BOOK.pageUrl}
        image={BOOK.cover}
        imageAlt={`${BOOK.fullTitle} — book cover`}
        keywords="Zero Down in Paradise book, Hawaii VA loan book, Jay Miller author, VA loan playbook Hawaii, military homebuying Hawaii book, buy home Hawaii zero down"
        schema={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: BOOK.fullTitle,
          author: {
            "@type": "Person",
            "@id": `${SITE.url}/#jaymiller`,
            name: "Jay Miller",
            jobTitle: "Sales Manager & Mortgage Loan Consultant",
            url: `${SITE.url}/about`,
          },
          isbn: BOOK.isbn,
          numberOfPages: BOOK.pages,
          bookFormat: "https://schema.org/Paperback",
          datePublished: "2026-07-03",
          inLanguage: "en-US",
          image: BOOK.cover,
          url: `${SITE.url}${BOOK.pageUrl}`,
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
        }}
      />

      {/* ===== HERO ===== */}
      <section className="relative bg-navy pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-10">
          <img
            src={IMAGES.heroGuide}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/90 to-navy" />

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            {/* Cover */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end order-first lg:order-last">
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

            {/* Copy */}
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-4">
                <BookOpen className="w-4 h-4" />
                The Book · Published {BOOK.published}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-[1.08]">
                Zero Down<br />in Paradise
              </h1>
              <p className="text-lg lg:text-xl text-teal-light font-body font-medium mb-6">
                {BOOK.subtitle}
              </p>
              <p className="text-sand/80 leading-relaxed mb-4 max-w-xl">
                Hawaii is one of the most expensive housing markets in America. For service members arriving on
                PCS orders, the sticker shock is real — median home prices on Oahu have exceeded $1 million for
                years. The math feels impossible.
              </p>
              <p className="text-sand/80 leading-relaxed mb-8 max-w-xl">
                It isn't — if you know how to use the most powerful financial benefit you've already earned.
                This is the definitive guide to buying a home in Hawaii with your VA loan, written by a 25-year
                Hawaii lending veteran who has personally helped hundreds of military families do exactly that.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={BOOK.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40 hover:scale-105 ring-2 ring-gold/50"
                >
                  Get It on Amazon <ArrowRight className="w-5 h-5" />
                </a>
                <Link
                  href="/knowledge-base/zero-down-home-buying-hawaii"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all backdrop-blur-sm border border-white/20"
                >
                  Read the Free Zero-Down Article
                </Link>
              </div>
              <p className="text-xs text-sand/50 mt-4">
                Paperback · {BOOK.pages} pages · ISBN {BOOK.isbn}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-3">
              Who It's For
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-navy">
              Written for the Buyers Hawaii's Market Underestimates
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audience.map((a) => (
              <div
                key={a.title}
                className="p-6 lg:p-8 rounded-xl border border-border bg-card hover:shadow-lg hover:shadow-navy/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-4">
                  <a.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl text-navy mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT'S INSIDE ===== */}
      <section className="bg-sand py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-3">
              What's Inside
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-navy mb-3">
              A Complete VA Loan Playbook, Tailored to Hawaii
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not generic VA loan advice — the specifics that matter in the islands, from condo approvals to
              recording timelines, drawn from real stories at the closing table.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((t) => (
              <div key={t.title} className="bg-white rounded-xl p-6 border border-border">
                <div className="w-11 h-11 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <t.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-lg text-navy mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href={BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40 hover:scale-105"
            >
              Get Your Copy on Amazon <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== ABOUT THE AUTHOR ===== */}
      <section className="bg-navy py-20 lg:py-28 relative overflow-hidden">
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
                  About the Author
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-4">Jay Miller</h2>
                <p className="text-sand/70 leading-relaxed mb-4">
                  Jay Miller is a U.S. Army veteran and Sales Manager at CMG Home Loans (NMLS #{LENDER.nmls})
                  with 25 years of mortgage lending experience in Honolulu, Hawaii. He has personally guided
                  hundreds of military families through the VA loan process in one of the most complex — and
                  rewarding — housing markets in the country.
                </p>
                <p className="text-sand/70 leading-relaxed mb-6">
                  He served at Fort Shafter and deployed in support of OIF and OEF, so he understands the PCS
                  timeline, the BAH math, and the "can I really afford Hawaii?" question from both sides of the
                  desk. He runs RealityCents.com, Hawaii's mortgage education resource, where the same
                  educate-first philosophy behind this book shows up in every article and calculator.
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mb-8">
                  <span className="flex items-center gap-2 text-sm text-sand/80">
                    <Shield className="w-4 h-4 text-teal" /> NMLS #{LENDER.nmls}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-sand/80">
                    <Medal className="w-4 h-4 text-gold" /> U.S. Army Veteran
                  </span>
                  <span className="flex items-center gap-2 text-sm text-sand/80">
                    <CheckCircle className="w-4 h-4 text-teal" /> 25 Years in Hawaii Mortgages
                  </span>
                  <span className="flex items-center gap-2 text-sm text-sand/80">
                    <MapPin className="w-4 h-4 text-teal" /> Honolulu, HI
                  </span>
                </div>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-md font-body font-semibold text-sm transition-all"
                >
                  More About Jay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-navy mb-4">
              Your VA Benefit Is Bigger Than You Think
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you read the book first or want to talk through your specific situation, the goal is the
              same: turn the benefit you've already earned into a Hawaii home.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={BOOK.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40"
              >
                Get the Book on Amazon <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/military-calculator"
                className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all"
              >
                Try the Military Buying Power Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT BAR ===== */}
      <ContactActions
        variant="full"
        background="sand"
        headline="Questions About Your VA Eligibility?"
        subtext="Reach out to Jay Miller for a no-pressure conversation about your zero-down options in Hawaii."
        preApprovalLabel="Start Your Pre-Approval"
      />
    </Layout>
  );
}
