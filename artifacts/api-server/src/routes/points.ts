import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  pointsAccounts,
  pointsTransactions,
  redemptions,
  redemptionWindows,
  hsaAccounts,
  notifications,
  auditLogs,
} from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";
import { desc } from "drizzle-orm";

const router = Router();

const POINTS_PER_DOLLAR = 100;

// GET /api/points/balance
router.get("/balance", requireAuth, async (req, res) => {
  const userId = req.userId;
  try {
    const [account, txns] = await Promise.all([
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
        .limit(20),
    ]);
    res.json({ account: account[0] ?? null, transactions: txns });
  } catch (err) {
    req.log.error({ err }, "balance error");
    res.status(500).json({ error: "Failed to load balance" });
  }
});

// POST /api/points/allocate
router.post("/allocate", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { type, pointsAmount, percentage, storeUrl } = req.body as {
    type?: string;
    pointsAmount?: number;
    percentage?: number;
    storeUrl?: string;
  };

  const validTypes = ["PREMIUM", "HSA", "GIFTCARD", "COPAY"];
  if (!type || !validTypes.includes(type)) {
    res.status(400).json({ error: `type must be one of: ${validTypes.join(", ")}` });
    return;
  }

  try {
    const [account] = await db
      .select()
      .from(pointsAccounts)
      .where(eq(pointsAccounts.userId, userId))
      .limit(1);

    if (!account) {
      res.status(404).json({ error: "Points account not found" });
      return;
    }

    const balance = account.currentBalance;

    let pointsToRedeem: number;
    if (percentage !== undefined) {
      pointsToRedeem = Math.floor((balance * percentage) / 100);
    } else if (pointsAmount !== undefined) {
      pointsToRedeem = pointsAmount;
    } else {
      res.status(400).json({ error: "pointsAmount or percentage is required" });
      return;
    }

    if (pointsToRedeem <= 0 || pointsToRedeem > balance) {
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    const dollarValue = pointsToRedeem / POINTS_PER_DOLLAR;

    // Validate HSA yearly limit
    if (type === "HSA") {
      const [hsa] = await db
        .select()
        .from(hsaAccounts)
        .where(eq(hsaAccounts.userId, userId))
        .limit(1);
      if (hsa) {
        const newYtd =
          parseFloat(hsa.ytdContribution ?? "0") + dollarValue;
        if (newYtd > parseFloat(hsa.yearlyLimit ?? "4400")) {
          res.status(400).json({
            error: `HSA contribution would exceed yearly limit ($${hsa.yearlyLimit})`,
          });
          return;
        }
      }
    }

    // Check active window
    const [activeWindow] = await db
      .select()
      .from(redemptionWindows)
      .where(eq(redemptionWindows.isActive, true))
      .limit(1);

    if (!activeWindow) {
      res.status(400).json({ error: "No active redemption window" });
      return;
    }

    const [redemption] = await db
      .insert(redemptions)
      .values({
        userId,
        type: type as "PREMIUM" | "HSA" | "GIFTCARD" | "COPAY",
        pointsRedeemed: pointsToRedeem,
        dollarValue: dollarValue.toFixed(2),
        status: "PENDING",
        storeUrl,
        redemptionWindowId: activeWindow.id,
      })
      .returning();

    res.json({
      redemptionId: redemption.id,
      summary: {
        type,
        pointsToRedeem,
        dollarValue,
        currentBalance: balance,
        balanceAfterRedemption: balance - pointsToRedeem,
      },
    });
  } catch (err) {
    req.log.error({ err }, "allocate error");
    res.status(500).json({ error: "Failed to create redemption" });
  }
});

// POST /api/points/confirm/first
router.post("/confirm/first", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { redemptionId } = req.body as { redemptionId?: string };

  if (!redemptionId) {
    res.status(400).json({ error: "redemptionId is required" });
    return;
  }

  try {
    const [redemption] = await db
      .select()
      .from(redemptions)
      .where(
        and(eq(redemptions.id, redemptionId), eq(redemptions.userId, userId)),
      )
      .limit(1);

    if (!redemption) {
      res.status(404).json({ error: "Redemption not found" });
      return;
    }
    if (redemption.status !== "PENDING") {
      res.status(400).json({
        error: `Redemption is ${redemption.status}, expected PENDING`,
      });
      return;
    }

    await db
      .update(redemptions)
      .set({ status: "FIRST_CONFIRMED", firstConfirmedAt: new Date() })
      .where(eq(redemptions.id, redemptionId));

    res.json({
      redemptionId,
      nextStep: "FINAL_ACKNOWLEDGMENT",
    });
  } catch (err) {
    req.log.error({ err }, "confirm/first error");
    res.status(500).json({ error: "Failed to confirm redemption" });
  }
});

// POST /api/points/confirm/final
router.post("/confirm/final", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { redemptionId } = req.body as { redemptionId?: string };

  if (!redemptionId) {
    res.status(400).json({ error: "redemptionId is required" });
    return;
  }

  try {
    const [redemption] = await db
      .select()
      .from(redemptions)
      .where(
        and(eq(redemptions.id, redemptionId), eq(redemptions.userId, userId)),
      )
      .limit(1);

    if (!redemption) {
      res.status(404).json({ error: "Redemption not found" });
      return;
    }
    if (redemption.status !== "FIRST_CONFIRMED") {
      res.status(400).json({
        error: `Redemption is ${redemption.status}, expected FIRST_CONFIRMED`,
      });
      return;
    }

    const [account] = await db
      .select()
      .from(pointsAccounts)
      .where(eq(pointsAccounts.userId, userId))
      .limit(1);

    if (!account) {
      res.status(404).json({ error: "Points account not found" });
      return;
    }

    const pts = redemption.pointsRedeemed;
    const newBalance = account.currentBalance - pts;

    await db
      .update(pointsAccounts)
      .set({ currentBalance: newBalance, lastUpdatedAt: new Date() })
      .where(eq(pointsAccounts.userId, userId));

    await db.insert(pointsTransactions).values({
      userId,
      type: "REDEEM",
      amount: -pts,
      source: "OPPORTUNITY",
      redemptionId,
      description: `${redemption.type} redemption`,
      balanceAfter: newBalance,
    });

    await db
      .update(redemptions)
      .set({ status: "FINAL_CONFIRMED", finalConfirmedAt: new Date() })
      .where(eq(redemptions.id, redemptionId));

    // HSA: update ytd contribution
    if (redemption.type === "HSA") {
      const [hsa] = await db
        .select()
        .from(hsaAccounts)
        .where(eq(hsaAccounts.userId, userId))
        .limit(1);
      if (hsa) {
        const dollar = parseFloat(redemption.dollarValue);
        const newYtd = parseFloat(hsa.ytdContribution ?? "0") + dollar;
        await db
          .update(hsaAccounts)
          .set({
            ytdContribution: newYtd.toFixed(2),
            lastUpdatedAt: new Date(),
          })
          .where(eq(hsaAccounts.userId, userId));
      }
    }

    // Notification (fire-and-forget)
    db.insert(notifications)
      .values({
        userId,
        type: "POINTS_EARNED",
        title: "Redemption Confirmed",
        message: `Your ${redemption.type} redemption of ${pts} points has been processed.`,
      })
      .catch(() => {});

    // Audit log (fire-and-forget)
    db.insert(auditLogs)
      .values({
        userId,
        action: "REDEEM_POINTS",
        resourceType: "redemptions",
        resourceId: redemptionId,
        outcome: "SUCCESS",
      })
      .catch(() => {});

    res.json({
      success: true,
      newBalance,
      pointsRedeemed: pts,
      redemptionType: redemption.type,
    });
  } catch (err) {
    req.log.error({ err }, "confirm/final error");
    res.status(500).json({ error: "Failed to finalize redemption" });
  }
});

// POST /api/points/reset-test
router.post("/reset-test", requireAuth, async (req, res) => {
  if (process.env.TESTING_MODE !== "true") {
    res.status(403).json({ error: "Not available outside TESTING_MODE" });
    return;
  }

  const userId = req.userId;
  try {
    const [account] = await db
      .select()
      .from(pointsAccounts)
      .where(eq(pointsAccounts.userId, userId))
      .limit(1);

    if (!account) {
      res.status(404).json({ error: "Points account not found" });
      return;
    }

    await db
      .update(pointsAccounts)
      .set({
        currentBalance: 1000,
        earnedThisYear: 1000,
        lastUpdatedAt: new Date(),
      })
      .where(eq(pointsAccounts.userId, userId));

    await db.insert(pointsTransactions).values({
      userId,
      type: "RESET",
      amount: 1000 - account.currentBalance,
      source: "MANUAL_RESET",
      description: "Test reset to 1000 points",
      balanceAfter: 1000,
    });

    res.json({ success: true, newBalance: 1000 });
  } catch (err) {
    req.log.error({ err }, "reset-test error");
    res.status(500).json({ error: "Failed to reset points" });
  }
});

export default router;
