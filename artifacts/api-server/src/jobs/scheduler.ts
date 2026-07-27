import cron from "node-cron";
import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  users,
  userOpportunities,
  opportunities,
  employerOpportunityConfigs,
  redemptionWindows,
  pointsAccounts,
  pointsTransactions,
  hsaAccounts,
  notifications,
} from "@workspace/db/schema";

// ── Opportunities engine — extracted so it can be triggered on-demand ────────
export async function runOpportunitiesEngine(): Promise<{ assigned: number; usersProcessed: number }> {
  console.log("[scheduler] Running opportunities engine");
  const today = new Date().toISOString().slice(0, 10);

  // Mark overdue AVAILABLE as MISSED
  await db
    .update(userOpportunities)
    .set({ status: "MISSED", missedAt: new Date() })
    .where(
      and(
        eq(userOpportunities.status, "AVAILABLE"),
        lt(userOpportunities.windowEnd, today),
      ),
    );

  // Get all active users with their employer
  const activeUsers = await db
    .select({ id: users.id, employerId: users.employerId })
    .from(users)
    .where(eq(users.isActive, true));

  // Get all ACTIVE opportunities (oppStatus = ACTIVE keeps in sync with isActive)
  const allOpps = await db
    .select()
    .from(opportunities)
    .where(
      and(
        eq(opportunities.isActive, true),
        eq(opportunities.oppStatus, "ACTIVE"),
      ),
    );

  // Pre-load all employer configs in one query to avoid N+1
  const allConfigs = await db
    .select({
      employerId: employerOpportunityConfigs.employerId,
      opportunityId: employerOpportunityConfigs.opportunityId,
      isEnabled: employerOpportunityConfigs.isEnabled,
      customPointsValue: employerOpportunityConfigs.customPointsValue,
    })
    .from(employerOpportunityConfigs);

  // Build a lookup: employerId → opportunityId → config
  const configMap = new Map<string, Map<string, typeof allConfigs[0]>>();
  for (const cfg of allConfigs) {
    if (!configMap.has(cfg.employerId)) {
      configMap.set(cfg.employerId, new Map());
    }
    configMap.get(cfg.employerId)!.set(cfg.opportunityId, cfg);
  }

  const defaultWindowEnd = new Date(Date.now() + 30 * 86400_000)
    .toISOString()
    .slice(0, 10);

  let assigned = 0;

  for (const user of activeUsers) {
    const existing = await db
      .select({ opportunityId: userOpportunities.opportunityId })
      .from(userOpportunities)
      .where(eq(userOpportunities.userId, user.id));

    const assignedIds = new Set(existing.map((r) => r.opportunityId));
    const employerCfgs = user.employerId
      ? configMap.get(user.employerId)
      : undefined;

    for (const opp of allOpps) {
      if (assignedIds.has(opp.id)) continue;

      if (employerCfgs) {
        const cfg = employerCfgs.get(opp.id);
        if (cfg && !cfg.isEnabled) continue;
      }

      const windowStart = opp.windowStart ?? today;
      const windowEnd = opp.windowEnd ?? defaultWindowEnd;
      const pointsValue =
        employerCfgs?.get(opp.id)?.customPointsValue ?? opp.pointsValue;

      await db.insert(userOpportunities).values({
        userId: user.id,
        opportunityId: opp.id,
        status: "AVAILABLE",
        windowStart,
        windowEnd,
      });

      await db.insert(notifications).values({
        userId: user.id,
        type: "OPPORTUNITY_AVAILABLE",
        title: "New Opportunity Available",
        message: `Earn ${pointsValue} points: ${opp.title}`,
      });

      assigned++;
    }
  }

  console.log(`[scheduler] Opportunities engine complete — ${assigned} assignments across ${activeUsers.length} users`);
  return { assigned, usersProcessed: activeUsers.length };
}

export function startScheduler() {
  // ── Job 1: Nightly at 2 AM — Opportunities Engine ────────────────────────
  cron.schedule("0 2 * * *", async () => {
    console.log("[scheduler] Job 1: Running opportunities engine");
    try {
      await runOpportunitiesEngine();
    } catch (err) {
      console.error("[scheduler] Job 1 error:", err);
    }
  });

  // ── Job 2: Monthly on 1st at midnight — Redemption Window ────────────────
  cron.schedule("0 0 1 * *", async () => {
    console.log("[scheduler] Job 2: Opening new redemption window");
    try {
      await db
        .update(redemptionWindows)
        .set({ isActive: false })
        .where(eq(redemptionWindows.isActive, true));

      const now = new Date();
      const windowStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);

      await db.insert(redemptionWindows).values({
        windowStart,
        windowEnd,
        isActive: true,
      });

      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.isActive, true));

      await Promise.all(
        activeUsers.map((user) =>
          db.insert(notifications).values({
            userId: user.id,
            type: "REDEMPTION_WINDOW_OPEN",
            title: "Redemption Window Open",
            message: `The ${now.toLocaleString("default", { month: "long" })} redemption window is now open until ${windowEnd}.`,
          }),
        ),
      );
      console.log("[scheduler] Job 2: Redemption window opened");
    } catch (err) {
      console.error("[scheduler] Job 2 error:", err);
    }
  });

  // ── Job 3: Daily at 9 AM — Closing Warning ───────────────────────────────
  cron.schedule("0 9 * * *", async () => {
    try {
      const tomorrow = new Date(Date.now() + 86400_000)
        .toISOString()
        .slice(0, 10);

      const [window] = await db
        .select()
        .from(redemptionWindows)
        .where(
          and(
            eq(redemptionWindows.isActive, true),
            eq(redemptionWindows.windowEnd, tomorrow),
          ),
        )
        .limit(1);

      if (!window) return;

      console.log("[scheduler] Job 3: Sending redemption closing warnings");
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.isActive, true));

      await Promise.all(
        activeUsers.map((user) =>
          db.insert(notifications).values({
            userId: user.id,
            type: "REDEMPTION_WINDOW_CLOSING",
            title: "Redemption Window Closes Tomorrow",
            message: "The redemption window closes tomorrow. Redeem your points now!",
          }),
        ),
      );
    } catch (err) {
      console.error("[scheduler] Job 3 error:", err);
    }
  });

  // ── Job 4: Jan 1 at midnight — Annual Points Reset ────────────────────────
  cron.schedule("0 0 1 1 *", async () => {
    console.log("[scheduler] Job 4: Annual points reset");
    try {
      const allAccounts = await db.select().from(pointsAccounts);

      await Promise.all(
        allAccounts.map(async (acct) => {
          await db.insert(pointsTransactions).values({
            userId: acct.userId,
            type: "RESET",
            amount: -acct.currentBalance,
            source: "YEAR_RESET",
            description: "Annual year-end points reset",
            balanceAfter: 0,
          });

          await db
            .update(pointsAccounts)
            .set({
              currentBalance: 0,
              earnedThisYear: 0,
              lastUpdatedAt: new Date(),
            })
            .where(eq(pointsAccounts.id, acct.id));
        }),
      );

      // Reset all HSA ytd contributions
      await db
        .update(hsaAccounts)
        .set({ ytdContribution: "0.00", lastUpdatedAt: new Date() });

      console.log(
        `[scheduler] Job 4: Reset complete for ${allAccounts.length} accounts`,
      );
    } catch (err) {
      console.error("[scheduler] Job 4 error:", err);
    }
  });

  console.log("[scheduler] All 4 jobs scheduled:");
  console.log("  - Job 1: Opportunities engine (daily 2 AM) — respects employer configs");
  console.log("  - Job 2: Redemption window (monthly 1st midnight)");
  console.log("  - Job 3: Closing warning (daily 9 AM)");
  console.log("  - Job 4: Annual points reset (Jan 1 midnight)");
}
