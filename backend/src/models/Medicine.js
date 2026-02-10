import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      maxlength: [100, "Medicine name cannot exceed 100 characters"],
    },
    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true,
      // e.g., "500mg", "10ml", "1 tablet"
    },
    frequency: {
      type: String,
      enum: ["once-daily", "twice-daily", "thrice-daily", "weekly", "as-needed", "custom"],
      default: "once-daily",
    },
    timings: {
      type: [String],
      required: [true, "At least one timing is required"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one timing must be specified",
      },
      // e.g., ["08:00", "14:00", "20:00"] or ["morning", "evening"]
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    endDate: {
      type: Date,
      // Optional - null means indefinite
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [500, "Instructions cannot exceed 500 characters"],
      // e.g., "Take with food", "Avoid dairy"
    },
    prescribedBy: {
      type: String,
      trim: true,
      // Doctor's name
    },
    category: {
      type: String,
      enum: ["tablet", "capsule", "syrup", "injection", "drops", "cream", "inhaler", "other"],
      default: "tablet",
    },
    color: {
      type: String,
      default: "#14b8a6", // teal-500 default
      // For UI card color coding
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    remindersEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
medicineSchema.index({ userId: 1, isActive: 1 });
medicineSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual to check if medicine is currently active based on dates
medicineSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  const started = this.startDate <= now;
  const notEnded = !this.endDate || this.endDate >= now;
  return this.isActive && started && notEnded;
});

// Ensure virtuals are included in JSON
medicineSchema.set("toJSON", { virtuals: true });
medicineSchema.set("toObject", { virtuals: true });

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
