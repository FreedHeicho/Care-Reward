import { Router } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { users, insurancePlans, hsaAccounts, auditLogs } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

interface InsuranceRow {
  email: string;
  planName: string;
  monthlyPremium: string;
  deductible?: string;
  hsaEligible?: string;
  employerName?: string;
}

// POST /api/admin/insurance/import
router.post(
  "/insurance/import",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    // CRIT-001: only admin and employer_admin roles may import insurance data
    if (req.userRole !== "admin" && req.userRole !== "employer_admin") {
      db.insert(auditLogs)
        .values({
          userId: req.userId,
          action: "POST /insurance/import",
          resourceType: "api",
          ipAddress: String(req.ip ?? ""),
          outcome: "BLOCKED",
          failureReason: `Insufficient role: ${req.userRole}`,
        })
        .catch(() => {});
      res.status(403).json({ error: "Admin or employer_admin role required" });
      return;
    }

    const { fileType, effectiveDate, expirationDate } = req.body as {
      fileType?: string;
      effectiveDate?: string;
      expirationDate?: string;
    };

    if (!req.file) {
      res.status(400).json({ error: "file is required" });
      return;
    }
    if (!fileType || !["json", "csv"].includes(fileType)) {
      res.status(400).json({ error: "fileType must be 'json' or 'csv'" });
      return;
    }

    let rows: InsuranceRow[] = [];
    try {
      if (fileType === "json") {
        rows = JSON.parse(req.file.buffer.toString("utf8"));
      } else {
        rows = parse(req.file.buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }) as InsuranceRow[];
      }
    } catch {
      res.status(400).json({ error: "Failed to parse file" });
      return;
    }

    const results = { totalRecords: rows.length, imported: 0, skipped: 0, errors: [] as string[] };

    for (const row of rows) {
      if (!row.email) {
        results.skipped++;
        results.errors.push("Row missing email");
        continue;
      }
      try {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, row.email.toLowerCase()))
          .limit(1);

        if (!user) {
          results.skipped++;
          results.errors.push(`User not found: ${row.email}`);
          continue;
        }

        // Deactivate existing active plans
        await db
          .update(insurancePlans)
          .set({ isActive: false })
          .where(and(eq(insurancePlans.userId, user.id), eq(insurancePlans.isActive, true)));

        await db.insert(insurancePlans).values({
          userId: user.id,
          planName: row.planName ?? "Imported Plan",
          monthlyPremium: row.monthlyPremium ?? "0.00",
          deductible: row.deductible,
          effectiveDate: effectiveDate ?? new Date().toISOString().slice(0, 10),
          expirationDate: expirationDate ?? `${new Date().getFullYear()}-12-31`,
          isActive: true,
        });

        if (row.hsaEligible === "true" || row.hsaEligible === "1") {
          await db
            .insert(hsaAccounts)
            .values({
              userId: user.id,
              yearlyLimit: "4400.00",
              ytdContribution: "0.00",
              currentBalance: "0.00",
            })
            .onConflictDoNothing();
        }

        results.imported++;
      } catch (err) {
        results.errors.push(`${row.email}: ${String(err)}`);
        results.skipped++;
      }
    }

    res.json({ success: true, ...results });
  },
);

// GET /api/admin/insurance/template/json
router.get("/insurance/template/json", requireAuth, (_req, res) => {
  res.json([
    {
      email: "employee@example.com",
      planName: "Aetna HDHP Gold",
      monthlyPremium: "450.00",
      deductible: "1500.00",
      hsaEligible: "true",
    },
  ]);
});

// GET /api/admin/insurance/template/csv
router.get("/insurance/template/csv", requireAuth, (_req, res) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=insurance-template.csv");
  res.send(
    "email,planName,monthlyPremium,deductible,hsaEligible\n" +
      "employee@example.com,Aetna HDHP Gold,450.00,1500.00,true\n",
  );
});

export default router;
