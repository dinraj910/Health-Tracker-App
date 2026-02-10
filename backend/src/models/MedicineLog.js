import mongoose from "mongoose";

const medicineLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: [true, "Medicine ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    scheduledTime: {
      type: String,
      required: [true, "Scheduled time is required"],
      // e.g., "08:00", "morning"
    },
    status: {
      type: String,
      enum: ["taken", "missed", "skipped", "pending"],
      default: "pending",
    },
    takenAt: {
      type: Date,
      // Actual time when medicine was taken
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
medicineLogSchema.index({ userId: 1, date: 1 });
medicineLogSchema.index({ userId: 1, medicineId: 1, date: 1 });
medicineLogSchema.index({ userId: 1, status: 1, date: 1 });

// Prevent duplicate logs for same medicine at same scheduled time on same day
medicineLogSchema.index(
  { userId: 1, medicineId: 1, date: 1, scheduledTime: 1 },
  { unique: true }
);

// Static method to get today's logs for a user
medicineLogSchema.statics.getTodayLogs = async function (userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).populate("medicineId", "medicineName dosage category color");
};

// Static method to calculate adherence rate
medicineLogSchema.statics.calculateAdherence = async function (userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const logs = await this.find({
    userId,
    date: { $gte: startDate },
    status: { $in: ["taken", "missed", "skipped"] },
  });
  
  if (logs.length === 0) return 100;
  
  const takenCount = logs.filter((log) => log.status === "taken").length;
  return Math.round((takenCount / logs.length) * 100);
};

const MedicineLog = mongoose.model("MedicineLog", medicineLogSchema);

export default MedicineLog;
