import express from "express";
import {
    createOrUpdateLog,
    getTodayLog,
    getLogs,
    getLogById,
    updateLog,
    deleteLog,
} from "../controllers/healthLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route("/").get(getLogs).post(createOrUpdateLog);
router.get("/today", getTodayLog);
router.route("/:id").get(getLogById).put(updateLog).delete(deleteLog);

export default router;
