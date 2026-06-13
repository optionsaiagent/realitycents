/*
 * Pacific Modernism — Temporary Buydown Calculator
 * Compares 1/1, 2/1, and 3/2/1 buydown structures side-by-side
 * Reads loan & rate from URL params for cross-calculator data passing
 */
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import EmailResults from "@/components/EmailResults";
import { Link } from "wouter";
import {
  ArrowRight,
  FileCheck,
  Phone,
  TrendingDown,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  Link2,
  Check,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

// ─── Formatting Helpers ──────────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtExact(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function fmtPct(n: number, d = 3): string { return `${n.toFixed(d)}%`; }

// ─── Input Component ─────────────────────────────────────────────────────────
function InputField({ label, value, onChange, prefix, suffix, step, min, max, helpText }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: number; min?: number; max?: number;
  helpText?: string;
}) {
  return (
    <div>
      {label && <label className="block text-sm font-body font-medium text-navy mb-1.5">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
        <input
          type="number" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          step={step || 1} min={min} max={max}
          className={`w-full ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-10" : "pr-3"} py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
      </div>
      {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
    </div>
  );
}

// ─── P&I Calculation ─────────────────────────────────────────────────────────
function calcMonthlyPI(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Buydown Type Definitions ────────────────────────────────────────────────
interface BuydownYear {
  year: number;
  rateReduction: number; // percentage points below note rate
  buydownRate: number;
  monthlyPI: number;
  noteRatePI: number;
  monthlySavings: number;
  annualSavings: number;
}

interface BuydownResult {
  name: string;
  shortName: string;
  description: string;
  years: BuydownYear[];
  totalSellerCredit: number;
  year1MonthlySavings: number;
}

function calculateBuydown(
  name: string,
  shortName: string,
  description: string,
  reductions: number[], // rate reductions per year (e.g. [2, 1] for 2/1)
  loanAmount: number,
  noteRate: number,
  loanTerm: number
): BuydownResult {
  const noteRatePI = calcMonthlyPI(loanAmount, noteRate, loanTerm);
  let totalSellerCredit = 0;
  const years: BuydownYear[] = [];

  for (let i = 0; i < reductions.length; i++) {
    const reduction = reductions[i];
    const buydownRate = Math.max(0, noteRate - reduction);
    const monthlyPI = calcMonthlyPI(loanAmount, buydownRate, loanTerm);
    const monthlySavings = noteRatePI - monthlyPI;
    const annualSavings = monthlySavings * 12;
    totalSellerCredit += annualSavings;

    years.push({
      year: i + 1,
      rateReduction: reduction,
      buydownRate,
      monthlyPI,
      noteRatePI,
      monthlySavings,
      annualSavings,
    });
  }

  return {
    name,
    shortName,
    description,
    years,
    totalSellerCredit,
    year1MonthlySavings: years[0]?.monthlySavings || 0,
  };
}

// ─── Buydown Card Component ──────────────────────────────────────────────────
function BuydownCard({ result, isHighlighted }: { result: BuydownResult; isHighlighted?: boolean }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`rounded-xl border ${isHighlighted ? "border-teal bg-teal/5 ring-2 ring-teal/20" : "border-border bg-white"} overflow-hidden transition-all`}>
      {/* Header */}
      <div className={`px-5 py-4 ${isHighlighted ? "bg-teal/10" : "bg-sand/50"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl text-navy">{result.shortName} Buydown</h3>
              {isHighlighted && (
                <span className="text-[10px] font-body font-bold uppercase tracking-wider bg-teal text-white px-2 py-0.5 rounded-full">Most Popular</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{result.description}</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-full bg-navy/10 hover:bg-navy/20 flex items-center justify-center transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-navy" /> : <ChevronDown className="w-4 h-4 text-navy" />}
          </button>
        </div>
      </div>

      {/* Summary stats — always visible */}
      <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-border/50">
        <div>
          <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Seller Credit Needed</p>
          <p className="font-display text-2xl text-navy">{fmt(result.totalSellerCredit)}</p>
        </div>
        <div>
          <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Year 1 Monthly Savings</p>
          <p className="font-display text-2xl text-teal">{fmtExact(result.year1MonthlySavings)}</p>
        </div>
      </div>

      {/* Year-by-year table */}
      {expanded && (
        <div className="px-5 py-4">
          {/* Mobile: 4-col table (Year, Rate, P&I, Savings). Desktop: 5-col with Note Rate P&I added. */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-2 font-body font-semibold text-navy text-xs uppercase tracking-wider w-[20%]">Yr</th>
                <th className="text-right py-2 px-1 font-body font-semibold text-navy text-xs uppercase tracking-wider w-[22%]">Rate</th>
                <th className="text-right py-2 px-1 font-body font-semibold text-navy text-xs uppercase tracking-wider w-[26%]">P&amp;I</th>
                <th className="hidden sm:table-cell text-right py-2 px-1 font-body font-semibold text-navy text-xs uppercase tracking-wider">Note P&amp;I</th>
                <th className="text-right py-2 pl-1 font-body font-semibold text-navy text-xs uppercase tracking-wider w-[32%]">Savings</th>
              </tr>
            </thead>
            <tbody>
              {result.years.map((yr) => (
                <tr key={yr.year} className="border-b border-border/30 last:border-0">
                  <td className="py-2 pr-2 font-body font-medium text-navy text-xs">Yr {yr.year}</td>
                  <td className="py-2 px-1 text-right">
                    <span className="font-body font-semibold text-teal text-xs">{fmtPct(yr.buydownRate, 2)}</span>
                    <span className="hidden sm:inline text-xs text-muted-foreground ml-1">(-{yr.rateReduction}%)</span>
                  </td>
                  <td className="py-2 px-1 text-right font-body font-medium text-navy text-xs">{fmt(yr.monthlyPI)}</td>
                  <td className="hidden sm:table-cell py-2 px-1 text-right text-muted-foreground text-xs">{fmt(yr.noteRatePI)}</td>
                  <td className="py-2 pl-1 text-right font-body font-semibold text-teal text-xs">{fmt(yr.monthlySavings)}</td>
                </tr>
              ))}
              {/* Note rate row */}
              <tr className="bg-sand/30">
                <td className="py-2 pr-2 font-body font-medium text-navy/60 text-xs">Yr {result.years.length + 1}+</td>
                <td className="py-2 px-1 text-right text-navy/60 text-xs">{fmtPct(result.years[0]?.noteRatePI ? result.years[0].buydownRate + result.years[0].rateReduction : 0, 2)}</td>
                <td className="py-2 px-1 text-right text-navy/60 text-xs">{fmt(result.years[0]?.noteRatePI || 0)}</td>
                <td className="hidden sm:table-cell py-2 px-1 text-right text-navy/60 text-xs">{fmt(result.years[0]?.noteRatePI || 0)}</td>
                <td className="py-2 pl-1 text-right text-navy/40 text-xs">—</td>
              </tr>
            </tbody>
          </table>

          {/* Annual savings breakdown */}
          <div className="mt-4 p-3 rounded-lg bg-sand/50">
            <p className="text-xs font-body font-semibold text-navy mb-2">Seller Credit Breakdown</p>
            <div className="space-y-1">
              {result.years.map((yr) => (
                <div key={yr.year} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Year {yr.year}: {fmtExact(yr.monthlySavings)} × 12 months</span>
                  <span className="font-body font-medium text-navy">{fmtExact(yr.annualSavings)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1.5 border-t border-border/50 mt-1.5">
                <span className="font-body font-semibold text-navy">Total Seller Credit</span>
                <span className="font-body font-bold text-teal">{fmt(result.totalSellerCredit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function BuydownCalculator() {
  // Read URL params for cross-calculator data passing
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialLoan = Number(urlParams.get("loan")) || 700000;
  const initialRate = Number(urlParams.get("rate")) || 6.875;
  const initialTerm = Number(urlParams.get("term")) || 30;

  const [loanAmount, setLoanAmount] = useState(initialLoan);
  const [noteRate, setNoteRate] = useState(initialRate);
  const [loanTerm, setLoanTerm] = useState(initialTerm);

  // Auto-calculate on URL param load
  const [hasAutoCalculated, setHasAutoCalculated] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handlePrint = () => {
    const el = document.getElementById('buydown-print-content');
    if (el) el.classList.remove('hidden');
    window.print();
    setTimeout(() => {
      if (el) el.classList.add('hidden');
    }, 1000);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/buydown-calculator?loan=${loanAmount}&rate=${noteRate}&term=${loanTerm}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      toast.success("Link copied! Share it with your agent, seller, or spouse.");
      setTimeout(() => setLinkCopied(false), 3000);
    }).catch(() => {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopied(true);
      toast.success("Link copied! Share it with your agent, seller, or spouse.");
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };
  useEffect(() => {
    if (urlParams.get("loan") || urlParams.get("rate")) {
      setHasAutoCalculated(true);
    }
  }, []);

  // Calculate all three buydown types
  const buydowns = useMemo(() => [
    calculateBuydown(
      "1/1 Buydown", "1/1",
      "Rate reduced by 1% for Year 1, then note rate from Year 2 onward",
      [1],
      loanAmount, noteRate, loanTerm
    ),
    calculateBuydown(
      "2/1 Buydown", "2/1",
      "Rate reduced by 2% in Year 1, 1% in Year 2, then note rate from Year 3 onward",
      [2, 1],
      loanAmount, noteRate, loanTerm
    ),
    calculateBuydown(
      "3/2/1 Buydown", "3/2/1",
      "Rate reduced by 3% in Year 1, 2% in Year 2, 1% in Year 3, then note rate from Year 4 onward",
      [3, 2, 1],
      loanAmount, noteRate, loanTerm
    ),
  ], [loanAmount, noteRate, loanTerm]);

  const noteRatePI = calcMonthlyPI(loanAmount, noteRate, loanTerm);

  return (
    <Layout>
      <SEO
        title="Temporary Buydown Calculator — 1/1, 2/1 & 3/2/1 Buydowns | Hawaii Mortgage"
        description="Calculate seller credits for 1/1, 2/1, and 3/2/1 temporary mortgage buydowns. See exactly how much a seller needs to contribute to reduce your rate in Years 1–3. Free tool for Hawaii homebuyers."
        url="/buydown-calculator"
        keywords="temporary buydown calculator, 2/1 buydown, 3/2/1 buydown, seller credit calculator, mortgage buydown Hawaii, interest rate buydown"
      />

      <PageHero
        title="Temporary Buydown Calculator"
        subtitle="Compare 1/1, 2/1, and 3/2/1 buydown structures to see how much a seller credit can reduce your payments in the early years of your loan."
        image={IMAGES.heroCalculator}
        compact
        className="no-print"
      />

      <section className="py-10 lg:py-14 no-print-page">
        <div className="container">
          {/* Intro explainer */}
          <div className="max-w-3xl mb-10">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal/5 border border-teal/20">
              <Info className="w-5 h-5 text-teal mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-body font-semibold text-navy mb-1">What is a temporary buydown?</p>
                <p>A temporary buydown is a <strong className="text-navy">seller-paid</strong> (or lender-paid) credit that temporarily reduces the buyer's interest rate for the first 1–3 years of the loan, then reverts to the full note rate. The cost of the buydown equals the total monthly payment savings over the buydown period — this is the amount the buyer should ask the seller to credit at closing.</p>
                <p className="mt-2">Buydowns are especially useful in a high-rate environment because they give buyers lower payments during the years when they're most likely to refinance if rates drop.</p>
              </div>
            </div>
          </div>

          {/* URL param auto-populate notice */}
          {hasAutoCalculated && (
            <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-gold/10 border border-gold/30">
              <TrendingDown className="w-4 h-4 text-gold shrink-0" />
              <p className="text-sm text-navy">
                <span className="font-body font-semibold">Inputs pre-filled</span> from your previous calculator. Adjust as needed.
              </p>
            </div>
          )}

          {/* Input section */}
          <div className="bg-white rounded-xl border border-border p-6 mb-10">
            <h2 className="font-display text-lg text-navy mb-5">Loan Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <InputField
                label="Loan Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                prefix="$"
                step={10000}
                min={0}
                helpText="The total loan amount (not home price)"
              />
              <InputField
                label="Note Rate"
                value={noteRate}
                onChange={setNoteRate}
                suffix="%"
                step={0.125}
                min={0}
                max={20}
                helpText="Your actual interest rate (e.g. 6.875%)"
              />
              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">Loan Term</label>
                <div className="flex gap-2">
                  {[30, 15].map((term) => (
                    <button
                      key={term}
                      onClick={() => setLoanTerm(term)}
                      className={`flex-1 py-2.5 rounded-md text-sm font-body font-semibold transition-all ${
                        loanTerm === term
                          ? "bg-navy text-white shadow-md"
                          : "bg-sand text-navy hover:bg-sand-dark"
                      }`}
                    >
                      {term} Years
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Fixed-rate loan term</p>
              </div>
            </div>

            {/* Note rate payment reference + Share button */}
            <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground">Note Rate P&I Payment</p>
                  <p className="font-display text-lg text-navy">{fmtExact(noteRatePI)}<span className="text-xs text-muted-foreground font-body ml-1">/mo</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground">Note Rate</p>
                  <p className="font-display text-lg text-navy">{fmtPct(noteRate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground">Loan Amount</p>
                  <p className="font-display text-lg text-navy">{fmt(loanAmount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-white border border-navy/30 hover:border-navy hover:bg-navy/5 text-navy px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={handleShareLink}
                className="inline-flex items-center gap-2 bg-white border border-teal/40 hover:border-teal hover:bg-teal/5 text-teal px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all shadow-sm hover:shadow-md"
              >
                {linkCopied ? (
                  <><Check className="w-4 h-4" /> Link Copied!</>
                ) : (
                  <><Link2 className="w-4 h-4" /> Share This Scenario</>
                )}
              </button>
              </div>
            </div>
          </div>

          {/* Side-by-side comparison summary */}
          <div className="mb-8">
            <h2 className="font-display text-2xl text-navy mb-5">Buydown Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {buydowns.map((bd, i) => (
                <div
                  key={bd.shortName}
                  className={`rounded-xl p-5 text-center ${
                    i === 1
                      ? "bg-teal/10 border-2 border-teal ring-2 ring-teal/10"
                      : "bg-sand/50 border border-border"
                  }`}
                >
                  {i === 1 && (
                    <span className="inline-block text-[10px] font-body font-bold uppercase tracking-wider bg-teal text-white px-2.5 py-0.5 rounded-full mb-2">Most Popular</span>
                  )}
                  <h3 className="font-display text-xl text-navy">{bd.shortName} Buydown</h3>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground">Seller Credit</p>
                      <p className="font-display text-2xl text-navy">{fmt(bd.totalSellerCredit)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground">Year 1 Monthly Savings</p>
                      <p className="font-display text-xl text-teal">{fmtExact(bd.year1MonthlySavings)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground">Year 1 Rate</p>
                      <p className="font-body font-semibold text-navy">{fmtPct(bd.years[0]?.buydownRate || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed buydown cards */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-navy">Detailed Breakdown</h2>
            {buydowns.map((bd, i) => (
              <BuydownCard key={bd.shortName} result={bd} isHighlighted={i === 1} />
            ))}
          </div>

          {/* How to use this section */}
          <div className="mt-10 p-6 rounded-xl bg-sand border border-border">
            <h3 className="font-display text-lg text-navy mb-3">How to Use This Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center shrink-0 text-xs font-body font-bold">1</div>
                <div>
                  <p className="font-body font-semibold text-navy mb-0.5">Choose your buydown</p>
                  <p>The 2/1 buydown is the most common. The 3/2/1 offers the biggest Year 1 savings but costs more. The 1/1 is the most affordable option.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center shrink-0 text-xs font-body font-bold">2</div>
                <div>
                  <p className="font-body font-semibold text-navy mb-0.5">Request the seller credit</p>
                  <p>Ask the seller to credit the "Total Seller Credit" amount at closing. This covers the full cost of the buydown — the buyer pays nothing extra.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center shrink-0 text-xs font-body font-bold">3</div>
                <div>
                  <p className="font-body font-semibold text-navy mb-0.5">Enjoy lower payments</p>
                  <p>Your payments are reduced during the buydown period. If rates drop, you can refinance — the buydown savings are yours to keep either way.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other calculators */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/calculator"
              className="flex items-center gap-3 p-4 rounded-xl bg-teal/5 border border-teal/20 hover:bg-teal/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal/15 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-teal" />
              </div>
              <div>
                <p className="font-body font-semibold text-navy text-sm group-hover:text-teal transition-colors">Basic Mortgage Calculator</p>
                <p className="text-xs text-muted-foreground">Quick monthly payment estimate with amortization</p>
              </div>
              <ArrowRight className="w-4 h-4 text-teal ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/advanced-calculator"
              className="flex items-center gap-3 p-4 rounded-xl bg-teal/5 border border-teal/20 hover:bg-teal/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal/15 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-teal" />
              </div>
              <div>
                <p className="font-body font-semibold text-navy text-sm group-hover:text-teal transition-colors">Advanced Mortgage Calculator</p>
                <p className="text-xs text-muted-foreground">Conventional, VA, FHA & Jumbo with real PMI rates</p>
              </div>
              <ArrowRight className="w-4 h-4 text-teal ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-navy rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">Need Help Structuring a Buydown?</p>
              <h3 className="font-display text-xl text-white mb-1">Get Pre-Approved Today</h3>
              <p className="text-sm text-sand/70">
                Jay Miller can help you negotiate the right buydown with your seller — takes just minutes to get started.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={PRE_APPROVAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-md text-sm font-body font-semibold transition-all hover:shadow-lg hover:shadow-gold/30"
              >
                <FileCheck className="w-4 h-4" />
                Get Pre-Approved
              </a>
              <a
                href={`tel:${LENDER.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-md text-sm font-body font-semibold transition-all"
              >
                <Phone className="w-4 h-4" />
                Call Jay
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRINT-ONLY SUMMARY ─────────────────────────────────────────────── */}
      <div id="buydown-print-content" className="hidden">
        <div className="print-summary">
          {/* Header */}
          <div className="print-header">
            <div>
              <div className="print-logo-text">RealityCents</div>
              <div className="print-logo-tagline">Hawaii Mortgage Education &amp; Lending</div>
            </div>
            <div className="print-meta">
              <div className="print-meta-name">{LENDER.name} — NMLS #{LENDER.nmls}</div>
              <div>{LENDER.company} — Branch NMLS #{LENDER.branchNmls}</div>
              <div>{LENDER.phone} · {LENDER.email}</div>
              <div className="print-meta-date">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Scenario highlight banner */}
          <div className="print-highlight">
            <div className="print-highlight-left">
              <span className="print-badge">Buydown Analysis</span>
              <div className="big-label">Note Rate</div>
              <div className="big-number">{fmtPct(noteRate)}</div>
              <div className="print-highlight-sub">{fmt(loanAmount)} · {loanTerm}-Year Fixed</div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div className="big-label">Note Rate P&amp;I Payment</div>
              <div className="big-number">{fmtExact(noteRatePI)}</div>
              <div className="print-highlight-sub">per month at full rate</div>
            </div>
          </div>

          {/* Loan Summary */}
          <h2>Scenario Summary</h2>
          <div className="print-grid">
            <div className="print-row"><span className="label">Loan Amount</span><span className="value">{fmt(loanAmount)}</span></div>
            <div className="print-row"><span className="label">Note Rate</span><span className="value">{fmtPct(noteRate)}</span></div>
            <div className="print-row"><span className="label">Loan Term</span><span className="value">{loanTerm} Years</span></div>
            <div className="print-row"><span className="label">Note Rate P&amp;I</span><span className="value">{fmtExact(noteRatePI)}/mo</span></div>
          </div>

          {/* Comparison Table */}
          <h2>Buydown Comparison</h2>
          <table className="print-buydown-table">
            <thead>
              <tr>
                <th>Buydown Type</th>
                <th>Year 1 Rate</th>
                <th>Year 1 Monthly Savings</th>
                <th>Year 2 Rate</th>
                <th>Year 2 Monthly Savings</th>
                <th>Total Seller Credit</th>
              </tr>
            </thead>
            <tbody>
              {buydowns.map((bd) => (
                <tr key={bd.shortName}>
                  <td className="buydown-label">{bd.shortName} Buydown</td>
                  <td>{fmtPct(bd.years[0]?.buydownRate || 0)}</td>
                  <td>{fmtExact(bd.years[0]?.monthlySavings || 0)}</td>
                  <td>{bd.years[1] ? fmtPct(bd.years[1].buydownRate) : fmtPct(noteRate) + ' (note)'}</td>
                  <td>{bd.years[1] ? fmtExact(bd.years[1].monthlySavings) : '$0.00'}</td>
                  <td>{fmt(bd.totalSellerCredit)}</td>
                </tr>
              ))}
              <tr className="buydown-total-row">
                <td className="buydown-total-label" colSpan={5}>Best Value: 2/1 Buydown (most popular)</td>
                <td className="buydown-total-value">{fmt(buydowns[1]?.totalSellerCredit || 0)}</td>
              </tr>
            </tbody>
          </table>

          {/* Detailed year-by-year for each buydown */}
          {buydowns.map((bd) => (
            <div key={bd.shortName} className="print-section">
              <h2>{bd.shortName} Buydown — Year-by-Year Detail</h2>
              <table className="print-buydown-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Buydown Rate</th>
                    <th>Buydown P&amp;I</th>
                    <th>Note Rate P&amp;I</th>
                    <th>Monthly Savings</th>
                    <th>Annual Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {bd.years.map((yr) => (
                    <tr key={yr.year}>
                      <td className="buydown-label">Year {yr.year}</td>
                      <td>{fmtPct(yr.buydownRate)} <span style={{color:'#6b7280', fontSize:'8pt'}}>(-{yr.rateReduction}%)</span></td>
                      <td>{fmtExact(yr.monthlyPI)}</td>
                      <td>{fmtExact(yr.noteRatePI)}</td>
                      <td>{fmtExact(yr.monthlySavings)}</td>
                      <td>{fmtExact(yr.annualSavings)}</td>
                    </tr>
                  ))}
                  <tr className="buydown-total-row">
                    <td className="buydown-total-label" colSpan={5}>Total Seller Credit Needed</td>
                    <td className="buydown-total-value">{fmt(bd.totalSellerCredit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Best Option */}
          <div className="print-best-option">
            <div className="best-label">Recommended Option</div>
            <div className="best-name">2/1 Buydown — Most Popular Choice</div>
            <div className="best-detail">Seller credit needed: {fmt(buydowns[1]?.totalSellerCredit || 0)} · Year 1 savings: {fmtExact(buydowns[1]?.year1MonthlySavings || 0)}/mo · Year 1 rate: {fmtPct(buydowns[1]?.years[0]?.buydownRate || 0)}</div>
          </div>

          {/* Email Results */}
          <EmailResults calculator="buydown" />

          {/* Disclaimer */}
          <div className="print-note">
            This estimate is for informational purposes only and does not constitute a loan commitment or guarantee of financing. Actual rates, payments, and seller credit requirements may vary based on loan type, credit profile, property type, and market conditions. Contact Jay Miller (NMLS #{LENDER.nmls}) at {LENDER.phone} for a personalized quote. {LENDER.company} NMLS #{LENDER.companyNmls}. Equal Housing Lender.
          </div>
        </div>
      </div>
    </Layout>
  );
}
