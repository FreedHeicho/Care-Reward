import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { emrRecords, connectedHealthSystems, auditLogs } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const VALID_RECORD_TYPES = ["IMMUNIZATION", "VISIT", "LAB_RESULT", "MEDICATION"] as const;

// POST /api/user/emr
// Creates one or more EMR records for a connected health system.
// Typically called when a health system sync completes.
router.post("/user/emr", requireAuth, async (req, res) => {
  const userId = req.userId;
  const body = req.body as {
    healthSystemId: string;
    records: Array<{
      recordType: string;
      fhirResourceType: string;
      fhirResourceId: string;
      loincCode?: string;
      icd10Code?: string;
      cvxCode?: string;
      rawData: Record<string, unknown>;
      displayData: Record<string, unknown>;
      recordDate: string;
    }>;
  };

  const { healthSystemId, records } = body;

  if (!healthSystemId || !Array.isArray(records) || records.length === 0) {
    res.status(400).json({
      error: "healthSystemId and at least one record are required",
    });
    return;
  }

  try {
    // Verify the health system belongs to this user
    const [system] = await db
      .select({ id: connectedHealthSystems.id })
      .from(connectedHealthSystems)
      .where(
        and(
          eq(connectedHealthSystems.id, healthSystemId),
          eq(connectedHealthSystems.userId, userId),
        ),
      )
      .limit(1);

    if (!system) {
      res.status(404).json({ error: "Health system not found or not connected" });
      return;
    }

    // Validate record types
    const invalidTypes = records
      .map((r) => r.recordType)
      .filter((t) => !(VALID_RECORD_TYPES as readonly string[]).includes(t));

    if (invalidTypes.length > 0) {
      res.status(400).json({
        error: `Invalid recordType(s): ${invalidTypes.join(", ")}. Use: ${VALID_RECORD_TYPES.join(", ")}`,
      });
      return;
    }

    const insertValues = records.map((r) => ({
      userId,
      healthSystemId,
      recordType: r.recordType as (typeof VALID_RECORD_TYPES)[number],
      fhirResourceType: r.fhirResourceType,
      fhirResourceId: r.fhirResourceId,
      loincCode: r.loincCode ?? null,
      icd10Code: r.icd10Code ?? null,
      cvxCode: r.cvxCode ?? null,
      rawData: r.rawData,
      displayData: r.displayData,
      recordDate: r.recordDate,
    }));

    const inserted = await db
      .insert(emrRecords)
      .values(insertValues)
      .onConflictDoNothing()
      .returning();

    // CRIT-002 style: PHI audit log for EMR write
    db.insert(auditLogs)
      .values({
        userId,
        action: "WRITE_EMR_RECORDS",
        resourceType: "phi",
        resourceId: healthSystemId,
        ipAddress: String(req.ip ?? ""),
        outcome: "SUCCESS",
      })
      .catch(() => {});

    // Update lastSyncedAt on the health system
    await db
      .update(connectedHealthSystems)
      .set({ lastSyncedAt: new Date() })
      .where(eq(connectedHealthSystems.id, healthSystemId));

    res.status(201).json({ inserted: inserted.length, records: inserted });
  } catch (err) {
    req.log.error({ err }, "write emr records error");

    db.insert(auditLogs)
      .values({
        userId,
        action: "WRITE_EMR_RECORDS",
        resourceType: "phi",
        resourceId: healthSystemId,
        ipAddress: String(req.ip ?? ""),
        outcome: "FAILURE",
        failureReason: String(err),
      })
      .catch(() => {});

    res.status(500).json({ error: "Failed to write EMR records" });
  }
});

export default router;
