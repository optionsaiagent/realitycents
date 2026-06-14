/*
 * Pacific Modernism — "Win the Bid" Escalation Calculator
 * Reframes bidding wars from sticker shock into real monthly cost terms,
 * with appraisal gap exposure and cost-of-not-winning analysis.
 * Designed to be used LIVE during offer negotiations on mobile.
 */
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import EmailResults from "@/components/EmailResults";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
  Zap,
  Target,
  Clock,
  ShieldAlert,
  Flame,
} from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(n);
  }
  return fmt(n);
}

// ─── Input Component ──────────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
  min,
  max,
  helpText,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  helpText?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-body font-medium text-navy mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          step={step || 1}
          min={min}
          max={max}
          className={`w-full ${prefix ? "pl-7" : "pl-3"} ${
            suffix ? "pr-12" : "pr-3"
          } py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
}

// ─── P&I Calculation ──────────────────────────────────────────────────────────
function calcMonthlyPI(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r <= 0) return principal / termMonths;
  return (principal * (r * Math.pow(1 + r, termMonths))) / (Math.pow(1 + r, termMonths) - 1);
}

export default function EscalationCalculator({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isEmbedded) {
      setIsUnlocked(true);
      return;
    }
    const savedInfo = localStorage.getItem("rc_agent_info");
    if (savedInfo) {
      setIsUnlocked(true);
    }
  }, [isEmbedded]);

  // ─── The Offer ─────────────────────────────────────────────────────────────
  const [listPrice, setListPrice] = useState(850000);
  const [loanType, setLoanType] = useState<"VA" | "FHA" | "Conventional">("Conventional");
  const [downPct, setDownPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.875);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyTax, setMonthlyTax] = useState(250);
  const [monthlyInsurance, setMonthlyInsurance] = useState(150);
  const [monthlyHOA, setMonthlyHOA] = useState(400);
  const [customEscalation, setCustomEscalation] = useState(40000);

  // ─── Appraisal Gap ─────────────────────────────────────────────────────────
  const [appraisedValue, setAppraisedValue] = useState(850000);

  // ─── Cost of Not Winning ───────────────────────────────────────────────────
  const [rateIncrease, setRateIncrease] = useState(0.25);

  // ─── Break-Even ────────────────────────────────────────────────────────────
  const [appreciationRate, setAppreciationRate] = useState(4);

  // Auto-set down payment based on loan type
  useEffect(() => {
    if (loanType === "VA") setDownPct(0);
    else if (loanType === "FHA") setDownPct(3.5);
    else setDownPct(20);
  }, [loanType]);

  // ─── Escalation Steps ──────────────────────────────────────────────────────
  const escalationAmounts = [0, 10000, 25000, 50000, 75000, 100000, customEscalation];
  // Remove duplicates and sort
  const uniqueEscalations = [...new Set(escalationAmounts)].sort((a, b) => a - b);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const escalationData = useMemo(() => {
    const termMonths = loanTerm * 12;

    return uniqueEscalations.map((escalation) => {
      const offerPrice = listPrice + escalation;
      const downPayment = offerPrice * (downPct / 100);
      const loanAmount = offerPrice - downPayment;
      const monthlyPI = calcMonthlyPI(loanAmount, interestRate, termMonths);
      const totalPITIA = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA;

      // Baseline (list price)
      const baseDown = listPrice * (downPct / 100);
      const baseLoan = listPrice - baseDown;
      const basePI = calcMonthlyPI(baseLoan, interestRate, termMonths);
      const basePITIA = basePI + monthlyTax + monthlyInsurance + monthlyHOA;

      const monthlyIncrease = totalPITIA - basePITIA;
      const dailyCost = monthlyIncrease / 30;

      return {
        escalation,
        offerPrice,
        loanAmount,
        monthlyPI,
        totalPITIA,
        monthlyIncrease,
        dailyCost,
      };
    });
  }, [listPrice, downPct, interestRate, loanTerm, monthlyTax, monthlyInsurance, monthlyHOA, uniqueEscalations]);

  // ─── Appraisal Gap ─────────────────────────────────────────────────────────
  const appraisalGapData = useMemo(() => {
    return uniqueEscalations.map((escalation) => {
      const offerPrice = listPrice + escalation;
      const gap = Math.max(0, offerPrice - appraisedValue);
      let level: "green" | "yellow" | "red";
      let message: string;
      if (gap === 0) {
        level = "green";
        message = "No gap — offer within appraised value";
      } else if (gap <= 25000) {
        level = "yellow";
        message = "Manageable gap — common in competitive markets";
      } else {
        level = "red";
        message = "Significant gap — ensure buyer has reserves";
      }
      return { escalation, offerPrice, gap, level, message };
    });
  }, [listPrice, appraisedValue, uniqueEscalations]);

  // ─── Cost of Not Winning ───────────────────────────────────────────────────
  const costOfLosing = useMemo(() => {
    const termMonths = loanTerm * 12;
    const baseDown = listPrice * (downPct / 100);
    const baseLoan = listPrice - baseDown;
    const currentPI = calcMonthlyPI(baseLoan, interestRate, termMonths);
    const higherPI = calcMonthlyPI(baseLoan, interestRate + rateIncrease, termMonths);
    const monthlyDiff = higherPI - currentPI;
    const yearlyDiff = monthlyDiff * 12;
    const lifetimeDiff = monthlyDiff * termMonths;
    return { monthlyDiff, yearlyDiff, lifetimeDiff };
  }, [listPrice, downPct, interestRate, rateIncrease, loanTerm]);

  // ─── Break-Even Timeline ───────────────────────────────────────────────────
  const breakEvenData = useMemo(() => {
    const monthlyAppreciation = appreciationRate / 100 / 12;
    return uniqueEscalations
      .filter((e) => e > 0)
      .map((escalation) => {
        // Months until home appreciates enough to cover the escalation
        // appreciation per month = listPrice * monthlyAppreciation (compounding, but linear approx for short periods)
        const monthlyGain = (listPrice + escalation) * monthlyAppreciation;
        const months = monthlyGain > 0 ? Math.ceil(escalation / monthlyGain) : 999;
        return { escalation, months };
      });
  }, [listPrice, appreciationRate, uniqueEscalations]);

  // ─── Bar Chart Data ────────────────────────────────────────────────────────
  const barChartData = escalationData.map((d) => ({
    name: d.escalation === 0 ? "List" : `+${fmtCompact(d.escalation)}`,
    payment: Math.round(d.totalPITIA),
    escalation: d.escalation,
  }));

  if (!isUnlocked && !isEmbedded) {
    return (
      <Layout>
        <SEO title="Access Gated — Escalation Calculator" description="Please access via the Agents page." url="/escalation-calculator" />
        <section className="py-24">
          <div className="container text-center">
            <div className="max-w-md mx-auto bg-card border border-border p-8 rounded-xl">
              <Lock className="w-12 h-12 text-teal mx-auto mb-4" />
              <h2 className="font-display text-2xl text-navy mb-4">Access Required</h2>
              <p className="text-muted-foreground mb-8">This professional tool is reserved for our real estate partners and investors. Please provide your info on the Agents page to unlock.</p>
              <a href="/agents" className="inline-flex items-center justify-center bg-navy text-white px-8 py-3 rounded-md font-body font-semibold hover:bg-navy-light transition-all">
                Go to Agents Page
              </a>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const calculatorContent = (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* ─── Left Panel: Inputs ─────────────────────────────────── */}
      <div className="lg:col-span-2">
        <div className="sticky top-28 space-y-5">
          {/* The Offer */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal" />
              The Offer
            </h3>

            <div className="space-y-3">
              <InputField
                label="List Price"
                value={listPrice}
                onChange={setListPrice}
                prefix="$"
                step={10000}
                min={0}
              />

              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  Loan Type
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value as "VA" | "FHA" | "Conventional")}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                >
                  <option value="Conventional">Conventional</option>
                  <option value="VA">VA Loan</option>
                  <option value="FHA">FHA Loan</option>
                </select>
              </div>

              <InputField
                label="Down Payment"
                value={downPct}
                onChange={setDownPct}
                suffix="%"
                step={1}
                min={0}
                max={100}
              />
              <InputField
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                suffix="%"
                step={0.125}
                min={0}
                max={15}
              />
              <InputField
                label="Loan Term"
                value={loanTerm}
                onChange={setLoanTerm}
                suffix="yrs"
                step={5}
                min={10}
                max={30}
              />

              <div className="border-t border-border pt-3">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Monthly Expenses
                </p>
                <div className="space-y-3">
                  <InputField
                    label="Property Tax"
                    value={monthlyTax}
                    onChange={setMonthlyTax}
                    prefix="$"
                    suffix="/mo"
                    step={25}
                    min={0}
                  />
                  <InputField
                    label="Insurance"
                    value={monthlyInsurance}
                    onChange={setMonthlyInsurance}
                    prefix="$"
                    suffix="/mo"
                    step={25}
                    min={0}
                  />
                  <InputField
                    label="HOA"
                    value={monthlyHOA}
                    onChange={setMonthlyHOA}
                    prefix="$"
                    suffix="/mo"
                    step={25}
                    min={0}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <InputField
                  label="Custom Escalation Amount"
                  value={customEscalation}
                  onChange={setCustomEscalation}
                  prefix="$"
                  step={5000}
                  min={0}
                  helpText="Add your own escalation step"
                />
              </div>
            </div>
          </div>

          {/* Analysis Inputs */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal" />
              Analysis Inputs
            </h3>

            <div className="space-y-3">
              <InputField
                label="Expected Appraised Value"
                value={appraisedValue}
                onChange={setAppraisedValue}
                prefix="$"
                step={10000}
                min={0}
                helpText="For appraisal gap analysis"
              />
              <InputField
                label="If Rates Increase By"
                value={rateIncrease}
                onChange={setRateIncrease}
                suffix="%"
                step={0.125}
                min={0}
                max={5}
                helpText="For cost-of-losing analysis"
              />
              <InputField
                label="Annual Appreciation Rate"
                value={appreciationRate}
                onChange={setAppreciationRate}
                suffix="%"
                step={0.5}
                min={0}
                max={20}
                helpText="Hawaii avg: 4-6%/year"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Results ────────────────────────────────── */}
      <div className="lg:col-span-3">
        {/* Hero Insight — The Key Takeaway */}
        {escalationData.length > 1 && escalationData[1] && (
          <div className="bg-navy rounded-xl p-6 lg:p-8 mb-6 text-center">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-3">
              What Escalation Really Costs
            </p>
            <p className="font-display text-4xl lg:text-5xl text-white mb-2">
              {fmt(escalationData.find((d) => d.escalation === 25000)?.monthlyIncrease || escalationData[1].monthlyIncrease)}
              <span className="text-2xl text-sand/70">/mo</span>
            </p>
            <p className="text-sand/70 text-sm">
              for a {fmt(escalationData.find((d) => d.escalation === 25000)?.escalation || escalationData[1].escalation)} escalation above list
            </p>
            <p className="text-gold/80 text-xs mt-2">
              That's {fmt((escalationData.find((d) => d.escalation === 25000)?.dailyCost || escalationData[1].dailyCost))}/day
            </p>
          </div>
        )}

        {/* Escalation Comparison Table */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6 overflow-x-auto">
          <h3 className="font-display text-xl text-navy mb-4">
            Escalation Breakdown
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 pr-3 font-body font-semibold text-navy">Escalation</th>
                <th className="text-right py-2 px-3 font-body font-semibold text-navy">Offer Price</th>
                <th className="text-right py-2 px-3 font-body font-semibold text-navy">Monthly PITIA</th>
                <th className="text-right py-2 px-3 font-body font-semibold text-navy">Increase</th>
                <th className="text-right py-2 pl-3 font-body font-semibold text-navy">Daily Cost</th>
              </tr>
            </thead>
            <tbody>
              {escalationData.map((row, i) => {
                const intensity = i / Math.max(escalationData.length - 1, 1);
                return (
                  <tr
                    key={row.escalation}
                    className={`border-b border-border/50 ${
                      row.escalation === 0 ? "bg-teal/5" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3 font-body font-medium text-navy">
                      {row.escalation === 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-teal" />
                          List Price
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: `oklch(${0.72 - intensity * 0.2} 0.12 ${60 + intensity * 30})`,
                            }}
                          />
                          +{fmtCompact(row.escalation)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-body font-medium text-navy">
                      {fmt(row.offerPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-body font-bold text-navy">
                      {fmt(row.totalPITIA)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.escalation === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="font-body font-semibold text-amber-700">
                          +{fmt(row.monthlyIncrease)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      {row.escalation === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {fmt(row.dailyCost)}/day
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        <div className="bg-navy rounded-xl p-6 mb-6">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-4 text-center">
            Monthly Payment at Each Escalation
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#F5E6D3"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  stroke="#F5E6D3"
                  fontSize={11}
                  domain={["dataMin - 200", "dataMax + 200"]}
                />
                <Tooltip
                  formatter={(value: number) => [fmt(value), "Monthly PITIA"]}
                  contentStyle={{
                    backgroundColor: "#0C2340",
                    border: "1px solid rgba(245,230,211,0.2)",
                    borderRadius: "8px",
                    color: "#F5E6D3",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="payment" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0
                          ? "oklch(0.55 0.12 195)"
                          : `oklch(${0.72 - (i / barChartData.length) * 0.15} 0.10 60)`
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appraisal Gap Exposure */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="font-display text-xl text-navy mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal" />
            Appraisal Gap Exposure
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If the home appraises at <span className="font-body font-semibold text-navy">{fmt(appraisedValue)}</span>, here's the additional cash needed at closing:
          </p>

          <div className="space-y-2">
            {appraisalGapData.map((row) => (
              <div
                key={row.escalation}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  row.level === "green"
                    ? "bg-emerald-50 border-emerald-200"
                    : row.level === "yellow"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {row.level === "green" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : row.level === "yellow" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-body font-medium text-navy">
                    {row.escalation === 0 ? "List Price" : `+${fmtCompact(row.escalation)}`}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-body font-bold ${
                      row.level === "green"
                        ? "text-emerald-700"
                        : row.level === "yellow"
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}
                  >
                    {row.gap === 0 ? "No gap" : fmt(row.gap) + " gap"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Loan type note */}
          <div className="mt-4 bg-sand/30 rounded-lg p-3 border border-border">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {loanType === "VA" ? (
                  <><span className="font-body font-semibold text-navy">VA loans do NOT allow appraisal gap waivers.</span> The buyer must have cash to cover any gap, or the seller must reduce the price.</>
                ) : loanType === "FHA" ? (
                  <><span className="font-body font-semibold text-navy">FHA has similar restrictions</span> to VA on appraisal gaps. The buyer needs cash reserves or price renegotiation.</>
                ) : (
                  <><span className="font-body font-semibold text-navy">Conventional buyers can waive the appraisal contingency</span> but assume the risk of bringing extra cash to closing.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Cost of NOT Winning — Highlighted Box */}
        <div className="bg-gradient-to-br from-navy via-navy to-[#1a3a5c] rounded-xl p-6 lg:p-8 mb-6 border border-gold/20 relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-10">
            <Flame className="w-24 h-24 text-gold" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-gold" />
              <h3 className="font-display text-xl text-white">
                Cost of NOT Winning
              </h3>
            </div>

            <p className="text-sm text-sand/70 mb-6">
              If you lose this home and rates go up <span className="text-gold font-body font-semibold">{rateIncrease}%</span> on your next purchase at the same price:
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-xs text-sand/50 mb-1">Monthly</p>
                <p className="text-2xl font-display text-red-400">
                  +{fmt(costOfLosing.monthlyDiff)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-xs text-sand/50 mb-1">Per Year</p>
                <p className="text-2xl font-display text-red-400">
                  +{fmt(costOfLosing.yearlyDiff)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-xs text-sand/50 mb-1">Over Loan Life</p>
                <p className="text-2xl font-display text-red-400">
                  +{fmt(costOfLosing.lifetimeDiff)}
                </p>
              </div>
            </div>

            {/* The Killer Comparison */}
            {escalationData.length > 2 && (
              <div className="bg-gold/10 rounded-lg p-4 border border-gold/30">
                <p className="text-sm text-sand leading-relaxed">
                  <span className="text-gold font-body font-bold">The comparison:</span>{" "}
                  A {fmt(escalationData[2]?.escalation || 25000)} escalation costs{" "}
                  <span className="text-white font-body font-bold">
                    {fmt(escalationData[2]?.monthlyIncrease || 0)}/month
                  </span>
                  . Losing this home and paying {rateIncrease}% more on the next one costs{" "}
                  <span className="text-red-400 font-body font-bold">
                    {fmt(costOfLosing.monthlyDiff)}/month — forever.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Break-Even Timeline */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="font-display text-xl text-navy mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal" />
            Break-Even Timeline
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            At <span className="font-body font-semibold text-navy">{appreciationRate}%</span> annual appreciation, how quickly is each escalation recovered in equity?
          </p>

          <div className="space-y-3">
            {breakEvenData.map((row) => {
              const barWidth = Math.min(100, (row.months / 24) * 100);
              return (
                <div key={row.escalation}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body font-medium text-navy">
                      +{fmtCompact(row.escalation)}
                    </span>
                    <span className="text-sm font-body font-semibold text-teal">
                      {row.months} months
                    </span>
                  </div>
                  <div className="h-2 bg-sand/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-4 italic">
            Hawaii's median appreciation has averaged 4-6% annually over the past decade. Past performance doesn't guarantee future results.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-sand/20 rounded-lg border border-border p-4 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-body font-semibold text-navy">Disclaimer:</span>{" "}
            This calculator provides estimates for educational purposes only. Actual costs depend on final loan terms, property taxes, insurance, and lender requirements. Consult with your lender before making offer decisions.
          </p>
        </div>

        {/* Email Results */}
        <EmailResults
          calculator="escalation-win-the-bid"
          resultSummary={escalationData.length > 2 ? `List: ${fmt(listPrice)} | +$25K = ${fmt(escalationData.find(d => d.escalation === 25000)?.monthlyIncrease || 0)}/mo more | Cost of losing: ${fmt(costOfLosing.monthlyDiff)}/mo forever` : undefined}
        />

        {/* CTA */}
        <ContactActions
          variant="compact"
          kicker="Ready to Win the Bid?"
          headline="Need Help Structuring a Winning Offer?"
          subtext="25+ years of Hawaii lending experience. Let's make your offer stand out."
          hideEmail
        />

        {/* Learn More */}
        <div className="mt-6 text-center">
          <a
            href="/knowledge-base"
            className="inline-flex items-center gap-2 text-sm text-teal hover:underline font-body font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            Read more about Hawaii market strategy
          </a>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return calculatorContent;
  }

  return (
    <Layout>
      <SEO
        title="Win the Bid — Escalation Calculator | Hawaii Real Estate"
        description="Reframe bidding wars into real monthly costs. See what each escalation truly costs per month, analyze appraisal gap exposure, and understand the cost of not winning."
        url="/escalation-calculator"
        keywords="escalation calculator, bidding war calculator, Hawaii real estate offer, appraisal gap, win the bid, offer strategy calculator, monthly cost of escalation"
      />
      <PageHero
        title="Win the Bid"
        subtitle="Reframe escalation from sticker shock into real monthly cost. Show your clients what winning actually costs — and what losing costs more."
        image={IMAGES.heroCalculator}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          {calculatorContent}
        </div>
      </section>
    </Layout>
  );
}
