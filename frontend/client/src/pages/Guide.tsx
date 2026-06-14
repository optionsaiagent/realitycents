/*
 * Pacific Modernism — Hawaii Homebuying Guide Landing Page
 * Email capture gated guide download with preview of contents
 */
import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import { toast } from "sonner";
import { subscribeToMailchimp } from "@/lib/mailchimp";
import {
  BookOpen,
  Download,
  CheckCircle,
  MapPin,
  DollarSign,
  FileText,
  Home,
  Shield,
  TrendingUp,
  ArrowRight,
  Mail,
  User,
  Sparkles,
  FileCheck,
} from "lucide-react";

const guideChapters = [
  { icon: MapPin, title: "Understanding Hawaii's Market", desc: "Current median prices, island-by-island analysis, and 40-year appreciation data" },
  { icon: DollarSign, title: "Financial Preparation", desc: "Credit scores, DTI ratios, budgeting for Hawaii's cost of living" },
  { icon: FileText, title: "Mortgage Options", desc: "Conventional, FHA, VA, Jumbo, USDA, and HHFDC programs explained" },
  { icon: TrendingUp, title: "Down Payment Assistance", desc: "HHFDC programs, Honolulu DPA, and creative funding strategies" },
  { icon: Shield, title: "Pre-Approval Process", desc: "Documents needed, timeline, and how to strengthen your application" },
  { icon: Home, title: "Finding Your Home", desc: "Leasehold vs. fee simple, HOA considerations, and working with agents" },
  { icon: BookOpen, title: "Escrow & Closing", desc: "Hawaii's unique escrow process, closing costs, and what to expect" },
  { icon: Sparkles, title: "After You Close", desc: "Insurance, property taxes, and maintaining your Hawaii home" },
];

const benefits = [
  "Comprehensive 15-chapter guide covering every step",
  "Current 2026 market data and median prices by island",
  "40-year Oahu appreciation analysis showing 618% growth",
  "Complete breakdown of all loan types available in Hawaii",
  "Down payment assistance programs and eligibility details",
  "Hawaii-specific escrow process explained step by step",
  "Leasehold vs. fee simple ownership guide",
  "Home inspection checklist for tropical properties",
  "Glossary of mortgage and real estate terms",
];

export default function Guide() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setLoading(true);
    const result = await subscribeToMailchimp("homebuyers", { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Layout>
      <SEO
        title="Free Hawaii Homebuying Guide — Download Now"
        description="Download our free comprehensive Hawaii Homebuying Guide. Learn the step-by-step process of buying a home in Hawaii — from pre-approval to closing day. Covers leasehold vs. fee simple, down payment assistance, VA loans, and more."
        url="/guide"
        keywords="Hawaii homebuying guide, how to buy a home in Hawaii, Hawaii first time homebuyer, Hawaii mortgage guide, free Hawaii real estate guide, Hawaii home purchase steps"
      />
      <PageHero
        title="The Hawaii Homebuying Guide"
        subtitle="Your comprehensive, free resource for navigating Hawaii's unique real estate market — from financial preparation to closing day."
        image={IMAGES.heroGuide}
      >
        <a
          href="#download"
          className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3.5 rounded-md font-body font-semibold text-sm transition-all hover:shadow-lg hover:shadow-teal/25"
        >
          <Download className="w-4 h-4" />
          Download Free Guide
        </a>
      </PageHero>

      {/* What's Inside */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-3">
              What's Inside
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-navy mb-4">
              Everything You Need to Buy a Home in Hawaii
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Written with over 25 years of Hawaii mortgage experience, this guide covers the complete homebuying journey with island-specific insights you won't find anywhere else.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {guideChapters.map((ch) => (
              <div key={ch.title} className="p-5 rounded-xl border border-border bg-card hover:shadow-md hover:shadow-navy/5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-3">
                  <ch.icon className="w-5 h-5 text-teal" />
                </div>
                <h3 className="font-display text-base text-navy mb-1">{ch.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="bg-navy py-20 lg:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Benefits */}
            <div>
              <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-3">
                Free Download
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6">
                Get Your Free Hawaii Homebuying Guide
              </h2>
              <p className="text-sand/70 leading-relaxed mb-8">
                Join hundreds of Hawaii homebuyers who have used this guide to navigate the islands' unique real estate market with confidence.
              </p>

              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                    <span className="text-sm text-sand/80">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="glass-dark rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-teal" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-3">Check your email!</h3>
                  <p className="text-sand/70 mb-4">
                    Your free Oahu Homebuyer's Guide is on its way to <strong className="text-white">{email}</strong>. It should arrive within a few minutes.
                  </p>
                  <div className="mt-6 p-4 rounded-lg bg-gold/10 border border-gold/20">
                    <p className="text-sm font-body font-semibold text-gold mb-2">Ready to take the next step?</p>
                    <p className="text-xs text-sand/60 mb-3">Start your pre-approval with Jay Miller — it only takes a few minutes.</p>
                    <a
                      href={PRE_APPROVAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-md text-sm font-body font-semibold transition-all"
                    >
                      <FileCheck className="w-4 h-4" />
                      Get Pre-Approved Now
                    </a>
                  </div>
                  <p className="text-sm text-sand/50 mt-4">
                    Or explore our{" "}
                    <a href="/knowledge-base" className="text-teal hover:underline">Knowledge Base</a>{" "}
                    or{" "}
                    <a href="/calculator" className="text-teal hover:underline">Mortgage Calculator</a>.
                  </p>
                </div>
              ) : (
                <div className="glass-dark rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                      <Download className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white">Download Your Free Guide</h3>
                      <p className="text-sm text-sand/60">Enter your info below for instant access</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot field — hidden from humans, traps bots */}
                    <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                      <input
                        type="text"
                        name="b_78d73687dd90474d0a8460e27_55d21946c8"
                        tabIndex={-1}
                        defaultValue=""
                        readOnly
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-body font-medium text-sand/80 mb-1.5">
                          First Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand/40" />
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First"
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-white/10 bg-white/5 text-white text-sm placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-body font-medium text-sand/80 mb-1.5">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand/40" />
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last"
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-white/10 bg-white/5 text-white text-sm placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-body font-medium text-sand/80 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand/40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-md border border-white/10 bg-white/5 text-white text-sm placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white py-3 rounded-md font-body font-semibold text-sm transition-all hover:shadow-lg hover:shadow-teal/25 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Get Free Guide Now
                        </>
                      )}
                    </button>
                    <p className="text-xs text-sand/40 text-center">
                      We respect your privacy. No spam, unsubscribe anytime.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <ContactActions
        variant="full"
        background="sand"
        headline="Questions About Buying in Hawaii?"
        subtext="Jay Miller is here to provide personalized guidance for your unique situation."
      />
    </Layout>
  );
}
