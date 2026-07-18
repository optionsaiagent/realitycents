/*
 * Pacific Modernism — First-Lien HELOC Sweep Calculator Math Engine
 * Simulates a first-lien HELOC with an integrated sweep-checking account
 * using day-by-day balance tracking, compared against a traditional
 * fixed-rate mortgage amortization.
 */

export type DepositFrequency = "monthly" | "weekly" | "bi-weekly" | "semi-monthly";
export type ExtraDepositFrequency = "one-time" | "annually";

export interface HelocSweepInputs {
  startingBalance: number;       // starting HELOC balance ($)
  helocRate: number;             // annual rate (%)
  termYears: number;             // loan term (years)
  drawPeriodYears: number;       // draw period (years)
  netIncome: number;             // net income per deposit period ($)
  depositFrequency: DepositFrequency;
  monthlyExpenses: number;       // total monthly expenses ($)
  extraDeposit: number;          // one-time / recurring extra deposit ($)
  extraDepositFrequency: ExtraDepositFrequency;
  traditionalRate: number;       // traditional fixed rate (%)
  traditionalTermYears: number;  // traditional term (years)
}

export interface DailyPoint {
  day: number;       // day index from start (0-based)
  balance: number;   // end-of-day balance
}

export interface MonthlyPoint {
  month: number;             // 1-based month index
  endBalance: number;
  interestCharged: number;   // interest charged this month
  cumulativeInterest: number;
}

export interface YearRow {
  year: number;
  helocBalance: number;          // end-of-year HELOC balance
  traditionalBalance: number;    // end-of-year traditional balance
  helocInterest: number;         // HELOC interest charged that year
  traditionalInterest: number;   // traditional interest paid that year
  availableCredit: number | null; // startingBalance - helocBalance during draw period, null after
}

export interface HelocSweepResult {
  paidOff: boolean;
  payoffMonths: number;          // total months to payoff (or simulation cap)
  totalInterest: number;
  dailyPoints: DailyPoint[];     // first N days for the sawtooth detail
  monthlyPoints: MonthlyPoint[];
  avgDailyBalanceYear1: number;
}

export interface TraditionalResult {
  payoffMonths: number;
  totalInterest: number;
  monthlyPayment: number;
  monthlyBalances: number[];     // end-of-month balances, index 0 = month 1
  monthlyInterest: number[];     // interest paid each month
}

export interface ComparisonResult {
  heloc: HelocSweepResult;
  traditional: TraditionalResult;
  interestSaved: number;
  monthsSaved: number;
  monthlySurplus: number;
  yearRows: YearRow[];
  chartData: { year: number; heloc: number | null; traditional: number | null }[];
  sawtoothData: { day: number; balance: number }[];
  feasible: boolean;             // surplus > 0 means the strategy can work
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SAWTOOTH_DAYS = 92; // ~3 months of daily detail

function daysInMonth(monthIndex: number): number {
  // Ignore leap years for simplicity — negligible effect on a simulation like this
  return DAYS_IN_MONTH[monthIndex % 12];
}

/** Convert per-period net income deposits into a set of deposit days for a given month. */
function depositDaysForMonth(
  frequency: DepositFrequency,
  dim: number,
  globalDayStart: number
): { dayOfMonth: number; amount: number }[] {
  // amounts are handled by the caller (per-deposit amount = netIncome as entered)
  switch (frequency) {
    case "monthly":
      return [{ dayOfMonth: 1, amount: 1 }];
    case "semi-monthly":
      return [
        { dayOfMonth: 1, amount: 1 },
        { dayOfMonth: 15, amount: 1 },
      ];
    case "bi-weekly": {
      // every 14 days from global day 0
      const days: { dayOfMonth: number; amount: number }[] = [];
      for (let d = 0; d < dim; d++) {
        if ((globalDayStart + d) % 14 === 0) days.push({ dayOfMonth: d + 1, amount: 1 });
      }
      return days;
    }
    case "weekly": {
      const days: { dayOfMonth: number; amount: number }[] = [];
      for (let d = 0; d < dim; d++) {
        if ((globalDayStart + d) % 7 === 0) days.push({ dayOfMonth: d + 1, amount: 1 });
      }
      return days;
    }
  }
}

/**
 * Day-by-day HELOC sweep simulation.
 * - Deposits reduce the balance on deposit days
 * - Daily expenses (monthlyExpenses / daysInMonth) increase the balance each day
 * - Interest accrues daily (rate / 365 * balance), charged monthly (added to balance)
 * - Extra deposit applies on day 1 of month 1 (and every 12 months if recurring)
 */
export function simulateHelocSweep(inputs: HelocSweepInputs): HelocSweepResult {
  const {
    startingBalance,
    helocRate,
    termYears,
    netIncome,
    depositFrequency,
    monthlyExpenses,
    extraDeposit,
    extraDepositFrequency,
  } = inputs;

  const dailyRate = helocRate / 100 / 365;
  const maxMonths = Math.max(termYears, 1) * 12;

  let balance = startingBalance;
  let cumulativeInterest = 0;
  let accruedInterest = 0;
  let globalDay = 0;
  let paidOff = false;
  let payoffMonths = maxMonths;

  const dailyPoints: DailyPoint[] = [];
  const monthlyPoints: MonthlyPoint[] = [];

  let year1BalanceSum = 0;
  let year1Days = 0;

  for (let m = 0; m < maxMonths && !paidOff; m++) {
    const dim = daysInMonth(m);
    const dailyExpense = monthlyExpenses / dim;
    const deposits = depositDaysForMonth(depositFrequency, dim, globalDay);
    let monthInterest = 0;

    for (let d = 1; d <= dim; d++) {
      // Extra deposit: day 1 of month 1, and annually on the anniversary if recurring
      if (extraDeposit > 0 && d === 1) {
        if (m === 0 || (extraDepositFrequency === "annually" && m % 12 === 0)) {
          balance -= extraDeposit;
        }
      }

      // Income deposit(s)
      for (const dep of deposits) {
        if (dep.dayOfMonth === d) balance -= netIncome;
      }

      // Daily expenses drawn from the line
      balance += dailyExpense;

      // Interest accrues daily on current balance (only when balance is positive)
      if (balance > 0) {
        const interestToday = balance * dailyRate;
        accruedInterest += interestToday;
        monthInterest += interestToday;
      }

      if (m < 12) {
        year1BalanceSum += Math.max(balance, 0);
        year1Days++;
      }

      if (dailyPoints.length < SAWTOOTH_DAYS) {
        dailyPoints.push({ day: globalDay, balance: Math.max(balance, 0) });
      }

      globalDay++;
    }

    // Interest charged at month end (added to balance)
    balance += monthInterest;
    cumulativeInterest += monthInterest;
    accruedInterest = 0;

    monthlyPoints.push({
      month: m + 1,
      endBalance: Math.max(balance, 0),
      interestCharged: monthInterest,
      cumulativeInterest,
    });

    if (balance <= 0) {
      paidOff = true;
      payoffMonths = m + 1;
    }
  }

  return {
    paidOff,
    payoffMonths,
    totalInterest: cumulativeInterest,
    dailyPoints,
    monthlyPoints,
    avgDailyBalanceYear1: year1Days > 0 ? year1BalanceSum / year1Days : startingBalance,
  };
}

/** Standard monthly amortization for the traditional fixed-rate comparison. */
export function simulateTraditional(
  principal: number,
  annualRate: number,
  termYears: number
): TraditionalResult {
  const months = termYears * 12;
  const r = annualRate / 100 / 12;
  const payment =
    r > 0 ? (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1) : principal / months;

  let balance = principal;
  let totalInterest = 0;
  const monthlyBalances: number[] = [];
  const monthlyInterest: number[] = [];
  let payoffMonths = months;

  for (let m = 0; m < months; m++) {
    const interest = balance * r;
    const principalPaid = Math.min(payment - interest, balance);
    balance -= principalPaid;
    totalInterest += interest;
    monthlyBalances.push(Math.max(balance, 0));
    monthlyInterest.push(interest);
    if (balance <= 0.01) {
      payoffMonths = m + 1;
      balance = 0;
      break;
    }
  }

  return { payoffMonths, totalInterest, monthlyPayment: payment, monthlyBalances, monthlyInterest };
}

/** Number of income deposits per month for surplus math. */
export function depositsPerMonth(frequency: DepositFrequency): number {
  switch (frequency) {
    case "monthly":
      return 1;
    case "semi-monthly":
      return 2;
    case "bi-weekly":
      return 26 / 12;
    case "weekly":
      return 52 / 12;
  }
}

/** Full comparison: HELOC sweep vs traditional amortization. */
export function compareStrategies(inputs: HelocSweepInputs): ComparisonResult {
  const heloc = simulateHelocSweep(inputs);
  const traditional = simulateTraditional(
    inputs.startingBalance,
    inputs.traditionalRate,
    inputs.traditionalTermYears
  );

  const monthlyIncome = inputs.netIncome * depositsPerMonth(inputs.depositFrequency);
  const monthlySurplus = monthlyIncome - inputs.monthlyExpenses;

  const maxYears = Math.max(
    Math.ceil(heloc.payoffMonths / 12),
    Math.ceil(traditional.payoffMonths / 12)
  );

  // Year-by-year table + chart data
  const yearRows: YearRow[] = [];
  const chartData: { year: number; heloc: number | null; traditional: number | null }[] = [
    { year: 0, heloc: inputs.startingBalance, traditional: inputs.startingBalance },
  ];

  for (let y = 1; y <= maxYears; y++) {
    const helocMonthIdx = y * 12 - 1;
    const tradMonthIdx = y * 12 - 1;

    const helocPoint =
      helocMonthIdx < heloc.monthlyPoints.length
        ? heloc.monthlyPoints[helocMonthIdx]
        : heloc.monthlyPoints[heloc.monthlyPoints.length - 1];
    const helocBalance = helocMonthIdx < heloc.monthlyPoints.length ? helocPoint.endBalance : 0;

    const tradBalance =
      tradMonthIdx < traditional.monthlyBalances.length
        ? traditional.monthlyBalances[tradMonthIdx]
        : 0;

    // Interest that year
    let helocYearInterest = 0;
    for (let m = (y - 1) * 12; m < y * 12 && m < heloc.monthlyPoints.length; m++) {
      helocYearInterest += heloc.monthlyPoints[m].interestCharged;
    }
    let tradYearInterest = 0;
    for (let m = (y - 1) * 12; m < y * 12 && m < traditional.monthlyInterest.length; m++) {
      tradYearInterest += traditional.monthlyInterest[m];
    }

    const inDrawPeriod = y <= inputs.drawPeriodYears;
    yearRows.push({
      year: y,
      helocBalance,
      traditionalBalance: tradBalance,
      helocInterest: helocYearInterest,
      traditionalInterest: tradYearInterest,
      availableCredit: inDrawPeriod ? Math.max(inputs.startingBalance - helocBalance, 0) : null,
    });

    chartData.push({
      year: y,
      heloc: helocMonthIdx < heloc.monthlyPoints.length || y * 12 <= heloc.payoffMonths ? helocBalance : null,
      traditional: y * 12 <= traditional.payoffMonths ? tradBalance : tradBalance > 0 ? tradBalance : null,
    });
  }

  return {
    heloc,
    traditional,
    interestSaved: traditional.totalInterest - heloc.totalInterest,
    monthsSaved: traditional.payoffMonths - heloc.payoffMonths,
    monthlySurplus,
    yearRows,
    chartData,
    sawtoothData: heloc.dailyPoints.map((p) => ({ day: p.day + 1, balance: p.balance })),
    feasible: monthlySurplus > 0,
  };
}

/** Format months as "X yrs Y mos". */
export function formatMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo${m === 1 ? "" : "s"}`;
  if (m === 0) return `${y} yr${y === 1 ? "" : "s"}`;
  return `${y} yr${y === 1 ? "" : "s"} ${m} mo${m === 1 ? "" : "s"}`;
}
