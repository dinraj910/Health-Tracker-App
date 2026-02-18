import express from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  addAllergy,
  removeAllergy,
  updateEmergencyContact,
  deactivateAccount,
  updatePassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", updatePassword);
router.put("/avatar", uploadAvatar.single("avatar"), updateAvatar);

// Allergies
router.post("/allergies", addAllergy);
router.delete("/allergies/:allergy", removeAllergy);

// Emergency contact
router.put("/emergency-contact", updateEmergencyContact);

// Account
router.delete("/account", deactivateAccount);

export default router;
