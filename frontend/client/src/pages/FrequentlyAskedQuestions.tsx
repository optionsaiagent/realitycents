/*
 * Pacific Modernism — Frequently Asked Questions Page
 * AI-optimized FAQ with 20 Q&As grouped by 4 categories
 * Accordion UI with FAQPage + LocalBusiness + Person + BreadcrumbList JSON-LD schema
 * Updated: 2026-06-09 - All corrections applied, cross-links to KB articles
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ChevronDown, HelpCircle, FileCheck, Phone, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { LENDER, IMAGES, PRE_APPROVAL_URL } from "@/lib/constants";

/* ─── FAQ Data ─── */
interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  title: string;
  id: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: "Loan Basics",
    id: "loan-basics",
    items: [
      {
        question: "What are the current conforming loan limits in Honolulu County?",
        answer: (
          <>
            For 2026, the conforming loan limit for a single-unit property in Honolulu County is $1,249,125. This applies to conventional loans backed by Fannie Mae and Freddie Mac. VA loans have no loan limit — there is no maximum loan amount for VA borrowers as long as the buyer qualifies for the loan payment. If you need to borrow above the conforming limit on a conventional loan, you would need a jumbo loan, which has different qualification requirements. Contact a local lender to discuss your specific scenario.{" "}
            <a href="/knowledge-base/conventional-loans-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about conventional loans in Hawaii →</a>{" "}
            <a href="/knowledge-base/jumbo-loans-hawaii-luxury" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn about jumbo loans in Hawaii →</a>
          </>
        ),
      },
      {
        question: "How much do I need for a down payment to buy a home in Honolulu?",
        answer: (
          <>
            It depends on your loan type. VA loans require zero down payment for eligible veterans and active-duty service members. FHA loans require 3.5% down with a 580+ credit score. Conventional loans can go as low as 3% down for first-time buyers through Fannie Mae HomeReady or Freddie Mac Home Possible programs. A 20% down payment eliminates the need for private mortgage insurance (PMI) on conventional loans. The City and County of Honolulu also offers a down payment assistance loan of up to $40,000 for qualifying first-time buyers.{" "}
            <a href="/knowledge-base/down-payment-myth-hawaii-pmi-vs-appreciation" className="text-teal underline underline-offset-2 hover:text-teal-dark">Read: The 20% Down Payment Myth in Hawaii →</a>{" "}
            <a href="/knowledge-base/down-payment-assistance-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about down payment assistance →</a>
          </>
        ),
      },
      {
        question: "What credit score do I need to buy a home in Hawaii?",
        answer: (
          <>
            Minimum credit score requirements vary by loan program. Conventional loans generally require a 620 minimum. FHA loans allow scores as low as 580 with 3.5% down, or 500 with 10% down. VA loans require a minimum of 620. The higher your credit score, the better your interest rate and loan terms will be. If your score needs work, a mortgage professional can help you create a plan to improve it before applying.{" "}
            <a href="/knowledge-base/credit-tips-mortgage-approval" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about improving your credit for a mortgage →</a>
          </>
        ),
      },
      {
        question: "How much can I afford to borrow for a home in Hawaii?",
        answer: (
          <>
            Your borrowing power depends on your income, monthly debts, credit score, down payment, and the loan program you choose. A general guideline is the 28/36 rule: your housing payment should not exceed 28% of your gross monthly income, and your total debt payments should stay below 36%. However, most loan programs allow significantly higher ratios for well-qualified borrowers — conventional loans typically allow up to 45–50% DTI, jumbo loans up to 43–45%, FHA up to 55%, and VA loans can go 60% or higher for borrowers with excellent credit profiles. In Hawaii, the high cost of living means HOA fees, property taxes, and homeowner's insurance all factor into your qualifying payment. Getting pre-approved with a local lender gives you a clear picture of your budget before you start shopping.{" "}
            <a href="/knowledge-base/income-needed-buy-home-hawaii-2026" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about income requirements to buy in Hawaii →</a>{" "}
            <a href="/knowledge-base/why-waiting-for-lower-rates-costs-hawaii-military-buyers" className="text-teal underline underline-offset-2 hover:text-teal-dark">Why waiting for lower rates costs you more →</a>{" "}
            <a href="/loan-compare" className="text-teal underline underline-offset-2 hover:text-teal-dark">Compare loan options with our calculator →</a>
          </>
        ),
      },
      {
        question: "Can I buy a home in Hawaii with an FHA loan?",
        answer: (
          <>
            Yes. FHA loans are popular in Hawaii because they allow down payments as low as 3.5% and have more flexible credit requirements than conventional loans. The 2026 FHA loan limit for a single-unit property in Honolulu County is $828,000. FHA loans do require both an upfront mortgage insurance premium (1.75% of the loan amount, typically financed into the loan) and an annual MIP that is paid monthly for the life of the loan. FHA condos must be on HUD's approved condo list or receive a single-unit approval.{" "}
            <a href="/knowledge-base/fha-loans-hawaii-explained" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about FHA loans in Hawaii →</a>
          </>
        ),
      },
      {
        question: "What is the difference between fixed-rate and adjustable-rate mortgages?",
        answer: (
          <>
            A fixed-rate mortgage locks in your interest rate for the entire loan term, typically 15 or 30 years, so your principal and interest payment never changes. An adjustable-rate mortgage (ARM) starts with a lower fixed rate for an initial period (commonly 5 or 7 years), then adjusts periodically based on a market index plus a margin. ARMs can make sense if you plan to sell or refinance before the adjustment period begins. In Hawaii, where many military buyers are on 3-year PCS rotations, a 5/1 or 7/1 ARM can offer significant savings during their time on island.{" "}
            <a href="/knowledge-base/adjustable-rate-mortgage-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Read our full ARM guide for Hawaii buyers →</a>
          </>
        ),
      },
      {
        question: "What should I know about refinancing my mortgage in Hawaii?",
        answer: (
          <>
            There are several reasons to refinance: to lower your interest rate, shorten your loan term, eliminate mortgage insurance, or access home equity through a cash-out refinance. For VA borrowers, the VA Interest Rate Reduction Refinance Loan (IRRRL) offers a streamlined process with minimal documentation and no appraisal requirement. When evaluating a refinance, calculate your break-even point — the number of months of savings needed to recoup your closing costs. As a general rule, a refinance makes the most financial sense when the break-even period is 30 months or less.{" "}
            <a href="/knowledge-base/refinancing-hawaii-homeowners" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about refinancing in Hawaii →</a>
          </>
        ),
      },
    ],
  },
  {
    title: "VA Loans",
    id: "va-loans",
    items: [
      {
        question: "What is the VA loan and who is eligible?",
        answer: (
          <>
            A VA loan is a mortgage benefit backed by the U.S. Department of Veterans Affairs, available to eligible veterans, active-duty service members, certain National Guard and Reserve members, and qualifying surviving spouses. Key benefits include zero down payment, no private mortgage insurance (PMI), competitive interest rates, and limited closing costs. To use a VA loan, you need a Certificate of Eligibility (COE) from the VA, which your lender can often obtain for you. The VA loan can be used for primary residences including single-family homes and VA-approved condominiums.{" "}
            <a href="/knowledge-base/va-loans-hawaii-military" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about VA loans in Hawaii →</a>
          </>
        ),
      },
      {
        question: "Can I use a VA loan to buy a condo in Honolulu?",
        answer: (
          <>
            Yes, but the condominium project must be on the VA's approved condo list or receive a project approval from the VA before closing. Many condo buildings in Honolulu are already VA-approved, but some are not. You can check our <a href="/va-approved-condos-oahu" className="text-teal underline underline-offset-2 hover:text-teal-dark">VA Approved Condos on Oahu list</a> for current approval status. If a project is not currently approved, it may be possible to submit it for approval, though the process takes time. Working with a lender who specializes in VA loans in Hawaii is critical because condo warrantability is one of the most common deal-breakers in the Honolulu market.{" "}
            <a href="/knowledge-base/va-loans-hawaii-military" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about VA loans in Hawaii →</a>
          </>
        ),
      },
      {
        question: "What is the VA funding fee and can it be waived?",
        answer: (
          <>
            The VA funding fee is a one-time fee paid to the VA at closing that helps sustain the loan program. For a first-time VA purchase with zero down payment, the funding fee is 2.15% of the loan amount. For subsequent use, it increases to 3.3%. A down payment of 5% or more reduces the fee. The funding fee is waived entirely for veterans with a service-connected disability rating of 10% or higher, Purple Heart recipients on active duty, and qualifying surviving spouses. The fee can be financed into the loan amount rather than paid out of pocket. Additionally, the VA funding fee is tax deductible — consult a tax advisor to confirm how this applies to your situation.{" "}
            <a href="/knowledge-base/va-funding-fee-tax-deductible" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about the VA funding fee and tax deductibility →</a>
          </>
        ),
      },
      {
        question: "Can I use my VA loan benefit more than once?",
        answer: (
          <>
            Yes. Your VA loan benefit is reusable. You can have more than one VA loan at a time if you have remaining entitlement, or you can restore your full entitlement after selling a previous VA-financed home and paying off that loan. If you are PCSing from one duty station to another, you may be able to keep your current VA loan on your existing property and use remaining entitlement to purchase a new primary residence at your next duty station. The key is understanding your remaining entitlement and how it interacts with the county loan limits at your new location.{" "}
            <a href="/knowledge-base/va-loan-house-hacking-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about using your VA benefit multiple times (house hacking) →</a>
          </>
        ),
      },
    ],
  },
  {
    title: "Hawaii-Specific",
    id: "hawaii-specific",
    items: [
      {
        question: "What is condo warrantability and why does it matter in Hawaii?",
        answer: (
          <>
            Condo warrantability refers to whether a condominium project meets the eligibility standards set by Fannie Mae, Freddie Mac, FHA, or the VA for conventional or government-backed financing. In Honolulu, where condos make up a large share of the housing inventory, warrantability is a critical factor. A non-warrantable condo cannot be financed with a standard conventional, FHA, or VA loan. Common reasons a condo may be non-warrantable include: high investor ownership concentration (this applies to FHA — conventional loans do not have the same investor concentration threshold), pending litigation involving structural defects, inadequate reserve funding, major ongoing repairs or deferred maintenance, and insufficient insurance coverage. Buyers considering a non-warrantable condo typically need a portfolio loan, which may require a larger down payment and carry a higher interest rate.{" "}
            <a href="/knowledge-base/fannie-mae-condo-guidelines-2026-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about Fannie Mae condo guidelines in Hawaii →</a>
          </>
        ),
      },
      {
        question: "Should I use a local lender or an online lender in Hawaii?",
        answer: (
          <>
            Hawaii's real estate market has unique characteristics that can trip up mainland and online lenders. These include leasehold properties, condo warrantability requirements, termite inspection rules (PC-9 form), Hawaiian Home Lands restrictions, and county-specific short-term and vacation rental rules. Hawaii also has unique closing timelines that are not well understood or planned for by mainland lenders, which can cause delays and even jeopardize transactions. A local lender familiar with these nuances can prevent delays, appraisal issues, and deal cancellations. Online lenders may offer competitive rates, but if they lack Hawaii-specific experience, the cost of a failed transaction or delayed closing can far outweigh any rate savings.
          </>
        ),
      },
      {
        question: "What is the termite inspection requirement in Hawaii?",
        answer: (
          <>
            Hawaii requires a wood-destroying insect inspection (commonly called a termite inspection) on all existing residential properties, including condominiums five stories or less. The inspection must be reported on a state-prescribed PC-9 form, which is valid for 90 days from the date of inspection. Termite inspections are not required for conventional financing, though they are typically performed in virtually every purchase transaction given Hawaii's tropical climate and high termite activity. The PC-9 is a standard part of the purchase process and buyers should plan for it regardless of loan type.
          </>
        ),
      },
      {
        question: "What is a leasehold property and should I buy one?",
        answer: (
          <>
            In Hawaii, some properties are built on leased land rather than fee simple (owned) land. With a leasehold property, you own the building or unit but lease the land beneath it from a landowner for a set term. Leasehold properties are typically less expensive than fee simple, but you will pay a monthly lease rent that can increase over time, and financing options are more limited as the lease term shortens. There are no mortgages available for leaseholds with fewer than 15 years remaining on the lease. Conventional lending is available as long as the loan term ends at least 5 years prior to the end of the lease — meaning a 10-year fixed is the shortest term available. VA loans are extremely difficult to obtain on leasehold properties due to strict VA requirements on renegotiation periods and the need for at least 14 years remaining after the end of the loan term. It is important to understand the lease terms, renegotiation provisions, and how the lease affects long-term value before purchasing a leasehold property.{" "}
            <a href="/knowledge-base/leasehold-vs-fee-simple-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about leasehold vs. fee simple in Hawaii →</a>
          </>
        ),
      },
      {
        question: "What are HOA fees in Honolulu and how do they affect my mortgage?",
        answer: (
          <>
            HOA fees in Honolulu condos can range from a few hundred dollars per month to over $1,500 per month for buildings with extensive amenities or aging infrastructure requiring special assessments. Your HOA fee is included in your total monthly housing payment for mortgage qualification purposes, which means a high HOA fee directly reduces how much purchase price you can qualify for. Before making an offer on a condo, review the HOA's financial statements, reserve study, and history of special assessments to avoid surprises.{" "}
            <a href="/knowledge-base/hoa-considerations-hawaii-condos" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about HOA considerations for Hawaii condos →</a>
          </>
        ),
      },
    ],
  },
  {
    title: "Buying Process",
    id: "buying-process",
    items: [
      {
        question: "What is the difference between a mortgage pre-qualification and a pre-approval?",
        answer: (
          <>
            A pre-qualification is an informal estimate of how much you might borrow based on self-reported financial information. No credit pull or documentation is required. A pre-approval is a formal process where the lender verifies your income, assets, employment, and credit history, then issues a pre-approval letter for a specific loan amount. In Hawaii's competitive market, sellers and listing agents strongly prefer offers backed by a pre-approval because it signals a serious, vetted buyer. In Hawaii, lenders typically issue a pre-approval letter specific to each offer — tied to the subject property, offer price, and down payment amount. A pre-approval is valid for 120 days.{" "}
            <a href="/knowledge-base/mortgage-pre-approval-process" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about the mortgage pre-approval process →</a>
          </>
        ),
      },
      {
        question: "What are closing costs when buying a home in Honolulu?",
        answer: (
          <>
            Closing costs in Honolulu typically range from 1% to 3% of the purchase price and include items like the appraisal fee, title insurance, escrow fees, recording fees, prepaid property taxes and homeowner's insurance, and lender origination charges. Some costs may be negotiated as seller-paid. Your lender is required to provide a Loan Estimate within three business days of your application, and a final Closing Disclosure at least three business days before closing, so you will have full transparency on costs before you sign.{" "}
            <a href="/knowledge-base/understanding-closing-costs-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about closing costs in Hawaii →</a>
          </>
        ),
      },
      {
        question: "How long does it take to close on a home in Honolulu?",
        answer: (
          <>
            A typical purchase transaction in Honolulu takes 30 to 45 days from accepted offer to closing, though some can close faster and others may take longer depending on the loan type, property type, and any conditions that arise during underwriting. Cash transactions can close in as little as 7 to 14 days. Staying responsive to your lender's document requests is the single best thing you can do to keep your closing on schedule.{" "}
            <a href="/knowledge-base/escrow-process-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Learn more about the escrow and closing process in Hawaii →</a>
          </>
        ),
      },
      {
        question: "Are there first-time homebuyer programs available in Hawaii?",
        answer: (
          <>
            Yes. The most significant program currently available is the <strong>Hale Kamaʻāina Mortgage Program</strong>, administered by the Hawaii Housing Finance and Development Corporation (HHFDC). Relaunched in December 2025 after being dormant for over a decade, it provides below-market 30-year fixed rates — as low as 4.65% for FHA/VA/USDA and 4.95% for conventional as of May 2026 — to eligible first-time buyers. The program also offers optional down payment assistance of up to 4% of the purchase price as a second mortgage at 1% simple interest with no monthly payments. To qualify, buyers must be Hawaii residents, meet household income limits (up to $152,000 for a 1–2 person household in Honolulu County), purchase within the program's price limits ($809,458 in non-targeted Oahu areas, $989,337 in targeted census tracts), and complete a HUD-approved homebuyer education course. Veterans and buyers in targeted census tracts may be exempt from the three-year first-time buyer lookback rule. Bond funds are finite — when the $30 million allocation is committed, the program closes until a new bond series is issued.
            {" "}<a href="/knowledge-base/hale-kamaaina-mortgage-program-hawaii" className="text-teal underline underline-offset-2 hover:text-teal-dark">Read the full Hale Kamaʻāina program guide →</a>
          </>
        ),
      },
    ],
  },
];

/* ─── JSON-LD Schemas ─── */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: typeof item.answer === "string" ? item.answer : String(item.question),
      },
    }))
  ),
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "RealityCents — Jay Miller, Mortgage Loan Originator",
  description: "Hawaii mortgage education, tools, and lending services. Specializing in VA loans, conventional loans, FHA, and investment property financing in Honolulu and across the Hawaiian Islands.",
  url: "https://realitycents.com",
  telephone: LENDER.phone,
  email: LENDER.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: LENDER.address.street,
    addressLocality: LENDER.address.city,
    addressRegion: LENDER.address.state,
    postalCode: LENDER.address.zip,
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 21.3069,
    longitude: -157.8583,
  },
  areaServed: {
    "@type": "State",
    name: "Hawaii",
  },
  priceRange: "$$",
  image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/jay-miller-headshot-2026_4148a98a.png",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jay Miller",
  jobTitle: "Mortgage Loan Originator / Sales Manager",
  url: "https://realitycents.com/about",
  worksFor: {
    "@type": "Organization",
    name: "CMG Home Loans",
  },
  knowsAbout: [
    "VA Loans",
    "Conventional Mortgages",
    "FHA Loans",
    "DSCR Loans",
    "Hawaii Real Estate Financing",
    "Condo Warrantability",
    "Military PCS Relocations",
  ],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "NMLS License",
    recognizedBy: {
      "@type": "Organization",
      name: "Nationwide Multistate Licensing System",
    },
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://realitycents.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "FAQ",
      item: "https://realitycents.com/frequently-asked-questions",
    },
  ],
};

/* ─── Accordion Item ─── */
function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-navy/10 rounded-lg overflow-hidden transition-all hover:border-teal/30">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-5 py-4 text-left bg-white hover:bg-sand/20 transition-colors"
        aria-expanded={isOpen}
      >
        <ChevronDown
          className={`w-5 h-5 mt-0.5 text-teal shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <h3 className="font-display text-base md:text-lg text-navy font-semibold leading-snug pr-4">
          {item.question}
        </h3>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pl-14">
          <div className="text-navy/70 font-body leading-relaxed text-[15px]">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main FAQ Page ─── */
export default function FrequentlyAskedQuestions() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allKeys = FAQ_CATEGORIES.flatMap((cat, ci) =>
      cat.items.map((_, qi) => `${ci}-${qi}`)
    );
    setOpenItems(new Set(allKeys));
  };

  const collapseAll = () => setOpenItems(new Set());

  const schemas = useMemo(
    () => [faqSchema, localBusinessSchema, personSchema, breadcrumbSchema],
    []
  );

  return (
    <Layout>
      <SEO
        title="Hawaii Home Loan FAQ"
        description="Answers to the top 20 questions about home loans, VA loans, conforming limits, closing costs, and buying a home in Honolulu and Hawaii. Expert answers from a local mortgage professional with 25 years of experience."
        url="/frequently-asked-questions"
        keywords="Hawaii mortgage FAQ, Honolulu home loan questions, VA loan Hawaii, conforming loan limits Honolulu, first-time homebuyer Hawaii, condo warrantability, leasehold property Hawaii"
        schema={schemas}
      />

      <PageHero
        title="Hawaii Home Loan FAQ"
        subtitle="Expert answers to the most common questions about buying a home, qualifying for a mortgage, and navigating Hawaii's unique real estate market."
        image={IMAGES.heroHome}
        compact
      />

      {/* Breadcrumb */}
      <div className="bg-sand/30 border-b border-navy/5">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-navy/50 font-body">
            <Link href="/" className="hover:text-teal transition-colors">Home</Link>
            <span>/</span>
            <span className="text-navy font-medium">FAQ</span>
          </nav>
        </div>
      </div>

      {/* Last Updated + Controls */}
      <section className="bg-white">
        <div className="container pt-12 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-teal" />
              <div>
                <p className="text-sm text-navy/50 font-body">
                  Last Updated: <span className="text-navy font-medium">June 2026</span>
                </p>
                <p className="text-sm text-navy/50 font-body">
                  20 questions across 4 categories
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-sm font-body font-medium text-teal hover:text-teal-dark transition-colors px-3 py-1.5 rounded-md hover:bg-teal/5"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-sm font-body font-medium text-navy/40 hover:text-navy/60 transition-colors px-3 py-1.5 rounded-md hover:bg-navy/5"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="bg-white pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {FAQ_CATEGORIES.map((category, ci) => (
              <div key={category.id} id={category.id}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-8 bg-teal rounded-full" />
                  <h2 className="font-display text-2xl md:text-3xl text-navy">
                    {category.title}
                  </h2>
                </div>

                {/* Accordion items */}
                <div className="space-y-3">
                  {category.items.map((item, qi) => {
                    const key = `${ci}-${qi}`;
                    return (
                      <AccordionItem
                        key={key}
                        item={item}
                        isOpen={openItems.has(key)}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Jump Links */}
      <section className="bg-sand/20 py-10 border-t border-navy/5">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-body font-semibold text-navy/40 uppercase tracking-wider mb-4">Jump to Category</p>
            <div className="flex flex-wrap gap-3">
              {FAQ_CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="px-4 py-2 bg-white border border-navy/10 rounded-lg text-sm font-body font-medium text-navy hover:border-teal hover:text-teal transition-colors"
                >
                  {cat.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-sand/70 font-body mb-8 leading-relaxed">
              Hawaii's mortgage market has unique nuances that generic answers can't fully address. Get personalized guidance from a local expert with 25 years of Hawaii mortgage experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={PRE_APPROVAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-8 py-4 rounded-md font-body font-bold text-base transition-all hover:shadow-xl hover:shadow-gold/40"
              >
                <FileCheck className="w-5 h-5" />
                Start Your Pre-Approval
              </a>
              <a
                href={`tel:${LENDER.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-md font-body font-semibold text-base transition-all border border-white/20"
              >
                <Phone className="w-5 h-5" />
                {LENDER.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
