import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { pushTokens } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// POST /api/user/push-token
// Upsert: deactivates old tokens for this user+platform, inserts fresh one.
router.post("/user/push-token", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { token, platform } = req.body as {
    token: string;
    platform: "IOS" | "ANDROID";
  };

  if (!token || !platform) {
    res.status(400).json({ error: "token and platform are required" });
    return;
  }
  if (!["IOS", "ANDROID"].includes(platform)) {
    res.status(400).json({ error: "platform must be IOS or ANDROID" });
    return;
  }

  try {
    // Deactivate all existing tokens for this user on this platform
    await db
      .update(pushTokens)
      .set({ isActive: false })
      .where(
        and(
          eq(pushTokens.userId, userId),
          eq(pushTokens.platform, platform),
        ),
      );

    // Check if this exact token already exists (could be a re-login)
    const [existing] = await db
      .select()
      .from(pushTokens)
      .where(and(eq(pushTokens.token, token), eq(pushTokens.userId, userId)))
      .limit(1);

    if (existing) {
      const [reactivated] = await db
        .update(pushTokens)
        .set({ isActive: true })
        .where(eq(pushTokens.id, existing.id))
        .returning();
      res.json(reactivated);
      return;
    }

    const [created] = await db
      .insert(pushTokens)
      .values({ userId, token, platform, isActive: true })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "register push token error");
    res.status(500).json({ error: "Failed to register push token" });
  }
});

// DELETE /api/user/push-token
// Deactivates all push tokens for the user (called on logout).
router.delete("/user/push-token", requireAuth, async (req, res) => {
  const userId = req.userId;
  try {
    await db
      .update(pushTokens)
      .set({ isActive: false })
      .where(eq(pushTokens.userId, userId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "deactivate push tokens error");
    res.status(500).json({ error: "Failed to deactivate push tokens" });
  }
});

export default router;
