import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user || authReq.user.role !== "admin") {
    // Return 404 Not Found to prevent confirming admin route existence to unauthorized callers
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
}
