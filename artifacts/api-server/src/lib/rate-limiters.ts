import rateLimit from "express-rate-limit";

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
    return req.ip || req.socket.remoteAddress || "unknown_ip";
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
