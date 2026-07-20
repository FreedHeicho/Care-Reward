import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import {
  employers,
  opportunities,
  redemptionWindows,
  users,
  pointsAccounts,
  hsaAccounts,
  insurancePlans,
  notificationPreferences,
} from "./schema/index.js";

async function main() {
  console.log("=== CareReward Database Seed ===\n");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // ── 1. Opportunities ──────────────────────────────────────────────────────
  const oppDefs = [
    {
      title: "Switch to Mail Delivery Pharmacy",
      description:
        "Get maintenance medications delivered instead of retail pickup.",
      category: "CARE_SITE_ALTERNATIVE" as const,
      subCategory: "Mail Delivery",
      pointsValue: 50,
    },
    {
      title: "Schedule Annual Wellness Visit",
      description:
        "Book and complete your annual preventative care checkup.",
      category: "PREVENTATIVE_CARE" as const,
      pointsValue: 100,
    },
    {
      title: "Complete Health Risk Assessment",
      description: "Fill out your annual health risk questionnaire.",
      category: "CARE_QUALITY" as const,
      pointsValue: 75,
    },
    {
      title: "Choose a Primary Care Provider",
      description:
        "Establish care with an in-network primary care doctor.",
      category: "CARE_PROTOCOL" as const,
      pointsValue: 60,
    },
    {
      title: "Generic Medication Switch",
      description:
        "Switch from brand-name to a generic equivalent.",
      category: "CARE_SITE_ALTERNATIVE" as const,
      pointsValue: 40,
    },
  ];

  for (const opp of oppDefs) {
    try {
      const existing = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.title, opp.title))
        .limit(1);
      if (existing.length > 0) {
        console.log(`  ⏭  Opportunity already exists: "${opp.title}"`);
        continue;
      }
      await db.insert(opportunities).values({ ...opp, isActive: true });
      console.log(`  ✓  Opportunity created: "${opp.title}" (${opp.pointsValue} pts)`);
    } catch (err) {
      console.error(`  ✗  Opportunity "${opp.title}":`, err);
    }
  }

  // ── 2. Redemption Window ──────────────────────────────────────────────────
  try {
    const existingWindow = await db
      .select()
      .from(redemptionWindows)
      .where(eq(redemptionWindows.isActive, true))
      .limit(1);

    if (existingWindow.length > 0) {
      console.log("  ⏭  Active redemption window already exists");
    } else {
      const windowStart = new Date(year, month, 1);
      const windowEnd = new Date(year, month + 1, 0);
      await db.insert(redemptionWindows).values({
        windowStart: windowStart.toISOString().slice(0, 10),
        windowEnd: windowEnd.toISOString().slice(0, 10),
        isActive: true,
      });
      console.log(
        `  ✓  Redemption window created: ${windowStart.toDateString()} → ${windowEnd.toDateString()}`,
      );
    }
  } catch (err) {
    console.error("  ✗  Redemption window:", err);
  }

  // ── 3. Test Employer ──────────────────────────────────────────────────────
  let testEmployerId: string | undefined;
  try {
    const existing = await db
      .select()
      .from(employers)
      .where(eq(employers.name, "CareReward Test Employer"))
      .limit(1);

    if (existing.length > 0) {
      testEmployerId = existing[0].id;
      console.log("  ⏭  Test employer already exists");
    } else {
      const [emp] = await db
        .insert(employers)
        .values({ name: "CareReward Test Employer", planType: "2026 HDHP" })
        .returning();
      testEmployerId = emp.id;
      console.log("  ✓  Test employer created");
    }
  } catch (err) {
    console.error("  ✗  Test employer:", err);
  }

  // ── 4. Test User (TESTING_MODE only) ─────────────────────────────────────
  if (process.env.TESTING_MODE === "true") {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, "test@carereward.com"))
        .limit(1);

      if (existingUser.length > 0) {
        console.log("  ⏭  Test user already exists");
      } else {
        const passwordHash = await bcrypt.hash("Test1234!", 10);
        const [user] = await db
          .insert(users)
          .values({
            email: "test@carereward.com",
            passwordHash,
            firstName: "Test",
            lastName: "User",
            role: "user",
            isActive: true,
            employerId: testEmployerId,
          })
          .returning();

        console.log("  ✓  Test user created (test@carereward.com / Test1234!)");

        const yearEnd = `${year}-12-31`;

        // Points account
        await db.insert(pointsAccounts).values({
          userId: user.id,
          currentBalance: 1000,
          earnedThisYear: 1000,
          yearResetDate: yearEnd,
        });
        console.log("  ✓  Points account created (balance: 1000)");

        // HSA account
        await db.insert(hsaAccounts).values({
          userId: user.id,
          yearlyLimit: "4400.00",
          ytdContribution: "0.00",
          currentBalance: "0.00",
        });
        console.log("  ✓  HSA account created");

        // Insurance plan
        await db.insert(insurancePlans).values({
          userId: user.id,
          planName: "Aetna HDHP Gold",
          monthlyPremium: "450.00",
          deductible: "1500.00",
          effectiveDate: `${year}-01-01`,
          expirationDate: yearEnd,
          isActive: true,
          employerId: testEmployerId,
        });
        console.log("  ✓  Insurance plan created");

        // Notification preferences
        await db.insert(notificationPreferences).values({
          userId: user.id,
          opportunitiesEnabled: true,
          redemptionWindowEnabled: true,
          deviceAlertsEnabled: true,
          pointsUpdatesEnabled: true,
        });
        console.log("  ✓  Notification preferences created");
      }
    } catch (err) {
      console.error("  ✗  Test user:", err);
    }
  } else {
    console.log("  ⏭  Skipping test user (TESTING_MODE != true)");
  }

  console.log("\n=== Seed complete ===");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
