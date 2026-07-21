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
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /\.replit\.dev$/,
  /\.replit\.app$/,
  /\.riker\.replit\.dev$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").includes(origin);
  }
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed — ${origin}`));
      }
    },
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
