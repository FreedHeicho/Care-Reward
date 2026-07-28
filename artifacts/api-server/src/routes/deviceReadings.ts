import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { connectedDevices, deviceReadings } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// GET /api/user/device-readings?deviceId=&metricType=&limit=
router.get("/user/device-readings", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { deviceId, metricType, limit } = req.query as {
    deviceId?: string;
    metricType?: string;
    limit?: string;
  };

  try {
    const conditions = [eq(deviceReadings.userId, userId)];
    if (deviceId) conditions.push(eq(deviceReadings.deviceId, deviceId));
    if (metricType) conditions.push(eq(deviceReadings.metricType, metricType));

    const rows = await db
      .select({
        id: deviceReadings.id,
        userId: deviceReadings.userId,
        deviceId: deviceReadings.deviceId,
        metricType: deviceReadings.metricType,
        value: deviceReadings.value,
        unit: deviceReadings.unit,
        recordedAt: deviceReadings.recordedAt,
        syncedAt: deviceReadings.syncedAt,
        isFlagged: deviceReadings.isFlagged,
        deviceName: connectedDevices.deviceName,
        deviceType: connectedDevices.deviceType,
      })
      .from(deviceReadings)
      .leftJoin(connectedDevices, eq(deviceReadings.deviceId, connectedDevices.id))
      .where(and(...conditions))
      .orderBy(desc(deviceReadings.recordedAt))
      .limit(Math.min(Number(limit ?? 100), 500));

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "list device readings error");
    res.status(500).json({ error: "Failed to fetch device readings" });
  }
});

// POST /api/user/device-readings
router.post("/user/device-readings", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { deviceId, metricType, value, unit, recordedAt, isFlagged } = req.body as {
    deviceId: string;
    metricType: string;
    value: number | string;
    unit: string;
    recordedAt?: string;
    isFlagged?: boolean;
  };

  if (!deviceId || !metricType || value === undefined || !unit) {
    res.status(400).json({ error: "deviceId, metricType, value, and unit are required" });
    return;
  }

  try {
    // Verify the device belongs to this user
    const [device] = await db
      .select({ id: connectedDevices.id })
      .from(connectedDevices)
      .where(
        and(
          eq(connectedDevices.id, deviceId),
          eq(connectedDevices.userId, userId),
          eq(connectedDevices.isActive, true),
        ),
      )
      .limit(1);

    if (!device) {
      res.status(404).json({ error: "Device not found or not connected" });
      return;
    }

    const [reading] = await db
      .insert(deviceReadings)
      .values({
        userId,
        deviceId,
        metricType,
        value: String(value),
        unit,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        isFlagged: isFlagged ?? false,
      })
      .returning();

    res.status(201).json(reading);
  } catch (err) {
    req.log.error({ err }, "log device reading error");
    res.status(500).json({ error: "Failed to log device reading" });
  }
});

export default router;
