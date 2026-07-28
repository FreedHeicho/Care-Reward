import { Router } from "express";
import { and, count, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  employers,
  employerOpportunityConfigs,
  opportunities,
} from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();
const adminGuard = [requireAuth, requireRole("admin", "employer_admin")] as const;

// ── POST /api/admin/employers ─────────────────────────────────────────────────
router.post("/admin/employers", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, planType } = req.body as { name?: string; planType?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  try {
    const [employer] = await db
      .insert(employers)
      .values({ name: name.trim(), planType: planType ?? null })
      .returning();
    res.status(201).json(employer);
  } catch (err) {
    req.log.error({ err }, "create employer error");
    res.status(500).json({ error: "Failed to create employer" });
  }
});

// ── GET /api/admin/employers ──────────────────────────────────────────────────
router.get("/admin/employers", ...adminGuard, async (req, res) => {
  try {
    const rows = await db
      .select({
        id: employers.id,
        name: employers.name,
        planType: employers.planType,
        createdAt: employers.createdAt,
      })
      .from(employers)
      .orderBy(employers.name);

    // Get config counts in bulk
    const configCounts = await db
      .select({
        employerId: employerOpportunityConfigs.employerId,
        c: count(),
      })
      .from(employerOpportunityConfigs)
      .groupBy(employerOpportunityConfigs.employerId);

    const countMap = new Map(configCounts.map((c) => [c.employerId, c.c]));

    res.json(
      rows.map((e) => ({
        ...e,
        configuredCount: countMap.get(e.id) ?? 0,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "list employers error");
    res.status(500).json({ error: "Failed to list employers" });
  }
});

// ── GET /api/admin/employers/:employerId/configs ──────────────────────────────
// Returns one config row per active opportunity (creates synthetic defaults for
// opportunities that have no explicit employer config yet).
router.get(
  "/admin/employers/:employerId/configs",
  ...adminGuard,
  async (req, res) => {
    const { employerId } = req.params;

    try {
      const allOpps = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.isActive, true))
        .orderBy(opportunities.title);

      const existingConfigs = await db
        .select()
        .from(employerOpportunityConfigs)
        .where(eq(employerOpportunityConfigs.employerId, employerId));

      const configMap = new Map(
        existingConfigs.map((c) => [c.opportunityId, c]),
      );

      const configs = allOpps.map((opp) => {
        const cfg = configMap.get(opp.id);
        return {
          id: cfg?.id ?? `synthetic-${opp.id}`,
          employerId,
          opportunityId: opp.id,
          isEnabled: cfg?.isEnabled ?? true,
          customPointsValue: cfg?.customPointsValue ?? null,
          customTitle: cfg?.customTitle ?? null,
          updatedBy: cfg?.updatedBy ?? null,
          createdAt: cfg?.createdAt ?? opp.createdAt,
          updatedAt: cfg?.updatedAt ?? opp.createdAt,
          opportunity: {
            ...opp,
            createdByName: null,
            authorCount: 0,
          },
        };
      });

      res.json(configs);
    } catch (err) {
      req.log.error({ err }, "list employer configs error");
      res.status(500).json({ error: "Failed to list employer configs" });
    }
  },
);

// ── PUT /api/admin/employers/:employerId/configs/:opportunityId ───────────────
router.put(
  "/admin/employers/:employerId/configs/:opportunityId",
  ...adminGuard,
  async (req, res) => {
    const { employerId, opportunityId } = req.params;
    const { isEnabled, customPointsValue, customTitle } = req.body as {
      isEnabled?: boolean;
      customPointsValue?: number | null;
      customTitle?: string | null;
    };

    if (isEnabled === undefined) {
      res.status(400).json({ error: "isEnabled is required" });
      return;
    }

    try {
      const [existing] = await db
        .select()
        .from(employerOpportunityConfigs)
        .where(
          and(
            eq(employerOpportunityConfigs.employerId, employerId),
            eq(employerOpportunityConfigs.opportunityId, opportunityId),
          ),
        )
        .limit(1);

      let cfg;
      if (existing) {
        [cfg] = await db
          .update(employerOpportunityConfigs)
          .set({
            isEnabled,
            customPointsValue: customPointsValue ?? null,
            customTitle: customTitle ?? null,
            updatedBy: req.userId,
            updatedAt: new Date(),
          })
          .where(eq(employerOpportunityConfigs.id, existing.id))
          .returning();
      } else {
        [cfg] = await db
          .insert(employerOpportunityConfigs)
          .values({
            employerId,
            opportunityId,
            isEnabled,
            customPointsValue: customPointsValue ?? null,
            customTitle: customTitle ?? null,
            updatedBy: req.userId,
          })
          .returning();
      }

      const [opp] = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, opportunityId))
        .limit(1);

      res.json({
        ...cfg,
        opportunity: opp ? { ...opp, createdByName: null, authorCount: 0 } : null,
      });
    } catch (err) {
      req.log.error({ err }, "set employer config error");
      res.status(500).json({ error: "Failed to set employer config" });
    }
  },
);

export default router;
