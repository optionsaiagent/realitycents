/*
 * Pacific Modernism — "What Can I Afford?" Affordability Calculator
 * Calculates maximum home price based on income, debts, and DTI ratio
 */
import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  DollarSign,
  TrendingUp,
  Home,
  FileCheck,
  Phone,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number, d = 1): string { return `${n.toFixed(d)}%`; }

const PIE_COLORS = [
  "oklch(0.55 0.12 195)", "oklch(0.72 0.10 60)", "oklch(0.45 0.12 195)",
  "oklch(0.65 0.10 195)", "oklch(0.82 0.08 60)",
];

// ─── Input Component ──────────────────────────────────────────────────────────
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
          className={`w-full ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-12" : "pr-3"} py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
      </div>
      {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
    </div>
  );
}

export default function AffordabilityCalculator() {
  const [grossIncome, setGrossIncome] = useState(10000);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [dtiRatio, setDtiRatio] = useState(43);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.000);
  const [loanTerm, setLoanTerm] = useState<15 | 30>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(0.35);
  const [insurance, setInsurance] = useState(150);
  const [hoaFees, setHoaFees] = useState(400);

  const result = useMemo(() => {
    // Max total housing payment allowed by DTI
    const maxTotalHousing = (grossIncome * dtiRatio / 100) - monthlyDebts;
    if (maxTotalHousing <= 0) return null;

    // Subtract fixed monthly costs to get max P&I
    const fixedMonthly = insurance + hoaFees;
    const maxPIBeforeTax = maxTotalHousing - fixedMonthly;
    if (maxPIBeforeTax <= 0) return null;

    // We need to solve for home price where:
    // P&I(loanAmount) + monthlyPropertyTax(homePrice) = maxPIBeforeTax
    // loanAmount = homePrice - downPayment
    // monthlyPropertyTax = homePrice * propertyTaxRate / 100 / 12
    // P&I = loanAmount * [r(1+r)^n] / [(1+r)^n - 1]
    // Let's iterate to find the max home price

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    if (monthlyRate <= 0 || numPayments <= 0) return null;

    const factor = (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    // P&I = (homePrice - downPayment) * factor
    // Tax = homePrice * propertyTaxRate / 100 / 12
    // (homePrice - downPayment) * factor + homePrice * taxRate/100/12 = maxPIBeforeTax
    // homePrice * factor - downPayment * factor + homePrice * taxRate/1200 = maxPIBeforeTax
    // homePrice * (factor + taxRate/1200) = maxPIBeforeTax + downPayment * factor
    // homePrice = (maxPIBeforeTax + downPayment * factor) / (factor + taxRate/1200)

    const monthlyTaxFactor = propertyTaxRate / 100 / 12;
    const maxHomePrice = (maxPIBeforeTax + downPayment * factor) / (factor + monthlyTaxFactor);

    if (maxHomePrice <= downPayment || maxHomePrice <= 0) return null;

    const loanAmount = maxHomePrice - downPayment;
    const monthlyPI = loanAmount * factor;
    const monthlyTax = maxHomePrice * monthlyTaxFactor;
    const totalHousing = monthlyPI + monthlyTax + insurance + hoaFees;
    const actualDTI = grossIncome > 0 ? ((totalHousing + monthlyDebts) / grossIncome) * 100 : 0;

    return {
      maxHomePrice: Math.round(maxHomePrice),
      loanAmount: Math.round(loanAmount),
      monthlyPI: Math.round(monthlyPI),
      monthlyTax: Math.round(monthlyTax),
      monthlyInsurance: insurance,
      monthlyHOA: hoaFees,
      totalHousing: Math.round(totalHousing),
      maxTotalHousing: Math.round(maxTotalHousing),
      actualDTI,
    };
  }, [grossIncome, monthlyDebts, dtiRatio, downPayment, interestRate, loanTerm, propertyTaxRate, insurance, hoaFees]);

  const pieData = result ? [
    { name: "Principal & Interest", value: result.monthlyPI },
    ...(result.monthlyTax > 0 ? [{ name: "Property Tax", value: result.monthlyTax }] : []),
    ...(result.monthlyInsurance > 0 ? [{ name: "Insurance", value: result.monthlyInsurance }] : []),
    ...(result.monthlyHOA > 0 ? [{ name: "HOA Fees", value: result.monthlyHOA }] : []),
  ].filter(d => d.value > 0) : [];

  return (
    <Layout>
      <SEO
        title="What Can I Afford? — Hawaii Home Affordability Calculator"
        description="Find out how much home you can afford in Hawaii. Enter your income, debts, and down payment to calculate your maximum purchase price based on DTI ratios."
        url="/affordability-calculator"
        keywords="home affordability calculator Hawaii, how much house can I afford, Hawaii mortgage affordability, DTI calculator, home buying budget Hawaii"
      />
      <PageHero
        title="What Can I Afford?"
        subtitle="Calculate your maximum home purchase price based on your income, debts, and down payment. Get a realistic picture of your buying power in Hawaii."
        image={IMAGES.heroCalculator}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Inputs Panel */}
            <div className="lg:col-span-2">
              <div className="sticky top-28">
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-teal" />
                    Your Financial Profile
                  </h3>

                  <div className="space-y-3">
                    <InputField label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" suffix="/mo" step={500} min={0} helpText="Before taxes and deductions" />
                    <InputField label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" suffix="/mo" step={50} min={0} helpText="Car loans, student loans, credit cards, etc." />

                    {/* DTI Ratio */}
                    <div>
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">Target DTI Ratio</label>
                      <div className="relative">
                        <input
                          type="number" value={dtiRatio}
                          onChange={(e) => setDtiRatio(Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          step={1} min={20} max={65}
                          className="w-full pl-3 pr-10 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                      <div className="mt-2 bg-sand/50 rounded-lg p-2.5 border border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-body font-semibold text-navy">DTI Guidelines:</span><br />
                          Conventional & FHA: typically up to 45%<br />
                          VA: can go higher (no hard cap, often 50%+)<br />
                          Most lenders prefer ≤ 43%
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Loan Details</p>
                      <div className="space-y-3">
                        <InputField label="Down Payment Available" value={downPayment} onChange={setDownPayment} prefix="$" step={10000} min={0} />
                        <InputField label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" step={0.125} min={0} max={20} helpText="Estimated rate (0.125% increments)" />

                        {/* Loan Term */}
                        <div>
                          <label className="block text-sm font-body font-medium text-navy mb-1.5">Loan Term</label>
                          <div className="grid grid-cols-2 gap-2">
                            {([15, 30] as const).map((term) => (
                              <button key={term} onClick={() => setLoanTerm(term)}
                                className={`py-2 rounded-md text-sm font-body font-medium transition-all ${loanTerm === term ? "bg-teal text-white shadow-md shadow-teal/20" : "bg-sand text-muted-foreground hover:bg-sand-dark"}`}
                              >{term} years</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Costs (Optional)</p>
                      <div className="space-y-3">
                        <InputField label="Property Tax Rate (Annual)" value={propertyTaxRate} onChange={setPropertyTaxRate} suffix="%" step={0.05} min={0} max={5} helpText="Hawaii avg: ~0.28% (Honolulu County)" />
                        <InputField label="Homeowner's Insurance" value={insurance} onChange={setInsurance} prefix="$" suffix="/mo" step={25} min={0} />
                        <InputField label="HOA Fees" value={hoaFees} onChange={setHoaFees} prefix="$" suffix="/mo" step={25} min={0} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-3">
              {result ? (
                <>
                  {/* Main Result Card */}
                  <div className="bg-navy rounded-xl p-6 lg:p-8 mb-6">
                    <div className="text-center mb-6">
                      <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-2">You Can Afford Up To</p>
                      <p className="font-display text-4xl lg:text-5xl text-white mb-2">{fmt(result.maxHomePrice)}</p>
                      <p className="text-sand/60 text-sm">Based on {fmtPct(dtiRatio, 0)} DTI with {fmt(downPayment)} down</p>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-sand/50 mb-1">Loan Amount</p>
                        <p className="text-white text-sm font-body font-bold">{fmt(result.loanAmount)}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-sand/50 mb-1">Max Housing</p>
                        <p className="text-white text-sm font-body font-bold">{fmt(result.maxTotalHousing)}/mo</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-sand/50 mb-1">Actual DTI</p>
                        <p className="text-white text-sm font-body font-bold">{fmtPct(result.actualDTI)}</p>
                      </div>
                    </div>

                    {/* Itemized Breakdown */}
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <p className="text-xs font-body font-semibold uppercase tracking-wider text-sand/50 mb-2">Monthly Payment Breakdown</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-sand/70">Principal & Interest</span>
                        <span className="text-white font-body font-medium">{fmt(result.monthlyPI)}</span>
                      </div>
                      {result.monthlyTax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-sand/70">Property Tax</span>
                          <span className="text-white font-body font-medium">{fmt(result.monthlyTax)}</span>
                        </div>
                      )}
                      {result.monthlyInsurance > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-sand/70">Insurance</span>
                          <span className="text-white font-body font-medium">{fmt(result.monthlyInsurance)}</span>
                        </div>
                      )}
                      {result.monthlyHOA > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-sand/70">HOA Fees</span>
                          <span className="text-white font-body font-medium">{fmt(result.monthlyHOA)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                        <span className="text-white font-body font-bold">Total Housing Payment</span>
                        <span className="text-gold font-body font-bold text-base">{fmt(result.totalHousing)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sand/50">+ Existing Debts</span>
                        <span className="text-sand/60 font-body font-medium">{fmt(monthlyDebts)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                        <span className="text-sand/70">Total Monthly Obligations</span>
                        <span className="text-white font-body font-semibold">{fmt(result.totalHousing + monthlyDebts)}</span>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="mt-6">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: "#0C2340", border: "none", borderRadius: "8px", color: "#F5E6D3", fontSize: "13px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1.5 mt-2">
                        {pieData.map((item, i) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-xs text-sand/60">{item.name}</span>
                            </div>
                            <span className="text-xs font-body font-semibold text-sand/80">{fmt(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h3 className="font-display text-xl text-navy mb-4">Important Considerations</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">This is an <span className="font-body font-semibold text-navy">estimate only</span>. Your actual qualifying amount depends on credit score, loan type, employment history, assets, and lender guidelines.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">This calculation does <span className="font-body font-semibold text-navy">not include PMI, MIP, or VA funding fees</span>, which would reduce your maximum purchase price. Use the <a href="/advanced-calculator" className="text-teal hover:underline font-body font-medium">Advanced Calculator</a> for loan-specific details.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">Hawaii's property tax rates are among the lowest in the nation (~0.28% for owner-occupied in Honolulu County), but home prices are significantly higher than the national average.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Home className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">Many Hawaii condos have substantial HOA fees ($400–$1,200+/mo). Factor these into your budget when searching for properties.</p>
                      </div>
                    </div>
                  </div>

                  {/* DTI Explanation */}
                  <div className="bg-sand/30 rounded-xl border border-border p-6 mb-6">
                    <h3 className="font-display text-xl text-navy mb-3">Understanding DTI Ratios</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your <span className="font-body font-semibold text-navy">Debt-to-Income (DTI) ratio</span> is the percentage of your gross monthly income that goes toward debt payments. Lenders use this to determine how much you can afford.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 font-body font-semibold text-navy">DTI Range</th>
                            <th className="text-left py-2 px-4 font-body font-semibold text-navy">Rating</th>
                            <th className="text-left py-2 pl-4 font-body font-semibold text-navy">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { range: "≤ 36%", rating: "Excellent", notes: "Strong qualifying position, best rates", color: "text-teal" },
                            { range: "37–43%", rating: "Good", notes: "Standard qualifying range for most loans", color: "text-navy" },
                            { range: "44–49%", rating: "Acceptable", notes: "May qualify with compensating factors", color: "text-gold" },
                            { range: "50%+", rating: "High", notes: "VA loans may still qualify; others unlikely", color: "text-destructive" },
                          ].map((row) => (
                            <tr key={row.range} className="border-b border-border/50">
                              <td className="py-2.5 pr-4 font-body font-medium text-navy">{row.range}</td>
                              <td className={`py-2.5 px-4 font-body font-semibold ${row.color}`}>{row.rating}</td>
                              <td className="py-2.5 pl-4 text-muted-foreground">{row.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl text-navy mb-2">Adjust Your Inputs</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your income and financial details to see how much home you can afford. Make sure your maximum housing payment (income × DTI - debts) is positive.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="bg-navy rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20">
                <div>
                  <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">Know Your Number?</p>
                  <h3 className="font-display text-xl text-white mb-1">Get Pre-Approved to Confirm</h3>
                  <p className="text-sm text-sand/70">
                    A pre-approval letter confirms your actual qualifying amount and shows sellers you're serious.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <a href={PRE_APPROVAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-md text-sm font-body font-semibold transition-all hover:shadow-lg hover:shadow-gold/30">
                    <FileCheck className="w-4 h-4" />Get Pre-Approved
                  </a>
                  <a href={`tel:${LENDER.phone}`} className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-md text-sm font-body font-semibold transition-all">
                    <Phone className="w-4 h-4" />Call Jay
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
