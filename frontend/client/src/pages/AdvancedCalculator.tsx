/*
 * Pacific Modernism — Advanced Mortgage Calculator
 * Supports Conventional (PMI table), VA (funding fee), FHA (UFMIP/MIP), Jumbo
 * Honolulu County conforming limit: $1,249,125 (2026)
 * Features: Comparison Mode, Share Results via URL
 */
import { useState, useMemo, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Calculator as CalcIcon,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Home,
  AlertTriangle,
  CheckCircle,
  Share2,
  Copy,
  Check,
  GitCompareArrows,
  X,
  Printer,
  Download,
  Mail,
  TrendingDown,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

// ─── Constants ────────────────────────────────────────────────────────────────

const CONFORMING_LIMIT = 1249125;

type LoanType = "conventional" | "va" | "fha" | "jumbo";

// ─── PMI Rate Table (Conventional) ────────────────────────────────────────────
// Best available annual rates across MGIC, Radian, and Arch MI (Feb 2026)
// Fixed-rate, >20yr term, primary residence, purchase/rate-term refi
// Coverage: 35% (97%), 25% (95%), 25% (90%), 12% (85%) per GSE requirements
const PMI_FICO_TIERS = [760, 740, 720, 700, 680, 660, 640, 620] as const;
const PMI_LTV_TIERS = [
  { min: 95.01, max: 97, label: "95.01–97%" },
  { min: 90.01, max: 95, label: "90.01–95%" },
  { min: 85.01, max: 90, label: "85.01–90%" },
  { min: 80.01, max: 85, label: "80.01–85%" },
] as const;

const PMI_RATES: number[][] = [
  // 95.01-97% LTV (35% coverage): 760+, 740, 720, 700, 680, 660, 640, 620-639
  [0.0058, 0.0070, 0.0087, 0.0099, 0.0121, 0.0154, 0.0165, 0.0186],
  // 90.01-95% LTV (25% coverage)
  [0.0034, 0.0048, 0.0059, 0.0068, 0.0087, 0.0111, 0.0119, 0.0125],
  // 85.01-90% LTV (25% coverage)
  [0.0022, 0.0038, 0.0046, 0.0055, 0.0065, 0.0090, 0.0091, 0.0094],
  // 80.01-85% LTV (12% coverage)
  [0.0017, 0.0019, 0.0022, 0.0023, 0.0026, 0.0032, 0.0034, 0.0041],
];

function getPmiRate(ltv: number, fico: number): number {
  if (ltv <= 80) return 0;
  let ltvRow = PMI_RATES.length - 1;
  for (let i = 0; i < PMI_LTV_TIERS.length; i++) {
    if (ltv > PMI_LTV_TIERS[i].min) { ltvRow = i; break; }
  }
  let ficoCol = PMI_FICO_TIERS.length - 1;
  if (fico >= 760) ficoCol = 0;
  else if (fico >= 740) ficoCol = 1;
  else if (fico >= 720) ficoCol = 2;
  else if (fico >= 700) ficoCol = 3;
  else if (fico >= 680) ficoCol = 4;
  else if (fico >= 660) ficoCol = 5;
  else if (fico >= 640) ficoCol = 6;
  else ficoCol = 7;
  return PMI_RATES[ltvRow][ficoCol];
}

// ─── VA Funding Fee Table ─────────────────────────────────────────────────────
function getVaFundingFeeRate(dp: number, first: boolean, disability: boolean): number {
  if (disability) return 0;
  if (dp >= 10) return 0.0125;
  if (dp >= 5) return 0.015;
  return first ? 0.0215 : 0.033;
}

// ─── FHA MIP Rates (2026 HUD rates, effective since Jan 2023) ─────────────────
const FHA_UFMIP_RATE = 0.0175;
function getFhaMipRate(ltv: number): number {
  // 2026 annual MIP rates: 0.55% for LTV > 90%, 0.50% for LTV ≤ 90%
  return ltv > 90 ? 0.0055 : 0.0050;
}

// ─── Pie Chart Colors ─────────────────────────────────────────────────────────
const PIE_COLORS = [
  "oklch(0.55 0.12 195)", "oklch(0.72 0.10 60)", "oklch(0.45 0.12 195)",
  "oklch(0.65 0.10 195)", "oklch(0.82 0.08 60)", "oklch(0.40 0.08 250)",
];

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtExact(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function fmtPct(n: number, d = 2): string { return `${n.toFixed(d)}%`; }

// ─── Input Component ──────────────────────────────────────────────────────────
function InputField({ label, value, onChange, prefix, suffix, step, min, max, helpText, error }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: number; min?: number; max?: number;
  helpText?: string; error?: string;
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
          className={`w-full ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-10" : "pr-3"} py-2.5 rounded-md border ${error ? "border-destructive" : "border-border"} bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {helpText && !error && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
    </div>
  );
}

// ─── Amortization Row Type ────────────────────────────────────────────────────
interface AmortizationRow { month: number; payment: number; principal: number; interest: number; balance: number; }

// ─── Loan Inputs Type ─────────────────────────────────────────────────────────
interface LoanInputs {
  loanType: LoanType;
  homePrice: number;
  downPaymentMode: "dollar" | "percent";
  downPaymentDollar: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: 15 | 20 | 30;
  ficoScore: number;
  propertyTax: number;
  insurance: number;
  hoaFees: number;
  vaFirstUse: boolean;
  vaDisability: boolean;
}

interface CalcResult {
  monthlyPI: number; monthlyPmi: number; monthlyMip: number; totalMonthly: number;
  totalInterest: number; totalLoanAmount: number; baseLoanAmount: number;
  vaFundingFee: number; vaFundingFeeRate: number; vaFundingFeeWaived: boolean;
  fhaUfmip: number; pmiAnnualRate: number; loanType: LoanType;
  amortization: AmortizationRow[];
  dpDollar: number; dpPercent: number; ltv: number;
}

const defaultInputs: LoanInputs = {
  loanType: "conventional", homePrice: 800000,
  downPaymentMode: "percent", downPaymentDollar: 160000, downPaymentPercent: 20,
  interestRate: 6.000, loanTerm: 30, ficoScore: 740,
  propertyTax: 350, insurance: 150, hoaFees: 400,
  vaFirstUse: true, vaDisability: false,
};

const loanTypeLabels: Record<LoanType, string> = {
  conventional: "Conventional", va: "VA", fha: "FHA", jumbo: "Jumbo",
};

// ─── Calculate function ───────────────────────────────────────────────────────
function calculate(inputs: LoanInputs): CalcResult {
  const { loanType, homePrice, downPaymentMode, downPaymentDollar, downPaymentPercent,
    interestRate, loanTerm, ficoScore, propertyTax, insurance, hoaFees,
    vaFirstUse, vaDisability } = inputs;

  const dpDollar = downPaymentMode === "dollar" ? downPaymentDollar : Math.round(homePrice * downPaymentPercent / 100);
  const dpPercent = downPaymentMode === "percent" ? downPaymentPercent : (homePrice > 0 ? (downPaymentDollar / homePrice) * 100 : 0);
  const baseLoanAmount = Math.max(0, homePrice - dpDollar);
  const ltv = homePrice > 0 ? (baseLoanAmount / homePrice) * 100 : 0;

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  let totalLoanAmount = baseLoanAmount;
  let vaFundingFee = 0, vaFundingFeeRate = 0, fhaUfmip = 0, monthlyMip = 0, monthlyPmi = 0, pmiAnnualRate = 0;

  if (loanType === "va") {
    vaFundingFeeRate = getVaFundingFeeRate(dpPercent, vaFirstUse, vaDisability);
    vaFundingFee = baseLoanAmount * vaFundingFeeRate;
    totalLoanAmount = baseLoanAmount + vaFundingFee;
  } else if (loanType === "fha") {
    fhaUfmip = baseLoanAmount * FHA_UFMIP_RATE;
    totalLoanAmount = baseLoanAmount + fhaUfmip;
    monthlyMip = (baseLoanAmount * getFhaMipRate(ltv)) / 12;
  } else if (loanType === "conventional" && ltv > 80) {
    pmiAnnualRate = getPmiRate(ltv, ficoScore);
    monthlyPmi = (baseLoanAmount * pmiAnnualRate) / 12;
  }

  if (totalLoanAmount <= 0 || monthlyRate <= 0 || numPayments <= 0) {
    return { monthlyPI: 0, monthlyPmi: 0, monthlyMip: 0, totalMonthly: 0, totalInterest: 0, totalLoanAmount: 0, baseLoanAmount: 0, vaFundingFee: 0, vaFundingFeeRate: 0, vaFundingFeeWaived: false, fhaUfmip: 0, pmiAnnualRate: 0, loanType, amortization: [], dpDollar, dpPercent, ltv };
  }

  const monthlyPI = (totalLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalMonthly = monthlyPI + propertyTax + insurance + hoaFees + monthlyPmi + monthlyMip;

  const amortization: AmortizationRow[] = [];
  let balance = totalLoanAmount, totalInterest = 0;
  for (let i = 1; i <= numPayments; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPI - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
    amortization.push({ month: i, payment: monthlyPI, principal: principalPayment, interest: interestPayment, balance: Math.max(0, balance) });
  }

  return { monthlyPI, monthlyPmi, monthlyMip, totalMonthly, totalInterest, totalLoanAmount, baseLoanAmount, vaFundingFee, vaFundingFeeRate, vaFundingFeeWaived: vaDisability, fhaUfmip, pmiAnnualRate, loanType, amortization, dpDollar, dpPercent, ltv };
}

// ─── URL Encoding/Decoding ────────────────────────────────────────────────────
function encodeInputsToURL(inputs: LoanInputs): string {
  const params = new URLSearchParams();
  params.set("lt", inputs.loanType);
  params.set("hp", String(inputs.homePrice));
  params.set("dpm", inputs.downPaymentMode);
  if (inputs.downPaymentMode === "dollar") params.set("dpd", String(inputs.downPaymentDollar));
  else params.set("dpp", String(inputs.downPaymentPercent));
  params.set("ir", String(inputs.interestRate));
  params.set("term", String(inputs.loanTerm));
  params.set("fico", String(inputs.ficoScore));
  params.set("tax", String(inputs.propertyTax));
  params.set("ins", String(inputs.insurance));
  params.set("hoa", String(inputs.hoaFees));
  if (inputs.loanType === "va") {
    params.set("vfu", inputs.vaFirstUse ? "1" : "0");
    params.set("vd", inputs.vaDisability ? "1" : "0");
  }
  return params.toString();
}

function decodeInputsFromURL(): LoanInputs | null {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("lt")) return null;
  const lt = params.get("lt") as LoanType;
  if (!["conventional", "va", "fha", "jumbo"].includes(lt)) return null;
  const dpm = (params.get("dpm") || "percent") as "dollar" | "percent";
  return {
    loanType: lt,
    homePrice: Number(params.get("hp")) || 800000,
    downPaymentMode: dpm,
    downPaymentDollar: Number(params.get("dpd")) || 160000,
    downPaymentPercent: Number(params.get("dpp")) || 20,
    interestRate: Number(params.get("ir")) || 6.0,
    loanTerm: ([15, 20, 30].includes(Number(params.get("term"))) ? Number(params.get("term")) as 15 | 20 | 30 : 30),
    ficoScore: Number(params.get("fico")) || 740,
    propertyTax: Number(params.get("tax")) || 0,
    insurance: Number(params.get("ins")) || 0,
    hoaFees: Number(params.get("hoa")) || 0,
    vaFirstUse: params.get("vfu") !== "0",
    vaDisability: params.get("vd") === "1",
  };
}

// ─── Loan Input Panel ─────────────────────────────────────────────────────────
function LoanInputPanel({ inputs, onChange, label }: { inputs: LoanInputs; onChange: (i: LoanInputs) => void; label?: string }) {
  const set = (partial: Partial<LoanInputs>) => onChange({ ...inputs, ...partial });
  const dpDollar = inputs.downPaymentMode === "dollar" ? inputs.downPaymentDollar : Math.round(inputs.homePrice * inputs.downPaymentPercent / 100);
  const dpPercent = inputs.downPaymentMode === "percent" ? inputs.downPaymentPercent : (inputs.homePrice > 0 ? (inputs.downPaymentDollar / inputs.homePrice) * 100 : 0);
  const baseLoan = Math.max(0, inputs.homePrice - dpDollar);
  const ltv = inputs.homePrice > 0 ? (baseLoan / inputs.homePrice) * 100 : 0;
  const jumboMinDownError = inputs.loanType === "jumbo" && dpPercent < 20 ? "Jumbo loans require a minimum 20% down payment." : undefined;
  const showFico = inputs.loanType === "conventional" || inputs.loanType === "fha";

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      {label && (
        <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-teal" />
          {label}
        </h3>
      )}

      {/* Loan Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-body font-medium text-navy mb-2">Loan Type</label>
        <div className="flex gap-1.5">
          {(["conventional", "va", "fha", "jumbo"] as LoanType[]).map((type) => (
            <button key={type} onClick={() => set({ loanType: type })}
              className={`py-2 rounded-md text-xs font-body font-semibold transition-all uppercase tracking-wide whitespace-nowrap ${type === "conventional" ? "flex-[2]" : "flex-[1]"} ${inputs.loanType === type ? "bg-teal text-white shadow-md shadow-teal/20" : "bg-sand text-muted-foreground hover:bg-sand-dark"}`}
            >{loanTypeLabels[type]}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <InputField label="Home Purchase Price" value={inputs.homePrice} onChange={(v) => set({ homePrice: v })} prefix="$" step={10000} min={0} />

        {/* Down Payment */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-body font-medium text-navy">Down Payment</label>
            <div className="flex items-center gap-1 bg-sand rounded-md p-0.5">
              <button onClick={() => { set({ downPaymentMode: "dollar", downPaymentDollar: Math.round(inputs.homePrice * inputs.downPaymentPercent / 100) }); }}
                className={`px-2 py-1 rounded text-xs font-body font-medium transition-all ${inputs.downPaymentMode === "dollar" ? "bg-white text-navy shadow-sm" : "text-muted-foreground"}`}>$</button>
              <button onClick={() => { set({ downPaymentMode: "percent", downPaymentPercent: inputs.homePrice > 0 ? Math.round((inputs.downPaymentDollar / inputs.homePrice) * 100 * 10) / 10 : 0 }); }}
                className={`px-2 py-1 rounded text-xs font-body font-medium transition-all ${inputs.downPaymentMode === "percent" ? "bg-white text-navy shadow-sm" : "text-muted-foreground"}`}>%</button>
            </div>
          </div>
          {inputs.downPaymentMode === "dollar" ? (
            <InputField label="" value={inputs.downPaymentDollar} onChange={(v) => set({ downPaymentDollar: v, downPaymentMode: "dollar" })} prefix="$" step={5000} min={0} helpText={`${dpPercent.toFixed(1)}% down`} error={jumboMinDownError} />
          ) : (
            <InputField label="" value={inputs.downPaymentPercent} onChange={(v) => set({ downPaymentPercent: v, downPaymentMode: "percent" })} suffix="%" step={1} min={0} max={100} helpText={`${fmt(dpDollar)} down`} error={jumboMinDownError} />
          )}
        </div>

        <InputField label="Interest Rate" value={inputs.interestRate} onChange={(v) => set({ interestRate: v })} suffix="%" step={0.125} min={0} max={20} helpText="Enter rate in 0.125% increments (e.g. 6.125%)" />

        {/* Loan Term */}
        <div>
          <label className="block text-sm font-body font-medium text-navy mb-1.5">Loan Term</label>
          <div className="grid grid-cols-3 gap-2">
            {([15, 20, 30] as const).map((term) => (
              <button key={term} onClick={() => set({ loanTerm: term })}
                className={`py-2 rounded-md text-sm font-body font-medium transition-all ${inputs.loanTerm === term ? "bg-teal text-white shadow-md shadow-teal/20" : "bg-sand text-muted-foreground hover:bg-sand-dark"}`}
              >{term} years</button>
            ))}
          </div>
        </div>

        {/* FICO */}
        {showFico && (
          <InputField label={inputs.loanType === "fha" ? "FICO Score (for reference)" : "FICO Score"} value={inputs.ficoScore} onChange={(v) => set({ ficoScore: v })} step={10} min={300} max={850}
            helpText={inputs.loanType === "conventional" && ltv > 80 ? `Used for PMI rate lookup — best rate across MGIC, Radian & Arch MI (LTV: ${fmtPct(ltv, 1)})` : inputs.loanType === "fha" ? "FHA MIP rates are based on LTV, not FICO" : undefined} />
        )}

        {/* VA-specific */}
        {inputs.loanType === "va" && (
          <div className="bg-sand/50 rounded-lg p-3 space-y-3 border border-border">
            <div className="flex items-center gap-2 mb-1"><Shield className="w-4 h-4 text-teal" /><span className="text-sm font-body font-semibold text-navy">VA Loan Options</span></div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">VA Benefit Usage</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => set({ vaFirstUse: true })} className={`py-2 rounded-md text-xs font-body font-medium transition-all ${inputs.vaFirstUse ? "bg-teal text-white shadow-sm" : "bg-white text-muted-foreground border border-border"}`}>First Use</button>
                <button onClick={() => set({ vaFirstUse: false })} className={`py-2 rounded-md text-xs font-body font-medium transition-all ${!inputs.vaFirstUse ? "bg-teal text-white shadow-sm" : "bg-white text-muted-foreground border border-border"}`}>Subsequent Use</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">10%+ VA Disability Rating?</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => set({ vaDisability: true })} className={`py-2 rounded-md text-xs font-body font-medium transition-all ${inputs.vaDisability ? "bg-teal text-white shadow-sm" : "bg-white text-muted-foreground border border-border"}`}>Yes</button>
                <button onClick={() => set({ vaDisability: false })} className={`py-2 rounded-md text-xs font-body font-medium transition-all ${!inputs.vaDisability ? "bg-teal text-white shadow-sm" : "bg-white text-muted-foreground border border-border"}`}>No</button>
              </div>
            </div>
            <Link
              href="/military-calculator"
              className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-teal/10 hover:bg-teal/20 transition-colors group"
            >
              <Shield className="w-3.5 h-3.5 text-teal shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-body font-semibold text-navy group-hover:text-teal transition-colors">Active Military? Check Your Buying Power</p>
                <p className="text-[10px] text-navy/50 font-body">Calculate BAH + COLA + BAS qualifying income</p>
              </div>
              <ArrowRight className="w-3 h-3 text-teal/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        )}

        {/* Monthly Costs */}
        <div className="border-t border-border pt-3">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Costs (Optional)</p>
          <div className="space-y-3">
            <InputField label="Property Tax" value={inputs.propertyTax} onChange={(v) => set({ propertyTax: v })} prefix="$" suffix="/mo" step={25} min={0} />
            <InputField label="Homeowner's Insurance" value={inputs.insurance} onChange={(v) => set({ insurance: v })} prefix="$" suffix="/mo" step={25} min={0} />
            <InputField label="HOA Fees" value={inputs.hoaFees} onChange={(v) => set({ hoaFees: v })} prefix="$" suffix="/mo" step={25} min={0} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Result Summary Card ──────────────────────────────────────────────────────
function ResultCard({ calc, inputs, highlight }: { calc: CalcResult; inputs: LoanInputs; highlight?: boolean }) {
  const pieData = [
    { name: "Principal & Interest", value: Math.round(calc.monthlyPI) },
    ...(inputs.propertyTax > 0 ? [{ name: "Property Tax", value: inputs.propertyTax }] : []),
    ...(inputs.insurance > 0 ? [{ name: "Insurance", value: inputs.insurance }] : []),
    ...(inputs.hoaFees > 0 ? [{ name: "HOA Fees", value: inputs.hoaFees }] : []),
    ...(calc.monthlyPmi > 0 ? [{ name: "PMI", value: Math.round(calc.monthlyPmi) }] : []),
    ...(calc.monthlyMip > 0 ? [{ name: "FHA Monthly MIP", value: Math.round(calc.monthlyMip) }] : []),
  ].filter((d) => d.value > 0);

  return (
    <div className={`rounded-xl p-5 lg:p-6 ${highlight ? "bg-navy ring-2 ring-gold/40" : "bg-navy"}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sand/60 text-sm">Estimated Monthly Payment</p>
        <span className="inline-flex items-center gap-1.5 bg-teal/20 text-teal px-3 py-1 rounded-full text-xs font-body font-semibold uppercase tracking-wide">
          {loanTypeLabels[inputs.loanType]}
        </span>
      </div>
      <p className={`font-display text-3xl lg:text-4xl text-white mb-4 ${highlight ? "text-gold" : ""}`}>
        {fmt(calc.totalMonthly)}
      </p>

      {/* Summary Stats */}
      <div className="mb-2">
        <p className="text-xs text-sand/50 mb-0.5">Purchase Price</p>
        <p className="text-white text-sm font-body font-medium">{fmt(inputs.homePrice)}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div><p className="text-xs text-sand/50 mb-0.5">Base Loan</p><p className="text-white text-sm font-body font-medium">{fmt(calc.baseLoanAmount)}</p></div>
        <div><p className="text-xs text-sand/50 mb-0.5">Total Loan</p><p className="text-white text-sm font-body font-medium">{fmt(calc.totalLoanAmount)}</p></div>
        <div><p className="text-xs text-sand/50 mb-0.5">Note Rate</p><p className="text-white text-sm font-body font-medium">{Number(inputs.interestRate).toFixed(3)}%</p></div>
      </div>

      {/* Itemized Breakdown */}
      <div className="bg-white/5 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-body font-semibold uppercase tracking-wider text-sand/50 mb-1.5">Monthly Breakdown</p>
        <div className="flex justify-between text-sm"><span className="text-sand/70">Principal & Interest</span><span className="text-white font-body font-medium">{fmt(calc.monthlyPI)}</span></div>
        {calc.monthlyPmi > 0 && <div className="flex justify-between text-sm"><span className="text-sand/70">PMI ({fmtPct(calc.pmiAnnualRate * 100)})</span><span className="text-white font-body font-medium">{fmt(calc.monthlyPmi)}</span></div>}
        {calc.monthlyMip > 0 && <div className="flex justify-between text-sm"><span className="text-sand/70">FHA Monthly MIP</span><span className="text-white font-body font-medium">{fmt(calc.monthlyMip)}</span></div>}
        {inputs.propertyTax > 0 && <div className="flex justify-between text-sm"><span className="text-sand/70">Property Tax</span><span className="text-white font-body font-medium">{fmt(inputs.propertyTax)}</span></div>}
        {inputs.insurance > 0 && <div className="flex justify-between text-sm"><span className="text-sand/70">Insurance</span><span className="text-white font-body font-medium">{fmt(inputs.insurance)}</span></div>}
        {inputs.hoaFees > 0 && <div className="flex justify-between text-sm"><span className="text-sand/70">HOA</span><span className="text-white font-body font-medium">{fmt(inputs.hoaFees)}</span></div>}
        <div className="border-t border-white/10 pt-1.5 flex justify-between text-sm">
          <span className="text-white font-body font-bold">Total Monthly</span>
          <span className="text-gold font-body font-bold text-base">{fmt(calc.totalMonthly)}</span>
        </div>
      </div>

      {/* Loan-specific notes */}
      <div className="mt-3 space-y-2">
        {inputs.loanType === "conventional" && calc.monthlyPmi > 0 && (
          <div className="flex items-start gap-2 bg-gold/10 rounded-lg p-2.5"><Info className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" /><p className="text-xs text-sand/70">PMI rate sourced from best available across MGIC, Radian &amp; Arch MI for FICO {inputs.ficoScore} / {fmtPct(calc.ltv, 1)} LTV. Removable at 20% equity.</p></div>
        )}
        {inputs.loanType === "va" && (
          <div className="flex items-start gap-2 bg-teal/10 rounded-lg p-2.5"><Shield className="w-3.5 h-3.5 text-teal mt-0.5 shrink-0" /><p className="text-xs text-sand/70">{calc.vaFundingFeeWaived ? "VA Funding Fee waived (10%+ disability)." : `VA Funding Fee: ${fmt(calc.vaFundingFee)} (${fmtPct(calc.vaFundingFeeRate * 100)}) financed into loan.`}</p></div>
        )}
        {inputs.loanType === "fha" && (
          <div className="flex items-start gap-2 bg-teal/10 rounded-lg p-2.5"><Info className="w-3.5 h-3.5 text-teal mt-0.5 shrink-0" /><p className="text-xs text-sand/70">FHA UFMIP: {fmt(calc.fhaUfmip)} (1.75%) financed. Monthly MIP: {fmt(calc.monthlyMip)}/mo.</p></div>
        )}
        {inputs.loanType === "jumbo" && (
          <div className="flex items-start gap-2 bg-navy-light/30 rounded-lg p-2.5"><Home className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" /><p className="text-xs text-sand/70">Jumbo loan — no PMI, minimum 20% down.</p></div>
        )}
      </div>

      {/* Mini Pie */}
      <div className="mt-4">
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
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-xs text-sand/60">{item.name}</span></div>
              <span className="text-xs font-body font-semibold text-sand/80">{fmt(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdvancedCalculator() {
  const [inputs, setInputs] = useState<LoanInputs>(defaultInputs);
  const [compareMode, setCompareMode] = useState(false);
  const [inputs2, setInputs2] = useState<LoanInputs>({ ...defaultInputs, loanType: "va" });
  const [showAmortization, setShowAmortization] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [extraAnnual, setExtraAnnual] = useState(0);
  const [showExtraPayments, setShowExtraPayments] = useState(false);

  // Load from URL on mount
  useEffect(() => {
    const fromURL = decodeInputsFromURL();
    if (fromURL) setInputs(fromURL);
  }, []);

  const calc = useMemo(() => calculate(inputs), [inputs]);
  const calc2 = useMemo(() => calculate(inputs2), [inputs2]);

  // ─── Accelerated Amortization with Extra Payments ────────────────────────
  const accelAmort = useMemo(() => {
    if ((extraMonthly <= 0 && extraAnnual <= 0) || calc.totalLoanAmount <= 0) return null;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const basePayment = calc.monthlyPI;
    let balance = calc.totalLoanAmount;
    let totalInterest = 0;
    const rows: AmortizationRow[] = [];
    let month = 0;
    while (balance > 0.01 && month < inputs.loanTerm * 12) {
      month++;
      const interestPayment = balance * monthlyRate;
      let principalPayment = basePayment - interestPayment;
      let extra = extraMonthly;
      if (extraAnnual > 0 && month % 12 === 0) extra += extraAnnual;
      principalPayment += extra;
      if (principalPayment > balance) principalPayment = balance;
      balance -= principalPayment;
      totalInterest += interestPayment;
      const totalPmt = interestPayment + principalPayment;
      rows.push({ month, payment: totalPmt, principal: principalPayment, interest: interestPayment, balance: Math.max(0, balance) });
      if (balance <= 0.01) break;
    }
    const standardMonths = inputs.loanTerm * 12;
    const monthsSaved = standardMonths - month;
    const interestSaved = calc.totalInterest - totalInterest;
    return { rows, totalInterest, monthsSaved, interestSaved, payoffMonths: month };
  }, [calc, extraMonthly, extraAnnual, inputs.interestRate, inputs.loanTerm]);

  const baseLoanAmount = calc.baseLoanAmount;
  const ltv = calc.ltv;
  const dpPercent = calc.dpPercent;
  const exceedsConformingLimit = inputs.loanType === "conventional" && baseLoanAmount > CONFORMING_LIMIT;
  const exceedsFhaLimit = inputs.loanType === "fha" && baseLoanAmount > CONFORMING_LIMIT;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const el = document.getElementById("print-summary-content");
      if (!el) return;
      // Temporarily show the print summary
      el.style.display = "block";
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.width = "700px";
      await html2pdf().set({
        margin: [0.3, 0.4, 0.3, 0.4],
        filename: `RealityCents-${loanTypeLabels[inputs.loanType]}-Estimate.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }).from(el).save();
      el.style.display = "";
      el.style.position = "";
      el.style.left = "";
      el.style.width = "";
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to print dialog
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [inputs]);

  const handleEmailShare = useCallback(() => {
    const lt = loanTypeLabels[inputs.loanType];
    const subject = encodeURIComponent(`My Mortgage Scenario – ${lt} on ${fmt(inputs.homePrice)}`);
    const lines: string[] = [
      `MORTGAGE PAYMENT ESTIMATE`,
      `========================`,
      ``,
      `Loan Type: ${lt}`,
      `Home Purchase Price: ${fmt(inputs.homePrice)}`,
      `Down Payment: ${fmt(calc.dpDollar)} (${fmtPct(calc.dpPercent, 1)})`,
      `Base Loan Amount: ${fmt(calc.baseLoanAmount)}`,
    ];
    if (calc.vaFundingFee > 0) lines.push(`VA Funding Fee (financed): ${fmt(calc.vaFundingFee)}`);
    if (calc.fhaUfmip > 0) lines.push(`FHA UFMIP (financed): ${fmt(calc.fhaUfmip)}`);
    lines.push(
      `Total Loan Amount: ${fmt(calc.totalLoanAmount)}`,
      `Interest Rate: ${fmtPct(inputs.interestRate, 3)}`,
      `Loan Term: ${inputs.loanTerm} years`,
      ``,
      `MONTHLY PAYMENT BREAKDOWN`,
      `-------------------------`,
      `Principal & Interest: ${fmt(calc.monthlyPI)}`,
    );
    if (calc.monthlyPmi > 0) lines.push(`PMI: ${fmt(calc.monthlyPmi)}`);
    if (calc.monthlyMip > 0) lines.push(`FHA Monthly MIP: ${fmt(calc.monthlyMip)}`);
    if (inputs.propertyTax > 0) lines.push(`Property Tax: ${fmt(inputs.propertyTax)}`);
    if (inputs.insurance > 0) lines.push(`Homeowner's Insurance: ${fmt(inputs.insurance)}`);
    if (inputs.hoaFees > 0) lines.push(`HOA Fees: ${fmt(inputs.hoaFees)}`);
    lines.push(
      ``,
      `TOTAL MONTHLY PAYMENT: ${fmt(calc.totalMonthly)}`,
      `Total Interest Over Life of Loan: ${fmt(calc.totalInterest)}`,
      ``,
      `---`,
      `This estimate was generated at RealityCents.com`,
      `To get pre-approved or discuss your options, contact:`,
      `Jay Miller — NMLS #657301`,
      `CMG Home Loans — Branch NMLS #2475890`,
      `Phone: (808) 429-0811`,
      `Email: jaym@cmghomeloans.com`,
      `Website: www.realitycents.com`,
    );
    const body = encodeURIComponent(lines.join("\n"));
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }, [inputs, calc]);

  const createShortUrlMutation = trpc.shortUrl.create.useMutation();
  const handleShare = useCallback(async () => {
    const encoded = encodeInputsToURL(inputs);
    try {
      const result = await createShortUrlMutation.mutateAsync({ data: `adv:${encoded}` });
      const url = `${window.location.origin}/s/${result.code}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch {
      // Fallback to long URL if short URL creation fails
      const url = `${window.location.origin}${window.location.pathname}?${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }, [inputs, createShortUrlMutation]);

  const lowerPayment = compareMode ? (calc.totalMonthly <= calc2.totalMonthly ? 1 : 2) : 0;

  return (
    <Layout>
      <SEO
        title="Advanced Mortgage Calculator — Conventional, VA, FHA & Jumbo | Hawaii"
        description="Compare Conventional, VA, FHA, and Jumbo loan payments with our advanced Hawaii mortgage calculator. Includes PMI lookup tables, VA funding fee calculations, FHA MIP rates, and full amortization schedules."
        url="/advanced-calculator"
        keywords="advanced mortgage calculator Hawaii, VA loan calculator, FHA loan calculator Hawaii, jumbo loan calculator, PMI calculator, VA funding fee calculator, Hawaii mortgage payment"
      />
      <PageHero
        title="Advanced Mortgage Calculator"
        subtitle="Compare Conventional, VA, FHA, and Jumbo loan payments with real PMI rates, VA funding fees, and FHA mortgage insurance."
        image={IMAGES.heroCalculator}
        compact
        className="no-print"
      />

      <section className="py-16 lg:py-24 no-print-page">
        <div className="container">
          {/* Toolbar: Compare + Share */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-semibold transition-all ${
                compareMode ? "bg-teal text-white shadow-md shadow-teal/20" : "bg-card border border-border text-navy hover:border-teal/40"
              }`}
            >
              <GitCompareArrows className="w-4 h-4" />
              {compareMode ? "Exit Comparison" : "Compare Loan Types"}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-semibold bg-card border border-border text-navy hover:border-gold/40 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-teal" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Link Copied!" : "Share Results"}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-semibold bg-card border border-border text-navy hover:border-teal/40 transition-all disabled:opacity-60"
            >
              <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleEmailShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-semibold bg-card border border-border text-navy hover:border-gold/40 transition-all"
            >
              <Mail className="w-4 h-4" />
              Share via Email
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-semibold bg-card border border-border text-navy hover:border-teal/40 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* ─── COMPARISON MODE ─────────────────────────────────────── */}
          {compareMode ? (
            <div>
              {/* Two input panels side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <LoanInputPanel inputs={inputs} onChange={setInputs} label="Scenario A" />
                <LoanInputPanel inputs={inputs2} onChange={setInputs2} label="Scenario B" />
              </div>

              {/* Comparison Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  {lowerPayment === 1 && (
                    <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-lg px-3 py-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-teal" />
                      <span className="text-sm font-body font-semibold text-teal">Lower Payment — saves {fmt(calc2.totalMonthly - calc.totalMonthly)}/mo</span>
                    </div>
                  )}
                  <ResultCard calc={calc} inputs={inputs} highlight={lowerPayment === 1} />
                </div>
                <div>
                  {lowerPayment === 2 && (
                    <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-lg px-3 py-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-teal" />
                      <span className="text-sm font-body font-semibold text-teal">Lower Payment — saves {fmt(calc.totalMonthly - calc2.totalMonthly)}/mo</span>
                    </div>
                  )}
                  <ResultCard calc={calc2} inputs={inputs2} highlight={lowerPayment === 2} />
                </div>
              </div>

              {/* Side-by-side comparison table */}
              <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <h3 className="font-display text-xl text-navy mb-4">Side-by-Side Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 pr-4 font-body font-semibold text-navy">Line Item</th>
                        <th className={`text-right py-3 px-4 font-body font-semibold ${lowerPayment === 1 ? "text-teal" : "text-navy"}`}>Scenario A ({loanTypeLabels[inputs.loanType]})</th>
                        <th className={`text-right py-3 pl-4 font-body font-semibold ${lowerPayment === 2 ? "text-teal" : "text-navy"}`}>Scenario B ({loanTypeLabels[inputs2.loanType]})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Principal & Interest", a: calc.monthlyPI, b: calc2.monthlyPI },
                        { label: "PMI", a: calc.monthlyPmi, b: calc2.monthlyPmi },
                        { label: "FHA Monthly MIP", a: calc.monthlyMip, b: calc2.monthlyMip },
                        { label: "Property Tax", a: inputs.propertyTax, b: inputs2.propertyTax },
                        { label: "Insurance", a: inputs.insurance, b: inputs2.insurance },
                        { label: "HOA Fees", a: inputs.hoaFees, b: inputs2.hoaFees },
                      ].filter(row => row.a > 0 || row.b > 0).map((row) => (
                        <tr key={row.label} className="border-b border-border/50">
                          <td className="py-2.5 pr-4 text-muted-foreground">{row.label}</td>
                          <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{fmt(row.a)}</td>
                          <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{fmt(row.b)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border">
                        <td className="py-3 pr-4 font-body font-bold text-navy">Total Monthly Payment</td>
                        <td className={`py-3 px-4 text-right font-body font-bold text-base ${lowerPayment === 1 ? "text-teal" : "text-navy"}`}>{fmt(calc.totalMonthly)}</td>
                        <td className={`py-3 pl-4 text-right font-body font-bold text-base ${lowerPayment === 2 ? "text-teal" : "text-navy"}`}>{fmt(calc2.totalMonthly)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 pr-4 text-muted-foreground">Total Loan Amount</td>
                        <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{fmt(calc.totalLoanAmount)}</td>
                        <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{fmt(calc2.totalLoanAmount)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 pr-4 text-muted-foreground">Total Interest ({inputs.loanTerm}yr)</td>
                        <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{fmt(calc.totalInterest)}</td>
                        <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{fmt(calc2.totalInterest)}</td>
                      </tr>
                      {(calc.vaFundingFee > 0 || calc2.vaFundingFee > 0) && (
                        <tr className="border-b border-border/50">
                          <td className="py-2.5 pr-4 text-muted-foreground">VA Funding Fee</td>
                          <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{calc.vaFundingFee > 0 ? fmt(calc.vaFundingFee) : "—"}</td>
                          <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{calc2.vaFundingFee > 0 ? fmt(calc2.vaFundingFee) : "—"}</td>
                        </tr>
                      )}
                      {(calc.fhaUfmip > 0 || calc2.fhaUfmip > 0) && (
                        <tr className="border-b border-border/50">
                          <td className="py-2.5 pr-4 text-muted-foreground">FHA UFMIP</td>
                          <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{calc.fhaUfmip > 0 ? fmt(calc.fhaUfmip) : "—"}</td>
                          <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{calc2.fhaUfmip > 0 ? fmt(calc2.fhaUfmip) : "—"}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {lowerPayment > 0 && (
                  <div className="mt-4 flex items-center gap-2 bg-teal/5 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-teal shrink-0" />
                    <p className="text-sm text-navy">
                      <span className="font-body font-semibold">Scenario {lowerPayment === 1 ? "A" : "B"} ({loanTypeLabels[lowerPayment === 1 ? inputs.loanType : inputs2.loanType]})</span> saves{" "}
                      <span className="font-body font-bold text-teal">{fmt(Math.abs(calc.totalMonthly - calc2.totalMonthly))}/mo</span>{" "}
                      ({fmt(Math.abs(calc.totalMonthly - calc2.totalMonthly) * (lowerPayment === 1 ? inputs.loanTerm : inputs2.loanTerm) * 12)} over the life of the loan).
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ─── SINGLE CALCULATOR MODE ──────────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Inputs Panel */}
              <div className="lg:col-span-2">
                <div className="sticky top-28">
                  <LoanInputPanel inputs={inputs} onChange={setInputs} label="Loan Details" />
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-3">
                {(exceedsConformingLimit || exceedsFhaLimit) && (
                  <div className="flex items-start gap-2 bg-gold/10 border border-gold/30 rounded-lg p-3 mb-4">
                    <AlertTriangle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <p className="text-xs text-navy">
                      {exceedsConformingLimit
                        ? `Your loan amount (${fmt(baseLoanAmount)}) exceeds the Honolulu County conforming limit of ${fmt(CONFORMING_LIMIT)}. Consider a Jumbo loan instead.`
                        : `Your loan amount (${fmt(baseLoanAmount)}) exceeds the FHA loan limit for Honolulu County (${fmt(CONFORMING_LIMIT)}).`}
                    </p>
                  </div>
                )}

                <ResultCard calc={calc} inputs={inputs} />

                {/* Amortization Schedule */}
                <div className="bg-card rounded-xl border border-border overflow-hidden mt-6 mb-6">
                  <button onClick={() => setShowAmortization(!showAmortization)} className="w-full flex items-center justify-between p-6 hover:bg-sand/50 transition-colors">
                    <h3 className="font-display text-xl text-navy">Amortization Schedule</h3>
                    {showAmortization ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
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
                            {calc.amortization.filter((row) => row.month % 12 === 0).map((row) => {
                              const yearStart = row.month - 11;
                              const yearRows = calc.amortization.slice(yearStart - 1, row.month);
                              const yearPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
                              const yearInterest = yearRows.reduce((s, r) => s + r.interest, 0);
                              const yearPayment = yearRows.reduce((s, r) => s + r.payment, 0);
                              return (
                                <tr key={row.month} className="border-b border-border/50 hover:bg-sand/30 transition-colors">
                                  <td className="py-2.5 pr-4 text-navy font-body font-medium">Year {row.month / 12}</td>
                                  <td className="py-2.5 px-4 text-right text-muted-foreground">{fmtExact(yearPayment)}</td>
                                  <td className="py-2.5 px-4 text-right text-teal font-body font-medium">{fmtExact(yearPrincipal)}</td>
                                  <td className="py-2.5 px-4 text-right text-muted-foreground">{fmtExact(yearInterest)}</td>
                                  <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{fmt(row.balance)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── Extra Payments Section ─────────────────────────────── */}
                <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
                  <button onClick={() => setShowExtraPayments(!showExtraPayments)} className="w-full flex items-center justify-between p-6 hover:bg-sand/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-gold" />
                      <h3 className="font-display text-xl text-navy">Extra Payments</h3>
                    </div>
                    {showExtraPayments ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  {showExtraPayments && (
                    <div className="px-6 pb-6">
                      <p className="text-sm text-muted-foreground mb-4">See how additional payments can shorten your loan and save on interest.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <InputField label="Extra Monthly Payment" value={extraMonthly} onChange={setExtraMonthly} prefix="$" suffix="/mo" step={50} min={0} helpText="Additional amount added to each monthly payment" />
                        <InputField label="Extra Annual Payment" value={extraAnnual} onChange={setExtraAnnual} prefix="$" suffix="/yr" step={500} min={0} helpText="Lump sum applied once per year (e.g., bonus or tax refund)" />
                      </div>

                      {accelAmort && (
                        <>
                          {/* Savings Summary Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-teal/5 border border-teal/20 rounded-lg p-4 text-center">
                              <Clock className="w-5 h-5 text-teal mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground mb-1">Time Saved</p>
                              <p className="font-display text-2xl text-teal">{Math.floor(accelAmort.monthsSaved / 12)}y {accelAmort.monthsSaved % 12}m</p>
                              <p className="text-xs text-muted-foreground mt-1">Payoff in {Math.floor(accelAmort.payoffMonths / 12)}y {accelAmort.payoffMonths % 12}m vs {inputs.loanTerm}y</p>
                            </div>
                            <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 text-center">
                              <DollarSign className="w-5 h-5 text-gold mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground mb-1">Interest Saved</p>
                              <p className="font-display text-2xl text-gold">{fmt(accelAmort.interestSaved)}</p>
                              <p className="text-xs text-muted-foreground mt-1">Total interest: {fmt(accelAmort.totalInterest)}</p>
                            </div>
                            <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 text-center">
                              <Percent className="w-5 h-5 text-navy mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground mb-1">Interest Reduction</p>
                              <p className="font-display text-2xl text-navy">{calc.totalInterest > 0 ? fmtPct((accelAmort.interestSaved / calc.totalInterest) * 100, 1) : "0%"}</p>
                              <p className="text-xs text-muted-foreground mt-1">vs standard {inputs.loanTerm}-year schedule</p>
                            </div>
                          </div>

                          {/* Comparison Table */}
                          <div className="bg-sand/30 rounded-lg p-4 mb-6">
                            <h4 className="font-body font-semibold text-navy text-sm mb-3">Standard vs. Accelerated Payoff</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 font-body font-semibold text-navy"></th>
                                    <th className="text-right py-2 px-4 font-body font-semibold text-navy">Standard</th>
                                    <th className="text-right py-2 px-4 font-body font-semibold text-teal">With Extra Payments</th>
                                    <th className="text-right py-2 pl-4 font-body font-semibold text-gold">Savings</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-border/50">
                                    <td className="py-2.5 pr-4 text-muted-foreground">Payoff Time</td>
                                    <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{inputs.loanTerm} years</td>
                                    <td className="py-2.5 px-4 text-right text-teal font-body font-medium">{Math.floor(accelAmort.payoffMonths / 12)}y {accelAmort.payoffMonths % 12}m</td>
                                    <td className="py-2.5 pl-4 text-right text-gold font-body font-bold">{Math.floor(accelAmort.monthsSaved / 12)}y {accelAmort.monthsSaved % 12}m sooner</td>
                                  </tr>
                                  <tr className="border-b border-border/50">
                                    <td className="py-2.5 pr-4 text-muted-foreground">Total Interest</td>
                                    <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{fmt(calc.totalInterest)}</td>
                                    <td className="py-2.5 px-4 text-right text-teal font-body font-medium">{fmt(accelAmort.totalInterest)}</td>
                                    <td className="py-2.5 pl-4 text-right text-gold font-body font-bold">{fmt(accelAmort.interestSaved)}</td>
                                  </tr>
                                  <tr className="border-b border-border/50">
                                    <td className="py-2.5 pr-4 text-muted-foreground">Total Payments</td>
                                    <td className="py-2.5 px-4 text-right text-navy font-body font-medium">{inputs.loanTerm * 12}</td>
                                    <td className="py-2.5 px-4 text-right text-teal font-body font-medium">{accelAmort.payoffMonths}</td>
                                    <td className="py-2.5 pl-4 text-right text-gold font-body font-bold">{accelAmort.monthsSaved} fewer</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Accelerated Amortization Schedule */}
                          <div>
                            <h4 className="font-body font-semibold text-navy text-sm mb-3">Accelerated Amortization Schedule</h4>
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-card">
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 font-body font-semibold text-navy">Year</th>
                                    <th className="text-right py-2 px-4 font-body font-semibold text-navy">Payment</th>
                                    <th className="text-right py-2 px-4 font-body font-semibold text-navy">Principal</th>
                                    <th className="text-right py-2 px-4 font-body font-semibold text-navy">Interest</th>
                                    <th className="text-right py-2 pl-4 font-body font-semibold text-navy">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {accelAmort.rows.filter((row) => row.month % 12 === 0 || row.month === accelAmort.payoffMonths).map((row) => {
                                    const isLastRow = row.month === accelAmort.payoffMonths;
                                    const yearNum = Math.ceil(row.month / 12);
                                    const yearStart = (yearNum - 1) * 12;
                                    const yearRows = accelAmort.rows.slice(yearStart, Math.min(yearNum * 12, accelAmort.rows.length));
                                    const yearPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
                                    const yearInterest = yearRows.reduce((s, r) => s + r.interest, 0);
                                    const yearPayment = yearRows.reduce((s, r) => s + r.payment, 0);
                                    return (
                                      <tr key={row.month} className={`border-b border-border/50 hover:bg-sand/30 transition-colors ${isLastRow ? "bg-teal/5 font-bold" : ""}`}>
                                        <td className="py-2.5 pr-4 text-navy font-body font-medium">{isLastRow && row.month % 12 !== 0 ? `Month ${row.month}` : `Year ${yearNum}`}</td>
                                        <td className="py-2.5 px-4 text-right text-muted-foreground">{fmtExact(yearPayment)}</td>
                                        <td className="py-2.5 px-4 text-right text-teal font-body font-medium">{fmtExact(yearPrincipal)}</td>
                                        <td className="py-2.5 px-4 text-right text-muted-foreground">{fmtExact(yearInterest)}</td>
                                        <td className="py-2.5 pl-4 text-right text-navy font-body font-medium">{fmt(row.balance)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}

                      {!accelAmort && (extraMonthly <= 0 && extraAnnual <= 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Enter an extra monthly or annual payment above to see how much time and interest you could save.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PMI Rate Reference Table (Conventional only) */}
                {inputs.loanType === "conventional" && (
                  <div className="bg-card rounded-xl border border-border p-6 lg:p-8 mb-6">
                    <h3 className="font-display text-xl text-navy mb-2">PMI Rate Reference</h3>
                    <p className="text-xs text-muted-foreground mb-4">Best available annual rates across MGIC, Radian &amp; Arch MI. Your selection is highlighted.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-2 font-body font-semibold text-navy">LTV</th>
                            {PMI_FICO_TIERS.map((fico, idx) => (
                              <th key={fico} className="text-center py-2 px-1 font-body font-semibold text-navy whitespace-nowrap">
                                {idx === 0 ? `${fico}+` : idx === PMI_FICO_TIERS.length - 1 ? `${fico}–639` : `${fico}–${PMI_FICO_TIERS[idx - 1] - 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {PMI_LTV_TIERS.map((tier, rowIdx) => {
                            const isLtvMatch = ltv > tier.min && ltv <= tier.max;
                            return (
                              <tr key={tier.label} className={`border-b border-border/50 ${isLtvMatch ? "bg-teal/5" : ""}`}>
                                <td className="py-2 pr-2 font-body font-medium text-navy whitespace-nowrap">{tier.label}</td>
                                {PMI_RATES[rowIdx].map((rate, colIdx) => {
                                  const ficoThreshold = PMI_FICO_TIERS[colIdx];
                                  const isFicoMatch = colIdx === 0 ? inputs.ficoScore >= 760 : colIdx === PMI_FICO_TIERS.length - 1 ? inputs.ficoScore < 640 : inputs.ficoScore >= ficoThreshold && inputs.ficoScore < PMI_FICO_TIERS[colIdx - 1];
                                  const isActive = isLtvMatch && isFicoMatch;
                                  return (
                                    <td key={colIdx} className={`py-2 px-1 text-center font-body ${isActive ? "bg-teal text-white font-bold rounded" : "text-muted-foreground"}`}>
                                      {fmtPct(rate * 100)}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {ltv <= 80 && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-teal"><CheckCircle className="w-3.5 h-3.5" /><span>No PMI required — your LTV is {fmtPct(ltv, 1)} (≤ 80%)</span></div>
                    )}
                  </div>
                )}

                {/* VA Funding Fee Reference */}
                {inputs.loanType === "va" && (
                  <div className="bg-card rounded-xl border border-border p-6 lg:p-8 mb-6">
                    <h3 className="font-display text-xl text-navy mb-2">VA Funding Fee Reference</h3>
                    <p className="text-xs text-muted-foreground mb-4">Funding fee rates by down payment and benefit usage. Waived for veterans with 10%+ disability.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 font-body font-semibold text-navy">Down Payment</th>
                            <th className="text-center py-2 px-4 font-body font-semibold text-navy">First Use</th>
                            <th className="text-center py-2 pl-4 font-body font-semibold text-navy">Subsequent Use</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: "Less than 5%", first: "2.15%", sub: "3.30%", match: dpPercent < 5 },
                            { label: "5% to < 10%", first: "1.50%", sub: "1.50%", match: dpPercent >= 5 && dpPercent < 10 },
                            { label: "10% or more", first: "1.25%", sub: "1.25%", match: dpPercent >= 10 },
                          ].map((row) => (
                            <tr key={row.label} className={`border-b border-border/50 ${row.match ? "bg-teal/5" : ""}`}>
                              <td className="py-2 pr-4 font-body font-medium text-navy">{row.label}</td>
                              <td className={`py-2 px-4 text-center ${row.match && inputs.vaFirstUse ? "bg-teal text-white font-bold rounded" : "text-muted-foreground"}`}>{row.first}</td>
                              <td className={`py-2 pl-4 text-center ${row.match && !inputs.vaFirstUse ? "bg-teal text-white font-bold rounded" : "text-muted-foreground"}`}>{row.sub}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {inputs.vaDisability && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-teal"><CheckCircle className="w-3.5 h-3.5" /><span>Funding fee waived — 10%+ VA disability rating</span></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── PRINT-ONLY SUMMARY (hidden on screen, shown when printing) ─── */}
          <div className="print-only hidden" id="print-summary-content">
            <div className="print-summary">

              {/* ── Header ── */}
              <div className="print-header">
                <div>
                  <div className="print-logo-text">RealityCents</div>
                  <div className="print-logo-tagline">Hawaii Mortgage Education &amp; Lending</div>
                </div>
                <div className="print-meta">
                  <div className="print-meta-name">Jay Miller — NMLS #657301</div>
                  <div>CMG Home Loans — Branch NMLS #2475890</div>
                  <div>(808) 429-0811 · jaym@cmghomeloans.com</div>
                  <div>www.realitycents.com</div>
                  <div className="print-meta-date">Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
              </div>

              {/* ── Total Payment Highlight Banner ── */}
              <div className="print-highlight print-section">
                <div className="print-highlight-left">
                  <div className="print-badge">{loanTypeLabels[inputs.loanType]} Loan</div>
                  <div className="big-label">Estimated Total Monthly Payment</div>
                  <div className="big-number">{fmt(calc.totalMonthly)}</div>
                  <div className="print-highlight-sub">Principal &amp; Interest: {fmt(calc.monthlyPI)} · Rate: {fmtPct(inputs.interestRate, 3)} · {inputs.loanTerm}-Year Fixed</div>
                </div>
                <div style={{ textAlign: "right", fontSize: "8.5pt", color: "#6b7280", fontFamily: "Arial, sans-serif" }}>
                  <div style={{ fontWeight: 600, color: "#0C2340", fontSize: "9.5pt" }}>Loan Amount</div>
                  <div style={{ fontSize: "14pt", fontWeight: 700, color: "#1A7A7A", fontFamily: "Georgia, serif" }}>{fmt(calc.totalLoanAmount)}</div>
                  <div style={{ marginTop: "6pt", fontWeight: 600, color: "#0C2340", fontSize: "9.5pt" }}>Purchase Price</div>
                  <div style={{ fontSize: "11pt", fontWeight: 600, color: "#374151", fontFamily: "Georgia, serif" }}>{fmt(inputs.homePrice)}</div>
                </div>
              </div>

              {/* ── Loan Summary ── */}
              <div className="print-section">
                <h2>Loan Summary</h2>
                <div className="print-grid">
                  <div>
                    <div className="print-row"><span className="label">Home Purchase Price</span><span className="value">{fmt(inputs.homePrice)}</span></div>
                    <div className="print-row"><span className="label">Down Payment</span><span className="value">{fmt(calc.dpDollar)} ({fmtPct(calc.dpPercent, 1)})</span></div>
                    <div className="print-row"><span className="label">Base Loan Amount</span><span className="value">{fmt(calc.baseLoanAmount)}</span></div>
                    {calc.vaFundingFee > 0 && <div className="print-row"><span className="label">VA Funding Fee (financed)</span><span className="value">{fmt(calc.vaFundingFee)}</span></div>}
                    {calc.fhaUfmip > 0 && <div className="print-row"><span className="label">FHA UFMIP (financed)</span><span className="value">{fmt(calc.fhaUfmip)}</span></div>}
                    <div className="print-row"><span className="label">Total Loan Amount</span><span className="value">{fmt(calc.totalLoanAmount)}</span></div>
                  </div>
                  <div>
                    <div className="print-row"><span className="label">Interest Rate</span><span className="value">{fmtPct(inputs.interestRate, 3)}</span></div>
                    <div className="print-row"><span className="label">Loan Term</span><span className="value">{inputs.loanTerm} Years Fixed</span></div>
                    <div className="print-row"><span className="label">Loan Type</span><span className="value">{loanTypeLabels[inputs.loanType]}</span></div>
                    <div className="print-row"><span className="label">LTV Ratio</span><span className="value">{fmtPct(calc.ltv, 1)}</span></div>
                    {(inputs.loanType === "conventional" || inputs.loanType === "fha") && <div className="print-row"><span className="label">FICO Score</span><span className="value">{inputs.ficoScore}</span></div>}
                    <div className="print-row"><span className="label">Total Interest Paid</span><span className="value">{fmt(calc.totalInterest)}</span></div>
                  </div>
                </div>
              </div>

              {/* ── Monthly Payment Breakdown ── */}
              <div className="print-section">
                <h2>Monthly Payment Breakdown</h2>
                <div className="print-row"><span className="label">Principal &amp; Interest</span><span className="value">{fmt(calc.monthlyPI)}</span></div>
                {calc.monthlyPmi > 0 && <div className="print-row"><span className="label">PMI (Best available rate: {fmtPct(calc.pmiAnnualRate * 100)} annual)</span><span className="value">{fmt(calc.monthlyPmi)}</span></div>}
                {calc.monthlyMip > 0 && <div className="print-row"><span className="label">FHA Monthly MIP</span><span className="value">{fmt(calc.monthlyMip)}</span></div>}
                {inputs.propertyTax > 0 && <div className="print-row"><span className="label">Property Tax (est.)</span><span className="value">{fmt(inputs.propertyTax)}</span></div>}
                {inputs.insurance > 0 && <div className="print-row"><span className="label">Homeowner's Insurance (est.)</span><span className="value">{fmt(inputs.insurance)}</span></div>}
                {inputs.hoaFees > 0 && <div className="print-row"><span className="label">HOA Fees</span><span className="value">{fmt(inputs.hoaFees)}</span></div>}
                <div className="print-row total"><span className="label">Total Monthly Payment</span><span className="value">{fmt(calc.totalMonthly)}</span></div>
              </div>

              {/* ── Loan-Specific Notes ── */}
              {inputs.loanType === "va" && (
                <div className="print-section">
                  <div className="print-notes-box" style={{ background: "#f0fafa", border: "1pt solid #1A7A7A" }}>
                    <div className="print-notes-title">VA Loan Notes</div>
                    <div className="print-notes-body">
                      {calc.vaFundingFeeWaived
                        ? "VA Funding Fee waived — borrower has a 10%+ service-connected disability rating."
                        : `VA Funding Fee: ${fmt(calc.vaFundingFee)} (${fmtPct(calc.vaFundingFeeRate * 100)} of base loan) — financed into the loan. Usage: ${inputs.vaFirstUse ? "First Use" : "Subsequent Use"}. No monthly mortgage insurance required.`
                      }
                    </div>
                  </div>
                </div>
              )}
              {inputs.loanType === "conventional" && calc.monthlyPmi > 0 && (
                <div className="print-section">
                  <div className="print-notes-box" style={{ background: "#fffbf0", border: "1pt solid #C4956A" }}>
                    <div className="print-notes-title">PMI Notes</div>
                    <div className="print-notes-body">
                      PMI rate of {fmtPct(calc.pmiAnnualRate * 100)} per year ({fmt(calc.monthlyPmi)}/mo) is sourced from the best available rate across MGIC, Radian, and Arch MI for FICO {inputs.ficoScore} at {fmtPct(calc.ltv, 1)} LTV. Annual PMI cost: {fmt(calc.monthlyPmi * 12)}. PMI can be removed once equity reaches 20% (80% LTV).
                    </div>
                  </div>
                </div>
              )}
              {inputs.loanType === "fha" && (
                <div className="print-section">
                  <div className="print-notes-box" style={{ background: "#f0fafa", border: "1pt solid #1A7A7A" }}>
                    <div className="print-notes-title">FHA Loan Notes</div>
                    <div className="print-notes-body">
                      FHA Upfront MIP (UFMIP) of {fmt(calc.fhaUfmip)} (1.75% of base loan) is financed into the total loan amount. Annual MIP of {fmt(calc.monthlyMip * 12)} ({fmt(calc.monthlyMip)}/mo) applies for the life of the loan when LTV exceeds 90% at origination.
                    </div>
                  </div>
                </div>
              )}
              {inputs.loanType === "jumbo" && (
                <div className="print-section">
                  <div className="print-notes-box" style={{ background: "#f8f9fa", border: "1pt solid #d1d5db" }}>
                    <div className="print-notes-title">Jumbo Loan Notes</div>
                    <div className="print-notes-body">
                      This loan exceeds the 2026 Honolulu County conforming limit of $1,249,125 and is classified as a jumbo loan. Jumbo loans typically require stronger credit, larger reserves, and may carry slightly higher rates. Contact Jay Miller for current jumbo pricing.
                    </div>
                  </div>
                </div>
              )}

              {/* ── Disclaimer ── */}
              <div className="print-note">
                This estimate is for informational purposes only and does not constitute a loan commitment, pre-approval, or guarantee of financing. Actual interest rates, fees, and payment amounts may vary based on credit profile, property type, occupancy status, market conditions, and other underwriting factors. Property taxes and insurance are estimates only. Contact Jay Miller, NMLS #657301, for a personalized rate quote and pre-approval. CMG Mortgage, Inc. dba CMG Home Loans — NMLS #1820. Licensed in Hawaii. Equal Housing Opportunity. www.realitycents.com
              </div>

            </div>
          </div>

          {/* Buydown Calculator Link */}
          <div className="bg-gold/5 border border-gold/25 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 no-print">
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
              to={`/buydown-calculator?loan=${calc.baseLoanAmount}&rate=${inputs.interestRate}&term=${inputs.loanTerm}`}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-md text-sm font-body font-semibold transition-all shrink-0 hover:shadow-md"
            >
              See Buydown Savings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CTA — always visible */}
          <ContactActions
            variant="compact"
            kicker="Ready to Move Forward?"
            headline="Get Pre-Approved Today"
            subtext="Lock in your rate with Jay Miller — takes just minutes."
            hideEmail
            className="mt-4 no-print"
          />
        </div>
      </section>
    </Layout>
  );
}
