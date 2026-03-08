import express from "express";
import {
  getHealthSummary,
  downloadHealthReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Health report endpoints
router.get("/health-summary", getHealthSummary);
router.get("/download-pdf", downloadHealthReport);

export default router;
