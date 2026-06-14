/**
 * ContactActions — Shared CTA component for RealityCents
 *
 * Replaces all duplicated "Get Pre-Approved / Call / Text / Email" blocks
 * across the site with a single, configurable component.
 *
 * Variants:
 *  - "full"    → Section with headline, subtext, and all CTA buttons (for page bottoms)
 *  - "compact" → Inline card with buttons only (for calculator sidebars, article CTAs)
 *  - "inline"  → Minimal row of buttons with no wrapper (for embedding in existing sections)
 */
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import { FileCheck, Phone, Mail, MessageSquare, ArrowRight } from "lucide-react";

export interface ContactActionsProps {
  /** Layout variant */
  variant?: "full" | "compact" | "inline";
  /** Optional custom headline (full variant only) */
  headline?: string;
  /** Optional custom subtext below the headline (full variant only) */
  subtext?: string;
  /** Optional kicker text above the headline (compact variant) */
  kicker?: string;
  /** Custom label for the pre-approval button */
  preApprovalLabel?: string;
  /** Hide the email button */
  hideEmail?: boolean;
  /** Hide the text button */
  hideText?: boolean;
  /** Hide the call button */
  hideCall?: boolean;
  /** Hide the pre-approval button */
  hidePreApproval?: boolean;
  /** Show NMLS footer line */
  showNmls?: boolean;
  /** Additional wrapper className */
  className?: string;
  /** Background style for full variant: "navy" (dark), "sand" (light), or "transparent" */
  background?: "navy" | "sand" | "transparent";
  /** Custom pre-approval URL (overrides PRE_APPROVAL_URL constant) */
  preApprovalUrl?: string;
}

const SMS_BODY = encodeURIComponent(
  "Hi Jay, I found you on RealityCents and have a question about..."
);
const SMS_LINK = `sms:8084290811?body=${SMS_BODY}`;

export default function ContactActions({
  variant = "full",
  headline = "Ready to Run the Numbers?",
  subtext = "Contact Jay Miller today for a free consultation and personalized mortgage guidance.",
  kicker,
  preApprovalLabel = "Get Pre-Approved",
  hideEmail = false,
  hideText = false,
  hideCall = false,
  hidePreApproval = false,
  showNmls = false,
  className = "",
  background = "navy",
  preApprovalUrl,
}: ContactActionsProps) {
  // ─── Button definitions ────────────────────────────────────────────────────
  const preApprovalBtn = !hidePreApproval && (
    <a
      href={preApprovalUrl || PRE_APPROVAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-md text-sm font-body font-semibold transition-all hover:shadow-lg hover:shadow-gold/30"
    >
      <FileCheck className="w-4 h-4" />
      {preApprovalLabel}
    </a>
  );

  const textBtn = !hideText && (
    <a
      href={SMS_LINK}
      className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-3 rounded-md text-sm font-body font-semibold transition-all hover:shadow-lg hover:shadow-teal/25"
    >
      <MessageSquare className="w-4 h-4" />
      Text Jay
    </a>
  );

  const callBtn = !hideCall && (
    <a
      href={`tel:${LENDER.phone}`}
      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-md text-sm font-body font-semibold transition-all border border-white/20"
    >
      <Phone className="w-4 h-4" />
      Call Jay
    </a>
  );

  const callBtnLight = !hideCall && (
    <a
      href={`tel:${LENDER.phone}`}
      className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white px-5 py-3 rounded-md text-sm font-body font-semibold transition-all"
    >
      <Phone className="w-4 h-4" />
      {LENDER.phone}
    </a>
  );

  const emailBtn = !hideEmail && (
    <a
      href={`mailto:${LENDER.email}`}
      className="inline-flex items-center justify-center gap-2 border-2 border-sand/30 text-sand/80 hover:border-teal hover:text-teal px-5 py-3 rounded-md text-sm font-body font-semibold transition-all"
    >
      <Mail className="w-4 h-4" />
      {LENDER.email}
    </a>
  );

  const emailBtnLight = !hideEmail && (
    <a
      href={`mailto:${LENDER.email}`}
      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-white/80 text-navy px-5 py-3 rounded-md text-sm font-body font-semibold transition-all border border-navy/10"
    >
      <Mail className="w-4 h-4" />
      Email Jay
    </a>
  );

  const nmlsFooter = showNmls && (
    <p className={`mt-8 text-xs font-body ${background === "sand" ? "text-muted-foreground" : "text-sand/50"}`}>
      NMLS #{LENDER.nmls} | CMG Home Loans NMLS #{LENDER.branchNmls} | {LENDER.address.full}
    </p>
  );

  // ─── Inline variant ────────────────────────────────────────────────────────
  if (variant === "inline") {
    return (
      <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}>
        {preApprovalBtn}
        {textBtn}
        {callBtn}
        {!hideEmail && emailBtn}
      </div>
    );
  }

  // ─── Compact variant (calculator/article inline cards) ─────────────────────
  if (variant === "compact") {
    return (
      <div className={`rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border ${background === "navy" ? "bg-navy border-gold/20" : "bg-white/5 border-border"} ${className}`}>
        <div className="flex-1">
          {kicker && (
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">
              {kicker}
            </p>
          )}
          <h3 className="font-display text-xl text-white mb-1">{headline}</h3>
          {subtext && <p className="text-sm text-sand/70">{subtext}</p>}
          {showNmls && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {nmlsFooter}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          {preApprovalBtn}
          {textBtn}
          {callBtn}
        </div>
      </div>
    );
  }

  // ─── Full variant (page-bottom section CTA) ────────────────────────────────
  if (background === "sand") {
    return (
      <section className={`py-16 bg-sand ${className}`}>
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl text-navy mb-3">{headline}</h2>
          {subtext && (
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{subtext}</p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!hidePreApproval && (
              <a
                href={preApprovalUrl || PRE_APPROVAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-md font-body font-semibold text-sm transition-all hover:shadow-lg hover:shadow-gold/30"
              >
                <FileCheck className="w-4 h-4" />
                {preApprovalLabel}
              </a>
            )}
            {!hideText && (
              <a
                href={SMS_LINK}
                className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-3 rounded-md text-sm font-body font-semibold transition-all hover:shadow-lg hover:shadow-teal/25"
              >
                <MessageSquare className="w-4 h-4" />
                Text Jay
              </a>
            )}
            {callBtnLight}
            {emailBtnLight}
          </div>
          {nmlsFooter}
        </div>
      </section>
    );
  }

  // Full variant — navy background (default)
  return (
    <section className={`py-16 md:py-20 bg-navy text-white ${className}`}>
      <div className="container max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{headline}</h2>
        {subtext && (
          <p className="text-lg text-sand/80 font-body max-w-2xl mx-auto mb-8">{subtext}</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {preApprovalBtn}
          {textBtn}
          {callBtn}
          {emailBtn}
        </div>
        {nmlsFooter}
      </div>
    </section>
  );
}
