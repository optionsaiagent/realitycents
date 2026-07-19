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
                          Available Liquidity
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
                    <p className="text-xs text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-700/60">
                      <span className="text-slate-300 font-medium">Line access:</span> Full draw
                      access for the first 10 years. Starting in year 11, the credit limit reduces
                      by 1/240th of the original balance each month — but you retain access to the
                      line for the full 30-year term.
                    </p>
                  </div>

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
                            tooltip="The fixed rate that would produce the same total interest over the same payoff period. This translates the sweep effect into a familiar number — it is not a quoted rate."
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

      {/* ─── Print-only report (sibling of no-print-page sections, inside Layout) ─── */}
      {result && paydown && (
        <div className="print-only hidden" id="print-summary-content">
          <div className="print-summary">
            {/* Header */}
            <div className="print-header">
              <div>
                <div className="print-logo-text">RealityCents</div>
                <div className="print-logo-tagline">Hawaii Mortgage Education &amp; Lending</div>
              </div>
              <div className="print-meta">
                <div className="print-meta-name">Jay Miller — NMLS #657301</div>
                <div>CMG Home Loans — Branch NMLS #2475890</div>
                <div>(808) 429-0811 · jaym@cmghomeloans.com</div>
                <div>www.jay-miller.com</div>
                <div className="print-meta-date">
                  Generated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Title + Highlight banner */}
            <div className="print-highlight print-section">
              <div className="print-highlight-left">
                <div className="print-badge">First-Lien HELOC Sweep Analysis</div>
                <div className="big-label">Personalized Results</div>
                <div className="big-number">
                  {result.heloc.paidOff ? formatMonths(result.heloc.payoffMonths) : "No payoff in term"}
                </div>
                <div className="print-highlight-sub">
                  HELOC payoff vs. {formatMonths(result.traditional.payoffMonths)} traditional ·
                  Interest saved: {fmt(Math.max(result.interestSaved, 0))}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "8.5pt", color: "#6b7280", fontFamily: "Arial, sans-serif" }}>
                <div style={{ fontWeight: 600, color: "#0C2340", fontSize: "9.5pt" }}>Interest Saved</div>
                <div style={{ fontSize: "14pt", fontWeight: 700, color: "#1A7A7A", fontFamily: "Georgia, serif" }}>
                  {fmt(Math.max(result.interestSaved, 0))}
                </div>
                <div style={{ marginTop: "6pt", fontWeight: 600, color: "#0C2340", fontSize: "9.5pt" }}>Time Saved</div>
                <div style={{ fontSize: "11pt", fontWeight: 600, color: "#374151", fontFamily: "Georgia, serif" }}>
                  {result.monthsSaved > 0 ? formatMonths(result.monthsSaved) : "—"}
                </div>
              </div>
            </div>

            {/* Input Parameters */}
            <div className="print-section">
              <h2>Input Parameters</h2>
              <div className="print-grid">
                <div>
                  <div className="print-row"><span className="label">Starting Balance</span><span className="value">{fmt(inputs.startingBalance)}</span></div>
                  <div className="print-row"><span className="label">HELOC Rate (variable)</span><span className="value">{inputs.helocRate.toFixed(3)}%</span></div>
                  <div className="print-row"><span className="label">Term</span><span className="value">{inputs.termYears} years</span></div>
                  <div className="print-row"><span className="label">Net Income (per deposit)</span><span className="value">{fmt(inputs.netIncome)}</span></div>
                  <div className="print-row"><span className="label">Deposit Frequency</span><span className="value">{DEPOSIT_FREQUENCY_OPTIONS.find((o) => o.value === inputs.depositFrequency)?.label ?? inputs.depositFrequency}</span></div>
                  <div className="print-row"><span className="label">Monthly Income (equivalent)</span><span className="value">{fmt(monthlyIncomeTotal)}</span></div>
                </div>
                <div>
                  <div className="print-row"><span className="label">Property Taxes</span><span className="value">{fmt(inputs.monthlyPropertyTax)}/mo</span></div>
                  <div className="print-row"><span className="label">Homeowner's Insurance</span><span className="value">{fmt(inputs.monthlyInsurance)}/mo</span></div>
                  <div className="print-row"><span className="label">HOA</span><span className="value">{fmt(inputs.monthlyHOA)}/mo</span></div>
                  <div className="print-row"><span className="label">Living Expenses</span><span className="value">{fmt(inputs.monthlyLivingExpenses)}/mo</span></div>
                  {inputs.extraDeposit > 0 && (
                    <div className="print-row"><span className="label">Extra Deposit ({inputs.extraDepositFrequency === "annually" ? "annual" : "one-time"})</span><span className="value">{fmt(inputs.extraDeposit)}</span></div>
                  )}
                  <div className="print-row"><span className="label">Comparison Loan</span><span className="value">{inputs.traditionalRate.toFixed(2)}% · {inputs.traditionalTermYears}-yr fixed</span></div>
                </div>
              </div>
            </div>

            {/* Paydown Summary */}
            <div className="print-section">
              <h2>Paydown Summary</h2>
              <div className="print-grid">
                <div>
                  <div className="print-row" style={{ fontWeight: 700 }}><span className="label">All-In-One HELOC</span><span className="value"></span></div>
                  <div className="print-row"><span className="label">Avg. Minimum Monthly Payment</span><span className="value">{fmt(paydown.heloc.avgMinMonthlyPayment)}</span></div>
                  <div className="print-row"><span className="label">Avg. Principal Reduced Monthly</span><span className="value">{result.heloc.paidOff ? fmt(paydown.heloc.avgPrincipalMonthly) : "—"}</span></div>
                  <div className="print-row"><span className="label">Avg. Principal Reduced Annually</span><span className="value">{result.heloc.paidOff ? `${paydown.heloc.avgPrincipalAnnualPct.toFixed(1)}%` : "—"}</span></div>
                  <div className="print-row"><span className="label">Interest as % of Principal</span><span className="value">{paydown.heloc.interestPctOfPrincipal.toFixed(0)}%</span></div>
                  <div className="print-row"><span className="label">Comparison Loan Effective APR</span><span className="value">{result.heloc.paidOff ? `${paydown.heloc.effectiveAPR.toFixed(2)}%` : "—"}</span></div>
                  <div className="print-row total"><span className="label">Breakeven Average Rate</span><span className="value">{paydown.heloc.breakevenRate !== null ? `${paydown.heloc.breakevenRate.toFixed(2)}%` : "—"}</span></div>
                </div>
                <div>
                  <div className="print-row" style={{ fontWeight: 700 }}><span className="label">Comparison (Traditional) Loan</span><span className="value"></span></div>
                  <div className="print-row"><span className="label">Minimum Monthly Payment</span><span className="value">{fmt(paydown.traditional.minMonthlyPayment)}</span></div>
                  <div className="print-row"><span className="label">Avg. Principal Reduced Monthly</span><span className="value">{fmt(paydown.traditional.avgPrincipalMonthly)}</span></div>
                  <div className="print-row"><span className="label">Avg. Principal Reduced Annually</span><span className="value">{paydown.traditional.avgPrincipalAnnualPct.toFixed(1)}%</span></div>
                  <div className="print-row"><span className="label">Interest as % of Principal</span><span className="value">{paydown.traditional.interestPctOfPrincipal.toFixed(0)}%</span></div>
                  <div className="print-row total"><span className="label">Average Loan APR</span><span className="value">{paydown.traditional.avgAPR.toFixed(2)}%</span></div>
                </div>
              </div>
            </div>

            {/* Analysis & Recommendation */}
            <div className="print-section">
              <div className="print-notes-box" style={{ background: "#f0fafa", border: "1pt solid #1A7A7A" }}>
                <div className="print-notes-title">Analysis &amp; Recommendation</div>
                <div className="print-notes-body">
                  <p style={{ margin: "0 0 6pt 0" }}>{recommendation.p1}</p>
                  <p style={{ margin: 0 }}>{recommendation.p2}</p>
                </div>
              </div>
            </div>

            {/* Contact + Disclaimer */}
            <div className="print-note" style={{ fontWeight: 600, marginBottom: "4pt" }}>
              Jay Miller | Sales Manager/CMA | CMG Home Loans | NMLS #657301 | Branch NMLS #2475890 | www.jay-miller.com
            </div>
            <div className="print-note">
              This analysis is for informational and educational purposes only and does not constitute a loan
              commitment, pre-approval, or guarantee of financing. First-lien HELOC rates are variable; actual
              rates, terms, and product availability vary by lender and borrower profile. Results depend on
              maintaining the modeled cash flow. CMG Mortgage, Inc. dba CMG Home Loans — NMLS #1820. Licensed in
              Hawaii. Equal Housing Opportunity. www.realitycents.com
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
