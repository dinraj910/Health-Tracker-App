import MedicineLog from "../models/MedicineLog.js";
import Medicine from "../models/Medicine.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

/**
 * @desc    Log medicine as taken
 * @route   POST /api/log/take
 * @access  Private
 */
export const takeMedicine = asyncHandler(async (req, res) => {
  const { medicineId, scheduledTime, notes } = req.body;

  // Verify medicine belongs to user
  const medicine = await Medicine.findOne({
    _id: medicineId,
    userId: req.user._id,
  });

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if log already exists
  let log = await MedicineLog.findOne({
    userId: req.user._id,
    medicineId,
    date: today,
    scheduledTime,
  });

  if (log) {
    // Update existing log
    log.status = "taken";
    log.takenAt = new Date();
    log.notes = notes;
    await log.save();
  } else {
    // Create new log
    log = await MedicineLog.create({
      userId: req.user._id,
      medicineId,
      date: today,
      scheduledTime,
      status: "taken",
      takenAt: new Date(),
      notes,
    });
  }

  await log.populate("medicineId", "medicineName dosage category color");

  res.status(200).json({
    success: true,
    message: "Medicine marked as taken!",
    data: { log },
  });
});

/**
 * @desc    Log medicine as missed/skipped
 * @route   POST /api/log/miss
 * @access  Private
 */
export const missMedicine = asyncHandler(async (req, res) => {
  const { medicineId, scheduledTime, notes, status = "missed" } = req.body;

  // Verify medicine belongs to user
  const medicine = await Medicine.findOne({
    _id: medicineId,
    userId: req.user._id,
  });

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if log already exists
  let log = await MedicineLog.findOne({
    userId: req.user._id,
    medicineId,
    date: today,
    scheduledTime,
  });

  if (log) {
    // Update existing log
    log.status = status === "skipped" ? "skipped" : "missed";
    log.notes = notes;
    await log.save();
  } else {
    // Create new log
    log = await MedicineLog.create({
      userId: req.user._id,
      medicineId,
      date: today,
      scheduledTime,
      status: status === "skipped" ? "skipped" : "missed",
      notes,
    });
  }

  await log.populate("medicineId", "medicineName dosage category color");

  res.status(200).json({
    success: true,
    message: `Medicine marked as ${log.status}`,
    data: { log },
  });
});

/**
 * @desc    Get today's logs
 * @route   GET /api/log/today
 * @access  Private
 */
export const getTodayLogs = asyncHandler(async (req, res) => {
  const logs = await MedicineLog.getTodayLogs(req.user._id);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: { logs },
  });
});

/**
 * @desc    Get log history
 * @route   GET /api/log/history
 * @access  Private
 */
export const getHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate, medicineId, status, page = 1, limit = 20 } = req.query;

  const query = { userId: req.user._id };

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  // Medicine filter
  if (medicineId) {
    query.medicineId = medicineId;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    MedicineLog.find(query)
      .populate("medicineId", "medicineName dosage category color")
      .sort({ date: -1, scheduledTime: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    MedicineLog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: { logs },
  });
});

/**
 * @desc    Get logs for a specific date
 * @route   GET /api/log/date/:date
 * @access  Private
 */
export const getLogsByDate = asyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  date.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const logs = await MedicineLog.find({
    userId: req.user._id,
    date: { $gte: date, $lte: endOfDay },
  }).populate("medicineId", "medicineName dosage category color");

  res.status(200).json({
    success: true,
    count: logs.length,
    data: { logs, date: req.params.date },
  });
});

/**
 * @desc    Update a log
 * @route   PUT /api/log/:id
 * @access  Private
 */
export const updateLog = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const log = await MedicineLog.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!log) {
    return res.status(404).json({
      success: false,
      message: "Log not found",
    });
  }

  if (status) {
    log.status = status;
    if (status === "taken") {
      log.takenAt = new Date();
    }
  }

  if (notes !== undefined) {
    log.notes = notes;
  }

  await log.save();
  await log.populate("medicineId", "medicineName dosage category color");

  res.status(200).json({
    success: true,
    message: "Log updated successfully",
    data: { log },
  });
});

/**
 * @desc    Delete a log
 * @route   DELETE /api/log/:id
 * @access  Private
 */
export const deleteLog = asyncHandler(async (req, res) => {
  const log = await MedicineLog.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!log) {
    return res.status(404).json({
      success: false,
      message: "Log not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Log deleted successfully",
  });
});

export default {
  takeMedicine,
  missMedicine,
  getTodayLogs,
  getHistory,
  getLogsByDate,
  updateLog,
  deleteLog,
};
