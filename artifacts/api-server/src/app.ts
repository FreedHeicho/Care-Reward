import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { startScheduler } from "./jobs/scheduler.js";
import { pool } from "@workspace/db";

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [
      "http://localhost:8081",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(compression({ threshold: 1024, level: 6 }) as express.RequestHandler);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use("/api", router);

startScheduler();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received — closing DB pool");
  await pool.end();
  process.exit(0);
});

export default app;
