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

/**
 * Send calculator results email to the user.
 */
export async function sendCalculatorResultsEmail(params: {
  to: string;
  name: string;
  calculator: string;
  resultSummary?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured — skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  const { to, name, calculator, resultSummary } = params;

  const calculatorLabel = formatCalculatorName(calculator);
  const subject = `Your ${calculatorLabel} Results — RealityCents`;

  const html = buildResultsEmailHtml({ name, calculatorLabel, resultSummary });

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

function buildResultsEmailHtml(params: {
  name: string;
  calculatorLabel: string;
  resultSummary?: string;
}): string {
  const { name, calculatorLabel, resultSummary } = params;

  const summarySection = resultSummary
    ? `
      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:16px 20px;margin:20px 0;">
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
      <!-- Header -->
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0;color:#1e3a5f;font-size:22px;font-weight:700;">RealityCents</h1>
        <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Hawaii's Mortgage Education Resource</p>
      </div>

      <!-- Body -->
      <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${name},
      </p>
      <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Here's a copy of your <strong>${calculatorLabel}</strong> results from RealityCents.
      </p>

      ${summarySection}

      <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:20px 0 16px;">
        Want to run the numbers again or compare different scenarios? Visit the calculator anytime:
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="https://realitycents.com/loan-compare" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Open Loan Comparison Calculator
        </a>
      </div>

      <!-- Footer -->
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;"/>
      <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;text-align:center;">
        Jay Miller · Certified Mortgage Advisor · NMLS #657301<br/>
        CMG Home Loans · Honolulu, Hawaii<br/><br/>
        <a href="https://realitycents.com" style="color:#0f766e;text-decoration:none;">realitycents.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
