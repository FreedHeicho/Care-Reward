import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import providersRouter from "./providers.js";
import authRouter from "./auth.js";
import userContextRouter from "./userContext.js";
import pointsRouter from "./points.js";
import insuranceRouter from "./insurance.js";
import healthSystemsRouter from "./healthSystems.js";
import notificationsRouter from "./notifications.js";
import adminOpportunitiesRouter from "./adminOpportunities.js";
import adminEmployersRouter from "./adminEmployers.js";
import adminSchedulerRouter from "./adminScheduler.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(providersRouter);
router.use("/auth", authRouter);
router.use("/user", userContextRouter);
router.use("/points", pointsRouter);
router.use("/admin", insuranceRouter);
router.use(healthSystemsRouter);
router.use(notificationsRouter);
// Opportunity Builder admin routes — mounted directly (paths include /admin/ prefix)
router.use(adminOpportunitiesRouter);
router.use(adminEmployersRouter);
router.use(adminSchedulerRouter);

export default router;
