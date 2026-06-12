/*
 * Pacific Modernism — Agent Tools
 * Landing page for real estate agents with an email gate for the DSCR calculator.
 */
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import DSCRCalculator from "./DSCRCalculator";
import { User, Mail, Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function Agents() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      // Log access to backend
      await logAccess.mutateAsync({ name, email });
      
      // Save to localStorage
      localStorage.setItem("rc_agent_info", JSON.stringify({ name, email, unlockedAt: new Date().toISOString() }));
      
      setIsUnlocked(true);
    } catch (err) {
      console.error("Failed to log access:", err);
      // Still unlock even if logging fails (UX first)
      setIsUnlocked(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Agent Tools — RealityCents"
        description="Access professional-grade real estate investment tools, including our DSCR Investment Property Analyzer. Screen deals in seconds."
        url="/agents"
        keywords="real estate agent tools, DSCR calculator, investment property analyzer, Hawaii real estate tools, mortgage tools for agents"
      />
      <PageHero
        title="Agent Tools"
        subtitle="Professional-grade resources to help you and your clients make better investment decisions."
        image={IMAGES.heroAgents}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          {!isUnlocked ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Copy */}
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl text-navy mb-6">
                    DSCR Investment Property Analyzer
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Screen DSCR deals in seconds. Our professional analyzer helps you quickly determine if a rental property pencils as a DSCR loan deal, complete with rent estimates and lender threshold checks.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "Instant Rent Estimates (powered by RentCast)",
                      "Full PITIA & NOI Breakdowns",
                      "Color-coded DSCR Ratio Analysis",
                      "Lender Threshold Verification (1.0x, 1.1x, 1.25x)",
                      "Hawaii-Specific Expense Guidance"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-navy font-body font-medium">
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
                      <h3 className="font-display text-xl text-navy">Unlock Access</h3>
                      <p className="text-sm text-muted-foreground">Enter your info to access the tool</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">Full Name</label>
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
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">Email Address</label>
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
                      {isSubmitting ? "Unlocking..." : "Access Analyzer"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-[10px] text-center text-muted-foreground mt-4">
                      By accessing this tool, you agree to receive mortgage resources from {LENDER.name} at {LENDER.company}. You can opt out at any time.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-sand/30 p-4 rounded-lg border border-border">
                <div>
                  <h2 className="font-display text-2xl text-navy">DSCR Investment Property Analyzer</h2>
                  <p className="text-sm text-muted-foreground">Professional screening tool for rental property deals.</p>
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
              
              {/* Embed the calculator directly */}
              <div className="calculator-wrapper">
                <DSCRCalculator isEmbedded={true} />
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
