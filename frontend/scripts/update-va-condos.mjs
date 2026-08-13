#!/usr/bin/env node
/**
 * Refresh frontend/client/src/data/va-approved-condos-oahu.json from the
 * VA LGY Hub API. Run from the frontend/ directory:
 *
 *   node scripts/update-va-condos.mjs
 *
 * The VA data is dirty (misspelled counties like "HONOULU"/"HOPNOLULU",
 * cities like "KANEOHE, OAHU"), so Oahu membership is decided by:
 *   1. county starting with "HON", or county OAHU/WAIPAHU (all typos for
 *      Honolulu County observed in the data), else
 *   2. the city string containing "OAHU", else
 *   3. the base city (before any comma) being a known Oahu town.
 *
 * Neighborhoods are assigned by zip code using the mapping already present
 * in the current data file (zip → neighborhood is unique); unseen zips fall
 * back to the title-cased city name.
 *
 * Safety: aborts without writing if the fetched count is outside sane
 * bounds, so a broken API response can never wipe the page.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATA_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../client/src/data/va-approved-condos-oahu.json"
);
const API_URL = "https://lgy.va.gov/lgyhub/api/condos/search?stateCode=HI";

const OAHU_TOWNS = new Set([
  "AIEA", "EWA", "EWA BEACH", "EWA BAECH", "HALEIWA", "HALAWA", "HAUULA", "HAUUL",
  "HONOLULU", "KAAAWA", "KAHUKU", "KAILUA", "KALIHI", "KANEOHE", "HANEOHE",
  "KAPOLEI", "LAIE", "MAKAHA", "MAKAKILO", "MAKIKI", "MILILANI", "MILIANI",
  "MILILANI TOWN", "MOKULEIA", "NANAKULI", "PEARL CITY", "WAHIAWA", "WAIHAWA",
  "WAIALUA", "WAIANAE", "WAIAINAE", "WAIAU", "WAIKELE", "WAIMANALO",
  "WAIPAHU", "WAIPHAHU", "WAIPIO",
]);

function isOahu(rec) {
  const county = (rec.county ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (county.startsWith("HON") || county === "OAHU" || county === "WAIPAHU") return true;
  if (county) return false; // a real non-Honolulu county (MAUI, KAUAI, HAWAII…)
  const city = (rec.city ?? "").toUpperCase();
  if (city.includes("OAHU")) return true;
  const base = city.split(",")[0].trim();
  return OAHU_TOWNS.has(base);
}

const toIsoDate = ms => (ms ? new Date(ms).toISOString().slice(0, 10) : null);
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

// ── Filter + map ───────────────────────────────────────────────────────────
const current = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const zipToNeighborhood = new Map(current.condos.map(c => [c.zipCode, c.neighborhood]));

const accepted = all.filter(
  r => isOahu(r) && (r.dispositionCode ?? "").startsWith("Accepted")
);
if (accepted.length < 1500 || accepted.length > 2200) {
  console.error(`Sanity check failed: ${accepted.length} accepted Oahu condos (expected 1500–2200) — aborting.`);
  process.exit(1);
}

const condos = accepted
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
  lastUpdated: new Date().toISOString().slice(0, 10),
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
