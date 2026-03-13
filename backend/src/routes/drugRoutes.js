import express from "express";
import {
  searchDrugsByName,
  getDrugDetails,
  browseDrugsByCategory,
} from "../controllers/drugController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Drug database endpoints
router.get("/search", searchDrugsByName);
router.get("/category/:category", browseDrugsByCategory);
router.get("/:id", getDrugDetails);

export default router;
