/**
 * Loan Comparison Calculator — Math Utilities
 * All financial calculations for PITI, APR, amortization, closing costs, prepaids, MI
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoanType = "va" | "fha" | "conventional";

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

  // Amortization
  const amortization = buildAmortization(totalLoan, rate, termYears);

  // Total cost function
  const totalCostAtYear = (years: number): number => {
    const months = years * 12;
    const totalPayments = monthly.totalPITI * months;
    const closingAndPrepaids = cashToClose;
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
  };
}
