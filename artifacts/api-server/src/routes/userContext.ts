import { Router } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  users,
  pointsAccounts,
  pointsTransactions,
  userOpportunities,
  connectedHealthSystems,
  connectedDevices,
  insurancePlans,
  hsaAccounts,
  redemptionWindows,
  notifications,
  emrRecords,
  auditLogs,
} from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// GET /api/user/context
router.get("/context", requireAuth, async (req, res) => {
  const t0 = Date.now();
  const userId = req.userId;

  try {
    const [
      profileRows,
      pointsRows,
      recentTxRows,
      oppCountRows,
      healthSystemRows,
      deviceRows,
      insuranceRows,
      hsaRows,
      windowRows,
      notifRows,
    ] = await Promise.all([
      db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),

      db
        .select()
        .from(pointsAccounts)
        .where(eq(pointsAccounts.userId, userId))
        .limit(1),

      db
        .select()
        .from(pointsTransactions)
        .where(eq(pointsTransactions.userId, userId))
        .orderBy(desc(pointsTransactions.createdAt))
        .limit(5),

      db
        .select({
          status: userOpportunities.status,
          count: count(),
        })
        .from(userOpportunities)
        .where(eq(userOpportunities.userId, userId))
        .groupBy(userOpportunities.status),

      db
        .select()
        .from(connectedHealthSystems)
        .where(eq(connectedHealthSystems.userId, userId)),

      db
        .select()
        .from(connectedDevices)
        .where(
          and(
            eq(connectedDevices.userId, userId),
            eq(connectedDevices.isActive, true),
          ),
        ),

      db
        .select()
        .from(insurancePlans)
        .where(
          and(
            eq(insurancePlans.userId, userId),
            eq(insurancePlans.isActive, true),
          ),
        )
        .limit(1),

      db
        .select()
        .from(hsaAccounts)
        .where(eq(hsaAccounts.userId, userId))
        .limit(1),

      db
        .select()
        .from(redemptionWindows)
        .where(eq(redemptionWindows.isActive, true))
        .limit(1),

      db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        )
        .orderBy(desc(notifications.createdAt))
        .limit(10),
    ]);

    res.json({
      user: profileRows[0] ?? null,
      points: {
        account: pointsRows[0] ?? null,
        recentTransactions: recentTxRows,
      },
      opportunityCounts: oppCountRows,
      connectedHealthSystems: healthSystemRows,
      activeDevices: deviceRows,
      insurancePlan: insuranceRows[0] ?? null,
      hsaAccount: hsaRows[0] ?? null,
      activeRedemptionWindow: windowRows[0] ?? null,
      unreadNotifications: notifRows,
      meta: { queryTimeMs: Date.now() - t0 },
    });
  } catch (err) {
    req.log.error({ err }, "userContext error");
    res.status(500).json({ error: "Failed to load user context" });
  }
});

// GET /api/user/opportunities
router.get("/opportunities", requireAuth, async (req, res) => {
  const userId = req.userId;
  const statusFilter = req.query.status as string | undefined;

  try {
    const rows = await db.query.userOpportunities.findMany({
      where: and(
        eq(userOpportunities.userId, userId),
        statusFilter
          ? eq(
              userOpportunities.status,
              statusFilter as "AVAILABLE" | "UPCOMING" | "COMPLETED" | "MISSED",
            )
          : undefined,
      ),
      with: { opportunity: true },
    });
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "opportunities error");
    res.status(500).json({ error: "Failed to load opportunities" });
  }
});

// GET /api/user/emr/:recordType
router.get("/emr/:recordType", requireAuth, async (req, res) => {
  const userId = req.userId;
  const recordType = req.params.recordType as
    | "IMMUNIZATION"
    | "VISIT"
    | "LAB_RESULT"
    | "MEDICATION";

  const validTypes = ["IMMUNIZATION", "VISIT", "LAB_RESULT", "MEDICATION"];
  if (!validTypes.includes(recordType)) {
    res.status(400).json({ error: `Invalid recordType. Use one of: ${validTypes.join(", ")}` });
    return;
  }

  // Write PHI access to audit log (fire-and-forget)
  db.insert(auditLogs)
    .values({
      userId,
      action: "READ_EMR",
      resourceType: "emr_records",
      ipAddress: String(req.ip ?? ""),
      outcome: "SUCCESS",
    })
    .catch(() => {});

  try {
    const rows = await db.query.emrRecords.findMany({
      where: and(
        eq(emrRecords.userId, userId),
        eq(emrRecords.recordType, recordType),
      ),
      with: { healthSystem: true } as never,
    });
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "emr error");
    res.status(500).json({ error: "Failed to load EMR records" });
  }
});

export default router;
