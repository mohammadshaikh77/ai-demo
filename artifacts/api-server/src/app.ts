import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const clerkEnabled = !!(CLERK_PUBLISHABLE_KEY && CLERK_SECRET_KEY);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

if (clerkEnabled) {
  const { clerkMiddleware } = await import("@clerk/express");
  const { CLERK_PROXY_PATH, clerkProxyMiddleware } = await import("./middlewares/clerkProxyMiddleware");
  app.use(CLERK_PROXY_PATH, clerkProxyMiddleware() as RequestHandler);
  app.use(clerkMiddleware());
  logger.info("Clerk authentication enabled");
} else {
  logger.warn("Clerk keys not configured — authentication is disabled. All API routes are unauthenticated.");
}

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
