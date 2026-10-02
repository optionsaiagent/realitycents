/*
 * First-lien HELOC hub: /first-lien-heloc-hawaii
 * Copy is verbatim from the approved hub draft, with review tags removed.
 * Preview only until CMG compliance review. AIO_HUB_UPDATED changes only at merge.
 */
import type { ReactNode } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import {
  AIO_HUB_UPDATED,
  AIO_NAME,
  AIO_TM_LINE,
  LENDER,
  PRE_APPROVAL_URL,
  SITE,
} from "@/lib/constants";

const HUB_PATH = "/first-lien-heloc-hawaii";
const HUB_URL = `${SITE.url}${HUB_PATH}`;
const PAGE_TITLE = `${AIO_NAME} in Hawaii: How CMG's First-Lien HELOC Works | RealityCents`;
const SEO_TITLE = `${AIO_NAME} in Hawaii: How CMG's First-Lien HELOC Works`;
const PAGE_DESCRIPTION = `How the CMG ${AIO_NAME}, a 30-year first-lien HELOC with a built-in sweep checking account, works in Hawaii; how it compares with a 30-year fixed, other first-lien HELOCs, and velocity banking; and who it fits.`;
const PAGE_KEYWORDS =
  "All In One Loan Hawaii, CMG All In One Loan, first lien HELOC Hawaii, velocity banking vs HELOC, HELOC sweep account, Jay Miller NMLS 657301";

const FAQ: { q: string; a: string }[] = [
  {
    q: `What is the CMG ${AIO_NAME}?`,
    a: "It is a 30-year first-lien home equity line of credit with a built-in sweep checking account, offered by CMG Home Loans. It replaces a traditional mortgage on a purchase or refinance.",
  },
  {
    q: `How does the sweep account in the ${AIO_NAME} work?`,
    a: "Deposits are applied against the loan balance as soon as they post, and you pay bills from the same account. Interest is calculated nightly on the unpaid balance and billed monthly, so money waiting to be spent still lowers the balance interest is charged on.",
  },
  {
    q: `Is the ${AIO_NAME} rate fixed or variable?`,
    a: "Variable. It is an index plus a margin, can change each monthly billing cycle, and stays within a floor and a lifetime cap set when the account opens. Ask for CMG's Important Terms disclosure for the current details.",
  },
  {
    q: `Is velocity banking the same as the ${AIO_NAME}?`,
    a: `No. Velocity banking is a strategy that usually pairs a regular mortgage with a separate HELOC and moves lump sums between them. The ${AIO_NAME} builds the deposit-against-balance idea into one first-lien account. Both depend on steady monthly surplus.`,
  },
  {
    q: `Will an ${AIO_NAME} pay off my house faster?`,
    a: "It depends on your income, spending, balance, and the rate path. With a steady surplus the balance can fall faster than on a fixed schedule; without one, or if rates rise, it may not. A side-by-side simulation with your own numbers is the only fair answer.",
  },
  {
    q: `Who should avoid an ${AIO_NAME}?`,
    a: "Households without consistent monthly surplus, anyone who would treat the line as spending money, and borrowers who need the certainty of a fixed payment.",
  },
  {
    q: `Who offers the ${AIO_NAME} in Hawaii?`,
    a: "CMG Home Loans. In Honolulu, Jay Miller, Sales Manager and Certified Mortgage Advisor, NMLS #657301, can walk you through it: (808) 429-0811 or jaym@cmghomeloans.com.",
  },
];

const COMPARISON_ROWS: { label: string; fixed: string; aio: string }[] = [
  {
    label: "Rate",
    fixed: "Fixed for the life of the loan",
    aio: "Variable; can change monthly within a floor and lifetime cap",
  },
  {
    label: "Required payment",
    fixed: "Same principal and interest every month",
    aio: "No fixed amortizing payment; see CMG's disclosure for minimum payments",
  },
  {
    label: "How principal goes down",
    fixed: "On a set amortization schedule, plus any extra payments",
    aio: "Through deposits you leave in the account",
  },
  {
    label: "Getting money back out after paying down",
    fixed: "Usually requires a refinance or a separate HELOC",
    aio: "Available up to your available credit limit during the 30-year term",
  },
  {
    label: "Payment certainty",
    fixed: "High",
    aio: "Low; interest cost moves with the rate and your balance",
  },
  {
    label: "Usually fits",
    fixed: "Borrowers who want a predictable payment",
    aio: "Borrowers with steady surplus who will run their banking through the loan",
  },
];

function longDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

const HUB_UPDATED_LABEL = longDate(AIO_HUB_UPDATED);

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${HUB_URL}#webpage`,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: HUB_URL,
    dateModified: `${AIO_HUB_UPDATED}T00:00:00-10:00`,
    author: { "@id": "https://realitycents.com/#jaymiller" },
    reviewedBy: { "@id": "https://realitycents.com/#jaymiller" },
    about: {
      "@type": "FinancialProduct",
      name: AIO_NAME,
      category: "First-lien home equity line of credit",
      provider: {
        "@type": "Organization",
        name: "CMG Home Loans",
        identifier: "NMLS #1820",
      },
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: `${AIO_NAME} in Hawaii`, item: HUB_URL },
    ],
  },
];

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "text-teal font-semibold hover:underline";
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export default function FirstLienHelocHawaii() {
  return (
    <Layout>
      <SEO
        title={SEO_TITLE}
        description={PAGE_DESCRIPTION}
        url={HUB_PATH}
        keywords={PAGE_KEYWORDS}
        schema={schema}
      />

      <article>
        <header className="bg-navy pt-28 pb-10 lg:pt-36 lg:pb-14">
          <div className="container max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
              The {AIO_NAME} in Hawaii: How a First-Lien HELOC With a Sweep Account Works
            </h1>
            <p className="mt-4 text-sm md:text-base text-sand/80 italic">
              By Jay Miller, {LENDER.title}, {LENDER.company} | NMLS #{LENDER.nmls} | Last updated: {HUB_UPDATED_LABEL}
            </p>
          </div>
        </header>

        <div className="container max-w-3xl py-12 lg:py-16">
          <p className="article-intro mb-6 font-body text-lg leading-relaxed text-navy md:text-xl">
            The CMG {AIO_NAME} is a 30-year first-lien home equity line of credit (HELOC) that replaces a traditional mortgage and comes with a built-in sweep checking account: your deposits lower the loan balance right away, and the money stays available to spend. Interest is calculated on each day's balance at a variable rate, so the result depends on your cash flow and the rate path, not on the starting rate alone. It can fit households with steady monthly surplus and spending discipline; it does not fit anyone who needs a fixed payment or lives paycheck to paycheck.
          </p>

          <aside className="key-takeaway mb-8 rounded-xl border-l-4 border-teal bg-teal/5 p-5">
            <p className="mb-3 font-body text-sm font-semibold text-navy">
              <strong>Key facts</strong>
            </p>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-muted-foreground">
              <li><strong className="text-navy">What it is:</strong> a 30-year first-lien HELOC with an integrated sweep checking account, offered by CMG Home Loans.</li>
              <li><strong className="text-navy">How interest works:</strong> calculated nightly on the unpaid balance and billed monthly.</li>
              <li><strong className="text-navy">Rate:</strong> variable, tied to an index plus a margin; it can change every monthly billing cycle, within a floor and a lifetime cap set when the account opens.</li>
              <li><strong className="text-navy">Access to funds:</strong> advances are available up to your available credit limit for the 30-year term; the limit begins stepping down after year 10.</li>
              <li><strong className="text-navy">The catch:</strong> it only helps if you consistently deposit more than you spend, and a rising rate raises your interest cost.</li>
            </ul>
          </aside>

          <section className="mt-12" id="how-it-works">
            <h2 className="font-display text-3xl text-navy mb-4">How the CMG {AIO_NAME} works</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A traditional mortgage and a checking account are two separate things. Your paycheck lands in checking, and once a month you send a fixed payment to the lender. The {AIO_NAME} puts both in one account.
            </p>
            <ol className="list-decimal space-y-3 pl-5 text-muted-foreground leading-relaxed mb-6">
              <li><strong className="text-navy">Your income is deposited into the account.</strong> Each deposit is applied against the loan balance the day it posts.</li>
              <li><strong className="text-navy">You pay bills from the same account.</strong> Debit card, checks, online bill pay, and transfers draw on the line, the way a checking account would.</li>
              <li><strong className="text-navy">Interest accrues on each day's balance.</strong> CMG computes interest nightly on the unpaid principal and totals it at the end of the month.</li>
              <li><strong className="text-navy">What you don't spend keeps the balance lower.</strong> There is no traditional amortization schedule; principal goes down through the money you leave in the account.</li>
            </ol>

            <aside className="my-6 rounded-xl border border-gold/40 bg-sand/60 p-5">
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-navy">Illustration from the RealityCents first-lien HELOC article (not a quote, not a prediction):</strong>{" "}
                a household with a $600,000 balance deposits $12,000 of take-home pay on the 1st, so the balance drops to $588,000 that night. As $7,000 of living expenses are paid through the month, the balance drifts back up. The $5,000 that isn't spent stays against the balance. The daily balance makes a sawtooth pattern: a sharp drop on payday, a slow climb as bills are paid. Your own numbers will differ; the{" "}
                <TextLink href="/heloc-sweep-calculator">HELOC sweep calculator</TextLink>{" "}
                runs a day-by-day simulation with your inputs.
              </p>
            </aside>

            <h3 className="font-display text-2xl text-navy mt-8 mb-3">The credit line over 30 years</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Per CMG's current Important Terms disclosure, you can take advances up to your available credit limit for 360 months. The full credit limit is available for the first 120 billing periods (10 years). After that, the limit reduces by 1/240 of the original limit each month until it reaches zero at month 360, and the required payment includes whatever is needed to keep the balance at or below the reduced limit.
            </p>

            <h3 className="font-display text-2xl text-navy mt-8 mb-3">Payments</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              There is no fixed principal-and-interest payment like a 30-year fixed loan has. Interest is charged monthly and principal is reduced by deposits. CMG's Important Terms disclosure explains the minimum payment requirements, how they change after year 10, and the fees; ask for it and read it before you apply.
            </p>
          </section>

          <section className="mt-12" id="vs-30-year-fixed">
            <h2 className="font-display text-3xl text-navy mb-4">{AIO_NAME} vs. a 30-year fixed mortgage</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The useful comparison is total interest paid and payoff timeline under your real cash flow, not the starting rate. A higher rate on a balance that stays lower can cost less in dollars than a lower rate on a balance that amortizes slowly, and the reverse can also be true.
            </p>
            <div className="overflow-x-auto my-6">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-navy">
                    <th className="p-3" />
                    <th className="p-3 font-display text-base text-navy font-normal">30-year fixed mortgage</th>
                    <th className="p-3 font-display text-base text-navy font-normal">CMG {AIO_NAME}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-border align-top">
                      <th scope="row" className="p-3 font-semibold text-navy">{row.label}</th>
                      <td className="p-3 text-muted-foreground">{row.fixed}</td>
                      <td className="p-3 text-muted-foreground">{row.aio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Extra principal payments on a fixed-rate loan also cut total interest. The difference is liquidity and rate type: on a fixed loan, extra principal is locked in the house; in the {AIO_NAME}, paid-down principal stays available, at the cost of a variable rate. The{" "}
              <TextLink href="/knowledge-base/first-lien-heloc-vs-traditional-mortgage-hawaii">first-lien HELOC vs. traditional mortgage article</TextLink>{" "}
              walks through the math in more depth.
            </p>
          </section>

          <section className="mt-12" id="vs-other-first-lien-helocs">
            <h2 className="font-display text-3xl text-navy mb-4">{AIO_NAME} vs. other first-lien HELOCs</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              "First-lien HELOC" describes a category, not one product. Features vary a lot, so compare these line by line:
            </p>
            <ul className="list-disc space-y-3 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li><strong className="text-navy">Integrated sweep checking.</strong> Is your paycheck deposited straight against the balance, or do you have to move money from a separate bank? The checking account in the {AIO_NAME} is built in.</li>
              <li><strong className="text-navy">Draw period and step-down.</strong> How long can you draw, and when does the limit start shrinking? Many second-lien HELOCs have a 10-year draw period. The {AIO_NAME} allows advances for 30 years, with the limit stepping down after year 10.</li>
              <li><strong className="text-navy">Index, margin, floor, and cap.</strong> Which index, what margin, is the margin fixed, and what are the floor and lifetime cap? Get the numbers in writing.</li>
              <li><strong className="text-navy">Occupancy.</strong> Some products are limited to primary residences; ask whether second homes and investment properties are allowed.</li>
              <li><strong className="text-navy">Fees.</strong> Ask about annual fees and closing costs; CMG's Important Terms disclosure lists them for the {AIO_NAME}.</li>
              <li><strong className="text-navy">Hawaii property types.</strong> Ask how condos, condotels, and leasehold properties are treated before you fall in love with a property.</li>
            </ul>
          </section>

          <section className="mt-12" id="velocity-banking">
            <h2 className="font-display text-3xl text-navy mb-4">Velocity banking with a HELOC vs. the {AIO_NAME}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-navy">Velocity banking is a cash-flow strategy, not a loan product.</strong>{" "}
              The usual version keeps a regular mortgage, opens a HELOC (often a second lien), uses the HELOC to make lump-sum "chunk" payments against the mortgage principal, then routes income into the HELOC to pay it back down, and repeats.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">What it can and can't do:</p>
            <ul className="list-disc space-y-3 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li>It reduces interest only to the extent your monthly surplus pays principal down sooner. Without surplus, it moves debt around and can add cost.</li>
              <li>The HELOC usually carries a variable rate, and the chunk sits on that rate until income pays it down.</li>
              <li>It takes active management: timing chunks, tracking two loans, and keeping spending in check.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The {AIO_NAME} uses the same core idea, letting idle cash sit against the balance, but builds it into one first-lien account, so there are no chunk transfers between two loans. Either way, the math only works with real, repeatable surplus. Anyone promising a specific payoff date or savings amount without your actual numbers is selling, not calculating.
            </p>
          </section>

          <section className="mt-12" id="who-it-fits">
            <h2 className="font-display text-3xl text-navy mb-4">Who it fits, and who it doesn't</h2>
            <p className="text-navy font-semibold mb-2">It can fit:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li>Households with steady income and a reliable monthly surplus.</li>
              <li>People willing to run their everyday banking through the loan account.</li>
              <li>Borrowers who value keeping access to paid-down principal for repairs, emergencies, or opportunities.</li>
            </ul>
            <p className="text-navy font-semibold mb-2">It doesn't fit:</p>
            <ul className="list-disc space-y-3 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li><strong className="text-navy">Paycheck-to-paycheck households.</strong> With no surplus, you carry a variable rate with none of the benefit.</li>
              <li><strong className="text-navy">Anyone who would treat the line as spending money.</strong> Your home equity is reachable with a debit card. If that would become a slush fund, the balance can go up instead of down.</li>
              <li><strong className="text-navy">Borrowers who need payment certainty.</strong> If a rate change would strain your budget or your sleep, a fixed-rate loan is the better choice.</li>
            </ul>
            <p className="text-navy font-semibold mb-2">The risks, plainly:</p>
            <ul className="list-disc space-y-3 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li><strong className="text-navy">Variable rate.</strong> The rate can change every month, up to the lifetime cap, and there is no annual limit on how much it can move.</li>
              <li><strong className="text-navy">Discipline.</strong> Results depend on your behavior every month for years.</li>
              <li><strong className="text-navy">Cash flow.</strong> If your monthly surplus is smaller than the monthly interest, the balance grows.</li>
              <li><strong className="text-navy">Shrinking access after year 10.</strong> The credit limit steps down, and payments can rise to keep the balance under it.</li>
              <li><strong className="text-navy">Qualification.</strong> Expect underwriting to focus on credit, equity, and documented cash flow.</li>
            </ul>
          </section>

          <section className="mt-12" id="who-can-set-it-up">
            <h2 className="font-display text-3xl text-navy mb-4">Who can set up an {AIO_NAME} in Hawaii</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Jay Miller, {LENDER.title} at {LENDER.company} in Honolulu (NMLS #{LENDER.nmls}), works with Hawaii homeowners and buyers on the {AIO_NAME} for purchases and refinances on Oahu, Maui, Kauai, and the Big Island. Bring your balance, take-home income, and monthly spending, and ask for a side-by-side simulation against a traditional mortgage that shows total interest and payoff timeline under different rate assumptions.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li>
                Call <TextLink href={`tel:${LENDER.phoneE164}`}>{LENDER.phone}</TextLink>
                {" "}or email <TextLink href={`mailto:${LENDER.email}`}>{LENDER.email}</TextLink>
              </li>
              <li><TextLink href={PRE_APPROVAL_URL}>Apply with CMG Home Loans</TextLink></li>
              <li>
                Run your own numbers first: <TextLink href="/heloc-sweep-calculator">HELOC sweep calculator</TextLink>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-3">Related reading:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed mb-4">
              <li>
                <TextLink href="/knowledge-base/first-lien-heloc-vs-traditional-mortgage-hawaii">
                  First-lien HELOCs vs. traditional mortgages: why the interest rate isn't the number that matters
                </TextLink>
              </li>
              <li>
                <TextLink href="/knowledge-base/va-second-tier-entitlement-hawaii">VA second-tier entitlement in Hawaii</TextLink>
                {" "}(includes the first-lien HELOC as an option for a second property)
              </li>
              <li>
                <TextLink href="/knowledge-base/adjustable-rate-mortgage-hawaii">Adjustable-rate mortgages in Hawaii</TextLink>
              </li>
              <li>
                <TextLink href="/knowledge-base/refinancing-hawaii-homeowners">When and how to refinance your Hawaii mortgage</TextLink>
              </li>
            </ul>
          </section>

          <section className="mt-12" id="faq">
            <h2 className="font-display text-3xl text-navy mb-4">Frequently asked questions</h2>
            {FAQ.map((item) => (
              <div key={item.q} className="mb-6">
                <h3 className="font-display text-xl text-navy mb-2">{item.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </section>

          <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Jay Miller, {LENDER.title} | NMLS #{LENDER.nmls} | {LENDER.company} Branch NMLS #{LENDER.branchNmls} | {LENDER.address.full} |{" "}
              <TextLink href={`tel:${LENDER.phoneE164}`}>{LENDER.phone}</TextLink>
            </p>
            <p>
              CMG Mortgage, Inc. dba CMG Home Loans, NMLS #{LENDER.companyNmls}. For licensing information, go to{" "}
              <TextLink href="https://www.nmlsconsumeraccess.org">www.nmlsconsumeraccess.org</TextLink>.
              {" "}Equal Housing Opportunity.
            </p>
            <p>
              This page is educational. It is not an offer to lend, a commitment to lend, or a rate quote. The {AIO_NAME} is a variable-rate line of credit; the rate and the interest you pay can increase. Results depend on your deposits, spending, balance, and rate changes, and are not guaranteed. All loans are subject to credit approval, property eligibility, and program guidelines. {AIO_TM_LINE}
            </p>
          </footer>
        </div>
      </article>
    </Layout>
  );
}
