/**
 * Local session + magic-link auth. Replaces the Manus OAuth SDK.
 *
 * Sessions are HS256 JWTs (signed with JWT_SECRET) stored in the same cookie
 * the old flow used, so existing deploy config carries over unchanged.
 *
 * Admin login: POST /api/auth/request-link emails a 15-minute signed link
 * (via Resend) to an allowlisted address; GET /api/auth/verify sets the
 * session cookie and redirects to /admin.
 */
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sendAdminLoginEmail } from "../email";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const LOGIN_LINK_TTL_MS = 15 * 60 * 1000;

const secretKey = () => {
  if (!ENV.cookieSecret) {
    // Refuse to sign or verify anything with an empty key — sessions would be forgeable.
    throw new Error("JWT_SECRET is not set; auth is disabled until it is configured");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function signSession(
  payload: { openId: string; name: string },
  expiresInMs = ONE_YEAR_MS
): Promise<string> {
  return new SignJWT({ openId: payload.openId, appId: "realitycents", name: payload.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + expiresInMs) / 1000))
    .sign(secretKey());
}

export async function getUserFromRequest(req: Request): Promise<User | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  try {
    const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const { openId } = payload as Record<string, unknown>;
    if (!isNonEmptyString(openId)) return null;
    return (await db.getUserByOpenId(openId)) ?? null;
  } catch {
    return null;
  }
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/request-link", async (req: Request, res: Response) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    // Always answer success so the endpoint can't be used to probe the allowlist.
    res.json({ ok: true });
    if (!email || !adminEmails().includes(email)) return;

    try {
      const token = await new SignJWT({ purpose: "admin-login", email })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime(Math.floor((Date.now() + LOGIN_LINK_TTL_MS) / 1000))
        .sign(secretKey());
      const base = `${req.protocol}://${req.get("host")}`;
      await sendAdminLoginEmail({
        to: email,
        loginUrl: `${base}/api/auth/verify?token=${encodeURIComponent(token)}`,
      });
    } catch (error) {
      console.error("[Auth] Failed to send login link", error);
    }
  });

  app.get("/api/auth/verify", async (req: Request, res: Response) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    try {
      const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
      const email = payload.email;
      if (payload.purpose !== "admin-login" || !isNonEmptyString(email) || !adminEmails().includes(email)) {
        res.status(403).send("Invalid or expired login link.");
        return;
      }

      const openId = `admin:${email}`;
      await db.upsertAdminUser({ openId, email, name: "Admin" });

      const sessionToken = await signSession({ openId, name: "Admin" });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, `${process.env.FRONTEND_URL || ""}/admin`);
    } catch {
      res.status(403).send("Invalid or expired login link.");
    }
  });
}
