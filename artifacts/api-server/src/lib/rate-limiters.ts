import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// General limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

import type { Request } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";

// Strict AI user limiter: 10 requests per hour per user (or IP if unauth)
const aiUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI analysis rate limit reached. Please wait before analyzing again." },
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.id) {
      return `user_${authReq.user.id}`;
    }
    return ipKeyGenerator(req.ip || req.socket.remoteAddress || "unknown_ip");
  },
});

// Secondary AI IP limiter: 30 requests per hour per IP backstop
const aiIPLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI analysis requests from this IP. Please try again later." },
});

export const aiLimiter = [aiIPLimiter, aiUserLimiter];

// Auth limiter: 20 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth requests, please slow down." },
});

// Roast limiter: 3 requests per hour per IP
export const roastLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Roast rate limit exceeded. Max 5 roasts per hour per IP." },
});

// Badge SVG limiter: 60 requests per 15 minutes per IP
export const badgeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many badge requests." },
});

// Public scorecard limiter: 100 requests per 15 minutes per IP
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many public profile requests." },
});

// OG image limiter: 60 requests per 15 minutes per IP
export const ogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OG image requests." },
});

// Compare endpoint limiter: 60 requests per 15 minutes per IP
export const compareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many compare requests." },
});

// Admin routes limiter: 200 requests per 15 minutes per IP
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests." },
});

// Feedback limiter: 20 requests per hour per IP
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many feedback submissions. Please try again later." },
});
