import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { getVapidPublicKey } from "../services/pushService.js";

/**
 * @desc    Get notifications for the current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, unreadOnly = false } = req.query;

  const query = { userId: req.user._id };
  if (unreadOnly === "true") query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.json({
    success: true,
    data: { notifications, unreadCount },
  });
});

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  res.json({ success: true, data: { notification } });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: "All notifications marked as read" });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true, message: "Notification deleted" });
});

/**
 * @desc    Get VAPID public key for frontend subscription
 * @route   GET /api/notifications/vapid-key
 * @access  Private
 */
export const getVapidKey = asyncHandler(async (req, res) => {
  const key = getVapidPublicKey();
  if (!key) {
    return res.status(503).json({ success: false, message: "Push notifications not configured" });
  }
  res.json({ success: true, data: { vapidPublicKey: key } });
});

/**
 * @desc    Subscribe to push notifications
 * @route   POST /api/notifications/subscribe
 * @access  Private
 */
export const subscribe = asyncHandler(async (req, res) => {
  const { subscription } = req.body;

  if (!subscription?.endpoint) {
    return res.status(400).json({ success: false, message: "Invalid subscription object" });
  }

  await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });

  res.json({ success: true, message: "Push subscription saved" });
});

/**
 * @desc    Unsubscribe from push notifications
 * @route   DELETE /api/notifications/unsubscribe
 * @access  Private
 */
export const unsubscribe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { pushSubscription: null });
  res.json({ success: true, message: "Unsubscribed from push notifications" });
});
