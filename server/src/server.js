import "dotenv/config";

import mongoose from "mongoose";

import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT) || 5000;
let server;
let isShuttingDown = false;

const startServer = async () => {
  await connectDatabase();

  server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
