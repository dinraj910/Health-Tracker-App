import MedicineLog from "../models/MedicineLog.js";
import Medicine from "../models/Medicine.js";
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

  // Get today's logs
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
    },
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
};
