import express from "express";
import {
  createMedicine,
  getAllMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getTodayMedicines,
  toggleMedicine,
} from "../controllers/medicineController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Medicine CRUD
router.post("/create", createMedicine);
router.get("/all", getAllMedicines);
router.get("/today", getTodayMedicines);
router.get("/:id", getMedicine);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);
router.patch("/:id/toggle", toggleMedicine);

export default router;
