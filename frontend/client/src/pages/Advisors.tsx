/**
 * Pacific Modernism — Financial Advisor Partnership Page
 * Explains the AIO first-lien HELOC as a tool for advisors to free up client cash flow for investing.
 */
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import {
  TrendingUp,
  DollarSign,
  Shield,
  PieChart,
  ArrowRight,
  CheckCircle,
  Calculator,
} from "lucide-react";


const ADVISOR_BENEFITS = [
  {
    icon: DollarSign,
    title: "Free Up Client Cash Flow",
    description:
      "The average mortgage consumes $44K+/year for 30 years. The AIO pays off in 11–14 years, redirecting that payment to investable assets decades sooner.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your AUM",
    description:
      "Every dollar freed from mortgage payments is a dollar available for your management. A client saving $3,694/mo post-payoff adds $44K/year to their portfolio.",
  },
  {
    icon: Shield,
    title: "Maintain Client Liquidity",
    description:
      "Unlike extra payments on a fixed mortgage, every dollar paid into the AIO remains accessible on the line — no refinance needed to access equity.",
  },
  {
    icon: PieChart,
    title: "Holistic Financial Planning",
    description:
      "Position yourself as the advisor who optimizes the full balance sheet — not just the investment accounts. Housing is the largest line item most clients ignore.",
  },
];

const KEY_STATS = [
  { value: "$466K", label: "Interest saved on a $600K loan" },
  { value: "11.6 yrs", label: "Payoff vs. 30 years on a fixed" },
  { value: "$1.28M", label: "Portfolio value from redirected payments (8%, 15 yrs)" },
];

export default function Advisors() {

  return (
    <Layout>
      <SEO
        title="Financial Advisors — Free Up Client Cash Flow with the AIO | RealityCents"
        description="The All-In-One first-lien HELOC helps your clients pay off their mortgage in 11-14 years instead of 30, freeing $44K+/year for portfolio growth. Partner with Jay Miller at CMG Home Loans."
        url="/advisors"
        keywords="financial advisor mortgage partnership, AIO HELOC, first lien HELOC financial planning, client cash flow optimization, mortgage payoff strategy, wealth management mortgage, CMG All In One loan"
      />

      <PageHero
        title="For Financial Advisors"
        subtitle="Your client's mortgage is the largest drag on their investable cash flow. There's a better structure."
        image={IMAGES.heroAgents}
        compact
      />

      {/* ─── The Problem Statement ─── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-body font-semibold uppercase tracking-[0.15em] text-teal mb-3">
              The Opportunity
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-navy mb-6">
              The Largest Line Item You Don't Manage
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A $600,000 mortgage at 6.25% costs your client $3,694/month for 30 years —
              $729,949 in total interest. That's $44K/year locked into housing during their
              prime earning and compounding years. The All-In-One first-lien HELOC changes
              that math dramatically.
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {KEY_STATS.map((stat, i) => (
              <div
                key={i}
                className="bg-navy rounded-xl p-6 text-center"
              >
                <p className="font-display text-3xl text-gold mb-2">{stat.value}</p>
                <p className="text-sm text-sand/80 font-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Explainer Video ─── */}
      <section className="py-16 lg:py-20 bg-sand">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-sm font-body font-semibold uppercase tracking-[0.15em] text-teal mb-3">
              Watch the Briefing
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-navy mb-4">
              How the AIO Creates Portfolio Capacity
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              An 8-minute briefing on the mechanics, the math, the rate-risk analysis, and the
              suitability screen — built for advisors, not consumers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.youtube.com/embed/inVfvRG92Uo"
                title="AIO Advisor Briefing — How the All-In-One Creates Portfolio Capacity"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits Grid ─── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-body font-semibold uppercase tracking-[0.15em] text-teal mb-3">
              Why This Matters to Your Practice
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-navy mb-4">
              The Advisor's Edge
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ADVISOR_BENEFITS.map((benefit, i) => (
              <div
                key={i}
                className="bg-sand/50 rounded-xl p-8 border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-teal" />
                </div>
                <h3 className="font-display text-xl text-navy mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works (Brief) ─── */}
      <section className="py-16 lg:py-20 bg-navy text-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl text-white mb-4">
              How the All-In-One Works
            </h2>
            <p className="text-sand/80 max-w-2xl mx-auto">
              A first-lien HELOC with an integrated sweep-checking account. Your client's
              income works harder without changing their lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Paycheck Deposits",
                desc: "Full income deposits into the line, immediately reducing the balance.",
              },
              {
                step: "2",
                title: "Balance Drops Daily",
                desc: "Interest is calculated on the average daily balance — every idle dollar saves interest.",
              },
              {
                step: "3",
                title: "Bills Paid as Usual",
                desc: "Client pays expenses from the same account. Balance rises only when money is spent.",
              },
              {
                step: "4",
                title: "Surplus Retires Principal",
                desc: "The gap between income and spending automatically accelerates payoff — no extra effort.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-gold text-lg">{item.step}</span>
                </div>
                <h3 className="font-display text-lg text-white mb-2">{item.title}</h3>
                <p className="text-sm text-sand/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white/5 rounded-xl p-6 border border-white/10 max-w-3xl mx-auto">
            <h4 className="font-display text-lg text-gold mb-3">Key Structural Facts</h4>
            <ul className="space-y-2">
              {[
                "30-year draw period — full access to equity the entire term",
                "Never converts to an amortizing loan — stays a line of credit throughout",
                "Credit limit steps down 1/240th per month after year 10",
                "Variable rate (SOFR + margin, 2.5%–4.0%) with a 6% lifetime cap above start rate",
                "No minimum balance or draw requirements",
                "Available for primary, second homes, and investment properties",
              ].map((fact, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-sand/80">
                  <CheckCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── The Client Conversation ─── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl lg:text-4xl text-navy mb-4">
              The Client Conversation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three questions that open the door to a meaningful discussion about mortgage optimization.
            </p>
          </div>

          <div className="space-y-6">
            {[
              "\"What if we could get you mortgage-free 15+ years sooner — and redirect that payment into your portfolio?\"",
              "\"Your mortgage costs you $44K/year. What would that money do compounding in the market for the next 18 years?\"",
              "\"Right now, every extra dollar you put toward your mortgage is gone. What if it stayed accessible — like a built-in margin account at mortgage rates?\"",
            ].map((question, i) => (
              <div
                key={i}
                className="bg-sand/50 rounded-xl p-6 border-l-4 border-teal"
              >
                <p className="text-navy font-body text-lg italic leading-relaxed">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Run a Simulation CTA ─── */}
      <section className="py-16 lg:py-20 bg-sand">
        <div className="container max-w-4xl text-center">
          <h2 className="font-display text-3xl lg:text-4xl text-navy mb-4">
            Run a Simulation for Your Client
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            I'll run a personalized AIO simulation using your client's actual income, expenses,
            and loan balance — at no cost and no obligation. You get a detailed comparison
            to present alongside their current mortgage structure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a
              href="/heloc-sweep-calculator"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white px-6 py-3 rounded-md font-body font-semibold transition-all"
            >
              <Calculator className="w-5 h-5" />
              Try the Calculator
            </a>
            <a
              href={`mailto:${LENDER.email}?subject=AIO%20Simulation%20Request%20-%20Financial%20Advisor`}
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-6 py-3 rounded-md font-body font-semibold transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Request a Client Simulation
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            All simulations are confidential. No client contact without your permission.
          </p>
        </div>
      </section>

      {/* ─── Contact / CTA ─── */}
      <ContactActions
        headline="Let's Talk Strategy"
        subtext="I work with financial advisors across Hawaii to help their clients optimize the largest line item on their balance sheet. No sales pitch — just math."
        showNmls
      />
    </Layout>
  );
}
