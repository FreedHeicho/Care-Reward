import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { auditLogs } from "@workspace/db/schema";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userRole: string;
    }
  }
}

interface JwtPayload {
  userId: string;
  role: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    req.userRole = payload.role;

    // Fire-and-forget audit log
    db.insert(auditLogs)
      .values({
        userId: payload.userId,
        action: `${req.method} ${req.path}`,
        resourceType: "api",
        ipAddress: String(req.ip ?? ""),
        outcome: "SUCCESS",
      })
      .catch(() => {});

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Your session has expired" });
      return;
    }
    res.status(401).json({ error: "Invalid token" });
  }
}

export function generateToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  const accessToken = jwt.sign({ userId, role }, secret, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId, role }, secret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}
