/**
 * Extract Article Content
 * =======================
 * Parses client/src/lib/articles.ts directly using regex to extract
 * all article metadata AND full markdown content, then writes to
 * scripts/article-data-full.json for the prerender script to consume.
 *
 * Also regenerates scripts/article-data.json (metadata only, no content)
 * and scripts/article-schema-data.json for backward compatibility.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const articlesPath = path.resolve(projectRoot, "client/src/lib/articles.ts");
const schemaDataPath = path.resolve(projectRoot, "client/src/lib/articleSchemaData.ts");

const outputFull = path.resolve(__dirname, "article-data-full.json");
const outputMeta = path.resolve(__dirname, "article-data.json");
const outputSchema = path.resolve(__dirname, "article-schema-data.json");

function extractArticles() {
  const src = fs.readFileSync(articlesPath, "utf-8");

  // Match each article object in the articles array
  // Each article starts with { and has slug, title, excerpt, category, readTime, date, image, content fields
  const articles = [];

  // Find the articles array
  const arrayMatch = src.match(/const (?:all)?[Aa]rticles:\s*Article\[\]\s*=\s*\[/);
  if (!arrayMatch) {
    console.error("Could not find articles array in articles.ts");
    process.exit(1);
  }

  const arrayStart = arrayMatch.index + arrayMatch[0].length;

  // Parse articles one by one using a state machine approach
  let pos = arrayStart;
  while (pos < src.length) {
    // Find next opening brace
    const braceIdx = src.indexOf("{", pos);
    if (braceIdx === -1) break;

    // Check if we've hit the end of the array
    const between = src.substring(pos, braceIdx).trim();
    if (between === "]" || between.startsWith("];")) break;
    // Extract fields using regex from this article block
    // We need to find the matching closing brace, accounting for the content template literal
    const article = extractArticleAt(src, braceIdx);
    if (article) {
      articles.push(article);
      pos = article._endPos;
    } else {
      pos = braceIdx + 1;
    }
  }
  return articles;
}
function extractArticleAt(src, startBrace) {
  // Find slug first to confirm this is an article
  const slugMatch = src.substring(startBrace, startBrace + 500).match(/slug:\s*"([^"]+)"/);
  if (!slugMatch) return null;
  const slug = slugMatch[1];
  // Extract simple string fields
  const chunk = src.substring(startBrace, startBrace + 2000);
  const title = extractField(chunk, "title");
  const excerpt = extractField(chunk, "excerpt");
  const category = extractField(chunk, "category");
  const readTime = extractField(chunk, "readTime");
  const date = extractField(chunk, "date");
  const lastUpdated = extractField(chunk, "lastUpdated");
  const image = extractField(chunk, "image");
  const featured = chunk.includes("featured: true");
  const draft = chunk.includes("draft: true");
  // Extract content - it's a template literal (backtick string)
  const contentMarker = "content: `";
  const contentStart = src.indexOf(contentMarker, startBrace);
  if (contentStart === -1) return null;
  const contentBodyStart = contentStart + contentMarker.length;
  // Find the closing backtick - scan for unescaped backtick
  let pos = contentBodyStart;
  while (pos < src.length) {
    if (src[pos] === "`" && src[pos - 1] !== "\\") {
      break;
    }
    pos++;
  }
  const content = src.substring(contentBodyStart, pos);

  // Find the end of this article object (after the content closing backtick)
  const afterContent = src.indexOf("},", pos);
  const endPos = afterContent !== -1 ? afterContent + 2 : pos + 2;

  return {
    slug,
    title,
    excerpt,
    category,
    readTime,
    date,
    lastUpdated: lastUpdated || null,
    featured,
    draft,
    image,
    content,
    _endPos: endPos,
  };
}

function extractField(chunk, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, "s");
  const match = chunk.match(regex);
  return match ? match[1].replace(/\\"/g, '"') : "";
}

function extractSchemaData() {
  const src = fs.readFileSync(schemaDataPath, "utf-8");
  const result = {};

  // Find each slug key and manually extract its object body
  const slugRegex = /"([^"]+)":\s*\{/g;
  let slugMatch;
  while ((slugMatch = slugRegex.exec(src)) !== null) {
    const slug = slugMatch[1];
    const openBraceIdx = slugMatch.index + slugMatch[0].length - 1;

    // Find the matching closing brace by counting depth
    let depth = 1;
    let pos = openBraceIdx + 1;
    while (pos < src.length && depth > 0) {
      if (src[pos] === "{") depth++;
      else if (src[pos] === "}") depth--;
      pos++;
    }

    const body = src.substring(openBraceIdx + 1, pos - 1);

    const wordCountMatch = body.match(/wordCount:\s*(\d+)/);
    const keywordsMatch = body.match(/keywords:\s*"([^"]+)"/);

    // Extract about array
    const aboutItems = [];
    const aboutRegex = /\{\s*name:\s*"([^"]+)",\s*sameAs:\s*"([^"]+)"\s*\}/g;
    let aboutMatch;
    while ((aboutMatch = aboutRegex.exec(body)) !== null) {
      aboutItems.push({ name: aboutMatch[1], sameAs: aboutMatch[2] });
    }

    // Extract faqSchema array if present
    const faqItems = [];
    const faqRegex = /\{\s*question:\s*"([^"]+)",\s*answer:\s*"([^"]+)"\s*\}/g;
    let faqMatch;
    while ((faqMatch = faqRegex.exec(body)) !== null) {
      faqItems.push({ question: faqMatch[1], answer: faqMatch[2] });
    }

    result[slug] = {
      wordCount: wordCountMatch ? parseInt(wordCountMatch[1]) : 1500,
      keywords: keywordsMatch ? keywordsMatch[1] : "",
      about: aboutItems,
    };

    // Add faqSchema if present
    if (faqItems.length > 0) {
      result[slug].faqSchema = faqItems;
    }
  }

  return result;
}

// ─── Main ───────────────────────────────────────────────────────────────────

const allArticles = extractArticles();
const articles = allArticles.filter((a) => !a.draft);
const schemaData = extractSchemaData();

console.log(`[extract] Found ${allArticles.length} articles (${allArticles.length - articles.length} draft, ${articles.length} published)`);

// Write full data (with content) for prerender
const fullData = articles.map(({ _endPos, ...rest }) => rest);
fs.writeFileSync(outputFull, JSON.stringify(fullData, null, 2), "utf-8");
console.log(`[extract] Wrote ${outputFull} (with content)`);

// Write metadata only (without content) for sitemap/backward compat
const metaData = articles.map(({ _endPos, content, ...rest }) => rest);
fs.writeFileSync(outputMeta, JSON.stringify(metaData, null, 2), "utf-8");
console.log(`[extract] Wrote ${outputMeta} (metadata only)`);

// Write schema data
fs.writeFileSync(outputSchema, JSON.stringify(schemaData, null, 2), "utf-8");
console.log(`[extract] Wrote ${outputSchema} (schema data)`);
