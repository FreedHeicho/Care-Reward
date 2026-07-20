import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const t0 = Date.now();
  let dbOk = false;
  try {
    await pool.query("SELECT 1");
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const responseTimeMs = Date.now() - t0;
  const status = dbOk ? "healthy" : "degraded";
  res.status(dbOk ? 200 : 503).json({ status, db: dbOk, responseTimeMs });
});

export default router;
