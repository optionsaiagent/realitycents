/**
 * Transactional email service using Resend.
 * Sends calculator results to users who opt in via the "Email Results" widget.
 *
 * Required env var on Railway: RESEND_API_KEY
 * Optional env var: EMAIL_FROM (defaults to "RealityCents <results@realitycents.com>")
 */
import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || "RealityCents <results@realitycents.com>";

export interface EmailScenario {
  label: string;
  loanType: string;
  rate: number;
  termYears: number;
  monthlyPI: number;
  monthlyPITI: number;
  cashToClose: number;
  discountPoints?: number;
  discountPointsCost?: number;
  apr?: number;
  purchasePrice?: number;
  downPayment?: number;
  loanAmount?: number;
}

/**
 * Send calculator results email to the user.
 */
export async function sendCalculatorResultsEmail(params: {
  to: string;
  name: string;
  calculator: string;
  resultSummary?: string;
  scenarios?: EmailScenario[];
  shareUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured — skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  const { to, name, calculator, resultSummary, scenarios, shareUrl } = params;

  const calculatorLabel = formatCalculatorName(calculator);
  const subject = `Your ${calculatorLabel} Results — RealityCents`;

  const html = scenarios && scenarios.length > 0
    ? buildRichEmailHtml({ name, calculatorLabel, scenarios, shareUrl })
    : buildFallbackEmailHtml({ name, calculatorLabel, resultSummary, shareUrl });

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent results to ${to} for ${calculator}`);
    return { success: true };
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return { success: false, error: String(err) };
  }
}

function formatCalculatorName(calculator: string): string {
  const map: Record<string, string> = {
    "loan-comparison": "Loan Comparison",
    "loan-compare": "Loan Comparison",
    dscr: "DSCR Analyzer",
    assumable: "Assumable Loan",
    escalation: "Escalation Clause",
  };
  return map[calculator] || calculator.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtExact(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const LOAN_TYPE_LABELS: Record<string, string> = {
  va: "VA",
  fha: "FHA",
  conventional: "Conv.",
  usda: "USDA",
};

// Card background colors matching the PDF page 1
const CARD_BG = ["#0C2340", "#0E4F5C", "#1A3A1A"];
const CARD_ACCENT = "#C9A84C";

// ─── Rich Email Template (with structured scenario data) ──────────────────────

function buildRichEmailHtml(params: {
  name: string;
  calculatorLabel: string;
  scenarios: EmailScenario[];
  shareUrl?: string;
}): string {
  const { name, calculatorLabel, scenarios, shareUrl } = params;

  const ctaUrl = shareUrl || "https://realitycents.com/loan-compare";
  const ctaLabel = shareUrl ? "Re-open Your Exact Scenarios" : "Re-run or Adjust Scenarios";

  // ── Scenario cards ──────────────────────────────────────────────────────────
  // Use a single-row table for side-by-side layout; each card is a <td>
  const colWidth = scenarios.length === 3 ? "33.33%" : "50%";

  const scenarioCards = scenarios.map((s, i) => {
    const bg = CARD_BG[i % CARD_BG.length];
    const loanLabel = LOAN_TYPE_LABELS[s.loanType] || s.loanType;
    const hasPoints = s.discountPointsCost != null && s.discountPointsCost > 0;

    // Row helper: label on left, value on right, with optional top border
    const row = (label: string, value: string, topBorder = true) =>
      `<tr${topBorder ? ' style="border-top:1px solid rgba(255,255,255,0.15);"' : ""}>
        <td style="padding:4px 0;font-size:11px;color:#CBD5E1;">${label}</td>
        <td style="padding:4px 0;font-size:12px;font-weight:700;color:#ffffff;text-align:right;">${value}</td>
      </tr>`;

    return `
      <td style="width:${colWidth};vertical-align:top;padding:0 ${i < scenarios.length - 1 ? "6" : "0"}px 0 ${i > 0 ? "6" : "0"}px;">
        <div style="background:${bg};border-radius:8px;padding:14px;">
          <!-- Card header -->
          <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:${CARD_ACCENT};text-transform:uppercase;letter-spacing:0.08em;">Option ${i + 1}</p>
          <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#ffffff;">${s.termYears}-Yr ${loanLabel}</p>
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:${CARD_ACCENT};">${s.rate.toFixed(3)}% Rate${s.apr ? ` &nbsp;·&nbsp; ${s.apr.toFixed(3)}% APR` : ""}</p>
          <!-- Key numbers table -->
          <table style="width:100%;border-collapse:collapse;">
            ${s.purchasePrice != null ? row("Purchase Price", fmt(s.purchasePrice), false) : ""}
            ${s.downPayment != null ? row("Down Payment", fmt(s.downPayment), s.purchasePrice != null) : ""}
            ${s.loanAmount != null ? row("Loan Amount", fmt(s.loanAmount), s.downPayment != null || s.purchasePrice != null) : ""}
            ${row("Monthly P&I", fmtExact(s.monthlyPI), s.loanAmount != null || s.downPayment != null || s.purchasePrice != null)}
            ${row("Total Monthly (PITI)", fmtExact(s.monthlyPITI))}
            ${hasPoints ? row("Discount Points", fmt(s.discountPointsCost!)) : ""}
            ${row("Cash to Close", fmt(s.cashToClose))}
          </table>
        </div>
      </td>`;
  }).join("");

  // ── Breakeven analysis ──────────────────────────────────────────────────────
  let breakevenHtml = "";
  if (scenarios.length >= 2) {
    const sameTerm = scenarios.every(s => s.termYears === scenarios[0].termYears);
    if (sameTerm) {
      const sorted = [...scenarios].sort((a, b) => a.rate - b.rate);
      const pairs: { lowRate: number; highRate: number; cost: number; savings: number; months: number }[] = [];
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const diff = sorted[i].cashToClose - sorted[j].cashToClose;
          const save = sorted[j].monthlyPI - sorted[i].monthlyPI;
          if (diff > 0 && save > 0) {
            pairs.push({ lowRate: sorted[i].rate, highRate: sorted[j].rate, cost: diff, savings: save, months: Math.ceil(diff / save) });
          }
        }
      }
      if (pairs.length > 0) {
        const pairRows = pairs.map(p => `
          <tr>
            <td style="padding:7px 12px;font-size:12px;color:#1e293b;border-bottom:1px solid #f1f5f9;">
              <strong>${p.lowRate.toFixed(3)}%</strong> vs <strong>${p.highRate.toFixed(3)}%</strong>
            </td>
            <td style="padding:7px 12px;font-size:12px;color:#dc2626;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:600;">${fmt(p.cost)}</td>
            <td style="padding:7px 12px;font-size:12px;color:#059669;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:600;">${fmtExact(p.savings)}/mo</td>
            <td style="padding:7px 12px;font-size:14px;color:#d97706;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:700;">
              ${p.months} mo <span style="font-size:10px;color:#94a3b8;font-weight:400;">(${(p.months / 12).toFixed(1)} yrs)</span>
            </td>
          </tr>`).join("");

        breakevenHtml = `
        <div style="margin:20px 0 0;border:2px solid #d97706;border-radius:8px;overflow:hidden;">
          <div style="background:#fffbeb;padding:10px 14px;border-bottom:1px solid #fde68a;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">&#8595; Points Recovery / Breakeven Analysis</p>
            <p style="margin:3px 0 0;font-size:10px;color:#a16207;">Buying down the rate costs more upfront but saves monthly. How long to recover?</p>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#ffffff;">
            <thead>
              <tr style="background:#fefce8;">
                <th style="padding:7px 12px;font-size:9px;text-transform:uppercase;color:#78350f;text-align:left;letter-spacing:0.05em;">Comparison</th>
                <th style="padding:7px 12px;font-size:9px;text-transform:uppercase;color:#78350f;text-align:center;letter-spacing:0.05em;">Extra Cost</th>
                <th style="padding:7px 12px;font-size:9px;text-transform:uppercase;color:#78350f;text-align:center;letter-spacing:0.05em;">Monthly Savings</th>
                <th style="padding:7px 12px;font-size:9px;text-transform:uppercase;color:#78350f;text-align:right;letter-spacing:0.05em;">Breakeven</th>
              </tr>
            </thead>
            <tbody>${pairRows}</tbody>
          </table>
        </div>`;
      }
    }
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header Bar -->
      <div style="background:#0C2340;padding:18px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">RealityCents</p>
              <p style="margin:3px 0 0;color:#94a3b8;font-size:11px;">Loan Comparison Results</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;color:${CARD_ACCENT};font-size:11px;font-weight:600;">Jay Miller &middot; NMLS #657301</p>
              <p style="margin:2px 0 0;color:#94a3b8;font-size:10px;">CMG Home Loans &middot; Honolulu, HI</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding:24px;">
        <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 18px;">
          Hi ${name}, here&rsquo;s your <strong>${calculatorLabel}</strong> breakdown:
        </p>

        <!-- Scenario Cards -->
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <tr>${scenarioCards}</tr>
        </table>

        ${breakevenHtml}

        <!-- CTA -->
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">${ctaLabel}</a>
        </div>
        ${shareUrl ? `<p style="text-align:center;color:#94a3b8;font-size:11px;margin:6px 0 0;">This link restores your exact scenarios.</p>` : ""}
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 24px;text-align:center;">
        <p style="color:#64748b;font-size:11px;line-height:1.6;margin:0;">
          Estimates for educational purposes only. Not a commitment to lend.<br/>
          Jay Miller &middot; Certified Mortgage Advisor &middot; NMLS #657301 &middot; CMG Home Loans NMLS #2475890<br/>
          <a href="https://realitycents.com" style="color:#0f766e;text-decoration:none;">realitycents.com</a> &middot; (808) 429-0811
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

// ─── Fallback Email Template (text summary only) ──────────────────────────────

function buildFallbackEmailHtml(params: {
  name: string;
  calculatorLabel: string;
  resultSummary?: string;
  shareUrl?: string;
}): string {
  const { name, calculatorLabel, resultSummary, shareUrl } = params;

  const ctaUrl = shareUrl || "https://realitycents.com/loan-compare";
  const ctaLabel = shareUrl ? "Re-open Your Exact Scenarios" : "Open Calculator";

  const summarySection = resultSummary
    ? `<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-weight:600;color:#0f766e;font-size:14px;">Your Results</p>
        <p style="margin:0;color:#1e293b;font-size:15px;line-height:1.6;">${resultSummary.replace(/\|/g, "<br/>")}</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0;color:#0C2340;font-size:22px;font-weight:700;">RealityCents</h1>
        <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Hawaii&rsquo;s Mortgage Education Resource</p>
      </div>
      <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${name},</p>
      <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Here&rsquo;s a copy of your <strong>${calculatorLabel}</strong> results from RealityCents.
      </p>
      ${summarySection}
      <div style="text-align:center;margin:24px 0;">
        <a href="${ctaUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">${ctaLabel}</a>
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;"/>
      <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;text-align:center;">
        Jay Miller &middot; Certified Mortgage Advisor &middot; NMLS #657301<br/>
        CMG Home Loans &middot; Honolulu, Hawaii<br/><br/>
        <a href="https://realitycents.com" style="color:#0f766e;text-decoration:none;">realitycents.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
