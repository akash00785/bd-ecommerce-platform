import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// -----------------------------------------------------------------------
// HTTP Security Headers (Helmet)
// Sets X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy,
// X-Permitted-Cross-Domain-Policies, and more.
// -----------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP is handled at CDN/nginx level for the SPA
    crossOriginEmbedderPolicy: false, // Allow embedding of product images from external CDNs
  }),
);

// -----------------------------------------------------------------------
// Restrict CORS to trusted origins only.
// Set ALLOWED_ORIGINS env var to a comma-separated list of allowed origins.
// Example: ALLOWED_ORIGINS=https://myshop.com,https://admin.myshop.com
// -----------------------------------------------------------------------

const rawOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// In development, also allow localhost variants automatically
if (process.env.NODE_ENV !== "production") {
  if (!allowedOrigins.some((o) => o.includes("localhost"))) {
    allowedOrigins.push("http://localhost:3000", "http://localhost:5173", "http://localhost:80");
  }
  // Allow the specific Replit dev domain for this project only
  if (process.env.REPLIT_DEV_DOMAIN) {
    allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }
}

const corsOptions: cors.CorsOptions = {
  origin(requestOrigin, callback) {
    // Allow same-origin / server-to-server (no Origin header)
    if (!requestOrigin) return callback(null, true);

    if (
      allowedOrigins.includes(requestOrigin) ||
      // Allow *.replit.dev for dev convenience (only when in development)
      (process.env.NODE_ENV !== "production" && /^https:\/\/[a-z0-9-]+\.replit\.dev$/.test(requestOrigin)) ||
      (process.env.NODE_ENV !== "production" && /^https:\/\/[a-z0-9-]+\.repl\.co$/.test(requestOrigin))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: origin '${requestOrigin}' not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// -----------------------------------------------------------------------
// Rate Limiting
// Protect public write endpoints from spam / DoS.
// -----------------------------------------------------------------------

/** General API rate limiter: 100 requests per 15 minutes per IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

/** Strict rate limiter for write-heavy public endpoints (orders, reviews, newsletter) */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
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
app.use(cors(corsOptions));

// -----------------------------------------------------------------------
// Body size limit — 500 KB prevents oversized payload DoS attacks
// -----------------------------------------------------------------------
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true, limit: "500kb" }));

// Apply general limiter to all routes, strict limiter to public write paths
app.use("/api", generalLimiter);
app.use("/api/orders", strictLimiter);
app.use("/api/products/:id/reviews", strictLimiter);
app.use("/api/newsletter/subscribe", strictLimiter);
app.use("/api/coupons/validate", strictLimiter);

app.use("/api", router);

// -----------------------------------------------------------------------
// Global error handler — ensures consistent JSON error shape and prevents
// Express from leaking stack traces in production responses.
// -----------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any)?.status ?? (err as any)?.statusCode ?? 500;
  const rawMessage = err instanceof Error ? err.message : "Internal server error";

  if (status >= 500) {
    logger.error({ err }, "Unhandled server error");
    // In production, never expose DB internals, file paths, or stack traces.
    // Raw error messages may contain table names, column names, or query text.
    const clientMessage =
      process.env.NODE_ENV === "production" ? "Internal server error" : rawMessage;
    res.status(status).json({ error: clientMessage });
    return;
  }

  // 4xx errors are safe to return to the client as-is (they are validation /
  // auth messages deliberately crafted by route handlers).
  res.status(status).json({ error: rawMessage });
});

export default app;
