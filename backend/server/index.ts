import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";
import { resolveShortUrl } from "./db";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // CORS — allow the Vercel frontend to call this API
  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.some(
            (allowed) =>
              origin === allowed ||
              origin.endsWith(allowed.replace(/^https?:\/\//, "."))
          )
        ) {
          return callback(null, true);
        }
        callback(null, false);
      },
      credentials: true,
    })
  );

  // Body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Short URL redirect: /r/:code → 302 to appropriate calculator
  app.get("/r/:code", async (req, res) => {
    const { code } = req.params;
    if (!code || code.length !== 6) {
      return res.redirect(302, "https://realitycents.com/loan-compare");
    }
    try {
      const data = await resolveShortUrl(code);
      if (data) {
        if (data.startsWith("adv:")) {
          return res.redirect(302, `https://realitycents.com/advanced-calculator?${data.slice(4)}`);
        }
        return res.redirect(302, `https://realitycents.com/loan-compare?d=${data}`);
      }
    } catch (e) {
      console.error("[ShortURL] Resolve failed:", e);
    }
    return res.redirect(302, "https://realitycents.com/loan-compare");
  });

  // OAuth callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Catch-all: return 404 JSON for unknown routes
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`[RealityCents API] Server running on port ${port}`);
    console.log(`[RealityCents API] Allowed origins: ${allowedOrigins.join(", ")}`);
  });
}

startServer().catch(console.error);
