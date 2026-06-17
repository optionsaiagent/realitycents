/**
 * DSCR Router — RentCast API integration for rent estimates
 * Provides rent AVM data for the DSCR Investment Property Analyzer page.
 */
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { upsertAgentLead } from "./db";

// ─── In-Memory Cache (24-hour TTL) ──────────────────────────────────────────
interface CacheEntry {
  data: RentEstimateResponse;
  expiresAt: number;
}

const rentCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): RentEstimateResponse | null {
  const entry = rentCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    rentCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: RentEstimateResponse): void {
  rentCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface RentComparable {
  formattedAddress: string;
  rent: number;
  distance: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
}

interface RentEstimateResponse {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  comps: RentComparable[];
}

// ─── Router ──────────────────────────────────────────────────────────────────
export const dscrRouter = router({
  logAccess: publicProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email() }))
    .mutation(async ({ input }) => {
      console.log(`[DSCR Access] ${input.name} (${input.email}) unlocked the calculator`);
      // Persist lead to database (upsert by email)
      try {
        await upsertAgentLead(input.name, input.email);
      } catch (err) {
        // Non-fatal: log but don't fail the mutation
        console.error("[DSCR Access] Failed to persist lead:", err);
      }
      return { success: true };
    }),

  // Health check — lets the frontend know if rent estimates are available
  getStatus: publicProcedure.query(() => {
    const hasKey = !!process.env.RENTCAST_API_KEY;
    return { rentEstimatesAvailable: hasKey };
  }),

  getRentEstimate: publicProcedure
    .input(z.object({ address: z.string().min(5).max(500) }))
    .query(async ({ input }) => {
      const apiKey = process.env.RENTCAST_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Rent estimate service unavailable — enter rent manually",
        });
      }

      // Normalize address for cache key
      const cacheKey = input.address.trim().toLowerCase();
      const cached = getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // Call RentCast API
      const encodedAddress = encodeURIComponent(input.address.trim());
      const url = `https://api.rentcast.io/v1/avm/rent/long-term?address=${encodedAddress}`;

      let response: Response;
      try {
        response = await fetch(url, {
          method: "GET",
          headers: {
            "X-Api-Key": apiKey,
            Accept: "application/json",
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect to rent estimate service",
        });
      }

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No rent estimate available for this address. Try a nearby address or enter rent manually.",
          });
        }
        if (status === 429) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Rent estimate service rate limit reached. Please try again later or enter rent manually.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Rent estimate service returned an error (${status}). Enter rent manually.`,
        });
      }

      const raw = await response.json();

      // Parse RentCast response
      const result: RentEstimateResponse = {
        rent: raw.rent ?? raw.rentEstimate ?? 0,
        rentRangeLow: raw.rentRangeLow ?? raw.rent_range_low ?? 0,
        rentRangeHigh: raw.rentRangeHigh ?? raw.rent_range_high ?? 0,
        comps: Array.isArray(raw.comparables)
          ? raw.comparables.slice(0, 5).map((c: any) => ({
              formattedAddress: c.formattedAddress || c.address || "N/A",
              rent: c.rent || c.price || 0,
              distance: c.distance ?? 0,
              bedrooms: c.bedrooms ?? 0,
              bathrooms: c.bathrooms ?? 0,
              squareFootage: c.squareFootage ?? null,
            }))
          : [],
      };

      // Cache the result
      setCache(cacheKey, result);

      return result;
    }),
});
