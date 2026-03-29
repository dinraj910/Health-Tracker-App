import express from "express";
import {
  getWeeklyAnalytics,
  getAdherence,
  getMedicineStats,
  getDashboardStats,
  getVitalsTrends,
  getWellnessTrends,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/cache.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Analytics endpoints
router.get("/weekly", cacheMiddleware(req => `weekly:${req.user._id}:${req.query.days || 7}`, 300), getWeeklyAnalytics);
router.get("/adherence", cacheMiddleware(req => `adherence:${req.user._id}:${req.query.days || 30}`, 300), getAdherence);
router.get("/medicines", cacheMiddleware(req => `medicines:${req.user._id}:${req.query.days || 30}`, 300), getMedicineStats);
router.get("/dashboard", cacheMiddleware(req => `dashboard:${req.user._id}`, 120), getDashboardStats);
router.get("/vitals", cacheMiddleware(req => `vitals:${req.user._id}:${req.query.days || 7}`, 300), getVitalsTrends);
router.get("/wellness", cacheMiddleware(req => `wellness:${req.user._id}:${req.query.days || 7}`, 300), getWellnessTrends);

export default router;
