/*
 * Pacific Modernism — Article Detail Page
 * Clean reading experience with sidebar navigation
 */
import React from "react";
import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { getArticleBySlug, articles } from "@/lib/articles";
import { articleSchemaData } from "@/lib/articleSchemaData";
import { LENDER, PRE_APPROVAL_URL, IMAGES } from "@/lib/constants";
import { useMemo } from "react";
import { Streamdown } from "streamdown";
// Removed rehype-harden and defaultRehypePlugins to fix runtime crash
// ("Expected usable value, not undefined" from incompatible plugin versions).
// Internal links are handled by the custom <a> component override below.
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  Phone,
  ArrowRight,
  FileCheck,
  BookMarked,
  Calculator,
} from "lucide-react";

// Calculator tool links: articles that have a companion calculator page
const CALCULATOR_LINKS: Record<string, { href: string; title: string; excerpt: string; label: string }> = {
  "temporary-buydown-guide": {
    href: "/buydown-calculator",
    title: "Temporary Buydown Calculator",
    excerpt: "Compare 1/1, 2/1, and 3/2/1 buydown structures side-by-side. Enter your loan amount and rate to see exact seller credit amounts and year-by-year payment tables.",
    label: "Try the Calculator",
  },
};

// Multi-article related section: shown after the calculator callout
const RELATED_ARTICLES: Record<string, Array<{ slug: string; title: string; excerpt: string }>> = {
  "temporary-buydown-guide": [
    {
      slug: "how-lenders-calculate-income",
      title: "How Lenders Calculate Income for Mortgage Qualifying",
      excerpt: "W-2, self-employed, rental, commission — every income type has its own rules. Learn exactly how lenders document and average income to determine your qualifying amount.",
    },
    {
      slug: "va-loans-hawaii-military",
      title: "VA Loans in Hawaii: A Complete Guide for Military Homebuyers",
      excerpt: "Zero down payment, no PMI, and competitive rates — VA loans are one of the most powerful home financing tools available. Everything Hawaii military buyers and veterans need to know.",
    },
  ],
};

// Cross-link pairs: each entry defines a callout shown on one article linking to the other
const CROSS_LINKS: Record<string, { slug: string; title: string; excerpt: string; label: string }> = {
  "hawaii-condo-insurance-crisis": {
    slug: "ho6-insurance-hawaii-condos",
    title: "HO-6 Insurance: What Every Hawaii Condo Buyer Needs to Know",
    excerpt: "Understand what your personal unit-owners policy covers, how bare walls-in vs. all-in master policies affect your coverage needs, and why loss assessment coverage is more important than ever.",
    label: "Companion Article",
  },
  "ho6-insurance-hawaii-condos": {
    slug: "hawaii-condo-insurance-crisis",
    title: "Hawaii's Condo Insurance Crisis: What Buyers and Owners Need to Know in 2026",
    excerpt: "Rising premiums, departing insurers, and HOA special assessments are reshaping Hawaii's condo market. Learn what's driving the crisis, how SB 1044 responds, and what it means for your mortgage.",
    label: "Related Article",
  },
  "va-loans-hawaii-military": {
    slug: "va-assumable-loans-pros-cons",
    title: "VA Assumable Loans: The Pros and Cons",
    excerpt: "In a high-rate environment, a VA loan with a 2–3% rate is one of the most valuable assets a seller can offer. Learn how the assumption process works, the entitlement trap to avoid, and whether it makes sense for you.",
    label: "Companion Article",
  },
  "va-assumable-loans-pros-cons": {
    slug: "va-loans-hawaii-military",
    title: "VA Loans in Hawaii: A Complete Guide for Military Homebuyers",
    excerpt: "Zero down payment, no PMI, and competitive rates — VA loans are one of the most powerful home financing tools available. Here's everything Hawaii military buyers and veterans need to know.",
    label: "Related Article",
  },
};

export default function Article() {
  const params = useParams<{ slug: string }>();
  const article = getArticleBySlug(params.slug || "");

  if (!article) {
    return (
      <Layout>
        <div className="pt-32 pb-20 container text-center">
          <h1 className="font-display text-3xl text-navy mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/knowledge-base" className="inline-flex items-center gap-2 text-teal font-body font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
          </Link>
        </div>
      </Layout>
    );
  }

  // Get related articles (same category, excluding current)
  const related = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  // Build JSON-LD schema per the Article template
  const meta = articleSchemaData[article.slug];
  // Convert YYYY-MM-DD to full ISO 8601 with Hawaii Standard Time offset (UTC-10)
  const toHST = (d: string) => (d.includes("T") ? d : `${d}T00:00:00-10:00`);
  const dateModified = toHST(article.lastUpdated ? "2026-03-15" : article.date);
  const articleSchemas = useMemo(() => {
    const articleSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `https://realitycents.com/knowledge-base/${article.slug}/#article`,
      headline: article.title,
      description: article.excerpt,
      image: {
        "@type": "ImageObject",
        url: article.image,
        width: 1200,
        height: 630,
      },
      datePublished: toHST(article.date),
      dateModified,
      wordCount: meta?.wordCount ?? 1500,
      author: {
        "@type": "Person",
        "@id": "https://realitycents.com/#jaymiller",
        name: "Jay Miller",
        jobTitle: "Sales Manager & Mortgage Loan Consultant",
        description:
          "VA loan specialist with 25 years of mortgage experience in Honolulu. US Army veteran. NMLS# 657301.",
        url: "https://realitycents.com/about",
      },
      publisher: {
        "@type": "Organization",
        "@id": "https://realitycents.com/#business",
        name: "RealityCents",
        url: "https://realitycents.com",
        logo: {
          "@type": "ImageObject",
          url: "https://realitycents.com/favicon-180x180.png",
          width: 300,
          height: 60,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://realitycents.com/knowledge-base/${article.slug}/`,
      },
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://realitycents.com/#website",
        name: "RealityCents",
      },
      about: meta?.about.map((t) => {
        const thing: Record<string, string> = { "@type": "Thing", name: t.name };
        if (t.sameAs) thing.sameAs = t.sameAs;
        return thing;
      }) ?? [{ "@type": "Thing", name: article.category }],
      keywords: meta?.keywords ?? `${article.category}, Hawaii mortgage, ${article.title.toLowerCase()}`,
      inLanguage: "en-US",
      copyrightHolder: { "@id": "https://realitycents.com/#jaymiller" },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".article-intro", ".key-takeaway"],
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
          name: "Knowledge Base",
          item: "https://realitycents.com/knowledge-base",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: `https://realitycents.com/knowledge-base/${article.slug}`,
        },
      ],
    };

    return [articleSchema, breadcrumbSchema];
  }, [article.slug, article.title, article.excerpt, article.image, article.date, article.lastUpdated, article.category, dateModified, meta]);

  return (
    <Layout>
      <SEO
        title={article.title}
        description={`${article.excerpt} Expert mortgage guidance from Jay Miller, NMLS #657301, CMG Home Loans Hawaii.`}
        url={`/knowledge-base/${article.slug}`}
        image={article.image}
        imageAlt={article.title}
        type="article"
        keywords={`${article.category}, Hawaii mortgage, ${article.title.toLowerCase()}, Jay Miller mortgage, CMG Home Loans Hawaii`}
        schema={articleSchemas}
      />
      {/* Article Header */}
      <section className="pt-28 pb-10 lg:pt-36 lg:pb-14 bg-navy">
        <div className="container">
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-1.5 text-sm text-sand/60 hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Knowledge Base
          </Link>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-body font-semibold text-teal bg-teal/20 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-sand/60">
                <Clock className="w-3 h-3" />
                {article.readTime} read
              </span>
              <span className="flex items-center gap-1 text-xs text-sand/60">
                <Calendar className="w-3 h-3" />
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {article.lastUpdated && (
                <span className="flex items-center gap-1 text-xs font-body font-semibold text-gold/80 bg-gold/10 px-2 py-0.5 rounded">
                  Updated: {article.lastUpdated}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-14">
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="aspect-[2/1] rounded-xl overflow-hidden mb-8">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy prose-headings:font-normal prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-navy prose-a:text-teal prose-a:no-underline hover:prose-a:underline">
                <Streamdown
                  components={{
                    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
                      // Internal path-relative links: use wouter Link for SPA navigation
                      if (href && href.startsWith("/")) {
                        return <Link href={href} className="text-teal hover:underline">{children}</Link>;
                      }
                      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                    },
                  }}
                >{article.content}</Streamdown>
              </article>

              {/* Calculator tool callout */}
              {CALCULATOR_LINKS[article.slug] && (() => {
                const cl = CALCULATOR_LINKS[article.slug];
                return (
                  <Link
                    href={cl.href}
                    className="group mt-10 mb-2 flex items-start gap-4 p-5 rounded-xl border-l-4 border-teal bg-teal/5 hover:bg-teal/10 transition-colors no-underline"
                  >
                    <div className="shrink-0 mt-0.5 w-10 h-10 rounded-lg bg-teal/15 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-teal" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-body font-semibold uppercase tracking-[0.12em] text-teal mb-1">{cl.label}</p>
                      <h4 className="font-display text-navy text-base leading-snug mb-1.5 group-hover:text-teal transition-colors">{cl.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{cl.excerpt}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-body font-semibold text-teal group-hover:gap-2 transition-all">
                        Open Calculator <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })()}

              {/* Cross-link callout for paired articles */}
              {CROSS_LINKS[article.slug] && (() => {
                const cx = CROSS_LINKS[article.slug];
                return (
                  <Link
                    href={`/knowledge-base/${cx.slug}`}
                    className="group mt-10 mb-2 flex items-start gap-4 p-5 rounded-xl border-l-4 border-teal bg-teal/5 hover:bg-teal/10 transition-colors no-underline"
                  >
                    <div className="shrink-0 mt-0.5 w-10 h-10 rounded-lg bg-teal/15 flex items-center justify-center">
                      <BookMarked className="w-5 h-5 text-teal" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-body font-semibold uppercase tracking-[0.12em] text-teal mb-1">{cx.label}</p>
                      <h4 className="font-display text-navy text-base leading-snug mb-1.5 group-hover:text-teal transition-colors">{cx.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{cx.excerpt}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-body font-semibold text-teal group-hover:gap-2 transition-all">
                        Read Article <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })()}

              {/* Related Articles section */}
              {RELATED_ARTICLES[article.slug] && (
                <div className="mt-10 mb-2">
                  <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Related Articles</p>
                  <div className="flex flex-col gap-3">
                    {RELATED_ARTICLES[article.slug].map((ra) => (
                      <Link
                        key={ra.slug}
                        href={`/knowledge-base/${ra.slug}`}
                        className="group flex items-start gap-4 p-5 rounded-xl border-l-4 border-teal bg-teal/5 hover:bg-teal/10 transition-colors no-underline"
                      >
                        <div className="shrink-0 mt-0.5 w-10 h-10 rounded-lg bg-teal/15 flex items-center justify-center">
                          <BookMarked className="w-5 h-5 text-teal" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display text-navy text-base leading-snug mb-1.5 group-hover:text-teal transition-colors">{ra.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ra.excerpt}</p>
                          <span className="inline-flex items-center gap-1 mt-2 text-xs font-body font-semibold text-teal group-hover:gap-2 transition-all">
                            Read Article <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author box */}
              <div className="mt-12 p-6 bg-sand rounded-xl flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={IMAGES.headshot}
                  alt={LENDER.name}
                  className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-teal/30"
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Written by</p>
                  <h4 className="font-display text-lg text-navy mb-1">{LENDER.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {LENDER.title} at {LENDER.company} | NMLS #{LENDER.nmls}
                  </p>
                  <a
                    href={`tel:${LENDER.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm font-body font-semibold text-teal"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {LENDER.phone}
                  </a>
                </div>
              </div>

              {/* Pre-Approval CTA Banner */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-navy to-navy/90 border border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-1">Ready to Move Forward?</p>
                  <h3 className="font-display text-xl text-white">Get Pre-Approved Today</h3>
                  <p className="text-sm text-sand/70 mt-1">Takes just minutes — no commitment required.</p>
                </div>
                <a
                  href={PRE_APPROVAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-6 py-3 rounded-md font-body font-semibold text-sm transition-all hover:shadow-lg hover:shadow-gold/30 whitespace-nowrap"
                >
                  <FileCheck className="w-4 h-4" />
                  Get Pre-Approved
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* CTA */}
                <div className="bg-navy rounded-xl p-5">
                  <h4 className="font-display text-white text-base mb-2">Ready to Buy?</h4>
                  <p className="text-sm text-sand/60 mb-4">
                    Start your pre-approval with Jay Miller today.
                  </p>
                  <a
                    href={PRE_APPROVAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy px-4 py-2.5 rounded-md text-sm font-body font-semibold transition-all"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Get Pre-Approved
                  </a>
                  <Link
                    href="/contact"
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-teal/10 hover:bg-teal/20 text-teal px-4 py-2.5 rounded-md text-sm font-body font-semibold transition-all"
                  >
                    Contact Jay
                  </Link>
                </div>

                {/* Related */}
                {related.length > 0 && (
                  <div>
                    <h4 className="font-display text-navy text-base mb-3">Related Articles</h4>
                    <div className="space-y-3">
                      {related.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/knowledge-base/${r.slug}`}
                          className="block p-3 rounded-lg bg-sand hover:bg-sand-dark transition-colors group"
                        >
                          <h5 className="text-sm font-body font-medium text-navy group-hover:text-teal transition-colors leading-snug mb-1">
                            {r.title}
                          </h5>
                          <span className="text-xs text-muted-foreground">{r.readTime} read</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculator CTA */}
                <Link
                  href="/calculator"
                  className="block p-5 rounded-xl border border-teal/20 bg-teal/5 hover:bg-teal/10 transition-colors group"
                >
                  <h4 className="font-display text-navy text-base mb-1">Mortgage Calculator</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Calculate your monthly payment and view amortization schedules.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-body font-semibold text-teal group-hover:gap-2 transition-all">
                    Try Calculator <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
