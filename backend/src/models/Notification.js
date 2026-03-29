import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "medicine_reminder",
        "dose_taken",
        "dose_missed",
        "dose_skipped",
        "medicine_added",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
      medicineName: String,
      scheduledTime: String,
      dosage: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user notification queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
