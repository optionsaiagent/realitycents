/*
 * Pacific Modernism — Agent Partnership & Tools
 * DealSync-first landing page for real estate agents with email gate.
 */
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import { trpc } from "@/lib/trpc";
import DSCRCalculator from "./DSCRCalculator";
import AssumableCalculator from "./AssumableCalculator";
import EscalationCalculator from "./EscalationCalculator";
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  HandCoins,
  Flame,
  Eye,
  FileText,
  Share2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

type ActiveTool = "dscr" | "assumable" | "escalation";

export default function Agents() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>("dscr");

  const logAccess = trpc.dscr.logAccess.useMutation();

  // Check localStorage on mount
  useEffect(() => {
    const savedInfo = localStorage.getItem("rc_agent_info");
    if (savedInfo) {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);

    // Persist to localStorage FIRST — before the API call.
    // This guarantees the gate is remembered even if the backend is
    // unreachable, cold-starting, or throws an error.
    const gateData = JSON.stringify({ name, email, unlockedAt: new Date().toISOString() });
    try {
      localStorage.setItem("rc_agent_info", gateData);
    } catch (_storageErr) {
      // Storage quota exceeded or private browsing — proceed anyway
    }

    // Unlock the UI immediately (don't wait for the API)
    setIsUnlocked(true);
    setIsSubmitting(false);

    // Fire-and-forget: log to backend for lead capture (non-blocking)
    logAccess.mutate({ name, email });
  };

  return (
    <Layout>
      <SEO
        title="Partner With Me — DealSync & Agent Tools — RealityCents"
        description="Real-time deal visibility, instant pre-approval letters, and professional agent tools. Partner with Jay Miller at CMG Home Loans and get free DealSync access."
        url="/agents"
        keywords="DealSync, real estate agent partnership, deal tracking, pre-approval letters, DSCR calculator, assumable loan calculator, Hawaii real estate tools, mortgage tools for agents"
      />
      <PageHero
        title="Agent Partnership"
        subtitle="Real-time deal visibility, instant letters, and professional tools — built for agents who refer with confidence."
        image={IMAGES.heroAgents}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          {!isUnlocked ? (
            /* ─── EMAIL GATE ─── */
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Copy */}
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl text-navy mb-6">
                    Partner With Me
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Get real-time deal visibility through DealSync, instant
                    pre-approval letters, and professional agent tools — all at
                    no cost when you partner with me.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "DealSync — Real-time shared deal room",
                      "Instant Pre-Approval & VOF Letters",
                      "Borrower Status Portal for your buyers",
                      "DSCR Investment Property Analyzer",
                      "Assumable Loan Calculator (VA/FHA)",
                      "\"Win the Bid\" Escalation Calculator",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-navy font-body font-medium"
                      >
                        <CheckCircle className="w-5 h-5 text-teal shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Form */}
                <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-navy">
                        Unlock Access
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your info to access partnership details & tools
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full pl-10 pr-4 py-3 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full pl-10 pr-4 py-3 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-navy hover:bg-navy-light text-white font-body font-semibold py-3 rounded-md transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                      {isSubmitting ? "Unlocking..." : "Access Partnership Details"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-[10px] text-center text-muted-foreground mt-4">
                      By accessing these tools, you agree to receive mortgage
                      resources from {LENDER.name} at {LENDER.company}. You can
                      opt out at any time.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* ─── UNLOCKED CONTENT ─── */
            <div className="animate-in fade-in duration-700">
              {/* ═══ SECTION 1: How We Work Together (DealSync) ═══ */}
              <div className="max-w-5xl mx-auto mb-20">
                <div className="text-center mb-12">
                  <h2 className="font-display text-3xl lg:text-4xl text-navy mb-4">
                    Partner With Me — Get Real-Time Deal Visibility, Instant
                    Letters, and Zero Guesswork
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    When you refer a client to me, you don't lose visibility. You
                    gain it.
                  </p>
                </div>

                {/* Value Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {/* Card 1 */}
                  <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                      <Eye className="w-5 h-5 text-teal" />
                    </div>
                    <h3 className="font-display text-lg text-navy mb-2">
                      Real-Time Deal Tracking
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      See exactly where every referred client stands. No more
                      texting "any update?" — you'll know before they ask you.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                      <FileText className="w-5 h-5 text-teal" />
                    </div>
                    <h3 className="font-display text-lg text-navy mb-2">
                      Instant Pre-Approval & VOF Letters
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Need a letter for a bidding war? Click "Re-issue," update
                      the price, get a fresh letter in under 60 seconds. No
                      waiting on me to be at my desk.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                      <Share2 className="w-5 h-5 text-teal" />
                    </div>
                    <h3 className="font-display text-lg text-navy mb-2">
                      Borrower Status Portal
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Share a live status link with your buyers. They see
                      plain-English milestones (Pre-Approved → Appraisal In →
                      Clear to Close). You look organized. They stop calling you
                      for updates.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-5 h-5 text-teal" />
                    </div>
                    <h3 className="font-display text-lg text-navy mb-2">
                      Stalled-Deal Alerts
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If a deal hasn't moved in a week, you'll know. No more
                      deals dying in silence.
                    </p>
                  </div>
                </div>

                {/* Clarifying paragraph */}
                <p className="text-center text-muted-foreground max-w-3xl mx-auto text-sm leading-relaxed">
                  This isn't a CRM replacement — it's the layer between your CRM
                  and mine. You keep your systems. I keep mine. DealSync is the
                  shared space where nothing falls through the cracks.
                </p>
              </div>

              {/* ═══ SECTION 2: Try DealSync Free CTA ═══ */}
              <div className="max-w-4xl mx-auto mb-20">
                <div className="bg-navy rounded-2xl p-8 md:p-12 text-center">
                  <h3 className="font-display text-2xl lg:text-3xl text-white mb-4">
                    DealSync is Free for Partner Agents — Forever
                  </h3>
                  <p className="text-sand/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                    When you partner with me, you get full access to DealSync at
                    no cost. Unlimited deals, real-time tracking, instant letters,
                    mobile access. No credit card, no trial period, no catch.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      href="https://app.dealsync.me/partner/jaymiller"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white font-body font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                      Request Partner Access
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.dealsync.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sand/80 hover:text-white font-body font-medium text-sm transition-colors"
                    >
                      Learn more about DealSync
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* ═══ SECTION 3: Agent Tools (Calculators) ═══ */}
              <div className="max-w-5xl mx-auto mb-20">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl lg:text-3xl text-navy mb-3">
                    Agent-Only Tools
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    These tools are built for agents working Hawaii investment and
                    VA deals. Use them to run scenarios with your clients before we
                    even talk.
                  </p>
                </div>

                {/* Tool Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-sand/30 p-4 rounded-lg border border-border">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTool("dscr")}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-body font-semibold transition-all ${
                        activeTool === "dscr"
                          ? "bg-navy text-white shadow-sm"
                          : "bg-white text-navy border border-border hover:bg-navy/5"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      DSCR Analyzer
                    </button>
                    <button
                      onClick={() => setActiveTool("assumable")}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-body font-semibold transition-all ${
                        activeTool === "assumable"
                          ? "bg-navy text-white shadow-sm"
                          : "bg-white text-navy border border-border hover:bg-navy/5"
                      }`}
                    >
                      <HandCoins className="w-4 h-4" />
                      Assumable Loan
                    </button>
                    <button
                      onClick={() => setActiveTool("escalation")}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-body font-semibold transition-all ${
                        activeTool === "escalation"
                          ? "bg-navy text-white shadow-sm"
                          : "bg-white text-navy border border-border hover:bg-navy/5"
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      Win the Bid
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("rc_agent_info");
                      setIsUnlocked(false);
                    }}
                    className="text-xs text-teal hover:underline font-body font-medium self-start md:self-center"
                  >
                    Not you? Reset access
                  </button>
                </div>

                {/* Active Tool */}
                <div className="calculator-wrapper">
                  {activeTool === "dscr" ? (
                    <DSCRCalculator isEmbedded={true} />
                  ) : activeTool === "assumable" ? (
                    <AssumableCalculator isEmbedded={true} />
                  ) : (
                    <EscalationCalculator isEmbedded={true} />
                  )}
                </div>
              </div>

              {/* ═══ SECTION 4: Why Agents Choose to Partner With Me ═══ */}
              <div className="max-w-4xl mx-auto mb-20">
                <h2 className="font-display text-2xl lg:text-3xl text-navy text-center mb-10">
                  Why Agents Choose to Partner With Me
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "25 years closing VA and conventional loans on Oahu — I know what passes appraisal and what doesn't.",
                    "Same-day pre-approvals, not 48-hour callbacks.",
                    "I educate your buyers so you don't have to explain DTI ratios at the showing.",
                    "When the deal gets complicated — VA entitlement restoration, condo approval, leasehold — I handle it. You keep selling.",
                  ].map((statement, i) => (
                    <div
                      key={i}
                      className="bg-sand/20 border border-border rounded-lg p-5"
                    >
                      <p className="text-navy font-body text-sm leading-relaxed">
                        "{statement}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ SECTION 5: Final CTA ═══ */}
              <ContactActions
                variant="full"
                background="transparent"
                headline="Ready to Partner?"
                subtext="Partner with Jay Miller to get full access to DealSync and a suite of tools for your clients."
                preApprovalLabel="Request DealSync Access"
                preApprovalUrl="https://app.dealsync.me/partner/jaymiller"
              />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
