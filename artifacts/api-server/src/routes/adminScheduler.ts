import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { runOpportunitiesEngine } from "../jobs/scheduler.js";

const adminSchedulerRouter = Router();

/**
 * POST /api/admin/scheduler/run
 * Manually triggers the opportunities engine immediately.
 * Admin-only — use during testing or after bulk opportunity changes.
 */
adminSchedulerRouter.post(
  "/api/admin/scheduler/run",
  requireAuth,
  requireRole("admin", "employer_admin"),
  async (req, res) => {
    try {
      const result = await runOpportunitiesEngine();
      res.json({
        ok: true,
        message: `Engine complete — ${result.assigned} new assignment(s) across ${result.usersProcessed} user(s).`,
        assigned: result.assigned,
        usersProcessed: result.usersProcessed,
      });
    } catch (err) {
      console.error("[adminScheduler] Manual run error:", err);
      res.status(500).json({ error: "Scheduler run failed" });
    }
  },
);

export default adminSchedulerRouter;
