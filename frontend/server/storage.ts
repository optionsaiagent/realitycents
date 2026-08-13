// Database-backed file storage. Replaces the Manus Forge storage proxy.
// Files (agent logos, branded toolkit PDFs) live in the `stored_files` table
// and are served by GET /files/:key on this server — no external dependency.

import { getStoredFile, putStoredFile } from "./db";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export function publicFileUrl(relKey: string): string {
  const key = normalizeKey(relKey);
  const base = ENV.publicApiUrl.replace(/\/+$/, "");
  return `${base}/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const buffer =
    typeof data === "string" ? Buffer.from(data) : Buffer.isBuffer(data) ? data : Buffer.from(data);
  await putStoredFile(key, contentType, buffer);
  return { key, url: publicFileUrl(key) };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: publicFileUrl(key) };
}
