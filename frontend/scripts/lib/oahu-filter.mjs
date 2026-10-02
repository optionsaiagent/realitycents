/**
 * Shared VA condo-list helpers.
 *
 * Copied verbatim into another repo. Keep this module self-contained ESM:
 * no local imports and no Node built-ins.
 *
 * classifyOahu / isOahu — whether a raw VA condo record is on Oahu.
 * VA's county field is unreliable, so ZIP, city, and county each vote
 * "O" (Oahu), "N" (neighbor island), or null (unknown). Majority wins.
 * On a tie the city signal decides when it is not null; otherwise the ZIP
 * signal decides. A null ZIP on a tie is not Oahu.
 * rec fields: zipCode, city, county (raw VA values).
 *
 * ZIP_OVERRIDES / correctZip — replace a wrong VA ZIP only while the
 * record's 5-digit ZIP still equals that entry's listed ZIP. Once VA
 * fixes the record, the override is a no-op.
 *
 * dedupeByVaId — one record per VA ID. The latest review date wins; when
 * the dates tie or are missing, the higher record id wins.
 */

const OAHU_ZIPS = new Set([
  "96701", "96706", "96707", "96709", "96712", "96717", "96730", "96731",
  "96734", "96744", "96759", "96762", "96782", "96786", "96789", "96791",
  "96792", "96795", "96797",
]);

// Known Oahu towns, including VA misspellings already in the list.
const OAHU_TOWNS = new Set([
  "AIEA", "EWA", "EWA BEACH", "EWA BAECH", "HALEIWA", "HALAWA", "HAUULA", "HAUUL",
  "HONOLULU", "KAAAWA", "KAHUKU", "KAILUA", "KALIHI", "KANEOHE", "HANEOHE",
  "KAPOLEI", "LAIE", "MAKAHA", "MAKAKILO", "MAKIKI", "MILILANI", "MILIANI",
  "MILILANI TOWN", "MOKULEIA", "NANAKULI", "PEARL CITY", "WAHIAWA", "WAIHAWA",
  "WAIALUA", "WAIANAE", "WAIAINAE", "WAIAU", "WAIKELE", "WAIMANALO",
  "WAIPAHU", "WAIPHAHU", "WAIPIO",
  "HONOLULLU", "WAILUA", "KAHALUU", "KUNIA", "ROYAL KUNIA", "HAWAII KAI",
  "WAIKIKI", "OCEAN POINTE", "KALAELOA", "WAIMALU", "MANOA", "SALT LAKE",
]);

const NEIGHBOR_TOWNS = new Set([
  "KAILUA-KONA", "KAILUA KONA", "KONA", "N KONA", "NORTH KONA", "KIHEI",
  "WAILUKU", "LAHAINA", "KAHULUI", "MAKAWAO", "HAIKU", "KULA", "PAIA",
  "PUKALANI", "WAILEA", "NAPILI", "KAANAPALI", "KAHANA", "HONOKOWAI",
  "MAALAEA", "KAHAKULOA", "HANA", "KAPAA", "LIHUE", "LEHUE", "KALAHEO",
  "KOLOA", "PRINCEVILLE", "KILAUEA", "KEKAHA", "LAWAI", "PUHI", "HANAPEPE",
  "NIUMALU", "HANAMAULU", "KALIHIWAI", "POIPU", "WAIMEA", "HILO", "N HILO",
  "WAIKOLOA", "KAMUELA", "CAPTAIN COOK", "HOLUALOA", "HAWI", "N KOHALA",
  "N. KOHALA", "S KOHALA", "MAUNA LANI", "PAPAIKOU", "KEALAKEKUA", "KEAUHOU",
  "KEAAU", "KEEAU", "KURTISTOWN", "HONOKAA", "LAUPAHOEHOE", "PAPAALOA", "PUNA",
  "PAHOA", "VOLCANO", "OCEAN VIEW", "NAALEHU", "HAMAKUA", "KAUNAKAKAI",
  "MAUNALOA", "LANAI CITY",
]);

const NEIGHBOR_CITY_RE = /MAUI|KAUAI|KAUA.I|KONA|KOHALA|MOLOKAI|LANAI|BIG ISLAND/;
const HAWAII_SUFFIX_RE = /,\s*HAWAII\b/;

function zipSignal(zipCode) {
  const zip = String(zipCode ?? "").replace(/\D/g, "").slice(0, 5);
  if (!/^\d{5}$/.test(zip)) return null;
  if (OAHU_ZIPS.has(zip)) return "O";
  if (/^968\d{2}$/.test(zip)) {
    const n = Number(zip);
    return n >= 96801 && n <= 96898 ? "O" : null;
  }
  if (/^967\d{2}$/.test(zip)) return "N";
  return null;
}

function baseCity(city) {
  const cut = city.search(/[,(]/);
  return (cut === -1 ? city : city.slice(0, cut)).trim();
}

function citySignal(city) {
  const text = String(city ?? "").toUpperCase().trim();
  if (!text) return null;
  if (text.includes("OAHU") || text.includes("OHAU")) return "O";
  if (NEIGHBOR_CITY_RE.test(text) || HAWAII_SUFFIX_RE.test(text)) return "N";
  const base = baseCity(text);
  if (OAHU_TOWNS.has(base)) return "O";
  if (NEIGHBOR_TOWNS.has(base)) return "N";
  return null;
}

function countySignal(county) {
  const letters = String(county ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return null;
  if (
    letters.startsWith("HON") ||
    (letters.startsWith("HO") && letters.endsWith("LULU")) ||
    letters === "OAHU" ||
    letters === "WAIPAHU"
  ) {
    return "O";
  }
  return "N";
}

export function classifyOahu(rec) {
  const signals = {
    zip: zipSignal(rec?.zipCode),
    city: citySignal(rec?.city),
    county: countySignal(rec?.county),
  };
  const votes = [signals.zip, signals.city, signals.county];
  const o = votes.filter(v => v === "O").length;
  const n = votes.filter(v => v === "N").length;
  let oahu;
  if (o !== n) oahu = o > n;
  else if (signals.city != null) oahu = signals.city === "O";
  else if (signals.zip != null) oahu = signals.zip === "O";
  else oahu = false;
  return { oahu, signals };
}

export function isOahu(rec) {
  return classifyOahu(rec).oahu;
}

/**
 * Explicit ZIP fixes keyed by VA condo ID (developmentBusinessId / va_id).
 * Each street below was checked against its city; all of them are on Oahu.
 * correctZip() applies an entry only while the record's 5-digit ZIP still
 * equals `listed`, so a VA fix turns the override into a no-op.
 */
export const ZIP_OVERRIDES = {
  // MOANA KAI, Hawaii Kai Drive, Honolulu. 96732 is Kahului, Maui.
  // Hawaii Kai Drive is in 96825 (East Honolulu).
  "000991": {
    listed: "96732",
    corrected: "96825",
    reason: "Hawaii Kai Drive, Honolulu is 96825 (East Honolulu), not 96732 (Kahului, Maui).",
  },
  // 267 Akiohala Street, Enchanted Lake, Kailua. VA misspells it AIKOHALA.
  // 96737 is Ocean View, Big Island. 267 Akiohala St is Kailua 96734.
  "001082": {
    listed: "96737",
    corrected: "96734",
    reason: "267 Akiohala St (VA spelling: AIKOHALA) is Enchanted Lake, Kailua 96734, not 96737 (Ocean View, Big Island).",
  },
  // 285 Kihapai Street, Kailua, Oahu. 96737 is Ocean View, Big Island.
  // Kihapai St in Enchanted Lake is Kailua 96734.
  "000442": {
    listed: "96737",
    corrected: "96734",
    reason: "285 Kihapai St is Enchanted Lake, Kailua 96734, not 96737 (Ocean View, Big Island).",
  },
  // PUKAPUKA WALE, 646 Kaha St and 814 Kaipii St, Kailua.
  // 96673 is not a valid ZIP. Both streets are in Kailua 96734.
  "001929": {
    listed: "96673",
    corrected: "96734",
    reason: "646 Kaha St and 814 Kaipii St are in Kailua 96734; 96673 is not a valid ZIP.",
  },
  // WAIMALU PARK, 98-310 Kamehameha Hwy, Aiea.
  // 69701 is a digit transposition of Aiea's 96701.
  "000017": {
    listed: "69701",
    corrected: "96701",
    reason: "98-310 Kam Hwy, Aiea is 96701; 69701 is a digit transposition.",
  },
  // 1301 California Avenue, Wahiawa.
  // 96876 is a digit transposition of Wahiawa's 96786.
  "002425": {
    listed: "96876",
    corrected: "96786",
    reason: "1301 California Avenue, Wahiawa is 96786; 96876 is a digit transposition.",
  },
  // MAKAHA VALLEY COTTAGES, 84-686 Farrington Hwy, Waianae.
  // 96892 is a digit transposition of Waianae's 96792.
  "001408": {
    listed: "96892",
    corrected: "96792",
    reason: "84-686 Farrington Hwy, Waianae is 96792; 96892 is a digit transposition.",
  },
};

function fiveDigitZip(zip) {
  return String(zip ?? "").replace(/\D/g, "").slice(0, 5);
}

/**
 * Return the corrected 5-digit ZIP only when vaId is in ZIP_OVERRIDES and
 * the record's 5-digit ZIP equals that entry's listed ZIP. Otherwise return
 * zip unchanged.
 */
export function correctZip(vaId, zip) {
  const entry = ZIP_OVERRIDES[String(vaId ?? "").trim()];
  if (!entry) return zip;
  if (fiveDigitZip(zip) !== entry.listed) return zip;
  return entry.corrected;
}

function reviewTime(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) {
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : parsed;
}

// Strictly greater. Equal ids keep the incumbent.
function recordIdGreater(candidateId, incumbentId) {
  const asNumber = v => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const text = String(v ?? "").trim();
    if (/^\d+$/.test(text)) {
      const n = Number(text);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };
  const a = asNumber(candidateId);
  const b = asNumber(incumbentId);
  if (a != null && b != null) return a > b;
  return String(candidateId ?? "").localeCompare(String(incumbentId ?? "")) > 0;
}

function prefer(incumbent, candidate, getReviewDate, getRecordId) {
  const ti = reviewTime(getReviewDate(incumbent));
  const tc = reviewTime(getReviewDate(candidate));
  if (tc !== ti) {
    if (tc == null) return incumbent;
    if (ti == null) return candidate;
    return tc > ti ? candidate : incumbent;
  }
  return recordIdGreater(getRecordId(candidate), getRecordId(incumbent))
    ? candidate
    : incumbent;
}

/**
 * Keep one record per VA ID.
 * Latest review date wins. When the dates tie or both are missing, the
 * higher record id wins. A present review date beats a missing one.
 * Blank VA IDs are not grouped (they are not the same project).
 *
 * Returns { kept, dropped }. Each dropped entry is
 * { vaId, kept, dropped } — the surviving record and the removed record.
 * `kept` preserves the input order of survivors.
 */
export function dedupeByVaId(records, getVaId, getReviewDate, getRecordId) {
  const groups = new Map();
  records.forEach((rec, index) => {
    const vaId = String(getVaId(rec) ?? "").trim();
    if (!vaId) return;
    if (!groups.has(vaId)) groups.set(vaId, []);
    groups.get(vaId).push(index);
  });

  const dropIdx = new Set();
  const dropped = [];
  for (const [vaId, idxs] of groups) {
    if (idxs.length < 2) continue;
    let win = idxs[0];
    for (const index of idxs.slice(1)) {
      const winner = prefer(records[win], records[index], getReviewDate, getRecordId);
      if (winner === records[index]) win = index;
    }
    for (const index of idxs) {
      if (index === win) continue;
      dropIdx.add(index);
      dropped.push({ vaId, kept: records[win], dropped: records[index] });
    }
  }

  return {
    kept: records.filter((_, index) => !dropIdx.has(index)),
    dropped,
  };
}
