/*
 * Pacific Modernism — Assumable Loan Calculator
 * Helps agents and buyers understand the math behind assuming an existing
 * VA/FHA loan vs. getting new financing.
 */
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingDown,
  Home,
  FileCheck,
  Phone,
  Info,
  CheckCircle,
  AlertTriangle,
  Shield,
  ArrowRight,
  Lock,
  Scale,
  Banknote,
  HandCoins,
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

function fmtFull(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const PIE_COLORS = [
  "oklch(0.55 0.12 195)", // teal
  "oklch(0.72 0.10 60)", // gold
  "oklch(0.45 0.12 195)", // dark teal
];

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

// ─── Total Interest Calculation ───────────────────────────────────────────────
function calcTotalInterest(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyPayment = calcMonthlyPI(principal, annualRate, termMonths);
  return monthlyPayment * termMonths - principal;
}

export default function AssumableCalculator({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check access if not embedded
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

  // ─── Seller's Existing Loan ────────────────────────────────────────────────
  const [loanType, setLoanType] = useState<"VA" | "FHA" | "Conventional">("VA");
  const [currentBalance, setCurrentBalance] = useState(620000);
  const [sellerRate, setSellerRate] = useState(2.75);
  const [remainingTerm, setRemainingTerm] = useState(300);
  const [originalLoanAmount, setOriginalLoanAmount] = useState(700000);

  // ─── Purchase Details ──────────────────────────────────────────────────────
  const [purchasePrice, setPurchasePrice] = useState(850000);
  const [gapCash, setGapCash] = useState(230000);

  // Auto-calc gap when price or balance changes
  useEffect(() => {
    setGapCash(Math.max(0, purchasePrice - currentBalance));
  }, [purchasePrice, currentBalance]);

  // ─── New Financing Comparison ──────────────────────────────────────────────
  const [todayRate, setTodayRate] = useState(6.875);
  const [newLoanTerm, setNewLoanTerm] = useState(30);
  const [newDownPct, setNewDownPct] = useState(0);

  // Auto-set down payment % based on loan type
  useEffect(() => {
    if (loanType === "VA") setNewDownPct(0);
    else if (loanType === "FHA") setNewDownPct(3.5);
    else setNewDownPct(5);
  }, [loanType]);

  // ─── Results Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    // Assumed loan payment
    const assumedPI = calcMonthlyPI(currentBalance, sellerRate, remainingTerm);

    // Gap financing (second lien: current rate + 1%, 15-year term)
    const gapRate = todayRate + 1.0;
    const gapTermMonths = 180; // 15 years
    const gapFinancedAmount = gapCash; // The gap that needs to be bridged
    const gapPI = gapFinancedAmount > 0 ? calcMonthlyPI(gapFinancedAmount, gapRate, gapTermMonths) : 0;

    // Total assumed path payment
    const totalAssumedPayment = assumedPI + gapPI;

    // New loan calculation
    const newDownPayment = purchasePrice * (newDownPct / 100);
    const newLoanAmount = purchasePrice - newDownPayment;
    const newLoanTermMonths = newLoanTerm * 12;
    const newPI = calcMonthlyPI(newLoanAmount, todayRate, newLoanTermMonths);

    // Monthly savings
    const monthlySavings = newPI - totalAssumedPayment;

    // Total interest comparison (over remaining term of assumed loan)
    const assumedTotalInterest = calcTotalInterest(currentBalance, sellerRate, remainingTerm);
    const gapTotalInterest = gapFinancedAmount > 0 ? calcTotalInterest(gapFinancedAmount, gapRate, gapTermMonths) : 0;
    const newTotalInterest = calcTotalInterest(newLoanAmount, todayRate, newLoanTermMonths);
    const totalInterestSavings = newTotalInterest - (assumedTotalInterest + gapTotalInterest);

    // Verdict
    let verdict: "green" | "yellow" | "red";
    let verdictLabel: string;
    if (monthlySavings >= 500) {
      verdict = "green";
      verdictLabel = "Strong assumption candidate — significant monthly savings";
    } else if (monthlySavings >= 100) {
      verdict = "yellow";
      verdictLabel = "Moderate savings — weigh against gap financing costs";
    } else {
      verdict = "red";
      verdictLabel = "Minimal advantage — new financing may be simpler";
    }

    return {
      assumedPI,
      gapFinancedAmount,
      gapRate,
      gapPI,
      totalAssumedPayment,
      newDownPayment,
      newLoanAmount,
      newPI,
      monthlySavings,
      assumedTotalInterest,
      gapTotalInterest,
      newTotalInterest,
      totalInterestSavings,
      verdict,
      verdictLabel,
    };
  }, [
    currentBalance,
    sellerRate,
    remainingTerm,
    purchasePrice,
    gapCash,
    todayRate,
    newLoanTerm,
    newDownPct,
  ]);

  // ─── Chart Data ────────────────────────────────────────────────────────────
  const barData = [
    { name: "Assume Loan", payment: Math.round(result.totalAssumedPayment) },
    { name: "New Loan", payment: Math.round(result.newPI) },
  ];

  const pieData = [
    { name: "Assumed Loan Balance", value: currentBalance },
    { name: "Equity Gap (Cash Needed)", value: gapCash },
  ];

  if (!isUnlocked && !isEmbedded) {
    return (
      <Layout>
        <SEO title="Access Gated — Assumable Calculator" description="Please access via the Agents page." url="/assumable-calculator" />
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
          {/* Seller's Existing Loan */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-teal" />
              Seller's Existing Loan
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  Loan Type
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value as "VA" | "FHA" | "Conventional")}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                >
                  <option value="VA">VA Loan</option>
                  <option value="FHA">FHA Loan</option>
                  <option value="Conventional">Conventional</option>
                </select>
              </div>

              <InputField
                label="Current Loan Balance"
                value={currentBalance}
                onChange={setCurrentBalance}
                prefix="$"
                step={5000}
                min={0}
              />
              <InputField
                label="Interest Rate"
                value={sellerRate}
                onChange={setSellerRate}
                suffix="%"
                step={0.125}
                min={0}
                max={15}
                helpText="The seller's locked-in rate you'd assume"
              />
              <InputField
                label="Remaining Term"
                value={remainingTerm}
                onChange={setRemainingTerm}
                suffix="mo"
                step={12}
                min={1}
                max={360}
                helpText="Months left on the existing loan"
              />
              <InputField
                label="Original Loan Amount"
                value={originalLoanAmount}
                onChange={setOriginalLoanAmount}
                prefix="$"
                step={5000}
                min={0}
                helpText="For VA entitlement calculation"
              />
            </div>
          </div>

          {/* Purchase Details */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-teal" />
              Purchase Details
            </h3>

            <div className="space-y-3">
              <InputField
                label="Purchase Price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                prefix="$"
                step={10000}
                min={0}
              />
              <InputField
                label="Equity Gap (Cash/Down for Gap)"
                value={gapCash}
                onChange={setGapCash}
                prefix="$"
                step={5000}
                min={0}
                helpText="Price minus assumed balance — editable if partial gap financing"
              />
            </div>
          </div>

          {/* New Financing Comparison */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal" />
              New Financing Comparison
            </h3>

            <div className="space-y-3">
              <InputField
                label="Today's Interest Rate"
                value={todayRate}
                onChange={setTodayRate}
                suffix="%"
                step={0.125}
                min={0}
                max={15}
                helpText="Current market rate for comparison"
              />
              <InputField
                label="New Loan Term"
                value={newLoanTerm}
                onChange={setNewLoanTerm}
                suffix="yrs"
                step={5}
                min={10}
                max={30}
              />
              <InputField
                label="Down Payment"
                value={newDownPct}
                onChange={setNewDownPct}
                suffix="%"
                step={0.5}
                min={0}
                max={100}
                helpText={
                  loanType === "VA"
                    ? "VA: 0% down available"
                    : loanType === "FHA"
                    ? "FHA: 3.5% minimum"
                    : "Conventional: 5%+ typical"
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Results ────────────────────────────────── */}
      <div className="lg:col-span-3">
        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Assume Existing Loan */}
          <div className="bg-card rounded-xl border-2 border-teal/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                <HandCoins className="w-4 h-4 text-teal" />
              </div>
              <h3 className="font-display text-lg text-navy">Assume Loan</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Assumed P&I</span>
                <span className="text-lg font-body font-bold text-navy">{fmt(result.assumedPI)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="text-sm font-body font-semibold text-teal">{sellerRate}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Remaining Term</span>
                <span className="text-sm font-body font-medium text-navy">{Math.round(remainingTerm / 12)} yrs ({remainingTerm} mo)</span>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Gap Financing (2nd Lien)
                </p>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Gap Amount</span>
                  <span className="text-sm font-body font-medium text-navy">{fmt(result.gapFinancedAmount)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Gap Rate</span>
                  <span className="text-sm font-body font-medium text-navy">{result.gapRate.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Gap P&I (15-yr)</span>
                  <span className="text-sm font-body font-medium text-navy">{fmt(result.gapPI)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-body font-bold text-navy">Total Monthly</span>
                  <span className="text-xl font-display text-teal">{fmt(result.totalAssumedPayment)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Loan */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-navy" />
              </div>
              <h3 className="font-display text-lg text-navy">New Loan</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Monthly P&I</span>
                <span className="text-lg font-body font-bold text-navy">{fmt(result.newPI)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="text-sm font-body font-semibold text-navy">{todayRate}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Loan Term</span>
                <span className="text-sm font-body font-medium text-navy">{newLoanTerm} yrs</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="text-sm font-body font-medium text-navy">{fmt(result.newLoanAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Down Payment</span>
                <span className="text-sm font-body font-medium text-navy">{fmt(result.newDownPayment)}</span>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-body font-bold text-navy">Total Monthly</span>
                  <span className="text-xl font-display text-navy">{fmt(result.newPI)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        <div
          className={`rounded-xl p-6 mb-6 border-2 ${
            result.verdict === "green"
              ? "bg-emerald-50 border-emerald-200"
              : result.verdict === "yellow"
              ? "bg-amber-50 border-amber-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            {result.verdict === "green" ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : result.verdict === "yellow" ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <div>
              <p
                className={`font-body font-bold text-lg ${
                  result.verdict === "green"
                    ? "text-emerald-800"
                    : result.verdict === "yellow"
                    ? "text-amber-800"
                    : "text-red-800"
                }`}
              >
                {result.verdictLabel}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
              <p
                className={`text-xl font-display ${
                  result.monthlySavings > 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.monthlySavings > 0 ? "+" : ""}
                {fmt(result.monthlySavings)}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Interest Savings</p>
              <p
                className={`text-xl font-display ${
                  result.totalInterestSavings > 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.totalInterestSavings > 0 ? "+" : ""}
                {fmt(result.totalInterestSavings)}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Equity Gap to Bridge</p>
              <p className="text-xl font-display text-navy">{fmt(gapCash)}</p>
            </div>
          </div>
        </div>

        {/* Bar Chart Comparison */}
        <div className="bg-navy rounded-xl p-6 mb-6">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-4 text-center">
            Monthly Payment Comparison
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  stroke="#F5E6D3"
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#F5E6D3"
                  fontSize={12}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{
                    backgroundColor: "#0C2340",
                    border: "1px solid rgba(245,230,211,0.2)",
                    borderRadius: "8px",
                    color: "#F5E6D3",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="payment" radius={[0, 6, 6, 0]}>
                  <Cell fill="oklch(0.55 0.12 195)" />
                  <Cell fill="oklch(0.72 0.10 60)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — Purchase Price Breakdown */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="font-display text-lg text-navy mb-4 text-center">
            Purchase Price Breakdown
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name.split("(")[0].trim()} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VA Entitlement Warning */}
        {loanType === "VA" && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg text-amber-900 mb-2">
                  VA Entitlement Implications
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  If the seller's VA entitlement isn't restored at closing, it remains tied to this
                  property. The buyer can assume using their own VA entitlement (substitution of
                  entitlement) or assume as a non-veteran — but the seller's entitlement stays
                  encumbered until the loan is paid off or refinanced. This affects the seller's
                  ability to use VA benefits on their next purchase. Always consult with a
                  VA-experienced lender before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gap Financing Options */}
        <div className="bg-sand/30 rounded-xl border border-border p-6 mb-6">
          <h3 className="font-display text-xl text-navy mb-3">
            Bridge the Gap
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The equity gap between the purchase price and assumed loan balance must be covered.
            Common options:
          </p>
          <div className="space-y-3">
            {[
              {
                title: "Cash from Buyer",
                desc: `Bring ${fmt(gapCash)} to closing — simplest path, no additional monthly payment.`,
              },
              {
                title: "Second Lien / HELOC",
                desc: `Estimated payment: ${fmt(result.gapPI)}/mo at ${result.gapRate.toFixed(3)}% over 15 years.`,
              },
              {
                title: "Seller Carryback Note",
                desc: "Seller finances part of the gap — negotiate rate and terms directly.",
              },
              {
                title: "Gift Funds",
                desc: loanType === "VA" ? "VA allows gift funds for the gap — no seasoning required." : "Check program guidelines for gift fund eligibility.",
              },
            ].map((option) => (
              <div key={option.title} className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-body font-semibold text-navy">
                    {option.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <a
              href={PRE_APPROVAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-teal hover:underline font-body font-semibold"
            >
              Need help structuring gap financing? Talk to Jay
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-sand/20 rounded-lg border border-border p-4 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-body font-semibold text-navy">Disclaimer:</span>{" "}
            This calculator provides estimates for educational purposes only. Actual assumption
            terms depend on lender approval, VA/FHA guidelines, and property-specific factors.
            Assumption processing typically takes 45-120 days. Contact{" "}
            <a
              href={PRE_APPROVAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline font-body font-medium"
            >
              Jay Miller
            </a>{" "}
            for guidance on {loanType} loan assumptions and gap financing options.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-navy rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">
              Ready to Explore an Assumption?
            </p>
            <h3 className="font-display text-xl text-white mb-1">
              Get Expert Guidance on Loan Assumptions
            </h3>
            <p className="text-sm text-sand/70">
              25+ years of Hawaii lending experience. Let's structure the best path forward.
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
              Get Started
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
    </div>
  );

  if (isEmbedded) {
    return calculatorContent;
  }

  return (
    <Layout>
      <SEO
        title="Assumable Loan Calculator — VA/FHA Loan Assumption Analysis"
        description="Compare assuming an existing VA or FHA loan vs. new financing. Calculate monthly savings, gap financing needs, and total interest savings for Hawaii real estate."
        url="/assumable-calculator"
        keywords="assumable loan calculator, VA loan assumption, FHA loan assumption, Hawaii assumable mortgage, loan assumption vs new financing, gap financing calculator"
      />
      <PageHero
        title="Assumable Loan Calculator"
        subtitle="Compare assuming an existing VA/FHA loan at the seller's rate vs. getting new financing at today's rates. See the real savings."
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
