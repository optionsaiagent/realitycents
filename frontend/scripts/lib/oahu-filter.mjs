/**
 * Decide whether a raw VA condo record is on Oahu.
 *
 * VA's county field is unreliable, so ZIP, city, and county each vote
 * "O" (Oahu), "N" (neighbor island), or null (unknown). Majority wins.
 * On a tie the city signal decides when it is not null; otherwise the ZIP
 * signal decides. A null ZIP on a tie is not Oahu.
 *
 * rec fields: zipCode, city, county (raw VA values).
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
