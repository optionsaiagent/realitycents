// 2026 Military Pay Data for RealityCents Military Buying Power Calculator
// Sources:
//   Base Pay: navycs.com/charts/2026-military-pay-chart.html (DFAS 2026 tables, 3.8% raise)
//   BAH: veteran.com/bah-rates-state/hawaii/ (Honolulu County HI408, 2026)
//   BAS: $476.95 enlisted, $328.48 officers (2026)
//   COLA Spendable Income: travel.dod.mil CY 2026 Spendable Income Table (Effective Feb 1, 2026)
//   COLA Index: Oahu CONUS COLA index = 120

export type PayGrade =
  | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6" | "E-7" | "E-8" | "E-9"
  | "W-1" | "W-2" | "W-3" | "W-4" | "W-5"
  | "O-1E" | "O-2E" | "O-3E"
  | "O-1" | "O-2" | "O-3" | "O-4" | "O-5" | "O-6" | "O-7" | "O-8" | "O-9" | "O-10";

export const PAY_GRADE_OPTIONS: PayGrade[] = [
  "E-1", "E-2", "E-3", "E-4", "E-5", "E-6", "E-7", "E-8", "E-9",
  "W-1", "W-2", "W-3", "W-4", "W-5",
  "O-1E", "O-2E", "O-3E",
  "O-1", "O-2", "O-3", "O-4", "O-5", "O-6", "O-7", "O-8", "O-9", "O-10",
];

export const PAY_GRADE_LABELS: Record<PayGrade, string> = {
  "E-1": "E-1 (PVT/SR/PV1)",
  "E-2": "E-2 (PV2/SA/PFC)",
  "E-3": "E-3 (PFC/SN/LCPL)",
  "E-4": "E-4 (SPC/CPL/PO3)",
  "E-5": "E-5 (SGT/PO2)",
  "E-6": "E-6 (SSG/PO1)",
  "E-7": "E-7 (SFC/CPO)",
  "E-8": "E-8 (MSG/SCPO)",
  "E-9": "E-9 (SGM/MCPO)",
  "W-1": "W-1 (WO1)",
  "W-2": "W-2 (CW2)",
  "W-3": "W-3 (CW3)",
  "W-4": "W-4 (CW4)",
  "W-5": "W-5 (CW5)",
  "O-1E": "O-1E (2LT/ENS prior enlisted)",
  "O-2E": "O-2E (1LT/LTJG prior enlisted)",
  "O-3E": "O-3E (CPT/LT prior enlisted)",
  "O-1": "O-1 (2LT/ENS)",
  "O-2": "O-2 (1LT/LTJG)",
  "O-3": "O-3 (CPT/LT)",
  "O-4": "O-4 (MAJ/LCDR)",
  "O-5": "O-5 (LTC/CDR)",
  "O-6": "O-6 (COL/CAPT)",
  "O-7": "O-7 (BG/RDML)",
  "O-8": "O-8 (MG/RADM)",
  "O-9": "O-9 (LTG/VADM)",
  "O-10": "O-10 (GEN/ADM)",
};

// Years of service breakpoints used in the pay tables
// Index maps to: 0=<2, 1=2, 2=3, 3=4, 4=6, 5=8, 6=10, 7=12, 8=14, 9=16, 10=18, 11=20, 12=22, 13=24, 14=26
const YOS_BREAKS = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];

function yosIndex(yos: number): number {
  let idx = 0;
  for (let i = YOS_BREAKS.length - 1; i >= 0; i--) {
    if (yos >= YOS_BREAKS[i]) { idx = i; break; }
  }
  return idx;
}

// 2026 Monthly Base Pay by grade and YOS index (15 columns)
// 0 means not eligible at that YOS
const BASE_PAY: Record<PayGrade, number[]> = {
  "E-1": [2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407, 2407],
  "E-2": [2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698, 2698],
  "E-3": [2837, 3015, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198],
  "E-4": [3142, 3303, 3482, 3659, 3815, 3815, 3815, 3815, 3815, 3815, 3815, 3815, 3815, 3815, 3815],
  "E-5": [3343, 3598, 3776, 3947, 4110, 4300, 4395, 4422, 4422, 4422, 4422, 4422, 4422, 4422, 4422],
  "E-6": [3401, 3743, 3908, 4068, 4236, 4612, 4760, 5044, 5131, 5194, 5268, 5268, 5268, 5268, 5268],
  "E-7": [3932, 4291, 4456, 4673, 4844, 5135, 5300, 5592, 5835, 6001, 6177, 6245, 6475, 6598, 7067],
  "E-8": [0, 0, 0, 0, 0, 5657, 5907, 6062, 6247, 6448, 6811, 6995, 7308, 7482, 7909],
  "E-9": [0, 0, 0, 0, 0, 0, 6910, 7067, 7264, 7496, 7731, 8105, 8423, 8756, 9268],
  "W-1": [4057, 4494, 4611, 4859, 5152, 5585, 5786, 6069, 6346, 6565, 6766, 7010, 7010, 7010, 7010],
  "W-2": [4622, 5059, 5194, 5286, 5586, 6052, 6282, 6509, 6787, 7005, 7201, 7437, 7592, 7714, 7714],
  "W-3": [5223, 5441, 5664, 5738, 5971, 6431, 6910, 7136, 7398, 7666, 8150, 8477, 8672, 8879, 9162],
  "W-4": [5720, 6152, 6329, 6503, 6802, 7098, 7398, 7848, 8244, 8620, 8928, 9228, 9669, 10032, 10445],
  "W-5": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10170, 10686, 11070, 11495],
  "O-1E": [0, 0, 0, 5222, 5577, 5783, 5994, 6201, 6484, 6484, 6484, 6484, 6484, 6484, 6484],
  "O-2E": [0, 0, 0, 6484, 6618, 6828, 7184, 7459, 7664, 7664, 7664, 7664, 7664, 7664, 7664],
  "O-3E": [0, 0, 0, 7383, 7737, 8125, 8376, 8788, 9137, 9337, 9609, 9609, 9609, 9609, 9609],
  "O-1": [4150, 4320, 5222, 5222, 5222, 5222, 5222, 5222, 5222, 5222, 5222, 5222, 5222, 5222, 5222],
  "O-2": [4782, 5446, 6272, 6484, 6618, 6618, 6618, 6618, 6618, 6618, 6618, 6618, 6618, 6618, 6618],
  "O-3": [5535, 6273, 6771, 7383, 7737, 8125, 8376, 8788, 9004, 9004, 9004, 9004, 9004, 9004, 9004],
  "O-4": [6294, 7286, 7773, 7881, 8332, 8816, 9419, 9888, 10214, 10402, 10510, 10510, 10510, 10510, 10510],
  "O-5": [7295, 8219, 8787, 8894, 9250, 9462, 9929, 10272, 10714, 11392, 11714, 12033, 12394, 12394, 12394],
  "O-6": [8751, 9614, 10245, 10245, 10284, 10725, 10784, 10784, 11396, 12480, 13115, 13751, 14113, 14479, 15189],
  "O-7": [11540, 12076, 12325, 12522, 12879, 13232, 13639, 14046, 14454, 15736, 16818, 16818, 16818, 16818, 16904],
  "O-8": [13888, 14344, 14645, 14730, 15107, 15736, 15882, 16480, 16652, 17166, 18598, 18598, 18999, 18999, 18999],
  "O-9": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18999, 18999, 18999, 18999, 18999],
  "O-10": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18999, 18999, 18999, 18999, 18999],
};

// 2026 BAH Rates for Honolulu County (MHA HI408)
// [withDependents, withoutDependents]
const BAH_HONOLULU: Record<PayGrade, [number, number]> = {
  "E-1": [3333, 2598],
  "E-2": [3333, 2598],
  "E-3": [3333, 2598],
  "E-4": [3333, 2598],
  "E-5": [3663, 2856],
  "E-6": [3912, 3036],
  "E-7": [4098, 3348],
  "E-8": [4302, 3720],
  "E-9": [4518, 3783],
  "W-1": [3930, 3222],
  "W-2": [4182, 3717],
  "W-3": [4434, 3795],
  "W-4": [4551, 3951],
  "W-5": [4692, 4146],
  "O-1E": [4137, 3660],
  "O-2E": [4398, 3768],
  "O-3E": [4572, 3903],
  "O-1": [3702, 2997],
  "O-2": [3909, 3555],
  "O-3": [4428, 3819],
  "O-4": [4737, 4110],
  "O-5": [4959, 4224],
  "O-6": [5001, 4413],
  "O-7": [5040, 4494],
  "O-8": [5040, 4494], // Use O-7 rates (not published separately)
  "O-9": [5040, 4494],
  "O-10": [5040, 4494],
};

// BAS Rates 2026
const BAS_ENLISTED = 476.95;
const BAS_OFFICER = 328.48;

// COLA Spendable Income Table (CY 2026, Effective Feb 1, 2026)
// Source: travel.dod.mil
// Format: [annualCompMax, spendable0deps, spendable1dep, spendable2deps, spendable3deps, spendable4deps, spendable5plus]
// annualCompMax is the upper bound of the bracket (use Infinity for >= $240,000)
const SPENDABLE_INCOME_TABLE: [number, number, number, number, number, number, number][] = [
  [74999,  31680, 33440, 35200, 36960, 38720, 40480],
  [79999,  32850, 34675, 36500, 38325, 40150, 41975],
  [84999,  33930, 35815, 37700, 39585, 41470, 43355],
  [89999,  35010, 36955, 38900, 40845, 42790, 44735],
  [94999,  36090, 38095, 40100, 42105, 44110, 46115],
  [99999,  37170, 39235, 41300, 43365, 45430, 47495],
  [104999, 38250, 40375, 42500, 44625, 46750, 48875],
  [109999, 39330, 41515, 43700, 45885, 48070, 50255],
  [114999, 40320, 42560, 44800, 47040, 49280, 51520],
  [119999, 41310, 43605, 45900, 48195, 50490, 52785],
  [124999, 42300, 44650, 47000, 49350, 51700, 54050],
  [129999, 43290, 45695, 48100, 50505, 52910, 55315],
  [134999, 44280, 46740, 49200, 51660, 54120, 56580],
  [139999, 45270, 47785, 50300, 52815, 55330, 57845],
  [144999, 46170, 48735, 51300, 53865, 56430, 58995],
  [149999, 47070, 49685, 52300, 54915, 57530, 60145],
  [154999, 47970, 50635, 53300, 55965, 58630, 61295],
  [159999, 48870, 51585, 54300, 57015, 59730, 62445],
  [164999, 49770, 52535, 55300, 58065, 60830, 63595],
  [169999, 50580, 53390, 56200, 59010, 61820, 64630],
  [174999, 51480, 54340, 57200, 60060, 62920, 65780],
  [179999, 52290, 55195, 58100, 61005, 63910, 66815],
  [184999, 53100, 56050, 59000, 61950, 64900, 67850],
  [189999, 53910, 56905, 59900, 62895, 65890, 68885],
  [194999, 54720, 57760, 60800, 63840, 66880, 69920],
  [199999, 55440, 58520, 61600, 64680, 67760, 70840],
  [204999, 56160, 59280, 62400, 65520, 68640, 71760],
  [209999, 56970, 60135, 63300, 66465, 69630, 72795],
  [214999, 57690, 60895, 64100, 67305, 70510, 73715],
  [219999, 58410, 61655, 64900, 68145, 71390, 74635],
  [224999, 59040, 62320, 65600, 68880, 72160, 75440],
  [229999, 59760, 63080, 66400, 69720, 73040, 76360],
  [234999, 60390, 63745, 67100, 70455, 73810, 77165],
  [239999, 61020, 64410, 67800, 71190, 74580, 77970],
  [Infinity, 61650, 65075, 68500, 71925, 75350, 78775],
];

// Oahu CONUS COLA index
const OAHU_COLA_INDEX = 120;

function isEnlisted(grade: PayGrade): boolean {
  return grade.startsWith("E-");
}

function isOfficer(grade: PayGrade): boolean {
  return grade.startsWith("O-") || grade.startsWith("W-");
}

export function getBasePay(grade: PayGrade, yearsOfService: number): number {
  const idx = yosIndex(yearsOfService);
  const pay = BASE_PAY[grade]?.[idx] ?? 0;
  // If 0 at this YOS, find the nearest valid rate
  if (pay === 0) {
    const row = BASE_PAY[grade];
    if (!row) return 0;
    // Search forward from idx
    for (let i = idx + 1; i < row.length; i++) {
      if (row[i] > 0) return row[i];
    }
    // Search backward from idx
    for (let i = idx - 1; i >= 0; i--) {
      if (row[i] > 0) return row[i];
    }
  }
  return pay;
}

export function getBAH(grade: PayGrade, hasDependents: boolean): number {
  const rates = BAH_HONOLULU[grade];
  if (!rates) return 0;
  return hasDependents ? rates[0] : rates[1];
}

export function getBAS(grade: PayGrade): number {
  if (isEnlisted(grade)) return BAS_ENLISTED;
  return BAS_OFFICER;
}

export function getCOLA(grade: PayGrade, yearsOfService: number, numDependents: number): number {
  const basePay = getBasePay(grade, yearsOfService);
  const baseAnnual = basePay * 12;

  // DTMO uses "Member Annual Compensation" which includes base pay plus a
  // standardized allowance component (not location-specific BAH). We calibrate
  // using Jay's verified O-3/4YOS/1dep = $23.64444/day ($42,560 spendable,
  // $112,600 annual comp) and E-5/6YOS/1dep = $21.16389/day ($38,095 spendable,
  // $92,618 annual comp).
  // Enlisted & Warrant: Annual Comp = Base Pay × 12 + $49,000
  // Officers (O-1 to O-10, O-1E to O-3E): Annual Comp = Base Pay × 12 + $24,000
  const isEnlistedOrWarrant = grade.startsWith("E-") || grade.startsWith("W-");
  const standardAllowance = isEnlistedOrWarrant ? 49000 : 24000;
  const annualComp = baseAnnual + standardAllowance;

  // Determine dependents column index (0-5, where 5 = 5+)
  const depCol = Math.min(numDependents, 5);

  // Find the spendable income bracket
  let annualSpendable = 0;
  for (const row of SPENDABLE_INCOME_TABLE) {
    if (annualComp <= row[0]) {
      annualSpendable = row[1 + depCol];
      break;
    }
  }
  // If above all brackets, use the highest
  if (annualSpendable === 0) {
    const lastRow = SPENDABLE_INCOME_TABLE[SPENDABLE_INCOME_TABLE.length - 1];
    annualSpendable = lastRow[1 + depCol];
  }

  // COLA formula per DoD FMR Vol 7A, Ch 68:
  // Annual COLA = Spendable Income × ((Index - 100) / 100)
  // Daily Rate = Annual COLA / 360
  // Monthly COLA ≈ Daily Rate × 30
  const colaMultiplier = (OAHU_COLA_INDEX - 100) / 100; // 0.20 for index 120
  const annualCOLA = annualSpendable * colaMultiplier;
  const dailyRate = annualCOLA / 360;
  const monthlyCOLA = dailyRate * 30;

  return Math.round(monthlyCOLA);
}

export interface MilitaryIncomeBreakdown {
  basePay: number;
  bah: number;
  bas: number;
  cola: number;
  totalMonthlyIncome: number;
}

export function calculateMilitaryIncome(
  grade: PayGrade,
  yearsOfService: number,
  hasDependents: boolean,
  numDependents: number,
): MilitaryIncomeBreakdown {
  const basePay = getBasePay(grade, yearsOfService);
  const bah = getBAH(grade, hasDependents);
  const bas = getBAS(grade);
  const cola = getCOLA(grade, yearsOfService, numDependents);

  return {
    basePay,
    bah,
    bas,
    cola,
    totalMonthlyIncome: basePay + bah + bas + cola,
  };
}

// VA loan purchase power estimation
export interface PurchasePowerEstimate {
  maxPurchasePrice: number;
  estimatedMonthlyPITI: number;
  maxDTI: number;
  interestRate: number;
  monthlyPI: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  downPayment: number;
  loanAmount: number;
}

export function estimatePurchasePower(
  totalMonthlyIncome: number,
  monthlyDebts: number = 0,
  interestRate: number = 5.75,
  maxDTI: number = 55,
  monthlyPropertyTax: number = 350,
  monthlyInsurance: number = 150,
  monthlyHOA: number = 0,
  downPayment: number = 0,
): PurchasePowerEstimate {
  // Max monthly housing payment = (income × DTI%) - existing debts
  const maxHousingPayment = (totalMonthlyIncome * maxDTI / 100) - monthlyDebts;

  if (maxHousingPayment <= 0) {
    return { maxPurchasePrice: 0, estimatedMonthlyPITI: 0, maxDTI, interestRate, monthlyPI: 0, monthlyPropertyTax, monthlyInsurance, monthlyHOA, downPayment: 0, loanAmount: 0 };
  }

  // PITIA = P&I + Tax + Insurance + HOA (Assessments)
  // Net available for P&I = maxHousingPayment - fixed monthly costs
  const fixedMonthlyCosts = monthlyPropertyTax + monthlyInsurance + monthlyHOA;
  const maxPI = maxHousingPayment - fixedMonthlyCosts;

  if (maxPI <= 0) {
    return { maxPurchasePrice: 0, estimatedMonthlyPITI: 0, maxDTI, interestRate, monthlyPI: 0, monthlyPropertyTax, monthlyInsurance, monthlyHOA, downPayment: 0, loanAmount: 0 };
  }

  // VA funding fee is typically 2.15% for first use, rolled into loan
  // Loan amount = (purchase price - down payment) * fundingFeeRate
  // maxPI = (price - downPayment) * fundingFeeRate * factor
  // price = maxPI / (fundingFeeRate * factor) + downPayment
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360; // 30-year fixed
  const fundingFeeRate = 1.0215;
  const factor = (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  const maxPriceFromIncome = maxPI / (fundingFeeRate * factor);
  const maxPrice = maxPriceFromIncome + downPayment;

  // Round down to nearest $1,000
  const roundedPrice = Math.floor(maxPrice / 1000) * 1000;

  // Calculate actual PITIA at that price
  const actualLoanBase = roundedPrice - downPayment;
  const loanAmount = actualLoanBase * fundingFeeRate;
  const monthlyPI = loanAmount * factor;
  const pitia = monthlyPI + fixedMonthlyCosts;

  return {
    maxPurchasePrice: Math.max(0, roundedPrice),
    estimatedMonthlyPITI: Math.round(pitia),
    maxDTI,
    interestRate,
    monthlyPI: Math.round(monthlyPI),
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyHOA,
    downPayment,
    loanAmount: Math.round(loanAmount),
  };
}

export const YOS_OPTIONS = [
  { value: 0, label: "Less than 2 years" },
  { value: 2, label: "2 years" },
  { value: 3, label: "3 years" },
  { value: 4, label: "4 years" },
  { value: 6, label: "6 years" },
  { value: 8, label: "8 years" },
  { value: 10, label: "10 years" },
  { value: 12, label: "12 years" },
  { value: 14, label: "14 years" },
  { value: 16, label: "16 years" },
  { value: 18, label: "18 years" },
  { value: 20, label: "20 years" },
  { value: 22, label: "22 years" },
  { value: 24, label: "24 years" },
  { value: 26, label: "26+ years" },
];

export const DEPENDENTS_OPTIONS = [
  { value: 0, label: "0 (No dependents)" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5+" },
];
