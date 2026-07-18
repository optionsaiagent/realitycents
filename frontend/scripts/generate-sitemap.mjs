#!/usr/bin/env node
/**
 * Sitemap Generator
 * =================
 * Generates sitemap.xml with per-article lastmod dates from article-data.json.
 * Static pages use today's date (they change with each deploy).
 * Article pages use their actual publish date (or lastUpdated if available).
 *
 * Run: node scripts/generate-sitemap.mjs
 * Output: client/public/sitemap.xml
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const articlesPath = path.resolve(__dirname, "article-data.json");
const outputPath = path.resolve(projectRoot, "client/public/sitemap.xml");

const BASE_URL = "https://realitycents.com";
const TODAY = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const articles = JSON.parse(fs.readFileSync(articlesPath, "utf-8"));

// ─── Static pages with their own lastmod and priority ───────────────────────
const STATIC_PAGES = [
  { loc: "/",                        changefreq: "weekly",  priority: "1.0",  lastmod: TODAY },
  { loc: "/about",                   changefreq: "monthly", priority: "0.9",  lastmod: TODAY },
  { loc: "/contact",                 changefreq: "monthly", priority: "0.9",  lastmod: TODAY },
  { loc: "/guide",                   changefreq: "monthly", priority: "0.9",  lastmod: TODAY },
  { loc: "/agents",                  changefreq: "monthly", priority: "0.8",  lastmod: TODAY },
  { loc: "/calculator",              changefreq: "monthly", priority: "0.9",  lastmod: TODAY },
  { loc: "/advanced-calculator",     changefreq: "monthly", priority: "0.8",  lastmod: TODAY },
  { loc: "/affordability-calculator", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
  { loc: "/rent-vs-buy",             changefreq: "monthly", priority: "0.8",  lastmod: TODAY },
  { loc: "/buydown-calculator",      changefreq: "monthly", priority: "0.8",  lastmod: TODAY },
  { loc: "/military-calculator",     changefreq: "monthly", priority: "0.8",  lastmod: TODAY },
  { loc: "/va-approved-condos-oahu",  changefreq: "weekly",  priority: "0.9",  lastmod: TODAY },
  { loc: "/va-loan-schofield-barracks",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/va-loan-pearl-harbor-hickam",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/va-loan-kaneohe-mcbh",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/va-loan-fort-shafter",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/va-loan-tripler",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/bah-buy-vs-rent-oahu",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/loan-compare",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/dscr-calculator",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/assumable-calculator",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/escalation-calculator",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/heloc-sweep-calculator",  changefreq: "monthly",  priority: "0.8",  lastmod: TODAY },
  { loc: "/knowledge-base",          changefreq: "weekly",  priority: "0.9",  lastmod: TODAY },
  { loc: "/frequently-asked-questions", changefreq: "monthly", priority: "0.8",  lastmod: TODAY },
];

// ─── Build XML ──────────────────────────────────────────────────────────────
function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [];

// Static pages
entries.push("  <!-- ── Core Pages ── -->");
for (const page of STATIC_PAGES) {
  entries.push(urlEntry(page));
}

// Article pages
entries.push("  <!-- ── Knowledge Base Articles ── -->");
for (const article of articles) {
  entries.push(
    urlEntry({
      loc: `/knowledge-base/${article.slug}`,
      lastmod: article.lastUpdated || article.date, // prefer lastUpdated over publish date
      changefreq: "monthly",
      priority: "0.8",
    })
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries.join("\n")}
</urlset>
`;

fs.writeFileSync(outputPath, xml, "utf-8");
console.log(`[sitemap] Generated ${STATIC_PAGES.length + articles.length} URLs → ${outputPath}`);
