import "dotenv/config";

import cors from "cors";
import express from "express";
import morgan from "morgan";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import {
  applySecurityHeaders,
  attachRequestId,
  noStore,
} from "./middleware/securityMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { getAssistantStatus } from "./services/assistantService.js";

export const app = express();
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";
const startedAt = new Date().toISOString();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(attachRequestId);
app.use(applySecurityHeaders);
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Velora API is running.",
    assistant: getAssistantStatus(),
    timestamp: new Date().toISOString(),
    startedAt,
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", noStore, authRoutes);
app.use("/api/chats", chatRoutes);

app.use(notFound);
app.use(errorHandler);
