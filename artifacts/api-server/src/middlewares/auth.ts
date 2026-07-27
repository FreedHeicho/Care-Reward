import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { auditLogs, sessions } from "@workspace/db/schema";

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

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    // Try to extract userId from the (possibly expired) token for audit purposes
    const decoded = jwt.decode(token) as JwtPayload | null;
    const auditUserId = decoded?.userId ?? "unknown";

    const isExpired = err instanceof jwt.TokenExpiredError;
    db.insert(auditLogs)
      .values({
        userId: auditUserId,
        action: `${req.method} ${req.path}`,
        resourceType: "api",
        ipAddress: String(req.ip ?? ""),
        outcome: "FAILURE",
        failureReason: isExpired ? "Token expired" : "Invalid token",
      })
      .catch(() => {});

    if (isExpired) {
      res.status(401).json({ error: "Your session has expired" });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
    return;
  }

  // CRIT-003: Verify an active server-side session exists (enables revocation on logout)
  const tokenHash = hashToken(token);
  try {
    const [session] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, payload.userId),
          eq(sessions.jwtTokenHash, tokenHash),
        ),
      )
      .limit(1);

    if (!session) {
      db.insert(auditLogs)
        .values({
          userId: payload.userId,
          action: `${req.method} ${req.path}`,
          resourceType: "api",
          ipAddress: String(req.ip ?? ""),
          outcome: "BLOCKED",
          failureReason: "Session not found or revoked — please log in again",
        })
        .catch(() => {});
      res.status(401).json({ error: "Session expired or revoked. Please log in again." });
      return;
    }
  } catch {
    // If the session check itself fails (e.g. DB down), fail open with a warning log
    // so a DB hiccup doesn't lock everyone out
    req.log?.warn("Session DB check failed — allowing request through");
  }

  req.userId = payload.userId;
  req.userRole = payload.role;

  // Generic audit log for every authenticated request
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
}

/**
 * requireRole(...roles) — use AFTER requireAuth.
 * Returns 403 + BLOCKED audit entry if the authenticated user's role is not in the list.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.userRole)) {
      db.insert(auditLogs)
        .values({
          userId: req.userId,
          action: `${req.method} ${req.path}`,
          resourceType: "api",
          ipAddress: String(req.ip ?? ""),
          outcome: "BLOCKED",
          failureReason: `Role '${req.userRole}' not in required [${roles.join(", ")}]`,
        })
        .catch(() => {});
      res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
      return;
    }
    next();
  };
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
