import express from "express";
import {
  getWeeklyAnalytics,
  getAdherence,
  getMedicineStats,
  getDashboardStats,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Analytics endpoints
router.get("/weekly", getWeeklyAnalytics);
router.get("/adherence", getAdherence);
router.get("/medicines", getMedicineStats);
router.get("/dashboard", getDashboardStats);

export default router;
