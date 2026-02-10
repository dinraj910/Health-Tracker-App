import express from "express";
import {
  takeMedicine,
  missMedicine,
  getTodayLogs,
  getHistory,
  getLogsByDate,
  updateLog,
  deleteLog,
} from "../controllers/logController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Log actions
router.post("/take", takeMedicine);
router.post("/miss", missMedicine);

// Log queries
router.get("/today", getTodayLogs);
router.get("/history", getHistory);
router.get("/date/:date", getLogsByDate);

// Log management
router.put("/:id", updateLog);
router.delete("/:id", deleteLog);

export default router;
