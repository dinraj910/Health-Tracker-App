import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  getVapidKey,
  subscribe,
  unsubscribe,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/vapid-key", getVapidKey);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markAsRead);
router.delete("/unsubscribe", unsubscribe);
router.delete("/:id", deleteNotification);
router.post("/subscribe", subscribe);

export default router;
