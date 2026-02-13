import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import {
  authRoutes,
  userRoutes,
  medicineRoutes,
  logRoutes,
  recordRoutes,
  analyticsRoutes,
} from "./routes/index.js";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===========================================
// MIDDLEWARE
// ===========================================

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, be more permissive
      if (process.env.NODE_ENV !== 'production' && origin?.includes('localhost')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ===========================================
// API ROUTES
// ===========================================

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏥 MediTrack API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime(),
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/log", logRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/analytics", analyticsRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
