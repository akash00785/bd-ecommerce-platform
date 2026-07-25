import app from "./app.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

// Graceful shutdown: allow in-flight requests and DB transactions to finish
// before the process exits. Without this, a SIGTERM (from deploy/restart)
// would kill the process mid-transaction, potentially corrupting order data.

process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully...");
  server.close(() => {
    logger.info("HTTP server closed. Exiting.");
    process.exit(0);
  });
  // Force-exit after 10s if connections don't drain in time
  setTimeout(() => {
    logger.warn("Graceful shutdown timed out — forcing exit.");
    process.exit(1);
  }, 10_000).unref();
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully...");
  server.close(() => {
    logger.info("HTTP server closed. Exiting.");
    process.exit(0);
  });
});
