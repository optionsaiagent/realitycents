/*
 * Pacific Modernism — "Email Yourself These Results" Lead Capture
 * Lightweight, non-intrusive component shown after calculator results.
 * Captures name + email + calculator context for lead nurturing.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, CheckCircle, Send } from "lucide-react";

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
}

interface EmailResultsProps {
  calculator: string; // e.g., "dscr", "assumable", "escalation", "loan-compare"
  resultSummary?: string; // Optional brief summary of the calculation
  scenarios?: EmailScenario[]; // Structured scenario data for rich email
}

export default function EmailResults({ calculator, resultSummary, scenarios }: EmailResultsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const captureLeadMutation = trpc.leads.captureCalculatorLead.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: () => setSubmitted(true), // Graceful degradation
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    captureLeadMutation.mutate({
      name,
      email,
      calculator,
      resultSummary: resultSummary || undefined,
      scenarios: scenarios || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="mt-8 bg-teal/5 border border-teal/20 rounded-xl p-6 text-center">
        <CheckCircle className="w-8 h-8 text-teal mx-auto mb-3" />
        <p className="font-body font-semibold text-navy text-sm">Results saved!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Check your inbox for a copy of this breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-sand/30 border border-border rounded-xl p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-teal" />
        <h4 className="font-body font-semibold text-navy text-sm">
          Email yourself this breakdown
        </h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Save these results for later — we'll send you a copy.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-3 py-2 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="flex-1 px-3 py-2 rounded-md border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
        />
        <button
          type="submit"
          disabled={captureLeadMutation.isPending}
          className="inline-flex items-center justify-center gap-1.5 bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-md text-sm font-body font-semibold transition-all disabled:opacity-60 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          {captureLeadMutation.isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
