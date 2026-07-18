import app from "./app";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`[Server] HealthAccess backend listening on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

// Handle graceful shutdowns
const shutdown = () => {
  console.log("[Server] Shutting down gracefully...");
  server.close(() => {
    console.log("[Server] Closed active connections.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
