import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { notifications } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";
import { desc } from "drizzle-orm";

const router = Router();

// GET /api/notifications — list the current user's notifications, newest first
router.get("/notifications", requireAuth, async (req, res) => {
  const userId = req.userId;
  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "get notifications error");
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/read-all — mark every notification as read
// Must be declared BEFORE /:id/read so Express doesn't treat "read-all" as an id
router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  const userId = req.userId;
  try {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "read-all notifications error");
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  const userId = req.userId;
  const id = req.params["id"] as string;
  try {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(eq(notifications.id, id), eq(notifications.userId, userId)),
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "mark-read notification error");
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

export default router;
