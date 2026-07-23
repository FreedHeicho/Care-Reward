import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import providersRouter from "./providers.js";
import authRouter from "./auth.js";
import userContextRouter from "./userContext.js";
import pointsRouter from "./points.js";
import insuranceRouter from "./insurance.js";
import healthSystemsRouter from "./healthSystems.js";
import notificationsRouter from "./notifications.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(providersRouter);
router.use("/auth", authRouter);
router.use("/user", userContextRouter);
router.use("/points", pointsRouter);
router.use("/admin", insuranceRouter);
router.use(healthSystemsRouter);
router.use(notificationsRouter);

export default router;
