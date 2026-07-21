---
name: Seed and user_opportunities
description: How to get opportunities showing for the test user; enum casing gotcha
---

## The problem
The nightly scheduler (runs 2 AM daily) populates `user_opportunities`. New/existing test users seeded before the scheduler runs will see 0 opportunities in the app.

## Fix
The seed script (`lib/db/src/seed.ts`) now assigns all active system opportunities to the test user during seed. Re-running the seed is idempotent — it skips existing assignments.

Run: `DATABASE_URL="$DATABASE_URL" TESTING_MODE=true tsx lib/db/src/seed.ts`

## Enum casing
The `userOpportunities.status` enum values in the DB schema use **UPPERCASE**: `"AVAILABLE"`, `"UPCOMING"`, `"COMPLETED"`, `"MISSED"`. Writing `"available"` (lowercase) causes a TypeScript error.

**Why:** Drizzle-orm pgEnum uses the exact string passed to `pgEnum()`. The schema defines `["AVAILABLE", "UPCOMING", "COMPLETED", "MISSED"]`.

**How to apply:** Always use uppercase status values when inserting into `userOpportunities`.
