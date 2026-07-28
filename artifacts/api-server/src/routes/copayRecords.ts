import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { copayRecords } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// GET /api/user/copay
router.get("/user/copay", requireAuth, async (req, res) => {
  const userId = req.userId;
  try {
    const rows = await db
      .select()
      .from(copayRecords)
      .where(eq(copayRecords.userId, userId))
      .orderBy(desc(copayRecords.visitDate));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "list copay records error");
    res.status(500).json({ error: "Failed to fetch copay records" });
  }
});

// POST /api/user/copay
router.post("/user/copay", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { providerName, amountDue, visitDate, status, emrRecordId } = req.body as {
    providerName?: string;
    amountDue: number | string;
    visitDate: string;
    status?: string;
    emrRecordId?: string;
  };

  if (!amountDue || !visitDate) {
    res.status(400).json({ error: "amountDue and visitDate are required" });
    return;
  }

  try {
    const [record] = await db
      .insert(copayRecords)
      .values({
        userId,
        providerName: providerName ?? null,
        amountDue: String(amountDue),
        visitDate,
        status: status ?? "PENDING",
        emrRecordId: emrRecordId ?? null,
      })
      .returning();
    res.status(201).json(record);
  } catch (err) {
    req.log.error({ err }, "create copay record error");
    res.status(500).json({ error: "Failed to create copay record" });
  }
});

// PATCH /api/user/copay/:id  (update status)
router.patch("/user/copay/:id", requireAuth, async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const { status } = req.body as { status: string };

  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }

  try {
    const [updated] = await db
      .update(copayRecords)
      .set({ status })
      .where(eq(copayRecords.id, id))
      .returning();

    if (!updated || updated.userId !== userId) {
      res.status(404).json({ error: "Copay record not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "update copay record error");
    res.status(500).json({ error: "Failed to update copay record" });
  }
});

export default router;
