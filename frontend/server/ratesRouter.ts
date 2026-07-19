/**
 * Rates Router — Live SOFR rate from the NY Fed public API
 * Used by the HELOC Sweep Calculator to default the HELOC rate to
 * current SOFR + margin. Cached in memory for 7 days (weekly refresh).
 * Fallback: 3.631% if the NY Fed API is unavailable.
 */
import { publicProcedure, router } from "./_core/trpc";

const SOFR_FALLBACK = 3.631; // % — update periodically if the API is down long-term
const NY_FED_SOFR_URL = "https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — weekly refresh

interface SofrCache {
  rate: number;
  effectiveDate: string | null;
  source: "nyfed" | "fallback";
  fetchedAt: number;
}

let sofrCache: SofrCache | null = null;
let inflightFetch: Promise<SofrCache> | null = null;

async function fetchSofrFromNyFed(): Promise<SofrCache> {
  const res = await fetch(NY_FED_SOFR_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`NY Fed API returned ${res.status}`);
  const json = (await res.json()) as {
    refRates?: { effectiveDate?: string; type?: string; percentRate?: number }[];
  };
  const entry = json.refRates?.find((r) => r.type === "SOFR");
  const rate = entry?.percentRate;
  if (typeof rate !== "number" || !isFinite(rate) || rate <= 0 || rate > 25) {
    throw new Error("NY Fed API returned no valid SOFR rate");
  }
  return {
    rate,
    effectiveDate: entry?.effectiveDate ?? null,
    source: "nyfed",
    fetchedAt: Date.now(),
  };
}

async function getSofr(): Promise<SofrCache> {
  // Serve from cache while fresh (7-day TTL)
  if (sofrCache && Date.now() - sofrCache.fetchedAt < CACHE_TTL_MS) {
    return sofrCache;
  }
  // De-duplicate concurrent fetches
  if (!inflightFetch) {
    inflightFetch = fetchSofrFromNyFed()
      .then((fresh) => {
        sofrCache = fresh;
        console.log(
          `[Rates] SOFR refreshed from NY Fed: ${fresh.rate}% (effective ${fresh.effectiveDate})`
        );
        return fresh;
      })
      .catch((err) => {
        console.error("[Rates] NY Fed SOFR fetch failed:", err);
        // Keep serving a stale cache if we have one; otherwise fall back
        const fallback: SofrCache = sofrCache ?? {
          rate: SOFR_FALLBACK,
          effectiveDate: null,
          source: "fallback",
          fetchedAt: 0, // expired immediately so the next request retries the API
        };
        return fallback;
      })
      .finally(() => {
        inflightFetch = null;
      });
  }
  return inflightFetch;
}

export const ratesRouter = router({
  /** Current SOFR rate (%) — cached weekly from the NY Fed public API. */
  getSofr: publicProcedure.query(async () => {
    const { rate, effectiveDate, source } = await getSofr();
    return { rate, effectiveDate, source, fallbackRate: SOFR_FALLBACK };
  }),
});
