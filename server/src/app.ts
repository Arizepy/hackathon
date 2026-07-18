import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

// Routes & Middlewares
import authRoutes from "./routes/auth.routes";
import stationsRoutes from "./routes/stations.routes";
import catalogRoutes from "./routes/catalog.routes";
import ordersRoutes from "./routes/orders.routes";
import masterRoutes from "./routes/master.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "*"],
        imgSrc: ["'self'", "data:", "https://*"],
      },
    },
  })
);

// CORS config
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login Rate Limiter (maximum 15 login attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many login attempts, please try again after 15 minutes.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register routes
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/stations", stationsRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api", masterRoutes); // Facilities, Shifts, Training, Patients directly under /api

// Static assets serving in production
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// Fallback to index.html for React SPA Router (wouter) support
app.get("*", (req, res, next) => {
  // If the request starts with /api, pass it to error handler or 404
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `API Route not found: ${req.method} ${req.path}`,
      },
    });
  }
  
  // Serve the index.html
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) {
      // In development or if index.html is missing, pass to next
      res.status(404).send("Not Found");
    }
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
