import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { connectedHealthSystems } from "@workspace/db/schema";
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
      .select()
      .from(connectedHealthSystems)
      .where(eq(connectedHealthSystems.userId, userId))
      .orderBy(connectedHealthSystems.createdAt);
    res.json(systems);
  } catch (err) {
    req.log.error({ err }, "get health-systems error");
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

    res.status(201).json(system);
  } catch (err) {
    req.log.error({ err }, "connect health-system error");
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
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete health-system error");
    res.status(500).json({ error: "Failed to remove health system" });
  }
});

export default router;
