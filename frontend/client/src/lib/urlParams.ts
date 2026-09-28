/**
 * Numeric query-param reader.
 * Returns `fallback` only when the param is absent, blank, or not a finite number.
 * Zero and other falsy numbers are kept — `Number(x) || fallback` is not safe for those.
 */
export function numParam(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Same rule for a decoded share-payload field (not a query string).
 * Null, undefined, and blank strings fall back. 0 and "0" are kept.
 */
export function presentOr<T>(value: T | null | undefined, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return value;
}
