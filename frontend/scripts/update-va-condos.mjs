#!/usr/bin/env node
/**
 * Refresh frontend/client/src/data/va-approved-condos-oahu.json from the
 * VA LGY Hub API, then regenerate the public JSON, CSV, and README.
 * Run from the frontend/ directory:
 *
 *   node scripts/update-va-condos.mjs
 *
 * VA's county field is unreliable (Honolulu typos, Oahu projects tagged
 * HAWAII or left blank, and at least one Maui project tagged HONOLULU).
 * Oahu membership is classifyOahu() in scripts/lib/oahu-filter.mjs: ZIP,
 * city, and county each vote "O" (Oahu), "N" (neighbor island), or null.
 * Majority wins. On a tie the city signal decides when it is not null;
 * otherwise the ZIP signal decides (a null ZIP is not Oahu).
 *
 * Before that vote, correctZip() applies ZIP_OVERRIDES. An override
 * changes the ZIP only while the record's 5-digit ZIP still equals the
 * listed (wrong) value, and the corrected ZIP is what classifyOahu sees
 * and what is written. After the Oahu filter, dedupeByVaId() keeps one
 * record per VA ID: latest review date, then the higher record id.
 *
 * Neighborhoods are assigned by zip code using the mapping already present
 * in the current data file (zip → neighborhood is unique); unseen zips fall
 * back to the title-cased city name.
 *
 * Safety: aborts without writing if the fetched count is outside sane
 * bounds, so a broken API response can never wipe the page.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { classifyOahu, isOahu, correctZip, dedupeByVaId } from "./lib/oahu-filter.mjs";

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const FRONTEND_DIR = path.resolve(SCRIPT_DIR, "..");
const DATA_PATH = path.resolve(FRONTEND_DIR, "client/src/data/va-approved-condos-oahu.json");
const API_URL = "https://lgy.va.gov/lgyhub/api/condos/search?stateCode=HI";

// VA timestamps are UTC-midnight values, so plain toISOString() is the right
// read for them. The lastUpdated stamp is ours, and the page is for Hawaii
// buyers — format that one in Pacific/Honolulu so a late-afternoon run doesn't
// label the data with tomorrow's date.
const toIsoDate = ms => (ms ? new Date(ms).toISOString().slice(0, 10) : null);
const hawaiiToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Honolulu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const titleCase = s =>
  s.toLowerCase().replace(/\b[a-z]/g, ch => ch.toUpperCase());

// ── Fetch ──────────────────────────────────────────────────────────────────
const res = await fetch(API_URL, { headers: { accept: "application/json" } });
if (!res.ok) {
  console.error(`API returned ${res.status} — aborting, data file untouched.`);
  process.exit(1);
}
const all = await res.json();
if (!Array.isArray(all) || all.length < 2000) {
  console.error(`Unexpected API payload (${Array.isArray(all) ? all.length : typeof all} records) — aborting.`);
  process.exit(1);
}

// ── Correct ZIPs, then filter + map ───────────────────────────────────────
// correctZip runs before classifyOahu so the Oahu vote and the written
// zipCode (and its neighborhood lookup) all use the corrected ZIP.
const current = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const zipToNeighborhood = new Map(current.condos.map(c => [c.zipCode, c.neighborhood]));

const overrideLogs = [];
const correctedAll = all.map(r => {
  const listed = r.zipCode;
  const corrected = correctZip(r.developmentBusinessId, listed);
  if (corrected === listed) return r;
  const listedFive = String(listed ?? "").replace(/\D/g, "").slice(0, 5);
  overrideLogs.push({
    id: String(r.developmentBusinessId ?? ""),
    name: r.firstLineName ?? "",
    from: listedFive || String(listed ?? ""),
    to: corrected,
  });
  return { ...r, zipCode: corrected };
});
overrideLogs.sort((a, b) => a.id.localeCompare(b.id));
for (const o of overrideLogs) {
  console.log(`ZIP override: ${o.id} | ${o.name} | ${o.from} -> ${o.to}`);
}

const accepted = correctedAll.filter(
  r => isOahu(r) && (r.dispositionCode ?? "").startsWith("Accepted")
);
if (accepted.length < 1500 || accepted.length > 2200) {
  console.error(`Sanity check failed: ${accepted.length} accepted Oahu condos (expected 1500–2200) — aborting.`);
  process.exit(1);
}

const { kept: deduped, dropped } = dedupeByVaId(
  accepted,
  r => r.developmentBusinessId ?? "",
  r => r.reviewCompletedDate,
  r => r.id,
);
dropped.sort((a, b) => a.vaId.localeCompare(b.vaId) || String(a.dropped?.id ?? "").localeCompare(String(b.dropped?.id ?? "")));
for (const d of dropped) {
  const name = d.dropped.firstLineName ?? d.kept.firstLineName ?? "";
  console.log(`Dropped duplicate: ${d.vaId} | ${name} | kept ${d.kept.id} | dropped ${d.dropped.id}`);
}

const condos = deduped
  .map(r => {
    const zip = (r.zipCode ?? "").slice(0, 5);
    const baseCity = titleCase((r.city ?? "").split(",")[0].trim());
    // Coerce null text fields to "" — the page's search/filter code and
    // consumers expect strings everywhere.
    return {
      id: r.id,
      vaId: r.developmentBusinessId ?? "",
      name: r.firstLineName ?? "",
      address: r.secondLineName ?? "",
      city: (r.city ?? "").toUpperCase(),
      state: r.state,
      zipCode: zip,
      county: "HONOLULU",
      status: r.dispositionCode,
      reviewDate: toIsoDate(r.reviewCompletedDate),
      approvalRequestDate: toIsoDate(r.approvalRequestRecievedDate),
      neighborhood: zipToNeighborhood.get(zip) ?? baseCity ?? "Other Oahu",
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const without = condos.filter(c => c.status === "Accepted Without Conditions").length;
const withCond = condos.filter(c => c.status === "Accepted With Conditions").length;

const out = {
  lastUpdated: hawaiiToday(),
  source: current.source,
  county: "HONOLULU",
  state: "HI",
  totalApproved: condos.length,
  withoutConditions: without,
  withConditions: withCond,
  neighborhoods: [...new Set(condos.map(c => c.neighborhood))].sort(),
  condos,
};

const prevIds = new Set(current.condos.map(c => c.id));
const newIds = condos.filter(c => !prevIds.has(c.id)).length;
const removed = current.condos.filter(c => !condos.some(n => n.id === c.id)).length;

writeFileSync(DATA_PATH, JSON.stringify(out, null, 2) + "\n");
console.log(
  `Updated: ${condos.length} approved (${without} without / ${withCond} with conditions); ` +
  `+${newIds} new, -${removed} removed vs previous file (was ${current.totalApproved} on ${current.lastUpdated}).`
);

// Accepted projects whose county vote contradicts the island decision.
// Printed on every refresh so a later commit log shows the overrides
// (Oahu projects VA tagged HAWAII, and neighbor-island projects VA tagged HONOLULU).
const disagreements = correctedAll
  .filter(r => (r.dispositionCode ?? "").startsWith("Accepted"))
  .map(r => ({ r, cls: classifyOahu(r) }))
  .filter(({ cls }) =>
    (cls.signals.county === "O" && !cls.oahu) ||
    (cls.signals.county === "N" && cls.oahu)
  )
  .sort((a, b) =>
    String(a.r.developmentBusinessId ?? "").localeCompare(String(b.r.developmentBusinessId ?? ""))
  );
console.log(`County signal disagreed with final decision (${disagreements.length} accepted projects):`);
for (const { r, cls } of disagreements) {
  const zip = String(r.zipCode ?? "").trim().slice(0, 5);
  const decision = cls.oahu ? "Oahu" : "not Oahu";
  console.log(
    `${r.developmentBusinessId ?? ""} | ${r.firstLineName ?? ""} | ${r.city ?? ""} | ${zip} | ${r.county ?? ""} | ${decision}`
  );
}

execFileSync(process.execPath, ["scripts/build-va-condo-data.mjs"], {
  cwd: FRONTEND_DIR,
  stdio: "inherit",
});
