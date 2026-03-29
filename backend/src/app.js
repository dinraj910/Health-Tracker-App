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
  healthLogRoutes,
  reportRoutes,
  drugRoutes,
  prescriptionRoutes,
  notificationRoutes,
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
  "http://localhost:5175",
  "https://meditrack-ecru.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, ""));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 204
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
app.use("/api/health-logs", healthLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/notifications", notificationRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
