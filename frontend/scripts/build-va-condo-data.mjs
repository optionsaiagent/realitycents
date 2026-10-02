#!/usr/bin/env node
/**
 * FINAL (approved by Jay Oct 1, 2026). Target path: frontend/scripts/build-va-condo-data.mjs
 *
 * Builds the public, agent-readable VA condo data files from the directory's
 * source of truth (client/src/data/va-approved-condos-oahu.json, refreshed by
 * scripts/update-va-condos.mjs from the VA LGY Hub API):
 *
 *   client/public/data/va-approved-condos-hawaii.json
 *   client/public/data/va-approved-condos-hawaii.csv
 *   client/public/data/README.md
 *
 * Run from frontend/:  node scripts/build-va-condo-data.mjs
 * Optional args: <sourceJson> <outDir>   (used for local testing)
 *
 * It never adds, edits, or infers a status. Every record and status comes
 * verbatim from the VA data already in the source file. last_checked is the
 * source file's lastUpdated (the date update-va-condos.mjs pulled from VA).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dedupeByVaId, ZIP_OVERRIDES } from "./lib/oahu-filter.mjs";

const here = path.dirname(new URL(import.meta.url).pathname);
const SRC = process.argv[2] ?? path.resolve(here, "../client/src/data/va-approved-condos-oahu.json");
const OUT_DIR = process.argv[3] ?? path.resolve(here, "../client/public/data");
const BASE = "va-approved-condos-hawaii";
const SITE = "https://realitycents.com";

const VA_LOOKUP_URL = "https://lgy.va.gov/lgyhub/condo-report";
const VA_API_URL = "https://lgy.va.gov/lgyhub/api/condos/search?stateCode=HI";
const NOTICE =
  "Approvals change. This is a dated copy of the VA list, not the VA's live record. " +
  `Verify a project's current status with the VA at ${VA_LOOKUP_URL} before relying on it. ` +
  "VA approval status does not guarantee loan approval.";
const COMPLIANCE =
  "Educational data only, not a loan offer or commitment to lend. VA approval status does not guarantee loan approval. " +
  "Jay Miller, NMLS #657301 | CMG Home Loans branch NMLS #2475890 | CMG Mortgage, Inc. NMLS #1820 | Equal Housing Opportunity.";

const ALLOWED = new Set(["Accepted Without Conditions", "Accepted With Conditions"]);
const DEDUPE_NOTE = "One record per VA ID; VA duplicates are collapsed, keeping the latest review date.";
const titleCase = s => s.toLowerCase().replace(/\b[a-z]/g, ch => ch.toUpperCase());
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = iso => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const src = JSON.parse(readFileSync(SRC, "utf8"));
if (!/^\d{4}-\d{2}-\d{2}$/.test(src.lastUpdated ?? "")) throw new Error("source lastUpdated missing");
if (!Array.isArray(src.condos) || src.condos.length < 1500) throw new Error("source condos look wrong");

// update-va-condos.mjs already collapses VA ID duplicates. Run the same
// helper here so a hand-edited source file cannot republish two rows.
const { kept: sourceCondos, dropped } = dedupeByVaId(
  src.condos,
  c => c.vaId,
  c => c.reviewDate,
  c => c.id,
);
for (const d of dropped) {
  console.log(`Dropped duplicate: ${d.vaId} | ${d.dropped.name ?? ""} | kept ${d.kept.id} | dropped ${d.dropped.id}`);
}
if (sourceCondos.length < 1500) throw new Error("deduped condos look wrong");

const records = sourceCondos.map(c => {
  if (!ALLOWED.has(c.status)) throw new Error(`unexpected status ${c.status} for ${c.id}`);
  return {
    va_id: c.vaId,
    va_record_id: c.id,
    name: c.name,
    address: c.address || "",
    city: titleCase((c.city || "").split(",")[0].trim()),
    zip: c.zipCode || "",
    island: "Oahu",
    county: "Honolulu",
    neighborhood: c.neighborhood || "",
    status: c.status,
    review_date: c.reviewDate ?? null,
    request_date: c.approvalRequestDate ?? null,
  };
});

const without = records.filter(r => r.status === "Accepted Without Conditions").length;
const checked = longDate(src.lastUpdated);
const meta = {
  title: "VA-approved condo projects in Hawaii (Oahu only)",
  description:
    `VA-accepted condo projects on Oahu (Honolulu County) from VA's condo list, last checked ${checked}. ` +
    "Approvals change; confirm current status with VA.",
  last_checked: src.lastUpdated,
  source: {
    name: "U.S. Department of Veterans Affairs, LGY Hub condo report",
    lookup_url: VA_LOOKUP_URL,
    api_url: VA_API_URL,
  },
  scope: {
    state: "HI",
    islands: ["Oahu"],
    counties: ["Honolulu"],
    note: "Island is decided from ZIP, city, and county because VA's county field alone is unreliable.",
    statuses_included: [...ALLOWED],
    not_included:
      "Neighbor islands (Hawaii, Maui, Kauai and Kalawao counties) and projects the VA lists as Pending, Rejected, Suspended, " +
      "Deleted, or any other status. A project missing from this file may still be on the VA's list; check the VA site.",
  },
  notice: NOTICE,
  counts: { total: records.length, accepted_without_conditions: without, accepted_with_conditions: records.length - without },
  zip_corrections: Object.entries(ZIP_OVERRIDES)
    .filter(([vaId]) => records.some(r => r.va_id === vaId))
    .map(([va_id, o]) => ({ va_id, listed: o.listed, corrected: o.corrected, reason: o.reason })),
  dedupe: DEDUPE_NOTE,
  refresh: "Re-pulled from the VA API about monthly. last_checked is the date of the most recent pull (Hawaii time).",
  urls: {
    json: `${SITE}/data/${BASE}.json`,
    csv: `${SITE}/data/${BASE}.csv`,
    readme: `${SITE}/data/README.md`,
    directory: `${SITE}/va-approved-condos-oahu`,
    guide: `${SITE}/knowledge-base/va-loans-hawaii-military`,
  },
  publisher: { name: "RealityCents", url: SITE, contact: "Jay Miller, NMLS #657301, CMG Home Loans, (808) 429-0811" },
  compliance: COMPLIANCE,
  schema: {
    va_id: "VA condo ID (developmentBusinessId), as shown in the VA condo report. Usually 6 digits; a few are alphanumeric (e.g. FHA294). Unique in this file.",
    va_record_id: "VA internal record id. Unique per record.",
    name: "Project name exactly as the VA lists it (uppercase, VA spelling).",
    address: "Project address line from the VA. Empty when the VA has none.",
    city: "City from the VA record, title-cased, island suffix removed. VA spelling kept.",
    zip: "5-digit ZIP from the VA record, unless va_id is listed in zip_corrections.",
    island: "Always Oahu in this file.",
    county: "Always Honolulu in this file.",
    neighborhood: "RealityCents neighborhood grouping by ZIP. Not a VA field.",
    status: "VA disposition, verbatim: Accepted Without Conditions or Accepted With Conditions.",
    review_date: "VA review completed date (YYYY-MM-DD) or null when the VA record has none.",
    request_date: "VA approval request received date (YYYY-MM-DD) or null.",
  },
};

mkdirSync(OUT_DIR, { recursive: true });
const json = JSON.stringify({ ...meta, records });
writeFileSync(path.join(OUT_DIR, `${BASE}.json`), json + "\n");

const cols = ["va_id", "va_record_id", "name", "address", "city", "zip", "island", "county", "neighborhood", "status", "review_date", "request_date", "last_checked"];
const esc = v => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [cols.join(",")]
  .concat(records.map(r => cols.map(k => esc(k === "last_checked" ? meta.last_checked : r[k])).join(",")))
  .join("\n") + "\n";
writeFileSync(path.join(OUT_DIR, `${BASE}.csv`), csv);

const withCond = records.length - without;
const nameByVaId = new Map(records.map(r => [r.va_id, r.name]));
const zipRows = meta.zip_corrections.map(z => {
  const project = String(nameByVaId.get(z.va_id) ?? "").replace(/\|/g, "/");
  const reason = String(z.reason).replace(/\|/g, "/");
  return `| ${z.va_id} | ${project} | ${z.listed} | ${z.corrected} | ${reason} |`;
});
const zipSection = meta.zip_corrections.length
  ? [
      "## ZIP corrections",
      "",
      "| VA ID | Project | Listed ZIP | Corrected ZIP | Reason |",
      "|---|---|---|---|---|",
      ...zipRows,
      "",
    ].join("\n")
  : "";
const readme = `# VA-accepted condo projects on Oahu

VA-accepted condo projects on Oahu from VA's condo list, last checked ${checked}. Approvals change; confirm current status with VA.

VA source: ${VA_LOOKUP_URL}
VA API: ${VA_API_URL}

Files:
- JSON: ${SITE}/data/${BASE}.json
- CSV: ${SITE}/data/${BASE}.csv

Counts:
- Total: ${records.length.toLocaleString("en-US")}
- Without conditions: ${without.toLocaleString("en-US")}
- With conditions: ${withCond.toLocaleString("en-US")}

Oahu is decided from ZIP, city, and county. VA's county field alone is unreliable.

${DEDUPE_NOTE}

${zipSection}
A missing project may still be on VA's list.

VA approval status does not guarantee loan approval.

Jay Miller, NMLS #657301 | CMG Home Loans branch NMLS #2475890 | CMG Mortgage, Inc. NMLS #1820 | Equal Housing Opportunity.
`;
writeFileSync(path.join(OUT_DIR, "README.md"), readme);

console.log(`Wrote ${records.length} records (${without} without / ${withCond} with), last_checked ${meta.last_checked}, ` +
  `json ${Buffer.byteLength(json)} B, csv ${Buffer.byteLength(csv)} B, readme ${Buffer.byteLength(readme)} B`);
