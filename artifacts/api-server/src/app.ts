import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          // Strip query strings to avoid logging sensitive params
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── CORS ─────────────────────────────────────────────────────────────────────
// FIX: Was `origin: true` (mirrors any origin). Now restricted to known origins.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:8080", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no Origin header, e.g. server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    credentials: true,
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// General limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict AI limiter: 10 requests per hour per IP (for expensive AI calls)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI analysis rate limit reached. Please wait before analyzing again." },
});

// Auth limiter: 20 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth requests, please slow down." },
});

app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

import path from "path";

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const publicDir = path.resolve(__dirname, "../../engineer-dna/dist/public");
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.resolve(publicDir, "index.html"));
    } else {
      next();
    }
  });
}

export default app;
