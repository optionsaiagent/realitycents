/*
 * Pacific Modernism — First-Lien HELOC + Sweep Checking Calculator
 * Simulates a first-lien HELOC with an integrated sweep-checking account.
 * Net income deposits suppress the daily balance; expenses draw it back up.
 * Day-by-day simulation with the signature "sawtooth" pattern, compared
 * against a traditional fixed-rate mortgage.
 * Matches existing RealityCents dark theme (LoanCompare) — dark slate,
 * teal/gold accents.
 */
import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import {
  type HelocSweepInputs,
  type DepositFrequency,
  type ExtraDepositFrequency,
  compareStrategies,
  depositsPerMonth,
  defaultLivingExpenses,
  formatMonths,
} from "@/lib/helocSweepMath";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Wallet,
  TrendingDown,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
  Landmark,
  Activity,
  Repeat,
  AlertTriangle,
  Droplets,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function num(s: string): number {
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const DEPOSIT_FREQUENCY_OPTIONS: { value: DepositFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "semi-monthly", label: "Semi-Monthly (1st & 15th)" },
  { value: "bi-weekly", label: "Bi-Weekly (every 2 weeks)" },
  { value: "weekly", label: "Weekly" },
];

// ─── Reusable input field (dark theme, LoanCompare style) ────────────────────

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden focus-within:border-teal transition">
        {prefix && <span className="pl-3 text-slate-400 text-sm shrink-0">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-full bg-transparent text-white text-sm px-3 py-2 outline-none"
        />
        {suffix && <span className="pr-3 text-slate-400 text-sm shrink-0">{suffix}</span>}
      </div>
      {helper && <p className="text-[11px] text-slate-500 mt-1">{helper}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Input panel card ────────────────────────────────────────────────────────

function InputCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
      <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
        <Icon size={16} className="text-teal" />
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── Headline stat card ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-slate-400" />
        <p className="text-xs text-slate-400">{label}</p>
      </div>
      <p className={`text-xl md:text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function HelocSweepCalculator() {
  // Loan details
  const [startingBalance, setStartingBalance] = useState("600000");
  const [helocRate, setHelocRate] = useState("7.55");
  const [termYears, setTermYears] = useState("30");
  const [drawPeriodYears, setDrawPeriodYears] = useState("10");

  // Income
  const [netIncome, setNetIncome] = useState("10000");
  const [depositFrequency, setDepositFrequency] = useState<DepositFrequency>("monthly");

  // Property costs — paid from the HELOC line (Hawaii defaults: ~0.35% of $750K home ≈ $219/mo tax)
  const [monthlyPropertyTax, setMonthlyPropertyTax] = useState("219");
  const [monthlyInsurance, setMonthlyInsurance] = useState("150");
  const [monthlyHOA, setMonthlyHOA] = useState("0");

  // Living expenses — defaults to 80% of (income − property costs − minimum interest),
  // leaving 20% as net principal paydown. User can override with actual figures.
  const [livingExpenses, setLivingExpenses] = useState("");
  const [livingExpensesTouched, setLivingExpensesTouched] = useState(false);

  // Extra deposit
  const [extraDeposit, setExtraDeposit] = useState("0");
  const [extraDepositFrequency, setExtraDepositFrequency] =
    useState<ExtraDepositFrequency>("one-time");

  // Traditional comparison
  const [traditionalRate, setTraditionalRate] = useState("6.50");
  const [traditionalTermYears, setTraditionalTermYears] = useState("30");

  // UI state
  const [tableExpanded, setTableExpanded] = useState(false);
  const [showSawtooth, setShowSawtooth] = useState(true);

  // Derived monthly figures used for the smart living-expense default
  const monthlyIncomeForDefault = num(netIncome) * depositsPerMonth(depositFrequency);
  const propertyCostsTotal = num(monthlyPropertyTax) + num(monthlyInsurance) + num(monthlyHOA);
  const suggestedLivingExpenses = defaultLivingExpenses(
    monthlyIncomeForDefault,
    propertyCostsTotal,
    num(startingBalance),
    num(helocRate)
  );

  // Use the smart default until the user overrides it
  const effectiveLivingExpenses = livingExpensesTouched
    ? num(livingExpenses)
    : suggestedLivingExpenses;

  const inputs: HelocSweepInputs = useMemo(
    () => ({
      startingBalance: num(startingBalance),
      helocRate: num(helocRate),
      termYears: Math.max(Math.round(num(termYears)) || 30, 1),
      drawPeriodYears: Math.max(Math.round(num(drawPeriodYears)) || 10, 0),
      netIncome: num(netIncome),
      depositFrequency,
      monthlyPropertyTax: num(monthlyPropertyTax),
      monthlyInsurance: num(monthlyInsurance),
      monthlyHOA: num(monthlyHOA),
      monthlyLivingExpenses: effectiveLivingExpenses,
      extraDeposit: num(extraDeposit),
      extraDepositFrequency,
      traditionalRate: num(traditionalRate),
      traditionalTermYears: Math.max(Math.round(num(traditionalTermYears)) || 30, 1),
    }),
    [
      startingBalance,
      helocRate,
      termYears,
      drawPeriodYears,
      netIncome,
      depositFrequency,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyHOA,
      effectiveLivingExpenses,
      extraDeposit,
      extraDepositFrequency,
      traditionalRate,
      traditionalTermYears,
    ]
  );

  const result = useMemo(() => {
    if (inputs.startingBalance <= 0 || inputs.helocRate <= 0) return null;
    return compareStrategies(inputs);
  }, [inputs]);

  const monthlyIncomeTotal = inputs.netIncome * depositsPerMonth(depositFrequency);
  const monthlySurplus = monthlyIncomeTotal - propertyCostsTotal - effectiveLivingExpenses;
  const minMonthlyInterest = (inputs.startingBalance * inputs.helocRate) / 100 / 12;

  const avgBalanceReduction = result
    ? Math.max(inputs.startingBalance - result.heloc.avgDailyBalanceYear1, 0)
    : 0;

  const timeSavedLabel = result && result.monthsSaved > 0 ? formatMonths(result.monthsSaved) : "—";

  // Available liquidity right now (end of month 1, during draw period)
  const currentLiquidity = result
    ? Math.max(
        inputs.startingBalance -
          (result.heloc.monthlyPoints[0]?.endBalance ?? inputs.startingBalance),
        0
      )
    : 0;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "First-Lien HELOC Sweep Calculator",
      description:
        "Simulate a first-lien HELOC with an integrated sweep checking account. See how depositing your income against your mortgage balance changes payoff time and total interest vs. a traditional fixed-rate mortgage.",
      url: "https://realitycents.com/heloc-sweep-calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: "Jay Miller", url: "https://realitycents.com/about" },
      publisher: { "@type": "Organization", name: "RealityCents", url: "https://realitycents.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://realitycents.com" },
        {
          "@type": "ListItem",
          position: 2,
          name: "HELOC Sweep Calculator",
          item: "https://realitycents.com/heloc-sweep-calculator",
        },
      ],
    },
  ];

  return (
    <Layout>
      <SEO
        title="First-Lien HELOC Sweep Calculator — Mortgage Acceleration Analysis | RealityCents"
        description="Simulate a first-lien HELOC with a sweep checking account. See day-by-day how depositing your income against your balance changes payoff time and total interest vs. a traditional 30-year mortgage."
        keywords="first lien HELOC calculator, HELOC sweep account, mortgage acceleration calculator, all in one loan calculator, velocity banking calculator, HELOC vs mortgage Hawaii"
        url="https://realitycents.com/heloc-sweep-calculator"
        schema={schema}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-slate-900 to-navy text-white pt-28 pb-12 lg:pt-36 lg:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 bg-teal rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-teal mb-3">
              Mortgage Acceleration Tool
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              First-Lien HELOC + Sweep Checking Calculator
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Your paycheck hits the loan. Your expenses draw from the line. This calculator
              simulates every single day — deposits, spending, and daily interest — so you can see
              whether an "all-in-one" first-lien HELOC actually beats a traditional mortgage for
              your numbers.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — brief educational section */}
      <section className="bg-slate-900 pt-10">
        <div className="container">
          <div className="flex items-start gap-3 p-4 bg-slate-800/60 border border-teal/20 rounded-lg">
            <Droplets size={18} className="text-teal flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">How the sweep works:</span> Your net
              income is deposited directly against the HELOC balance, so every dollar suppresses
              the balance that interest is calculated on — starting the day it lands. Property
              costs, living expenses, and the monthly interest charge are all paid from the line
              (they increase the balance), creating a "sawtooth" pattern. The surplus you don't
              spend — income minus property costs minus living expenses — becomes a permanent
              principal paydown each month, as long as it exceeds the interest charge.
            </p>
          </div>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="bg-slate-900 py-10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─── Inputs ──────────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-5">
              <InputCard title="Loan Details" icon={Landmark}>
                <Field
                  label="Current Mortgage Balance (Starting HELOC Balance)"
                  value={startingBalance}
                  onChange={setStartingBalance}
                  prefix="$"
                />
                <Field
                  label="HELOC Interest Rate"
                  value={helocRate}
                  onChange={setHelocRate}
                  suffix="%"
                  helper="Default assumes SOFR ~4.30% + 3.25% margin. Variable — verify with your lender."
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Loan Term" value={termYears} onChange={setTermYears} suffix="yrs" />
                  <Field
                    label="Draw Period"
                    value={drawPeriodYears}
                    onChange={setDrawPeriodYears}
                    suffix="yrs"
                    helper="Years you can re-borrow"
                  />
                </div>
              </InputCard>

              <InputCard title="Income" icon={Wallet}>
                <Field
                  label="Net Income After Taxes — what actually hits your bank account"
                  value={netIncome}
                  onChange={setNetIncome}
                  prefix="$"
                  helper="Per deposit — e.g., per paycheck if paid bi-weekly"
                />
                <SelectField
                  label="Deposit Frequency"
                  value={depositFrequency}
                  onChange={(v) => setDepositFrequency(v as DepositFrequency)}
                  options={DEPOSIT_FREQUENCY_OPTIONS}
                />
                <div className="bg-slate-700/40 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Monthly Income</span>
                  <span className="text-sm font-bold text-teal">{fmt(monthlyIncomeTotal)}</span>
                </div>
              </InputCard>

              <InputCard title="Property Costs (Paid from the Line)" icon={Landmark}>
                <Field
                  label="Monthly Property Taxes"
                  value={monthlyPropertyTax}
                  onChange={setMonthlyPropertyTax}
                  prefix="$"
                  helper="Hawaii default: ~0.35% of a $750K home ≈ $219/mo (Honolulu County residential rate)"
                />
                <Field
                  label="Monthly Homeowner's Insurance"
                  value={monthlyInsurance}
                  onChange={setMonthlyInsurance}
                  prefix="$"
                />
                <Field
                  label="Monthly HOA"
                  value={monthlyHOA}
                  onChange={setMonthlyHOA}
                  prefix="$"
                  helper="Hawaii condos: often $400–$1,200+/mo. Single-family: usually $0"
                />
                <div className="bg-slate-700/40 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Property Costs</span>
                  <span className="text-sm font-bold text-gold">{fmt(propertyCostsTotal)}/mo</span>
                </div>
              </InputCard>

              <InputCard title="Living Expenses" icon={Activity}>
                <Field
                  label="Monthly Living Expenses (excluding property costs above)"
                  value={livingExpensesTouched ? livingExpenses : String(suggestedLivingExpenses)}
                  onChange={(v) => {
                    setLivingExpensesTouched(true);
                    setLivingExpenses(v);
                  }}
                  prefix="$"
                  helper="Groceries, utilities, car payments, etc. — NOT property taxes/insurance/HOA"
                />
                <div className="bg-slate-700/40 rounded-lg p-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {livingExpensesTouched ? (
                      <>
                        Using your figure.{" "}
                        <button
                          onClick={() => {
                            setLivingExpensesTouched(false);
                            setLivingExpenses("");
                          }}
                          className="text-teal underline underline-offset-2"
                        >
                          Reset to suggested {fmt(suggestedLivingExpenses)}
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300 font-medium">Suggested default:</span> 80% of
                        what's left after property costs ({fmt(propertyCostsTotal)}) and the minimum
                        interest payment ({fmt(minMonthlyInterest)}/mo) — leaving 20% as net principal
                        paydown. Override with your actual spending for a more accurate result.
                      </>
                    )}
                  </p>
                </div>
                {/* Cash-flow breakdown: how the surplus is derived */}
                <div
                  className={`bg-slate-700/40 rounded-lg p-3 space-y-1.5 ${
                    monthlySurplus <= 0 ? "border border-red-500/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Net Income (deposits ↓ balance)</span>
                    <span className="text-emerald-400 font-medium">+{fmt(monthlyIncomeTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Property Costs (drawn ↑ balance)</span>
                    <span className="text-red-400 font-medium">−{fmt(propertyCostsTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Living Expenses (drawn ↑ balance)</span>
                    <span className="text-red-400 font-medium">−{fmt(effectiveLivingExpenses)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-600/60">
                    <span className="text-slate-300 font-medium">Surplus Applied to Balance</span>
                    <span
                      className={`text-sm font-bold ${
                        monthlySurplus > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {fmt(monthlySurplus)}/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Interest (≈{fmt(minMonthlyInterest)}/mo to start) is also charged to the line —
                    the surplus must exceed it for the balance to fall.
                  </p>
                </div>
              </InputCard>

              <InputCard title="One-Time / Recurring Extra Deposit" icon={Repeat}>
                <Field
                  label="Extra Deposit Amount"
                  value={extraDeposit}
                  onChange={setExtraDeposit}
                  prefix="$"
                  helper="Examples: bonus, tax refund, net proceeds from property sale"
                />
                <SelectField
                  label="Frequency"
                  value={extraDepositFrequency}
                  onChange={(v) => setExtraDepositFrequency(v as ExtraDepositFrequency)}
                  options={[
                    { value: "one-time", label: "One-Time Only (month 1)" },
                    { value: "annually", label: "Annually Recurring" },
                  ]}
                />
              </InputCard>

              <InputCard title="Traditional Mortgage Comparison" icon={Landmark}>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Fixed Rate"
                    value={traditionalRate}
                    onChange={setTraditionalRate}
                    suffix="%"
                  />
                  <Field
                    label="Term"
                    value={traditionalTermYears}
                    onChange={setTraditionalTermYears}
                    suffix="yrs"
                  />
                </div>
                {result && (
                  <div className="bg-slate-700/40 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Traditional P&amp;I Payment</span>
                    <span className="text-sm font-bold text-gold">
                      {fmt(result.traditional.monthlyPayment)}/mo
                    </span>
                  </div>
                )}
              </InputCard>
            </div>

            {/* ─── Results ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {!result ? (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-8 text-center text-slate-400 text-sm">
                  Enter a starting balance and HELOC rate to see results.
                </div>
              ) : (
                <>
                  {/* Feasibility warning */}
                  {!result.feasible && (
                    <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/40 rounded-lg">
                      <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">
                        <span className="font-semibold">Your expenses meet or exceed your income.</span>{" "}
                        A sweep strategy only works with positive monthly cash flow — with no
                        surplus, the balance grows instead of shrinking. Increase income or reduce
                        expenses to see the acceleration effect.
                      </p>
                    </div>
                  )}
                  {result.feasible && !result.heloc.paidOff && (
                    <div className="flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-500/40 rounded-lg">
                      <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-200">
                        <span className="font-semibold">
                          Your surplus isn't large enough to outpace HELOC interest.
                        </span>{" "}
                        At {inputs.helocRate.toFixed(2)}%, interest on {fmt(inputs.startingBalance)}{" "}
                        starts around {fmt((inputs.startingBalance * inputs.helocRate) / 100 / 12)}
                        /month — your surplus of {fmt(monthlySurplus)} doesn't cover it, so the
                        balance never pays off within {inputs.termYears} years. This is the honest
                        math most sweep-strategy marketing skips.
                      </p>
                    </div>
                  )}

                  {/* Headline Comparison */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                      label="HELOC Payoff"
                      value={result.heloc.paidOff ? formatMonths(result.heloc.payoffMonths) : `${inputs.termYears}+ yrs`}
                      sub={result.heloc.paidOff ? "with sweep deposits" : "not paid off in term"}
                      icon={Clock}
                      accent="text-teal"
                    />
                    <StatCard
                      label="Traditional Payoff"
                      value={formatMonths(result.traditional.payoffMonths)}
                      sub={`${fmt(result.traditional.monthlyPayment)}/mo P&I`}
                      icon={Clock}
                      accent="text-gold"
                    />
                    <StatCard
                      label="Interest Saved"
                      value={result.interestSaved > 0 ? fmt(result.interestSaved) : fmt(0)}
                      sub={`HELOC ${fmt(result.heloc.totalInterest)} vs Trad ${fmt(result.traditional.totalInterest)}`}
                      icon={DollarSign}
                      accent={result.interestSaved > 0 ? "text-emerald-400" : "text-red-400"}
                    />
                    <StatCard
                      label="Time Saved"
                      value={timeSavedLabel}
                      sub={result.monthsSaved > 0 ? `${(result.monthsSaved / 12).toFixed(1)} years sooner` : "no time saved"}
                      icon={TrendingDown}
                      accent={result.monthsSaved > 0 ? "text-emerald-400" : "text-red-400"}
                    />
                  </div>

                  {/* Balance Over Time Chart */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-white mb-1">Balance Over Time</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      HELOC sweep trajectory vs. traditional {inputs.traditionalTermYears}-year
                      amortization
                    </p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={result.chartData}
                          margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                        >
                          <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                          <XAxis
                            dataKey="year"
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            label={{
                              value: "Years",
                              position: "insideBottom",
                              offset: -2,
                              fill: "#64748B",
                              fontSize: 11,
                            }}
                          />
                          <YAxis
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            width={55}
                          />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              fmt(value),
                              name === "heloc" ? "HELOC Sweep" : "Traditional",
                            ]}
                            labelFormatter={(y) => `Year ${y}`}
                            contentStyle={{
                              backgroundColor: "#0C2340",
                              border: "1px solid rgba(245,230,211,0.2)",
                              borderRadius: "8px",
                              color: "#F5E6D3",
                              fontSize: "13px",
                            }}
                          />
                          <Legend
                            formatter={(v) => (
                              <span style={{ color: "#94A3B8", fontSize: 12 }}>
                                {v === "heloc" ? "HELOC Sweep" : "Traditional Mortgage"}
                              </span>
                            )}
                          />
                          {inputs.drawPeriodYears > 0 &&
                            inputs.drawPeriodYears < Math.max(inputs.termYears, inputs.traditionalTermYears) && (
                              <ReferenceLine
                                x={inputs.drawPeriodYears}
                                stroke="rgba(245,230,211,0.3)"
                                strokeDasharray="4 4"
                                label={{
                                  value: "Draw period ends",
                                  fill: "#94A3B8",
                                  fontSize: 10,
                                  position: "insideTopRight",
                                }}
                              />
                            )}
                          <Line
                            type="monotone"
                            dataKey="heloc"
                            stroke="oklch(0.55 0.12 195)"
                            strokeWidth={2.5}
                            dot={false}
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="traditional"
                            stroke="oklch(0.72 0.10 60)"
                            strokeWidth={2.5}
                            dot={false}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sawtooth Detail */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
                    <button
                      onClick={() => setShowSawtooth(!showSawtooth)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h3 className="font-bold text-sm text-white mb-1">
                          The "Sawtooth" — First 3 Months, Day by Day
                        </h3>
                        <p className="text-xs text-slate-400">
                          Sharp drop on payday, gradual climb as expenses draw from the line
                        </p>
                      </div>
                      {showSawtooth ? (
                        <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {showSawtooth && (
                      <div className="h-56 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={result.sawtoothData}
                            margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                          >
                            <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                            <XAxis
                              dataKey="day"
                              stroke="#94A3B8"
                              fontSize={11}
                              tickLine={false}
                              label={{
                                value: "Day",
                                position: "insideBottom",
                                offset: -2,
                                fill: "#64748B",
                                fontSize: 11,
                              }}
                            />
                            <YAxis
                              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                              stroke="#94A3B8"
                              fontSize={11}
                              tickLine={false}
                              width={55}
                              domain={["dataMin - 2000", "dataMax + 2000"]}
                            />
                            <Tooltip
                              formatter={(value: number) => [fmt(value), "Daily Balance"]}
                              labelFormatter={(d) => `Day ${d}`}
                              contentStyle={{
                                backgroundColor: "#0C2340",
                                border: "1px solid rgba(245,230,211,0.2)",
                                borderRadius: "8px",
                                color: "#F5E6D3",
                                fontSize: "13px",
                              }}
                            />
                            <Line
                              type="linear"
                              dataKey="balance"
                              stroke="oklch(0.55 0.12 195)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Key Insights Box */}
                  <div className="bg-slate-800/80 border border-teal/30 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                      <Info size={16} className="text-teal" />
                      Key Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Monthly Surplus Applied</p>
                        <p className="text-lg font-bold text-teal">{fmt(monthlySurplus)}</p>
                        <p className="text-[11px] text-slate-500">
                          income − property costs − living expenses
                        </p>
                      </div>
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">
                          Effective Daily Balance Reduction
                        </p>
                        <p className="text-lg font-bold text-teal">{fmt(avgBalanceReduction)}</p>
                        <p className="text-[11px] text-slate-500">
                          avg. year-1 daily balance vs. starting balance
                        </p>
                      </div>
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">
                          Available Liquidity (Draw Period)
                        </p>
                        <p className="text-lg font-bold text-gold">{fmt(currentLiquidity)}</p>
                        <p className="text-[11px] text-slate-500">
                          re-borrowable after month 1 — grows as balance falls
                        </p>
                      </div>
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Deposits Per Month</p>
                        <p className="text-lg font-bold text-white">
                          {depositsPerMonth(depositFrequency).toFixed(2).replace(/\.00$/, "")}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {DEPOSIT_FREQUENCY_OPTIONS.find((o) => o.value === depositFrequency)?.label}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your surplus of{" "}
                      <span className="font-semibold text-teal">{fmt(monthlySurplus)}/month</span>{" "}
                      means your average daily balance is roughly{" "}
                      <span className="font-semibold text-teal">{fmt(avgBalanceReduction)}</span>{" "}
                      lower than a traditional mortgage in year one — and every dollar of that
                      reduction stops accruing interest at {inputs.helocRate.toFixed(2)}% the day
                      it hits the account.
                    </p>
                  </div>

                  {/* Year-by-Year Table */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setTableExpanded(!tableExpanded)}
                      className="w-full flex items-center justify-between p-5"
                    >
                      <h3 className="font-bold text-sm text-white">Year-by-Year Breakdown</h3>
                      {tableExpanded ? (
                        <ChevronUp size={18} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400" />
                      )}
                    </button>
                    {tableExpanded && (
                      <div className="px-5 pb-5 overflow-x-auto">
                        <table className="w-full text-xs min-w-[560px]">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left py-2 px-2 text-slate-400 font-medium">Year</th>
                              <th className="text-right py-2 px-2 text-slate-400 font-medium">
                                HELOC Balance
                              </th>
                              <th className="text-right py-2 px-2 text-slate-400 font-medium">
                                Traditional Balance
                              </th>
                              <th className="text-right py-2 px-2 text-slate-400 font-medium">
                                HELOC Interest
                              </th>
                              <th className="text-right py-2 px-2 text-slate-400 font-medium">
                                Trad Interest
                              </th>
                              <th className="text-right py-2 px-2 text-slate-400 font-medium">
                                Available Credit
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.yearRows.map((row) => (
                              <tr
                                key={row.year}
                                className="border-b border-slate-700/50 hover:bg-slate-700/20"
                              >
                                <td className="py-2 px-2 text-slate-300">{row.year}</td>
                                <td className="py-2 px-2 text-right text-teal font-medium">
                                  {fmt(row.helocBalance)}
                                </td>
                                <td className="py-2 px-2 text-right text-gold font-medium">
                                  {fmt(row.traditionalBalance)}
                                </td>
                                <td className="py-2 px-2 text-right text-slate-300">
                                  {fmt(row.helocInterest)}
                                </td>
                                <td className="py-2 px-2 text-right text-slate-300">
                                  {fmt(row.traditionalInterest)}
                                </td>
                                <td className="py-2 px-2 text-right text-slate-300">
                                  {row.availableCredit === null ? (
                                    <span className="text-slate-600">draw ended</span>
                                  ) : (
                                    fmt(row.availableCredit)
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                <Info size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  These calculations are estimates for educational purposes only. Not a commitment
                  to lend. First-lien HELOC rates are variable and tied to an index (typically SOFR
                  or Prime) — your rate can rise, which changes this math significantly. The
                  strategy requires consistent positive cash flow and disciplined spending. Actual
                  product terms, rates, and availability vary by lender.
                </p>
              </div>

              {/* CTA */}
              <ContactActions
                variant="compact"
                headline="Is a First-Lien HELOC Right for You?"
                subtext="The math only works with the right cash flow profile. Let's look at your actual numbers and compare it against a traditional refinance."
                hideEmail
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
