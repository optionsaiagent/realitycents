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
    title: "VA-Approved Condos on Oahu — 1,379 Projects",
    description: "Searchable directory of all 1,379 VA-approved condo projects on Oahu, Hawaii. Filter by neighborhood, approval status, and zip code. Updated May 2026. Data from VA LGY Hub.",
    keywords: "VA approved condos Oahu, VA approved condos Hawaii, VA condo list Honolulu, VA eligible condos Waikiki, VA loan condo Hawaii, VA approved condo projects Oahu 2026, VA condo approval list",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "VA-Approved Condo Projects on Oahu, Hawaii",
        description: "Complete directory of 1,379 VA-approved condominium projects in Honolulu County (Oahu), Hawaii, sourced from the VA LGY Hub. Includes project name, address, approval status, review date, and VA ID.",
        url: `${BASE_URL}/va-approved-condos-oahu`,
        creator: { "@type": "Organization", name: "U.S. Department of Veterans Affairs" },
        dateModified: "2026-05-12",
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
          { "@type": "Question", name: "How many VA-approved condos are on Oahu?", acceptedAnswer: { "@type": "Answer", text: "As of May 2026, there are 1,379 VA-approved condo projects on Oahu — 1,134 Accepted Without Conditions and 245 Accepted With Conditions — spread across 28 neighborhoods from Waikiki to Ewa Beach." } },
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
    title: "VA Loan Guide for Schofield Barracks — Buy a Home on Oahu",
    description: "PCS'ing to Schofield Barracks? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Mililani, Wahiawa, Royal Kunia), and $0-down purchase options for 25th Infantry Division families.",
    keywords: "VA loan Schofield Barracks, buying a home near Schofield Barracks, VA loan Mililani, VA loan Wahiawa, 25th Infantry Division home loan, military home buying Oahu",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Can I use my VA loan for a 3-year tour at Schofield?", acceptedAnswer: { "@type": "Answer", text: "Yes. VA requires you to occupy the home as your primary residence for 12 months — your intent must be to live there at the time of purchase. If you receive military orders before 12 months, that satisfies the occupancy requirement. After occupancy is met, you can rent it when you PCS out. Most Hawaii assignments are 3 years, which gives you plenty of time to build equity before the next move." } },
          { "@type": "Question", name: "Is there a VA loan limit for Oahu in 2026?", acceptedAnswer: { "@type": "Answer", text: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit only matters if you have reduced entitlement from a prior VA loan that hasn't been restored." } },
          { "@type": "Question", name: "Should I buy a house or a condo near Schofield?", acceptedAnswer: { "@type": "Answer", text: "Depends on your rank and family size. E-5 and below often find condos/townhomes more realistic in the $400K–$800K range. E-6+ can stretch into single-family homes in Wahiawa or Mililani. Condos must be VA-approved — check the VA Condo Lookup tool before falling in love with a unit." } },
          { "@type": "Question", name: "How long does a VA loan take to close in Hawaii?", acceptedAnswer: { "@type": "Answer", text: "Typically 30–45 days from accepted offer to keys. VA appraisals on Oahu currently take 7–10 business days. Jay orders the appraisal after clearing the home inspection period to protect buyers from paying for an appraisal on a home they might walk away from." } },
          { "@type": "Question", name: "Can I buy a home before arriving on island?", acceptedAnswer: { "@type": "Answer", text: "Yes — you can get pre-approved, tour homes virtually with your agent, and even go under contract before boots hit the ground. VA allows you to close up to 60 days before reporting. Start your pre-approval as soon as you have orders in hand." } },
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
    title: "VA Loan Guide for Pearl Harbor-Hickam — Buy a Home on Oahu",
    description: "PCS'ing to JBPHH? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Ewa Beach, Pearl City, Aiea, Kapolei), and $0-down options for Navy and Air Force families at Joint Base Pearl Harbor-Hickam.",
    keywords: "VA loan Pearl Harbor, VA loan Hickam, JBPHH housing, buying a home near Pearl Harbor, VA loan Ewa Beach, Navy home loan Hawaii, Air Force home loan Oahu",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I'm Navy — can I use my VA loan even if I haven't separated yet?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. Active duty service members are eligible for VA loans while still serving. VA requires you to occupy the home for 12 months as your primary residence. If you receive military orders before 12 months, that satisfies the occupancy requirement." } },
          { "@type": "Question", name: "Is there a VA loan limit for Oahu in 2026?", acceptedAnswer: { "@type": "Answer", text: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit only matters if you have reduced entitlement from a prior VA loan that hasn't been restored." } },
          { "@type": "Question", name: "Should I buy near Pearl Harbor or near Hickam?", acceptedAnswer: { "@type": "Answer", text: "They're the same base now (JBPHH), and the gates are close together. The real question is which gate you'll use daily. If you work on the Pearl Harbor side (Navy), Pearl City and Aiea put you closest. If you're on the Hickam side (Air Force), Salt Lake and Moanalua are right there." } },
          { "@type": "Question", name: "When does Jay order the VA appraisal?", acceptedAnswer: { "@type": "Answer", text: "Jay orders VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. Get your inspection done early in the contract to keep the timeline on track." } },
          { "@type": "Question", name: "Can I rent out my home when I PCS from JBPHH?", acceptedAnswer: { "@type": "Answer", text: "Yes — once you've met the VA occupancy requirement (12 months, or less if you receive PCS orders), you can convert to a rental. Oahu's rental market is extremely strong near JBPHH. Many clients cover their full mortgage payment with rent and build equity while stationed elsewhere." } },
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
    title: "VA Loan Guide for MCBH Kaneohe Bay — Buy a Home on Oahu",
    description: "PCS'ing to Marine Corps Base Hawaii? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best Windward side neighborhoods (Kailua, Kaneohe, Enchanted Lake), and $0-down options for Marines at MCBH Kaneohe Bay.",
    keywords: "VA loan Kaneohe, VA loan MCBH, Marine Corps Base Hawaii housing, buying a home Kailua, VA loan Windward Oahu, Marines home loan Hawaii",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I'm a Marine — is the VA loan process different for me?", acceptedAnswer: { "@type": "Answer", text: "No. VA loans work identically for all branches. Marines, Soldiers, Sailors, Airmen — same benefits, same $0 down, same process. VA requires you to occupy the home for 12 months as your primary residence. If you receive PCS orders before 12 months, that satisfies the requirement." } },
          { "@type": "Question", name: "Is there a VA loan limit for Oahu in 2026?", acceptedAnswer: { "@type": "Answer", text: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit only matters if you have reduced entitlement from a prior VA loan. This is especially relevant on the Windward side where Kailua homes can push above $1M." } },
          { "@type": "Question", name: "Is it worth buying on the Windward side if I might PCS in 3 years?", acceptedAnswer: { "@type": "Answer", text: "Usually yes. Windward side homes appreciate well and rent easily to the next wave of MCBH Marines. Kailua especially has strong rental demand from both military and civilian tenants. If you buy at $800K today and rent it for $3,500–$4,000/month when you leave, the numbers often work." } },
          { "@type": "Question", name: "When does Jay order the VA appraisal?", acceptedAnswer: { "@type": "Answer", text: "Jay orders VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. On the Windward side, where older homes are common, get your inspection done early in the contract." } },
          { "@type": "Question", name: "What about the rain on the Windward side — does that affect VA appraisals?", acceptedAnswer: { "@type": "Answer", text: "Windward Oahu gets more rain than the Leeward side, and VA appraisers know this. They'll look for moisture intrusion, mold, proper drainage, and gutter condition. Older homes without gutters or with flat roofs get flagged more often. This isn't a dealbreaker — it just means you want a good pre-inspection." } },
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
    title: "VA Loan Guide for Fort Shafter — Buy a Home on Oahu",
    description: "PCS'ing to Fort Shafter? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Salt Lake, Aliamanu, Aiea, Nuuanu), and $0-down options for USARPAC Army personnel on Oahu.",
    keywords: "VA loan Fort Shafter, buying a home near Fort Shafter, VA loan Salt Lake, VA loan Aliamanu, USARPAC housing, Army home loan Honolulu",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I'm stationed at Fort Shafter but might move to Camp Smith — should that affect where I buy?", acceptedAnswer: { "@type": "Answer", text: "Camp Smith is on Moanalua Ridge, about 10 minutes from Fort Shafter. If there's any chance you'll rotate to Camp Smith, buy in Salt Lake, Moanalua, or Aiea — you'll be close to both. VA requires you to occupy the home for 12 months. If you receive orders to a different installation before 12 months, that satisfies the occupancy requirement." } },
          { "@type": "Question", name: "Is there a VA loan limit for Oahu in 2026?", acceptedAnswer: { "@type": "Answer", text: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit only matters if you have reduced entitlement from a prior VA loan that hasn't been restored." } },
          { "@type": "Question", name: "Are Salt Lake condos a good investment?", acceptedAnswer: { "@type": "Answer", text: "They can be — but you need to be selective. Salt Lake condos range from $350K–$800K and rent well to the next wave of military buyers. The key is finding a VA-approved building with healthy reserves and low HOA fees. Some older buildings have deferred maintenance that makes them poor investments." } },
          { "@type": "Question", name: "When does Jay order the VA appraisal?", acceptedAnswer: { "@type": "Answer", text: "Jay orders VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. Near Fort Shafter, where older homes are common, get your inspection done early in the contract." } },
          { "@type": "Question", name: "How does Honolulu COLA affect my buying power?", acceptedAnswer: { "@type": "Answer", text: "Honolulu COLA adds approximately 8.9% to your base pay. While it can't be used directly for qualifying (it's not guaranteed long-term), it gives you a larger monthly cushion for utilities, maintenance, and the general cost of living in Hawaii." } },
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
    title: "VA Loan Guide for Tripler Army Medical Center — Buy a Home on Oahu",
    description: "PCS'ing to Tripler AMC? Complete VA loan guide with 2026 BAH rates, payment scenarios by rank, best neighborhoods (Moanalua, Aliamanu, Aiea Heights, Pearl City), and $0-down options for Army medical personnel on Oahu.",
    keywords: "VA loan Tripler, buying a home near Tripler AMC, VA loan Moanalua, VA loan Aiea, Tripler Army Medical Center housing, military doctor home loan Hawaii",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "I'm a military physician — does my income affect VA loan eligibility?", acceptedAnswer: { "@type": "Answer", text: "VA loans have no maximum income limit. Whether you're an E-5 medic or an O-6 surgeon, you qualify based on service, not income. Higher income actually helps — it increases your purchase power. VA requires you to occupy the home for 12 months as your primary residence." } },
          { "@type": "Question", name: "Is there a VA loan limit for Oahu in 2026?", acceptedAnswer: { "@type": "Answer", text: "With full entitlement, there is no loan limit — you can buy at any price with $0 down. The $1,249,125 conforming loan limit only matters if you have reduced entitlement from a prior VA loan. For Tripler physicians buying in the $800K–$1.2M range, full entitlement means no cap." } },
          { "@type": "Question", name: "My spouse also works at Tripler — can we both use our VA eligibility?", acceptedAnswer: { "@type": "Answer", text: "If both spouses are veterans or active duty, you can combine entitlements on a single property. This is rare but powerful. More commonly, one spouse uses their VA loan for the primary residence while the other preserves their entitlement for a future investment property." } },
          { "@type": "Question", name: "When does Jay order the VA appraisal?", acceptedAnswer: { "@type": "Answer", text: "Jay orders VA appraisals after clearing the home inspection period. This protects you from paying for an appraisal on a home you might walk away from due to inspection issues. Near Tripler, where many homes are older, get your inspection done early in the contract." } },
          { "@type": "Question", name: "I'm doing a residency at Tripler — is it worth buying for just 3–4 years?", acceptedAnswer: { "@type": "Answer", text: "Often yes. When you finish residency and PCS, you can rent the home out — Tripler always has incoming residents and medical staff who need housing. Oahu's rental market near military installations is extremely strong. Many physician clients cover their full mortgage with rent and build equity while stationed elsewhere." } },
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
      <div class="article-meta" style="font-size: 0.875rem; color: #666; margin: 1rem 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 1rem;">
        <p style="margin: 0;">By <strong>Jay Miller</strong> · Sales Manager & Mortgage Loan Consultant · NMLS #657301 · 25 years Hawaii mortgage experience · US Army veteran</p>
        <p style="margin: 0.25rem 0 0 0;">Last updated ${article.date}</p>
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
 * Customize the base HTML for a specific route by replacing meta tags in-place,
 * injecting per-page JSON-LD schema blocks, and adding semantic HTML body.
 */
function customizeHtml(baseHtml, route, meta, articleBody = null) {
  const url = canonicalUrl(route);
  const fullTitle = `${meta.title} | ${SITE_NAME}`;
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
  if (articleBody) {
    const prerenderedContent = `    <div id="prerendered-content" style="display:none;">\n${articleBody}\n    </div>\n    `;
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

  const baseHtml = fs.readFileSync(indexHtmlPath, "utf-8");
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

      // Find article body if this is an article route
      let articleBody = null;
      if (route.startsWith("/knowledge-base/")) {
        const slug = route.replace("/knowledge-base/", "");
        const fullArticle = articlesFull.find((a) => a.slug === slug);
        if (fullArticle) {
          articleBody = generateArticleBody(fullArticle);
        }
      }

      const routeHtml = customizeHtml(baseHtml, route, meta, articleBody);

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
