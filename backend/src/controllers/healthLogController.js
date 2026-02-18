import HealthLog from "../models/HealthLog.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

/**
 * @desc    Create or update today's health log
 * @route   POST /api/health-logs
 * @access  Private
 */
export const createOrUpdateLog = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logData = {
        userId: req.user._id,
        date: today,
        ...req.body,
    };

    // Remove fields that shouldn't be set by user
    delete logData._id;
    delete logData.createdAt;
    delete logData.updatedAt;

    // Upsert: create if doesn't exist, update if exists
    const log = await HealthLog.findOneAndUpdate(
        { userId: req.user._id, date: today },
        { $set: logData },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Health log saved successfully",
        data: { log },
    });
});

/**
 * @desc    Get today's health log
 * @route   GET /api/health-logs/today
 * @access  Private
 */
export const getTodayLog = asyncHandler(async (req, res) => {
    const log = await HealthLog.getTodayLog(req.user._id);

    res.status(200).json({
        success: true,
        data: { log: log || null },
    });
});

/**
 * @desc    Get health logs by date range
 * @route   GET /api/health-logs?from=YYYY-MM-DD&to=YYYY-MM-DD
 * @access  Private
 */
export const getLogs = asyncHandler(async (req, res) => {
    const { from, to, limit = 30 } = req.query;

    let fromDate, toDate;

    if (from) {
        fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
    } else {
        // Default: last 30 days
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - parseInt(limit));
        fromDate.setHours(0, 0, 0, 0);
    }

    if (to) {
        toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
    } else {
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
    }

    const logs = await HealthLog.find({
        userId: req.user._id,
        date: { $gte: fromDate, $lte: toDate },
    })
        .sort({ date: -1 })
        .limit(parseInt(limit));

    res.status(200).json({
        success: true,
        data: { logs, count: logs.length },
    });
});

/**
 * @desc    Get a specific health log
 * @route   GET /api/health-logs/:id
 * @access  Private
 */
export const getLogById = asyncHandler(async (req, res) => {
    const log = await HealthLog.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!log) {
        return res.status(404).json({
            success: false,
            message: "Health log not found",
        });
    }

    res.status(200).json({
        success: true,
        data: { log },
    });
});

/**
 * @desc    Update a health log
 * @route   PUT /api/health-logs/:id
 * @access  Private
 */
export const updateLog = asyncHandler(async (req, res) => {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.userId;
    delete updates.date;

    const log = await HealthLog.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!log) {
        return res.status(404).json({
            success: false,
            message: "Health log not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Health log updated successfully",
        data: { log },
    });
});

/**
 * @desc    Delete a health log
 * @route   DELETE /api/health-logs/:id
 * @access  Private
 */
export const deleteLog = asyncHandler(async (req, res) => {
    const log = await HealthLog.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!log) {
        return res.status(404).json({
            success: false,
            message: "Health log not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Health log deleted successfully",
    });
});

export default {
    createOrUpdateLog,
    getTodayLog,
    getLogs,
    getLogById,
    updateLog,
    deleteLog,
};
