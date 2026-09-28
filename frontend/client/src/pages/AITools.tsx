/*
 * Pacific Modernism — Use RealityCents in your AI assistant
 * Public setup page for the read-only Hawaii mortgage MCP server.
 * Estimates only. Not a commitment to lend.
 */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, Copy, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import { IMAGES, LENDER, PRE_APPROVAL_URL, SITE } from "@/lib/constants";

const MCP_URL = "https://realitycents-mcp.jaymiller.workers.dev/mcp";
const MCP_REGISTRY = "io.github.jaymiller-cmg/mortgage-hawaii";
/** PRE_APPROVAL_URL plus the public mobile-share query. */
const PRE_APPROVAL_SHARE_URL = `${PRE_APPROVAL_URL}?from_mobile_share=true`;

const PAGE_TITLE = "Use RealityCents in Your AI Assistant (MCP Server)";
const PAGE_DESCRIPTION =
  "Connect RealityCents' free, read-only Hawaii mortgage and VA loan MCP server to Claude, ChatGPT, Cursor, and other AI assistants. No personal data.";

const CLAUDE_DOCS =
  "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp";
const CHATGPT_DOCS =
  "https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt";
const CURSOR_DOCS = "https://cursor.com/docs/mcp";

const CURSOR_MCP_JSON = `{
  "mcpServers": {
    "realitycents": {
      "url": "https://realitycents-mcp.jaymiller.workers.dev/mcp"
    }
  }
}`;

const TOOLS: { name: string; summary: string }[] = [
  {
    name: "calculate_mortgage_payment",
    summary:
      "Monthly payment (principal & interest, Hawaii property tax, insurance, HOA, plus PMI, FHA MIP or VA funding fee) for conventional, FHA, VA or jumbo.",
  },
  {
    name: "calculate_affordability",
    summary:
      "Estimated maximum purchase price from gross monthly income, debts and a DTI target.",
  },
  {
    name: "va_purchase_power",
    summary:
      "Honolulu County military income (base pay, BAH, BAS, COLA) and VA purchase price from pay grade, years of service and dependents, using 2026 pay tables.",
  },
  {
    name: "va_remaining_entitlement",
    summary:
      "Remaining VA entitlement by Hawaii county, max $0-down loan, and the 25% down payment above that.",
  },
  {
    name: "compare_loans",
    summary:
      "Side-by-side comparison of 2–4 loan scenarios: payment, illustrative cash to close, total interest.",
  },
  {
    name: "calculate_buydown",
    summary:
      "Year-by-year payments and cost of a 2-1, 1-0 or 3-2-1 temporary buydown, or permanent discount points.",
  },
  {
    name: "rent_vs_buy",
    summary: "Cumulative rent vs. the net cost of buying over a holding period.",
  },
  {
    name: "hawaii_mortgage_guidance",
    summary:
      "Short factual notes on Hawaii topics (property tax, VA loans, leasehold vs fee simple, VA condo approval, 2026 loan limits, BAH/COLA, closing costs, pre-approval steps), drawn from RealityCents articles.",
  },
  {
    name: "get_preapproval_link",
    summary: "Jay Miller's CMG Home Loans application link and business contact.",
  },
];

const PROMPTS = [
  "I'm an E-6 with 8 years of service and two dependents stationed at Schofield. What's my VA purchase power in Honolulu?",
  "What's the monthly payment on a $850,000 Honolulu condo with a $650 HOA using a VA loan at 6.25%?",
  "I already have $300,000 of VA entitlement in use. How much can I borrow with $0 down on Oahu?",
  "Compare VA vs 5% down conventional on a $1,000,000 house in Kailua.",
  "Is renting at $3,800/month or buying a $900,000 home better over 7 years?",
  "Explain leasehold vs fee simple in Hawaii.",
];

const SITE_LINKS = [
  { href: "/calculator", label: "Mortgage calculator" },
  { href: "/military-calculator", label: "Military buying power" },
  { href: "/va-eligibility-calculator", label: "VA remaining eligibility" },
  { href: "/affordability-calculator", label: "Affordability calculator" },
  { href: "/buydown-calculator", label: "Buydown calculator" },
  { href: "/rent-vs-buy", label: "Rent vs. buy" },
  { href: "/loan-compare", label: "Loan comparison" },
  { href: "/zero-down-in-paradise", label: "Zero Down in Paradise" },
] as const;

const PAGE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE.url}/ai`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "AI assistant tools", item: `${SITE.url}/ai` },
    ],
  },
];

function CopyServerUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    // Guard: prerender and any non-browser render have no clipboard.
    if (typeof navigator === "undefined" || typeof navigator.clipboard === "undefined") return;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        if (typeof window !== "undefined") {
          window.setTimeout(() => setCopied(false), 2000);
        }
      },
      () => setCopied(false)
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
      <pre className="flex-1 min-w-0 overflow-x-auto rounded-md bg-navy text-sand px-4 py-3 text-sm font-mono leading-relaxed m-0">
        <code>{url}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center justify-center gap-2 shrink-0 bg-teal hover:bg-teal-dark text-white px-4 py-3 rounded-md text-sm font-body font-semibold transition-colors"
        aria-label={copied ? "Server URL copied" : "Copy server URL"}
      >
        {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function DocsLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-body font-semibold text-teal hover:underline"
    >
      {children}
      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
    </a>
  );
}

export default function AITools() {
  return (
    <Layout>
      <SEO
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        url="/ai"
        keywords="Hawaii mortgage MCP server, RealityCents AI assistant, VA loan calculator MCP, Model Context Protocol mortgage Hawaii, Claude custom connector, Jay Miller NMLS 657301"
        schema={PAGE_SCHEMA}
      />

      <PageHero
        title="Use RealityCents in your AI assistant"
        subtitle="A free, read-only Hawaii mortgage and VA loan calculator server for Claude, ChatGPT, Cursor, and any assistant that speaks MCP."
        image={IMAGES.heroCalculator}
        compact
      />

      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl">
          <SectionHeading label="Overview" title="What it is" centered={false} />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              RealityCents publishes a free, read-only Hawaii mortgage and VA loan calculator server for AI assistants, built on the Model Context Protocol (MCP). It does not collect personal data. The tools never ask for your name, email, phone, SSN, or address, and there is no login.
            </p>
            <p>
              The math is the same math as the calculators on realitycents.com. Results are estimates only. Rates are examples, not quotes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-sand">
        <div className="container max-w-4xl">
          <SectionHeading label="Connect" title="Server details" centered={false} />
          <div className="space-y-6">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Server URL
              </p>
              <CopyServerUrl url={MCP_URL} />
            </div>
            <dl className="divide-y divide-border rounded-xl border border-border bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-4 py-3">
                <dt className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">Transport</dt>
                <dd className="text-sm text-navy sm:col-span-2">Streamable HTTP</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-4 py-3">
                <dt className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">Authentication</dt>
                <dd className="text-sm text-navy sm:col-span-2">None</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-4 py-3">
                <dt className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">MCP Registry</dt>
                <dd className="text-sm text-navy sm:col-span-2">
                  <code className="font-mono text-sm break-all">{MCP_REGISTRY}</code>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl">
          <SectionHeading label="Tools" title="The nine tools" centered={false} />
          <ul className="space-y-3">
            {TOOLS.map((tool) => (
              <li key={tool.name} className="rounded-xl border border-border bg-white px-4 py-4">
                <code className="font-mono text-sm font-semibold text-navy">{tool.name}</code>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{tool.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-sand">
        <div className="container max-w-4xl">
          <SectionHeading label="Clients" title="Setup" centered={false} />
          <div className="space-y-8">
            <p className="text-muted-foreground leading-relaxed">
              Menus change. If a label below does not match the app you are using, check that app’s help docs.
            </p>

            <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
              <h3 className="font-display text-2xl text-navy mb-1">Claude</h3>
              <p className="text-sm text-muted-foreground mb-4">claude.ai and Claude Desktop</p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>Go to Customize → Connectors → “+” → “Add custom connector”.</li>
                <li>Enter a name (for example, RealityCents) and the server URL, then click Add.</li>
                <li>Leave OAuth and advanced settings blank.</li>
                <li>In a chat, enable it from the “+” menu → Connectors.</li>
              </ol>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                On Team and Enterprise plans, an Owner adds the connector first under Organization settings → Connectors. The free plan allows one custom connector.
              </p>
              <p className="mt-3">
                <DocsLink href={CLAUDE_DOCS}>Claude custom connector guide</DocsLink>
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
              <h3 className="font-display text-2xl text-navy mb-3">ChatGPT</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Custom MCP servers are added through Developer mode. Availability depends on your plan and workspace settings. Turn on Developer mode in settings, create a new app or connector, paste the URL, choose no authentication, and create it.
              </p>
              <p className="mt-3">
                <DocsLink href={CHATGPT_DOCS}>ChatGPT Developer mode and MCP connectors</DocsLink>
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
              <h3 className="font-display text-2xl text-navy mb-3">Cursor</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Add the server to <code className="font-mono text-navy">.cursor/mcp.json</code> in a project, or to <code className="font-mono text-navy">~/.cursor/mcp.json</code> for every project:
              </p>
              <pre className="overflow-x-auto rounded-md bg-navy text-sand px-4 py-3 text-sm font-mono leading-relaxed m-0">
                <code>{CURSOR_MCP_JSON}</code>
              </pre>
              <p className="mt-3">
                <DocsLink href={CURSOR_DOCS}>Cursor MCP docs</DocsLink>
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
              <h3 className="font-display text-2xl text-navy mb-3">Other MCP clients</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Any client that supports remote Streamable HTTP servers can use the URL above. No authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl">
          <SectionHeading label="Try asking" title="Example prompts" centered={false} />
          <p className="text-muted-foreground leading-relaxed mb-6">
            VA purchase power takes a pay grade, years of service, and dependents — not a raw BAH dollar amount — so ask by rank.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROMPTS.map((prompt) => (
              <figure key={prompt} className="rounded-xl border border-border bg-sand/40 px-5 py-4">
                <blockquote className="text-navy font-body leading-relaxed">
                  <p>“{prompt}”</p>
                </blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-sand">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl text-navy mb-3">Estimates only</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Estimates are for education only. They are not a loan offer or a commitment to lend. Rates are examples, not quotes. Verify any scenario with a licensed loan officer. {LENDER.name}, NMLS #{LENDER.nmls}. {LENDER.company} NMLS #{LENDER.branchNmls}. CMG Mortgage, Inc. NMLS #{LENDER.companyNmls}. Equal Housing Opportunity.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl">
          <SectionHeading label="On the site" title="Use the same calculators here" centered={false} />
          <p className="text-muted-foreground leading-relaxed mb-6">
            Prefer a browser? These pages use the same math, without an AI assistant.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SITE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-body font-semibold text-navy hover:border-teal hover:text-teal transition-colors"
                >
                  {item.label}
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactActions
        variant="full"
        headline="Want a real pre-approval?"
        subtext={`${LENDER.name} can review income, credit, and the property. The assistant only estimates.`}
        preApprovalLabel="Get Pre-Approved"
        preApprovalUrl={PRE_APPROVAL_SHARE_URL}
      />
    </Layout>
  );
}
