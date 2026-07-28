import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { connectedDevices } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const DEVICE_TYPE_MAP: Record<string, "BLOOD_PRESSURE" | "GLUCOSE" | "OXYGEN" | "HEART_RATE" | "STRESS"> = {
  "blood-pressure": "BLOOD_PRESSURE",
  "BLOOD_PRESSURE": "BLOOD_PRESSURE",
  glucose: "GLUCOSE",
  GLUCOSE: "GLUCOSE",
  oxygen: "OXYGEN",
  OXYGEN: "OXYGEN",
  "heart-rate": "HEART_RATE",
  HEART_RATE: "HEART_RATE",
  stress: "STRESS",
  STRESS: "STRESS",
};

const CONN_TYPE_MAP: Record<string, "BLUETOOTH" | "WIFI" | "NFC"> = {
  Bluetooth: "BLUETOOTH",
  BLUETOOTH: "BLUETOOTH",
  WiFi: "WIFI",
  WIFI: "WIFI",
  NFC: "NFC",
};

// GET /api/user/devices
router.get("/user/devices", requireAuth, async (req, res) => {
  const userId = req.userId;
  try {
    const rows = await db
      .select()
      .from(connectedDevices)
      .where(and(eq(connectedDevices.userId, userId), eq(connectedDevices.isActive, true)))
      .orderBy(connectedDevices.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "list devices error");
    res.status(500).json({ error: "Failed to fetch connected devices" });
  }
});

// POST /api/user/devices
router.post("/user/devices", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { deviceType, deviceName, deviceModel, manufacturer, connectionType, macAddress } =
    req.body as {
      deviceType: string;
      deviceName: string;
      deviceModel?: string;
      manufacturer?: string;
      connectionType: string;
      macAddress?: string;
    };

  if (!deviceType || !deviceName || !connectionType) {
    res.status(400).json({ error: "deviceType, deviceName, and connectionType are required" });
    return;
  }

  const dbDeviceType = DEVICE_TYPE_MAP[deviceType];
  const dbConnType = CONN_TYPE_MAP[connectionType];

  if (!dbDeviceType) {
    res.status(400).json({ error: `Invalid deviceType. Use one of: blood-pressure, glucose, oxygen, heart-rate, stress` });
    return;
  }
  if (!dbConnType) {
    res.status(400).json({ error: `Invalid connectionType. Use one of: Bluetooth, WiFi, NFC` });
    return;
  }

  try {
    // If same device name + type already connected, return the existing one
    const [existing] = await db
      .select()
      .from(connectedDevices)
      .where(
        and(
          eq(connectedDevices.userId, userId),
          eq(connectedDevices.deviceName, deviceName),
          eq(connectedDevices.isActive, true),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(connectedDevices)
        .set({ lastConnectedAt: new Date() })
        .where(eq(connectedDevices.id, existing.id))
        .returning();
      res.json({ ...updated, alreadyConnected: true });
      return;
    }

    const [device] = await db
      .insert(connectedDevices)
      .values({
        userId,
        deviceType: dbDeviceType,
        deviceName,
        deviceModel: deviceModel ?? null,
        manufacturer: manufacturer ?? null,
        connectionType: dbConnType,
        macAddress: macAddress ?? null,
        isActive: true,
        lastConnectedAt: new Date(),
      })
      .returning();

    res.status(201).json(device);
  } catch (err) {
    req.log.error({ err }, "connect device error");
    res.status(500).json({ error: "Failed to connect device" });
  }
});

// DELETE /api/user/devices/:id
router.delete("/user/devices/:id", requireAuth, async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  try {
    const [updated] = await db
      .update(connectedDevices)
      .set({ isActive: false })
      .where(and(eq(connectedDevices.id, id), eq(connectedDevices.userId, userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Device not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "disconnect device error");
    res.status(500).json({ error: "Failed to disconnect device" });
  }
});

export default router;
