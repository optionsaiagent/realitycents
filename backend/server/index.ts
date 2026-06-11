import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";

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
