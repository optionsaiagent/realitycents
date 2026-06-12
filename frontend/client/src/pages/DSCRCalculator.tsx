/*
 * Pacific Modernism — DSCR Investment Property Analyzer
 * Helps investors and agents screen whether a rental property qualifies for a DSCR loan.
 */
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
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
  XCircle,
  Search,
  MapPin,
  Building2,
  Lock,
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
function fmtPct(n: number, d = 2): string {
  return `${n.toFixed(d)}%`;
}

const PIE_COLORS = [
  "oklch(0.55 0.12 195)",
  "oklch(0.72 0.10 60)",
  "oklch(0.45 0.12 195)",
  "oklch(0.65 0.10 195)",
  "oklch(0.82 0.08 60)",
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
  termYears: number
): number {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r <= 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

export default function DSCRCalculator({ isEmbedded = false }: { isEmbedded?: boolean }) {
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

  // ─── Address / Rent Estimate State ─────────────────────────────────────────
  const [address, setAddress] = useState("");
  const [fetchAddress, setFetchAddress] = useState<string | null>(null);
  const [rentOverride, setRentOverride] = useState<number | null>(null);

  // tRPC query for rent estimate
  const rentQuery = trpc.dscr.getRentEstimate.useQuery(
    { address: fetchAddress || "" },
    {
      enabled: !!fetchAddress,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // ─── Deal Inputs ───────────────────────────────────────────────────────────
  const [purchasePrice, setPurchasePrice] = useState(800000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [interestRate, setInterestRate] = useState(7.5);
  const [monthlyTax, setMonthlyTax] = useState(250);
  const [monthlyInsurance, setMonthlyInsurance] = useState(150);
  const [monthlyHOA, setMonthlyHOA] = useState(600);
  const [vacancyRate, setVacancyRate] = useState(5);
  const [managementFee, setManagementFee] = useState(10);
  const [isLeasehold, setIsLeasehold] = useState(false);

  // ─── Derived Rent Value ────────────────────────────────────────────────────
  const estimatedRent = rentQuery.data?.rent ?? 0;
  const activeRent = rentOverride ?? estimatedRent;

  // ─── DSCR Calculation ──────────────────────────────────────────────────────
  const result = useMemo(() => {
    if (activeRent <= 0) return null;

    const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
    const monthlyPI = calcMonthlyPI(loanAmount, interestRate, 30);
    const pitia = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA;

    const grossRent = activeRent;
    const vacancyDeduction = grossRent * (vacancyRate / 100);
    const managementDeduction = grossRent * (managementFee / 100);
    const noi = grossRent - vacancyDeduction - managementDeduction;

    const dscr = pitia > 0 ? noi / pitia : 0;

    return {
      grossRent,
      vacancyDeduction,
      managementDeduction,
      noi,
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      monthlyHOA,
      pitia,
      dscr,
      loanAmount,
    };
  }, [
    activeRent,
    purchasePrice,
    downPaymentPct,
    interestRate,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    vacancyRate,
    managementFee,
  ]);

  // ─── DSCR Color/Status ────────────────────────────────────────────────────
  function getDSCRStatus(dscr: number) {
    if (dscr >= 1.25)
      return {
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        label: "Strong — meets most DSCR lender requirements",
      };
    if (dscr >= 1.0)
      return {
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        label: "Marginal — some lenders may approve, higher rate likely",
      };
    return {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      label: "Does not qualify — expenses exceed rental income",
    };
  }

  // ─── Pie Chart Data ────────────────────────────────────────────────────────
  const pieData = result
    ? [
        { name: "Principal & Interest", value: Math.round(result.monthlyPI) },
        ...(result.monthlyTax > 0
          ? [{ name: "Property Tax", value: result.monthlyTax }]
          : []),
        ...(result.monthlyInsurance > 0
          ? [{ name: "Insurance", value: result.monthlyInsurance }]
          : []),
        ...(result.monthlyHOA > 0
          ? [{ name: "HOA/Maintenance", value: result.monthlyHOA }]
          : []),
      ].filter((d) => d.value > 0)
    : [];

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleFetchRent() {
    if (address.trim().length < 5) return;
    setFetchAddress(address.trim());
    setRentOverride(null);
  }

  if (!isUnlocked && !isEmbedded) {
    return (
      <Layout>
        <SEO title="Access Gated — DSCR Analyzer" description="Please access via the Agents page." url="/dscr-calculator" />
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
          {/* Address / Rent Estimate Section */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal" />
              Rent Estimate
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  Property Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFetchRent();
                    }}
                    placeholder="123 Ala Moana Blvd, Honolulu, HI 96813"
                    className="flex-1 px-3 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors placeholder:text-muted-foreground/50"
                  />
                  <button
                    onClick={handleFetchRent}
                    disabled={
                      address.trim().length < 5 || rentQuery.isFetching
                    }
                    className="px-4 py-2.5 rounded-md bg-teal text-white text-sm font-body font-semibold hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {rentQuery.isFetching ? "..." : "Get Rent"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Full address with city, state, and zip
                </p>
              </div>

              {/* Loading State */}
              {rentQuery.isFetching && (
                <div className="bg-sand/50 rounded-lg p-3 border border-border animate-pulse">
                  <p className="text-sm text-muted-foreground">
                    Fetching rent estimate...
                  </p>
                </div>
              )}

              {/* Error State */}
              {rentQuery.isError && !rentQuery.isFetching && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-sm text-red-700">
                    {rentQuery.error?.message ||
                      "Rent estimate service unavailable — enter rent manually"}
                  </p>
                </div>
              )}

              {/* Success State */}
              {rentQuery.data && !rentQuery.isFetching && (
                <div className="bg-teal/5 rounded-lg p-3 border border-teal/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body font-semibold uppercase tracking-wider text-teal">
                      Estimated Rent
                    </span>
                    <span className="text-lg font-display text-navy">
                      {fmt(rentQuery.data.rent)}/mo
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      Low: {fmt(rentQuery.data.rentRangeLow)}
                    </span>
                    <span>
                      High: {fmt(rentQuery.data.rentRangeHigh)}
                    </span>
                    <span>
                      {rentQuery.data.comps.length} comp
                      {rentQuery.data.comps.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Comps Table */}
                  {rentQuery.data.comps.length > 0 && (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-2 font-body font-semibold text-navy">
                              Address
                            </th>
                            <th className="text-right py-1.5 px-2 font-body font-semibold text-navy">
                              Rent
                            </th>
                            <th className="text-right py-1.5 px-2 font-body font-semibold text-navy">
                              Dist
                            </th>
                            <th className="text-right py-1.5 pl-2 font-body font-semibold text-navy">
                              Bed/Bath
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rentQuery.data.comps.map((comp: any, i: number) => (
                            <tr
                              key={i}
                              className="border-b border-border/50"
                            >
                              <td className="py-1.5 pr-2 text-muted-foreground truncate max-w-[140px]">
                                {comp.formattedAddress}
                              </td>
                              <td className="py-1.5 px-2 text-right font-body font-medium text-navy">
                                {fmt(comp.rent)}
                              </td>
                              <td className="py-1.5 px-2 text-right text-muted-foreground">
                                {comp.distance.toFixed(1)} mi
                              </td>
                              <td className="py-1.5 pl-2 text-right text-muted-foreground">
                                {comp.bedrooms}/{comp.bathrooms}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Rent Override / Manual Entry */}
              <div>
                <label className="block text-sm font-body font-medium text-navy mb-1.5">
                  Monthly Rent{" "}
                  {rentQuery.data ? "(override)" : "(manual entry)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={(rentOverride ?? estimatedRent) || ""}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setRentOverride(v > 0 ? v : null);
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder={
                      estimatedRent > 0
                        ? String(estimatedRent)
                        : "Enter monthly rent"
                    }
                    step={50}
                    min={0}
                    className="w-full pl-7 pr-12 py-2.5 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    /mo
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rentQuery.data
                    ? "Edit to override the API estimate"
                    : "Enter expected monthly rental income"}
                </p>
              </div>
            </div>
          </div>

          {/* Deal Inputs Section */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal" />
              Deal Inputs
            </h3>

            <div className="space-y-3">
              <InputField
                label="Purchase Price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                prefix="$"
                step={25000}
                min={0}
              />
              <InputField
                label="Down Payment"
                value={downPaymentPct}
                onChange={setDownPaymentPct}
                suffix="%"
                step={5}
                min={0}
                max={100}
                helpText="DSCR loans typically require 20-25% down"
              />
              <InputField
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                suffix="%"
                step={0.125}
                min={0}
                max={20}
                helpText="DSCR rates are typically 0.5-1.5% above conventional"
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
                    helpText="Hawaii avg: ~$250/mo on $800K (0.35% rate)"
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
                    label="HOA / Maintenance"
                    value={monthlyHOA}
                    onChange={setMonthlyHOA}
                    prefix="$"
                    suffix="/mo"
                    step={25}
                    min={0}
                    helpText="Hawaii condos: $400–$1,200+/mo"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Operating Assumptions
                </p>
                <div className="space-y-3">
                  <InputField
                    label="Vacancy Rate"
                    value={vacancyRate}
                    onChange={setVacancyRate}
                    suffix="%"
                    step={1}
                    min={0}
                    max={50}
                    helpText="Typical: 5-8% for Hawaii long-term rentals"
                  />
                  <InputField
                    label="Management Fee (% of rent)"
                    value={managementFee}
                    onChange={setManagementFee}
                    suffix="%"
                    step={1}
                    min={0}
                    max={50}
                    helpText="Typical: 8-12% for professional management"
                  />
                </div>
              </div>

              {/* Leasehold Checkbox */}
              <div className="border-t border-border pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLeasehold}
                    onChange={(e) => setIsLeasehold(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-teal focus:ring-teal/30"
                  />
                  <span className="text-sm font-body font-medium text-navy">
                    Leasehold Property
                  </span>
                </label>
                {isLeasehold && (
                  <div className="mt-2 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Leasehold properties may have unreliable rent AVMs.
                        Verify rent estimate against actual comparable
                        leases.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Results ────────────────────────────────── */}
      <div className="lg:col-span-3">
        {result ? (
          <>
            {/* DSCR Result Card */}
            <div className="bg-navy rounded-xl p-6 lg:p-8 mb-6">
              <div className="text-center mb-6">
                <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-2">
                  Debt Service Coverage Ratio
                </p>
                <p
                  className={`font-display text-5xl lg:text-6xl mb-2 ${
                    result.dscr >= 1.25
                      ? "text-emerald-400"
                      : result.dscr >= 1.0
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {result.dscr.toFixed(2)}x
                </p>
                <p
                  className={`text-sm ${
                    result.dscr >= 1.25
                      ? "text-emerald-300"
                      : result.dscr >= 1.0
                      ? "text-amber-300"
                      : "text-red-300"
                  }`}
                >
                  {getDSCRStatus(result.dscr).label}
                </p>
              </div>

              {/* Lender Thresholds */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { threshold: 1.0, label: "Min (1.0x)" },
                  { threshold: 1.1, label: "Standard (1.1x)" },
                  { threshold: 1.25, label: "Strong (1.25x)" },
                ].map(({ threshold, label }) => (
                  <div
                    key={threshold}
                    className="bg-white/5 rounded-lg p-3 text-center"
                  >
                    <div className="flex items-center justify-center mb-1">
                      {result.dscr >= threshold ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-sand/60">{label}</p>
                  </div>
                ))}
              </div>

              {/* NOI Breakdown */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2 mb-4">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-sand/50 mb-2">
                  Income Calculation
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">Gross Monthly Rent</span>
                  <span className="text-white font-body font-medium">
                    {fmt(result.grossRent)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">
                    Less: Vacancy ({fmtPct(vacancyRate, 0)})
                  </span>
                  <span className="text-red-300 font-body font-medium">
                    -{fmt(result.vacancyDeduction)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">
                    Less: Management ({fmtPct(managementFee, 0)})
                  </span>
                  <span className="text-red-300 font-body font-medium">
                    -{fmt(result.managementDeduction)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                  <span className="text-white font-body font-bold">
                    = Net Operating Income
                  </span>
                  <span className="text-gold font-body font-bold">
                    {fmt(result.noi)}
                  </span>
                </div>
              </div>

              {/* PITIA Breakdown */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2 mb-4">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-sand/50 mb-2">
                  PITIA (Monthly Debt Service)
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">
                    Principal & Interest
                  </span>
                  <span className="text-white font-body font-medium">
                    {fmt(result.monthlyPI)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">Property Tax</span>
                  <span className="text-white font-body font-medium">
                    {fmt(result.monthlyTax)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">Insurance</span>
                  <span className="text-white font-body font-medium">
                    {fmt(result.monthlyInsurance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sand/70">HOA / Maintenance</span>
                  <span className="text-white font-body font-medium">
                    {fmt(result.monthlyHOA)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                  <span className="text-white font-body font-bold">
                    = Total PITIA
                  </span>
                  <span className="text-gold font-body font-bold">
                    {fmt(result.pitia)}
                  </span>
                </div>
              </div>

              {/* DSCR Formula */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sand/70">
                    DSCR = NOI / PITIA
                  </span>
                  <span className="text-white font-body font-medium">
                    {fmt(result.noi)} / {fmt(result.pitia)} ={" "}
                    <span
                      className={`font-bold ${
                        result.dscr >= 1.25
                          ? "text-emerald-400"
                          : result.dscr >= 1.0
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {result.dscr.toFixed(2)}x
                    </span>
                  </span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="mt-6">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-sand/50 mb-3 text-center">
                  PITIA Breakdown
                </p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => fmt(value)}
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
                <div className="space-y-1.5 mt-2">
                  {pieData.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-sand/60">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-body font-semibold text-sand/80">
                        {fmt(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-card rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Loan Amount
                </p>
                <p className="text-sm font-body font-bold text-navy">
                  {fmt(result.loanAmount)}
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Monthly NOI
                </p>
                <p className="text-sm font-body font-bold text-navy">
                  {fmt(result.noi)}
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Monthly PITIA
                </p>
                <p className="text-sm font-body font-bold text-navy">
                  {fmt(result.pitia)}
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Cash Flow
                </p>
                <p
                  className={`text-sm font-body font-bold ${
                    result.noi - result.pitia >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {fmt(result.noi - result.pitia)}
                </p>
              </div>
            </div>

            {/* Hawaii Notes */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h3 className="font-display text-xl text-navy mb-4">
                Hawaii-Specific Notes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Hawaii property tax rates are among the lowest in the
                    nation (~0.35%), but HOA/maintenance fees for condos
                    can be significant. Always verify actual fees with the
                    listing agent.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    DSCR lenders will use the appraiser's{" "}
                    <span className="font-body font-semibold text-navy">
                      Form 1007 market rent determination
                    </span>
                    , which may differ from this estimate. This tool is for
                    initial deal screening only.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Many Hawaii condos have{" "}
                    <span className="font-body font-semibold text-navy">
                      lease rent
                    </span>{" "}
                    (leasehold ground rent) that should be added to your
                    monthly expenses. Check if the property is fee simple
                    or leasehold.
                  </p>
                </div>
              </div>
            </div>

            {/* Lender Threshold Table */}
            <div className="bg-sand/30 rounded-xl border border-border p-6 mb-6">
              <h3 className="font-display text-xl text-navy mb-3">
                Common DSCR Lender Thresholds
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Different lenders have different minimum DSCR requirements.
                Here's how this deal stacks up:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-body font-semibold text-navy">
                        DSCR Threshold
                      </th>
                      <th className="text-left py-2 px-4 font-body font-semibold text-navy">
                        Status
                      </th>
                      <th className="text-left py-2 pl-4 font-body font-semibold text-navy">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        threshold: 1.0,
                        label: "1.00x",
                        notes:
                          "Break-even — some lenders allow, higher rate/fees",
                      },
                      {
                        threshold: 1.1,
                        label: "1.10x",
                        notes:
                          "Common minimum for many DSCR programs",
                      },
                      {
                        threshold: 1.25,
                        label: "1.25x",
                        notes:
                          "Strong qualification — best rates and terms",
                      },
                    ].map((row) => (
                      <tr
                        key={row.threshold}
                        className="border-b border-border/50"
                      >
                        <td className="py-2.5 pr-4 font-body font-medium text-navy">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4">
                          {result.dscr >= row.threshold ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-body font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Meets
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 font-body font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              Below
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pl-4 text-muted-foreground">
                          {row.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-sand/20 rounded-lg border border-border p-4 mb-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-body font-semibold text-navy">
                  Disclaimer:
                </span>{" "}
                This tool is for deal screening purposes only. Lenders
                will use the appraiser's Form 1007 market rent
                determination, which may differ from this estimate.
                Contact{" "}
                <a
                  href={PRE_APPROVAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:underline font-body font-medium"
                >
                  Jay Miller
                </a>{" "}
                for actual DSCR loan qualification.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-navy mb-2">
              Enter Rental Income
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Use the address lookup to get a rent estimate, or manually
              enter the expected monthly rent to calculate the DSCR for
              this deal.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-navy rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">
              Ready to Run the Numbers for Real?
            </p>
            <h3 className="font-display text-xl text-white mb-1">
              Get Pre-Approved for a DSCR Loan
            </h3>
            <p className="text-sm text-sand/70">
              25+ years of Hawaii lending experience. Let's see what you
              actually qualify for.
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

        {/* Learn More Link */}
        <div className="mt-6 text-center">
          <a
            href="/knowledge-base/dscr-loans-hawaii"
            className="inline-flex items-center gap-2 text-sm text-teal hover:underline font-body font-medium"
          >
            <DollarSign className="w-4 h-4" />
            Learn more about DSCR loans in Hawaii
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
        title="DSCR Investment Property Analyzer — Hawaii Rental Calculator"
        description="Screen rental properties for DSCR loan qualification. Get rent estimates, calculate debt service coverage ratio, and determine if a deal pencils for Hawaii investment properties."
        url="/dscr-calculator"
        keywords="DSCR calculator Hawaii, debt service coverage ratio, rental property analyzer, DSCR loan qualification, investment property calculator Hawaii, rent estimate"
      />
      <PageHero
        title="DSCR Investment Property Analyzer"
        subtitle="Screen rental properties for DSCR loan qualification. Get a rent estimate, plug in the deal numbers, and instantly see if it pencils."
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
