/*
 * Pacific Modernism — Loan Comparison Calculator
 * Side-by-side loan scenario comparison with shareable links and print layout
 * Matches existing RealityCents dark theme with teal/gold accents
 */
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import EmailResults from "@/components/EmailResults";
import {
  type ScenarioInput,
  type ScenarioResult,
  type LoanType,
  type ArmFixedYears,
  type ArmAnalysis,
  defaultScenario,
  calculateScenario,
  buildEquityAnalysis,
  monthlyPI,
  defaultArmMargin,
  defaultArmCaps,
  ARM_HISTORICAL_INDEX,
  HAWAII_TAX_RATES,
} from "@/lib/loanMath";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import {
  ArrowRight,
  Copy,
  Check,
  Link2,
  ChevronDown,
  ChevronUp,
  Printer,
  Plus,
  X,
  Trophy,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calculator,
  Info,
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

function fmtExact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function pct(n: number): string {
  return n.toFixed(3) + "%";
}

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  va: "VA Loan",
  fha: "FHA Loan",
  conventional: "Conventional",
};

const TERM_OPTIONS = [15, 20, 25, 30];

const COUNTY_OPTIONS = Object.entries(HAWAII_TAX_RATES).map(([name, rate]) => ({
  label: `${name} (${rate}%)`,
  value: rate,
}));

// ─── String state for each scenario ──────────────────────────────────────────

interface ScenarioStrings {
  label: string;
  loanType: LoanType;
  purchasePrice: string;
  downPaymentPct: string;
  rate: string;
  termYears: number;
  discountPoints: string;
  lenderCredits: string;
  propertyTaxRate: string;
  propertyTaxOverride: string;
  insurance: string;
  hoa: string;
  hoaTransferFee: string;
  vaFirstUse: boolean;
  vaDisabled: boolean;
  originationFee: string;
  appraisalFee: string;
  titleInsurance: string;
  escrowFee: string;
  recordingFees: string;
  creditReport: string;
  floodCert: string;
  closingDay: string;
  buydownType: "none" | "1-1" | "2-1" | "3-2-1";
  sellerCredit: string;
  propertyAddress: string;
  // Investment property fields
  isInvestment: boolean;
  docType: "full-doc" | "dscr";
  prepayPenaltyYears: number; // 1-5
  expectedRent: string;
  annualRentIncrease: string; // default "3"
  // ARM fields
  isARM: boolean;
  armFixedYears: ArmFixedYears;
  armMargin: string;         // "" = use loan-type default
  armInitialCap: string;
  armPeriodicCap: string;
  armLifetimeCap: string;
  armAdjustmentFrequency: 6 | 12;
}

function toStrings(s: ScenarioInput): ScenarioStrings {
  return {
    label: s.label,
    loanType: s.loanType,
    purchasePrice: String(s.purchasePrice),
    downPaymentPct: String(s.downPaymentPct),
    rate: String(s.rate),
    termYears: s.termYears,
    discountPoints: String(s.discountPoints),
    lenderCredits: String(s.lenderCredits),
    propertyTaxRate: String(s.propertyTaxRate),
    propertyTaxOverride: String(s.propertyTaxOverride),
    insurance: String(s.insurance),
    hoa: String(s.hoa),
    hoaTransferFee: String(s.hoaTransferFee),
    vaFirstUse: s.vaFirstUse,
    vaDisabled: s.vaDisabled,
    originationFee: String(s.originationFee),
    appraisalFee: String(s.appraisalFee),
    titleInsurance: String(s.titleInsurance),
    escrowFee: String(s.escrowFee),
    recordingFees: String(s.recordingFees),
    creditReport: String(s.creditReport),
    floodCert: String(s.floodCert),
    closingDay: String(s.closingDay),
    buydownType: s.buydownType,
    sellerCredit: String(s.sellerCredit),
    propertyAddress: s.propertyAddress,
    // Investment defaults
    isInvestment: false,
    docType: "full-doc",
    prepayPenaltyYears: 3,
    expectedRent: "",
    annualRentIncrease: "3",
    // ARM defaults
    isARM: s.isARM || false,
    armFixedYears: s.armFixedYears || 5,
    armMargin: "",
    armInitialCap: "",
    armPeriodicCap: "",
    armLifetimeCap: "",
    armAdjustmentFrequency: s.armAdjustmentFrequency || defaultArmCaps(s.loanType).adjustmentFrequency,
  };
}

// Resolve effective ARM parameters (string overrides fall back to loan-type defaults)
function effectiveArmParams(s: ScenarioStrings) {
  const caps = defaultArmCaps(s.loanType);
  const margin = s.armMargin !== "" && num(s.armMargin) > 0 ? num(s.armMargin) : defaultArmMargin(s.loanType);
  const initialCap = s.armInitialCap !== "" && num(s.armInitialCap) > 0 ? num(s.armInitialCap) : caps.initialCap;
  const periodicCap = s.armPeriodicCap !== "" && num(s.armPeriodicCap) > 0 ? num(s.armPeriodicCap) : caps.periodicCap;
  const lifetimeCap = s.armLifetimeCap !== "" && num(s.armLifetimeCap) > 0 ? num(s.armLifetimeCap) : caps.lifetimeCap;
  const adjustmentFrequency = s.loanType === "va" ? 12 : 6;
  return { margin, initialCap, periodicCap, lifetimeCap, adjustmentFrequency: adjustmentFrequency as 6 | 12 };
}

function toInput(s: ScenarioStrings): ScenarioInput {
  return {
    label: s.label,
    loanType: s.loanType,
    purchasePrice: num(s.purchasePrice),
    downPaymentPct: num(s.downPaymentPct),
    rate: num(s.rate),
    termYears: s.termYears,
    discountPoints: num(s.discountPoints),
    lenderCredits: num(s.lenderCredits),
    propertyTaxRate: num(s.propertyTaxRate),
    propertyTaxOverride: num(s.propertyTaxOverride),
    insurance: num(s.insurance),
    hoa: num(s.hoa),
    hoaTransferFee: num(s.hoa) > 0 && num(s.hoaTransferFee) === 0 ? 350 : num(s.hoaTransferFee),
    vaFirstUse: s.vaFirstUse,
    vaDisabled: s.vaDisabled,
    originationFee: num(s.originationFee),
    appraisalFee: num(s.appraisalFee),
    titleInsurance: num(s.titleInsurance),
    escrowFee: num(s.escrowFee),
    recordingFees: num(s.recordingFees),
    creditReport: num(s.creditReport),
    floodCert: num(s.floodCert),
    closingDay: num(s.closingDay),
    buydownType: s.buydownType || "none",
    sellerCredit: num(s.sellerCredit),
    propertyAddress: s.propertyAddress || "",
    // ARM
    isARM: s.isARM === true,
    armFixedYears: s.armFixedYears || 5,
    armMargin: effectiveArmParams(s).margin,
    armInitialCap: effectiveArmParams(s).initialCap,
    armPeriodicCap: effectiveArmParams(s).periodicCap,
    armLifetimeCap: effectiveArmParams(s).lifetimeCap,
    armAdjustmentFrequency: effectiveArmParams(s).adjustmentFrequency,
  };
}

// Serialize for URL — compact format: only non-default values are stored
const SCENARIO_DEFAULTS: Record<string, unknown> = {
  purchasePrice: "750000", downPaymentPct: "0", rate: "5.75", termYears: 30,
  discountPoints: "0", lenderCredits: "0", propertyTaxRate: "0.35",
  propertyTaxOverride: "0", insurance: "200", hoa: "0", hoaTransferFee: "0",
  vaFirstUse: true, vaDisabled: false, originationFee: "1495", appraisalFee: "800",
  titleInsurance: "1750", escrowFee: "1250", recordingFees: "250",
  creditReport: "75", floodCert: "20", closingDay: "15",
  buydownType: "none", sellerCredit: "0", propertyAddress: "",
};

function serializeScenarios(scenarios: ScenarioStrings[], yearsInHome: number): string {
  // Build compact objects with only non-default values
  const compact = scenarios.map((s) => {
    const obj: Record<string, unknown> = { l: s.label, t: s.loanType };
    if (s.purchasePrice !== SCENARIO_DEFAULTS.purchasePrice) obj.p = s.purchasePrice;
    if (s.downPaymentPct !== SCENARIO_DEFAULTS.downPaymentPct) obj.d = s.downPaymentPct;
    if (s.rate !== SCENARIO_DEFAULTS.rate) obj.r = s.rate;
    if (s.termYears !== SCENARIO_DEFAULTS.termYears) obj.tm = s.termYears;
    if (s.discountPoints !== "0") obj.dp = s.discountPoints;
    if (s.lenderCredits !== "0") obj.lc = s.lenderCredits;
    if (s.propertyTaxRate !== SCENARIO_DEFAULTS.propertyTaxRate) obj.tr = s.propertyTaxRate;
    if (s.propertyTaxOverride !== "0") obj.to = s.propertyTaxOverride;
    if (s.insurance !== SCENARIO_DEFAULTS.insurance) obj.i = s.insurance;
    if (s.hoa !== "0") obj.h = s.hoa;
    if (s.hoaTransferFee !== "0" && s.hoaTransferFee !== "350") obj.ht = s.hoaTransferFee;
    if (!s.vaFirstUse) obj.vf = false;
    if (s.vaDisabled) obj.vd = true;
    if (s.originationFee !== SCENARIO_DEFAULTS.originationFee) obj.of = s.originationFee;
    if (s.appraisalFee !== SCENARIO_DEFAULTS.appraisalFee) obj.af = s.appraisalFee;
    if (s.titleInsurance !== SCENARIO_DEFAULTS.titleInsurance) obj.ti = s.titleInsurance;
    if (s.escrowFee !== SCENARIO_DEFAULTS.escrowFee) obj.ef = s.escrowFee;
    if (s.recordingFees !== SCENARIO_DEFAULTS.recordingFees) obj.rf = s.recordingFees;
    if (s.creditReport !== SCENARIO_DEFAULTS.creditReport) obj.cr = s.creditReport;
    if (s.floodCert !== SCENARIO_DEFAULTS.floodCert) obj.fc = s.floodCert;
    if (s.closingDay !== SCENARIO_DEFAULTS.closingDay) obj.cd = s.closingDay;
    if (s.buydownType !== "none") obj.bt = s.buydownType;
    if (s.sellerCredit !== "0") obj.sc = s.sellerCredit;
    if (s.propertyAddress) obj.a = s.propertyAddress;
    // Investment fields
    if (s.isInvestment) obj.inv = true;
    if (s.isInvestment && s.docType !== "full-doc") obj.dt = s.docType;
    if (s.isInvestment && s.docType === "dscr" && s.prepayPenaltyYears !== 3) obj.ppy = s.prepayPenaltyYears;
    if (s.isInvestment && s.expectedRent) obj.er = s.expectedRent;
    if (s.isInvestment && s.annualRentIncrease !== "3") obj.ari = s.annualRentIncrease;
    // ARM fields
    if (s.isARM) {
      obj.arm = true;
      if (s.armFixedYears !== 5) obj.afy = s.armFixedYears;
      if (s.armMargin !== "") obj.amg = s.armMargin;
      if (s.armInitialCap !== "") obj.aic = s.armInitialCap;
      if (s.armPeriodicCap !== "") obj.apc = s.armPeriodicCap;
      if (s.armLifetimeCap !== "") obj.alc = s.armLifetimeCap;
    }
    return obj;
  });
  const data = { s: compact, y: yearsInHome };
  return compressToEncodedURIComponent(JSON.stringify(data));
}

function deserializeScenarios(encoded: string): { scenarios: ScenarioStrings[]; yearsInHome: number } | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data = JSON.parse(json);
    // Support both old full format and new compact format
    const scenarios: ScenarioStrings[] = data.s.map((obj: Record<string, unknown>) => {
      // Old format has all keys spelled out
      if ("purchasePrice" in obj) return obj as unknown as ScenarioStrings;
      // New compact format
      return {
        label: (obj.l as string) || "Scenario",
        loanType: (obj.t as LoanType) || "va",
        purchasePrice: (obj.p as string) || "750000",
        downPaymentPct: (obj.d as string) || (obj.t === "va" ? "0" : obj.t === "fha" ? "3.5" : "5"),
        rate: (obj.r as string) || "5.75",
        termYears: (obj.tm as number) || 30,
        discountPoints: (obj.dp as string) || "0",
        lenderCredits: (obj.lc as string) || "0",
        propertyTaxRate: (obj.tr as string) || "0.35",
        propertyTaxOverride: (obj.to as string) || "0",
        insurance: (obj.i as string) || "200",
        hoa: (obj.h as string) || "0",
        hoaTransferFee: (obj.ht as string) || "0",
        vaFirstUse: obj.vf !== false,
        vaDisabled: obj.vd === true,
        originationFee: (obj.of as string) || "1495",
        appraisalFee: (obj.af as string) || "800",
        titleInsurance: (obj.ti as string) || "1750",
        escrowFee: (obj.ef as string) || "1250",
        recordingFees: (obj.rf as string) || "250",
        creditReport: (obj.cr as string) || "75",
        floodCert: (obj.fc as string) || "20",
        closingDay: (obj.cd as string) || "15",
        buydownType: (obj.bt as "none" | "1-1" | "2-1" | "3-2-1") || "none",
        sellerCredit: (obj.sc as string) || "0",
        propertyAddress: (obj.a as string) || "",
        // Investment fields
        isInvestment: obj.inv === true,
        docType: (obj.dt as "full-doc" | "dscr") || "full-doc",
        prepayPenaltyYears: (obj.ppy as number) || 3,
        expectedRent: (obj.er as string) || "",
        annualRentIncrease: (obj.ari as string) || "3",
        // ARM fields
        isARM: obj.arm === true,
        armFixedYears: ([3, 5, 7, 10].includes(obj.afy as number) ? (obj.afy as ArmFixedYears) : 5),
        armMargin: (obj.amg as string) || "",
        armInitialCap: (obj.aic as string) || "",
        armPeriodicCap: (obj.apc as string) || "",
        armLifetimeCap: (obj.alc as string) || "",
        armAdjustmentFrequency: ((obj.t as LoanType) === "va" ? 12 : 6) as 6 | 12,
      };
    });
    return { scenarios, yearsInHome: data.y || 5 };
  } catch {
    return null;
  }
}

// ─── Input Field Component ───────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  small,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  small?: boolean;
}) {
  return (
    <div className={small ? "flex-1 min-w-0" : ""}>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden focus-within:border-teal transition">
        {prefix && <span className="pl-3 text-slate-400 text-sm">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
          className="w-full bg-transparent text-white text-sm px-3 py-2 outline-none"
        />
        {suffix && <span className="pr-3 text-slate-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

// ─── Down Payment Tri-Field ────────────────────────────────────────────────────
// Three editable fields: Down Payment %, Down Payment $, Loan Amount
// Editing any one recalculates the other two with no floating-point drift.
// Strategy: always store exact dollar amounts as integers; % is derived display only.

type DPField = "pct" | "dollar" | "loan";

function DownPaymentTriField({
  purchasePrice,
  downPaymentPct,
  onChange,
}: {
  purchasePrice: string;
  downPaymentPct: string;
  onChange: (pct: string) => void;
}) {
  const price = num(purchasePrice);

  // Derive the canonical dollar amount from the stored percentage.
  // We round to nearest dollar to avoid floating-point display noise.
  const derivedDollar = price > 0 ? Math.round((price * num(downPaymentPct)) / 100) : 0;
  const derivedLoan = Math.max(0, price - derivedDollar);

  // Per-field local editing state
  const [activeField, setActiveField] = useState<DPField | null>(null);
  const [localPct, setLocalPct] = useState("");
  const [localDollar, setLocalDollar] = useState("");
  const [localLoan, setLocalLoan] = useState("");

  // Display values: use local while editing that field, derived otherwise
  const displayPct = activeField === "pct" ? localPct : String(num(downPaymentPct));
  const displayDollar = activeField === "dollar" ? localDollar : String(derivedDollar);
  const displayLoan = activeField === "loan" ? localLoan : String(derivedLoan);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  // --- % field handlers ---
  const onPctFocus = () => {
    setActiveField("pct");
    setLocalPct(String(num(downPaymentPct)));
  };
  const onPctBlur = () => {
    setActiveField(null);
    const p = parseFloat(localPct);
    if (isFinite(p)) onChange(String(p));
  };

  // --- $ field handlers ---
  const onDollarFocus = () => {
    setActiveField("dollar");
    setLocalDollar(String(derivedDollar));
  };
  const onDollarBlur = () => {
    setActiveField(null);
    const d = Math.round(parseFloat(localDollar));
    if (isFinite(d) && price > 0) {
      // Derive % from exact dollar — store enough precision so round-trip is lossless
      const newPct = (d / price) * 100;
      onChange(String(newPct));
    }
  };

  // --- Loan Amount field handlers ---
  const onLoanFocus = () => {
    setActiveField("loan");
    setLocalLoan(String(derivedLoan));
  };
  const onLoanBlur = () => {
    setActiveField(null);
    const loan = Math.round(parseFloat(localLoan));
    if (isFinite(loan) && price > 0) {
      const dpDollar = Math.max(0, price - loan);
      const newPct = (dpDollar / price) * 100;
      onChange(String(newPct));
    }
  };

  const inputClass = "w-full bg-transparent text-white text-sm px-3 py-2 outline-none";
  const wrapClass = "flex items-center bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden focus-within:border-teal transition";
  const prefixClass = "pl-3 text-slate-400 text-sm shrink-0";
  const suffixClass = "pr-3 text-slate-400 text-sm shrink-0";

  return (
    <>
      {/* Down Payment % */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-slate-400 mb-1">Down Payment %</label>
        <div className={wrapClass}>
          <input
            type="text"
            inputMode="decimal"
            value={displayPct}
            onFocus={onPctFocus}
            onChange={(e) => setLocalPct(e.target.value)}
            onBlur={onPctBlur}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className={inputClass}
          />
          <span className={suffixClass}>%</span>
        </div>
      </div>

      {/* Down Payment $ */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-slate-400 mb-1">Down Payment $</label>
        <div className={wrapClass}>
          <span className={prefixClass}>$</span>
          <input
            type="text"
            inputMode="decimal"
            value={displayDollar}
            onFocus={onDollarFocus}
            onChange={(e) => setLocalDollar(e.target.value)}
            onBlur={onDollarBlur}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>

      {/* Loan Amount */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-slate-400 mb-1">Loan Amount</label>
        <div className={wrapClass}>
          <span className={prefixClass}>$</span>
          <input
            type="text"
            inputMode="decimal"
            value={displayLoan}
            onFocus={onLoanFocus}
            onChange={(e) => setLocalLoan(e.target.value)}
            onBlur={onLoanBlur}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>
    </>
  );
}

// ─── Scenario Input Panel ────────────────────────────────────────────────────

function ScenarioPanel({
  scenario,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  scenario: ScenarioStrings;
  index: number;
  onChange: (s: ScenarioStrings) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [showClosing, setShowClosing] = useState(false);
  const [showPrepaids, setShowPrepaids] = useState(false);

  const update = (field: keyof ScenarioStrings, value: string | number | boolean) => {
    onChange({ ...scenario, [field]: value } as ScenarioStrings);
  };

  const colors = ["border-teal", "border-gold", "border-rose-400"];
  const bgColors = ["bg-teal/10", "bg-gold/10", "bg-rose-400/10"];
  const labelColors = ["text-teal", "text-gold", "text-rose-400"];

  return (
    <div className={`bg-slate-800/80 border ${colors[index]} rounded-xl p-5 space-y-4`}>
      {/* Header — dynamically reflects current loan type and term */}
      <div className="flex items-center justify-between gap-3">
        <h3 className={`font-bold text-lg ${labelColors[index]}`}>
          {scenario.termYears}-Year {LOAN_TYPE_LABELS[scenario.loanType]}
        </h3>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-500 hover:text-red-400 transition p-1" title="Remove scenario">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Investment Property Checkbox */}
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:border-slate-500 transition">
        <input
          type="checkbox"
          checked={scenario.isInvestment}
          onChange={(e) => {
            const newS = { ...scenario, isInvestment: e.target.checked };
            if (e.target.checked) {
              // Default to conventional with 25% down for investment
              newS.loanType = "conventional";
              newS.downPaymentPct = "25";
            }
            onChange(newS);
          }}
          className="rounded border-slate-600 text-teal focus:ring-teal"
        />
        <span className="font-medium">Investment Property</span>
      </label>

      {/* Loan Type */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Loan Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(["va", "fha", "conventional"] as LoanType[]).map((lt) => (
            <button
              key={lt}
              onClick={() => {
                const newS = { ...scenario, loanType: lt };
                if (scenario.isInvestment) {
                  if (num(scenario.downPaymentPct) < 15) newS.downPaymentPct = "25";
                } else {
                  if (lt === "va") newS.downPaymentPct = "0";
                  else if (lt === "fha") newS.downPaymentPct = "3.5";
                  else if (num(scenario.downPaymentPct) < 3) newS.downPaymentPct = "5";
                }
                onChange(newS);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                scenario.loanType === lt
                  ? `${bgColors[index]} ${labelColors[index]} border ${colors[index]}`
                  : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500"
              }`}
            >
              {LOAN_TYPE_LABELS[lt]}
            </button>
          ))}
        </div>
      </div>

      {/* Document Type (Investment only) */}
      {scenario.isInvestment && (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Document Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(["full-doc", "dscr"] as const).map((dt) => (
              <button
                key={dt}
                onClick={() => onChange({ ...scenario, docType: dt })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  scenario.docType === dt
                    ? `${bgColors[index]} ${labelColors[index]} border ${colors[index]}`
                    : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                }`}
              >
                {dt === "full-doc" ? "Full Doc" : "DSCR"}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {scenario.docType === "full-doc"
              ? "Standard conventional Fannie Mae investment loan"
              : "Non-QM DSCR loan — lighter docs, prepayment penalty applies"}
          </p>
        </div>
      )}

      {/* Core inputs */}
      <InputField label="Purchase Price" value={scenario.purchasePrice} onChange={(v) => update("purchasePrice", v)} prefix="$" />

      <div className="flex gap-2">
        <DownPaymentTriField
          purchasePrice={scenario.purchasePrice}
          downPaymentPct={scenario.downPaymentPct}
          onChange={(pct) => update("downPaymentPct", pct)}
        />
      </div>

      <div className="flex gap-3">
        <InputField label="Interest Rate" value={scenario.rate} onChange={(v) => update("rate", v)} suffix="%" small />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-slate-400 mb-1">Loan Term</label>
          <select
            value={scenario.termYears}
            onChange={(e) => update("termYears", Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal transition"
          >
            {TERM_OPTIONS.map((t) => (
              <option key={t} value={t}>{t} Year</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <InputField label="Discount Points" value={scenario.discountPoints} onChange={(v) => update("discountPoints", v)} suffix="%" small />
        <InputField label="Lender Credits" value={scenario.lenderCredits} onChange={(v) => update("lenderCredits", v)} prefix="$" small />
      </div>

      {/* Property Address (optional) */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Property Address <span className="text-slate-600">(optional, for printout)</span></label>
        <input
          type="text"
          value={scenario.propertyAddress}
          onChange={(e) => update("propertyAddress", e.target.value)}
          placeholder="123 Main St, Honolulu, HI 96813"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal transition"
        />
      </div>

      {/* County tax */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Property Tax Rate (County)</label>
        <select
          value={scenario.propertyTaxRate}
          onChange={(e) => update("propertyTaxRate", e.target.value)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal transition"
        >
          {COUNTY_OPTIONS.map((c) => (
            <option key={c.label} value={c.value}>{c.label}</option>
          ))}
          <option value={scenario.propertyTaxRate}>Custom ({scenario.propertyTaxRate}%)</option>
        </select>
      </div>

      {/* Manual property tax override */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Property Tax Override <span className="text-slate-600">(leave 0 to use rate)</span></label>
        <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden focus-within:border-teal transition">
          <span className="pl-3 text-slate-400 text-sm">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={scenario.propertyTaxOverride}
            onChange={(e) => update("propertyTaxOverride", e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-white text-sm px-3 py-2 outline-none"
          />
          <span className="pr-3 text-slate-400 text-xs">/mo</span>
        </div>
        {num(scenario.propertyTaxOverride) > 0 && (
          <p className="text-xs text-amber-400 mt-1">Using manual override — county rate ignored</p>
        )}
      </div>

      <div className="flex gap-3">
        <InputField label="Insurance/mo" value={scenario.insurance} onChange={(v) => update("insurance", v)} prefix="$" small />
        <InputField label="HOA/mo" value={scenario.hoa} onChange={(v) => {
          // Auto-set HOA Transfer Fee to $350 when HOA is first set > 0
          const newHoa = num(v);
          const currentTransfer = num(scenario.hoaTransferFee);
          if (newHoa > 0 && currentTransfer === 0) {
            onChange({ ...scenario, hoa: v, hoaTransferFee: "350" } as ScenarioStrings);
          } else if (newHoa === 0) {
            onChange({ ...scenario, hoa: v, hoaTransferFee: "0" } as ScenarioStrings);
          } else {
            update("hoa", v);
          }
        }} prefix="$" small />
      </div>

      {/* VA-specific */}
      {scenario.loanType === "va" && (
        <div className="p-3 bg-teal/5 border border-teal/20 rounded-lg space-y-3">
          <p className="text-xs font-semibold text-teal">VA Loan Options</p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">VA Entitlement Use</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => update("vaFirstUse", true)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  scenario.vaFirstUse
                    ? "bg-teal/20 text-teal border border-teal"
                    : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                }`}
              >
                First Use
              </button>
              <button
                onClick={() => update("vaFirstUse", false)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  !scenario.vaFirstUse
                    ? "bg-teal/20 text-teal border border-teal"
                    : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                }`}
              >
                Subsequent Use
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {num(scenario.downPaymentPct) >= 10
                ? "Funding fee: 1.25% (same for first & subsequent)"
                : num(scenario.downPaymentPct) >= 5
                ? "Funding fee: 1.50% (same for first & subsequent)"
                : scenario.vaFirstUse
                ? "Funding fee: 2.15% ($0 down, first use)"
                : "Funding fee: 3.30% ($0 down, subsequent use)"}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={scenario.vaDisabled}
              onChange={(e) => update("vaDisabled", e.target.checked)}
              className="rounded border-slate-600 text-teal focus:ring-teal"
            />
            Disability exemption (no funding fee)
          </label>
        </div>
      )}

      {/* Investment: DSCR-specific fields */}
      {scenario.isInvestment && scenario.docType === "dscr" && (
        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-3">
          <p className="text-xs font-semibold text-amber-400">DSCR Loan Options</p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Prepayment Penalty</label>
            <select
              value={scenario.prepayPenaltyYears}
              onChange={(e) => update("prepayPenaltyYears", Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal transition"
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>{y} Year{y > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Investment: Expected Rental Income */}
      {scenario.isInvestment && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-3">
          <p className="text-xs font-semibold text-emerald-400">Rental Income & Cash Flow</p>
          <InputField label="Expected Monthly Rent" value={scenario.expectedRent} onChange={(v) => update("expectedRent", v)} prefix="$" />
          <InputField label="Annual Rent Increase" value={scenario.annualRentIncrease} onChange={(v) => update("annualRentIncrease", v)} suffix="%" />
          {/* Live DSCR Factor */}
          {scenario.docType === "dscr" && num(scenario.expectedRent) > 0 && (() => {
            const price = num(scenario.purchasePrice);
            const dpPct = num(scenario.downPaymentPct);
            const loanAmt = price * (1 - dpPct / 100);
            const rate = num(scenario.rate);
            const term = scenario.termYears;
            const pi = monthlyPI(loanAmt, rate, term);
            const propTax = num(scenario.propertyTaxOverride) > 0
              ? num(scenario.propertyTaxOverride)
              : (price * num(scenario.propertyTaxRate) / 100) / 12;
            const ins = num(scenario.insurance);
            const hoa = num(scenario.hoa);
            const totalPITIHOA = pi + propTax + ins + hoa;
            const dscr = totalPITIHOA > 0 ? num(scenario.expectedRent) / totalPITIHOA : 0;
            return (
              <div className="bg-slate-700/40 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">DSCR Factor</span>
                  <span className={`text-lg font-bold ${dscr >= 1 ? "text-emerald-400" : "text-red-400"}`}>
                    {dscr.toFixed(3)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {dscr >= 1.25 ? "Strong — rent exceeds payment by 25%+" :
                   dscr >= 1.0 ? "Breakeven or positive — rent covers payment" :
                   "Negative cash flow — rent does not cover full PITI+HOA"}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ARM (Adjustable Rate Mortgage) */}
      {scenario.loanType !== "fha" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:border-slate-500 transition">
            <input
              type="checkbox"
              checked={scenario.isARM}
              onChange={(e) => update("isARM", e.target.checked)}
              className="rounded border-slate-600 text-teal focus:ring-teal"
            />
            <span className="font-medium">Adjustable Rate Mortgage (ARM)</span>
          </label>
          {scenario.isARM && (() => {
            const eff = effectiveArmParams(scenario);
            return (
              <div className="p-3 bg-indigo-500/5 border border-indigo-400/20 rounded-lg space-y-3">
                <p className="text-xs font-semibold text-indigo-300">ARM Options</p>
                {/* Fixed Period */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Initial Fixed Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([3, 5, 7, 10] as ArmFixedYears[]).map((fy) => (
                      <button
                        key={fy}
                        onClick={() => update("armFixedYears", fy)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold transition ${
                          scenario.armFixedYears === fy
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400"
                            : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        {fy}-Yr
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Rate is fixed at {num(scenario.rate) > 0 ? `${num(scenario.rate).toFixed(3)}%` : "the note rate"} for {scenario.armFixedYears} years, then adjusts {scenario.loanType === "va" ? "annually" : "every 6 months"} based on SOFR + margin.
                  </p>
                </div>
                {/* Margin */}
                <InputField
                  label={`Margin (default ${defaultArmMargin(scenario.loanType).toFixed(2)}% for ${scenario.loanType === "va" ? "VA" : "Conventional"})`}
                  value={scenario.armMargin}
                  onChange={(v) => update("armMargin", v)}
                  suffix="%"
                  placeholder={defaultArmMargin(scenario.loanType).toFixed(2)}
                />
                {/* Cap structure display */}
                <div className="bg-slate-700/40 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Adjustment Caps</span>
                    <span className="text-sm font-bold text-indigo-300">
                      {eff.initialCap}/{eff.periodicCap}/{eff.lifetimeCap}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    First adjustment ±{eff.initialCap}% · subsequent ±{eff.periodicCap}% · lifetime +{eff.lifetimeCap}% over note rate.
                    Floor: {eff.margin.toFixed(2)}% (the margin). Adjusts {scenario.loanType === "va" ? "annually" : "semi-annually"}.
                  </p>
                  {num(scenario.rate) > 0 && (
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-600/50">
                      <span className="text-slate-400">Max lifetime rate</span>
                      <span className="text-amber-300 font-semibold">{(num(scenario.rate) + eff.lifetimeCap).toFixed(3)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Temporary Buydown */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={scenario.buydownType !== "none"}
            onChange={(e) => update("buydownType", e.target.checked ? "2-1" : "none")}
            className="rounded border-slate-600 text-teal focus:ring-teal"
          />
          Temporary Buydown
        </label>
        {scenario.buydownType !== "none" && (
          <select
            value={scenario.buydownType}
            onChange={(e) => update("buydownType", e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal transition"
          >
            <option value="1-1">1-1 Buydown</option>
            <option value="2-1">2-1 Buydown</option>
            <option value="3-2-1">3-2-1 Buydown</option>
          </select>
        )}
        {scenario.buydownType !== "none" && (() => {
          const loanAmt = (parseFloat(scenario.purchasePrice) || 0) * (1 - (parseFloat(scenario.downPaymentPct) || 0) / 100);
          const rate = parseFloat(scenario.rate) || 0;
          const term = scenario.termYears || 30;
          const fullPI = monthlyPI(loanAmt, rate, term);
          let cost = 0;
          if (scenario.buydownType === "1-1") {
            cost = (fullPI - monthlyPI(loanAmt, rate - 1, term)) * 12;
          } else if (scenario.buydownType === "2-1") {
            cost = (fullPI - monthlyPI(loanAmt, rate - 2, term)) * 12 + (fullPI - monthlyPI(loanAmt, rate - 1, term)) * 12;
          } else if (scenario.buydownType === "3-2-1") {
            cost = (fullPI - monthlyPI(loanAmt, rate - 3, term)) * 12 + (fullPI - monthlyPI(loanAmt, rate - 2, term)) * 12 + (fullPI - monthlyPI(loanAmt, rate - 1, term)) * 12;
          }
          return cost > 0 ? (
            <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Buydown Cost</p>
              <p className="text-sm font-bold text-cyan-300">${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          ) : null;
        })()}
      </div>

      {/* Seller Credit */}
      <InputField label="Seller Credit" value={scenario.sellerCredit} onChange={(v) => update("sellerCredit", v)} prefix="$" />

      {/* Closing Costs (expandable) */}
      <button
        onClick={() => setShowClosing(!showClosing)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal transition w-full"
      >
        {showClosing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Closing Costs
      </button>
      {showClosing && (
        <div className="space-y-3 pl-2 border-l-2 border-slate-700">
          {scenario.loanType === "va" ? (
            <div className="text-xs text-slate-500 italic">No origination fee (CMG VA policy)</div>
          ) : (
            <InputField label="Origination Fee" value={scenario.originationFee} onChange={(v) => update("originationFee", v)} prefix="$" />
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Appraisal Fee</label>
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-300">
              ${scenario.loanType === "va" ? "900" : "875"}
            </div>
          </div>
          <InputField label="Title Insurance" value={scenario.titleInsurance} onChange={(v) => update("titleInsurance", v)} prefix="$" />
          <InputField label="Escrow/Settlement" value={scenario.escrowFee} onChange={(v) => update("escrowFee", v)} prefix="$" />
          <InputField label="Recording Fees" value={scenario.recordingFees} onChange={(v) => update("recordingFees", v)} prefix="$" />
          <InputField label="Credit Report" value={scenario.creditReport} onChange={(v) => update("creditReport", v)} prefix="$" />
          <InputField label="Flood Certification" value={scenario.floodCert} onChange={(v) => update("floodCert", v)} prefix="$" />
          {/* HOA Transfer Fee (auto-defaults to $350 when HOA > 0) */}
          {num(scenario.hoa) > 0 && (
            <InputField
              label="HOA Transfer Fee"
              value={scenario.hoaTransferFee !== "0" && scenario.hoaTransferFee !== "" ? scenario.hoaTransferFee : "350"}
              onChange={(v) => update("hoaTransferFee", v)}
              prefix="$"
            />
          )}
        </div>
      )}

      {/* Prepaids (expandable) */}
      <button
        onClick={() => setShowPrepaids(!showPrepaids)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal transition w-full"
      >
        {showPrepaids ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Prepaids
      </button>
      {showPrepaids && (
        <div className="space-y-3 pl-2 border-l-2 border-slate-700">
          <InputField label="Est. Closing Day" value={scenario.closingDay} onChange={(v) => update("closingDay", v)} placeholder="15" />
          <p className="text-xs text-slate-500">Prepaid interest, 12-mo insurance, 6-mo property tax escrow, and 1-mo HOA (if applicable) are calculated automatically.</p>
        </div>
      )}
    </div>
  );
}

// ─── ARM Scenario Block ──────────────────────────────────────────────────────

/** Pick milestone years for the ARM trajectory table: fixed period end, adjustments, and spread. */
function armMilestoneYears(fixedYears: number, termYears: number): number[] {
  const years = new Set<number>([1]);
  years.add(Math.min(fixedYears, termYears));
  for (let y = fixedYears + 1; y <= Math.min(fixedYears + 5, termYears); y++) years.add(y);
  [10, 15, 20, 25, 30].forEach((y) => { if (y > fixedYears + 5 && y <= termYears) years.add(y); });
  return Array.from(years).sort((a, b) => a - b);
}

function ArmScenarioBlock({
  arm,
  initialPI,
  escrows,
  termYears,
}: {
  arm: ArmAnalysis;
  initialPI: number;
  escrows: number;
  termYears: number;
}) {
  const [showTrajectory, setShowTrajectory] = useState(false);
  const milestones = armMilestoneYears(arm.fixedYears, termYears);
  const worstPI = arm.worstCase.maxPI;
  // Use the post-fixed-period stabilized P&I, not maxPI (which equals initial P&I when historical rate < note rate)
  const histTrajectoryRow = arm.historical.trajectory[arm.fixedYears];
  const histPI = histTrajectoryRow ? histTrajectoryRow.pi : arm.historical.maxPI;

  return (
    <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-400/30 rounded-lg">
      <p className="text-xs font-semibold text-indigo-300 mb-2">
        ARM Payment Scenarios — After the {arm.fixedYears}-Year Fixed Period
      </p>

      {/* Three-way payment comparison */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/60 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">Initial P&amp;I</p>
          <p className="text-sm font-bold text-white">{fmtExact(initialPI)}</p>
          <p className="text-[10px] text-slate-500">Yrs 1–{arm.fixedYears}</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2 text-center border border-emerald-500/20">
          <p className="text-[10px] text-slate-400 mb-0.5">Historical Avg</p>
          <p className="text-sm font-bold text-emerald-400">{fmtExact(histPI)}</p>
          <p className="text-[10px] text-slate-500">@ {arm.expectedRate.toFixed(3)}%</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2 text-center border border-red-500/20">
          <p className="text-[10px] text-slate-400 mb-0.5">Worst Case</p>
          <p className="text-sm font-bold text-red-400">{fmtExact(worstPI)}</p>
          <p className="text-[10px] text-slate-500">@ {arm.worstCase.maxRate.toFixed(3)}%</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
        Historical average assumes the index returns to its 20-year average of {arm.historicalIndex.toFixed(2)}% (index + {arm.margin.toFixed(2)}% margin = {(arm.historicalIndex + arm.margin).toFixed(2)}% fully indexed, subject to caps).
        Worst case assumes the rate hits every cap until the lifetime ceiling. Floor: {arm.floorRate.toFixed(2)}%.
      </p>

      {/* Payment trajectory toggle */}
      <button
        onClick={() => setShowTrajectory(!showTrajectory)}
        className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 transition w-full"
      >
        {showTrajectory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        Payment Trajectory (Year by Year)
      </button>
      {showTrajectory && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-1.5 px-1.5 text-slate-400">Year</th>
                <th className="text-right py-1.5 px-1.5 text-emerald-400">Hist. Rate</th>
                <th className="text-right py-1.5 px-1.5 text-emerald-400">Hist. P&amp;I</th>
                <th className="text-right py-1.5 px-1.5 text-red-400">Worst Rate</th>
                <th className="text-right py-1.5 px-1.5 text-red-400">Worst P&amp;I</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((yr) => {
                const h = arm.historical.trajectory[yr - 1];
                const w = arm.worstCase.trajectory[yr - 1];
                if (!h || !w) return null;
                const isAdjusting = yr > arm.fixedYears;
                return (
                  <tr key={yr} className={`border-b border-slate-700/50 ${yr === arm.fixedYears ? "border-b-indigo-400/40" : ""}`}>
                    <td className="py-1 px-1.5 text-slate-300">
                      {yr}{yr === arm.fixedYears ? " ◂ fixed ends" : ""}
                    </td>
                    <td className="text-right py-1 px-1.5 text-slate-300">{h.maxRate.toFixed(3)}%</td>
                    <td className={`text-right py-1 px-1.5 ${isAdjusting ? "text-emerald-400" : "text-slate-300"}`}>{fmtExact(h.maxPI)}</td>
                    <td className="text-right py-1 px-1.5 text-slate-300">{w.maxRate.toFixed(3)}%</td>
                    <td className={`text-right py-1 px-1.5 ${isAdjusting ? "text-red-400" : "text-slate-300"}`}>{fmtExact(w.maxPI)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Rates/payments shown are the highest in effect during each year. Total PITI adds {fmtExact(escrows)}/mo in taxes, insurance, HOA &amp; MI.
          </p>
          <div className="flex justify-between text-[11px] mt-2 pt-2 border-t border-slate-700">
            <span className="text-slate-400">Lifetime interest</span>
            <span>
              <span className="text-emerald-400">{fmt(arm.historical.totalInterest)} hist.</span>
              <span className="text-slate-500"> · </span>
              <span className="text-red-400">{fmt(arm.worstCase.totalInterest)} worst</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({
  result,
  index,
  yearsInHome,
  winners,
  scenario,
}: {
  result: ScenarioResult;
  index: number;
  yearsInHome: number;
  winners: { payment: number; cash: number; equity: number };
  scenario?: ScenarioStrings;
}) {
  const [showClosing, setShowClosing] = useState(false);
  const [showPrepaids, setShowPrepaids] = useState(false);
  const [showAmort, setShowAmort] = useState(false);

  const colors = ["text-teal", "text-gold", "text-rose-400"];
  const borderColors = ["border-teal", "border-gold", "border-rose-400"];
  const bgColors = ["bg-teal/10", "bg-gold/10", "bg-rose-400/10"];
  // Equity gained = appreciation + principal paydown at yearsInHome
  const equityRow = result.amortization[yearsInHome - 1] || result.amortization[result.amortization.length - 1];
  const cumulativePrincipal = result.totalLoanAmount - (equityRow?.endBalance ?? result.totalLoanAmount);
  const appreciationGain = result.purchasePrice * (Math.pow(1.045, yearsInHome) - 1);
  const equityGained = appreciationGain + cumulativePrincipal;

  const isWinnerPayment = index === winners.payment;
  const isWinnerCash = index === winners.cash;
  const isWinnerTotal = index === winners.equity;

  return (
    <div className={`bg-slate-800/80 border ${borderColors[index]} rounded-xl overflow-hidden`}>
      {/* Header — dynamically reflects actual loan type, term, and rate */}
      <div className={`${bgColors[index]} px-5 py-4 border-b ${borderColors[index]}`}>
        <h3 className={`font-bold text-lg ${colors[index]}`}>
          {result.isARM && result.arm
            ? `${result.arm.fixedYears}/${result.arm.adjustmentFrequency === 6 ? "6mo" : "1yr"} ARM — ${scenario?.isInvestment && result.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[result.loanType]}`
            : `${result.termYears}-Year ${scenario?.isInvestment && result.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[result.loanType]}`}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {fmt(result.purchasePrice)} price · {fmt(result.downPayment)} down · {fmt(result.totalLoanAmount)} loan
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {result.rate.toFixed(3)}% {result.isARM ? "Initial Rate" : "Note Rate"} · {pct(result.apr)} APR
        </p>
        {result.isARM && result.arm && (
          <p className="text-xs text-indigo-300 mt-0.5">
            Fixed {result.arm.fixedYears} yrs · SOFR + {result.arm.margin.toFixed(2)}% margin · {result.arm.initialCap}/{result.arm.periodicCap}/{result.arm.lifetimeCap} caps
          </p>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Winner badges */}
        <div className="flex flex-wrap gap-2">
          {isWinnerPayment && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
              <Trophy size={12} /> Lowest Payment
            </span>
          )}
          {isWinnerCash && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              <DollarSign size={12} /> Lowest Cash to Close
            </span>
          )}
          {isWinnerTotal && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
              <TrendingUp size={12} /> Most Equity Gained
            </span>
          )}
        </div>

        {/* Monthly Payment Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Monthly Payment</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Principal & Interest</span>
              <span className="text-white font-medium">{fmtExact(result.monthly.principalInterest)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Property Tax</span>
              <span className="text-white font-medium">{fmtExact(result.monthly.propertyTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Insurance</span>
              <span className="text-white font-medium">{fmtExact(result.monthly.insurance)}</span>
            </div>
            {result.monthly.hoa > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">HOA</span>
                <span className="text-white font-medium">{fmtExact(result.monthly.hoa)}</span>
              </div>
            )}
            {result.monthly.mortgageInsurance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Mortgage Insurance</span>
                <span className="text-white font-medium">{fmtExact(result.monthly.mortgageInsurance)}</span>
              </div>
            )}
            <div className={`flex justify-between text-sm font-bold pt-2 border-t border-slate-700 ${colors[index]}`}>
              <span>Total PITI</span>
              <span>{fmtExact(result.monthly.totalPITI)}</span>
            </div>
          </div>
          {/* ARM Payment Scenarios */}
          {result.isARM && result.arm && (
            <ArmScenarioBlock arm={result.arm} initialPI={result.monthly.principalInterest} escrows={result.monthly.totalPITI - result.monthly.principalInterest} termYears={result.termYears} />
          )}
          {/* Buydown schedule */}
          {result.buydownType !== "none" && result.buydownSchedule.length > 0 && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs font-semibold text-amber-400 mb-2">{result.buydownType.toUpperCase()} Buydown Schedule</p>
              <div className="space-y-1.5">
                {result.buydownSchedule.map((s) => (
                  <div key={s.year} className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      {s.savings > 0 ? `Year ${s.year}: ${s.rate.toFixed(3)}%` : `Year ${s.year}+: ${s.rate.toFixed(3)}% (permanent)`}
                    </span>
                    <span className={s.savings > 0 ? "text-amber-300" : "text-white"}>
                      {fmtExact(s.pi)}/mo {s.savings > 0 ? `(save ${fmtExact(s.savings)})` : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-amber-500/20">
                <span className="text-amber-400 font-semibold">Buydown Cost</span>
                <span className="text-amber-300 font-semibold">{fmt(result.buydownCost)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Closing Costs */}
        <div>
          <button
            onClick={() => setShowClosing(!showClosing)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 uppercase tracking-wider"
          >
            <span>Closing Costs: {fmt(result.closingCosts.total)}</span>
            {showClosing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showClosing && (
            <div className="mt-3 space-y-1.5">
              {[
                ["Origination Fee", result.closingCosts.originationFee],
                ["Appraisal", result.closingCosts.appraisalFee],
                ["Title Insurance", result.closingCosts.titleInsurance],
                ["Escrow/Settlement", result.closingCosts.escrowFee],
                ["Recording Fees", result.closingCosts.recordingFees],
                ["Credit Report", result.closingCosts.creditReport],
                ["Flood Cert", result.closingCosts.floodCert],
                ["Discount Points", result.closingCosts.discountPointsCost],
                ["HOA Transfer Fee", result.closingCosts.hoaTransferFee],
              ]
                .filter(([, v]) => (v as number) > 0)
                .map(([label, val]) => (
                  <div key={label as string} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label as string}</span>
                    <span className="text-slate-300">{fmt(val as number)}</span>
                  </div>
                ))}
              {result.buydownCost > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Temporary Buydown ({result.buydownType})</span>
                  <span className="text-amber-300">{fmt(result.buydownCost)}</span>
                </div>
              )}
              {result.financedFee > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    {result.loanType === "va" ? "VA Funding Fee (financed)" : "FHA Upfront MIP 1.75% (financed)"}
                  </span>
                  <span className="text-amber-400">{fmt(result.financedFee)}</span>
                </div>
              )}
              {result.closingCosts.lenderCredits > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Lender Credits</span>
                  <span className="text-emerald-400">-{fmt(result.closingCosts.lenderCredits)}</span>
                </div>
              )}
              {result.sellerCredit > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Seller Credit</span>
                  <span className="text-emerald-400">-{fmt(result.sellerCredit)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prepaids */}
        <div>
          <button
            onClick={() => setShowPrepaids(!showPrepaids)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 uppercase tracking-wider"
          >
            <span>Prepaids: {fmt(result.prepaids.total)}</span>
            {showPrepaids ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showPrepaids && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Prepaid Interest</span>
                <span className="text-slate-300">{fmt(result.prepaids.prepaidInterest)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Insurance (12 mo)</span>
                <span className="text-slate-300">{fmt(result.prepaids.insurancePremium)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Property Tax Escrow (6 mo)</span>
                <span className="text-slate-300">{fmt(result.prepaids.taxEscrow)}</span>
              </div>
              {result.prepaids.hoaPrepaid > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">HOA Pre-paid (1 mo)</span>
                  <span className="text-slate-300">{fmt(result.prepaids.hoaPrepaid)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/40 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Cash to Close</p>
            <p className={`text-lg font-bold ${colors[index]}`}>{fmt(result.cashToClose)}</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">{yearsInHome}-Yr Equity Gained</p>
            <p className={`text-lg font-bold ${colors[index]}`}>{fmt(equityGained)}</p>
          </div>
        </div>

        {/* Amortization toggle */}
        <button
          onClick={() => setShowAmort(!showAmort)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal transition w-full"
        >
          {showAmort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Amortization Schedule{result.isARM ? " (Historical-Average ARM Path)" : ""}
        </button>
        {showAmort && (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400">Year</th>
                  <th className="text-right py-2 px-2 text-slate-400">Principal</th>
                  <th className="text-right py-2 px-2 text-slate-400">Interest</th>
                  <th className="text-right py-2 px-2 text-slate-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.amortization.map((row) => (
                  <tr key={row.year} className="border-b border-slate-700/50">
                    <td className="py-1.5 px-2 text-slate-300">{row.year}</td>
                    <td className="text-right py-1.5 px-2 text-emerald-400">{fmt(row.totalPrincipal)}</td>
                    <td className="text-right py-1.5 px-2 text-slate-400">{fmt(row.totalInterest)}</td>
                    <td className="text-right py-1.5 px-2 text-white">{fmt(row.endBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Print Layout ────────────────────────────────────────────────────────────

function PrintLayout({ results, yearsInHome, scenarios, comparableRent, includeRentInPdf }: { results: ScenarioResult[]; yearsInHome: number; scenarios: ScenarioStrings[]; comparableRent: string; includeRentInPdf: boolean }) {
  return (
    <div className="print-only hidden" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* ═══ PAGE 1 (NEW): Visual Summary ═══ */}
      {(() => {
        // Color palette per scenario (navy, teal, gold)
        const CARD_COLORS = [
          { bg: "#0C2340", accent: "#C9A84C", text: "#FFFFFF", subtext: "#CBD5E1", border: "#1E3A5F" },
          { bg: "#0E4F5C", accent: "#C9A84C", text: "#FFFFFF", subtext: "#A7C5CC", border: "#1A6B7A" },
          { bg: "#1A3A1A", accent: "#C9A84C", text: "#FFFFFF", subtext: "#A7C5A7", border: "#2A5A2A" },
        ];
        const maxPITI = Math.max(...results.map((r) => r.monthly.totalPITI));
        const maxCash = Math.max(...results.map((r) => r.cashToClose));
        const cardWidth = results.length === 3 ? "32%" : "48%";
        const isInvMode = scenarios.some((s) => s.isInvestment);
        return (
          <div style={{ paddingBottom: "8px" }}>
            {/* Summary Page Header */}
            <div style={{ borderBottom: "2px solid #0C2340", paddingBottom: "6px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <h1 style={{ fontSize: "15pt", fontWeight: "bold", color: "#0C2340", margin: 0, letterSpacing: "-0.3px" }}>Loan Comparison Summary</h1>
                  <p style={{ fontSize: "8pt", color: "#666", margin: "2px 0 0 0" }}>
                    Prepared by {LENDER.name} | NMLS #{LENDER.nmls} | {LENDER.company} | {LENDER.phone}
                  </p>
                </div>
                <div style={{ textAlign: "right", fontSize: "7pt", color: "#888" }}>
                  {results[0] && scenarios[0]?.propertyAddress && (
                    <p style={{ margin: "0 0 1px 0", fontWeight: "bold", color: "#0C2340", fontSize: "8pt" }}>{scenarios[0].propertyAddress}</p>
                  )}
                  {results[0] && (
                    <p style={{ margin: 0 }}>Purchase Price: <strong style={{ color: "#0C2340" }}>{fmt(results[0].purchasePrice)}</strong> &nbsp;|&nbsp; Page 1 of 2</p>
                  )}
                </div>
              </div>
            </div>

            {/* Loan Cards */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", justifyContent: "center" }}>
              {results.map((r, i) => {
                const c = CARD_COLORS[i % CARD_COLORS.length];
                const s = scenarios[i];
                const baseLoanLabel = s?.isInvestment && r.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[r.loanType];
                const loanLabel = r.isARM && r.arm
                  ? `${r.arm.fixedYears}/${r.arm.adjustmentFrequency === 6 ? "6mo" : "1yr"} ARM ${baseLoanLabel}`
                  : baseLoanLabel;
                // DSCR factor for investment scenarios
                let dscrFactor: number | null = null;
                let netCashFlow: number | null = null;
                if (s?.isInvestment && s.docType === "dscr" && num(s.expectedRent) > 0) {
                  dscrFactor = r.monthly.totalPITI > 0 ? num(s.expectedRent) / r.monthly.totalPITI : 0;
                  netCashFlow = num(s.expectedRent) - r.monthly.totalPITI;
                } else if (s?.isInvestment && num(s.expectedRent) > 0) {
                  netCashFlow = num(s.expectedRent) - r.monthly.totalPITI;
                }
                return (
                  <div key={i} style={{ width: cardWidth, backgroundColor: c.bg, borderRadius: "6px", padding: "12px 14px", color: c.text, border: `1px solid ${c.border}`, boxSizing: "border-box" as const }}>
                    {/* Card Header */}
                    <div style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: "7px", marginBottom: "8px" }}>
                      <p style={{ fontSize: "7pt", fontWeight: "bold", color: c.accent, textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 2px 0" }}>
                        Option {i + 1}{s?.docType === "dscr" ? " · DSCR" : s?.isInvestment ? " · Full Doc" : ""}
                      </p>
                      <p style={{ fontSize: "11pt", fontWeight: "bold", color: c.text, margin: "0 0 1px 0" }}>{r.termYears}-Year {loanLabel}</p>
                      <p style={{ fontSize: "9pt", color: c.accent, margin: 0, fontWeight: "bold" }}>{r.rate.toFixed(3)}% {r.isARM ? "Initial Rate" : "Note Rate"} &nbsp;·&nbsp; {pct(r.apr)} APR</p>
                      {r.isARM && r.arm && (
                        <p style={{ fontSize: "6.5pt", color: c.subtext, margin: "2px 0 0 0" }}>
                          Fixed {r.arm.fixedYears} yrs · SOFR + {r.arm.margin.toFixed(2)}% margin · {r.arm.initialCap}/{r.arm.periodicCap}/{r.arm.lifetimeCap} caps · adjusts {r.arm.adjustmentFrequency === 6 ? "semi-annually" : "annually"}
                        </p>
                      )}
                    </div>
                    {/* Key Numbers */}
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Monthly P&amp;I</span>
                        <span style={{ fontSize: "9pt", fontWeight: "bold", color: c.text }}>{fmtExact(r.monthly.principalInterest)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Property Taxes</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmtExact(r.monthly.propertyTax)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Homeowner's Insurance</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmtExact(r.monthly.insurance)}</span>
                      </div>
                      {r.monthly.hoa > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "7pt", color: c.subtext }}>HOA Dues</span>
                          <span style={{ fontSize: "8pt", color: c.text }}>{fmtExact(r.monthly.hoa)}</span>
                        </div>
                      )}
                      {r.monthly.mortgageInsurance > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "7pt", color: c.subtext }}>PMI/Mortgage Insurance</span>
                          <span style={{ fontSize: "8pt", color: c.text }}>{fmtExact(r.monthly.mortgageInsurance)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Total Monthly (PITI+HOA)</span>
                        <span style={{ fontSize: "10pt", fontWeight: "bold", color: c.accent }}>{fmtExact(r.monthly.totalPITI)}</span>
                      </div>
                      {r.isARM && r.arm && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "7pt", color: c.subtext }}>P&amp;I — Historical Avg (max)</span>
                            <span style={{ fontSize: "8pt", fontWeight: "bold", color: "#4ade80" }}>{fmtExact(r.arm.historical.trajectory[r.arm.fixedYears]?.pi || r.arm.historical.maxPI)} @ {r.arm.expectedRate.toFixed(3)}%</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "7pt", color: c.subtext }}>P&amp;I — Worst Case (max)</span>
                            <span style={{ fontSize: "8pt", fontWeight: "bold", color: "#f87171" }}>{fmtExact(r.arm.worstCase.maxPI)} @ {r.arm.worstCase.maxRate.toFixed(3)}%</span>
                          </div>
                        </>
                      )}
                      <div style={{ height: "1px", backgroundColor: c.border, margin: "2px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Purchase Price</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmt(r.purchasePrice)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Down Payment</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmt(r.downPayment)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Loan Amount</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmt(r.totalLoanAmount)}</span>
                      </div>
                      <div style={{ height: "1px", backgroundColor: c.border, margin: "2px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Discount Points</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>
                          {r.closingCosts.discountPointsCost > 0 ? `${fmt(r.closingCosts.discountPointsCost)} (${r.discountPoints.toFixed(3)}%)` : "None"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Closing Costs</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmt(r.closingCosts.total - r.closingCosts.discountPointsCost + r.closingCosts.lenderCredits)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Prepaid Items</span>
                        <span style={{ fontSize: "8pt", color: c.text }}>{fmt(r.prepaids.total)}</span>
                      </div>
                      {r.closingCosts.lenderCredits > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "7pt", color: c.subtext }}>Lender Credit</span>
                          <span style={{ fontSize: "8pt", color: "#4ade80" }}>-{fmt(r.closingCosts.lenderCredits)}</span>
                        </div>
                      )}
                      {r.sellerCredit > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "7pt", color: c.subtext }}>Seller Credit</span>
                          <span style={{ fontSize: "8pt", color: "#4ade80" }}>-{fmt(r.sellerCredit)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "7pt", color: c.subtext }}>Cash to Close</span>
                        <span style={{ fontSize: "10pt", fontWeight: "bold", color: c.accent }}>{fmt(r.cashToClose)}</span>
                      </div>
                      {/* Investment-specific rows */}
                      {s?.isInvestment && dscrFactor !== null && (
                        <>
                          <div style={{ height: "1px", backgroundColor: c.border, margin: "2px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "7pt", color: c.subtext }}>DSCR Factor</span>
                            <span style={{ fontSize: "9pt", fontWeight: "bold", color: dscrFactor >= 1 ? "#4ade80" : "#f87171" }}>{dscrFactor.toFixed(3)}</span>
                          </div>
                          {s.prepayPenaltyYears > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span style={{ fontSize: "7pt", color: c.subtext }}>Prepay Penalty</span>
                              <span style={{ fontSize: "8pt", color: c.text }}>{s.prepayPenaltyYears}-Year</span>
                            </div>
                          )}
                        </>
                      )}
                      {s?.isInvestment && netCashFlow !== null && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "7pt", color: c.subtext }}>Est. Monthly Cash Flow</span>
                          <span style={{ fontSize: "9pt", fontWeight: "bold", color: netCashFlow >= 0 ? "#4ade80" : "#f87171" }}>
                            {netCashFlow >= 0 ? "+" : ""}{fmtExact(netCashFlow)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Closing Costs & Prepaids Footnote */}
            <div style={{ padding: "5px 8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "3px", marginBottom: "10px" }}>
              <p style={{ margin: 0, fontSize: "6.5pt", color: "#64748b", lineHeight: 1.4 }}>
                Closing costs include lender fees, appraisal, title &amp; escrow fees, and HOA transfer fees. Prepaid items include upfront property taxes, upfront insurance, HOA dues, and mortgage interest.
              </p>
            </div>

            {/* ARM Payment Trajectory (Print) */}
            {results.some((r) => r.isARM && r.arm) && (
              <div style={{ marginBottom: "10px", padding: "6px 8px", border: "1.5px solid #4f46e5", borderRadius: "4px", backgroundColor: "#eef2ff" }}>
                <h2 style={{ fontSize: "8.5pt", fontWeight: "bold", color: "#0C2340", margin: "0 0 4px 0" }}>ARM Payment Scenarios &amp; Trajectory</h2>
                {results.map((r, i) => {
                  if (!r.isARM || !r.arm) return null;
                  const arm = r.arm;
                  const milestones = (() => {
                    const ys = new Set<number>([1, Math.min(arm.fixedYears, r.termYears)]);
                    for (let y = arm.fixedYears + 1; y <= Math.min(arm.fixedYears + 5, r.termYears); y++) ys.add(y);
                    [10, 15, 20, 25, 30].forEach((y) => { if (y > arm.fixedYears + 5 && y <= r.termYears) ys.add(y); });
                    return Array.from(ys).sort((a, b) => a - b);
                  })();
                  return (
                    <div key={i} style={{ marginBottom: "6px", padding: "4px 6px", backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "3px" }}>
                      <p style={{ fontSize: "7.5pt", fontWeight: "bold", color: "#0C2340", margin: "0 0 2px 0" }}>
                        Option {i + 1}: {arm.fixedYears}/{arm.adjustmentFrequency === 6 ? "6mo" : "1yr"} ARM — {r.rate.toFixed(3)}% initial · SOFR + {arm.margin.toFixed(2)}% margin · {arm.initialCap}/{arm.periodicCap}/{arm.lifetimeCap} caps · floor {arm.floorRate.toFixed(2)}%
                      </p>
                      <div style={{ display: "flex", gap: "10px", marginBottom: "3px" }}>
                        <p style={{ fontSize: "7pt", color: "#444", margin: 0 }}>Initial P&amp;I: <strong>{fmtExact(r.monthly.principalInterest)}</strong> (yrs 1–{arm.fixedYears})</p>
                        <p style={{ fontSize: "7pt", color: "#15803d", margin: 0 }}>Historical avg: <strong>{fmtExact(arm.historical.trajectory[arm.fixedYears]?.pi || arm.historical.maxPI)}</strong> @ {arm.expectedRate.toFixed(3)}%</p>
                        <p style={{ fontSize: "7pt", color: "#dc2626", margin: 0 }}>Worst case: <strong>{fmtExact(arm.worstCase.maxPI)}</strong> @ {arm.worstCase.maxRate.toFixed(3)}%</p>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "6.5pt" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#0C2340", color: "#fff" }}>
                            <th style={{ textAlign: "left", padding: "2px 4px" }}>Year</th>
                            {milestones.map((y) => (
                              <th key={y} style={{ textAlign: "right", padding: "2px 4px" }}>{y}{y === arm.fixedYears ? "*" : ""}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={{ padding: "2px 4px", color: "#15803d", fontWeight: "bold" }}>Hist. P&amp;I</td>
                            {milestones.map((y) => {
                              const t = arm.historical.trajectory[y - 1];
                              return <td key={y} style={{ textAlign: "right", padding: "2px 4px" }}>{t ? fmt(t.maxPI) : "—"}</td>;
                            })}
                          </tr>
                          <tr>
                            <td style={{ padding: "2px 4px", color: "#dc2626", fontWeight: "bold" }}>Worst P&amp;I</td>
                            {milestones.map((y) => {
                              const t = arm.worstCase.trajectory[y - 1];
                              return <td key={y} style={{ textAlign: "right", padding: "2px 4px" }}>{t ? fmt(t.maxPI) : "—"}</td>;
                            })}
                          </tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: "6pt", color: "#888", margin: "2px 0 0 0" }}>
                        *Fixed period ends. Historical scenario assumes index at its 20-yr average ({arm.historicalIndex.toFixed(2)}%); worst case hits every cap. P&amp;I only — excludes taxes/insurance/HOA/MI.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Points Recovery / Breakeven Analysis */}
            {/* Points Recovery Analysis (Print) — Prominent Section */}
            {(() => {
              const sameType = results.every((r) => r.loanType === results[0].loanType);
              const sameTerm = results.every((r) => r.termYears === results[0].termYears);
              const sameLoan = results.every((r) => Math.abs(r.baseLoanAmount - results[0].baseLoanAmount) < 1);
              if (!sameType || !sameTerm || !sameLoan) return null;
              const sorted = [...results].sort((a, b) => a.rate - b.rate);
              const pairs: { lowRate: number; highRate: number; cost: number; savings: number; months: number; netSavings: number }[] = [];
              for (let i = 0; i < sorted.length; i++) {
                for (let j = i + 1; j < sorted.length; j++) {
                  const lowUpfront = sorted[i].closingCosts.total + sorted[i].prepaids.total;
                  const highUpfront = sorted[j].closingCosts.total + sorted[j].prepaids.total;
                  const diff = lowUpfront - highUpfront;
                  const save = sorted[j].monthly.principalInterest - sorted[i].monthly.principalInterest;
                  if (diff > 0 && save > 0) {
                    const netSavings = save * (yearsInHome * 12) - diff;
                    pairs.push({ lowRate: sorted[i].rate, highRate: sorted[j].rate, cost: diff, savings: save, months: Math.ceil(diff / save), netSavings });
                  }
                }
              }
              if (pairs.length === 0) return null;
              return (
                <div style={{ marginTop: "6px", padding: "6px 8px", border: "1.5px solid #d97706", borderRadius: "4px", backgroundColor: "#fffbeb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <div style={{ width: "14px", height: "14px", backgroundColor: "#d97706", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontSize: "8pt", fontWeight: "bold" }}>↓</span>
                    </div>
                    <h2 style={{ fontSize: "8.5pt", fontWeight: "bold", color: "#0C2340", margin: 0 }}>Points Recovery / Breakeven Analysis</h2>
                  </div>
                  {pairs.map((p, i) => (
                    <div key={i} style={{ marginBottom: i < pairs.length - 1 ? "4px" : "0", padding: "4px 6px", backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "3px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                        <div>
                          <p style={{ fontSize: "8pt", fontWeight: "bold", color: "#0C2340", margin: "0 0 1px 0" }}>
                            {p.lowRate.toFixed(3)}% vs {p.highRate.toFixed(3)}%
                          </p>
                          <p style={{ fontSize: "7pt", color: "#666", margin: 0 }}>Buying down the rate costs more upfront but saves monthly</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
                          <p style={{ fontSize: "11pt", fontWeight: "bold", color: "#d97706", margin: 0 }}>{p.months} months</p>
                          <p style={{ fontSize: "7pt", color: "#666", margin: 0 }}>({(p.months / 12).toFixed(1)} yrs) to break even</p>
                        </div>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt" }}>
                        <tbody>
                          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={{ padding: "1px 0", color: "#666" }}>Extra Upfront Cost</td>
                            <td style={{ padding: "1px 0", textAlign: "right", fontWeight: "bold", color: "#dc2626" }}>{fmt(p.cost)}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={{ padding: "1px 0", color: "#666" }}>Monthly P&I Savings</td>
                            <td style={{ padding: "1px 0", textAlign: "right", fontWeight: "bold", color: "#059669" }}>{fmtExact(p.savings)}/mo</td>
                          </tr>
                          <tr>
                            <td style={{ padding: "1px 0", color: "#666" }}>Net Savings Over {yearsInHome} Years</td>
                            <td style={{ padding: "1px 0", textAlign: "right", fontWeight: "bold", color: p.netSavings > 0 ? "#059669" : "#dc2626" }}>{fmt(p.netSavings)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              );
            })()}


            {/* Investment summary callout if applicable */}
            {isInvMode && (
              <div style={{ padding: "6px 10px", backgroundColor: "#fffbeb", border: "1.5px solid #d97706", borderRadius: "4px", marginBottom: "8px" }}>
                <p style={{ fontSize: "7.5pt", fontWeight: "bold", color: "#92400e", margin: "0 0 4px 0" }}>Investment Property Analysis</p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" as const }}>
                  {scenarios.map((s, i) => {
                    if (!s.isInvestment) return null;
                    const r = results[i];
                    if (!r) return null;
                    const rent = parseFloat(s.expectedRent || "0");
                    const piti = r.monthly.totalPITI;
                    const dscrVal = piti > 0 && rent > 0 ? rent / piti : null;
                    const cashFlow = rent > 0 ? rent - piti : null;
                    const loanLabel = r.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[r.loanType];
                    const docLabel = s.docType === "dscr" ? "DSCR" : "Full Doc";
                    return (
                      <div key={i} style={{ minWidth: "140px", flex: 1 }}>
                        <p style={{ fontSize: "7pt", fontWeight: "bold", color: "#78350f", margin: "0 0 2px 0" }}>{r.termYears}-Yr {loanLabel} ({docLabel})</p>
                        {dscrVal !== null && (
                          <p style={{ fontSize: "7pt", color: "#78350f", margin: "0 0 1px 0" }}>
                            DSCR Factor: <strong style={{ color: dscrVal >= 1.25 ? "#15803d" : dscrVal >= 1.0 ? "#92400e" : "#dc2626" }}>{dscrVal.toFixed(3)}</strong>
                            {dscrVal >= 1.25 ? " ✓ Strong" : dscrVal >= 1.0 ? " ✓ Covers" : " ✗ Shortfall"}
                          </p>
                        )}
                        {cashFlow !== null && (
                          <p style={{ fontSize: "7pt", color: "#78350f", margin: "0 0 1px 0" }}>
                            Monthly Cash Flow: <strong style={{ color: cashFlow >= 0 ? "#15803d" : "#dc2626" }}>{cashFlow >= 0 ? "+" : ""}{fmtExact(cashFlow)}</strong>
                          </p>
                        )}
                        {s.docType === "dscr" && s.prepayPenaltyYears && (
                          <p style={{ fontSize: "6.5pt", color: "#92400e", margin: 0 }}>Prepay Penalty: {s.prepayPenaltyYears}-yr</p>
                        )}
                        {rent === 0 && (
                          <p style={{ fontSize: "6.5pt", color: "#92400e", margin: 0, fontStyle: "italic" }}>Enter expected rent to see DSCR &amp; cash flow</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: "6.5pt", color: "#a16207", margin: "4px 0 0 0" }}>
                  DSCR ≥ 1.000 = rental income covers full PITI+HOA. ≥ 1.250 = strong positive cash flow.
                  {scenarios.some((s) => s.isInvestment && s.docType === "dscr") && " DSCR loans include a prepayment penalty — factor into hold period."}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ padding: "4px 6px", border: "1px solid #ccc", borderRadius: "3px", fontSize: "6.5pt", color: "#666" }}>
              <p style={{ margin: 0 }}>
                Estimates for educational purposes only. Not a commitment to lend. Actual rates, fees, and terms may vary.
                Contact {LENDER.name} (NMLS #{LENDER.nmls}) at {LENDER.phone} | {LENDER.email} | {LENDER.company} NMLS #{LENDER.companyNmls}. Equal Housing Lender.
              </p>
            </div>
          </div>
        );
      })()}

      {/* ═══ PAGE 2: Equity Building & Value-Add Analysis ═══ */}
      <div style={{ pageBreakBefore: "always", paddingTop: "12px" }}>
        {/* Page 2 Header */}
        <div style={{ borderBottom: "1.5px solid #0C2340", paddingBottom: "6px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "14pt", fontWeight: "bold", color: "#0C2340", margin: 0 }}>Equity Building Analysis</h1>
              <p style={{ fontSize: "8pt", color: "#666", margin: "2px 0 0 0" }}>
                Prepared by {LENDER.name} | NMLS #{LENDER.nmls} | {LENDER.company}
              </p>
            </div>
            <div style={{ textAlign: "right", fontSize: "7.5pt", color: "#666" }}>
              <p style={{ margin: 0 }}>{LENDER.phone}</p>
              <p style={{ margin: 0 }}>{LENDER.email}</p>
            </div>
          </div>
        </div>

        {/* Assumptions line */}
        <div style={{ marginBottom: "12px", fontSize: "7.5pt", color: "#555" }}>
          {scenarios[0]?.propertyAddress && (
            <p style={{ margin: "0 0 2px 0" }}><strong>Property:</strong> {scenarios[0].propertyAddress}</p>
          )}
          <p style={{ margin: 0 }}>
            <strong>Purchase Price:</strong> {fmt(results[0]?.purchasePrice || 0)}&nbsp;|&nbsp;
            <strong>Appreciation:</strong> 3% annually&nbsp;|&nbsp;
            <strong>Hold Period:</strong> {yearsInHome} years&nbsp;|&nbsp;
            Page 2 of 2
          </p>
        </div>

        {/* ─── SECTION A: Equity Snapshot ─────────────────────────────────── */}
        {(() => {
          const CARD_COLORS_P2 = [
            { bg: "#0C2340", accent: "#C9A84C", text: "#FFFFFF", subtext: "#CBD5E1", border: "#1E3A5F" },
            { bg: "#0E4F5C", accent: "#C9A84C", text: "#FFFFFF", subtext: "#A7C5CC", border: "#1A6B7A" },
            { bg: "#1A3A1A", accent: "#C9A84C", text: "#FFFFFF", subtext: "#A7C5A7", border: "#2A5A2A" },
          ];
          const snapshots = results.map((r) => {
            const homeValue = r.purchasePrice * Math.pow(1.03, yearsInHome);
            // Remaining balance: use the amortization schedule (reflects ARM historical path when applicable)
            const row = r.amortization[Math.min(yearsInHome, r.amortization.length) - 1];
            const remainingBalance = row ? row.endBalance : 0;
            const totalEquity = homeValue - remainingBalance;
            const equityFromPayments = r.totalLoanAmount - remainingBalance;
            const equityFromAppreciation = homeValue - r.purchasePrice;
            return { homeValue, remainingBalance, totalEquity, equityFromPayments, equityFromAppreciation };
          });

          return (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#0C2340", margin: "0 0 6px 0", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                A. Equity Snapshot After {yearsInHome} Years
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5pt" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0C2340", color: "#ffffff" }}>
                    <th style={{ textAlign: "left", padding: "5px 8px", fontWeight: "bold" }}>Scenario</th>
                    <th style={{ textAlign: "right", padding: "5px 8px", fontWeight: "bold" }}>Est. Home Value</th>
                    <th style={{ textAlign: "right", padding: "5px 8px", fontWeight: "bold" }}>Remaining Balance</th>
                    <th style={{ textAlign: "right", padding: "5px 8px", fontWeight: "bold", color: "#C9A84C" }}>Total Equity</th>
                    <th style={{ textAlign: "right", padding: "5px 8px", fontWeight: "bold" }}>From Payments</th>
                    <th style={{ textAlign: "right", padding: "5px 8px", fontWeight: "bold" }}>From Appreciation</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const s = snapshots[i];
                    const c = CARD_COLORS_P2[i % CARD_COLORS_P2.length];
                    const loanLabel = scenarios[i]?.isInvestment && r.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[r.loanType];
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
                        <td style={{ padding: "6px 8px", fontWeight: "bold", color: c.bg }}>
                          {r.termYears}-Yr {loanLabel} @ {r.rate.toFixed(3)}%
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(s.homeValue)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: "#dc2626" }}>{fmt(s.remainingBalance)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold", color: "#059669" }}>{fmt(s.totalEquity)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(s.equityFromPayments)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(s.equityFromAppreciation)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* ─── SECTION B: Total Cost of Ownership ─────────────────────────── */}
        {(() => {
          const CARD_COLORS_P2 = [
            { bg: "#0C2340", accent: "#C9A84C", text: "#FFFFFF", subtext: "#CBD5E1", border: "#1E3A5F" },
            { bg: "#0E4F5C", accent: "#C9A84C", text: "#FFFFFF", subtext: "#A7C5CC", border: "#1A6B7A" },
            { bg: "#1A3A1A", accent: "#C9A84C", text: "#FFFFFF", subtext: "#A7C5A7", border: "#2A5A2A" },
          ];
          const cardWidth = results.length === 3 ? "32%" : "48%";
          return (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#0C2340", margin: "0 0 6px 0", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                B. Total Cost of Ownership — {yearsInHome} Years
              </h2>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {results.map((r, i) => {
                  const c = CARD_COLORS_P2[i % CARD_COLORS_P2.length];
                  const loanLabel = scenarios[i]?.isInvestment && r.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[r.loanType];
                  const armLabel = r.isARM && r.arm ? `${r.arm.fixedYears}/${r.arm.adjustmentFrequency === 6 ? "6mo" : "1yr"} ARM ` : "";
                  // For ARMs, sum actual P&I payments on the historical path + monthly escrows
                  const escrowsMonthly = r.monthly.totalPITI - r.monthly.principalInterest;
                  const totalPaid = r.isARM && r.arm
                    ? r.arm.historical.monthlyPayments.slice(0, Math.min(yearsInHome * 12, r.termYears * 12)).reduce((a, b) => a + b, 0) + escrowsMonthly * 12 * yearsInHome
                    : r.monthly.totalPITI * 12 * yearsInHome;
                  return (
                    <div key={i} style={{ width: cardWidth, backgroundColor: c.bg, borderRadius: "6px", padding: "12px 14px", color: c.text, border: `1px solid ${c.border}`, boxSizing: "border-box" as const, textAlign: "center" as const }}>
                      <p style={{ fontSize: "7pt", fontWeight: "bold", color: c.accent, textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 3px 0" }}>
                        Option {i + 1}
                      </p>
                      <p style={{ fontSize: "9pt", fontWeight: "bold", color: c.text, margin: "0 0 2px 0" }}>
                        {armLabel}{r.termYears}-Yr {loanLabel}
                      </p>
                      <p style={{ fontSize: "8pt", color: c.accent, margin: "0 0 8px 0" }}>{r.rate.toFixed(3)}%{r.isARM ? " initial" : ""}</p>
                      <p style={{ fontSize: "7pt", color: c.subtext, margin: "0 0 2px 0" }}>Total Payments ({yearsInHome} yrs)</p>
                      <p style={{ fontSize: "14pt", fontWeight: "bold", color: c.accent, margin: "0 0 4px 0" }}>{fmt(totalPaid)}</p>
                      <p style={{ fontSize: "6.5pt", color: c.subtext, margin: 0 }}>
                        {r.isARM ? `Historical-avg ARM path × ${yearsInHome * 12} payments` : `${fmtExact(r.monthly.totalPITI)}/mo × ${yearsInHome * 12} payments`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ─── SECTION C: Equity Composition Bar Chart ─────────────────────── */}
        {(() => {
          const snapshots = results.map((r) => {
            const homeValue = r.purchasePrice * Math.pow(1.03, yearsInHome);
            // Use the amortization schedule (reflects ARM historical path when applicable)
            const row = r.amortization[Math.min(yearsInHome, r.amortization.length) - 1];
            const balance = row ? row.endBalance : 0;
            const equityFromPayments = r.totalLoanAmount - balance;
            const equityFromAppreciation = homeValue - r.purchasePrice;
            return { equityFromPayments, equityFromAppreciation, total: equityFromPayments + equityFromAppreciation };
          });
          const maxTotal = Math.max(...snapshots.map(s => s.total), 1);
          const CARD_COLORS_P2 = [
            { bg: "#0C2340", accent: "#C9A84C" },
            { bg: "#0E4F5C", accent: "#C9A84C" },
            { bg: "#1A3A1A", accent: "#C9A84C" },
          ];
          return (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#0C2340", margin: "0 0 8px 0", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                C. Equity Composition at Year {yearsInHome}
              </h2>
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "12px", height: "12px", backgroundColor: "#0C2340", borderRadius: "2px" }} />
                  <span style={{ fontSize: "7pt", color: "#555" }}>Principal Paid Down</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "12px", height: "12px", backgroundColor: "#C9A84C", borderRadius: "2px" }} />
                  <span style={{ fontSize: "7pt", color: "#555" }}>Appreciation</span>
                </div>
              </div>
              {/* Bars */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "8px" }}>
                {results.map((r, i) => {
                  const s = snapshots[i];
                  const c = CARD_COLORS_P2[i % CARD_COLORS_P2.length];
                  const loanLabel = scenarios[i]?.isInvestment && r.loanType === "conventional" ? "Conventional-Investor" : LOAN_TYPE_LABELS[r.loanType];
                  const totalBarPct = (s.total / maxTotal) * 100;
                  const payPct = s.total > 0 ? (s.equityFromPayments / s.total) * 100 : 50;
                  const appPct = 100 - payPct;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "140px", flexShrink: 0, fontSize: "7pt", color: "#0C2340", fontWeight: "bold" }}>
                        {r.termYears}-Yr {loanLabel}
                      </div>
                      <div style={{ flex: 1, backgroundColor: "#f1f5f9", borderRadius: "3px", height: "20px", overflow: "hidden" }}>
                        <div style={{ width: `${totalBarPct}%`, height: "100%", display: "flex" }}>
                          <div style={{ width: `${payPct}%`, backgroundColor: c.bg, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {payPct > 15 && <span style={{ fontSize: "6.5pt", color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" as const }}>{fmt(s.equityFromPayments)}</span>}
                          </div>
                          <div style={{ width: `${appPct}%`, backgroundColor: c.accent, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {appPct > 15 && <span style={{ fontSize: "6.5pt", color: "#0C2340", fontWeight: "bold", whiteSpace: "nowrap" as const }}>{fmt(s.equityFromAppreciation)}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "70px", flexShrink: 0, textAlign: "right" as const, fontSize: "8pt", fontWeight: "bold", color: "#059669" }}>
                        {fmt(s.total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Page 2 Disclaimer */}
        <div style={{ marginTop: "10px", padding: "6px 8px", border: "1px solid #ccc", borderRadius: "3px", fontSize: "7pt", color: "#666" }}>
          <p style={{ margin: "0 0 3px 0", fontWeight: "bold" }}>Assumptions & Disclaimer</p>
          <p style={{ margin: 0 }}>
            Appreciation rate of 3% annually is a conservative estimate and is not guaranteed. Actual home values may vary.
            These calculations are estimates for educational purposes only. Not a commitment to lend.
            Contact {LENDER.name} (NMLS #{LENDER.nmls}) at {LENDER.phone} or {LENDER.email} for a personalized quote.
            {LENDER.company} NMLS #{LENDER.companyNmls}. Equal Housing Lender.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LoanCompare() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const dataParam = params.get("d") || params.get("data"); // support both ?d= (new compact) and ?data= (legacy)

  // Initialize from URL or defaults
  const [scenarios, setScenarios] = useState<ScenarioStrings[]>(() => {
    if (dataParam) {
      const decoded = deserializeScenarios(dataParam);
      if (decoded) return decoded.scenarios;
    }
    return [
      toStrings(defaultScenario("30-Year VA", 0)),
      toStrings(defaultScenario("Conventional", 1)),
    ];
  });

  const [yearsInHome, setYearsInHome] = useState(() => {
    if (dataParam) {
      const decoded = deserializeScenarios(dataParam);
      if (decoded) return decoded.yearsInHome;
    }
    return 8;
  });

  const [copied, setCopied] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [comparableRent, setComparableRent] = useState(""); // manual override for comparable rent
  const [includeRentInPdf, setIncludeRentInPdf] = useState(true); // checkbox to include rent vs own in PDF

  // Calculate results
  const results = useMemo(() => {
    return scenarios.map((s) => calculateScenario(toInput(s)));
  }, [scenarios]);

  // Winners
  const winners = useMemo(() => {
    let payment = 0, cash = 0, equity = 0;
    results.forEach((r, i) => {
      if (r.monthly.totalPITI < results[payment].monthly.totalPITI) payment = i;
      if (r.cashToClose < results[cash].cashToClose) cash = i;
      // Equity gained = appreciation + principal paydown at yearsInHome
      const getEquity = (res: typeof r) => {
        const row = res.amortization[yearsInHome - 1] || res.amortization[res.amortization.length - 1];
        const principal = res.totalLoanAmount - (row?.endBalance ?? res.totalLoanAmount);
        return res.purchasePrice * (Math.pow(1.045, yearsInHome) - 1) + principal;
      };
      if (getEquity(r) > getEquity(results[equity])) equity = i;
    });
    return { payment, cash, equity };
  }, [results, yearsInHome]);

  const updateScenario = useCallback((index: number, s: ScenarioStrings) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[index] = s;
      return next;
    });
  }, []);

  const removeScenario = useCallback((index: number) => {
    setScenarios((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addScenario = useCallback(() => {
    if (scenarios.length >= 3) return;
    const labels = ["30-Year VA", "Conventional", "FHA"];
    setScenarios((prev) => [...prev, toStrings(defaultScenario(labels[prev.length] || `Scenario ${prev.length + 1}`, prev.length))]);
  }, [scenarios.length]);

  const createShortUrlMutation = trpc.shortUrl.create.useMutation();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const generateLink = useCallback(async () => {
    const encoded = serializeScenarios(scenarios, yearsInHome);
    setIsGeneratingLink(true);
    try {
      const result = await createShortUrlMutation.mutateAsync({ data: encoded });
      const url = `${window.location.origin}/s/${result.code}`;
      setShareUrl(url);
      setLinkGenerated(true);
    } catch {
      // Fallback to direct URL if API fails
      const url = `${window.location.origin}/loan-compare?d=${encoded}`;
      setShareUrl(url);
      setLinkGenerated(true);
    } finally {
      setIsGeneratingLink(false);
    }
  }, [scenarios, yearsInHome, createShortUrlMutation]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  return (
    <Layout>
      <SEO
        title="Loan Comparison Calculator — Compare VA, FHA & Conventional | RealityCents"
        description="Compare loan scenarios side by side. See monthly payments, closing costs, APR, and total cost over time for VA, FHA, and conventional loans. Shareable links for your clients."
        keywords="loan comparison calculator, VA loan vs conventional, FHA vs VA loan, mortgage comparison Hawaii, loan estimate comparison"
        url="https://realitycents.com/loan-compare"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-slate-900 to-navy text-white pt-28 pb-12 lg:pt-36 lg:pb-16 relative overflow-hidden no-print-page">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 bg-teal rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-teal mb-3">Loan Comparison Tool</span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              Compare Your Loan Options Side by Side
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              See the real difference between loan scenarios — monthly payment, closing costs, cash to close, and total cost over time. Adjust the numbers, then share a link with your lender or agent.
            </p>
          </div>
        </div>
      </section>

      {/* Main Calculator Area */}
      <section className="bg-slate-900 py-10 no-print-page">
        <div className="container">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              {scenarios.length < 3 && (
                <button
                  onClick={addScenario}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <Plus size={16} />
                  Add Scenario
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateLink}
                disabled={isGeneratingLink}
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <Link2 size={16} />
                {isGeneratingLink ? "Generating..." : "Share Link"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>

          {/* Share URL bar */}
          {linkGenerated && (
            <div className="mb-8 p-4 bg-slate-800 border border-teal/30 rounded-lg flex items-center gap-3">
              <Link2 size={18} className="text-teal flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-slate-300 text-sm outline-none truncate"
              />
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 bg-teal hover:bg-teal-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex-shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Scenario Inputs */}
          <div className={`grid gap-6 mb-10 ${scenarios.length === 3 ? "lg:grid-cols-3" : scenarios.length === 2 ? "lg:grid-cols-2" : ""}`}>
            {scenarios.map((s, i) => (
              <ScenarioPanel
                key={i}
                scenario={s}
                index={i}
                onChange={(updated) => updateScenario(i, updated)}
                onRemove={() => removeScenario(i)}
                canRemove={scenarios.length > 1}
              />
            ))}
          </div>

          {/* Time Horizon Slider */}
          <div className="mb-8 p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Time Horizon: {yearsInHome} years</label>
              <span className="text-xs text-slate-500">Adjusts equity &amp; cost comparison</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={yearsInHome}
              onChange={(e) => setYearsInHome(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 yr</span>
              <span>5 yr</span>
              <span>10 yr</span>
              <span>15 yr</span>
              <span>20 yr</span>
              <span>25 yr</span>
              <span>30 yr</span>
            </div>
          </div>

          {/* Winner Cards */}
          {results.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                <Trophy size={20} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Lowest Monthly Payment</p>
                <p className="text-lg font-bold text-emerald-400">{fmtExact(results[winners.payment].monthly.totalPITI)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {results[winners.payment].isARM ? "ARM " : ""}{LOAN_TYPE_LABELS[results[winners.payment].loanType]} at {results[winners.payment].rate.toFixed(3)}%{results[winners.payment].isARM ? " (initial)" : ""}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <DollarSign size={20} className="text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Lowest Cash to Close</p>
                <p className="text-lg font-bold text-blue-400">{fmt(results[winners.cash].cashToClose)}</p>
                <p className="text-xs text-slate-500 mt-1">{LOAN_TYPE_LABELS[results[winners.cash].loanType]} at {results[winners.cash].rate.toFixed(3)}%</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <TrendingUp size={20} className="text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Most {yearsInHome}-Year Equity</p>
                {(() => {
                  const r = results[winners.equity];
                  const row = r.amortization[yearsInHome - 1] || r.amortization[r.amortization.length - 1];
                  const principal = r.totalLoanAmount - (row?.endBalance ?? r.totalLoanAmount);
                  const equity = r.purchasePrice * (Math.pow(1.045, yearsInHome) - 1) + principal;
                  return (
                    <>
                      <p className="text-lg font-bold text-purple-400">{fmt(equity)}</p>
                      <p className="text-xs text-slate-500 mt-1">{LOAN_TYPE_LABELS[r.loanType]} at {r.rate.toFixed(3)}%</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Comparable Rent Override (standard mode) OR Cash Flow Preview (investment mode) */}
          {scenarios.some((s) => s.isInvestment) ? (
            <div className="mb-8 p-6 bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Investment Cash Flow Analysis</h3>
                  <p className="text-xs text-slate-400">Projected rental income vs. expenses over {yearsInHome} years</p>
                </div>
              </div>
              <div className="space-y-4">
                {scenarios.map((s, idx) => {
                  if (!s.isInvestment || !num(s.expectedRent)) return null;
                  const r = results[idx];
                  const rentIncrease = num(s.annualRentIncrease) / 100;
                  const colors = ["text-teal", "text-gold", "text-rose-400"];
                  // Calculate year-by-year cash flow
                  const milestoneYrs = [1, 3, 5, 7, 10, 15, 20].filter((yr) => yr <= yearsInHome);
                  if (!milestoneYrs.includes(yearsInHome)) milestoneYrs.push(yearsInHome);
                  milestoneYrs.sort((a, b) => a - b);
                  return (
                    <div key={idx} className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                      <p className={`text-sm font-medium ${colors[idx]} mb-3`}>
                        {r.termYears}-Year {LOAN_TYPE_LABELS[r.loanType]} @ {r.rate.toFixed(3)}%
                        {s.docType === "dscr" && " (DSCR)"}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left py-1.5 px-2 text-slate-400">Year</th>
                              <th className="text-right py-1.5 px-2 text-slate-400">Rent/mo</th>
                              <th className="text-right py-1.5 px-2 text-slate-400">PITI+HOA/mo</th>
                              <th className="text-right py-1.5 px-2 text-slate-400">Net/mo</th>
                              <th className="text-right py-1.5 px-2 text-slate-400">Annual Cash Flow</th>
                              <th className="text-right py-1.5 px-2 text-slate-400">Cumulative</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let cumulative = 0;
                              return milestoneYrs.map((yr) => {
                                const rentAtYear = num(s.expectedRent) * Math.pow(1 + rentIncrease, yr - 1);
                                const hoaAtYear = r.monthly.hoa * Math.pow(1.04, yr - 1);
                                const expense = r.monthly.principalInterest + r.monthly.propertyTax + r.monthly.insurance + hoaAtYear + r.monthly.mortgageInsurance;
                                const netMonthly = rentAtYear - expense;
                                // Approximate cumulative by summing each year
                                const prevYr = milestoneYrs[milestoneYrs.indexOf(yr) - 1] || 0;
                                for (let y = prevYr + 1; y <= yr; y++) {
                                  const rent = num(s.expectedRent) * Math.pow(1 + rentIncrease, y - 1);
                                  const hoa = r.monthly.hoa * Math.pow(1.04, y - 1);
                                  const exp = r.monthly.principalInterest + r.monthly.propertyTax + r.monthly.insurance + hoa + r.monthly.mortgageInsurance;
                                  cumulative += (rent - exp) * 12;
                                }
                                return (
                                  <tr key={yr} className="border-b border-slate-700/50">
                                    <td className="py-1.5 px-2 text-slate-300">Yr {yr}</td>
                                    <td className="text-right py-1.5 px-2 text-slate-300">{fmtExact(rentAtYear)}</td>
                                    <td className="text-right py-1.5 px-2 text-slate-300">{fmtExact(expense)}</td>
                                    <td className={`text-right py-1.5 px-2 font-medium ${netMonthly >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                      {netMonthly >= 0 ? "+" : ""}{fmtExact(netMonthly)}
                                    </td>
                                    <td className={`text-right py-1.5 px-2 ${netMonthly >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                      {netMonthly >= 0 ? "+" : ""}{fmt(netMonthly * 12)}
                                    </td>
                                    <td className={`text-right py-1.5 px-2 font-medium ${cumulative >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                      {cumulative >= 0 ? "+" : ""}{fmt(cumulative)}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-300">Comparable Rent <span className="text-slate-500 font-normal">(for Own vs. Rent analysis)</span></label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeRentInPdf}
                      onChange={(e) => setIncludeRentInPdf(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-500 text-teal-500 focus:ring-teal-500/30"
                    />
                    <span className="text-xs text-slate-400">Include in PDF</span>
                  </label>
                </div>
                <span className="text-xs text-slate-500">Default: 0.45% of purchase price/mo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-700/50 border border-slate-600/50 rounded-lg overflow-hidden flex-1 max-w-xs">
                  <span className="pl-3 text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={comparableRent}
                    onChange={(e) => setComparableRent(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder={results[0] ? String(Math.round(results[0].purchasePrice * 0.0045)) : "3375"}
                    className="w-full bg-transparent text-white text-sm px-3 py-2 outline-none"
                  />
                  <span className="pr-3 text-slate-400 text-xs">/mo</span>
                </div>
                {comparableRent && (
                  <button onClick={() => setComparableRent("")} className="text-xs text-slate-400 hover:text-white transition">Reset to default</button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Leave blank to use default (0.45% × purchase price). Override if you know the comparable rent for this area.</p>
            </div>
          )}

          {/* Points Recovery Analysis — between comparable rent and Results */}
          {results.length > 1 && (() => {
            const sameType = results.every((r) => r.loanType === results[0].loanType);
            const sameTerm = results.every((r) => r.termYears === results[0].termYears);
            const sameLoan = results.every((r) => Math.abs(r.baseLoanAmount - results[0].baseLoanAmount) < 1);
            const sameRateStructure = results.every((r) => r.isARM === results[0].isARM);
            if (!sameType || !sameTerm || !sameLoan || !sameRateStructure) return null;
            const sorted = [...results].map((r, i) => ({ ...r, origIdx: i })).sort((a, b) => a.rate - b.rate);
            const pairs: { low: typeof sorted[0]; high: typeof sorted[0]; pointsCostDiff: number; monthlySavings: number; breakeven: number }[] = [];
            for (let i = 0; i < sorted.length; i++) {
              for (let j = i + 1; j < sorted.length; j++) {
                const low = sorted[i];
                const high = sorted[j];
                const lowUpfront = low.closingCosts.total + low.prepaids.total;
                const highUpfront = high.closingCosts.total + high.prepaids.total;
                const pointsCostDiff = lowUpfront - highUpfront;
                const monthlySavings = high.monthly.principalInterest - low.monthly.principalInterest;
                if (pointsCostDiff > 0 && monthlySavings > 0) {
                  pairs.push({ low, high, pointsCostDiff, monthlySavings, breakeven: Math.ceil(pointsCostDiff / monthlySavings) });
                }
              }
            }
            if (pairs.length === 0) return null;
            return (
              <div className="mb-8 p-6 bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Calculator size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Points Recovery Analysis</h3>
                    <p className="text-xs text-slate-400">How long until the lower rate pays for itself</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {pairs.map((pair, i) => (
                    <div key={i} className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-sm text-white font-medium">{pair.low.rate.toFixed(3)}% vs {pair.high.rate.toFixed(3)}%</p>
                          <p className="text-xs text-slate-400 mt-1">Extra upfront cost: {fmt(pair.pointsCostDiff)} · Monthly P&I savings: {fmtExact(pair.monthlySavings)}</p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-2xl font-bold text-amber-400">{pair.breakeven} months</p>
                          <p className="text-xs text-slate-400">({(pair.breakeven / 12).toFixed(1)} years) to break even</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-xs text-slate-500">After {pair.breakeven} months, the {pair.low.rate.toFixed(3)}% rate saves you {fmtExact(pair.monthlySavings)} every month. Over {yearsInHome} years, net savings = {fmt(pair.monthlySavings * (yearsInHome * 12) - pair.pointsCostDiff)}.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Results */}
          <h2 className="font-display text-2xl text-white mb-6">Results</h2>
          <div className={`grid gap-6 mb-10 ${scenarios.length === 3 ? "lg:grid-cols-3" : scenarios.length === 2 ? "lg:grid-cols-2" : ""}`}>
            {results.map((r, i) => (
              <ResultCard key={i} result={r} index={i} yearsInHome={yearsInHome} winners={winners} scenario={scenarios[i]} />
            ))}
          </div>

          {/* Bottom Action Bar — duplicate of top buttons for convenience after scrolling */}
          <div className="flex items-center justify-end gap-3 mb-4">
            <button
              onClick={generateLink}
              disabled={isGeneratingLink}
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              <Link2 size={16} />
              {isGeneratingLink ? "Generating..." : "Share Link"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
          {/* Bottom Share URL bar — appears after clicking Share Link at the bottom */}
          {linkGenerated && (
            <div className="mb-8 p-4 bg-slate-800 border border-teal/30 rounded-lg flex items-center gap-3">
              <Link2 size={18} className="text-teal flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-slate-300 text-sm outline-none truncate"
              />
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 bg-teal hover:bg-teal-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex-shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Email Results */}
          <EmailResults
            calculator="loan-comparison"
            resultSummary={results.length > 0 ? results.map(r => `${r.label}${r.isARM && r.arm ? ` ${r.arm.fixedYears}-yr ARM` : ''} (${r.rate}%${r.isARM ? ' initial' : ''}): ${fmt(r.monthly.totalPITI)}/mo${r.isARM && r.arm ? ` (worst-case P&I ${fmt(r.arm.worstCase.maxPI)})` : ''}`).join(' | ') : undefined}
            scenarios={results.length > 0 ? results.map(r => ({
              label: r.label,
              loanType: r.loanType,
              rate: r.rate,
              termYears: r.termYears,
              monthlyPI: r.monthly.principalInterest,
              monthlyPITI: r.monthly.totalPITI,
              cashToClose: r.cashToClose,
              discountPoints: r.discountPoints,
              discountPointsCost: r.closingCosts.discountPointsCost,
              apr: r.apr,
              purchasePrice: r.purchasePrice,
              downPayment: r.downPayment,
              loanAmount: r.totalLoanAmount,
            })) : undefined}
            shareData={results.length > 0 ? serializeScenarios(scenarios, yearsInHome) : undefined}
          />

          {/* Disclaimer & Contact */}
          <div className="mt-12 space-y-8">
            <div className="flex items-start gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
              <Info size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                These calculations are estimates for educational purposes only. Not a commitment to lend. Actual rates, fees, and terms may vary based on your specific situation, credit profile, and market conditions.
              </p>
            </div>
            
            <ContactActions
              variant="compact"
              headline="Ready for a Real Quote?"
              subtext="Let’s look at your actual credit profile and market conditions to get a personalized quote."
              hideEmail
            />
          </div>
        </div>
      </section>

      {/* Print Layout */}
      <PrintLayout results={results} yearsInHome={yearsInHome} scenarios={scenarios} comparableRent={comparableRent} includeRentInPdf={includeRentInPdf} />
    </Layout>
  );
}
