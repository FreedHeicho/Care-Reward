import { Router } from "express";
import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { opportunities, opportunityAuthors, users } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();
const adminGuard = [requireAuth, requireRole("admin", "employer_admin")] as const;

// ── helpers ──────────────────────────────────────────────────────────────────

type OppStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
type OppCategory =
  | "CARE_SITE_ALTERNATIVE"
  | "CARE_PROTOCOL"
  | "PREVENTATIVE_CARE"
  | "CARE_QUALITY";

/** Derive isActive from lifecycle status */
function isActiveFromStatus(status: OppStatus): boolean {
  return status === "ACTIVE";
}

// ── GET /api/admin/opportunities ─────────────────────────────────────────────
router.get("/admin/opportunities", ...adminGuard, async (req, res) => {
  const { category, isActive, oppStatus } = req.query as {
    category?: string;
    isActive?: string;
    oppStatus?: string;
  };

  try {
    const rows = await db
      .select({
        id: opportunities.id,
        title: opportunities.title,
        description: opportunities.description,
        category: opportunities.category,
        subCategory: opportunities.subCategory,
        pointsValue: opportunities.pointsValue,
        logoUrl: opportunities.logoUrl,
        isActive: opportunities.isActive,
        oppStatus: opportunities.oppStatus,
        audience: opportunities.audience,
        completionType: opportunities.completionType,
        windowStart: opportunities.windowStart,
        windowEnd: opportunities.windowEnd,
        createdBy: opportunities.createdBy,
        createdAt: opportunities.createdAt,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
      })
      .from(opportunities)
      .leftJoin(users, eq(opportunities.createdBy, users.id))
      .where(
        and(
          category
            ? eq(opportunities.category, category as OppCategory)
            : undefined,
          isActive !== undefined
            ? eq(opportunities.isActive, isActive === "true")
            : undefined,
          oppStatus
            ? eq(opportunities.oppStatus, oppStatus as OppStatus)
            : undefined,
        ),
      )
      .orderBy(sql`${opportunities.createdAt} DESC`);

    // Fetch author counts in bulk
    const ids = rows.map((r) => r.id);
    let countMap = new Map<string, number>();
    if (ids.length > 0) {
      const counts = await db
        .select({
          opportunityId: opportunityAuthors.opportunityId,
          c: count(),
        })
        .from(opportunityAuthors)
        .groupBy(opportunityAuthors.opportunityId);
      countMap = new Map(counts.map((c) => [c.opportunityId, c.c]));
    }

    res.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        subCategory: r.subCategory,
        pointsValue: r.pointsValue,
        logoUrl: r.logoUrl,
        isActive: r.isActive,
        oppStatus: r.oppStatus,
        audience: r.audience,
        completionType: r.completionType,
        windowStart: r.windowStart,
        windowEnd: r.windowEnd,
        createdBy: r.createdBy,
        createdByName:
          r.creatorFirstName && r.creatorLastName
            ? `${r.creatorFirstName} ${r.creatorLastName}`.trim()
            : null,
        createdAt: r.createdAt,
        authorCount: countMap.get(r.id) ?? 0,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "list admin opportunities error");
    res.status(500).json({ error: "Failed to list opportunities" });
  }
});

// ── POST /api/admin/opportunities ─────────────────────────────────────────────
router.post("/admin/opportunities", ...adminGuard, async (req, res) => {
  const {
    title,
    description,
    category,
    subCategory,
    pointsValue,
    logoUrl,
    oppStatus = "DRAFT",
    audience,
    completionType,
    windowStart,
    windowEnd,
  } = req.body as {
    title?: string;
    description?: string;
    category?: string;
    subCategory?: string;
    pointsValue?: number;
    logoUrl?: string;
    oppStatus?: OppStatus;
    audience?: string;
    completionType?: string;
    windowStart?: string;
    windowEnd?: string;
  };

  if (!title || !description || !category || pointsValue === undefined) {
    res.status(400).json({
      error: "title, description, category, and pointsValue are required",
    });
    return;
  }

  try {
    const [opp] = await db
      .insert(opportunities)
      .values({
        title,
        description,
        category: category as OppCategory,
        subCategory: subCategory ?? null,
        pointsValue,
        logoUrl: logoUrl ?? null,
        oppStatus: oppStatus as OppStatus,
        isActive: isActiveFromStatus(oppStatus as OppStatus),
        audience: (audience as any) ?? null,
        completionType: (completionType as any) ?? null,
        windowStart: windowStart ?? null,
        windowEnd: windowEnd ?? null,
        createdBy: req.userId,
      })
      .returning();

    await db.insert(opportunityAuthors).values({
      opportunityId: opp.id,
      userId: req.userId,
      action: "CREATED",
      notes: oppStatus === "DRAFT" ? "Saved as draft" : null,
    });

    res.status(201).json({ ...opp, createdByName: null, authorCount: 1 });
  } catch (err) {
    req.log.error({ err }, "create opportunity error");
    res.status(500).json({ error: "Failed to create opportunity" });
  }
});

// ── GET /api/admin/opportunities/stats ────────────────────────────────────────
// Must be before /:id
router.get("/admin/opportunities/stats", ...adminGuard, async (req, res) => {
  try {
    const all = await db
      .select({
        isActive: opportunities.isActive,
        oppStatus: opportunities.oppStatus,
        category: opportunities.category,
      })
      .from(opportunities);

    const total = all.length;
    const totalActive = all.filter((o) => o.oppStatus === "ACTIVE").length;
    const totalDraft = all.filter((o) => o.oppStatus === "DRAFT").length;
    const totalArchived = all.filter((o) => o.oppStatus === "ARCHIVED").length;
    const totalInactive = total - totalActive;

    const catMap = new Map<string, number>();
    for (const o of all.filter((x) => x.oppStatus === "ACTIVE")) {
      catMap.set(o.category, (catMap.get(o.category) ?? 0) + 1);
    }
    const byCategory = [...catMap.entries()].map(([category, count]) => ({
      category,
      count,
    }));

    const recent = await db
      .select({
        id: opportunities.id,
        title: opportunities.title,
        description: opportunities.description,
        category: opportunities.category,
        subCategory: opportunities.subCategory,
        pointsValue: opportunities.pointsValue,
        logoUrl: opportunities.logoUrl,
        isActive: opportunities.isActive,
        oppStatus: opportunities.oppStatus,
        audience: opportunities.audience,
        completionType: opportunities.completionType,
        windowStart: opportunities.windowStart,
        windowEnd: opportunities.windowEnd,
        createdBy: opportunities.createdBy,
        createdAt: opportunities.createdAt,
      })
      .from(opportunities)
      .orderBy(sql`${opportunities.createdAt} DESC`)
      .limit(5);

    res.json({
      total,
      totalActive,
      totalDraft,
      totalArchived,
      totalInactive,
      byCategory,
      recentlyCreated: recent.map((r) => ({
        ...r,
        createdByName: null,
        authorCount: 0,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "opportunity stats error");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ── GET /api/admin/opportunities/:id ─────────────────────────────────────────
router.get("/admin/opportunities/:id", ...adminGuard, async (req, res) => {
  const { id } = req.params;

  try {
    const [opp] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);

    if (!opp) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    const [creator] = opp.createdBy
      ? await db
          .select()
          .from(users)
          .where(eq(users.id, opp.createdBy))
          .limit(1)
      : [];

    const authorRows = await db
      .select({
        id: opportunityAuthors.id,
        userId: opportunityAuthors.userId,
        action: opportunityAuthors.action,
        notes: opportunityAuthors.notes,
        createdAt: opportunityAuthors.createdAt,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(opportunityAuthors)
      .leftJoin(users, eq(opportunityAuthors.userId, users.id))
      .where(eq(opportunityAuthors.opportunityId, id))
      .orderBy(opportunityAuthors.createdAt);

    const creatorName =
      creator?.firstName && creator?.lastName
        ? `${creator.firstName} ${creator.lastName}`.trim()
        : null;

    res.json({
      ...opp,
      createdByName: creatorName,
      authorCount: authorRows.length,
      authors: authorRows.map((a) => ({
        id: a.id,
        userId: a.userId,
        authorName:
          a.authorFirstName && a.authorLastName
            ? `${a.authorFirstName} ${a.authorLastName}`.trim()
            : "Unknown",
        action: a.action,
        notes: a.notes,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "get opportunity error");
    res.status(500).json({ error: "Failed to get opportunity" });
  }
});

// ── PATCH /api/admin/opportunities/:id ───────────────────────────────────────
router.patch("/admin/opportunities/:id", ...adminGuard, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    subCategory,
    pointsValue,
    logoUrl,
    isActive,
    oppStatus,
    audience,
    completionType,
    windowStart,
    windowEnd,
    notes,
  } = req.body as {
    title?: string;
    description?: string;
    category?: string;
    subCategory?: string;
    pointsValue?: number;
    logoUrl?: string;
    isActive?: boolean;
    oppStatus?: OppStatus;
    audience?: string;
    completionType?: string;
    windowStart?: string | null;
    windowEnd?: string | null;
    notes?: string;
  };

  try {
    const [existing] = await db
      .select({ id: opportunities.id, isActive: opportunities.isActive, oppStatus: opportunities.oppStatus })
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    const patch: Record<string, unknown> = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (category !== undefined) patch.category = category;
    if (subCategory !== undefined) patch.subCategory = subCategory;
    if (pointsValue !== undefined) patch.pointsValue = pointsValue;
    if (logoUrl !== undefined) patch.logoUrl = logoUrl;
    if (audience !== undefined) patch.audience = audience;
    if (completionType !== undefined) patch.completionType = completionType;
    if (windowStart !== undefined) patch.windowStart = windowStart;
    if (windowEnd !== undefined) patch.windowEnd = windowEnd;

    // oppStatus drives isActive
    if (oppStatus !== undefined) {
      patch.oppStatus = oppStatus;
      patch.isActive = isActiveFromStatus(oppStatus);
    } else if (isActive !== undefined) {
      // Legacy boolean path — keep in sync
      patch.isActive = isActive;
      patch.oppStatus = isActive
        ? "ACTIVE"
        : existing.oppStatus === "DRAFT"
          ? "DRAFT"
          : "ARCHIVED";
    }

    const [updated] = await db
      .update(opportunities)
      .set(patch)
      .where(eq(opportunities.id, id))
      .returning();

    // Determine author action
    const newStatus = (patch.oppStatus as OppStatus | undefined) ?? existing.oppStatus;
    const oldStatus = existing.oppStatus;
    const authorAction =
      newStatus === "ARCHIVED" && oldStatus !== "ARCHIVED"
        ? "DEACTIVATED"
        : newStatus === "ACTIVE" && oldStatus !== "ACTIVE"
          ? "REACTIVATED"
          : "UPDATED";

    await db.insert(opportunityAuthors).values({
      opportunityId: id,
      userId: req.userId,
      action: authorAction,
      notes: notes ?? null,
    });

    res.json({ ...updated, createdByName: null, authorCount: 0 });
  } catch (err) {
    req.log.error({ err }, "update opportunity error");
    res.status(500).json({ error: "Failed to update opportunity" });
  }
});

// ── DELETE /api/admin/opportunities/:id (soft-archive) ────────────────────────
router.delete("/admin/opportunities/:id", ...adminGuard, async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    await db
      .update(opportunities)
      .set({ isActive: false, oppStatus: "ARCHIVED" })
      .where(eq(opportunities.id, id));

    await db.insert(opportunityAuthors).values({
      opportunityId: id,
      userId: req.userId,
      action: "DEACTIVATED",
    });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "archive opportunity error");
    res.status(500).json({ error: "Failed to archive opportunity" });
  }
});

export default router;
