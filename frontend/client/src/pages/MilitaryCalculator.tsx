/*
 * Pacific Modernism — Military Buying Power Calculator
 * Helps Hawaii-based military service members estimate their total qualifying
 * income and VA loan home purchase power using 2026 pay tables.
 * Includes Share Your Results: copy text, shareable URL, download image.
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useSearch } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import {
  type PayGrade,
  PAY_GRADE_OPTIONS,
  PAY_GRADE_LABELS,
  YOS_OPTIONS,
  DEPENDENTS_OPTIONS,
  calculateMilitaryIncome,
  estimatePurchasePower,
} from "@/lib/militaryPayData";
import {
  Shield,
  DollarSign,
  Home,
  Phone,
  FileCheck,
  Info,
  ChevronRight,
  TrendingUp,
  Users,
  Award,
  MapPin,
  Share2,
  Copy,
  Download,
  LinkIcon,
  Check,
  Calculator as CalcIcon,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";


const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/military-calculator-hero-TWFMScyJuU9vBfeWbD2r8g.webp";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── URL Parameter Helpers ───────────────────────────────────────────────────
function buildShareUrl(
  grade: PayGrade,
  yos: number,
  dep: number,
  hasDep: boolean,
  debts: number,
  rate: number,
  dti: number,
  tax: number,
  ins: number,
  hoa: number,
  dp: number
): string {
  const params = new URLSearchParams({
    grade,
    yos: String(yos),
    dep: String(dep),
    hasDep: hasDep ? "1" : "0",
    debts: String(debts),
    rate: String(rate),
    dti: String(dti),
    tax: String(tax),
    ins: String(ins),
    hoa: String(hoa),
    dp: String(dp),
  });
  return `${window.location.origin}/military-calculator?${params.toString()}`;
}

function parseSearchParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    grade: params.get("grade") as PayGrade | null,
    yos: params.get("yos"),
    dep: params.get("dep"),
    hasDep: params.get("hasDep"),
    debts: params.get("debts"),
    rate: params.get("rate"),
    dti: params.get("dti"),
    tax: params.get("tax"),
    ins: params.get("ins"),
    hoa: params.get("hoa"),
    dp: params.get("dp"),
  };
}

// ─── Select Component ────────────────────────────────────────────────────────
function SelectField({
  label,
  value,
  onChange,
  options,
  helpText,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  helpText?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-body font-medium text-navy mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
}

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
      <label className="block text-sm font-body font-medium text-navy mb-1.5">
        {label}
      </label>
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

// ─── Income Breakdown Row ────────────────────────────────────────────────────
function IncomeRow({
  label,
  value,
  note,
  accent,
  bold,
}: {
  label: string;
  value: number;
  note?: string;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        bold ? "border-t-2 border-navy/20 pt-3" : "border-t border-border/60"
      }`}
    >
      <div>
        <span
          className={`text-sm ${
            bold
              ? "font-display font-semibold text-navy"
              : "font-body text-navy/80"
          }`}
        >
          {label}
        </span>
        {note && (
          <span className="block text-xs text-muted-foreground">{note}</span>
        )}
      </div>
      <span
        className={`text-sm font-mono tabular-nums ${
          accent
            ? "text-teal font-semibold text-base"
            : bold
            ? "font-display font-bold text-navy text-base"
            : "text-navy"
        }`}
      >
        {fmt(value)}
        {!bold && <span className="text-muted-foreground text-xs">/mo</span>}
      </span>
    </div>
  );
}

export default function MilitaryCalculator() {
  // ─── URL parameter initialization ────────────────────────────────────────
  const search = useSearch();
  const parsed = useMemo(() => parseSearchParams(search), [search]);
  const isValidGrade = (g: string | null): g is PayGrade =>
    g !== null && PAY_GRADE_OPTIONS.includes(g as PayGrade);

  const [grade, setGrade] = useState<PayGrade>(
    isValidGrade(parsed.grade) ? parsed.grade : "E-5"
  );
  const [yos, setYos] = useState(
    parsed.yos !== null ? Number(parsed.yos) : 4
  );
  const [hasDependents, setHasDependents] = useState(
    parsed.hasDep !== null ? parsed.hasDep === "1" : true
  );
  const [numDependents, setNumDependents] = useState(
    parsed.dep !== null ? Number(parsed.dep) : 1
  );
  const [monthlyDebts, setMonthlyDebts] = useState(
    parsed.debts !== null ? Number(parsed.debts) : 200
  );
  const [interestRate, setInterestRate] = useState(
    parsed.rate !== null ? Number(parsed.rate) : 5.75
  );
  const [maxDTI, setMaxDTI] = useState(
    parsed.dti !== null ? Number(parsed.dti) : 55
  );
  const [monthlyPropertyTax, setMonthlyPropertyTax] = useState(
    parsed.tax !== null ? Number(parsed.tax) : 250
  );
  const [monthlyInsurance, setMonthlyInsurance] = useState(
    parsed.ins !== null ? Number(parsed.ins) : 150
  );
  const [monthlyHOA, setMonthlyHOA] = useState(
    parsed.hoa !== null ? Number(parsed.hoa) : 0
  );
  const [downPayment, setDownPayment] = useState(
    parsed.dp !== null ? Number(parsed.dp) : 0
  );

  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const income = useMemo(
    () => calculateMilitaryIncome(grade, yos, hasDependents, numDependents),
    [grade, yos, hasDependents, numDependents]
  );

  const purchasePower = useMemo(
    () =>
      estimatePurchasePower(
        income.totalMonthlyIncome,
        monthlyDebts,
        interestRate,
        maxDTI,
        monthlyPropertyTax,
        monthlyInsurance,
        monthlyHOA,
        downPayment
      ),
    [income.totalMonthlyIncome, monthlyDebts, interestRate, maxDTI, monthlyPropertyTax, monthlyInsurance, monthlyHOA, downPayment]
  );

  const gradeOptions = PAY_GRADE_OPTIONS.map((g) => ({
    value: g,
    label: PAY_GRADE_LABELS[g],
  }));

  // ─── Share: Build text summary ───────────────────────────────────────────
  const buildTextSummary = useCallback(() => {
    const depStatus = hasDependents
      ? `With ${numDependents} dependent${numDependents !== 1 ? "s" : ""}`
      : "Without dependents";
    const gradeLabel = PAY_GRADE_LABELS[grade];
    const lines = [
      `Military Buying Power — RealityCents.com`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `Profile: ${gradeLabel}, ${yos} years of service, ${depStatus}`,
      `Location: Honolulu County, Hawaii (MHA HI408)`,
      ``,
      `MONTHLY INCOME BREAKDOWN`,
      `  Base Pay:       ${fmt(income.basePay)}`,
      `  BAH (Honolulu): ${fmt(income.bah)}`,
      `  BAS:            ${fmt(income.bas)}`,
      `  COLA (Oahu):    ${fmt(income.cola)}`,
      `  ─────────────────────────`,
      `  Total Income:   ${fmt(income.totalMonthlyIncome)}/mo`,
      `  Annual Income:  ${fmt(income.totalMonthlyIncome * 12)}`,
      ``,
      `VA LOAN PURCHASE POWER`,
      `  Est. Purchase Price: ${fmt(purchasePower.maxPurchasePrice)}`,
      `  Est. Monthly PITIA:  ${fmt(purchasePower.estimatedMonthlyPITI)}`,
      `    P&I:               ${fmt(purchasePower.monthlyPI)}`,
      `    Property Tax:       ${fmt(purchasePower.monthlyPropertyTax)}`,
      `    Insurance:          ${fmt(purchasePower.monthlyInsurance)}`,
      `    HOA:                ${fmt(purchasePower.monthlyHOA)}`,
      `  Interest Rate:       ${purchasePower.interestRate}%`,
      `  Down Payment:        ${downPayment > 0 ? fmt(downPayment) : "$0"} (VA loan)`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Estimates based on 2026 published rates.`,
      `Get pre-approved: ${PRE_APPROVAL_URL}`,
      `Calculator: realitycents.com/military-calculator`,
    ];
    return lines.join("\n");
  }, [grade, yos, hasDependents, numDependents, income, purchasePower]);

  // ─── Share: Copy text to clipboard ───────────────────────────────────────
  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildTextSummary());
      setCopiedText(true);
      toast.success("Results copied to clipboard");
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      toast.error("Failed to copy — try again");
    }
  }, [buildTextSummary]);

  // ─── Share: Copy link to clipboard ───────────────────────────────────────
  const handleCopyLink = useCallback(async () => {
    const url = buildShareUrl(
      grade,
      yos,
      numDependents,
      hasDependents,
      monthlyDebts,
      interestRate,
      maxDTI,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyHOA,
      downPayment
    );
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Shareable link copied");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link — try again");
    }
  }, [grade, yos, numDependents, hasDependents, monthlyDebts, interestRate, maxDTI, monthlyPropertyTax, monthlyInsurance, monthlyHOA, downPayment]);

  // ─── Share: Download results as image (Canvas API) ──────────────────────
  const handleDownloadImage = useCallback(async () => {
    setDownloading(true);
    try {
      const depStatus = hasDependents
        ? `With ${numDependents} dependent${numDependents !== 1 ? "s" : ""}`
        : "Without dependents";
      const gradeLabel = PAY_GRADE_LABELS[grade];

      const W = 800;
      // Height is calculated dynamically after drawing content
      const dpr = 2;
      const pitiaRowCount = purchasePower.monthlyHOA > 0 ? 4 : 3;
      // Calculate content height: header(96) + income(130→~310) + purchase(~200) + footer(60) + padding
      const H = 96 + 34 + (4 * 28) + 48 + 48 + 36 + 24 + 40 + (pitiaRowCount * 26) + 26 + 60 + 40;
      const canvas = document.createElement("canvas");
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);

      // Accent bar
      ctx.fillStyle = "#14b8a6";
      ctx.fillRect(0, 0, W, 6);

      // Header
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
      ctx.fillText("Military Buying Power", 40, 52);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${gradeLabel}  •  ${yos} YOS  •  ${depStatus}  •  Honolulu County`, 40, 78);

      // Divider
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 96);
      ctx.lineTo(W - 40, 96);
      ctx.stroke();

      // Income section
      let y = 130;
      ctx.fillStyle = "#14b8a6";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText("MONTHLY INCOME BREAKDOWN", 40, y);
      y += 32;

      const incomeRows: [string, string][] = [
        ["Base Pay", fmt(income.basePay)],
        ["BAH (Honolulu)", fmt(income.bah)],
        ["BAS", fmt(income.bas)],
        ["COLA (Oahu)", fmt(income.cola)],
      ];
      ctx.font = "15px system-ui, -apple-system, sans-serif";
      for (const [label, value] of incomeRows) {
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(label, 56, y);
        ctx.fillStyle = "#f1f5f9";
        ctx.textAlign = "right";
        ctx.fillText(value + "/mo", W - 56, y);
        ctx.textAlign = "left";
        y += 28;
      }

      // Total line
      y += 4;
      ctx.strokeStyle = "#475569";
      ctx.beginPath();
      ctx.moveTo(56, y);
      ctx.lineTo(W - 56, y);
      ctx.stroke();
      y += 24;
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
      ctx.fillText("Total Qualifying Income", 56, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "#14b8a6";
      ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(fmt(income.totalMonthlyIncome) + "/mo", W - 56, y);
      ctx.textAlign = "left";
      y += 20;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Annual: ${fmt(income.totalMonthlyIncome * 12)}`, W - 56, y);
      ctx.textAlign = "left";

      // Purchase Power section
      y += 48;
      ctx.fillStyle = "#14b8a6";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText("VA LOAN PURCHASE POWER", 40, y);
      y += 36;

      // Big price
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
      ctx.fillText(fmt(purchasePower.maxPurchasePrice), 56, y);
      y += 24;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `at ${purchasePower.interestRate}% with ${maxDTI}% DTI  •  ${downPayment > 0 ? fmt(downPayment) : "$0"} down`,
        56,
        y
      );

      // PITIA breakdown
      y += 40;
      const pitiaRows: [string, string][] = [
        ["Principal & Interest", fmt(purchasePower.monthlyPI)],
        ["Property Taxes", fmt(purchasePower.monthlyPropertyTax)],
        ["Insurance", fmt(purchasePower.monthlyInsurance)],
      ];
      if (purchasePower.monthlyHOA > 0) {
        pitiaRows.push(["HOA", fmt(purchasePower.monthlyHOA)]);
      }
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      for (const [label, value] of pitiaRows) {
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(label, 56, y);
        ctx.fillStyle = "#f1f5f9";
        ctx.textAlign = "right";
        ctx.fillText(value, W - 56, y);
        ctx.textAlign = "left";
        y += 26;
      }
      y += 4;
      ctx.strokeStyle = "#475569";
      ctx.beginPath();
      ctx.moveTo(56, y);
      ctx.lineTo(W - 56, y);
      ctx.stroke();
      y += 22;
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText("Total PITIA", 56, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "#14b8a6";
      ctx.font = "bold 17px system-ui, -apple-system, sans-serif";
      ctx.fillText(fmt(purchasePower.estimatedMonthlyPITI), W - 56, y);
      ctx.textAlign = "left";

      // Footer
      y += 40;
      ctx.strokeStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 40, y);
      ctx.stroke();
      y += 22;
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText("realitycents.com/military-calculator  —  2026 estimates", 40, y);
      ctx.textAlign = "right";
      ctx.fillText("Jay Miller | CMG Home Loans | NMLS #657301", W - 40, y);
      ctx.textAlign = "left";

      // Download — use Blob URL for better iOS Safari compatibility
      const filename = `military-buying-power-${grade}-${yos}yos.png`;
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Image generation failed");
          setDownloading(false);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        // Small delay before cleanup so iOS has time to initiate the download
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 500);
        toast.success("Image downloaded");
        setDownloading(false);
      }, "image/png");
      // Return early — setDownloading(false) is handled in the toBlob callback
      return;
    } catch (err) {
      console.error("Canvas image error:", err);
      toast.error("Image download failed — text copied to clipboard instead");
      try {
        await navigator.clipboard.writeText(buildTextSummary());
      } catch {}
    } finally {
      setDownloading(false);
    }
  }, [grade, yos, hasDependents, numDependents, income, purchasePower, maxDTI, downPayment, buildTextSummary]);

  return (
    <Layout>
      <SEO
        title="Military Buying Power Calculator — Hawaii VA Loan Home Purchase Estimator"
        description="Estimate your total qualifying income and home purchase power as a Hawaii-based military service member. Uses 2026 base pay, BAH (Honolulu), BAS, and COLA rates with VA loan qualification."
        url="/military-calculator"
        keywords="military buying power calculator Hawaii, VA loan calculator, military home buying Hawaii, BAH Honolulu, military income calculator, VA loan purchase price estimator"
      />
      <PageHero
        title="Military Buying Power Calculator"
        subtitle="Estimate your total qualifying income and VA loan home purchase power using 2026 military pay tables for Honolulu County."
        image={HERO_IMAGE}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          {/* Intro */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-base font-body text-navy/70 leading-relaxed">
              This calculator uses official 2026 military pay data to estimate
              your total qualifying income and maximum VA loan purchase price for
              Honolulu County, Hawaii. Select your pay grade, years of service,
              and dependency status to see your full income breakdown including
              Base Pay, BAH, BAS, and COLA.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* ─── Inputs Panel ─────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 space-y-6">
                {/* Service Profile */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal" />
                    Service Profile
                  </h3>
                  <div className="space-y-3">
                    <SelectField
                      label="Pay Grade"
                      value={grade}
                      onChange={(v) => setGrade(v as PayGrade)}
                      options={gradeOptions}
                    />
                    <SelectField
                      label="Years of Service"
                      value={yos}
                      onChange={(v) => setYos(Number(v))}
                      options={YOS_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                    />

                    {/* Dependents Toggle */}
                    <div>
                      <label className="block text-sm font-body font-medium text-navy mb-1.5">
                        Dependency Status
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setHasDependents(true);
                            if (numDependents === 0) setNumDependents(1);
                          }}
                          className={`flex-1 py-2 px-3 rounded-md text-sm font-body font-medium border transition-all ${
                            hasDependents
                              ? "bg-teal text-white border-teal shadow-sm"
                              : "bg-white text-navy/60 border-border hover:border-teal/40"
                          }`}
                        >
                          With Dependents
                        </button>
                        <button
                          onClick={() => {
                            setHasDependents(false);
                            setNumDependents(0);
                          }}
                          className={`flex-1 py-2 px-3 rounded-md text-sm font-body font-medium border transition-all ${
                            !hasDependents
                              ? "bg-teal text-white border-teal shadow-sm"
                              : "bg-white text-navy/60 border-border hover:border-teal/40"
                          }`}
                        >
                          Without
                        </button>
                      </div>
                    </div>

                    {hasDependents && (
                      <SelectField
                        label="Number of Dependents"
                        value={numDependents}
                        onChange={(v) => setNumDependents(Number(v))}
                        options={DEPENDENTS_OPTIONS.filter(
                          (o) => o.value > 0
                        ).map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                        helpText="Spouse and/or children"
                      />
                    )}
                  </div>
                </div>

                {/* Loan Parameters */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
                    <Home className="w-4 h-4 text-teal" />
                    VA Loan Parameters
                  </h3>
                  <div className="space-y-3">
                    <InputField
                      label="Monthly Debts"
                      value={monthlyDebts}
                      onChange={setMonthlyDebts}
                      prefix="$"
                      suffix="/mo"
                      step={50}
                      min={0}
                      helpText="Car loans, student loans, credit cards, etc."
                    />
                    <InputField
                      label="Interest Rate"
                      value={interestRate}
                      onChange={setInterestRate}
                      suffix="%"
                      step={0.125}
                      min={2}
                      max={12}
                      helpText="Current VA rates are typically 5.5%–6.5%"
                    />
                    <InputField
                      label="DTI Ratio"
                      value={maxDTI}
                      onChange={setMaxDTI}
                      suffix="%"
                      step={1}
                      min={30}
                      max={65}
                      helpText="VA has no hard cap — 60% or more with strong residual income and excellent credit"
                    />
                  </div>

                  {/* PITIA Monthly Costs */}
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Housing Costs (PITIA)</p>
                    <div className="space-y-3">
                      <InputField
                        label="Property Taxes"
                        value={monthlyPropertyTax}
                        onChange={setMonthlyPropertyTax}
                        prefix="$"
                        suffix="/mo"
                        step={25}
                        min={0}
                        helpText="Hawaii avg ~0.35% effective rate (~$350/mo on $1.2M)"
                      />
                      <InputField
                        label="Homeowner's Insurance"
                        value={monthlyInsurance}
                        onChange={setMonthlyInsurance}
                        prefix="$"
                        suffix="/mo"
                        step={25}
                        min={0}
                        helpText="Hawaii avg $150–$250/mo depending on coverage"
                      />
                      <InputField
                        label="HOA Dues"
                        value={monthlyHOA}
                        onChange={setMonthlyHOA}
                        prefix="$"
                        suffix="/mo"
                        step={25}
                        min={0}
                        helpText="$0 for single-family, $500–$1,000+ for condos"
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Available Down Payment</p>
                    <InputField
                      label="Down Payment"
                      value={downPayment}
                      onChange={setDownPayment}
                      prefix="$"
                      step={5000}
                      min={0}
                      helpText="VA allows $0 down — adding funds increases your max purchase price"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Results Panel ────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Capturable results area for html2canvas */}
              <div ref={resultsRef} className="space-y-6">
                {/* Income Breakdown Card */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="bg-navy/5 px-6 py-4 border-b border-border">
                    <h3 className="font-display text-lg text-navy flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-teal" />
                      Monthly Income Breakdown
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      2026 rates for Honolulu County (MHA HI408)
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    <IncomeRow
                      label="Base Pay"
                      value={income.basePay}
                      note={`${grade}, ${
                        yos === 0 ? "<2" : yos + ""
                      } years of service`}
                    />
                    <IncomeRow
                      label="BAH (Honolulu)"
                      value={income.bah}
                      note={
                        hasDependents ? "With dependents" : "Without dependents"
                      }
                    />
                    <IncomeRow
                      label="BAS"
                      value={income.bas}
                      note={
                        grade.startsWith("E-")
                          ? "Enlisted rate"
                          : "Officer rate"
                      }
                    />
                    <IncomeRow
                      label="COLA (Oahu)"
                      value={income.cola}
                      note={`Index 120, ${numDependents} dependent${
                        numDependents !== 1 ? "s" : ""
                      } — estimate, verify at travel.dod.mil`}
                    />
                    <IncomeRow
                      label="Total Qualifying Income"
                      value={income.totalMonthlyIncome}
                      bold
                    />
                  </div>

                  {/* Annual summary */}
                  <div className="bg-sand/30 px-6 py-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-body text-navy/60">
                      Annual qualifying income
                    </span>
                    <span className="text-sm font-mono font-semibold text-navy tabular-nums">
                      {fmt(income.totalMonthlyIncome * 12)}
                    </span>
                  </div>
                </div>

                {/* Purchase Power Card */}
                <div className="bg-card rounded-xl border-2 border-teal/30 overflow-hidden">
                  <div className="bg-teal/5 px-6 py-4 border-b border-teal/20">
                    <h3 className="font-display text-lg text-navy flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal" />
                      Estimated VA Loan Purchase Power
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {downPayment > 0 ? fmt(downPayment) : "$0"} down payment, 30-year fixed, 2.15% VA funding fee
                    </p>
                  </div>
                  <div className="px-6 py-6">
                    <div className="text-center mb-6">
                      <p className="text-xs font-body uppercase tracking-wider text-navy/50 mb-1">
                        Maximum Purchase Price
                      </p>
                      <p className="text-4xl lg:text-5xl font-display font-bold text-teal tabular-nums">
                        {fmt(purchasePower.maxPurchasePrice)}
                      </p>
                      <p className="text-sm text-navy/60 mt-1">
                        at {purchasePower.interestRate}% with{" "}
                        {purchasePower.maxDTI}% DTI
                      </p>
                    </div>

                    {/* PITIA Breakdown */}
                    <div className="bg-sand/30 rounded-lg p-4 mb-4">
                      <p className="text-xs font-body font-semibold uppercase tracking-wider text-navy/50 mb-3">Monthly PITIA Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-body text-navy/70">Principal & Interest</span>
                          <span className="text-sm font-mono font-semibold text-navy tabular-nums">{fmt(purchasePower.monthlyPI)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-body text-navy/70">Property Taxes</span>
                          <span className="text-sm font-mono font-semibold text-navy tabular-nums">{fmt(purchasePower.monthlyPropertyTax)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-body text-navy/70">Insurance</span>
                          <span className="text-sm font-mono font-semibold text-navy tabular-nums">{fmt(purchasePower.monthlyInsurance)}</span>
                        </div>
                        {purchasePower.monthlyHOA > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-body text-navy/70">HOA Dues</span>
                            <span className="text-sm font-mono font-semibold text-navy tabular-nums">{fmt(purchasePower.monthlyHOA)}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-2 flex justify-between items-center">
                          <span className="text-sm font-body font-semibold text-navy">Total PITIA</span>
                          <span className="text-base font-mono font-bold text-teal tabular-nums">{fmt(purchasePower.estimatedMonthlyPITI)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-sand/40 rounded-lg p-3 text-center">
                        <p className="text-xs text-navy/50 font-body">
                          Monthly Debts
                        </p>
                        <p className="text-lg font-display font-semibold text-navy tabular-nums">
                          {fmt(monthlyDebts)}
                        </p>
                      </div>
                      <div className="bg-sand/40 rounded-lg p-3 text-center">
                        <p className="text-xs text-navy/50 font-body">
                          Housing Ratio
                        </p>
                        <p className="text-lg font-display font-semibold text-navy tabular-nums">
                          {income.totalMonthlyIncome > 0
                            ? (
                                (purchasePower.estimatedMonthlyPITI /
                                  income.totalMonthlyIncome) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </p>
                      </div>
                      <div className="bg-sand/40 rounded-lg p-3 text-center">
                        <p className="text-xs text-navy/50 font-body">
                          Down Payment
                        </p>
                        <p className="text-lg font-display font-semibold text-teal tabular-nums">
                          {downPayment > 0 ? fmt(downPayment) : "$0"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2026 Honolulu VA Loan Limits note */}
                  <div className="bg-teal/5 px-6 py-3 border-t border-teal/20">
                    <p className="text-xs text-navy/60 leading-relaxed">
                      <strong className="text-navy/80">
                        2026 Honolulu VA Loan Limits:
                      </strong>{" "}
                      1-unit $1,249,125 | 2-unit $1,599,650 | 3-unit $1,933,450
                      | 4-unit $2,403,050. Full entitlement = no loan limit cap.
                    </p>
                  </div>
                </div>

                {/* Branding watermark for downloaded image */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] text-navy/30 font-body">
                    realitycents.com/military-calculator — 2026 estimates
                  </p>
                  <p className="text-[10px] text-navy/30 font-body">
                    Jay Miller | CMG Home Loans | NMLS #657301
                  </p>
                </div>
              </div>

              {/* ─── Share Your Results ──────────────────────────────────── */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-sand/20 transition-colors"
                >
                  <h4 className="font-display text-base text-navy flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-teal" />
                    Share Your Results
                  </h4>
                  <ChevronRight
                    className={`w-4 h-4 text-navy/40 transition-transform duration-200 ${
                      shareOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {shareOpen && (
                  <div className="px-6 pb-5 border-t border-border pt-4">
                    <p className="text-xs text-navy/60 mb-4 font-body">
                      Share your income breakdown and purchase power estimate
                      with your spouse, realtor, or loan officer.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Copy Text */}
                      <button
                        onClick={handleCopyText}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-teal/40 hover:bg-teal/5 transition-all group text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 group-hover:bg-teal/20 transition-colors">
                          {copiedText ? (
                            <Check className="w-4 h-4 text-teal" />
                          ) : (
                            <Copy className="w-4 h-4 text-teal" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-display font-medium text-navy">
                            {copiedText ? "Copied!" : "Copy Text"}
                          </p>
                          <p className="text-[11px] text-navy/50 font-body leading-tight">
                            Paste into text or email
                          </p>
                        </div>
                      </button>

                      {/* Share Link */}
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-teal/40 hover:bg-teal/5 transition-all group text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 group-hover:bg-teal/20 transition-colors">
                          {copiedLink ? (
                            <Check className="w-4 h-4 text-teal" />
                          ) : (
                            <LinkIcon className="w-4 h-4 text-teal" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-display font-medium text-navy">
                            {copiedLink ? "Copied!" : "Share Link"}
                          </p>
                          <p className="text-[11px] text-navy/50 font-body leading-tight">
                            Opens same calculation
                          </p>
                        </div>
                      </button>

                      {/* Download Image */}
                      <button
                        onClick={handleDownloadImage}
                        disabled={downloading}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-teal/40 hover:bg-teal/5 transition-all group text-left disabled:opacity-60"
                      >
                        <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 group-hover:bg-teal/20 transition-colors">
                          <Download className="w-4 h-4 text-teal" />
                        </div>
                        <div>
                          <p className="text-sm font-display font-medium text-navy">
                            {downloading ? "Generating..." : "Save Image"}
                          </p>
                          <p className="text-[11px] text-navy/50 font-body leading-tight">
                            Download as PNG
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Income Source Notes */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h4 className="font-display text-base text-navy mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal" />
                  How VA Lenders Count Military Income
                </h4>
                <div className="space-y-3 text-sm font-body text-navy/70 leading-relaxed">
                  <p>
                    <strong className="text-navy">Base Pay</strong> — Your
                    taxable monthly salary based on pay grade and years of
                    service. This is the foundation of your qualifying income.
                  </p>
                  <p>
                    <strong className="text-navy">
                      BAH (Basic Allowance for Housing)
                    </strong>{" "}
                    — Non-taxable housing allowance based on your duty station
                    (Honolulu County rates shown). VA lenders count this at full
                    face value since it is non-taxable.
                  </p>
                  <p>
                    <strong className="text-navy">
                      BAS (Basic Allowance for Subsistence)
                    </strong>{" "}
                    — Non-taxable food allowance. $476.95/mo for enlisted,
                    $328.48/mo for officers in 2026. Counted at full face value
                    by VA lenders.
                  </p>
                  <p>
                    <strong className="text-navy">
                      COLA (Cost of Living Allowance)
                    </strong>{" "}
                    — Oahu CONUS COLA compensates for Hawaii's higher cost of
                    living. Calculated using the DoD spendable income formula
                    with an index of 120 for Oahu. Counted as qualifying income
                    by VA lenders.
                  </p>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-navy via-navy to-navy/90 rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                <div className="relative">
                  <h3 className="font-display text-xl lg:text-2xl text-white mb-2">
                    Ready to See Your Real Numbers?
                  </h3>
                  <p className="text-sand/80 font-body text-sm leading-relaxed mb-5 max-w-lg">
                    This calculator provides estimates based on 2026 published
                    rates. Your actual qualifying income and purchase price
                    depend on credit score, existing debts, residual income, and
                    lender guidelines. Get a personalized pre-approval to know
                    your exact buying power.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={PRE_APPROVAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-navy font-display font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      <FileCheck className="w-4 h-4" />
                      Get Pre-Approved
                    </a>
                    <a
                      href={`tel:${LENDER.phone}`}
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-display font-medium px-6 py-3 rounded-lg transition-colors text-sm border border-white/20"
                    >
                      <Phone className="w-4 h-4" />
                      Call Jay
                    </a>
                  </div>
                </div>
              </div>

              {/* Cross-link to Advanced Calculator */}
              <Link
                href="/advanced-calculator?lt=va"
                className="flex items-center gap-4 p-4 rounded-xl bg-teal/5 border border-teal/20 hover:bg-teal/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-teal/15 flex items-center justify-center shrink-0">
                  <CalcIcon className="w-5 h-5 text-teal" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-display font-semibold text-navy group-hover:text-teal transition-colors">Run Detailed Numbers in the Advanced Calculator</p>
                  <p className="text-xs text-navy/50 font-body">See full amortization, VA funding fee breakdown, and comparison mode</p>
                </div>
                <ArrowRight className="w-4 h-4 text-teal/60 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              {/* Related Articles */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h4 className="font-display text-base text-navy mb-3">
                  Related Articles
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/knowledge-base/va-loan-house-hacking-hawaii"
                    className="flex items-center gap-2 text-sm font-body text-teal hover:text-teal-dark transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    VA Loan House Hacking in Hawaii
                  </Link>
                  <Link
                    href="/knowledge-base/va-loans-hawaii-military"
                    className="flex items-center gap-2 text-sm font-body text-teal hover:text-teal-dark transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    VA Loans in Hawaii: The Complete Guide
                  </Link>
                  <Link
                    href="/knowledge-base/va-funding-fee-tax-deductible"
                    className="flex items-center gap-2 text-sm font-body text-teal hover:text-teal-dark transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    Is the VA Funding Fee Tax Deductible?
                  </Link>
                  <Link
                    href="/knowledge-base/va-assumable-loans-hawaii"
                    className="flex items-center gap-2 text-sm font-body text-teal hover:text-teal-dark transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    VA Assumable Loans in Hawaii
                  </Link>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-sand/30 rounded-lg p-4 border border-border">
                <p className="text-xs text-navy/50 leading-relaxed">
                  <strong className="text-navy/60">Disclaimer:</strong> These
                  are estimates based on 2026 published military pay tables, BAH
                  rates for Honolulu County (MHA HI408), BAS rates, and COLA
                  spendable income tables from DTMO. Actual qualification
                  depends on credit score, existing debts, residual income,
                  employment verification, and individual lender guidelines. VA
                  loan limits shown are for Honolulu County. Default property
                  tax, insurance, and HOA values are editable estimates — adjust
                  them to match your target property for a more accurate
                  purchase price. This tool is for educational purposes only
                  and does not constitute a loan offer or pre-approval. NMLS
                  #1820 | Equal Housing Lender.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Military Buying Power Calculator",
            description:
              "Estimate your total qualifying income and VA loan home purchase power as a Hawaii-based military service member using 2026 pay tables.",
            url: "https://realitycents.com/military-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Person",
              name: "Jay Miller",
              jobTitle: "Mortgage Lender & Sales Manager",
              url: "https://realitycents.com/about",
            },
          }),
        }}
      />
    </Layout>
  );
}
