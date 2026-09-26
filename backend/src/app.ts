import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import activitiesRoutes from "./routes/activities.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import { sendSuccess } from "./utils/response.js";

const rawAllowedOrigins = [
  ...env.FRONTEND_URL.split(","),
  "https://pulse-flow-eosin.vercel.app",
];

const allowedOrigins = Array.from(
  new Set(rawAllowedOrigins.map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean))
);

export const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.trim().replace(/\/+$/, "");
    if (allowedOrigins.includes(normalizedOrigin) || (env.NODE_ENV === "development" && /^http:\/\/localhost:517\d$/.test(normalizedOrigin))) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy error: Origin not allowed"), false);
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json(
    sendSuccess({ status: "ok" }, "API is healthy"),
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/projects", activitiesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
