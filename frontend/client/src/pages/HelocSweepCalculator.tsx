/*
 * Pacific Modernism — First-Lien HELOC + Sweep Checking Calculator
 * Simulates a first-lien HELOC with an integrated sweep-checking account.
 * Net income deposits suppress the daily balance; expenses draw it back up.
 * Day-by-day simulation with the signature "sawtooth" pattern, compared
 * against a traditional fixed-rate mortgage.
 * Matches existing RealityCents dark theme (LoanCompare) — dark slate,
 * teal/gold accents.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import {
  type HelocSweepInputs,
  type DepositFrequency,
  type ExtraDepositFrequency,
  compareStrategies,
  depositsPerMonth,
  defaultLivingExpenses,
  buildPaydownSummary,
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
  Printer,
  Scale,
  TrendingUp,
  History,
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

// SOFR fallback used until the live rate loads (backend caches the NY Fed API weekly).
// Update periodically if the API ever changes: https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json
const SOFR_FALLBACK = 3.631;
const HELOC_MARGIN = 3.25;

// ─── Scenario analysis assumptions ───────────────────────────────────────────
// 25-year average of the Federal Funds Effective Rate (FRED series FEDFUNDS,
// monthly averages of daily figures), calendar years 2001–2025 = 1.84%.
// The long zero-rate stretches (2008–2015 and 2020–2022) pull this well below
// the pre-2001 norm. Source: https://fred.stlouisfed.org/series/FEDFUNDS
const FED_FUNDS_25YR_AVG = 1.84;
// Margin added to the index for the optimistic first-lien HELOC rate.
const OPTIMISTIC_MARGIN = 4.0;
const OPTIMISTIC_RATE = FED_FUNDS_25YR_AVG + OPTIMISTIC_MARGIN; // 5.84%
// Pessimistic case: the user's rate averages this much higher over the loan life.
const PESSIMISTIC_RATE_BUMP = 2.0;

// ─── Print stylesheet ────────────────────────────────────────────────────────
// Injected with the component so the printed report renders correctly regardless
// of what the global stylesheet defines. Screen rules keep the report hidden;
// print rules hide every interactive element and show the light-background report.
const PRINT_STYLES = `
#heloc-print-report { display: none; }

@media print {
  @page { size: letter portrait; margin: 0.5in; }

  html, body {
    background: #ffffff !important;
    color: #111827 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Hide the entire interactive UI: hero, calculator, charts, inputs, buttons,
     nav and footer chrome supplied by Layout. */
  body .no-print-page,
  body header,
  body nav,
  body footer,
  body button,
  body input,
  body select,
  body textarea { display: none !important; }

  /* Show the report */
  #heloc-print-report {
    display: block !important;
    position: static !important;
    background: #ffffff !important;
    color: #111827 !important;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    line-height: 1.4;
  }

  #heloc-print-report * {
    background: transparent;
    box-shadow: none !important;
  }

  /* Header / footer */
  .hpr-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2pt solid #0C2340;
    padding-bottom: 6pt;
    margin-bottom: 10pt;
  }
  .hpr-brand {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 17pt;
    font-weight: 700;
    color: #0C2340;
    letter-spacing: -0.01em;
  }
  .hpr-brand-sub {
    font-size: 7.5pt;
    color: #6b7280;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 1pt;
  }
  .hpr-meta { text-align: right; font-size: 7.5pt; color: #4b5563; line-height: 1.45; }
  .hpr-meta-name { font-weight: 700; color: #0C2340; font-size: 8.5pt; }

  .hpr-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 14pt;
    color: #0C2340;
    margin: 0 0 2pt 0;
  }
  .hpr-subtitle { font-size: 8pt; color: #6b7280; margin: 0 0 10pt 0; }

  /* Section scaffolding */
  .hpr-section { margin-bottom: 12pt; break-inside: avoid; page-break-inside: avoid; }
  .hpr-section h2 {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0C2340;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin: 0 0 5pt 0;
    padding-bottom: 2.5pt;
    border-bottom: 1.5pt solid #d1d5db;
  }
  .hpr-note { font-size: 7.5pt; color: #6b7280; margin: 4pt 0 0 0; line-height: 1.45; }

  /* Two-column key/value grids */
  .hpr-grid { display: flex; gap: 18pt; }
  .hpr-grid > div { flex: 1; }
  .hpr-row {
    display: flex;
    justify-content: space-between;
    gap: 8pt;
    padding: 2pt 0;
    border-bottom: 0.5pt solid #e5e7eb;
    font-size: 8.5pt;
  }
  .hpr-row:last-child { border-bottom: none; }
  .hpr-row .label { color: #4b5563; }
  .hpr-row .value { color: #111827; font-weight: 600; text-align: right; white-space: nowrap; }
  .hpr-row.head {
    font-weight: 700;
    color: #0C2340;
    border-bottom: 1pt solid #9ca3af;
    text-transform: uppercase;
    font-size: 8pt;
    letter-spacing: 0.05em;
  }
  .hpr-row.total { border-top: 1pt solid #9ca3af; border-bottom: none; font-weight: 700; }

  /* Highlight banner */
  .hpr-highlight {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border: 1pt solid #0C2340;
    background: #f3f6f9 !important;
    padding: 8pt 10pt;
    margin-bottom: 12pt;
  }
  .hpr-badge {
    display: inline-block;
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #1A7A7A;
    margin-bottom: 3pt;
  }
  .hpr-big-label { font-size: 8pt; color: #6b7280; }
  .hpr-big-number {
    font-family: Georgia, serif;
    font-size: 18pt;
    font-weight: 700;
    color: #0C2340;
    line-height: 1.1;
  }
  .hpr-highlight-sub { font-size: 7.5pt; color: #4b5563; margin-top: 3pt; }
  .hpr-kpi-label { font-weight: 700; color: #0C2340; font-size: 8.5pt; }
  .hpr-kpi-value { font-family: Georgia, serif; font-size: 13pt; font-weight: 700; color: #1A7A7A; }

  /* Metric card strip (Key Insights) */
  .hpr-cards { display: flex; gap: 8pt; }
  .hpr-card {
    flex: 1;
    border: 0.75pt solid #d1d5db;
    padding: 5pt 6pt;
  }
  .hpr-card-label { font-size: 7pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  .hpr-card-value {
    font-family: Georgia, serif;
    font-size: 12pt;
    font-weight: 700;
    color: #0C2340;
    margin: 1pt 0;
  }
  .hpr-card-sub { font-size: 6.5pt; color: #6b7280; line-height: 1.35; }

  /* Scenario columns */
  .hpr-scenarios { display: flex; gap: 10pt; }
  .hpr-scenario { flex: 1; border: 0.75pt solid #d1d5db; padding: 6pt 8pt; }
  .hpr-scenario.optimistic { border-left: 3pt solid #1A7A7A; }
  .hpr-scenario.pessimistic { border-left: 3pt solid #B4813A; }
  .hpr-scenario-title {
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #0C2340;
  }
  .hpr-scenario-rate { font-family: Georgia, serif; font-size: 14pt; font-weight: 700; color: #0C2340; }
  .hpr-scenario-basis { font-size: 6.5pt; color: #6b7280; margin-bottom: 4pt; line-height: 1.35; }

  /* Year-by-year table */
  .hpr-page-break { page-break-before: always; break-before: page; padding-top: 6pt; }
  table.hpr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7pt;
  }
  table.hpr-table th, table.hpr-table td {
    padding: 2pt 3pt;
    border-bottom: 0.5pt solid #e5e7eb;
    text-align: right;
    white-space: nowrap;
  }
  table.hpr-table th {
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #374151;
    border-bottom: 1pt solid #9ca3af;
  }
  table.hpr-table th.grp {
    text-align: center;
    font-size: 7pt;
    color: #0C2340;
    border-bottom: 0.75pt solid #d1d5db;
  }
  table.hpr-table th.grp.aio { background: #eef6f6 !important; }
  table.hpr-table th.grp.trad { background: #faf4ea !important; }
  table.hpr-table td.yr, table.hpr-table th.yr { text-align: center; font-weight: 700; color: #0C2340; }
  table.hpr-table td.sep, table.hpr-table th.sep { border-left: 1pt solid #9ca3af; }
  table.hpr-table thead { display: table-header-group; }
  table.hpr-table tr { break-inside: avoid; page-break-inside: avoid; }
  table.hpr-table tr.payoff td { background: #eef6f6 !important; font-weight: 700; }
  table.hpr-table tfoot td {
    border-top: 1pt solid #0C2340;
    font-weight: 700;
    color: #0C2340;
    font-size: 7pt;
  }

  /* Recommendation + disclaimer */
  .hpr-callout {
    border: 1pt solid #1A7A7A;
    background: #f0fafa !important;
    padding: 7pt 9pt;
  }
  .hpr-callout-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #0C2340;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3pt;
  }
  .hpr-callout-body { font-size: 8pt; color: #1f2937; line-height: 1.5; }
  .hpr-callout-body p { margin: 0 0 5pt 0; }
  .hpr-callout-body p:last-child { margin-bottom: 0; }

  .hpr-footer {
    border-top: 1.5pt solid #0C2340;
    margin-top: 12pt;
    padding-top: 5pt;
  }
  .hpr-footer-name { font-size: 8pt; font-weight: 700; color: #0C2340; margin-bottom: 3pt; }
  .hpr-disclaimer { font-size: 6.5pt; color: #6b7280; line-height: 1.45; }
}
`;

// ─── FAQ content (rendered + FAQPage JSON-LD) ──────────────────────────────────
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is a first-lien HELOC with sweep checking?",
    a: "It's a home equity line of credit that replaces your traditional mortgage as the first lien on your home, combined with an integrated checking account. Your paychecks deposit directly against the loan balance, and your bills are paid from the line. Because interest is calculated on your daily balance, every dollar sitting in the account \"sweeps\" down the balance that interest accrues on — your idle cash effectively earns your mortgage rate. Products like CMG's All-In-One Loan use this structure.",
  },
  {
    q: "How does daily interest calculation save money compared to a traditional mortgage?",
    a: "A traditional mortgage charges interest on the full outstanding principal each month, regardless of what's in your bank account. With a sweep HELOC, your deposited income lowers the balance the day it lands, so interest accrues on a smaller number for most of the month. The savings come from two sources: your monthly surplus permanently paying down principal, and your \"parked\" cash temporarily suppressing the average daily balance. The first effect does most of the work — which is why this only makes sense with strong positive cash flow.",
  },
  {
    q: "What happens if I need to access my equity — do I have to refinance?",
    a: "No. That's the core liquidity advantage. Every dollar of principal you pay down remains available to re-borrow through the line, up to your current credit limit — just write a check or transfer from the account. With a traditional mortgage, extra payments are locked in the house, and getting them back requires a cash-out refinance or a separate HELOC, both of which involve closing costs, underwriting, and time.",
  },
  {
    q: "Is the interest rate variable? What are the risks?",
    a: "Yes — first-lien HELOC rates are variable, typically tied to an index like SOFR or Prime plus a margin. If rates rise, your interest cost rises with them, and the math in this calculator changes. The strategy also depends on behavioral discipline: the credit line makes your home equity as accessible as a checking account, which is dangerous if you tend to spend what's available. Run the numbers with a rate 1–2% higher than today's before deciding, and be honest about your spending habits.",
  },
  {
    q: "Who is the ideal candidate for this type of loan?",
    a: "Someone with consistently strong positive cash flow — typically saving 20% or more of net income — stable income, disciplined spending, and a desire to keep equity liquid rather than locked away. Self-employed borrowers and investors who value flexible access to capital often benefit most. It is NOT a good fit for tight budgets, irregular spending, or anyone who would treat the available credit as spending money — in those cases a traditional fixed-rate mortgage is the safer instrument.",
  },
  {
    q: "What is the 'effective APR' and why is it so much lower than the note rate?",
    a: "The effective APR is the fixed mortgage rate that would produce the same total interest cost over the same payoff period. Your note rate might be 6.9%, but because your deposits keep the average daily balance suppressed and your surplus retires principal quickly, the total interest you actually pay can equal what a much lower fixed rate would cost over that shorter timeline. It's a way of translating the sweep effect into a familiar number — not a rate any lender is quoting you.",
  },
  {
    q: "What happens after the 10-year draw period?",
    a: "With the All-In-One structure this calculator models, you don't lose access to the line. For the first 10 years you can draw up to the original credit limit. Starting in year 11, the credit limit reduces by 1/240th of the original balance each month over the remaining 20 years — a gradual step-down rather than a cliff. You retain access to the declining line for the full 30-year term. Terms vary by lender, so confirm the specific product's draw schedule.",
  },
  {
    q: "Can I still make this work if my income fluctuates?",
    a: "Possibly, but with caution. The strategy needs your average surplus to comfortably exceed the monthly interest charge. Commission-based or seasonal income can work if the annual surplus is strong and you maintain a cushion for lean months — the line itself provides that buffer. But if a few slow months would push your spending above your deposits, the balance climbs instead of falls, and you'd be better served by a fixed payment you can budget around. Model your worst realistic year, not your best.",
  },
];

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

// ─── Metric row with optional tooltip ───────────────────────────────────────

function MetricRow({
  label,
  value,
  tooltip,
  accent = "text-white",
}: {
  label: string;
  value: string;
  tooltip?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-700/50 last:border-0">
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        {label}
        {tooltip && (
          <span className="relative group inline-flex">
            <Info size={12} className="text-slate-500 cursor-help" />
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-slate-950 border border-slate-600 p-2.5 text-[11px] leading-snug text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl">
              {tooltip}
            </span>
          </span>
        )}
      </span>
      <span className={`text-sm font-semibold ${accent} text-right`}>{value}</span>
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
  const [helocRate, setHelocRate] = useState(String(SOFR_FALLBACK + HELOC_MARGIN)); // SOFR + margin
  const helocRateTouched = useRef(false);
  const [termYears, setTermYears] = useState("30");
  // All-in-One structure: full line access for the entire term; the credit limit
  // begins reducing by 1/240th of the original balance monthly starting at month 121.
  const FULL_ACCESS_YEARS = 10;

  // Income
  const [netIncome, setNetIncome] = useState("10000");
  const [depositFrequency, setDepositFrequency] = useState<DepositFrequency>("monthly");

  // Property costs — paid from the HELOC line (Hawaii defaults: ~0.35% of $750K home ≈ $219/mo tax)
  const [monthlyPropertyTax, setMonthlyPropertyTax] = useState("219");
  const [monthlyInsurance, setMonthlyInsurance] = useState("150");
  const [monthlyHOA, setMonthlyHOA] = useState("0");

  // Living expenses — defaults to 40% of monthly net income.
  // User can override with actual figures.
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live SOFR: fetched from the backend (cached weekly from the NY Fed API).
  // Until the user edits the rate manually, default it to live SOFR + margin.
  const sofrQuery = trpc.rates.getSofr.useQuery(undefined, {
    staleTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const liveSofr = sofrQuery.data?.rate ?? SOFR_FALLBACK;
  useEffect(() => {
    if (sofrQuery.data && !helocRateTouched.current) {
      setHelocRate((sofrQuery.data.rate + HELOC_MARGIN).toFixed(3).replace(/0+$/, "").replace(/\.$/, ""));
    }
  }, [sofrQuery.data]);

  // Derived monthly figures used for the living-expense default (40% of monthly income;
  // per-deposit amounts are converted to monthly equivalent first)
  const monthlyIncomeForDefault = num(netIncome) * depositsPerMonth(depositFrequency);
  const propertyCostsTotal = num(monthlyPropertyTax) + num(monthlyInsurance) + num(monthlyHOA);
  const suggestedLivingExpenses = defaultLivingExpenses(monthlyIncomeForDefault);

  // Use the smart default until the user overrides it
  const effectiveLivingExpenses = livingExpensesTouched
    ? num(livingExpenses)
    : suggestedLivingExpenses;

  const inputs: HelocSweepInputs = useMemo(
    () => ({
      startingBalance: num(startingBalance),
      helocRate: num(helocRate),
      termYears: Math.max(Math.round(num(termYears)) || 30, 1),
      drawPeriodYears: FULL_ACCESS_YEARS, // full-access phase before the credit limit starts declining
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
  const netSurplusToPrincipal = monthlySurplus - minMonthlyInterest;

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

  // Paydown Summary (CMG AIO simulator format)
  const paydown = useMemo(
    () => (result ? buildPaydownSummary(inputs, result) : null),
    [inputs, result]
  );

  // ─── Scenario analysis: optimistic vs. pessimistic rate environments ──────
  // Both scenarios re-run the identical simulation with only the HELOC rate
  // changed, so the comparison isolates rate risk from every other assumption.
  const scenarios = useMemo(() => {
    if (inputs.startingBalance <= 0 || inputs.helocRate <= 0) return null;

    const build = (rate: number) => {
      const scenarioInputs: HelocSweepInputs = { ...inputs, helocRate: rate };
      const comparison = compareStrategies(scenarioInputs);
      const summary = buildPaydownSummary(scenarioInputs, comparison);
      return {
        rate,
        paidOff: comparison.heloc.paidOff,
        payoffMonths: comparison.heloc.payoffMonths,
        payoffLabel: comparison.heloc.paidOff
          ? formatMonths(comparison.heloc.payoffMonths)
          : `Not paid off in ${scenarioInputs.termYears} yrs`,
        totalInterest: comparison.heloc.totalInterest,
        interestSaved: comparison.interestSaved,
        monthsSaved: comparison.monthsSaved,
        effectiveAPR: comparison.heloc.paidOff ? summary.heloc.effectiveAPR : null,
      };
    };

    return {
      optimistic: build(OPTIMISTIC_RATE),
      current: build(inputs.helocRate),
      pessimistic: build(inputs.helocRate + PESSIMISTIC_RATE_BUMP),
      // True when the user's own rate already beats the historical-average scenario.
      alreadyBetterThanHistorical: inputs.helocRate < OPTIMISTIC_RATE,
    };
  }, [inputs]);

  // ─── Year-by-year rows for the printed report ─────────────────────────────
  // Derives starting/ending balances, annual principal, and cumulative interest
  // for both strategies from the existing yearRows data. Capped at 30 years or
  // the later of the two payoffs, whichever comes first.
  const printYearRows = useMemo(() => {
    if (!result) return [];
    const maxYear = Math.min(
      30,
      Math.max(
        Math.ceil(result.heloc.payoffMonths / 12),
        Math.ceil(result.traditional.payoffMonths / 12)
      )
    );

    let helocStart = inputs.startingBalance;
    let tradStart = inputs.startingBalance;
    let helocCumInterest = 0;
    let tradCumInterest = 0;

    return result.yearRows.slice(0, maxYear).map((row) => {
      helocCumInterest += row.helocInterest;
      tradCumInterest += row.traditionalInterest;

      // Principal retired = balance change net of interest capitalized to the line.
      const helocPrincipal = helocStart - row.helocBalance + row.helocInterest;
      const tradPrincipal = tradStart - row.traditionalBalance;

      const out = {
        year: row.year,
        helocStart,
        helocInterest: row.helocInterest,
        helocPrincipal: Math.max(helocPrincipal, 0),
        helocEnd: row.helocBalance,
        helocCumInterest,
        tradStart,
        tradInterest: row.traditionalInterest,
        tradPrincipal: Math.max(tradPrincipal, 0),
        tradEnd: row.traditionalBalance,
        tradCumInterest,
      };

      helocStart = row.helocBalance;
      tradStart = row.traditionalBalance;
      return out;
    });
  }, [result, inputs.startingBalance]);

  const handlePrint = () => window.print();

  // Dynamic Analysis & Recommendation for the printed report
  const recommendation = useMemo(() => {
    if (!result || !paydown) return { p1: "", p2: "" };
    const yearsSaved = result.monthsSaved / 12;
    const strongWin =
      result.heloc.paidOff && result.interestSaved > 50000 && yearsSaved >= 3 && monthlySurplus > 0;
    if (strongWin) {
      return {
        p1: `Based on your income profile and spending habits, a first-lien HELOC with sweep-checking integration would reduce your total mortgage cost by ${fmt(result.interestSaved)} and accelerate your payoff by ${yearsSaved.toFixed(1)} years compared to a ${inputs.traditionalRate.toFixed(2)}% fixed mortgage. Your monthly surplus of ${fmt(monthlySurplus)} — the difference between your net deposits and total expenses — would suppress your average daily balance by approximately ${fmt(avgBalanceReduction)} in the first year, resulting in an effective interest cost equivalent to a ${paydown.heloc.effectiveAPR.toFixed(2)}% fixed-rate mortgage.`,
        p2: `This structure is particularly well-suited to your situation because your income significantly exceeds your expenses, creating a consistent surplus that the sweep mechanism converts into aggressive principal reduction while maintaining full liquidity. Unlike extra payments on a traditional mortgage, every dollar applied remains accessible via your checking account without refinancing. ${paydown.heloc.breakevenRate !== null ? `Note that the strategy retains its advantage until the variable rate averages roughly ${paydown.heloc.breakevenRate.toFixed(2)}% over the life of the loan — a meaningful cushion above today's rate.` : "At these inputs, the strategy retains its advantage across the full range of realistic rate scenarios modeled."}`,
      };
    }
    if (result.heloc.paidOff && result.monthsSaved > 0) {
      return {
        p1: `Based on these inputs, the first-lien HELOC would pay off in ${formatMonths(result.heloc.payoffMonths)} versus ${formatMonths(result.traditional.payoffMonths)} for the traditional loan — saving ${fmt(Math.max(result.interestSaved, 0))} in interest. However, the interest savings are modest relative to the complexity and rate risk of the product.`,
        p2: `A traditional fixed-rate mortgage may be more appropriate unless your monthly surplus increases. The sweep strategy's advantage scales directly with surplus cash flow; at your current margin of ${fmt(monthlySurplus)}/month against a first-month interest charge of roughly ${fmt(minMonthlyInterest)}, the acceleration is real but thin. If your income rises or expenses fall, revisit this analysis — the picture can change quickly.`,
      };
    }
    return {
      p1: `Based on these inputs, the sweep strategy does not pay off the loan within the ${inputs.termYears}-year term — your monthly surplus of ${fmt(monthlySurplus)} does not sufficiently exceed the interest charge of roughly ${fmt(minMonthlyInterest)}/month at a ${inputs.helocRate.toFixed(2)}% rate.`,
      p2: `A traditional fixed-rate mortgage is the more appropriate instrument at this cash-flow profile. The first-lien HELOC structure only works when deposits consistently and meaningfully exceed total spending. If your surplus improves, this analysis is worth revisiting.`,
    };
  }, [result, paydown, inputs, monthlySurplus, minMonthlyInterest, avgBalanceReduction]);

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
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
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
      <section className="no-print-page bg-gradient-to-br from-navy via-slate-900 to-navy text-white pt-28 pb-12 lg:pt-36 lg:pb-16 relative overflow-hidden">
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
      <section className="no-print-page bg-slate-900 pt-10">
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
      <section className="no-print-page bg-slate-900 py-10">
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
                  onChange={(v) => {
                    helocRateTouched.current = true;
                    setHelocRate(v);
                  }}
                  suffix="%"
                  helper={`Default: current SOFR ${liveSofr.toFixed(3)}%${
                    sofrQuery.data?.effectiveDate ? ` (as of ${sofrQuery.data.effectiveDate})` : ""
                  } + ${HELOC_MARGIN.toFixed(2)}% margin. Variable — verify with your lender.`}
                />
                <Field label="Loan Term" value={termYears} onChange={setTermYears} suffix="yrs" />
                <div className="p-3 bg-slate-700/30 border border-slate-600/40 rounded-lg">
                  <p className="text-xs text-slate-300 font-medium mb-1">Line Access (All-in-One structure)</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Full draw access to the original credit limit for the first 10 years. Starting in
                    year 11, the credit limit reduces by 1/240th of the original balance each month —
                    but you retain access to the line for the full 30-year term.
                  </p>
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
                        <span className="text-slate-300 font-medium">Suggested default:</span> 40% of
                        your monthly net income ({fmt(monthlyIncomeForDefault)}/mo
                        {depositFrequency !== "monthly" ? ", converted from your deposit schedule" : ""}).
                        Override with your actual spending for a more accurate result.
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
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Interest Charged (monthly, to balance)</span>
                    <span className="text-red-400 font-medium">−{fmt(minMonthlyInterest)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-600/60">
                    <span className="text-slate-300 font-medium">Net Surplus Applied to Principal</span>
                    <span
                      className={`text-sm font-bold ${
                        netSurplusToPrincipal > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {fmt(netSurplusToPrincipal)}/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Interest shown is the first month's charge — it falls as the balance falls,
                    so the net paydown accelerates over time.
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
                          {FULL_ACCESS_YEARS < Math.max(inputs.termYears, inputs.traditionalTermYears) && (
                            <ReferenceLine
                              x={FULL_ACCESS_YEARS}
                              stroke="rgba(245,230,211,0.3)"
                              strokeDasharray="4 4"
                              label={{
                                value: "Credit limit starts declining",
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
                          The "Sawtooth" — First Year, Week by Week
                        </h3>
                        <p className="text-xs text-slate-400">
                          Sharp drop on payday, gradual climb as expenses draw from the line —
                          trending down all year
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
                              dataKey="week"
                              stroke="#94A3B8"
                              fontSize={11}
                              tickLine={false}
                              interval={3}
                              label={{
                                value: "Week",
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
                              formatter={(value: number) => [fmt(value), "Balance"]}
                              labelFormatter={(w) => `Week ${w}`}
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
                        <p className="text-xs text-slate-400 mb-1">Your Effective Borrowing Cost</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {paydown && result?.heloc.paidOff ? `${paydown.heloc.effectiveAPR.toFixed(2)}%` : "—"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          equivalent fixed rate — your {inputs.helocRate.toFixed(2)}% performs like this
                        </p>
                      </div>
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Rate Cushion Before You Lose</p>
                        <p className="text-lg font-bold text-gold">
                          {paydown?.heloc.breakevenRate != null
                            ? `${(paydown.heloc.breakevenRate - inputs.helocRate).toFixed(2)}%`
                            : "—"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          how much rates can rise before the traditional loan wins
                        </p>
                      </div>
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Interest Cost as % of Loan</p>
                        <p className="text-lg font-bold text-teal">
                          {paydown ? `${paydown.heloc.interestPctOfPrincipal.toFixed(0)}%` : "—"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          vs. {paydown ? `${paydown.traditional.interestPctOfPrincipal.toFixed(0)}%` : "—"} on the traditional loan
                        </p>
                      </div>
                      <div className="bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Net Surplus After Interest</p>
                        <p className={`text-lg font-bold ${netSurplusToPrincipal > 0 ? "text-teal" : "text-red-400"}`}>{fmt(netSurplusToPrincipal)}/mo</p>
                        <p className="text-[11px] text-slate-500">
                          {fmt(monthlySurplus)} surplus − ~{fmt(Math.round(minMonthlyInterest))} interest (auto-debited 21st)
                        </p>
                      </div>
                    </div>
                    {result?.heloc.paidOff && paydown ? (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Your{" "}
                        <span className="font-semibold text-teal">{fmt(netSurplusToPrincipal)}/month</span>{" "}
                        net surplus (after ~{fmt(Math.round(minMonthlyInterest))} interest auto-debited on the 21st) means your {inputs.helocRate.toFixed(2)}% HELOC effectively costs you the same as a{" "}
                        <span className="font-semibold text-emerald-400">{paydown.heloc.effectiveAPR.toFixed(2)}% fixed-rate mortgage</span>
                        {" "}— saving{" "}
                        <span className="font-semibold text-emerald-400">{fmt(result.interestSaved)}</span>{" "}
                        in interest and paying off{" "}
                        <span className="font-semibold text-emerald-400">{(result.monthsSaved / 12).toFixed(1)} years early</span>.
                      </p>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Your net surplus after interest is{" "}
                        <span className="font-semibold text-teal">{fmt(netSurplusToPrincipal)}/month</span>{" "}
                        ({fmt(monthlySurplus)} income surplus minus ~{fmt(Math.round(minMonthlyInterest))} interest auto-debited on the 21st).
                        A higher surplus or lower rate would strengthen the payoff acceleration.
                      </p>
                    )}
                    <p className="text-xs text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-700/60">
                      <span className="text-slate-300 font-medium">Line access:</span> Full draw
                      access for the first 10 years. Starting in year 11, the credit limit reduces
                      by 1/240th of the original balance each month — but you retain access to the
                      line for the full 30-year term. It never converts to an amortizing loan.
                    </p>
                  </div>

                  {/* ─── Best Case / Worst Case Scenario Analysis ─────────── */}
                  {scenarios && (
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
                      <div className="mb-4">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-1">
                          <Scale size={16} className="text-teal" />
                          Rate Scenario Analysis
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your rate is variable, so the honest question isn't what happens at today's
                          rate — it's what happens across a range of rate environments. Both columns
                          re-run the identical simulation with only the rate changed.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Optimistic */}
                        <div className="bg-slate-700/30 border border-emerald-500/30 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-1">
                            <History size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                              Optimistic
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-emerald-400 mb-0.5">
                            {OPTIMISTIC_RATE.toFixed(2)}%
                          </p>
                          <p className="text-[11px] text-slate-500 mb-3 leading-snug">
                            {FED_FUNDS_25YR_AVG.toFixed(2)}% Fed Funds 25-yr avg +{" "}
                            {OPTIMISTIC_MARGIN.toFixed(2)}% margin
                          </p>
                          <MetricRow
                            label="Payoff Timeline"
                            value={scenarios.optimistic.payoffLabel}
                            accent="text-emerald-400"
                          />
                          <MetricRow
                            label="Total Interest Paid"
                            value={fmt(scenarios.optimistic.totalInterest)}
                            accent="text-white"
                          />
                          <MetricRow
                            label="Savings vs. Traditional"
                            value={
                              scenarios.optimistic.interestSaved >= 0
                                ? fmt(scenarios.optimistic.interestSaved)
                                : `−${fmt(Math.abs(scenarios.optimistic.interestSaved))}`
                            }
                            accent={
                              scenarios.optimistic.interestSaved >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          />
                          <MetricRow
                            label="Effective APR"
                            value={
                              scenarios.optimistic.effectiveAPR !== null
                                ? `${scenarios.optimistic.effectiveAPR.toFixed(2)}%`
                                : "—"
                            }
                            accent="text-gold"
                          />
                        </div>

                        {/* Current Rate */}
                        <div className="bg-slate-700/30 border border-teal/50 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-1">
                            <Activity size={14} className="text-teal flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                              Current Rate
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-teal mb-0.5">
                            {scenarios.current.rate.toFixed(2)}%
                          </p>
                          <p className="text-[11px] text-slate-500 mb-3 leading-snug">
                            Today's rate held constant over the loan life
                          </p>
                          <MetricRow
                            label="Payoff Timeline"
                            value={scenarios.current.payoffLabel}
                            accent="text-teal"
                          />
                          <MetricRow
                            label="Total Interest Paid"
                            value={fmt(scenarios.current.totalInterest)}
                            accent="text-white"
                          />
                          <MetricRow
                            label={
                              scenarios.current.interestSaved >= 0
                                ? "Savings vs. Traditional"
                                : "Extra Cost vs. Traditional"
                            }
                            value={
                              scenarios.current.interestSaved >= 0
                                ? fmt(scenarios.current.interestSaved)
                                : `−${fmt(Math.abs(scenarios.current.interestSaved))}`
                            }
                            accent={
                              scenarios.current.interestSaved >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          />
                          <MetricRow
                            label="Effective APR"
                            value={
                              scenarios.current.effectiveAPR !== null
                                ? `${scenarios.current.effectiveAPR.toFixed(2)}%`
                                : "—"
                            }
                            accent="text-gold"
                          />
                        </div>

                        {/* Pessimistic */}
                        <div className="bg-slate-700/30 border border-amber-500/30 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-1">
                            <TrendingUp size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                              Pessimistic
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-amber-400 mb-0.5">
                            {scenarios.pessimistic.rate.toFixed(2)}%
                          </p>
                          <p className="text-[11px] text-slate-500 mb-3 leading-snug">
                            Your {inputs.helocRate.toFixed(2)}% rate +{" "}
                            {PESSIMISTIC_RATE_BUMP.toFixed(2)}% sustained
                          </p>
                          <MetricRow
                            label="Payoff Timeline"
                            value={scenarios.pessimistic.payoffLabel}
                            accent="text-amber-400"
                          />
                          <MetricRow
                            label="Total Interest Paid"
                            value={fmt(scenarios.pessimistic.totalInterest)}
                            accent="text-white"
                          />
                          <MetricRow
                            label={
                              scenarios.pessimistic.interestSaved >= 0
                                ? "Savings vs. Traditional"
                                : "Extra Cost vs. Traditional"
                            }
                            value={
                              scenarios.pessimistic.interestSaved >= 0
                                ? fmt(scenarios.pessimistic.interestSaved)
                                : `−${fmt(Math.abs(scenarios.pessimistic.interestSaved))}`
                            }
                            accent={
                              scenarios.pessimistic.interestSaved >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          />
                          <MetricRow
                            label="Effective APR"
                            value={
                              scenarios.pessimistic.effectiveAPR !== null
                                ? `${scenarios.pessimistic.effectiveAPR.toFixed(2)}%`
                                : "—"
                            }
                            accent="text-gold"
                          />
                        </div>
                      </div>

                      {scenarios.alreadyBetterThanHistorical && (
                        <div className="flex items-start gap-2 mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                          <Info size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-200 leading-relaxed">
                            Your current rate of {inputs.helocRate.toFixed(2)}% is already below the{" "}
                            {OPTIMISTIC_RATE.toFixed(2)}% historical-average scenario — today's pricing
                            is better than the 25-year norm, not worse. Treat the optimistic column as
                            a floor you are already beating rather than an upside case.
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-700/60">
                        Both scenarios hold the rate constant at the stated level for the full term —
                        a modeling simplification, not a forecast. Actual first-lien HELOC rates move
                        with their index (SOFR or Prime) plus your margin and can change monthly.
                        Fed Funds 25-year average computed from FRED series FEDFUNDS, calendar years
                        2001–2025.
                      </p>
                    </div>
                  )}

                  {/* Paydown Summary (CMG AIO simulator format) */}
                  {paydown && (
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <Scale size={16} className="text-teal" />
                          Paydown Summary
                        </h3>
                        <button
                          onClick={handlePrint}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 border border-slate-600 text-slate-200 hover:border-teal/50 hover:text-white transition"
                        >
                          <Printer size={13} />
                          Print / Save as PDF
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* All-In-One HELOC side */}
                        <div className="bg-slate-700/30 border border-teal/30 rounded-lg p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-2">
                            All-In-One HELOC
                          </p>
                          <MetricRow
                            label="Avg. Minimum Monthly Payment"
                            value={fmt(paydown.heloc.avgMinMonthlyPayment)}
                            tooltip="The minimum payment on a HELOC is interest-only. This is the average monthly interest charge over the life of the loan — it starts near the first month's charge and falls toward zero as the balance drops."
                            accent="text-teal"
                          />
                          <MetricRow
                            label="Avg. Principal Reduced Monthly"
                            value={result.heloc.paidOff ? fmt(paydown.heloc.avgPrincipalMonthly) : "—"}
                            tooltip="Original balance divided by months to payoff — the average pace at which the sweep retires principal each month."
                            accent="text-teal"
                          />
                          <MetricRow
                            label="Avg. Principal Reduced Annually"
                            value={result.heloc.paidOff ? `${paydown.heloc.avgPrincipalAnnualPct.toFixed(1)}%` : "—"}
                            tooltip="Average annual principal reduction as a percentage of your original balance. Higher is faster."
                            accent="text-teal"
                          />
                          <MetricRow
                            label="Interest as % of Principal"
                            value={`${paydown.heloc.interestPctOfPrincipal.toFixed(0)}%`}
                            tooltip="Total interest paid divided by original principal. On a traditional 30-year loan at ~6.5% this exceeds 125% — you pay for the house more than twice."
                            accent="text-teal"
                          />
                          <MetricRow
                            label="Comparison Loan Effective APR"
                            value={result.heloc.paidOff ? `${paydown.heloc.effectiveAPR.toFixed(2)}%` : "—"}
                            tooltip="The annual percentage rate that a 30-year fixed mortgage would need to have in order to cost the same total interest as the All-in-One HELOC — reflecting how efficiently the sweep mechanism reduces your borrowing cost."
                            accent="text-gold"
                          />
                          <MetricRow
                            label="Breakeven Average Rate"
                            value={
                              paydown.heloc.breakevenRate !== null
                                ? `${paydown.heloc.breakevenRate.toFixed(2)}%`
                                : "—"
                            }
                            tooltip="How high the HELOC rate could average over the life of the loan before total interest matches the traditional mortgage. The gap between this and today's rate is your rate-risk cushion."
                            accent="text-gold"
                          />
                        </div>
                        {/* Traditional side */}
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">
                            Comparison (Traditional) Loan
                          </p>
                          <MetricRow
                            label="Minimum Monthly Payment"
                            value={fmt(paydown.traditional.minMonthlyPayment)}
                          />
                          <MetricRow
                            label="Avg. Principal Reduced Monthly"
                            value={fmt(paydown.traditional.avgPrincipalMonthly)}
                          />
                          <MetricRow
                            label="Avg. Principal Reduced Annually"
                            value={`${paydown.traditional.avgPrincipalAnnualPct.toFixed(1)}%`}
                          />
                          <MetricRow
                            label="Interest as % of Principal"
                            value={`${paydown.traditional.interestPctOfPrincipal.toFixed(0)}%`}
                          />
                          <MetricRow
                            label="Average Loan APR"
                            value={`${paydown.traditional.avgAPR.toFixed(2)}%`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                                  {fmt(row.availableCredit)}
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

              {/* FAQ */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
                <h2 className="font-bold text-lg text-white mb-4">Frequently Asked Questions</h2>
                <div className="divide-y divide-slate-700/60">
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-3 py-3.5 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-200">{item.q}</span>
                        {openFaq === i ? (
                          <ChevronUp size={16} className="text-teal shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-500 shrink-0" />
                        )}
                      </button>
                      {openFaq === i && (
                        <p className="text-sm text-slate-400 leading-relaxed pb-4 pr-6">{item.a}</p>
                      )}
                    </div>
                  ))}
                </div>
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


      {/* ─── Print-only report ────────────────────────────────────────────────
          Sibling of the no-print-page sections so the print CSS can hide the
          interactive UI and reveal this light-background report instead. */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      {result && paydown && (
        <div id="heloc-print-report">
          {/* ── Header ── */}
          <div className="hpr-header">
            <div>
              <div className="hpr-brand">RealityCents.com</div>
              <div className="hpr-brand-sub">Hawaii Mortgage Education &amp; Analysis</div>
            </div>
            <div className="hpr-meta">
              <div className="hpr-meta-name">Jay Miller — Sales Manager / CMA</div>
              <div>NMLS #657301 · CMG Home Loans · Branch NMLS #2475890</div>
              <div>(808) 429-0811 · www.jay-miller.com</div>
              <div>
                Generated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <h1 className="hpr-title">First-Lien HELOC Sweep Analysis</h1>
          <p className="hpr-subtitle">
            Day-by-day simulation of an all-in-one first-lien HELOC with sweep checking, compared
            against a {inputs.traditionalRate.toFixed(2)}% {inputs.traditionalTermYears}-year fixed
            mortgage on the same balance.
          </p>

          {/* ── Headline results banner ── */}
          <div className="hpr-highlight">
            <div>
              <div className="hpr-badge">Personalized Results</div>
              <div className="hpr-big-label">HELOC Payoff Timeline</div>
              <div className="hpr-big-number">
                {result.heloc.paidOff
                  ? formatMonths(result.heloc.payoffMonths)
                  : `No payoff within ${inputs.termYears} yrs`}
              </div>
              <div className="hpr-highlight-sub">
                vs. {formatMonths(result.traditional.payoffMonths)} on the traditional loan
                {result.monthsSaved > 0
                  ? ` · ${(result.monthsSaved / 12).toFixed(1)} years sooner`
                  : ""}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="hpr-kpi-label">Interest Saved</div>
              <div className="hpr-kpi-value">{fmt(Math.max(result.interestSaved, 0))}</div>
              <div className="hpr-highlight-sub">
                {fmt(result.heloc.totalInterest)} HELOC vs. {fmt(result.traditional.totalInterest)}{" "}
                traditional
              </div>
            </div>
          </div>

          {/* ── Input summary ── */}
          <div className="hpr-section">
            <h2>Input Summary</h2>
            <div className="hpr-grid">
              <div>
                <div className="hpr-row">
                  <span className="label">Loan Amount (Starting Balance)</span>
                  <span className="value">{fmt(inputs.startingBalance)}</span>
                </div>
                <div className="hpr-row">
                  <span className="label">HELOC Rate (variable)</span>
                  <span className="value">{inputs.helocRate.toFixed(3)}%</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Loan Term</span>
                  <span className="value">{inputs.termYears} years</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Net Income (per deposit)</span>
                  <span className="value">{fmt(inputs.netIncome)}</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Deposit Frequency</span>
                  <span className="value">
                    {DEPOSIT_FREQUENCY_OPTIONS.find((o) => o.value === inputs.depositFrequency)
                      ?.label ?? inputs.depositFrequency}
                  </span>
                </div>
                <div className="hpr-row">
                  <span className="label">Monthly Income (equivalent)</span>
                  <span className="value">{fmt(monthlyIncomeTotal)}</span>
                </div>
              </div>
              <div>
                <div className="hpr-row">
                  <span className="label">Property Taxes</span>
                  <span className="value">{fmt(inputs.monthlyPropertyTax)}/mo</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Homeowner's Insurance</span>
                  <span className="value">{fmt(inputs.monthlyInsurance)}/mo</span>
                </div>
                <div className="hpr-row">
                  <span className="label">HOA</span>
                  <span className="value">{fmt(inputs.monthlyHOA)}/mo</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Living Expenses</span>
                  <span className="value">{fmt(inputs.monthlyLivingExpenses)}/mo</span>
                </div>
                <div className="hpr-row">
                  <span className="label">
                    Extra Deposit
                    {inputs.extraDeposit > 0
                      ? ` (${inputs.extraDepositFrequency === "annually" ? "annual" : "one-time"})`
                      : ""}
                  </span>
                  <span className="value">{fmt(inputs.extraDeposit)}</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Comparison Loan</span>
                  <span className="value">
                    {inputs.traditionalRate.toFixed(2)}% · {inputs.traditionalTermYears}-yr fixed
                  </span>
                </div>
              </div>
            </div>
            <div className="hpr-grid" style={{ marginTop: "6pt" }}>
              <div>
                <div className="hpr-row total">
                  <span className="label">Net Surplus After Interest</span>
                  <span className="value">{fmt(netSurplusToPrincipal)}/mo</span>
                </div>
                <div className="hpr-row">
                  <span className="label" style={{ fontStyle: "italic", fontSize: "7pt" }}>
                    ({fmt(monthlySurplus)} income surplus − ~{fmt(Math.round(minMonthlyInterest))} interest auto-debited on the 21st)
                  </span>
                  <span className="value"></span>
                </div>
              </div>
              <div>
                <div className="hpr-row total">
                  <span className="label">Traditional P&amp;I Payment</span>
                  <span className="value">{fmt(result.traditional.monthlyPayment)}/mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Key insights ── */}
          <div className="hpr-section">
            <h2>Key Insights</h2>
            <div className="hpr-cards">
              <div className="hpr-card">
                <div className="hpr-card-label">Effective Borrowing Cost</div>
                <div className="hpr-card-value">
                  {result.heloc.paidOff ? `${paydown.heloc.effectiveAPR.toFixed(2)}%` : "—"}
                </div>
                <div className="hpr-card-sub">
                  equivalent fixed rate — your {inputs.helocRate.toFixed(2)}% performs like this
                </div>
              </div>
              <div className="hpr-card">
                <div className="hpr-card-label">Rate Cushion Before You Lose</div>
                <div className="hpr-card-value">
                  {paydown.heloc.breakevenRate != null
                    ? `${(paydown.heloc.breakevenRate - inputs.helocRate).toFixed(2)}%`
                    : "—"}
                </div>
                <div className="hpr-card-sub">
                  how far rates can rise before the traditional loan wins
                </div>
              </div>
              <div className="hpr-card">
                <div className="hpr-card-label">Interest Cost as % of Loan</div>
                <div className="hpr-card-value">
                  {paydown.heloc.interestPctOfPrincipal.toFixed(0)}%
                </div>
                <div className="hpr-card-sub">
                  vs. {paydown.traditional.interestPctOfPrincipal.toFixed(0)}% traditional
                </div>
              </div>
              <div className="hpr-card">
                <div className="hpr-card-label">Net Surplus After Interest</div>
                <div className="hpr-card-value">{fmt(netSurplusToPrincipal)}</div>
                <div className="hpr-card-sub">
                  {fmt(monthlySurplus)} surplus − ~{fmt(Math.round(minMonthlyInterest))} interest (auto-debited 21st)
                </div>
              </div>
              <div className="hpr-card">
                <div className="hpr-card-label">Liquidity After Month 1</div>
                <div className="hpr-card-value">{fmt(currentLiquidity)}</div>
                <div className="hpr-card-sub">
                  principal paid down and re-borrowable from the line
                </div>
              </div>
            </div>
          </div>

          {/* ── Paydown summary ── (moved above scenarios per user request) */}
          <div className="hpr-section">
            <h2>Paydown Summary</h2>
            <div className="hpr-grid">
              <div>
                <div className="hpr-row head">
                  <span className="label">All-In-One HELOC</span>
                  <span className="value"></span>
                </div>
                <div className="hpr-row">
                  <span className="label">Avg. Minimum Monthly Payment</span>
                  <span className="value">{fmt(paydown.heloc.avgMinMonthlyPayment)}</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Avg. Principal Reduced Monthly</span>
                  <span className="value">
                    {result.heloc.paidOff ? fmt(paydown.heloc.avgPrincipalMonthly) : "—"}
                  </span>
                </div>
                <div className="hpr-row">
                  <span className="label">Avg. Principal Reduced Annually</span>
                  <span className="value">
                    {result.heloc.paidOff
                      ? `${paydown.heloc.avgPrincipalAnnualPct.toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <div className="hpr-row">
                  <span className="label">Interest as % of Principal</span>
                  <span className="value">{paydown.heloc.interestPctOfPrincipal.toFixed(0)}%</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Comparison Loan Effective APR</span>
                  <span className="value">
                    {result.heloc.paidOff ? `${paydown.heloc.effectiveAPR.toFixed(2)}%` : "—"}
                  </span>
                </div>
                <div className="hpr-row total">
                  <span className="label">Breakeven Average Rate</span>
                  <span className="value">
                    {paydown.heloc.breakevenRate !== null
                      ? `${paydown.heloc.breakevenRate.toFixed(2)}%`
                      : "—"}
                  </span>
                </div>
              </div>
              <div>
                <div className="hpr-row head">
                  <span className="label">Comparison (Traditional) Loan</span>
                  <span className="value"></span>
                </div>
                <div className="hpr-row">
                  <span className="label">Minimum Monthly Payment</span>
                  <span className="value">{fmt(paydown.traditional.minMonthlyPayment)}</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Avg. Principal Reduced Monthly</span>
                  <span className="value">{fmt(paydown.traditional.avgPrincipalMonthly)}</span>
                </div>
                <div className="hpr-row">
                  <span className="label">Avg. Principal Reduced Annually</span>
                  <span className="value">
                    {paydown.traditional.avgPrincipalAnnualPct.toFixed(1)}%
                  </span>
                </div>
                <div className="hpr-row">
                  <span className="label">Interest as % of Principal</span>
                  <span className="value">
                    {paydown.traditional.interestPctOfPrincipal.toFixed(0)}%
                  </span>
                </div>
                <div className="hpr-row">
                  <span className="label">Total Interest Paid</span>
                  <span className="value">{fmt(result.traditional.totalInterest)}</span>
                </div>
                <div className="hpr-row total">
                  <span className="label">Average Loan APR</span>
                  <span className="value">{paydown.traditional.avgAPR.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scenario analysis ── */}
          {scenarios && (
            <div className="hpr-section">
              <h2>Rate Scenario Analysis</h2>
              <div className="hpr-scenarios">
                <div className="hpr-scenario optimistic">
                  <div className="hpr-scenario-title">Optimistic — Rates Average Historical Norms</div>
                  <div className="hpr-scenario-rate">{OPTIMISTIC_RATE.toFixed(2)}%</div>
                  <div className="hpr-scenario-basis">
                    {FED_FUNDS_25YR_AVG.toFixed(2)}% Fed Funds 25-yr avg (2001–2025) +{" "}
                    {OPTIMISTIC_MARGIN.toFixed(2)}% margin
                  </div>
                  <div className="hpr-row">
                    <span className="label">Payoff Timeline</span>
                    <span className="value">{scenarios.optimistic.payoffLabel}</span>
                  </div>
                  <div className="hpr-row">
                    <span className="label">Total Interest</span>
                    <span className="value">{fmt(scenarios.optimistic.totalInterest)}</span>
                  </div>
                  <div className="hpr-row">
                    <span className="label">
                      {scenarios.optimistic.interestSaved >= 0
                        ? "Savings vs. Traditional"
                        : "Extra Cost vs. Traditional"}
                    </span>
                    <span className="value">
                      {fmt(Math.abs(scenarios.optimistic.interestSaved))}
                    </span>
                  </div>
                  <div className="hpr-row total">
                    <span className="label">Effective APR</span>
                    <span className="value">
                      {scenarios.optimistic.effectiveAPR !== null
                        ? `${scenarios.optimistic.effectiveAPR.toFixed(2)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="hpr-scenario" style={{ borderLeft: "3pt solid #1A7A7A" }}>
                  <div className="hpr-scenario-title">Current Rate</div>
                  <div className="hpr-scenario-rate">{scenarios.current.rate.toFixed(2)}%</div>
                  <div className="hpr-scenario-basis">
                    Today's rate held constant over the loan life
                  </div>
                  <div className="hpr-row">
                    <span className="label">Payoff Timeline</span>
                    <span className="value">{scenarios.current.payoffLabel}</span>
                  </div>
                  <div className="hpr-row">
                    <span className="label">Total Interest</span>
                    <span className="value">{fmt(scenarios.current.totalInterest)}</span>
                  </div>
                  <div className="hpr-row">
                    <span className="label">
                      {scenarios.current.interestSaved >= 0
                        ? "Savings vs. Traditional"
                        : "Extra Cost vs. Traditional"}
                    </span>
                    <span className="value">
                      {fmt(Math.abs(scenarios.current.interestSaved))}
                    </span>
                  </div>
                  <div className="hpr-row total">
                    <span className="label">Effective APR</span>
                    <span className="value">
                      {scenarios.current.effectiveAPR !== null
                        ? `${scenarios.current.effectiveAPR.toFixed(2)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="hpr-scenario pessimistic">
                  <div className="hpr-scenario-title">Pessimistic — Rates Average 2% Higher</div>
                  <div className="hpr-scenario-rate">{scenarios.pessimistic.rate.toFixed(2)}%</div>
                  <div className="hpr-scenario-basis">
                    Your {inputs.helocRate.toFixed(2)}% rate +{" "}
                    {PESSIMISTIC_RATE_BUMP.toFixed(2)}% sustained over the loan life
                  </div>
                  <div className="hpr-row">
                    <span className="label">Payoff Timeline</span>
                    <span className="value">{scenarios.pessimistic.payoffLabel}</span>
                  </div>
                  <div className="hpr-row">
                    <span className="label">Total Interest</span>
                    <span className="value">{fmt(scenarios.pessimistic.totalInterest)}</span>
                  </div>
                  <div className="hpr-row">
                    <span className="label">
                      {scenarios.pessimistic.interestSaved >= 0
                        ? "Savings vs. Traditional"
                        : "Extra Cost vs. Traditional"}
                    </span>
                    <span className="value">
                      {fmt(Math.abs(scenarios.pessimistic.interestSaved))}
                    </span>
                  </div>
                  <div className="hpr-row total">
                    <span className="label">Effective APR</span>
                    <span className="value">
                      {scenarios.pessimistic.effectiveAPR !== null
                        ? `${scenarios.pessimistic.effectiveAPR.toFixed(2)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
              {scenarios.alreadyBetterThanHistorical && (
                <p className="hpr-note">
                  Note: your rate of {inputs.helocRate.toFixed(2)}% is already below the{" "}
                  {OPTIMISTIC_RATE.toFixed(2)}% historical-average scenario — current pricing
                  is better than the 25-year norm.
                </p>
              )}
              <p className="hpr-note">
                Each scenario holds the rate constant for the full term — a modeling simplification,
                not a forecast. Fed Funds average from FRED series FEDFUNDS, 2001–2025.
              </p>
            </div>
          )}

          {/* ── Analysis & recommendation ── */}
          <div className="hpr-section">
            <div className="hpr-callout">
              <div className="hpr-callout-title">Analysis &amp; Recommendation</div>
              <div className="hpr-callout-body">
                <p>{recommendation.p1}</p>
                <p>{recommendation.p2}</p>
              </div>
            </div>
          </div>

          {/* ── Year-by-year detail (own page) ── */}
          <div className="hpr-page-break">
            <div className="hpr-header">
              <div>
                <div className="hpr-brand">RealityCents.com</div>
                <div className="hpr-brand-sub">Year-by-Year Detail</div>
              </div>
              <div className="hpr-meta">
                <div className="hpr-meta-name">Jay Miller — NMLS #657301</div>
                <div>CMG Home Loans · Branch NMLS #2475890</div>
              </div>
            </div>

            <h2
              style={{
                fontSize: "9.5pt",
                fontWeight: 700,
                color: "#0C2340",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 5pt 0",
                paddingBottom: "2.5pt",
                borderBottom: "1.5pt solid #d1d5db",
              }}
            >
              Year-by-Year Breakdown
            </h2>
            <p className="hpr-note" style={{ marginBottom: "6pt" }}>
              All-In-One HELOC vs. the {inputs.traditionalRate.toFixed(2)}%{" "}
              {inputs.traditionalTermYears}-year fixed comparison loan. HELOC principal reflects the
              balance reduction after that year's interest is capitalized to the line.
            </p>

            <table className="hpr-table">
              <thead>
                <tr>
                  <th className="yr" rowSpan={2}>
                    Yr
                  </th>
                  <th className="grp aio sep" colSpan={5}>
                    All-In-One HELOC
                  </th>
                  <th className="grp trad sep" colSpan={5}>
                    Traditional Mortgage
                  </th>
                </tr>
                <tr>
                  <th className="sep">Start Bal.</th>
                  <th>Interest</th>
                  <th>Principal</th>
                  <th>End Bal.</th>
                  <th>Cum. Int.</th>
                  <th className="sep">Start Bal.</th>
                  <th>Interest</th>
                  <th>Principal</th>
                  <th>End Bal.</th>
                  <th>Cum. Int.</th>
                </tr>
              </thead>
              <tbody>
                {printYearRows.map((row) => {
                  const isPayoff =
                    result.heloc.paidOff && row.year === Math.ceil(result.heloc.payoffMonths / 12);
                  return (
                    <tr key={row.year} className={isPayoff ? "payoff" : undefined}>
                      <td className="yr">{row.year}</td>
                      <td className="sep">{fmt(row.helocStart)}</td>
                      <td>{fmt(row.helocInterest)}</td>
                      <td>{fmt(row.helocPrincipal)}</td>
                      <td>{fmt(row.helocEnd)}</td>
                      <td>{fmt(row.helocCumInterest)}</td>
                      <td className="sep">{fmt(row.tradStart)}</td>
                      <td>{fmt(row.tradInterest)}</td>
                      <td>{fmt(row.tradPrincipal)}</td>
                      <td>{fmt(row.tradEnd)}</td>
                      <td>{fmt(row.tradCumInterest)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="yr">Tot</td>
                  <td className="sep">—</td>
                  <td>
                    {fmt(printYearRows.reduce((s, r) => s + r.helocInterest, 0))}
                  </td>
                  <td>
                    {fmt(printYearRows.reduce((s, r) => s + r.helocPrincipal, 0))}
                  </td>
                  <td>—</td>
                  <td>
                    {fmt(printYearRows[printYearRows.length - 1]?.helocCumInterest ?? 0)}
                  </td>
                  <td className="sep">—</td>
                  <td>{fmt(printYearRows.reduce((s, r) => s + r.tradInterest, 0))}</td>
                  <td>{fmt(printYearRows.reduce((s, r) => s + r.tradPrincipal, 0))}</td>
                  <td>—</td>
                  <td>
                    {fmt(printYearRows[printYearRows.length - 1]?.tradCumInterest ?? 0)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <p className="hpr-note">
              Line access: full draw access to the original credit limit for the first 10 years.
              Starting in year 11, the credit limit reduces by 1/240th of the original balance each
              month, while access to the declining line continues for the full 30-year term.
            </p>
          </div>

          {/* ── Footer / compliance ── */}
          <div className="hpr-footer">
            <div className="hpr-footer-name">
              Jay Miller | NMLS# 657301 | CMG Home Loans | Branch NMLS# 2475890
            </div>
            <div className="hpr-disclaimer">
              Educational tool only — not a commitment to lend. Rates, terms, and eligibility vary.
              Actual results depend on income, spending patterns, and rate environment. Consult a
              licensed professional.
            </div>
            <div className="hpr-disclaimer" style={{ marginTop: "3pt" }}>
              First-lien HELOC rates are variable and tied to an index (typically SOFR or Prime) plus
              a margin; a rate increase changes these results materially. CMG Mortgage, Inc. dba CMG
              Home Loans — NMLS #1820. Licensed in Hawaii. Equal Housing Opportunity. ·
              www.realitycents.com · www.jay-miller.com
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
