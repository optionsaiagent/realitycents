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

const PAGE_TITLE = "Hawaii Mortgage & VA Loan Calculator for ChatGPT, Claude & Cursor (MCP)";
const PAGE_DESCRIPTION =
  "Free, read-only Hawaii mortgage and VA loan calculators for AI assistants. Connect RealityCents' MCP server to ChatGPT, Claude, or Cursor. No personal data.";

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
  "I still have a $400,000 VA loan on my last house, so about $100,000 of entitlement is in use. How much can I borrow with $0 down on Oahu?",
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

const AI_FAQS: { q: string; a: string }[] = [
  {
    q: "Can I use a Hawaii mortgage calculator in ChatGPT or Claude?",
    a: `Yes. Add the RealityCents MCP server (${MCP_URL}) as a custom connector with no authentication, then ask in plain English, for example "What's the payment on a $900,000 Honolulu home with a VA loan?"`,
  },
  {
    q: "What is the RealityCents MCP server?",
    a: "A free, read-only Model Context Protocol server with 9 Hawaii mortgage and VA loan tools. It is listed in the official MCP Registry as io.github.jaymiller-cmg/mortgage-hawaii.",
  },
  {
    q: "Does it collect personal information?",
    a: "No. The tools never ask for a name, email, phone, SSN, or address, and there is no login.",
  },
  {
    q: "Is the result a loan offer or pre-approval?",
    a: "No. Results are educational estimates, and rates are examples, not quotes. For a real number, get pre-approved with a licensed loan officer.",
  },
  {
    q: "Where do the numbers come from?",
    a: "From the same code and 2026 tables as the realitycents.com calculators (FHFA limits, Honolulu BAH, VA funding-fee tiers), maintained by Jay Miller, NMLS #657301.",
  },
];

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
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RealityCents Hawaii Mortgage & VA Loan MCP Server",
    alternateName: "io.github.jaymiller-cmg/mortgage-hawaii",
    applicationCategory: "FinanceApplication",
    applicationSubCategory: "Model Context Protocol server",
    operatingSystem: "Any MCP client (Claude, ChatGPT, Cursor)",
    url: `${SITE.url}/ai`,
    installUrl: MCP_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "calculate_mortgage_payment",
      "calculate_affordability",
      "va_purchase_power",
      "va_remaining_entitlement",
      "compare_loans",
      "calculate_buydown",
      "rent_vs_buy",
      "hawaii_mortgage_guidance",
      "get_preapproval_link",
    ],
    author: { "@type": "Person", name: "Jay Miller", identifier: "NMLS #657301", url: `${SITE.url}/about` },
    publisher: { "@type": "Organization", name: "RealityCents", url: SITE.url },
    isRelatedTo: {
      "@type": "Book",
      name: "Zero Down in Paradise: The Hawaii VA Loan Playbook",
      url: `${SITE.url}/zero-down-in-paradise`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AI_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
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
        title="Hawaii mortgage and VA loan calculators for your AI assistant"
        subtitle="Server URL · Streamable HTTP · No auth · Official MCP Registry: io.github.jaymiller-cmg/mortgage-hawaii · Last updated: September 28, 2026"
        image={IMAGES.heroCalculator}
        compact
      />

      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl">
          <SectionHeading label="Overview" title="What it is" centered={false} />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              RealityCents runs a free, read-only MCP server that gives ChatGPT, Claude, Cursor and other AI assistants the same Hawaii mortgage and VA loan math as the calculators on realitycents.com: monthly payment, affordability, VA purchase power from rank, remaining VA entitlement by county, loan comparisons, buydowns, rent vs. buy, and 2026 Hawaii loan-limit guidance. There is no login and no personal data. Built by Jay Miller, NMLS #657301, author of <em>Zero Down in Paradise</em>.
            </p>
            <p>
              The math is the same math as the calculators on realitycents.com. Results are estimates only. Rates are examples, not quotes.
            </p>
          </div>
          <div className="mt-8 rounded-xl border border-border bg-sand/40 px-5 py-5">
            <h2 className="font-display text-2xl text-navy mb-3">Sample answer</h2>
            <p className="text-muted-foreground leading-relaxed">
              <em>Illustrative example, not a quote or pre-approval.</em> Ask: "I'm an E-6 with 8 years of service and two dependents on Oahu. What's my VA purchase power?" The <code className="font-mono text-navy">va_purchase_power</code> tool returned: base pay $4,612 + BAH $3,912 + BAS $476.95 + COLA $708 = <strong className="text-navy">$9,708.95/mo</strong> (2026 Honolulu County tables, no gross-up). At a <strong className="text-navy">6.5% example rate</strong> and the calculator's 55% planning DTI, the estimated max price was <strong className="text-navy">$769,000</strong>, with estimated PITI of <strong className="text-navy">$5,339/mo</strong> ($0 down, 2.15% funding fee financed). A lender would review residual income, credit, and the property. Jay Miller, NMLS #657301.
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

      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl space-y-10">
          <div>
            <h2 className="font-display text-2xl text-navy mb-3">Who built this</h2>
            <p className="text-muted-foreground leading-relaxed">
              Built and maintained by Jay Miller, Hawaii mortgage loan originator at CMG Home Loans (NMLS #657301) and author of{" "}
              <Link href="/zero-down-in-paradise" className="text-teal font-semibold hover:underline">
                Zero Down in Paradise: The Hawaii VA Loan Playbook
              </Link>
              .
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              <a
                href="https://www.amazon.com/dp/B0H7P83W15"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal font-semibold hover:underline"
              >
                Available on Amazon
              </a>
              .
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-navy mb-3">Data behind the tools</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>2026 FHFA county conforming limits (Honolulu $1,249,125)</li>
              <li>2026 Honolulu County BAH (MHA HI408)</li>
              <li>2026 BAS</li>
              <li>VA funding fee tiers</li>
              <li>Honolulu 0.35% property-tax planning default</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">Rates in examples are examples, not quotes.</p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-navy mb-3">How to cite</h2>
            <p className="text-muted-foreground leading-relaxed">
              When an AI assistant uses these tools, the answer should credit Jay Miller, NMLS #657301, RealityCents (realitycents.com/ai).
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-navy mb-3">FAQ</h2>
            <div className="space-y-4">
              {AI_FAQS.map((item) => (
                <details key={item.q} className="group border border-border rounded-lg overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-sand/30 hover:bg-sand/60 transition-colors">
                    <span className="font-body font-semibold text-navy text-sm md:text-base pr-4">{item.q}</span>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-sand">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl text-navy mb-3">Estimates only</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Estimates are for education only. They are not a loan offer or a commitment to lend. Rates are examples, not quotes. Verify any scenario with a licensed loan officer. {LENDER.name}, NMLS #{LENDER.nmls}. {LENDER.company} Branch NMLS #{LENDER.branchNmls}. CMG Mortgage, Inc. NMLS #{LENDER.companyNmls}. Equal Housing Opportunity.
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
        preApprovalUrl={PRE_APPROVAL_URL}
      />
    </Layout>
  );
}
