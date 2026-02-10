import express from "express";
import {
  uploadRecord,
  getAllRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getRecordsByType,
  toggleImportant,
} from "../controllers/recordController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadRecord as uploadMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Record CRUD
router.post("/upload", uploadMiddleware.single("file"), uploadRecord);
router.get("/all", getAllRecords);
router.get("/type/:type", getRecordsByType);
router.get("/:id", getRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);
router.patch("/:id/important", toggleImportant);

export default router;
