/*
 * Pacific Modernism — Mortgage Calculator Page
 * Advanced calculator with pie chart breakdown and amortization schedule
 * Uses Recharts for visualization
 *
 * INPUT STATE STRATEGY
 * All editable fields use `string` state so the user can backspace to an empty
 * field without React snapping the value back to 0.  A helper `num()` converts
 * each string to a number (defaulting to 0) only when feeding the calculator.
 */
import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "wouter";
import {
  Calculator as CalcIcon,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  TrendingDown,
  Printer,
} from "lucide-react";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const PIE_COLORS = [
  "oklch(0.55 0.12 195)", // teal - P&I
  "oklch(0.72 0.10 60)",  // gold - tax
  "oklch(0.45 0.12 195)", // teal-dark - insurance
  "oklch(0.65 0.10 195)", // teal-light - HOA
  "oklch(0.82 0.08 60)",  // gold-light - PMI
];

/** Parse a string to a finite number; return 0 for empty / invalid input. */
function num(s: string): number {
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCurrencyExact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ─── InputField ──────────────────────────────────────────────────────────────
// Defined OUTSIDE Calculator so React never creates a new element type on
// re-render (which would unmount/remount the <input> and drop focus).
//
// Uses `string` value so the user can backspace all the way to an empty field.
// `placeholder` shows the visual "0" hint without locking the value.
function InputField({
  label,
  value,
  onChange,
  icon: _Icon,
  prefix,
  suffix,
  step,
  min,
  max,
  helpText,
  placeholder = "0",
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: typeof DollarSign;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  helpText?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <div>
      <label className={`block font-body font-medium text-navy ${compact ? 'text-xs mb-1' : 'text-sm mb-1.5'}`}>{label}</label>
      <div className="relative">
        {prefix && (
          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          step={step ?? 1}
          min={min}
          max={max}
          className={`w-full ${prefix ? 'pl-6' : 'pl-2.5'} ${suffix ? 'pr-8' : 'pr-2.5'} ${compact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'} rounded-md border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`}
        />
        {suffix && (
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            {suffix}
          </span>
        )}
      </div>
      {helpText && <p className="text-xs text-muted-foreground mt-0.5">{helpText}</p>}
    </div>
  );
}

export default function Calculator() {
  // All input state is `string` so the user can backspace to empty.
  // num() converts to number (defaulting 0) only when calculating.
  const [loanAmount, setLoanAmount] = useState("700000");
  const [downPayment, setDownPayment] = useState("140000");
  const [interestRate, setInterestRate] = useState("6.75");
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState("350");
  const [insurance, setInsurance] = useState("150");
  const [hoaFees, setHoaFees] = useState("400");
  const [pmiRate, setPmiRate] = useState("0.5");
  const [showAmortization, setShowAmortization] = useState(false);
  const [downPaymentMode, setDownPaymentMode] = useState<"$" | "%">("$");
  // inputMode: "price" = enter home price + down payment; "loan" = enter loan amount directly
  const [inputMode, setInputMode] = useState<"price" | "loan">("price");

  // Numeric values used for calculations and display
  const nLoanAmount = num(loanAmount);
  // Resolve down payment to a dollar amount regardless of mode
  const nDownPayment = downPaymentMode === "%"
    ? (num(downPayment) / 100) * nLoanAmount
    : num(downPayment);
  const nInterestRate = num(interestRate);
  const nPropertyTax = num(propertyTax);
  const nInsurance = num(insurance);
  const nHoaFees = num(hoaFees);
  const nPmiRate = num(pmiRate);

  // In "loan" mode, the entered value IS the principal (no down payment subtracted)
  const principal = inputMode === "loan" ? nLoanAmount : nLoanAmount - nDownPayment;
  const downPaymentPercent = inputMode === "loan"
    ? 20 // assume 20%+ when entering loan amount directly (no PMI by default)
    : downPaymentMode === "%"
      ? num(downPayment)
      : (nLoanAmount > 0 ? (nDownPayment / nLoanAmount) * 100 : 0);
  const needsPMI = inputMode === "loan" ? false : downPaymentPercent < 20;

  const handlePrint = () => {
    const el = document.getElementById('calc-print-content');
    if (el) el.classList.remove('hidden');
    window.print();
    setTimeout(() => {
      if (el) el.classList.add('hidden');
    }, 1000);
  };

  const calc = useMemo(() => {
    const monthlyRate = nInterestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const p = principal;

    if (p <= 0 || monthlyRate <= 0 || numPayments <= 0) {
      return {
        monthlyPI: 0,
        monthlyPMI: 0,
        totalMonthly: 0,
        totalInterest: 0,
        totalCost: 0,
        amortization: [] as AmortizationRow[],
      };
    }

    const monthlyPI =
      (p * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const monthlyPMI = needsPMI ? (p * (nPmiRate / 100)) / 12 : 0;
    const totalMonthly = monthlyPI + nPropertyTax + nInsurance + nHoaFees + monthlyPMI;

    // Amortization schedule
    const amortization: AmortizationRow[] = [];
    let balance = p;
    let totalInterest = 0;

    for (let i = 1; i <= numPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPI - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;

      amortization.push({
        month: i,
        payment: monthlyPI,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    return {
      monthlyPI,
      monthlyPMI,
      totalMonthly,
      totalInterest,
      totalCost: totalInterest + p + (nPropertyTax + nInsurance + nHoaFees + monthlyPMI) * numPayments,
      amortization,
    };
  }, [principal, nInterestRate, loanTerm, nPropertyTax, nInsurance, nHoaFees, nPmiRate, needsPMI]);

  const pieData = [
    { name: "Principal & Interest", value: Math.round(calc.monthlyPI) },
    { name: "Property Tax", value: nPropertyTax },
    { name: "Insurance", value: nInsurance },
    { name: "HOA Fees", value: nHoaFees },
    ...(needsPMI ? [{ name: "PMI", value: Math.round(calc.monthlyPMI) }] : []),
  ].filter((d) => d.value > 0);

  return (
    <Layout>
      <SEO
        title="Hawaii Mortgage Calculator — Estimate Your Monthly Payment"
        description="Use our free Hawaii mortgage calculator to estimate your monthly payment including principal, interest, property taxes, insurance, HOA fees, and PMI. Includes full amortization schedule and payment breakdown chart."
        url="/calculator"
        keywords="Hawaii mortgage calculator, mortgage payment calculator Hawaii, Hawaii home loan calculator, amortization schedule Hawaii, monthly mortgage payment Hawaii"
      />
      <PageHero
        title="Mortgage Calculator"
        subtitle="Estimate your monthly mortgage payment including principal, interest, taxes, insurance, and HOA fees."
        image={IMAGES.heroCalculator}
        compact
        className="no-print"
      />

      {/* ── Mobile sticky total bar ─────────────────────────────────────── */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-navy border-b border-gold/20 px-4 py-2.5 flex items-center justify-between no-print">
        <span className="text-sand/70 text-xs font-body">Est. Monthly Payment</span>
        <span className="font-display text-xl text-white">{formatCurrency(calc.totalMonthly)}</span>
      </div>

      <section className="py-4 lg:py-24 no-print-page">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-12">
            {/* Inputs */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border p-3 lg:p-6 lg:sticky lg:top-28">
                <h2 className="font-display text-base lg:text-xl text-navy mb-3 lg:mb-6 flex items-center gap-2">
                  <CalcIcon className="w-4 h-4 lg:w-5 lg:h-5 text-teal" />
                  Loan Details
                </h2>

                {/* ── MOBILE: compact 2-col grid ─────────────────────────── */}
                <div className="lg:hidden space-y-2">

                  {/* Input mode toggle */}
                  <div className="flex rounded-md border border-border overflow-hidden text-xs font-body font-semibold w-full">
                    <button onClick={() => setInputMode("price")} className={`flex-1 py-1.5 transition-colors ${inputMode==="price"?"bg-teal text-white":"bg-white text-muted-foreground"}`}>Home Price</button>
                    <button onClick={() => setInputMode("loan")} className={`flex-1 py-1.5 transition-colors ${inputMode==="loan"?"bg-teal text-white":"bg-white text-muted-foreground"}`}>Loan Amount</button>
                  </div>

                  {/* Row 1: Price/Loan + Down Payment */}
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label={inputMode==="price"?"Purchase Price":"Loan Amount"} value={loanAmount} onChange={setLoanAmount} icon={DollarSign} prefix="$" step={10000} min={0} compact />
                    {/* Down Payment compact — hidden in loan amount mode */}
                    <div className={inputMode==="loan"?"opacity-0 pointer-events-none":""} >
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-body font-medium text-navy">Down Payment</label>
                        <div className="flex rounded border border-border overflow-hidden text-[10px] font-body font-semibold">
                          <button onClick={() => { if (downPaymentMode !== "$") { const d = (num(downPayment)/100)*nLoanAmount; setDownPayment(d>0?String(Math.round(d)):""); setDownPaymentMode("$"); } }} className={`px-1.5 py-0.5 transition-colors ${downPaymentMode==="$"?"bg-teal text-white":"bg-white text-muted-foreground"}`}>$</button>
                          <button onClick={() => { if (downPaymentMode !== "%") { const p = nLoanAmount>0?(num(downPayment)/nLoanAmount)*100:0; setDownPayment(p>0?String(parseFloat(p.toFixed(2))):""); setDownPaymentMode("%"); } }} className={`px-1.5 py-0.5 transition-colors ${downPaymentMode==="%"?"bg-teal text-white":"bg-white text-muted-foreground"}`}>%</button>
                        </div>
                      </div>
                      <div className="relative">
                        {downPaymentMode==="$" && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>}
                        <input type="number" value={downPayment} placeholder="0" onChange={e=>setDownPayment(e.target.value)} onFocus={e=>e.target.select()} step={downPaymentMode==="$"?5000:0.5} min={0} max={downPaymentMode==="%"?100:undefined} className={`w-full ${downPaymentMode==="$"?"pl-6":"pl-2.5"} pr-6 py-1.5 rounded-md border border-border bg-white text-navy text-xs focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`} />
                        {downPaymentMode==="%" && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{downPaymentMode==="%"?formatCurrency(nDownPayment):`${downPaymentPercent.toFixed(1)}%`}</p>
                    </div>
                  </div>

                  {/* Row 2: Interest Rate + Loan Amount (display — only in price mode) */}
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Interest Rate" value={interestRate} onChange={setInterestRate} icon={Percent} suffix="%" step={0.125} min={0} max={20} compact />
                    {inputMode==="price" && (
                      <div>
                        <label className="block text-xs font-body font-medium text-navy mb-1">Loan Amount</label>
                        <div className="py-1.5 px-2.5 rounded-md border border-teal/40 bg-teal/5 text-teal text-xs font-body font-semibold h-[30px] flex items-center">{formatCurrency(principal)}</div>
                      </div>
                    )}
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-xs font-body font-medium text-navy mb-1">Loan Term</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[15,20,30].map(t=>(
                        <button key={t} onClick={()=>setLoanTerm(t)} className={`py-1.5 rounded-md text-xs font-body font-medium transition-all ${loanTerm===t?"bg-teal text-white shadow-sm shadow-teal/20":"bg-sand text-muted-foreground hover:bg-sand-dark"}`}>{t}yr</button>
                      ))}
                    </div>
                  </div>

                  {/* Row 3: RPT + Insurance */}
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="RPT (Tax/mo)" value={propertyTax} onChange={setPropertyTax} icon={DollarSign} prefix="$" step={25} min={0} compact />
                    <InputField label="Insurance/mo" value={insurance} onChange={setInsurance} icon={DollarSign} prefix="$" step={25} min={0} compact />
                  </div>

                  {/* Row 4: HOA + PMI */}
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="HOA Dues/mo" value={hoaFees} onChange={setHoaFees} icon={DollarSign} prefix="$" step={25} min={0} compact />
                    {needsPMI
                      ? <InputField label="PMI Rate" value={pmiRate} onChange={setPmiRate} icon={Percent} suffix="%" step={0.1} min={0} max={3} compact />
                      : <div />}
                  </div>

                  {/* Mobile payment summary */}
                  <div className="bg-navy/5 border border-navy/10 rounded-lg p-2.5 mt-1">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-2">
                      <div className="flex justify-between"><span className="text-muted-foreground">P&amp;I</span><span className="font-body font-semibold text-navy">{formatCurrency(calc.monthlyPI)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-body font-semibold text-navy">{formatCurrency(nPropertyTax)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span className="font-body font-semibold text-navy">{formatCurrency(nInsurance)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">HOA</span><span className="font-body font-semibold text-navy">{formatCurrency(nHoaFees)}</span></div>
                      {needsPMI && <div className="flex justify-between col-span-2"><span className="text-muted-foreground">PMI</span><span className="font-body font-semibold text-navy">{formatCurrency(calc.monthlyPMI)}</span></div>}
                    </div>
                    <div className="border-t border-navy/10 pt-2 flex items-center justify-between">
                      <span className="text-xs font-body font-bold text-navy">Total Monthly</span>
                      <span className="text-lg font-display text-teal">{formatCurrency(calc.totalMonthly)}</span>
                    </div>
                  </div>
                </div>

                {/* ── DESKTOP: original stacked layout ──────────────────── */}
                <div className="hidden lg:block space-y-4">
                  {/* Input mode toggle */}
                  <div className="flex rounded-md border border-border overflow-hidden text-sm font-body font-semibold">
                    <button onClick={() => setInputMode("price")} className={`flex-1 py-2 transition-colors ${inputMode==="price"?"bg-teal text-white":"bg-white text-muted-foreground hover:bg-sand/40"}`}>Home Price</button>
                    <button onClick={() => setInputMode("loan")} className={`flex-1 py-2 transition-colors ${inputMode==="loan"?"bg-teal text-white":"bg-white text-muted-foreground hover:bg-sand/40"}`}>Loan Amount</button>
                  </div>
                  <InputField label={inputMode==="price"?"Home Price":"Loan Amount"} value={loanAmount} onChange={setLoanAmount} icon={DollarSign} prefix="$" step={10000} min={0} />
                  {/* Down Payment with % / $ toggle — hidden in loan amount mode */}
                  {inputMode==="price" && (<div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-body font-medium text-navy">Down Payment</label>
                      <div className="flex rounded-md border border-border overflow-hidden text-xs font-body font-semibold">
                        <button onClick={() => { if (downPaymentMode !== "$") { const dollars = (num(downPayment)/100)*nLoanAmount; setDownPayment(dollars>0?String(Math.round(dollars)):""); setDownPaymentMode("$"); } }} className={`px-2.5 py-1 transition-colors ${downPaymentMode==="$"?"bg-teal text-white":"bg-white text-muted-foreground hover:bg-sand/40"}`}>$</button>
                        <button onClick={() => { if (downPaymentMode !== "%") { const pct = nLoanAmount>0?(num(downPayment)/nLoanAmount)*100:0; setDownPayment(pct>0?String(parseFloat(pct.toFixed(2))):""); setDownPaymentMode("%"); } }} className={`px-2.5 py-1 transition-colors ${downPaymentMode==="%"?"bg-teal text-white":"bg-white text-muted-foreground hover:bg-sand/40"}`}>%</button>
                      </div>
                    </div>
                    <div className="relative">
                      {downPaymentMode==="$" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>}
                      <input type="number" value={downPayment} placeholder="0" onChange={e=>setDownPayment(e.target.value)} onFocus={e=>e.target.select()} step={downPaymentMode==="$"?5000:0.5} min={0} max={downPaymentMode==="%"?100:undefined} className={`w-full ${downPaymentMode==="$"?"pl-7":"pl-3"} pr-8 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`} />
                      {downPaymentMode==="%" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{downPaymentMode==="%"?`${formatCurrency(nDownPayment)} down`:`${downPaymentPercent.toFixed(1)}% down`}</p>
                  </div>)}
                  <InputField label="Interest Rate" value={interestRate} onChange={setInterestRate} icon={Percent} suffix="%" step={0.125} min={0} max={20} />
                  <div>
                    <label className="block text-sm font-body font-medium text-navy mb-1.5">Loan Term</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15,20,30].map(t=>(
                        <button key={t} onClick={()=>setLoanTerm(t)} className={`py-2 rounded-md text-sm font-body font-medium transition-all ${loanTerm===t?"bg-teal text-white shadow-md shadow-teal/20":"bg-sand text-muted-foreground hover:bg-sand-dark"}`}>{t} years</button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Costs</p>
                    <div className="space-y-3">
                      <InputField label="Property Tax" value={propertyTax} onChange={setPropertyTax} icon={DollarSign} prefix="$" suffix="/mo" step={25} min={0} />
                      <InputField label="Homeowner's Insurance" value={insurance} onChange={setInsurance} icon={DollarSign} prefix="$" suffix="/mo" step={25} min={0} />
                      <InputField label="HOA Fees" value={hoaFees} onChange={setHoaFees} icon={DollarSign} prefix="$" suffix="/mo" step={25} min={0} />
                      {needsPMI && <InputField label="PMI Rate" value={pmiRate} onChange={setPmiRate} icon={Percent} suffix="%" step={0.1} min={0} max={3} helpText="Required when down payment is less than 20%" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {/* Monthly Payment Card */}
              <div className="bg-navy rounded-xl p-6 lg:p-8 mb-6">
                <p className="text-sand/60 text-sm mb-1">Estimated Monthly Payment</p>
                <p className="font-display text-4xl lg:text-5xl text-white mb-6">
                  {formatCurrency(calc.totalMonthly)}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-sand/50 mb-0.5">Loan Amount</p>
                    <p className="text-white text-sm font-body font-medium">{formatCurrency(principal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sand/50 mb-0.5">Note Rate</p>
                    <p className="text-white text-sm font-body font-medium">{nInterestRate.toFixed(3)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-sand/50 mb-0.5">Total Cost</p>
                    <p className="text-white text-sm font-body font-medium">{formatCurrency(calc.totalCost)}</p>
                  </div>
                </div>

                {needsPMI && (
                  <div className="flex items-start gap-2 bg-gold/10 rounded-lg p-3">
                    <Info className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <p className="text-xs text-sand/70">
                      PMI of {formatCurrency(calc.monthlyPMI)}/mo is included because your down payment is less than 20%. PMI can be removed once you reach 20% equity.
                    </p>
                  </div>
                )}
              </div>

              {/* Pie Chart Breakdown */}
              <div className="bg-card rounded-xl border border-border p-6 lg:p-8 mb-6">
                <h3 className="font-display text-xl text-navy mb-6">Payment Breakdown</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "#0C2340",
                            border: "none",
                            borderRadius: "8px",
                            color: "#F5E6D3",
                            fontSize: "13px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-body font-semibold text-navy">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <span className="text-sm font-body font-semibold text-navy">Total</span>
                      <span className="text-sm font-body font-bold text-teal">
                        {formatCurrency(calc.totalMonthly)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amortization Schedule */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="w-full flex items-center justify-between p-6 hover:bg-sand/50 transition-colors"
                >
                  <h3 className="font-display text-xl text-navy">Amortization Schedule</h3>
                  {showAmortization ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {showAmortization && (
                  <div className="px-6 pb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 pr-4 font-body font-semibold text-navy">Year</th>
                            <th className="text-right py-3 px-4 font-body font-semibold text-navy">Payment</th>
                            <th className="text-right py-3 px-4 font-body font-semibold text-navy">Principal</th>
                            <th className="text-right py-3 px-4 font-body font-semibold text-navy">Interest</th>
                            <th className="text-right py-3 pl-4 font-body font-semibold text-navy">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calc.amortization
                            .filter((row) => row.month % 12 === 0)
                            .map((row) => {
                              const yearStart = row.month - 11;
                              const yearRows = calc.amortization.slice(yearStart - 1, row.month);
                              const yearPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
                              const yearInterest = yearRows.reduce((s, r) => s + r.interest, 0);
                              const yearPayment = yearRows.reduce((s, r) => s + r.payment, 0);

                              return (
                                <tr key={row.month} className="border-b border-border/50 hover:bg-sand/30 transition-colors">
                                  <td className="py-2.5 pr-4 text-navy font-body font-medium">
                                    Year {row.month / 12}
                                  </td>
                                  <td className="py-2.5 px-4 text-right text-muted-foreground">
                                    {formatCurrencyExact(yearPayment)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right text-teal font-body font-medium">
                                    {formatCurrencyExact(yearPrincipal)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right text-muted-foreground">
                                    {formatCurrencyExact(yearInterest)}
                                  </td>
                                  <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">
                                    {formatCurrency(row.balance)}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Print Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 bg-white border border-navy/30 hover:border-navy hover:bg-navy/5 text-navy px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>

              {/* Advanced Calculator Upsell */}
              <div className="mt-8 bg-teal/10 border border-teal/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center shrink-0">
                    <CalcIcon className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-navy text-sm">Want a more detailed breakdown?</p>
                    <p className="text-sm text-navy/70 font-body">The Advanced Calculator handles Conventional, VA, FHA, and Jumbo loans — with real PMI rates, VA funding fees, FHA mortgage insurance, and full amortization.</p>
                  </div>
                </div>
                <Link
                  to="/advanced-calculator"
                  className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white px-5 py-2.5 rounded-md text-sm font-body font-semibold transition-all shrink-0 hover:shadow-md"
                >
                  Try the Advanced Calculator
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Buydown Calculator Link */}
              <div className="mt-4 bg-gold/5 border border-gold/25 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-navy text-sm">Considering a seller credit?</p>
                    <p className="text-sm text-navy/70 font-body">See how a temporary buydown could lower your payments in the first 1–3 years.</p>
                  </div>
                </div>
                <Link
                  to={`/buydown-calculator?loan=${principal}&rate=${nInterestRate}&term=${loanTerm}`}
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-md text-sm font-body font-semibold transition-all shrink-0 hover:shadow-md"
                >
                  See Buydown Savings
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* CTA */}
              <ContactActions
                variant="compact"
                kicker="Like What You See?"
                headline="Get Pre-Approved Today"
                subtext="Lock in your rate with Jay Miller — takes just minutes."
                hideEmail
                className="mt-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRINT-ONLY SUMMARY ─────────────────────────────────────────────── */}
      <div id="calc-print-content" className="hidden">
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

          {/* Total Payment Highlight */}
          <div className="print-highlight">
            <div className="print-highlight-left">
              <span className="print-badge">Payment Estimate</span>
              <div className="big-label">Total Monthly Payment</div>
              <div className="big-number">{formatCurrency(calc.totalMonthly)}</div>
              <div className="print-highlight-sub">{nInterestRate}% rate · {loanTerm}-year term</div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div className="big-label">Principal &amp; Interest</div>
              <div className="big-number">{formatCurrency(calc.monthlyPI)}</div>
              <div className="print-highlight-sub">base P&amp;I payment</div>
            </div>
          </div>

          {/* Loan Summary */}
          <h2>Loan Summary</h2>
          <div className="print-grid">
            <div className="print-row"><span className="label">Purchase Price</span><span className="value">{formatCurrency(nLoanAmount)}</span></div>
            <div className="print-row"><span className="label">Down Payment</span><span className="value">{formatCurrency(nDownPayment)} ({downPaymentPercent.toFixed(1)}%)</span></div>
            <div className="print-row"><span className="label">Loan Amount</span><span className="value">{formatCurrency(principal)}</span></div>
            <div className="print-row"><span className="label">Interest Rate</span><span className="value">{nInterestRate}%</span></div>
            <div className="print-row"><span className="label">Loan Term</span><span className="value">{loanTerm} Years</span></div>
            <div className="print-row"><span className="label">Total Interest Paid</span><span className="value">{formatCurrency(calc.totalInterest)}</span></div>
          </div>

          {/* Monthly Payment Breakdown */}
          <h2>Monthly Payment Breakdown</h2>
          <div className="print-row"><span className="label">Principal &amp; Interest</span><span className="value">{formatCurrency(calc.monthlyPI)}</span></div>
          {nPropertyTax > 0 && <div className="print-row"><span className="label">Property Taxes</span><span className="value">{formatCurrency(nPropertyTax)}</span></div>}
          {nInsurance > 0 && <div className="print-row"><span className="label">Homeowner's Insurance</span><span className="value">{formatCurrency(nInsurance)}</span></div>}
          {nHoaFees > 0 && <div className="print-row"><span className="label">HOA Fees</span><span className="value">{formatCurrency(nHoaFees)}</span></div>}
          {needsPMI && calc.monthlyPMI > 0 && <div className="print-row"><span className="label">PMI ({nPmiRate}% annual)</span><span className="value">{formatCurrency(calc.monthlyPMI)}</span></div>}
          <div className="print-row total"><span className="label">Total Monthly Payment</span><span className="value">{formatCurrency(calc.totalMonthly)}</span></div>

          {/* Disclaimer */}
          <div className="print-note">
            This estimate is for informational purposes only and does not constitute a loan commitment or guarantee of financing. Actual rates, payments, taxes, and insurance costs may vary. Contact Jay Miller (NMLS #{LENDER.nmls}) at {LENDER.phone} for a personalized quote. {LENDER.company} NMLS #{LENDER.companyNmls}. Equal Housing Lender.
          </div>
        </div>
      </div>
    </Layout>
  );
}
