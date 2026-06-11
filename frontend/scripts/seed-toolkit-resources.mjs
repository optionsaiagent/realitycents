/**
 * Seed Toolkit Resources
 * ─────────────────────
 * Usage: node scripts/seed-toolkit-resources.mjs
 *
 * This script is idempotent — it uses INSERT IGNORE so running it twice won't create duplicates.
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const RESOURCES = [
  {
    title: "Toolkit Index & Overview",
    description: "Welcome guide and index of all available resources in the Agent Toolkit.",
    category: null, // standalone — shown as the welcome card, not in category sections
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/00_toolkit_index_0e8c62aa.pdf",
    sortOrder: 0,
  },
  {
    title: "VA Loan Cheat Sheet",
    description: "One-page reference covering VA loan eligibility, entitlement, funding fee, and Hawaii-specific tips.",
    category: "buyer_handouts",
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/01_va_cheat_sheet_591e2227.pdf",
    sortOrder: 10,
  },
  {
    title: "Condo Warrantability Guide",
    description: "Explains what makes a condo warrantable vs. non-warrantable and how it affects financing options.",
    category: "buyer_handouts",
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/02_condo_warrantability_3cfb25cf.pdf",
    sortOrder: 20,
  },
  {
    title: "FHA vs. Conventional Comparison",
    description: "Side-by-side breakdown of FHA and Conventional loans — down payment, PMI, credit requirements, and more.",
    category: "buyer_handouts",
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/03_fha_vs_conventional_d8633e69.pdf",
    sortOrder: 30,
  },
  {
    title: "Buydown Conversation Script",
    description: "A proven script for explaining temporary buydowns to buyers and sellers — including the 2-1 and 3-2-1 structures.",
    category: "agent_scripts",
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/04_buydown_script_4a3f273a.pdf",
    sortOrder: 40,
  },
  {
    title: "VA Condo Approval Conversation",
    description: "How to explain VA condo approval status to buyers and navigate the process with confidence.",
    category: "agent_scripts",
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/05_va_condo_conversation_005536cf.pdf",
    sortOrder: 50,
  },
  {
    title: "J-1 Inspection Guide",
    description: "Hawaii-specific guide to J-1 inspection requirements and what buyers need to know before closing.",
    category: "local_checklists",
    fileUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663400630719/hYWhTCU9MkzGTyHcA5sLWw/06_j1_inspection_guide_ddd90623.pdf",
    sortOrder: 60,
  },
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Make sure .env is configured.");
    process.exit(1);
  }

  const conn = await mysql.createConnection(dbUrl);
  console.log("Connected to database.");

  let inserted = 0;
  let skipped = 0;

  for (const r of RESOURCES) {
    try {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO toolkit_resources (title, description, category, fileUrl, sortOrder, downloadCount, createdAt)
         VALUES (?, ?, ?, ?, ?, 0, NOW())`,
        [r.title, r.description, r.category, r.fileUrl, r.sortOrder]
      );
      if (result.affectedRows > 0) {
        console.log(`  ✓ Inserted: ${r.title}`);
        inserted++;
      } else {
        console.log(`  ~ Already exists: ${r.title}`);
        skipped++;
      }
    } catch (err) {
      console.error(`  ✗ Error inserting ${r.title}:`, err.message);
    }
  }

  await conn.end();
  console.log(`\nDone. Inserted: ${inserted}, Skipped/existing: ${skipped}`);
}

main().catch(console.error);
