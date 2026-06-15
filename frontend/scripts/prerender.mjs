#!/usr/bin/env node
/**
 * Enhanced Post-build Static Pre-rendering Script
 * ================================================
 * Copies index.html to all route directories AND injects per-page SEO metadata
 * PLUS semantic HTML bodies with full article content so Googlebot sees real content.
 *
 * Injected per-page:
 *  - <title>, <meta description>, <meta keywords>
 *  - <link rel="canonical">, OG tags, Twitter Card tags
 *  - <script type="application/ld+json"> (per-page structured data)
 *  - <div id="prerendered-content"> with semantic HTML body (H1, H2s, article content)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import { STATIC_PAGE_BODIES } from "./static-page-bodies.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distPublic = path.resolve(projectRoot, "dist");
const indexHtmlPath = path.resolve(distPublic, "index.html");

const BASE_URL = "https://realitycents.com";
const SITE_NAME = "RealityCents";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_IMAGE_ALT = "RealityCents - Hawaii Mortgage Education & Lending";

// ─── Load article data extracted at build time ──────────────────────────────
const articlesFullPath = path.resolve(__dirname, "article-data-full.json");
const articlesPath = path.resolve(__dirname, "article-data.json");
const schemaDataPath = path.resolve(__dirname, "article-schema-data.json");

let articlesFull = [];
let articles = [];
let articleSchemaData = {};

try {
  articlesFull = JSON.parse(fs.readFileSync(articlesFullPath, "utf-8"));
} catch (e) {
  console.warn(`Warning: Could not load ${articlesFullPath}:`, e.message);
}

try {
  articles = JSON.parse(fs.readFileSync(articlesPath, "utf-8"));
} catch (e) {
  console.warn(`Warning: Could not load ${articlesPath}:`, e.message);
}

try {
  articleSchemaData = JSON.parse(fs.readFileSync(schemaDataPath, "utf-8"));
} catch (e) {
  console.warn(`Warning: Could not load ${schemaDataPath}:`, e.message);
}

// ─── Static page SEO metadata ──────────────────────────────────────────────
const STATIC_PAGES = {
  "/": {
    title: "Hawaii Mortgage Education & Lending",
    description: "Hawaii's trusted mortgage resource. Jay Miller, NMLS #657301, CMG Home Loans — expert mortgage guidance, free homebuying guide, mortgage calculator, and 25+ years of Hawaii real estate expertise. Serving Oahu, Maui, Kauai, and the Big Island.",
    keywords: "Hawaii mortgage, Hawaii home loans, mortgage lender Honolulu, Jay Miller mortgage, CMG Home Loans Hawaii, FHA loans Hawaii, VA loans Hawaii, first time homebuyer Hawaii, Hawaii mortgage calculator, Oahu home loans",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What is the conforming loan limit in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "Hawaii is a high-cost state. For 2026, the conforming loan limit for a single-family home in Honolulu County is $1,249,125 — significantly higher than the national baseline of $806,500. Loans above this limit are considered jumbo loans and require different qualification standards." } },
          { "@type": "Question", name: "What is the minimum down payment for a home in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "Down payment requirements vary by loan type. VA loans (for eligible veterans and military) require 0% down. FHA loans require 3.5% down with a 580+ credit score. Conventional loans can go as low as 3% down for first-time buyers. Jumbo loans typically require 10–20% down. There are also 0% down portfolio loan options available up to $998,000 for buyers who meet certain requirements — contact Jay for details." } },
          { "@type": "Question", name: "What is a leasehold property in Hawaii and can I get a mortgage on one?", acceptedAnswer: { "@type": "Answer", text: "A leasehold property means you own the structure but lease the land from a landowner (often the Bishop Estate or other large landowners). Mortgages on leasehold properties are available but have additional requirements. For conventional loans, lenders require at least 5 years remaining on the lease term after the loan term expires — meaning a 30-year loan requires at least 35 years remaining on the lease. Some lenders restrict leasehold financing entirely. Fee simple (owning both land and structure) is generally preferred by lenders." } },
          { "@type": "Question", name: "How long does mortgage pre-approval take in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "A standard pre-approval typically takes 1 business day once all required documents are received. Required documents include pay stubs, W-2s, tax returns, bank statements, and a government-issued ID. A fully underwritten pre-approval (TBD approval) takes longer but provides stronger negotiating power in Hawaii's competitive market." } },
          { "@type": "Question", name: "What are typical closing costs in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "Closing costs in Hawaii typically range from 1.5–2% of the purchase price. Buyers pay lender fees, title insurance, escrow fees, prepaid interest, and property tax impounds. On an $800,000 purchase, expect approximately $12,000–$16,000 in total closing costs." } },
          { "@type": "Question", name: "Can I use a VA loan to buy a condo in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "Yes, VA loans can be used to purchase condos in Hawaii, but the condo project must be VA-approved. The VA maintains a list of approved condo projects. Many Honolulu condo buildings are VA-approved, but it's important to verify approval status before making an offer. Your lender can check VA approval status and help navigate the process." } },
        ],
      },
    ],
  },
  "/about": {
    title: "About Jay Miller — Hawaii Mortgage Lender",
    description: "Meet Jay Miller, NMLS #657301 — a Hawaii mortgage loan originator with 25+ years of experience at CMG Home Loans. U.S. Army veteran, triathlete, and passionate advocate for informed homebuyers across the Hawaiian Islands.",
    keywords: "Jay Miller mortgage, Hawaii mortgage lender, CMG Home Loans Honolulu, mortgage loan originator Hawaii, NMLS 657301, Hawaii home loan expert",
  },
  "/contact": {
    title: "Contact Jay Miller — Hawaii Mortgage Lender",
    description: "Contact Jay Miller, NMLS #657301, at CMG Home Loans in Honolulu, HI. Get personalized mortgage guidance, request a pre-approval, or ask about Hawaii home loan options. Call (808) 429-0811 or email jaym@cmghomeloans.com.",
    keywords: "contact Hawaii mortgage lender, Jay Miller contact, CMG Home Loans Honolulu, Hawaii mortgage pre-approval, mortgage consultation Hawaii",
  },
  "/guide": {
    title: "Free Hawaii Homebuying Guide — Download Now",
    description: "Download our free comprehensive Hawaii Homebuying Guide. Learn the step-by-step process of buying a home in Hawaii — from pre-approval to closing day. Covers leasehold vs. fee simple, down payment assistance, VA loans, and more.",
    keywords: "Hawaii homebuying guide, how to buy a home in Hawaii, Hawaii first time homebuyer, Hawaii mortgage guide, free Hawaii real estate guide, Hawaii home purchase steps",
  },

  "/calculator": {
    title: "Hawaii Mortgage Calculator — Estimate Your Monthly Payment",
    description: "Use our free Hawaii mortgage calculator to estimate your monthly payment including principal, interest, property taxes, insurance, HOA fees, and PMI. Includes full amortization schedule and payment breakdown chart.",
    keywords: "Hawaii mortgage calculator, mortgage payment calculator Hawaii, Hawaii home loan calculator, amortization schedule Hawaii, monthly mortgage payment Hawaii",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Hawaii Mortgage Calculator",
        url: `${BASE_URL}/calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Free Hawaii mortgage calculator with amortization schedule, payment breakdown, and PMI estimation.",
      },
    ],
  },
  "/advanced-calculator": {
    title: "Advanced Mortgage Calculator — Conventional, VA, FHA & Jumbo | Hawaii",
    description: "Compare Conventional, VA, FHA, and Jumbo loan payments with our advanced Hawaii mortgage calculator. Includes PMI lookup tables, VA funding fee calculations, FHA MIP rates, and full amortization schedules.",
    keywords: "advanced mortgage calculator Hawaii, VA loan calculator, FHA loan calculator Hawaii, jumbo loan calculator, PMI calculator, VA funding fee calculator, Hawaii mortgage payment",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Advanced Mortgage Calculator — Conventional, VA, FHA & Jumbo",
        url: `${BASE_URL}/advanced-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Compare Conventional, VA, FHA, and Jumbo loan payments with real PMI rates, VA funding fees, and FHA mortgage insurance.",
      },
    ],
  },
  "/affordability-calculator": {
    title: "What Can I Afford? — Hawaii Home Affordability Calculator",
    description: "Find out how much home you can afford in Hawaii. Enter your income, debts, and down payment to calculate your maximum purchase price based on DTI ratios.",
    keywords: "home affordability calculator Hawaii, how much house can I afford, Hawaii mortgage affordability, DTI calculator, home buying budget Hawaii",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Hawaii Home Affordability Calculator",
        url: `${BASE_URL}/affordability-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  "/rent-vs-buy": {
    title: "Rent vs. Buy Calculator — Should You Buy a Home in Hawaii?",
    description: "Compare the true cost of renting vs. buying a home in Hawaii. See break-even year, equity growth, investment opportunity cost, and cumulative cost analysis over time.",
    keywords: "rent vs buy calculator Hawaii, should I buy a home Hawaii, rent or buy Honolulu, home buying cost comparison, break even buying house",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Rent vs. Buy Calculator — Hawaii",
        url: `${BASE_URL}/rent-vs-buy`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  "/buydown-calculator": {
    title: "Temporary Buydown Calculator — 1/1, 2/1 & 3/2/1 Buydowns | Hawaii Mortgage",
    description: "Calculate seller credits for 1/1, 2/1, and 3/2/1 temporary mortgage buydowns. See exactly how much a seller needs to contribute to reduce your rate in Years 1–3. Free tool for Hawaii homebuyers.",
    keywords: "temporary buydown calculator, 2/1 buydown, 3/2/1 buydown, seller credit calculator, mortgage buydown Hawaii, interest rate buydown",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Temporary Buydown Calculator",
        url: `${BASE_URL}/buydown-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  "/knowledge-base": {
    title: "Hawaii Mortgage Knowledge Base — Articles & Guides",
    description: "Expert articles on Hawaii mortgages, home loans, and the homebuying process. Topics include FHA loans, VA loans, jumbo loans, first-time homebuyer programs, down payment assistance, leasehold vs. fee simple, and more.",
    keywords: "Hawaii mortgage articles, Hawaii home loan guide, FHA loans Hawaii, VA loans Hawaii, first time homebuyer Hawaii, leasehold fee simple Hawaii, down payment assistance Hawaii, Hawaii mortgage tips",
  },

  "/frequently-asked-questions": {
    title: "Hawaii Home Loan FAQ",
    description: "Answers to the top 20 questions about home loans, VA loans, conforming limits, closing costs, and buying a home in Honolulu and Hawaii. Expert answers from a local mortgage professional with 25 years of experience.",
    keywords: "Hawaii mortgage FAQ, Honolulu home loan questions, VA loan Hawaii, conforming loan limits Honolulu, first-time homebuyer Hawaii, condo warrantability, leasehold property Hawaii",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "FAQ", item: `${BASE_URL}/frequently-asked-questions` },
        ],
      },
    ],
  },
  "/military-calculator": {
    title: "Military Buying Power Calculator — Hawaii VA Loan Home Purchase Estimator",
    description: "Estimate your total qualifying income and home purchase power as a Hawaii-based military service member. Uses 2026 base pay, BAH (Honolulu), BAS, and COLA rates with VA loan qualification.",
    keywords: "military buying power calculator Hawaii, VA loan calculator, military home buying Hawaii, BAH Honolulu, military income calculator, VA loan purchase price estimator",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Military Buying Power Calculator — Hawaii",
        url: `${BASE_URL}/military-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Estimate your total qualifying income and VA loan home purchase power using 2026 military pay tables for Honolulu County.",
      },
    ],
  },
  "/va-approved-condos-oahu": {
    title: "VA-Approved Condos on Oahu — 1,745 Projects",
    description: "Searchable directory of all 1,745 VA-approved condo projects on Oahu, Hawaii. Filter by neighborhood, approval status, and zip code. Updated June 2026. Data from VA LGY Hub.",
    keywords: "VA approved condos Oahu, VA approved condos Hawaii, VA condo list Honolulu, VA eligible condos Waikiki, VA loan condo Hawaii, VA approved condo projects Oahu 2026, VA condo approval list",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "VA-Approved Condo Projects on Oahu, Hawaii",
        description: "Complete directory of 1,745 VA-approved condominium projects in Honolulu County (Oahu), Hawaii, sourced from the VA LGY Hub. Includes project name, address, approval status, review date, and VA ID.",
        url: `${BASE_URL}/va-approved-condos-oahu`,
        creator: { "@type": "Organization", name: "U.S. Department of Veterans Affairs" },
        dateModified: "2026-06-15",
        license: "https://www.usa.gov/government-works",
        spatialCoverage: { "@type": "Place", name: "Honolulu County, Hawaii, USA" },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What does VA condo approval mean?", acceptedAnswer: { "@type": "Answer", text: "VA condo approval means the Department of Veterans Affairs has reviewed a condominium project's legal documents, financials, and HOA governance and determined it meets VA lending standards. Without this approval, VA-eligible buyers cannot use their VA loan benefit to purchase a unit in that project." } },
          { "@type": "Question", name: "What is the difference between Accepted Without Conditions and Accepted With Conditions?", acceptedAnswer: { "@type": "Answer", text: "Accepted Without Conditions means the project fully meets all VA requirements with no additional stipulations. Accepted With Conditions means the project is approved but the VA identified items to be noted. Both statuses allow VA financing. In practice, there is almost never anything that needs to be resolved — the lender may simply require the Veteran to acknowledge and accept the noted conditions, which are informational in nature." } },
          { "@type": "Question", name: "What if the condo I want is not on the VA-approved list?", acceptedAnswer: { "@type": "Answer", text: "Your lender can submit the full project approval package to the Regional VA Loan Center as part of your purchase transaction — this is called Lender Submitted Condo Approval and typically takes 2–3 weeks, well within a standard 45-day contract. Alternatively, the HOA board or seller can submit a full project approval application directly to the VA, which approves the entire building for all future VA buyers." } },
          { "@type": "Question", name: "Can I use a VA loan for a Waikiki condotel?", acceptedAnswer: { "@type": "Answer", text: "Generally no. The VA does not approve projects that operate primarily as hotels or where units are part of a mandatory rental pool. Some Waikiki buildings that are primarily residential (not hotel-operated) are VA-approved — check the directory to verify." } },
          { "@type": "Question", name: "How many VA-approved condos are on Oahu?", acceptedAnswer: { "@type": "Answer", text: "As of June 2026, there are 1,745 VA-approved condo projects on Oahu — 1,498 Accepted Without Conditions and 247 Accepted With Conditions — spread across 27 neighborhoods from Waikiki to Ewa Beach." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "VA-Approved Condos Oahu", item: `${BASE_URL}/va-approved-condos-oahu` },
        ],
      },
    ],
  },

  // ─── Military Installation Hub Pages ─────────────────────────────────────
  "/va-loan-schofield-barracks": {
    title: "VA Loan Guide for Schofield Barracks — Buy a Home on Oahu with $0 Down",
    description: "PCS'ing to Schofield Barracks? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best neighborhoods (Mililani, Wahiawa, Kapolei), VA condo rules, and $0-down purchase options for 25th Infantry Division families on Oahu.",
    keywords: "VA loan Schofield Barracks, buying a home near Schofield Barracks, VA loan Wahiawa, VA loan Mililani, 25th Infantry Division home loan",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://realitycents.com/#business",
        name: "Jay Miller — VA Loan Specialist, CMG Home Loans",
        description: "Army veteran and Certified Mortgage Advisor specializing in VA loans for military families PCS'ing to Schofield Barracks and Oahu. 25+ years of Hawaii mortgage lending experience.",
        url: "https://realitycents.com/va-loan-schofield-barracks",
        telephone: "(808) 429-0811",
        email: "jaym@cmghomeloans.com",
        address: { "@type": "PostalAddress", streetAddress: "500 Ala Moana Blvd, Suite 6-200", addressLocality: "Honolulu", addressRegion: "HI", postalCode: "96813", addressCountry: "US" },
        geo: { "@type": "GeoCoordinates", latitude: 21.3069, longitude: -157.8583 },
        areaServed: { "@type": "Place", name: "Oahu, Hawaii" },
        priceRange: "$$",
        image: "https://realitycents.com/og-image.jpg",
        additionalType: "https://schema.org/MortgageLender",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I used my VA loan on the mainland. Can I use it again at Schofield?", acceptedAnswer: { "@type": "Answer", text: "Yes — with remaining entitlement. Honolulu County's 2026 limit is $1,209,750. Subtract your current VA loan balance from that figure to find your available 100% financing ceiling. Above that, a 25% partial down payment applies on the difference." } },
          { "@type": "Question", name: "Can I qualify on BAH alone?", acceptedAnswer: { "@type": "Answer", text: "BAH counts as qualifying income when documented on your LES. Most lenders can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Whether it's sufficient alone depends on your full debt picture." } },
          { "@type": "Question", name: "How long does VA loan approval take? I have a short PCS window.", acceptedAnswer: { "@type": "Answer", text: "A VA loan doesn't take longer than conventional — the appraisal process is comparable. The variable is condo approval status and seller education. Jay closes VA loans on Oahu regularly and knows how to set timelines that work with PCS constraints." } },
          { "@type": "Question", name: "Should I buy or rent if I'm only here 2–3 years?", acceptedAnswer: { "@type": "Answer", text: "It depends on when in the market cycle you're buying and where you think Hawaii appreciation goes. But historically, Oahu values have supported short holds better than most markets." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "VA Loan Schofield Barracks", item: `${BASE_URL}/va-loan-schofield-barracks` },
        ],
      },
    ],
  },
  "/va-loan-pearl-harbor-hickam": {
    title: "VA Loan Guide for Pearl Harbor-Hickam — Buy a Home on Oahu with $0 Down",
    description: "PCS'ing to Joint Base Pearl Harbor-Hickam? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best neighborhoods (Ewa Beach, Kapolei, Pearl City, Aiea, Salt Lake), VA condo rules, and $0-down purchase options for Navy and Air Force families on Oahu.",
    keywords: "VA loan Pearl Harbor, VA loan Hickam, buying a home near Pearl Harbor, Navy home loan Hawaii, Air Force home loan Oahu",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://realitycents.com/#business",
        name: "Jay Miller — VA Loan Specialist, CMG Home Loans",
        description: "Army veteran and Certified Mortgage Advisor specializing in VA loans for Navy and Air Force families PCS'ing to Joint Base Pearl Harbor-Hickam. 25+ years of Hawaii mortgage lending experience.",
        url: `${BASE_URL}/va-loan-pearl-harbor-hickam`,
        telephone: "(808) 429-0811",
        email: "jaym@cmghomeloans.com",
        address: { "@type": "PostalAddress", streetAddress: "500 Ala Moana Blvd, Suite 6-200", addressLocality: "Honolulu", addressRegion: "HI", postalCode: "96813", addressCountry: "US" },
        geo: { "@type": "GeoCoordinates", latitude: 21.3069, longitude: -157.8583 },
        areaServed: { "@type": "Place", name: "Oahu, Hawaii" },
        priceRange: "$$",
        image: "https://realitycents.com/og-image.jpg",
        additionalType: "https://schema.org/MortgageLender",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I'm Navy and used my VA loan in Norfolk. Can I use it again in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "Yes — with remaining entitlement. Honolulu County's 2026 limit is $1,209,750. Subtract your current VA loan balance from that figure to find your available 100% financing ceiling. Above that, a 25% partial down payment applies on the difference only." } },
          { "@type": "Question", name: "Can I qualify on BAH alone?", acceptedAnswer: { "@type": "Answer", text: "BAH counts as qualifying income when documented on your LES. Most lenders can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Whether it's sufficient alone depends on your full debt picture." } },
          { "@type": "Question", name: "My spouse is also active duty. Can we combine VA loans?", acceptedAnswer: { "@type": "Answer", text: "Yes — two eligible borrowers can use joint VA financing on the same property. This is common at JBPHH with dual-military couples. The math gets favorable fast." } },
          { "@type": "Question", name: "Should I buy or rent if I'm only here 2–3 years?", acceptedAnswer: { "@type": "Answer", text: "It depends on when in the market cycle you're buying and where you think Hawaii appreciation goes. But historically, Oahu values have supported short holds better than most markets. Oahu's rental market near JBPHH is extremely strong." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "VA Loan Pearl Harbor-Hickam", item: `${BASE_URL}/va-loan-pearl-harbor-hickam` },
        ],
      },
    ],
  },
  "/va-loan-kaneohe-mcbh": {
    title: "VA Loan Guide for MCBH Kaneohe Bay — Buy a Home on Oahu with $0 Down",
    description: "PCS'ing to Marine Corps Base Hawaii? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best Windward side neighborhoods (Kailua, Kaneohe, Enchanted Lake, Hawaii Kai, Mililani), VA condo rules, and $0-down purchase options for Marines at MCBH Kaneohe Bay.",
    keywords: "VA loan Kaneohe Bay, VA loan MCBH, buying a home near Kaneohe Bay, Marine Corps Hawaii home loan, VA loan Kailua",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://realitycents.com/#business",
        name: "Jay Miller — VA Loan Specialist, CMG Home Loans",
        description: "Army veteran and Certified Mortgage Advisor specializing in VA loans for Marines and Navy personnel PCS'ing to MCBH Kaneohe Bay. 25+ years of Hawaii mortgage lending experience.",
        url: `${BASE_URL}/va-loan-kaneohe-mcbh`,
        telephone: "(808) 429-0811",
        email: "jaym@cmghomeloans.com",
        address: { "@type": "PostalAddress", streetAddress: "500 Ala Moana Blvd, Suite 6-200", addressLocality: "Honolulu", addressRegion: "HI", postalCode: "96813", addressCountry: "US" },
        geo: { "@type": "GeoCoordinates", latitude: 21.3069, longitude: -157.8583 },
        areaServed: { "@type": "Place", name: "Oahu, Hawaii" },
        priceRange: "$$",
        image: "https://realitycents.com/og-image.jpg",
        additionalType: "https://schema.org/MortgageLender",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I used my VA loan at Camp Pendleton. Can I use it again at MCBH?", acceptedAnswer: { "@type": "Answer", text: "Yes — with remaining entitlement. Honolulu County's 2026 limit is $1,209,750. Subtract your current VA loan balance from that figure to find your available 100% financing ceiling. Above that, a 25% partial down payment applies on the difference only." } },
          { "@type": "Question", name: "Can I qualify on BAH alone?", acceptedAnswer: { "@type": "Answer", text: "BAH counts as qualifying income when documented on your LES. Most lenders can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Whether it's sufficient alone depends on your full debt picture." } },
          { "@type": "Question", name: "Kailua homes are expensive. Can I still use VA with $0 down above $1M?", acceptedAnswer: { "@type": "Answer", text: "Yes — the 2026 Honolulu County VA loan limit is $1,209,750. You can buy up to that price with $0 down and full entitlement. Above that, you'd need a 25% down payment on the difference only." } },
          { "@type": "Question", name: "Should I buy or rent if I'm only here 2–3 years?", acceptedAnswer: { "@type": "Answer", text: "Windward side homes appreciate well and rent easily to the next wave of MCBH Marines. Kailua especially has strong rental demand from both military and civilian tenants. If you buy at $900K today and rent it for $3,500–$4,000/month when you PCS, the numbers often work." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "VA Loan MCBH Kaneohe Bay", item: `${BASE_URL}/va-loan-kaneohe-mcbh` },
        ],
      },
    ],
  },
  "/va-loan-fort-shafter": {
    title: "VA Loan Guide for Fort Shafter — Buy a Home on Oahu with $0 Down",
    description: "PCS'ing to Fort Shafter? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best neighborhoods (Salt Lake, Moanalua, Kalihi, Aiea, Manoa/Makiki), VA condo rules, and $0-down purchase options for USARPAC Army personnel on Oahu.",
    keywords: "VA loan Fort Shafter, buying a home near Fort Shafter, VA loan Honolulu, USARPAC home loan, military home loan Honolulu",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://realitycents.com/#business",
        name: "Jay Miller — VA Loan Specialist, CMG Home Loans",
        description: "Army veteran and Certified Mortgage Advisor specializing in VA loans for USARPAC and Fort Shafter personnel PCS'ing to Oahu. 25+ years of Hawaii mortgage lending experience.",
        url: `${BASE_URL}/va-loan-fort-shafter`,
        telephone: "(808) 429-0811",
        email: "jaym@cmghomeloans.com",
        address: { "@type": "PostalAddress", streetAddress: "500 Ala Moana Blvd, Suite 6-200", addressLocality: "Honolulu", addressRegion: "HI", postalCode: "96813", addressCountry: "US" },
        geo: { "@type": "GeoCoordinates", latitude: 21.3069, longitude: -157.8583 },
        areaServed: { "@type": "Place", name: "Oahu, Hawaii" },
        priceRange: "$$",
        image: "https://realitycents.com/og-image.jpg",
        additionalType: "https://schema.org/MortgageLender",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I used my VA loan at my last duty station. Can I use it again at Fort Shafter?", acceptedAnswer: { "@type": "Answer", text: "Yes — with remaining entitlement. Honolulu County's 2026 limit is $1,209,750. Subtract your current VA loan balance from that figure to find your available 100% financing ceiling. Above that, a 25% partial down payment applies on the difference only." } },
          { "@type": "Question", name: "Can I qualify on BAH alone?", acceptedAnswer: { "@type": "Answer", text: "BAH counts as qualifying income when documented on your LES. Most lenders can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Shafter personnel tend to be higher-ranking — your BAH covers more of the payment than junior ranks." } },
          { "@type": "Question", name: "I'm a senior officer. Are there homes above the VA loan limit?", acceptedAnswer: { "@type": "Answer", text: "The 2026 Honolulu County limit is $1,209,750. Above that, you can still use VA — you'd put 25% down on the amount above the limit only. For a $1.4M home, that's about $47,500 down instead of the $280,000 conventional would require. Still a massive advantage." } },
          { "@type": "Question", name: "Should I buy or rent if I'm only here 2–3 years?", acceptedAnswer: { "@type": "Answer", text: "At your rank, the math almost always favors buying. Your BAH covers a significant portion of the payment, Oahu appreciation has historically supported short holds, and your rental demand when you PCS is built in." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "VA Loan Fort Shafter", item: `${BASE_URL}/va-loan-fort-shafter` },
        ],
      },
    ],
  },
  "/va-loan-tripler": {
    title: "VA Loan Guide for Tripler Army Medical Center — Buy a Home on Oahu with $0 Down",
    description: "Assigned to Tripler Army Medical Center? Complete 2026 VA loan guide with BAH rates, payment scenarios by rank, best neighborhoods (Salt Lake, Moanalua, Aiea, Pearl City, Kalihi), VA condo rules, and $0-down purchase options for military medical staff on Oahu.",
    keywords: "VA loan Tripler, buying a home near Tripler, VA loan Salt Lake, VA loan Moanalua, military medical staff home loan Hawaii",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://realitycents.com/#business",
        name: "Jay Miller — VA Loan Specialist, CMG Home Loans",
        description: "Army veteran and Certified Mortgage Advisor specializing in VA loans for military medical staff PCS'ing to Tripler Army Medical Center. 25+ years of Hawaii mortgage lending experience.",
        url: `${BASE_URL}/va-loan-tripler`,
        telephone: "(808) 429-0811",
        email: "jaym@cmghomeloans.com",
        address: { "@type": "PostalAddress", streetAddress: "500 Ala Moana Blvd, Suite 6-200", addressLocality: "Honolulu", addressRegion: "HI", postalCode: "96813", addressCountry: "US" },
        geo: { "@type": "GeoCoordinates", latitude: 21.3069, longitude: -157.8583 },
        areaServed: { "@type": "Place", name: "Oahu, Hawaii" },
        priceRange: "$$",
        image: "https://realitycents.com/og-image.jpg",
        additionalType: "https://schema.org/MortgageLender",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I'm a civilian DoD employee at Tripler. Can I use a VA loan?", acceptedAnswer: { "@type": "Answer", text: "Only if you have VA eligibility from prior military service. Civilian DoD employment alone doesn't qualify for VA financing. If you served and have a DD-214 or are a qualifying reservist, you're eligible regardless of your current civilian status." } },
          { "@type": "Question", name: "Can I qualify on BAH alone?", acceptedAnswer: { "@type": "Answer", text: "BAH counts as qualifying income when documented on your LES. Most lenders can gross it up 25% since it's tax-free, which meaningfully improves your DTI. Whether it's sufficient alone depends on your full debt picture." } },
          { "@type": "Question", name: "I'm on a 2-year medical residency. Is it worth buying?", acceptedAnswer: { "@type": "Answer", text: "It depends on the numbers, but Oahu appreciation has historically supported even short holds. Medical residents often have unique income situations (stipend + BAH + moonlighting) — a good lender can structure the qualifying income to maximize purchasing power." } },
          { "@type": "Question", name: "Should I buy or rent if I'm only here 2–3 years?", acceptedAnswer: { "@type": "Answer", text: "Oahu values have historically supported short holds better than most markets. Tripler always has incoming residents and medical staff who need housing — your rental demand is built in." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "VA Loan Tripler AMC", item: `${BASE_URL}/va-loan-tripler` },
        ],
      },
    ],
  },
  "/bah-buy-vs-rent-oahu": {
    title: "Using Your BAH to Buy vs. Rent on Oahu — The Real Math | RealityCents",
    description: "Every service member asks: should I buy or rent in Hawaii? Here's the actual numbers. 5-year comparison shows buying builds $190K–$260K+ in equity vs. $0 renting. Math-first guide for military buyers.",
    keywords: "BAH buy vs rent Oahu, should I buy or rent Hawaii military, using BAH for mortgage Hawaii, military home buying Oahu, VA loan buy vs rent",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Using Your BAH to Buy vs. Rent on Oahu — The Real Math",
        description: "5-year financial comparison showing buying builds $190K–$260K+ in equity vs. renting. Includes rank-by-rank BAH rates, purchase prices, and equity projections.",
        author: { "@type": "Person", name: "Jay Miller", url: `${BASE_URL}/about` },
        datePublished: "2026-05-13",
        dateModified: "2026-05-13",
        publisher: { "@type": "Organization", name: "RealityCents", url: BASE_URL },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Can I use my BAH as qualifying income for a VA loan?", acceptedAnswer: { "@type": "Answer", text: "Yes. VA allows BAH to be used as qualifying income. Since BAH is tax-free, most lenders can gross it up by 25% for qualification purposes, which increases your buying power." } },
          { "@type": "Question", name: "What if my BAH doesn't cover the full mortgage payment?", acceptedAnswer: { "@type": "Answer", text: "You make up the difference from your base pay. But your base pay is also tax-free for BAH purposes, and you have other income sources (spouse's income, bonuses, etc.). The math usually works out better than renting." } },
          { "@type": "Question", name: "Can I rent out my home when I PCS?", acceptedAnswer: { "@type": "Answer", text: "Yes. VA requires you to occupy the home as your primary residence for 12 months. After 12 months, you can convert to a rental. Oahu's rental market is strong — many buyers cover their full mortgage payment with rent." } },
          { "@type": "Question", name: "How does the VA funding fee affect the math?", acceptedAnswer: { "@type": "Answer", text: "The VA funding fee (2.15% for first-time users) is financed into the loan. It's still a better deal than PMI on a conventional loan. The 5-year comparison includes the funding fee, so the numbers are realistic." } },
          { "@type": "Question", name: "How do I start the process before I arrive on island?", acceptedAnswer: { "@type": "Answer", text: "Get pre-approved as soon as you have orders in hand. You can tour homes virtually, go under contract, and close before you arrive. VA allows you to close up to 60 days before your reporting date." } },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "BAH Buy vs Rent", item: `${BASE_URL}/bah-buy-vs-rent-oahu` },
        ],
      },
    ],
  },
  "/loan-compare": {
    title: "Loan Comparison Calculator — Compare VA, FHA & Conventional | RealityCents",
    description: "Compare loan scenarios side by side. See monthly payments, closing costs, APR, and total cost over time for VA, FHA, and conventional loans. Shareable links for your clients.",
    keywords: "loan comparison calculator, VA loan vs conventional, FHA vs VA loan, mortgage comparison Hawaii, loan estimate comparison",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Loan Comparison Calculator",
        description: "Compare VA, FHA, and conventional loan scenarios side by side with monthly payments, closing costs, APR, and total cost analysis.",
        url: `${BASE_URL}/loan-compare`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Person", name: "Jay Miller", url: `${BASE_URL}/about` },
        publisher: { "@type": "Organization", name: "RealityCents", url: BASE_URL },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Loan Comparison Calculator", item: `${BASE_URL}/loan-compare` },
        ],
      },
    ],
  },
  "/agents": {
    title: "Agent Tools — Real Estate Agent Toolkit",
    description: "Professional-grade tools for real estate agents: DSCR Investment Property Analyzer, Assumable Loan Calculator, and Win the Bid Escalation Calculator. Screen deals, structure assumptions, and win bidding wars.",
    keywords: "real estate agent tools, DSCR calculator, assumable loan calculator, escalation calculator, Hawaii real estate tools, mortgage tools for agents, investment property analyzer",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Real Estate Agent Toolkit",
        url: `${BASE_URL}/agents`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Professional tools for real estate agents: DSCR analyzer, assumable loan calculator, and escalation calculator.",
      },
    ],
  },
  "/dscr-calculator": {
    title: "DSCR Investment Property Analyzer — Hawaii Rental Calculator",
    description: "Screen rental properties for DSCR loan qualification. Get rent estimates, calculate debt service coverage ratio, and determine if a deal pencils for Hawaii investment properties.",
    keywords: "DSCR calculator Hawaii, debt service coverage ratio, rental property analyzer, DSCR loan qualification, investment property calculator Hawaii, rent estimate",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "DSCR Investment Property Analyzer",
        url: `${BASE_URL}/dscr-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  "/assumable-calculator": {
    title: "Assumable Loan Calculator — VA/FHA Loan Assumption Analysis",
    description: "Compare assuming an existing VA or FHA loan vs. new financing. Calculate monthly savings, gap financing needs, and total interest savings for Hawaii real estate.",
    keywords: "assumable loan calculator, VA loan assumption, FHA loan assumption, Hawaii assumable mortgage, loan assumption vs new financing, gap financing calculator",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Assumable Loan Calculator",
        url: `${BASE_URL}/assumable-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  "/escalation-calculator": {
    title: "Win the Bid — Escalation Calculator | Hawaii Real Estate",
    description: "Reframe bidding wars into real monthly costs. See what each escalation truly costs per month, analyze appraisal gap exposure, and understand the cost of not winning.",
    keywords: "escalation calculator, bidding war calculator, Hawaii real estate offer, appraisal gap, win the bid, offer strategy calculator, monthly cost of escalation",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Win the Bid Escalation Calculator",
        url: `${BASE_URL}/escalation-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
};

// ─── Build article page metadata ────────────────────────────────────────────
function buildArticleMeta(article) {
  const url = `/knowledge-base/${article.slug}`;
  const meta = articleSchemaData[article.slug] || {};
  const toHST = (d) => (d && d.includes("T") ? d : `${d}T00:00:00-10:00`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${BASE_URL}/knowledge-base/${article.slug}/#article`,
    headline: article.title,
    description: article.excerpt,
    image: { "@type": "ImageObject", url: article.image, width: 1200, height: 630 },
    datePublished: toHST(article.date),
    dateModified: toHST(article.date),
    wordCount: meta.wordCount || 1500,
    author: {
      "@type": "Person",
      "@id": `${BASE_URL}/#jaymiller`,
      name: "Jay Miller",
      jobTitle: "Sales Manager & Mortgage Loan Consultant",
      description: "VA loan specialist with 25 years of mortgage experience in Honolulu. US Army veteran. NMLS# 657301.",
      url: `${BASE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#business`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon-180x180.png`, width: 300, height: 60 },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/knowledge-base/${article.slug}/` },
    isPartOf: { "@type": "WebSite", "@id": `${BASE_URL}/#website`, name: SITE_NAME },
    keywords: meta.keywords || `${article.category}, Hawaii mortgage, ${article.title.toLowerCase()}`,
    inLanguage: "en-US",
    copyrightHolder: { "@id": `${BASE_URL}/#jaymiller` },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".article-intro", ".key-takeaway"] },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Knowledge Base", item: `${BASE_URL}/knowledge-base` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${BASE_URL}/knowledge-base/${article.slug}` },
    ],
  };

  const schemas = [articleSchema, breadcrumbSchema];

  // Add FAQ schema if available
  if (meta.faqSchema && meta.faqSchema.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faqSchema.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    };
    schemas.push(faqSchema);
  }

  return {
    title: article.title,
    description: `${article.excerpt} Expert mortgage guidance from Jay Miller, NMLS #657301, CMG Home Loans Hawaii.`,
    keywords: meta.keywords || `${article.category}, Hawaii mortgage, ${article.title.toLowerCase()}, Jay Miller mortgage, CMG Home Loans Hawaii`,
    image: article.image,
    imageAlt: article.title,
    type: "article",
    schema: schemas,
  };
}

// ─── Build complete route registry ──────────────────────────────────────────
function buildRouteRegistry() {
  const registry = {};

  // Static pages
  for (const [route, meta] of Object.entries(STATIC_PAGES)) {
    registry[route] = {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords || "",
      image: DEFAULT_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT,
      type: "website",
      schema: meta.schema || [],
      ...meta,
    };
  }

  // Article pages
  for (const article of articles) {
    const route = `/knowledge-base/${article.slug}`;
    registry[route] = buildArticleMeta(article);
  }

  return registry;
}

// ─── HTML injection helpers ─────────────────────────────────────────────────

function canonicalUrl(route) {
  if (route === "/") return `${BASE_URL}/`;
  return `${BASE_URL}${route}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generate semantic HTML body for an article
 */
function generateArticleBody(article) {
  // Convert markdown to HTML
  const htmlContent = marked(article.content);

  return `
    <article class="article-content">
      <h1>${escapeHtml(article.title)}</h1>
      <div class="article-byline" style="font-size: 0.875rem; color: #666; margin: 1rem 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 1rem;">
        <p style="margin: 0;"><strong>Jay Miller, CMA</strong> · NMLS #657301 · Certified Mortgage Advisor · 25 years Hawaii mortgage experience · U.S. Army veteran</p>
        <p style="margin: 0.25rem 0 0 0;">Last updated: ${article.lastUpdated || article.date} · ${article.readTime || '8 min'} read</p>
      </div>
      <p class="excerpt">${escapeHtml(article.excerpt)}</p>
      <div class="article-body">
        ${htmlContent}
      </div>
      <div class="article-footer">
        <p>For personalized mortgage guidance, call (808) 429-0811 or visit <a href="${BASE_URL}">realitycents.com</a></p>
      </div>
    </article>
  `;
}

/**
 * Generate the knowledge base hub page with a full article listing.
 * Groups articles by category and includes hard <a> links for crawlers.
 */
function generateKnowledgeBaseHub(articleList) {
  // Group articles by category
  const byCategory = {};
  for (const article of articleList) {
    const cat = article.category || "General";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(article);
  }

  const categoryBlocks = Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, catArticles]) => {
      const articleLinks = catArticles
        .map(
          (a) =>
            `          <li>
            <a href="${BASE_URL}/knowledge-base/${a.slug}">${escapeHtml(a.title)}</a>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #666;">${escapeHtml(a.excerpt)}</p>
          </li>`
        )
        .join("\n");
      return `      <section>
        <h2>${escapeHtml(category)}</h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
${articleLinks}
        </ul>
      </section>`;
    })
    .join("\n");

  return `
    <main>
      <h1>Hawaii Mortgage Knowledge Base</h1>
      <p>Expert articles on Hawaii mortgages, home loans, and the homebuying process. Written by Jay Miller, CMA, NMLS #657301, with 25+ years of Hawaii lending experience. Topics include VA loans, FHA loans, conventional financing, down payment assistance, leasehold vs. fee simple, and more.</p>
      <p>${articleList.length} articles covering every aspect of buying a home in Hawaii.</p>

${categoryBlocks}
    </main>
  `;
}

/**
 * Customize the base HTML for a specific route by replacing meta tags in-place,
 * injecting per-page JSON-LD schema blocks, and adding semantic HTML body.
 */
function customizeHtml(baseHtml, route, meta, bodyContent = null) {
  const url = canonicalUrl(route);
  const fullTitle = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`;
  const image = meta.image || DEFAULT_IMAGE;
  const imageAlt = meta.imageAlt || DEFAULT_IMAGE_ALT;
  const ogType = meta.type || "website";

  let html = baseHtml;

  // 1. Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(fullTitle)}</title>`
  );

  // 2. Replace <meta name="title">
  html = html.replace(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${escapeHtml(fullTitle)}" />`
  );

  // 3. Replace <meta name="description">
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );

  // 4. Replace <meta name="keywords">
  if (meta.keywords) {
    html = html.replace(
      /<meta name="keywords" content="[^"]*" \/>/,
      `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`
    );
  }

  // 5. Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );

  // 6. Replace OG tags
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${image}" />`
  );
  html = html.replace(
    /<meta property="og:image:alt" content="[^"]*" \/>/,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`
  );

  // 7. Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*" \/>/,
    `<meta name="twitter:url" content="${url}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${image}" />`
  );
  html = html.replace(
    /<meta name="twitter:image:alt" content="[^"]*" \/>/,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`
  );

  // 8. Inject per-page JSON-LD schema blocks (before </head>)
  if (meta.schema && meta.schema.length > 0) {
    const schemaBlocks = meta.schema
      .map(
        (s, i) =>
          `    <script type="application/ld+json" data-page-schema="${i}">\n    ${JSON.stringify(s)}\n    </script>`
      )
      .join("\n");
    html = html.replace("  </head>", `${schemaBlocks}\n  </head>`);
  }

  // Note: NMLS/compliance footer is rendered by the React Footer component — no pre-rendered injection needed.

  // 10. Inject semantic HTML body (before React mount point)
  if (bodyContent) {
    const prerenderedContent = `    <div id="prerendered-content" style="display:none;">\n${bodyContent}\n    </div>\n    `;
    html = html.replace(
      '    <div id="root"></div>',
      `${prerenderedContent}    <div id="root"></div>`
    );

    // Add inline script to show prerendered content before React hydrates
    const showScript = `    <script>
      // Show prerendered content until React takes over
      document.getElementById('prerendered-content').style.display = 'block';
      // Hide it once React hydrates
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
          const prerendered = document.getElementById('prerendered-content');
          if (prerendered && document.getElementById('root').children.length > 0) {
            prerendered.style.display = 'none';
          }
        }, 100);
      });
    </script>\n    `;
    // In built HTML, the script tag is a hashed module — inject before </body> instead
    html = html.replace('  </body>', showScript + '  </body>');
  }

  return html;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function prerender() {
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`index.html not found at ${indexHtmlPath}`);
    process.exit(1);
  }

  // Read the base HTML and strip any previously injected prerendered-content
  // to prevent double-injection when the script is run multiple times
  let baseHtml = fs.readFileSync(indexHtmlPath, "utf-8");
  // Remove any existing prerendered-content div (from a prior run)
  baseHtml = baseHtml.replace(
    /\s*<div id="prerendered-content"[\s\S]*?<\/div>\s*(?=\s*<div id="root">)/g,
    "\n    "
  );
  // Also remove the show/hide script that was injected before </body>
  baseHtml = baseHtml.replace(
    /\s*<script>\s*\/\/ Show prerendered content until React takes over[\s\S]*?<\/script>\s*(?=\s*<\/body>)/g,
    "\n  "
  );
  const registry = buildRouteRegistry();
  const routes = Object.keys(registry);

  console.log(`[prerender] Creating SEO-complete HTML files for ${routes.length} routes with semantic bodies...`);

  let success = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const meta = registry[route];
      const routePath = route === "/" ? "." : route.replace(/^\//, "");
      const outputDir = path.resolve(distPublic, routePath);
      const outputFile = path.resolve(outputDir, "index.html");

      // Find body content for this route
      let bodyContent = null;
      if (route === "/knowledge-base") {
        // Generate the hub page with a full article listing and hard <a> links
        bodyContent = generateKnowledgeBaseHub(articles);
      } else if (route.startsWith("/knowledge-base/")) {
        const slug = route.replace("/knowledge-base/", "");
        const fullArticle = articlesFull.find((a) => a.slug === slug);
        if (fullArticle) {
          bodyContent = generateArticleBody(fullArticle);
        }
      } else if (STATIC_PAGE_BODIES[route]) {
        bodyContent = STATIC_PAGE_BODIES[route];
      }

      const routeHtml = customizeHtml(baseHtml, route, meta, bodyContent);

      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(outputFile, routeHtml, "utf-8");

      console.log(`  ✓ ${route} → ${canonicalUrl(route)}`);
      success++;
    } catch (error) {
      console.error(`  ✗ ${route}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n[prerender] Done! ${success} routes pre-rendered, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

prerender().catch((error) => {
  console.error("Prerender failed:", error);
  process.exit(1);
});
