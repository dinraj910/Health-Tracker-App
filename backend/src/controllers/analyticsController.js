import MedicineLog from "../models/MedicineLog.js";
import Medicine from "../models/Medicine.js";
import HealthLog from "../models/HealthLog.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

/**
 * @desc    Get weekly analytics
 * @route   GET /api/analytics/weekly
 * @access  Private
 */
export const getWeeklyAnalytics = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const logs = await MedicineLog.find({
    userId: req.user._id,
    date: { $gte: startOfWeek },
    status: { $in: ["taken", "missed", "skipped"] },
  });

  // Group by date
  const dailyStats = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    dailyStats[dateStr] = { taken: 0, missed: 0, skipped: 0, total: 0 };
  }

  logs.forEach((log) => {
    const dateStr = log.date.toISOString().split("T")[0];
    if (dailyStats[dateStr]) {
      dailyStats[dateStr][log.status]++;
      dailyStats[dateStr].total++;
    }
  });

  // Calculate daily adherence
  const weeklyData = Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    ...stats,
    adherence: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 100,
  }));

  // Overall weekly stats
  const totalTaken = logs.filter((l) => l.status === "taken").length;
  const totalMissed = logs.filter((l) => l.status === "missed").length;
  const totalSkipped = logs.filter((l) => l.status === "skipped").length;
  const total = logs.length;

  res.status(200).json({
    success: true,
    data: {
      weeklyData,
      summary: {
        taken: totalTaken,
        missed: totalMissed,
        skipped: totalSkipped,
        total,
        adherenceRate: total > 0 ? Math.round((totalTaken / total) * 100) : 100,
      },
    },
  });
});

/**
 * @desc    Get overall adherence
 * @route   GET /api/analytics/adherence
 * @access  Private
 */
export const getAdherence = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const logs = await MedicineLog.find({
    userId: req.user._id,
    date: { $gte: startDate },
    status: { $in: ["taken", "missed", "skipped"] },
  });

  const totalTaken = logs.filter((l) => l.status === "taken").length;
  const total = logs.length;
  const adherenceRate = total > 0 ? Math.round((totalTaken / total) * 100) : 100;

  // Calculate streak
  const streak = await calculateStreak(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      adherenceRate,
      totalDoses: total,
      takenDoses: totalTaken,
      missedDoses: logs.filter((l) => l.status === "missed").length,
      skippedDoses: logs.filter((l) => l.status === "skipped").length,
      period: `${days} days`,
      streak,
    },
  });
});

/**
 * @desc    Get medicine-wise statistics
 * @route   GET /api/analytics/medicines
 * @access  Private
 */
export const getMedicineStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const medicines = await Medicine.find({ userId: req.user._id, isActive: true });

  const stats = await Promise.all(
    medicines.map(async (medicine) => {
      const logs = await MedicineLog.find({
        userId: req.user._id,
        medicineId: medicine._id,
        date: { $gte: startDate },
        status: { $in: ["taken", "missed", "skipped"] },
      });

      const taken = logs.filter((l) => l.status === "taken").length;
      const total = logs.length;

      return {
        medicineId: medicine._id,
        medicineName: medicine.medicineName,
        dosage: medicine.dosage,
        category: medicine.category,
        color: medicine.color,
        totalDoses: total,
        takenDoses: taken,
        missedDoses: logs.filter((l) => l.status === "missed").length,
        adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 100,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: { medicines: stats },
  });
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  // Get active medicines count
  const activeMedicines = await Medicine.countDocuments({
    userId: req.user._id,
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [{ endDate: null }, { endDate: { $gte: today } }],
  });

  // Get today's medicine logs
  const todayLogs = await MedicineLog.find({
    userId: req.user._id,
    date: { $gte: today, $lte: endOfToday },
  });

  const todayTaken = todayLogs.filter((l) => l.status === "taken").length;
  const todayPending = todayLogs.filter((l) => l.status === "pending").length;

  // Calculate 7-day adherence
  const weeklyAdherence = await MedicineLog.calculateAdherence(req.user._id, 7);

  // Calculate streak
  const streak = await calculateStreak(req.user._id);

  // Get today's health log
  const todayHealthLog = await HealthLog.getTodayLog(req.user._id);

  // Get last 7 days of health logs for sparkline trends
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weeklyHealthLogs = await HealthLog.getRange(req.user._id, weekAgo, endOfToday);

  res.status(200).json({
    success: true,
    data: {
      activeMedicines,
      todayProgress: {
        taken: todayTaken,
        pending: todayPending,
        total: todayLogs.length,
      },
      weeklyAdherence,
      streak,
      todayHealthLog: todayHealthLog || null,
      weeklyHealthLogs: weeklyHealthLogs || [],
    },
  });
});

/**
 * @desc    Get vitals trends (BP, heart rate, weight, blood sugar, SpO2)
 * @route   GET /api/analytics/vitals
 * @access  Private
 */
export const getVitalsTrends = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const logs = await HealthLog.find({
    userId: req.user._id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  // Extract trend data for each vital
  const trends = {
    bloodPressure: [],
    heartRate: [],
    weight: [],
    bloodSugar: [],
    oxygenLevel: [],
  };

  logs.forEach((log) => {
    const dateStr = log.date.toISOString().split("T")[0];

    if (log.bloodPressure?.systolic && log.bloodPressure?.diastolic) {
      trends.bloodPressure.push({
        date: dateStr,
        systolic: log.bloodPressure.systolic,
        diastolic: log.bloodPressure.diastolic,
        status: log.bpStatus,
      });
    }
    if (log.heartRate) {
      trends.heartRate.push({ date: dateStr, value: log.heartRate });
    }
    if (log.weight) {
      trends.weight.push({ date: dateStr, value: log.weight });
    }
    if (log.bloodSugar?.fasting || log.bloodSugar?.postMeal) {
      trends.bloodSugar.push({
        date: dateStr,
        fasting: log.bloodSugar.fasting || null,
        postMeal: log.bloodSugar.postMeal || null,
      });
    }
    if (log.oxygenLevel) {
      trends.oxygenLevel.push({ date: dateStr, value: log.oxygenLevel });
    }
  });

  res.status(200).json({
    success: true,
    data: { trends, period: `${days} days`, count: logs.length },
  });
});

/**
 * @desc    Get wellness trends (mood, sleep, stress, energy, water, steps)
 * @route   GET /api/analytics/wellness
 * @access  Private
 */
export const getWellnessTrends = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const logs = await HealthLog.find({
    userId: req.user._id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  const trends = {
    mood: [],
    sleep: [],
    stress: [],
    energy: [],
    water: [],
    steps: [],
    exercise: [],
  };

  logs.forEach((log) => {
    const dateStr = log.date.toISOString().split("T")[0];

    if (log.mood) {
      trends.mood.push({ date: dateStr, value: log.mood });
    }
    if (log.sleepHours != null) {
      trends.sleep.push({
        date: dateStr,
        hours: log.sleepHours,
        quality: log.sleepQuality || null,
      });
    }
    if (log.stressLevel) {
      trends.stress.push({ date: dateStr, value: log.stressLevel });
    }
    if (log.energyLevel) {
      trends.energy.push({ date: dateStr, value: log.energyLevel });
    }
    if (log.waterIntake != null) {
      trends.water.push({ date: dateStr, value: log.waterIntake });
    }
    if (log.stepsCount != null) {
      trends.steps.push({ date: dateStr, value: log.stepsCount });
    }
    if (log.exerciseMinutes != null) {
      trends.exercise.push({ date: dateStr, value: log.exerciseMinutes });
    }
  });

  res.status(200).json({
    success: true,
    data: { trends, period: `${days} days`, count: logs.length },
  });
});

/**
 * Helper: Calculate consecutive days streak
 */
async function calculateStreak(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const startOfDay = new Date(currentDate);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await MedicineLog.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["taken", "missed", "skipped"] },
    });

    if (logs.length === 0) {
      // No logs for this day, check if it's today (might not have logged yet)
      if (currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }

    const allTaken = logs.every((l) => l.status === "taken");
    if (allTaken) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }

    // Limit check to prevent infinite loops
    if (streak > 365) break;
  }

  return streak;
}

export default {
  getWeeklyAnalytics,
  getAdherence,
  getMedicineStats,
  getDashboardStats,
  getVitalsTrends,
  getWellnessTrends,
};
