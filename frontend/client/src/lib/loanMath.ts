/**
 * Loan Comparison Calculator — Math Utilities
 * All financial calculations for PITI, APR, amortization, closing costs, prepaids, MI
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoanType = "va" | "fha" | "conventional";

// ─── ARM Types ───────────────────────────────────────────────────────────────

export type ArmFixedYears = 3 | 5 | 7 | 10;

/**
 * 20-year historical average of the short-term index (1-month LIBOR through 2021,
 * SOFR thereafter), used as the "expected" index value after the fixed period.
 */
export const ARM_HISTORICAL_INDEX = 2.33;

/** Default ARM margins by loan type (Conventional 2.75%, VA 2.00%). */
export function defaultArmMargin(loanType: LoanType): number {
  return loanType === "va" ? 2.0 : 2.75;
}

/**
 * Default cap structure by loan type:
 * - Conventional: 5/1/5 caps, semi-annual adjustments (every 6 months)
 * - VA: 1/1/5 caps, annual adjustments (every 12 months)
 */
export function defaultArmCaps(loanType: LoanType): { initialCap: number; periodicCap: number; lifetimeCap: number; adjustmentFrequency: 6 | 12 } {
  if (loanType === "va") {
    return { initialCap: 1, periodicCap: 1, lifetimeCap: 5, adjustmentFrequency: 12 };
  }
  return { initialCap: 5, periodicCap: 1, lifetimeCap: 5, adjustmentFrequency: 6 };
}

export interface ScenarioInput {
  label: string;
  loanType: LoanType;
  purchasePrice: number;
  downPaymentPct: number;
  rate: number;           // annual interest rate as percent (e.g. 5.75)
  termYears: number;
  discountPoints: number; // as percent of loan amount
  lenderCredits: number;  // dollar amount
  propertyTaxRate: number; // annual rate as percent (e.g. 0.35)
  propertyTaxOverride: number; // manual monthly property tax override (0 = use rate calc)
  insurance: number;       // monthly
  hoa: number;             // monthly
  hoaTransferFee: number;  // one-time HOA transfer fee (default $350 if HOA > 0)
  // VA-specific
  vaFirstUse: boolean;
  vaDisabled: boolean;     // exempt from funding fee
  // Closing cost overrides
  originationFee: number;
  appraisalFee: number;
  titleInsurance: number;
  escrowFee: number;
  recordingFees: number;
  creditReport: number;
  floodCert: number;
  // Prepaids
  closingDay: number;      // day of month (1-28)
  // Temporary buydown
  buydownType: "none" | "1-1" | "2-1" | "3-2-1";
  sellerCredit: number; // dollar amount of seller credit
  // Optional
  propertyAddress: string; // optional property address for printout
  // ARM (Adjustable Rate Mortgage)
  isARM: boolean;               // false = fixed rate (default)
  armFixedYears: ArmFixedYears; // initial fixed period: 3, 5, 7, or 10 years
  armMargin: number;            // margin over index (default 2.75 conv, 2.0 VA)
  armInitialCap: number;        // first adjustment cap (default 5 conv, 1 VA)
  armPeriodicCap: number;       // per-adjustment cap after first (default 1)
  armLifetimeCap: number;       // lifetime cap over initial rate (default 5)
  armAdjustmentFrequency: 6 | 12; // months between adjustments (6 conv, 12 VA)
}

export interface MonthlyBreakdown {
  principalInterest: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  mortgageInsurance: number;
  totalPITI: number;
}

export interface ClosingCosts {
  originationFee: number;
  appraisalFee: number;
  titleInsurance: number;
  escrowFee: number;
  recordingFees: number;
  creditReport: number;
  floodCert: number;
  discountPointsCost: number;
  lenderCredits: number;
  fundingFeeOrMIPUpfront: number;
  hoaTransferFee: number;
  total: number;
}

export interface Prepaids {
  prepaidInterest: number;
  insurancePremium: number;
  taxEscrow: number;
  hoaPrepaid: number;
  total: number;
}

export interface AmortizationRow {
  year: number;
  beginBalance: number;
  totalPrincipal: number;
  totalInterest: number;
  endBalance: number;
}

export interface BuydownSchedule {
  year: number;
  rate: number;
  pi: number;
  savings: number; // monthly savings vs full rate
}

// ─── ARM Result Types ────────────────────────────────────────────────────────

/** One row of the year-by-year ARM payment trajectory. */
export interface ArmTrajectoryRow {
  year: number;
  rate: number;      // rate in effect at the start of that year (weighted if it changes mid-year, this is the starting rate)
  pi: number;        // monthly P&I at the start of that year
  maxRate: number;   // highest rate in effect during that year
  maxPI: number;     // highest monthly P&I during that year
}

/** Full amortization + payment outputs for a single ARM rate path. */
export interface ArmPathResult {
  amortization: AmortizationRow[];       // yearly amortization reflecting rate changes
  trajectory: ArmTrajectoryRow[];        // year-by-year rate/payment path
  maxRate: number;                       // highest rate reached on this path
  maxPI: number;                         // highest monthly P&I reached on this path
  totalInterest: number;                 // lifetime interest on this path
  monthlyRates: number[];                // rate (annual %) in effect for each month index
  monthlyPayments: number[];             // P&I payment for each month index
}

/** Combined ARM analysis: worst-case and historical-average scenarios. */
export interface ArmAnalysis {
  fixedYears: ArmFixedYears;
  margin: number;
  initialCap: number;
  periodicCap: number;
  lifetimeCap: number;
  adjustmentFrequency: 6 | 12;
  floorRate: number;          // = margin
  historicalIndex: number;    // ARM_HISTORICAL_INDEX
  expectedRate: number;       // capped fully-indexed rate under the historical scenario
  worstCase: ArmPathResult;
  historical: ArmPathResult;
}

export interface ScenarioResult {
  label: string;
  loanType: LoanType;
  rate: number;            // note rate (input rate)
  termYears: number;
  discountPoints: number;  // as percent of loan amount
  purchasePrice: number;
  baseLoanAmount: number;
  totalLoanAmount: number; // includes financed fees (VA funding fee, FHA UFMIP)
  financedFee: number;     // VA funding fee or FHA UFMIP amount (financed into loan)
  downPayment: number;
  monthly: MonthlyBreakdown;
  closingCosts: ClosingCosts;
  prepaids: Prepaids;
  cashToClose: number;
  apr: number;
  amortization: AmortizationRow[];
  totalCostAtYear: (years: number) => number;
  // Temporary buydown
  buydownType: "none" | "1-1" | "2-1" | "3-2-1";
  buydownCost: number;
  buydownSchedule: BuydownSchedule[];
  sellerCredit: number;
  // ARM analysis (null for fixed-rate scenarios)
  isARM: boolean;
  arm: ArmAnalysis | null;
}

// ─── Hawaii County Tax Rates ─────────────────────────────────────────────────

export const HAWAII_TAX_RATES: Record<string, number> = {
  "Honolulu": 0.35,
  "Maui": 0.55,
  "Kauai": 0.59,
  "Hawaii County": 0.99,
};

// ─── Default Scenario ────────────────────────────────────────────────────────

export function defaultScenario(label: string, idx: number): ScenarioInput {
  const types: LoanType[] = ["va", "conventional", "fha"];
  const loanType = types[idx % 3];
  return {
    label,
    loanType,
    purchasePrice: 750000,
    downPaymentPct: loanType === "va" ? 0 : loanType === "fha" ? 3.5 : 5,
    rate: 5.75,
    termYears: 30,
    discountPoints: 0,
    lenderCredits: 0,
    propertyTaxRate: 0.35,
    propertyTaxOverride: 0,
    insurance: 200,
    hoa: 0,
    hoaTransferFee: 0,
    vaFirstUse: true,
    vaDisabled: false,
    originationFee: 1495,
    appraisalFee: 800,
    titleInsurance: 1750,
    escrowFee: 1250,
    recordingFees: 250,
    creditReport: 75,
    floodCert: 20,
    closingDay: 15,
    buydownType: "none",
    sellerCredit: 0,
    propertyAddress: "",
    isARM: false,
    armFixedYears: 5,
    armMargin: defaultArmMargin(loanType),
    armInitialCap: defaultArmCaps(loanType).initialCap,
    armPeriodicCap: defaultArmCaps(loanType).periodicCap,
    armLifetimeCap: defaultArmCaps(loanType).lifetimeCap,
    armAdjustmentFrequency: defaultArmCaps(loanType).adjustmentFrequency,
  };
}

// ─── VA Funding Fee ──────────────────────────────────────────────────────────

export function vaFundingFee(baseLoan: number, downPct: number, firstUse: boolean, disabled: boolean): number {
  if (disabled) return 0;
  let rate: number;
  if (downPct >= 10) {
    rate = 1.25; // same for first and subsequent use
  } else if (downPct >= 5) {
    rate = 1.5; // same for first and subsequent use
  } else {
    rate = firstUse ? 2.15 : 3.3;
  }
  return baseLoan * (rate / 100);
}

// ─── FHA MIP ─────────────────────────────────────────────────────────────────

export function fhaUpfrontMIP(baseLoan: number): number {
  return baseLoan * 0.0175; // 1.75% UFMIP
}

export function fhaMonthlyMIP(baseLoan: number, ltv: number, termYears: number): number {
  // Simplified: 0.55% annual for loans <= $726,200 with LTV > 95%, 30-yr
  // For Hawaii high-balance, use 0.55% as standard
  let annualRate = 0.55;
  if (ltv <= 95) annualRate = 0.50;
  if (termYears <= 15) annualRate = ltv > 90 ? 0.40 : 0.15;
  return (baseLoan * annualRate / 100) / 12;
}

// ─── Conventional PMI ────────────────────────────────────────────────────────

export function conventionalPMI(baseLoan: number, ltv: number): number {
  if (ltv <= 80) return 0;
  let annualRate: number;
  if (ltv > 95) annualRate = 0.40;
  else if (ltv > 90) annualRate = 0.30;
  else if (ltv > 85) annualRate = 0.20;
  else annualRate = 0.10;
  return (baseLoan * annualRate / 100) / 12;
}

// ─── Core P&I ────────────────────────────────────────────────────────────────

export function monthlyPI(loanAmount: number, annualRate: number, termYears: number): number {
  if (loanAmount <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── APR Calculation (Newton's method) ───────────────────────────────────────

export function calculateAPR(
  loanAmount: number,
  monthlyPayment: number,
  termMonths: number,
  financeCharges: number // total prepaid finance charges (points, origination, etc.) that reduce net loan proceeds
): number {
  // APR finds the rate where PV of all payments = net loan proceeds
  // Net proceeds = amount disbursed to borrower = loanAmount - financeCharges
  // financeCharges includes: discount points, origination fee (non-VA), and any other prepaid finance charges
  const netProceeds = loanAmount - financeCharges;
  if (netProceeds <= 0 || monthlyPayment <= 0) return 0;

  // Newton's method to solve for monthly rate r:
  // netProceeds = monthlyPayment * [(1+r)^n - 1] / [r * (1+r)^n]
  // Rearranged: f(r) = netProceeds * r * (1+r)^n / [(1+r)^n - 1] - monthlyPayment = 0
  let r = monthlyPayment / netProceeds; // initial guess (monthly rate)
  for (let i = 0; i < 200; i++) {
    const rn = Math.pow(1 + r, termMonths);
    const f = netProceeds * r * rn / (rn - 1) - monthlyPayment;
    // Numerical derivative
    const h = r * 1e-6 || 1e-10;
    const rn2 = Math.pow(1 + r + h, termMonths);
    const f2 = netProceeds * (r + h) * rn2 / (rn2 - 1) - monthlyPayment;
    const df = (f2 - f) / h;
    if (Math.abs(df) < 1e-14) break;
    const newR = r - f / df;
    if (newR <= 0) { r = r / 2; continue; }
    if (Math.abs(newR - r) < 1e-12) break;
    r = newR;
  }
  return r * 12 * 100; // annual percentage
}

// ─── Amortization Schedule (yearly) ──────────────────────────────────────────

export function buildAmortization(loanAmount: number, annualRate: number, termYears: number): AmortizationRow[] {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  const payment = monthlyPI(loanAmount, annualRate, termYears);
  const rows: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let year = 1; year <= termYears; year++) {
    const beginBalance = balance;
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const principal = Math.min(payment - interest, balance);
      yearPrincipal += principal;
      yearInterest += interest;
      balance -= principal;
    }
    rows.push({
      year,
      beginBalance,
      totalPrincipal: yearPrincipal,
      totalInterest: yearInterest,
      endBalance: Math.max(0, balance),
    });
  }
  return rows;
}

// ─── Equity Building Analysis ────────────────────────────────────────────────────────────────

export interface EquityYearRow {
  year: number;
  homeValue: number;
  appreciation: number;       // cumulative appreciation from purchase price
  principalPaid: number;      // cumulative principal paid down
  remainingBalance: number;
  totalEquity: number;        // homeValue - remainingBalance
  totalInterestPaid: number;  // cumulative interest paid
}

export function buildEquityAnalysis(
  purchasePrice: number,
  totalLoanAmount: number,
  annualRate: number,
  termYears: number,
  appreciationRate: number,   // annual as decimal (e.g., 0.045 for 4.5%)
  yearsToProject: number
): EquityYearRow[] {
  const r = annualRate / 100 / 12;
  const payment = monthlyPI(totalLoanAmount, annualRate, termYears);
  const rows: EquityYearRow[] = [];
  let balance = totalLoanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let year = 1; year <= yearsToProject; year++) {
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const principal = Math.min(payment - interest, balance);
      cumulativePrincipal += principal;
      cumulativeInterest += interest;
      balance -= principal;
    }
    const homeValue = purchasePrice * Math.pow(1 + appreciationRate, year);
    const appreciation = homeValue - purchasePrice;
    rows.push({
      year,
      homeValue,
      appreciation,
      principalPaid: cumulativePrincipal,
      remainingBalance: Math.max(0, balance),
      totalEquity: homeValue - Math.max(0, balance),
      totalInterestPaid: cumulativeInterest,
    });
  }
  return rows;
}

// ─── ARM Rate Path & Amortization ────────────────────────────────────────────

/**
 * Build the annual-rate-by-month path for an ARM.
 * @param noteRate   initial quoted rate during the fixed period (annual %)
 * @param termMonths total loan term in months
 * @param fixedMonths months in the initial fixed period
 * @param adjFreq    months between adjustments (6 or 12)
 * @param initialCap max change (up or down) at the first adjustment
 * @param periodicCap max change at each subsequent adjustment
 * @param lifetimeCap max increase over the initial note rate
 * @param targetRate the fully-indexed rate the ARM moves toward (index + margin);
 *                   for the worst case pass Infinity (rate rises to the lifetime cap)
 * @param floorRate  minimum rate (= margin)
 */
export function buildArmRatePath(
  noteRate: number,
  termMonths: number,
  fixedMonths: number,
  adjFreq: 6 | 12,
  initialCap: number,
  periodicCap: number,
  lifetimeCap: number,
  targetRate: number,
  floorRate: number
): number[] {
  const ceiling = noteRate + lifetimeCap;
  const floor = Math.max(0, floorRate);
  const rates: number[] = new Array(termMonths);
  let currentRate = noteRate;
  let adjustmentCount = 0;

  for (let m = 0; m < termMonths; m++) {
    if (m >= fixedMonths && (m - fixedMonths) % adjFreq === 0) {
      // Adjustment date: move toward targetRate, limited by caps/floor/ceiling
      adjustmentCount++;
      const cap = adjustmentCount === 1 ? initialCap : periodicCap;
      const bounded = Math.min(Math.max(targetRate, floor), ceiling);
      const delta = bounded - currentRate;
      const step = Math.max(-cap, Math.min(cap, delta));
      currentRate = Math.min(Math.max(currentRate + step, floor), ceiling);
    }
    rates[m] = currentRate;
  }
  return rates;
}

/**
 * Amortize a loan along a month-by-month rate path.
 * At each rate change the payment is recast over the remaining term
 * (standard ARM behavior), producing yearly amortization rows and a
 * year-by-year payment trajectory.
 */
export function amortizeArmPath(
  loanAmount: number,
  monthlyRatesAnnualPct: number[],
  termMonths: number
): ArmPathResult {
  const amortization: AmortizationRow[] = [];
  const trajectory: ArmTrajectoryRow[] = [];
  const monthlyPayments: number[] = new Array(termMonths).fill(0);

  let balance = loanAmount;
  let payment = 0;
  let prevRate = -1;
  let maxRate = 0;
  let maxPI = 0;
  let totalInterest = 0;

  const totalYears = Math.ceil(termMonths / 12);
  for (let year = 1; year <= totalYears; year++) {
    const beginBalance = balance;
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearStartRate = 0;
    let yearStartPI = 0;
    let yearMaxRate = 0;
    let yearMaxPI = 0;

    for (let k = 0; k < 12; k++) {
      const m = (year - 1) * 12 + k;
      if (m >= termMonths || balance <= 0.005) break;
      const annualRate = monthlyRatesAnnualPct[m];
      if (annualRate !== prevRate) {
        // Recast payment over remaining term at the new rate
        const remaining = termMonths - m;
        const r = annualRate / 100 / 12;
        payment = r > 0
          ? balance * (r * Math.pow(1 + r, remaining)) / (Math.pow(1 + r, remaining) - 1)
          : balance / remaining;
        prevRate = annualRate;
      }
      if (k === 0 || yearStartPI === 0) {
        if (yearStartPI === 0) {
          yearStartRate = annualRate;
          yearStartPI = payment;
        }
      }
      yearMaxRate = Math.max(yearMaxRate, annualRate);
      yearMaxPI = Math.max(yearMaxPI, payment);
      maxRate = Math.max(maxRate, annualRate);
      maxPI = Math.max(maxPI, payment);

      const r = annualRate / 100 / 12;
      const interest = balance * r;
      const principal = Math.min(payment - interest, balance);
      yearPrincipal += principal;
      yearInterest += interest;
      totalInterest += interest;
      balance -= principal;
      monthlyPayments[m] = payment;
    }

    amortization.push({
      year,
      beginBalance,
      totalPrincipal: yearPrincipal,
      totalInterest: yearInterest,
      endBalance: Math.max(0, balance),
    });
    trajectory.push({
      year,
      rate: yearStartRate,
      pi: yearStartPI,
      maxRate: yearMaxRate,
      maxPI: yearMaxPI,
    });
    if (balance <= 0.005) {
      // Fill remaining years with zeros for consistent table lengths
      for (let y = year + 1; y <= totalYears; y++) {
        amortization.push({ year: y, beginBalance: 0, totalPrincipal: 0, totalInterest: 0, endBalance: 0 });
        trajectory.push({ year: y, rate: 0, pi: 0, maxRate: 0, maxPI: 0 });
      }
      break;
    }
  }

  return { amortization, trajectory, maxRate, maxPI, totalInterest, monthlyRates: monthlyRatesAnnualPct, monthlyPayments };
}

/** Build the full worst-case + historical-average ARM analysis. */
export function buildArmAnalysis(
  loanAmount: number,
  noteRate: number,
  termYears: number,
  fixedYears: ArmFixedYears,
  margin: number,
  initialCap: number,
  periodicCap: number,
  lifetimeCap: number,
  adjustmentFrequency: 6 | 12
): ArmAnalysis {
  const termMonths = termYears * 12;
  const fixedMonths = Math.min(fixedYears * 12, termMonths);
  const floorRate = margin;

  // Worst case: rate rises at the maximum cap every adjustment until the lifetime cap
  const worstRates = buildArmRatePath(
    noteRate, termMonths, fixedMonths, adjustmentFrequency,
    initialCap, periodicCap, lifetimeCap, Infinity, floorRate
  );
  const worstCase = amortizeArmPath(loanAmount, worstRates, termMonths);

  // Historical average: rate moves toward historical index + margin (subject to caps/floor)
  const fullyIndexed = ARM_HISTORICAL_INDEX + margin;
  const histRates = buildArmRatePath(
    noteRate, termMonths, fixedMonths, adjustmentFrequency,
    initialCap, periodicCap, lifetimeCap, fullyIndexed, floorRate
  );
  const historical = amortizeArmPath(loanAmount, histRates, termMonths);
  const expectedRate = Math.min(Math.max(fullyIndexed, floorRate), noteRate + lifetimeCap);

  return {
    fixedYears,
    margin,
    initialCap,
    periodicCap,
    lifetimeCap,
    adjustmentFrequency,
    floorRate,
    historicalIndex: ARM_HISTORICAL_INDEX,
    expectedRate,
    worstCase,
    historical,
  };
}

// ─── Full Scenario Calculator ────────────────────────────────────────────────────────────────────

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const { purchasePrice, downPaymentPct, rate, termYears, loanType } = input;

  const downPayment = purchasePrice * (downPaymentPct / 100);
  const baseLoan = purchasePrice - downPayment;
  const ltv = (baseLoan / purchasePrice) * 100;

  // Financed fees
  let financedFee = 0;
  let upfrontFeeLabel = 0;
  if (loanType === "va") {
    financedFee = vaFundingFee(baseLoan, downPaymentPct, input.vaFirstUse, input.vaDisabled);
    upfrontFeeLabel = financedFee;
  } else if (loanType === "fha") {
    financedFee = fhaUpfrontMIP(baseLoan);
    upfrontFeeLabel = financedFee;
  }

  const totalLoan = baseLoan + financedFee;
  const pi = monthlyPI(totalLoan, rate, termYears);

  // Monthly MI
  let mi = 0;
  if (loanType === "fha") {
    mi = fhaMonthlyMIP(baseLoan, ltv, termYears);
  } else if (loanType === "conventional") {
    mi = conventionalPMI(baseLoan, ltv);
  }

  // Property tax: use manual override if provided, otherwise calculate from rate
  const monthlyTax = input.propertyTaxOverride > 0
    ? input.propertyTaxOverride
    : (purchasePrice * (input.propertyTaxRate / 100)) / 12;

  const monthly: MonthlyBreakdown = {
    principalInterest: pi,
    propertyTax: monthlyTax,
    insurance: input.insurance,
    hoa: input.hoa,
    mortgageInsurance: mi,
    totalPITI: pi + monthlyTax + input.insurance + input.hoa + mi,
  };

  // Closing costs
  const discountPointsCost = totalLoan * (input.discountPoints / 100);
  // VA loans: no origination fee (CMG policy), appraisal fees vary by loan type
  const effectiveOriginationFee = loanType === "va" ? 0 : input.originationFee;
  const effectiveAppraisalFee = loanType === "va" ? 900 : loanType === "fha" ? 875 : 875;
  const effectiveHoaTransferFee = input.hoa > 0 ? input.hoaTransferFee : 0;
  const closingCosts: ClosingCosts = {
    originationFee: effectiveOriginationFee,
    appraisalFee: effectiveAppraisalFee,
    titleInsurance: input.titleInsurance,
    escrowFee: input.escrowFee,
    recordingFees: input.recordingFees,
    creditReport: input.creditReport,
    floodCert: input.floodCert,
    discountPointsCost,
    lenderCredits: input.lenderCredits,
    fundingFeeOrMIPUpfront: 0, // financed into loan, not a cash cost
    hoaTransferFee: effectiveHoaTransferFee,
    total:
      effectiveOriginationFee +
      effectiveAppraisalFee +
      input.titleInsurance +
      input.escrowFee +
      input.recordingFees +
      input.creditReport +
      input.floodCert +
      discountPointsCost +
      effectiveHoaTransferFee -
      input.lenderCredits,
  };

  // Prepaids
  const daysRemaining = Math.max(1, 30 - input.closingDay);
  const dailyInterest = (totalLoan * (rate / 100)) / 365;
  const prepaidInterest = dailyInterest * daysRemaining;
  const insurancePremium = input.insurance * 12;
  const taxEscrow = monthlyTax * 6; // 6 months property tax escrow
  const hoaPrepaid = input.hoa > 0 ? input.hoa : 0; // 1 month HOA pre-paid if applicable

  const prepaids: Prepaids = {
    prepaidInterest,
    insurancePremium,
    taxEscrow,
    hoaPrepaid,
    total: prepaidInterest + insurancePremium + taxEscrow + hoaPrepaid,
  };

  // Temporary buydown cost
  const buydownType = input.buydownType || "none";
  let buydownCost = 0;
  const buydownSchedule: BuydownSchedule[] = [];
  if (buydownType !== "none") {
    const reductions = buydownType === "1-1" ? [1] : buydownType === "2-1" ? [2, 1] : [3, 2, 1];
    for (let i = 0; i < reductions.length; i++) {
      const reducedRate = rate - reductions[i];
      const reducedPI = reducedRate > 0 ? monthlyPI(totalLoan, reducedRate, termYears) : 0;
      const monthlySavings = pi - reducedPI;
      buydownCost += monthlySavings * 12;
      buydownSchedule.push({ year: i + 1, rate: reducedRate, pi: reducedPI, savings: monthlySavings });
    }
    // Add the permanent rate year
    buydownSchedule.push({ year: reductions.length + 1, rate, pi, savings: 0 });
  }

  // Add buydown cost to closing costs total
  const buydownAddedToClosing = buydownCost;
  closingCosts.total += buydownAddedToClosing;

  // Seller credit reduces cash to close
  const sellerCredit = input.sellerCredit || 0;

  // Cash to close
  const cashToClose = downPayment + closingCosts.total + prepaids.total - sellerCredit;

  // APR — includes lender-related finance charges per TILA/Reg Z:
  // INCLUDED: Origination fees, discount points, prepaid interest,
  //           VA funding fee / FHA UFMIP (when financed into loan),
  //           60 months of PMI/MIP payments (conventional PMI or FHA annual MIP)
  // NOT INCLUDED: Appraisal, title, escrow, recording, credit report, HOA fees, flood cert
  const pmiFor60Months = mi * Math.min(60, termYears * 12); // 60 months of MI payments
  const aprFinanceCharges = discountPointsCost + effectiveOriginationFee + financedFee + pmiFor60Months + prepaidInterest;
  const apr = calculateAPR(
    totalLoan,
    pi,
    termYears * 12,
    aprFinanceCharges
  );

  // ARM analysis (worst-case + historical-average paths)
  const isARM = input.isARM === true;
  const arm = isARM
    ? buildArmAnalysis(
        totalLoan,
        rate,
        termYears,
        input.armFixedYears || 5,
        input.armMargin > 0 ? input.armMargin : defaultArmMargin(loanType),
        input.armInitialCap > 0 ? input.armInitialCap : defaultArmCaps(loanType).initialCap,
        input.armPeriodicCap > 0 ? input.armPeriodicCap : defaultArmCaps(loanType).periodicCap,
        input.armLifetimeCap > 0 ? input.armLifetimeCap : defaultArmCaps(loanType).lifetimeCap,
        input.armAdjustmentFrequency === 6 || input.armAdjustmentFrequency === 12
          ? input.armAdjustmentFrequency
          : defaultArmCaps(loanType).adjustmentFrequency
      )
    : null;

  // Amortization — for ARMs, the primary schedule uses the historical-average path
  const amortization = arm ? arm.historical.amortization : buildAmortization(totalLoan, rate, termYears);

  // Non-P&I monthly carrying costs (tax, insurance, HOA, MI)
  const monthlyEscrows = monthlyTax + input.insurance + input.hoa + mi;

  // Total cost function — reflects ARM payment changes on the historical path
  const totalCostAtYear = (years: number): number => {
    const months = years * 12;
    const closingAndPrepaids = cashToClose;
    if (arm) {
      let totalPI = 0;
      let principalPaid = 0;
      const path = arm.historical;
      const capMonths = Math.min(months, termYears * 12);
      let bal = totalLoan;
      for (let m = 0; m < capMonths; m++) {
        const pay = path.monthlyPayments[m] || 0;
        const r = (path.monthlyRates[m] || 0) / 100 / 12;
        const interest = bal * r;
        const principal = Math.min(pay - interest, bal);
        totalPI += pay;
        principalPaid += principal;
        bal -= principal;
      }
      const totalPayments = totalPI + monthlyEscrows * months;
      return totalPayments + closingAndPrepaids - principalPaid;
    }
    const totalPayments = monthly.totalPITI * months;
    // Subtract remaining equity (principal paid down)
    let principalPaid = 0;
    const r = rate / 100 / 12;
    let bal = totalLoan;
    for (let m = 0; m < months && m < termYears * 12; m++) {
      const interest = bal * r;
      const principal = pi - interest;
      principalPaid += principal;
      bal -= principal;
    }
    return totalPayments + closingAndPrepaids - principalPaid;
  };

  return {
    label: input.label,
    loanType,
    rate,
    termYears,
    discountPoints: input.discountPoints,
    purchasePrice,
    baseLoanAmount: baseLoan,
    totalLoanAmount: totalLoan,
    financedFee,
    downPayment,
    monthly,
    closingCosts,
    prepaids,
    cashToClose,
    apr: isFinite(apr) && apr > 0 ? apr : rate,
    amortization,
    totalCostAtYear,
    buydownType,
    buydownCost,
    buydownSchedule,
    sellerCredit,
    isARM,
    arm,
  };
}
