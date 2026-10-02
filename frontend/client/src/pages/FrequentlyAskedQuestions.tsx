/*
 * Pacific Modernism — Frequently Asked Questions Page
 * AI-optimized FAQ with 20 Q&As grouped by 4 categories
 * Accordion UI with FAQPage + LocalBusiness + Person + BreadcrumbList JSON-LD schema
 * Updated: 2026-06-09 - All corrections applied, cross-links to KB articles
 */
import { useState, useMemo, type ReactNode } from "react";
import { Link } from "wouter";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import faqData from "@/data/faq.json";
import { LENDER, IMAGES } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";

/* ─── FAQ Data (single source: data/faq.json) ─── */
interface FAQLink {
  href: string;
  label: string;
}

interface FAQItem {
  question: string;
  answer: string;
  links: FAQLink[];
}

interface FAQCategory {
  title: string;
  id: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES = faqData.categories as FAQCategory[];

const LINK_CLASS = "text-teal underline underline-offset-2 hover:text-teal-dark";

/** Inline anchors stay in the sentence; trailing "Learn more" links follow the answer. */
function AnswerBody({ item }: { item: FAQItem }) {
  const links = item.links ?? [];
  const inline = links.filter((link) => item.answer.includes(link.label));
  const trailing = links.filter((link) => !item.answer.includes(link.label));
  const ordered = [...inline].sort(
    (a, b) => item.answer.indexOf(a.label) - item.answer.indexOf(b.label)
  );
  const pieces: ReactNode[] = [];
  let cursor = 0;
  ordered.forEach((link, i) => {
    const idx = item.answer.indexOf(link.label, cursor);
    if (idx === -1) return;
    if (idx > cursor) pieces.push(item.answer.slice(cursor, idx));
    pieces.push(
      <a key={`${link.href}-${i}`} href={link.href} className={LINK_CLASS}>
        {link.label}
      </a>
    );
    cursor = idx + link.label.length;
  });
  if (cursor < item.answer.length) pieces.push(item.answer.slice(cursor));
  if (pieces.length === 0) pieces.push(item.answer);

  return (
    <>
      {pieces}
      {trailing.map((link) => (
        <span key={`${link.href}-${link.label}`}>
          {" "}
          <a href={link.href} className={LINK_CLASS}>
            {link.label}
          </a>
        </span>
      ))}
    </>
  );
}

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
        text: item.answer,
      },
    }))
  ),
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "RealityCents: Jay Miller, Sales Manager and Certified Mortgage Advisor",
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
  image: "/images/jay-miller-headshot.webp",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jay Miller",
  jobTitle: "Sales Manager and Certified Mortgage Advisor",
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
            <AnswerBody item={item} />
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
        description="Answers to 20 common questions about home loans, VA loans, conforming limits, closing costs, and buying a home in Honolulu and Hawaii. Answers from Jay Miller, NMLS #657301, a Honolulu loan officer with 25+ years of experience."
        url="/frequently-asked-questions"
        keywords="Hawaii mortgage FAQ, Honolulu home loan questions, VA loan Hawaii, conforming loan limits Honolulu, first-time homebuyer Hawaii, condo warrantability, leasehold property Hawaii"
        schema={schemas}
      />

      <PageHero
        title="Hawaii Home Loan FAQ"
        subtitle="Answers to common questions about buying a home, qualifying for a mortgage, and navigating Hawaii's unique real estate market."
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
      <ContactActions
        variant="full"
        headline="Still Have Questions?"
        subtext="Hawaii's mortgage market has unique nuances that generic answers can't fully address. Get personalized guidance from a Honolulu loan officer with 25+ years of Hawaii mortgage experience."
        preApprovalLabel="Start Your Pre-Approval"
        hideEmail
      />
    </Layout>
  );
}
