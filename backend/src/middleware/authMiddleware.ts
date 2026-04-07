import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  if (!token) {
    res.status(401).json({ message: "Authorization token missing" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT secret is not configured" });
    return;
  }

  try {
    const decoded = verifyToken(token) as Express.UserPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "invalid_token", message: "Invalid or expired token" });
  }
};
