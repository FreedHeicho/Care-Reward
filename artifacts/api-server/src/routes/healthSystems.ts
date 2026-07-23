import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { connectedHealthSystems, auditLogs } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const TYPE_MAP: Record<string, "HOSPITAL" | "CLINIC" | "PHARMACY" | "PROVIDER"> = {
  Hospital: "HOSPITAL",
  "Health System": "HOSPITAL",
  Clinic: "CLINIC",
  Pharmacy: "PHARMACY",
  Provider: "PROVIDER",
};

// GET /api/health-systems
router.get("/health-systems", requireAuth, async (req, res) => {
  const userId = (req as unknown as { userId: string }).userId;
  try {
    const systems = await db
      .select({
        id: connectedHealthSystems.id,
        userId: connectedHealthSystems.userId,
        systemName: connectedHealthSystems.systemName,
        systemType: connectedHealthSystems.systemType,
        npi: connectedHealthSystems.npi,
        fhirBaseUrl: connectedHealthSystems.fhirBaseUrl,
        connectionStatus: connectedHealthSystems.connectionStatus,
        // accessToken intentionally excluded — must never be returned to client
        tokenExpiresAt: connectedHealthSystems.tokenExpiresAt,
        lastSyncedAt: connectedHealthSystems.lastSyncedAt,
        createdAt: connectedHealthSystems.createdAt,
      })
      .from(connectedHealthSystems)
      .where(eq(connectedHealthSystems.userId, userId))
      .orderBy(connectedHealthSystems.createdAt);

    // CRIT-002: explicit PHI audit log for health-system data access
    db.insert(auditLogs)
      .values({
        userId,
        action: "READ_CONNECTED_HEALTH_SYSTEMS",
        resourceType: "phi",
        ipAddress: String(req.ip ?? ""),
        outcome: "SUCCESS",
      })
      .catch(() => {});

    res.json(systems);
  } catch (err) {
    req.log.error({ err }, "get health-systems error");

    db.insert(auditLogs)
      .values({
        userId,
        action: "READ_CONNECTED_HEALTH_SYSTEMS",
        resourceType: "phi",
        ipAddress: String(req.ip ?? ""),
        outcome: "FAILURE",
        failureReason: String(err),
      })
      .catch(() => {});

    res.status(500).json({ error: "Failed to fetch health systems" });
  }
});

// POST /api/health-systems
router.post("/health-systems", requireAuth, async (req, res) => {
  const userId = (req as unknown as { userId: string }).userId;
  const { systemName, systemType, npi, fhirBaseUrl } = req.body as {
    systemName?: string;
    systemType?: string;
    npi?: string;
    fhirBaseUrl?: string;
  };

  if (!systemName || !systemType) {
    res.status(400).json({ error: "systemName and systemType are required" });
    return;
  }

  const dbType = TYPE_MAP[systemType] ?? "PROVIDER";

  try {
    // If NPI provided, check for duplicate and update instead of re-insert
    if (npi) {
      const [existing] = await db
        .select()
        .from(connectedHealthSystems)
        .where(
          and(
            eq(connectedHealthSystems.userId, userId),
            eq(connectedHealthSystems.npi, npi),
          ),
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(connectedHealthSystems)
          .set({ connectionStatus: "CONNECTED", lastSyncedAt: new Date() })
          .where(eq(connectedHealthSystems.id, existing.id))
          .returning();

        // CRIT-002: PHI audit log for re-connection (update)
        db.insert(auditLogs)
          .values({
            userId,
            action: "RECONNECT_HEALTH_SYSTEM",
            resourceType: "phi",
            resourceId: existing.id,
            ipAddress: String(req.ip ?? ""),
            outcome: "SUCCESS",
          })
          .catch(() => {});

        res.json(updated);
        return;
      }
    }

    const [system] = await db
      .insert(connectedHealthSystems)
      .values({
        userId,
        systemName,
        systemType: dbType,
        npi: npi ?? null,
        fhirBaseUrl: fhirBaseUrl ?? null,
        connectionStatus: "CONNECTED",
        lastSyncedAt: new Date(),
      })
      .returning();

    // CRIT-002: PHI audit log for new health-system connection
    db.insert(auditLogs)
      .values({
        userId,
        action: "CONNECT_HEALTH_SYSTEM",
        resourceType: "phi",
        resourceId: system.id,
        ipAddress: String(req.ip ?? ""),
        outcome: "SUCCESS",
      })
      .catch(() => {});

    res.status(201).json(system);
  } catch (err) {
    req.log.error({ err }, "connect health-system error");

    db.insert(auditLogs)
      .values({
        userId,
        action: "CONNECT_HEALTH_SYSTEM",
        resourceType: "phi",
        ipAddress: String(req.ip ?? ""),
        outcome: "FAILURE",
        failureReason: String(err),
      })
      .catch(() => {});

    res.status(500).json({ error: "Failed to connect health system" });
  }
});

// DELETE /api/health-systems/:id
router.delete("/health-systems/:id", requireAuth, async (req, res) => {
  const userId = (req as unknown as { userId: string }).userId;
  const id = req.params["id"] as string;
  try {
    await db
      .delete(connectedHealthSystems)
      .where(
        and(
          eq(connectedHealthSystems.id, id),
          eq(connectedHealthSystems.userId, userId),
        ),
      );

    // CRIT-002: PHI audit log for health-system disconnection
    db.insert(auditLogs)
      .values({
        userId,
        action: "DISCONNECT_HEALTH_SYSTEM",
        resourceType: "phi",
        resourceId: id,
        ipAddress: String(req.ip ?? ""),
        outcome: "SUCCESS",
      })
      .catch(() => {});

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete health-system error");

    db.insert(auditLogs)
      .values({
        userId,
        action: "DISCONNECT_HEALTH_SYSTEM",
        resourceType: "phi",
        resourceId: id,
        ipAddress: String(req.ip ?? ""),
        outcome: "FAILURE",
        failureReason: String(err),
      })
      .catch(() => {});

    res.status(500).json({ error: "Failed to remove health system" });
  }
});

export default router;
