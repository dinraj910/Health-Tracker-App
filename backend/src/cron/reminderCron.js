import cron from "node-cron";
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendPushNotification } from "../services/pushService.js";

/**
 * Convert a time string like "08:00" or "morning" into hours/minutes
 */
const parseTime = (timeStr) => {
  const presets = {
    morning: { h: 8, m: 0 },
    afternoon: { h: 13, m: 0 },
    evening: { h: 18, m: 0 },
    night: { h: 21, m: 0 },
    bedtime: { h: 22, m: 0 },
  };

  if (presets[timeStr?.toLowerCase()]) return presets[timeStr.toLowerCase()];

  const [h, m] = (timeStr || "").split(":").map(Number);
  if (!isNaN(h) && !isNaN(m)) return { h, m };

  return null;
};

/**
 * Checks if a given timing string matches the current minute (±1 minute window)
 */
const isTimingDue = (timeStr) => {
  const parsed = parseTime(timeStr);
  if (!parsed) return false;

  const now = new Date();
  const diffMinutes =
    parsed.h * 60 + parsed.m - (now.getHours() * 60 + now.getMinutes());

  return diffMinutes === 0;
};

/**
 * Create a DB notification and send a push notification
 */
const triggerNotification = async (userId, medicine, scheduledTime, pushSubscription) => {
  try {
    const title = "💊 Medicine Reminder";
    const body = `Time to take ${medicine.medicineName} (${medicine.dosage})`;

    // Check if we already sent a reminder for this medicine at this time today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Notification.findOne({
      userId,
      "metadata.medicineId": medicine._id,
      "metadata.scheduledTime": scheduledTime,
      type: "medicine_reminder",
      createdAt: { $gte: today },
    });

    if (existing) return; // already sent today for this dose

    // Save to DB
    await Notification.create({
      userId,
      type: "medicine_reminder",
      title,
      body,
      metadata: {
        medicineId: medicine._id,
        medicineName: medicine.medicineName,
        scheduledTime,
        dosage: medicine.dosage,
      },
    });

    // Send Web Push if user has subscription
    if (pushSubscription?.endpoint) {
      try {
        await sendPushNotification(pushSubscription, {
          title,
          body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          data: {
            medicineId: medicine._id.toString(),
            url: "/today",
          },
          actions: [
            { action: "take", title: "Mark Taken" },
            { action: "dismiss", title: "Dismiss" },
          ],
        });
      } catch (err) {
        if (err.message === "SUBSCRIPTION_EXPIRED") {
          // Clear invalid subscription from user
          await User.findByIdAndUpdate(userId, { pushSubscription: null });
        }
      }
    }
  } catch (err) {
    console.error("[ReminderCron] Error triggering notification:", err.message);
  }
};

/**
 * Main cron job: runs every minute
 */
export const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Get all active medicines with reminders enabled
      const medicines = await Medicine.find({
        isActive: true,
        remindersEnabled: true,
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      });

      if (medicines.length === 0) return;

      // Get unique user IDs
      const userIds = [...new Set(medicines.map((m) => m.userId.toString()))];

      // Fetch users with push subscriptions
      const users = await User.find({ _id: { $in: userIds } }).select(
        "pushSubscription"
      );
      const userMap = Object.fromEntries(
        users.map((u) => [u._id.toString(), u.pushSubscription])
      );

      // Check each medicine's timings
      for (const medicine of medicines) {
        for (const timing of medicine.timings) {
          if (isTimingDue(timing)) {
            const pushSub = userMap[medicine.userId.toString()];
            await triggerNotification(medicine.userId, medicine, timing, pushSub);
          }
        }
      }
    } catch (err) {
      console.error("[ReminderCron] Error:", err.message);
    }
  });

  console.log("[ReminderCron] Medicine reminder cron started (runs every minute)");
};
