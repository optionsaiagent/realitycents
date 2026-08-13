#!/usr/bin/env node
/**
 * One-time migration: copy files hosted on the Manus Forge CDN into the
 * stored_files table and repoint DB URLs at this backend's /files/ route.
 *
 * Idempotent — skips rows whose URL already points at API_PUBLIC_URL.
 *
 * Usage:
 *   DATABASE_URL=mysql://... API_PUBLIC_URL=https://<railway-domain> node scripts/migrate-forge-files.mjs
 */
import mysql from "mysql2/promise";

const { DATABASE_URL, API_PUBLIC_URL } = process.env;
if (!DATABASE_URL || !API_PUBLIC_URL) {
  console.error("Set DATABASE_URL and API_PUBLIC_URL");
  process.exit(1);
}
const base = API_PUBLIC_URL.replace(/\/+$/, "");

const url = new URL(DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  // Railway's MySQL endpoints use self-signed certs (internal DNS has no TLS,
  // the public proxy is TLS with an unverifiable chain) — skip CA validation.
  ssl: url.hostname.includes("railway.internal") ? undefined : { rejectUnauthorized: false },
});

async function storeFromUrl(sourceUrl, fileKey, fallbackMime) {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`fetch ${sourceUrl} → ${res.status}`);
  const mime = res.headers.get("content-type")?.split(";")[0] || fallbackMime;
  const data = Buffer.from(await res.arrayBuffer());
  await conn.query(
    "INSERT INTO stored_files (fileKey, mimeType, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE mimeType = VALUES(mimeType), data = VALUES(data)",
    [fileKey, mime, data]
  );
  return `${base}/files/${fileKey.split("/").map(encodeURIComponent).join("/")}`;
}

let migrated = 0, skipped = 0, failed = 0;

const [resources] = await conn.query("SELECT id, title, fileUrl FROM toolkit_resources");
for (const r of resources) {
  if (!r.fileUrl?.startsWith("http") || r.fileUrl.startsWith(base)) { skipped++; continue; }
  try {
    const ext = new URL(r.fileUrl).pathname.split(".").pop()?.toLowerCase() || "pdf";
    const newUrl = await storeFromUrl(r.fileUrl, `toolkit-resources/${r.id}.${ext}`, "application/pdf");
    await conn.query("UPDATE toolkit_resources SET fileUrl = ? WHERE id = ?", [newUrl, r.id]);
    console.log(`resource ${r.id} (${r.title}): migrated`);
    migrated++;
  } catch (e) {
    console.error(`resource ${r.id} (${r.title}): FAILED — ${e.message}`);
    failed++;
  }
}

const [agents] = await conn.query("SELECT id, name, logoUrl FROM toolkit_agents WHERE logoUrl IS NOT NULL");
for (const a of agents) {
  if (!a.logoUrl?.startsWith("http") || a.logoUrl.startsWith(base)) { skipped++; continue; }
  try {
    const ext = new URL(a.logoUrl).pathname.split(".").pop()?.toLowerCase() || "png";
    const newUrl = await storeFromUrl(a.logoUrl, `toolkit-logos/agent-${a.id}.${ext}`, "image/png");
    await conn.query("UPDATE toolkit_agents SET logoUrl = ? WHERE id = ?", [newUrl, a.id]);
    console.log(`agent ${a.id} (${a.name}): logo migrated`);
    migrated++;
  } catch (e) {
    console.error(`agent ${a.id} (${a.name}): FAILED — ${e.message}`);
    failed++;
  }
}

await conn.end();
console.log(`\nDone. ${migrated} migrated, ${skipped} already local/skipped, ${failed} failed.`);
process.exit(failed ? 1 : 0);
