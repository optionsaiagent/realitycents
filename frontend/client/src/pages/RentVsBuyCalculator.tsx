/**
 * Pacific Modernism — Rent vs. Buy Calculator
 * Comprehensive comparison tool showing cumulative costs, break-even year,
 * equity vs. investment portfolio, and a year-by-year line chart.
 */
import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import EmailResults from "@/components/EmailResults";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  Home,
  Building2,
  TrendingUp,
  DollarSign,
  FileCheck,
  Phone,
  Info,
  CheckCircle,
  ArrowRight,
  Scale,
} from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number, d = 1): string { return `${n.toFixed(d)}%`; }
function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}

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
          className={`w-full ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-10" : "pr-3"} py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
      </div>
      {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
    </div>
  );
}

// ─── Calculation Engine ───────────────────────────────────────────────────────
interface Inputs {
  homePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: 15 | 30;
  homeAppreciationRate: number;
  monthlyRent: number;
  annualRentIncrease: number;
  rentersInsurance: number;
  propertyTaxRate: number;
  homeInsurance: number;
  hoaFees: number;
  maintenanceRate: number;
  marginalTaxRate: number;
  investmentReturnRate: number;
  timeHorizon: number;
}

interface YearData {
  year: number;
  cumulativeBuyCost: number;
  cumulativeRentCost: number;
  homeValue: number;
  homeEquity: number;
  loanBalance: number;
  investmentValue: number;
  netWealthBuy: number;
  netWealthRent: number;
}

interface CalcResult {
  yearData: YearData[];
  breakEvenYear: number | null;
  totalBuyCost: number;
  totalRentCost: number;
  finalHomeEquity: number;
  finalInvestmentValue: number;
  finalNetWealthBuy: number;
  finalNetWealthRent: number;
  monthlyMortgagePI: number;
  totalMonthlyBuyCost: number;
  totalTaxSavings: number;
  buyIsBetter: boolean;
}

function calculate(inputs: Inputs): CalcResult {
  const {
    homePrice, downPaymentPercent, interestRate, loanTerm,
    homeAppreciationRate, monthlyRent, annualRentIncrease,
    rentersInsurance, propertyTaxRate, homeInsurance, hoaFees,
    maintenanceRate, marginalTaxRate, investmentReturnRate, timeHorizon,
  } = inputs;

  const downPayment = homePrice * downPaymentPercent / 100;
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  // Monthly P&I
  const monthlyPI = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  // Year-by-year simulation
  const yearData: YearData[] = [];
  let cumulativeBuyCost = 0;
  let cumulativeRentCost = 0;
  let loanBalance = loanAmount;
  let homeValue = homePrice;
  let investmentValue = downPayment; // opportunity cost: what if down payment was invested
  let totalTaxSavings = 0;
  let breakEvenYear: number | null = null;
  let currentRent = monthlyRent;

  // Closing costs (estimated ~3% of home price for buying)
  const closingCosts = homePrice * 0.03;
  cumulativeBuyCost += closingCosts;

  for (let year = 1; year <= timeHorizon; year++) {
    // Home appreciation
    homeValue *= (1 + homeAppreciationRate / 100);

    // Investment growth (opportunity cost of down payment + closing costs)
    investmentValue *= (1 + investmentReturnRate / 100);

    // Annual buying costs
    let annualInterest = 0;
    let annualPrincipal = 0;
    for (let m = 0; m < 12; m++) {
      if (loanBalance > 0) {
        const interestPayment = loanBalance * monthlyRate;
        const principalPayment = Math.min(monthlyPI - interestPayment, loanBalance);
        annualInterest += interestPayment;
        annualPrincipal += principalPayment;
        loanBalance = Math.max(0, loanBalance - principalPayment);
      }
    }

    const annualPropertyTax = homeValue * propertyTaxRate / 100;
    const annualInsurance = homeInsurance * 12;
    const annualHoa = hoaFees * 12;
    const annualMaintenance = homeValue * maintenanceRate / 100;
    const taxSavings = annualInterest * marginalTaxRate / 100;
    totalTaxSavings += taxSavings;

    const annualBuyCost = (monthlyPI * 12) + annualPropertyTax + annualInsurance + annualHoa + annualMaintenance - taxSavings;
    cumulativeBuyCost += annualBuyCost;

    // Annual renting costs
    const annualRentCost = (currentRent * 12) + (rentersInsurance * 12);
    cumulativeRentCost += annualRentCost;
    currentRent *= (1 + annualRentIncrease / 100);

    // Add annual rent savings to investment (if renting is cheaper, invest the difference)
    const monthlyBuyCost = annualBuyCost / 12;
    const monthlyRentCost = annualRentCost / 12;
    if (monthlyRentCost < monthlyBuyCost) {
      // Renter invests the monthly savings
      for (let m = 0; m < 12; m++) {
        investmentValue += (monthlyBuyCost - monthlyRentCost);
        investmentValue *= Math.pow(1 + investmentReturnRate / 100, 1 / 12);
      }
    }

    const homeEquity = homeValue - loanBalance;
    const netWealthBuy = homeEquity - cumulativeBuyCost + cumulativeBuyCost; // homeEquity is the net asset
    const netWealthRent = investmentValue;

    yearData.push({
      year,
      cumulativeBuyCost: Math.round(cumulativeBuyCost),
      cumulativeRentCost: Math.round(cumulativeRentCost),
      homeValue: Math.round(homeValue),
      homeEquity: Math.round(homeEquity),
      loanBalance: Math.round(loanBalance),
      investmentValue: Math.round(investmentValue),
      netWealthBuy: Math.round(homeEquity),
      netWealthRent: Math.round(investmentValue),
    });

    // Break-even: when cumulative buy cost minus equity built < cumulative rent cost minus investment
    // Simplified: when (cumulativeBuyCost - homeEquity) < (cumulativeRentCost - investmentValue)
    const netBuyCost = cumulativeBuyCost - homeEquity;
    const netRentCost = cumulativeRentCost - investmentValue;
    if (breakEvenYear === null && netBuyCost <= netRentCost && year > 1) {
      breakEvenYear = year;
    }
  }

  const lastYear = yearData[yearData.length - 1];
  const firstYearPropertyTax = homePrice * propertyTaxRate / 100 / 12;
  const totalMonthlyBuyCost = monthlyPI + firstYearPropertyTax + homeInsurance + hoaFees + (homePrice * maintenanceRate / 100 / 12);

  const finalNetBuyCost = lastYear.cumulativeBuyCost - lastYear.homeEquity;
  const finalNetRentCost = lastYear.cumulativeRentCost - lastYear.investmentValue;

  return {
    yearData,
    breakEvenYear,
    totalBuyCost: lastYear.cumulativeBuyCost,
    totalRentCost: lastYear.cumulativeRentCost,
    finalHomeEquity: lastYear.homeEquity,
    finalInvestmentValue: lastYear.investmentValue,
    finalNetWealthBuy: lastYear.homeEquity,
    finalNetWealthRent: lastYear.investmentValue,
    monthlyMortgagePI: monthlyPI,
    totalMonthlyBuyCost: totalMonthlyBuyCost,
    totalTaxSavings: Math.round(totalTaxSavings),
    buyIsBetter: finalNetBuyCost < finalNetRentCost,
  };
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy border border-gold/20 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-gold font-body font-semibold mb-1">Year {label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-body">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RentVsBuyCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    homePrice: 800000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    homeAppreciationRate: 3.5,
    monthlyRent: 3000,
    annualRentIncrease: 3,
    rentersInsurance: 30,
    propertyTaxRate: 0.35,
    homeInsurance: 150,
    hoaFees: 400,
    maintenanceRate: 1,
    marginalTaxRate: 22,
    investmentReturnRate: 7,
    timeHorizon: 10,
  });

  const update = (key: keyof Inputs, val: number) => setInputs(prev => ({ ...prev, [key]: val }));

  const calc = useMemo(() => calculate(inputs), [inputs]);

  return (
    <Layout>
      <SEO
        title="Rent vs. Buy Calculator — Should You Buy a Home in Hawaii?"
        description="Compare the true cost of renting vs. buying a home in Hawaii. See break-even year, equity growth, investment opportunity cost, and cumulative cost analysis over time."
        url="/rent-vs-buy"
        keywords="rent vs buy calculator Hawaii, should I buy a home Hawaii, rent or buy Honolulu, home buying cost comparison, break even buying house"
      />
      <PageHero
        title="Rent vs. Buy Calculator"
        subtitle="Should you buy or continue renting? Compare the true long-term costs of homeownership vs. renting in Hawaii, including equity growth, investment opportunity cost, and tax benefits."
        image={IMAGES.heroCalculator}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          {/* Intro */}
          <div className="bg-card border border-border rounded-xl p-5 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              This calculator compares the total cost of buying a home vs. renting over your chosen time horizon. It accounts for mortgage payments, property taxes, maintenance, home appreciation, rent increases, tax deductions, and the opportunity cost of investing your down payment in the stock market instead. All figures are estimates for educational purposes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ─── INPUTS PANEL ─────────────────────────────────────── */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-28">
                <h2 className="font-display text-lg text-navy mb-5 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-teal" /> Scenario Details
                </h2>

                {/* Buying Inputs */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 text-teal" />
                    <h3 className="text-sm font-body font-semibold text-navy uppercase tracking-wider">Buying</h3>
                  </div>
                  <div className="space-y-3">
                    <InputField label="Home Purchase Price" value={inputs.homePrice} onChange={(v) => update("homePrice", v)} prefix="$" step={10000} min={0} />
                    <InputField label="Down Payment" value={inputs.downPaymentPercent} onChange={(v) => update("downPaymentPercent", v)} suffix="%" step={1} min={0} max={100} helpText={`${fmt(inputs.homePrice * inputs.downPaymentPercent / 100)} down`} />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Interest Rate" value={inputs.interestRate} onChange={(v) => update("interestRate", v)} suffix="%" step={0.125} min={0} max={15} />
                      <div>
                        <label className="block text-sm font-body font-medium text-navy mb-1.5">Loan Term</label>
                        <div className="flex rounded-md overflow-hidden border border-border">
                          {([15, 30] as const).map((t) => (
                            <button key={t} onClick={() => update("loanTerm", t)}
                              className={`flex-1 py-2.5 text-sm font-body font-semibold transition-all ${inputs.loanTerm === t ? "bg-teal text-white" : "bg-white text-navy hover:bg-muted"}`}
                            >{t} yr</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <InputField label="Home Appreciation Rate" value={inputs.homeAppreciationRate} onChange={(v) => update("homeAppreciationRate", v)} suffix="%" step={0.5} min={-5} max={15} helpText="Annual home value growth rate" />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Property Tax Rate" value={inputs.propertyTaxRate} onChange={(v) => update("propertyTaxRate", v)} suffix="%" step={0.05} min={0} helpText="Annual % of home value" />
                      <InputField label="Home Insurance" value={inputs.homeInsurance} onChange={(v) => update("homeInsurance", v)} prefix="$" suffix="/mo" step={10} min={0} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="HOA Fees" value={inputs.hoaFees} onChange={(v) => update("hoaFees", v)} prefix="$" suffix="/mo" step={25} min={0} />
                      <InputField label="Maintenance" value={inputs.maintenanceRate} onChange={(v) => update("maintenanceRate", v)} suffix="%" step={0.25} min={0} helpText="Annual % of home value" />
                    </div>
                  </div>
                </div>

                {/* Renting Inputs */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-gold" />
                    <h3 className="text-sm font-body font-semibold text-navy uppercase tracking-wider">Renting</h3>
                  </div>
                  <div className="space-y-3">
                    <InputField label="Monthly Rent" value={inputs.monthlyRent} onChange={(v) => update("monthlyRent", v)} prefix="$" step={100} min={0} />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Annual Rent Increase" value={inputs.annualRentIncrease} onChange={(v) => update("annualRentIncrease", v)} suffix="%" step={0.5} min={0} />
                      <InputField label="Renter's Insurance" value={inputs.rentersInsurance} onChange={(v) => update("rentersInsurance", v)} prefix="$" suffix="/mo" step={5} min={0} />
                    </div>
                  </div>
                </div>

                {/* Financial Assumptions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-teal" />
                    <h3 className="text-sm font-body font-semibold text-navy uppercase tracking-wider">Financial Assumptions</h3>
                  </div>
                  <div className="space-y-3">
                    <InputField label="Marginal Tax Rate" value={inputs.marginalTaxRate} onChange={(v) => update("marginalTaxRate", v)} suffix="%" step={1} min={0} max={50} helpText="For mortgage interest deduction (if itemizing)" />
                    <InputField label="Investment Return Rate" value={inputs.investmentReturnRate} onChange={(v) => update("investmentReturnRate", v)} suffix="%" step={0.5} min={0} max={20} helpText="Annual return if down payment was invested" />
                    <InputField label="Time Horizon" value={inputs.timeHorizon} onChange={(v) => update("timeHorizon", v)} suffix="years" step={1} min={1} max={30} helpText="How long you plan to stay" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RESULTS PANEL ────────────────────────────────────── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Verdict */}
              <div className={`rounded-xl p-6 border-2 ${calc.buyIsBetter ? "bg-teal/5 border-teal/30" : "bg-gold/5 border-gold/30"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${calc.buyIsBetter ? "bg-teal/20" : "bg-gold/20"}`}>
                    {calc.buyIsBetter ? <Home className="w-5 h-5 text-teal" /> : <Building2 className="w-5 h-5 text-gold" />}
                  </div>
                  <div>
                    <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Over {inputs.timeHorizon} Years
                    </p>
                    <h3 className="font-display text-xl text-navy">
                      {calc.buyIsBetter
                        ? `Buying is the better financial move${calc.breakEvenYear ? ` after year ${calc.breakEvenYear}` : ""}`
                        : `Renting is more cost-effective over this time horizon`
                      }
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {calc.buyIsBetter
                    ? `After ${inputs.timeHorizon} years, your home equity of ${fmt(calc.finalHomeEquity)} outweighs the cumulative costs. ${calc.breakEvenYear ? `The break-even point where buying becomes cheaper than renting on a net-cost basis is around year ${calc.breakEvenYear}.` : "Buying is favorable from the start with these inputs."}`
                    : `Over ${inputs.timeHorizon} years, the total net cost of buying (accounting for equity) exceeds the net cost of renting (accounting for investment returns). Consider a longer time horizon or different market conditions.`
                  }
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Monthly Mortgage P&I</p>
                  <p className="font-display text-xl text-navy">{fmt(calc.monthlyMortgagePI)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Total Buy Cost</p>
                  <p className="font-display text-xl text-navy">{fmtK(calc.totalBuyCost)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">over {inputs.timeHorizon} years</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Total Rent Cost</p>
                  <p className="font-display text-xl text-navy">{fmtK(calc.totalRentCost)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">over {inputs.timeHorizon} years</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Home Equity</p>
                  <p className="font-display text-xl text-teal">{fmtK(calc.finalHomeEquity)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">at year {inputs.timeHorizon}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Investment Value</p>
                  <p className="font-display text-xl text-gold">{fmtK(calc.finalInvestmentValue)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">if down payment invested</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Tax Savings</p>
                  <p className="font-display text-xl text-navy">{fmtK(calc.totalTaxSavings)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">mortgage interest deduction</p>
                </div>
              </div>

              {/* Break-Even */}
              {calc.breakEvenYear && (
                <div className="bg-navy rounded-xl p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-7 h-7 text-teal" />
                  </div>
                  <div>
                    <p className="text-gold text-xs font-body font-semibold uppercase tracking-[0.15em]">Break-Even Point</p>
                    <p className="font-display text-2xl text-white">Year {calc.breakEvenYear}</p>
                    <p className="text-sm text-sand/70 font-body">Buying becomes cheaper than renting on a net-cost basis after {calc.breakEvenYear} year{calc.breakEvenYear > 1 ? "s" : ""}.</p>
                  </div>
                </div>
              )}

              {/* Cumulative Cost Chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display text-lg text-navy mb-1">Cumulative Cost Over Time</h3>
                <p className="text-xs text-muted-foreground font-body mb-4">Total out-of-pocket costs for buying vs. renting, year by year</p>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calc.yearData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.004 286.32)" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "oklch(0.552 0.016 285.938)" }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 12, fill: "oklch(0.552 0.016 285.938)" }} />
                      <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "oklch(0.552 0.016 285.938)" }} width={60} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {calc.breakEvenYear && (
                        <ReferenceLine x={calc.breakEvenYear} stroke="oklch(0.72 0.10 60)" strokeDasharray="5 5" label={{ value: "Break-even", position: "top", fontSize: 11, fill: "oklch(0.72 0.10 60)" }} />
                      )}
                      <Line type="monotone" dataKey="cumulativeBuyCost" name="Buying Cost" stroke="oklch(0.55 0.12 195)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="cumulativeRentCost" name="Renting Cost" stroke="oklch(0.72 0.10 60)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Net Wealth Chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display text-lg text-navy mb-1">Net Wealth Comparison</h3>
                <p className="text-xs text-muted-foreground font-body mb-4">Home equity (buying) vs. investment portfolio (renting) over time</p>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calc.yearData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.004 286.32)" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "oklch(0.552 0.016 285.938)" }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 12, fill: "oklch(0.552 0.016 285.938)" }} />
                      <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "oklch(0.552 0.016 285.938)" }} width={60} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="netWealthBuy" name="Home Equity" stroke="oklch(0.55 0.12 195)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="netWealthRent" name="Investment Portfolio" stroke="oklch(0.72 0.10 60)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Year-by-Year Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="font-display text-lg text-navy">Year-by-Year Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-navy text-white">
                        <th className="px-3 py-2.5 text-left font-semibold">Year</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Buy Cost</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Rent Cost</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Home Value</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Home Equity</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Investment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.yearData.map((row, i) => (
                        <tr key={row.year} className={`border-b border-border ${row.year === calc.breakEvenYear ? "bg-teal/5 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-muted/30"}`}>
                          <td className="px-3 py-2 text-navy">{row.year}{row.year === calc.breakEvenYear ? " ★" : ""}</td>
                          <td className="px-3 py-2 text-right text-navy">{fmtK(row.cumulativeBuyCost)}</td>
                          <td className="px-3 py-2 text-right text-navy">{fmtK(row.cumulativeRentCost)}</td>
                          <td className="px-3 py-2 text-right text-navy">{fmtK(row.homeValue)}</td>
                          <td className="px-3 py-2 text-right text-teal">{fmtK(row.homeEquity)}</td>
                          <td className="px-3 py-2 text-right text-gold">{fmtK(row.investmentValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax Savings Note */}
              <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
                <Info className="w-5 h-5 text-teal mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground font-body leading-relaxed">
                  <strong className="text-navy">About the mortgage interest deduction:</strong> The estimated tax savings of {fmt(calc.totalTaxSavings)} over {inputs.timeHorizon} years assumes you itemize your deductions rather than taking the standard deduction. For 2025, the standard deduction is $15,000 (single) or $30,000 (married filing jointly). The deduction only provides a benefit if your total itemized deductions exceed the standard deduction. Consult a tax professional for personalized advice.
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-muted/30 border border-border rounded-xl p-5 flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only and does not constitute financial advice. Actual costs will vary based on market conditions, specific property details, tax situations, and other factors. Home appreciation and investment returns are not guaranteed. Closing costs are estimated at 3% of home price. Contact a financial advisor and mortgage professional for personalized guidance.
                </p>
              </div>
            </div>
          </div>

          {/* Email Results */}
          <EmailResults calculator="rent-vs-buy" />

          {/* CTA */}
          <div className="bg-navy rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20 mt-12">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">Ready to Make the Move?</p>
              <h3 className="font-display text-xl text-white mb-1">Get Pre-Approved Today</h3>
              <p className="text-sm text-sand/70">Find out exactly how much home you can afford with Jay Miller.</p>
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
      </section>
    </Layout>
  );
}
