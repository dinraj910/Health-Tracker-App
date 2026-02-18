import mongoose from "mongoose";

const healthLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            index: true,
        },

        // ── Vital Signs ──
        bloodPressure: {
            systolic: {
                type: Number,
                min: [50, "Systolic must be at least 50"],
                max: [300, "Systolic cannot exceed 300"],
            },
            diastolic: {
                type: Number,
                min: [30, "Diastolic must be at least 30"],
                max: [200, "Diastolic cannot exceed 200"],
            },
        },
        heartRate: {
            type: Number,
            min: [30, "Heart rate must be at least 30"],
            max: [250, "Heart rate cannot exceed 250"],
        },
        bodyTemp: {
            type: Number,
            min: [90, "Body temp must be at least 90°F"],
            max: [110, "Body temp cannot exceed 110°F"],
        },
        oxygenLevel: {
            type: Number,
            min: [50, "SpO2 must be at least 50%"],
            max: [100, "SpO2 cannot exceed 100%"],
        },

        // ── Body Metrics ──
        weight: {
            type: Number,
            min: [1, "Weight must be at least 1 kg"],
            max: [500, "Weight cannot exceed 500 kg"],
        },
        bloodSugar: {
            fasting: {
                type: Number,
                min: [20, "Fasting blood sugar must be at least 20"],
                max: [600, "Fasting blood sugar cannot exceed 600"],
            },
            postMeal: {
                type: Number,
                min: [20, "Post-meal blood sugar must be at least 20"],
                max: [600, "Post-meal blood sugar cannot exceed 600"],
            },
        },

        // ── Lifestyle ──
        waterIntake: {
            type: Number,
            min: [0, "Water intake cannot be negative"],
            max: [30, "Water intake cannot exceed 30 glasses"],
        },
        sleepHours: {
            type: Number,
            min: [0, "Sleep hours cannot be negative"],
            max: [24, "Sleep hours cannot exceed 24"],
        },
        sleepQuality: {
            type: String,
            enum: ["poor", "fair", "good", "excellent"],
        },
        stepsCount: {
            type: Number,
            min: [0, "Steps cannot be negative"],
            max: [100000, "Steps cannot exceed 100,000"],
        },
        exerciseMinutes: {
            type: Number,
            min: [0, "Exercise minutes cannot be negative"],
            max: [1440, "Exercise minutes cannot exceed 1440"],
        },

        // ── Wellness ──
        mood: {
            type: String,
            enum: ["terrible", "bad", "okay", "good", "great"],
        },
        stressLevel: {
            type: Number,
            min: 1,
            max: 5,
        },
        energyLevel: {
            type: Number,
            min: 1,
            max: 5,
        },

        // ── Symptoms ──
        symptoms: {
            type: [String],
            default: [],
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// One log per user per day
healthLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for range queries
healthLogSchema.index({ userId: 1, date: -1 });

// Static: Get today's log for a user
healthLogSchema.statics.getTodayLog = async function (userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.findOne({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay },
    });
};

// Static: Get logs for a date range
healthLogSchema.statics.getRange = async function (userId, fromDate, toDate) {
    return this.find({
        userId,
        date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: 1 });
};

// Virtual: BMI (if weight + user height available — calculated in controller)
// Virtual: BP status
healthLogSchema.virtual("bpStatus").get(function () {
    if (!this.bloodPressure?.systolic || !this.bloodPressure?.diastolic) return null;
    const { systolic, diastolic } = this.bloodPressure;

    if (systolic < 90 || diastolic < 60) return "low";
    if (systolic < 120 && diastolic < 80) return "normal";
    if (systolic < 130 && diastolic < 80) return "elevated";
    if (systolic < 140 || diastolic < 90) return "high-stage1";
    return "high-stage2";
});

healthLogSchema.set("toJSON", { virtuals: true });
healthLogSchema.set("toObject", { virtuals: true });

const HealthLog = mongoose.model("HealthLog", healthLogSchema);

export default HealthLog;
