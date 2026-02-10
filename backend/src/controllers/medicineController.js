import Medicine from "../models/Medicine.js";
import MedicineLog from "../models/MedicineLog.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

/**
 * @desc    Create new medicine
 * @route   POST /api/medicine/create
 * @access  Private
 */
export const createMedicine = asyncHandler(async (req, res) => {
  const {
    medicineName,
    dosage,
    frequency,
    timings,
    startDate,
    endDate,
    instructions,
    prescribedBy,
    category,
    color,
    remindersEnabled,
  } = req.body;

  const medicine = await Medicine.create({
    userId: req.user._id,
    medicineName,
    dosage,
    frequency,
    timings,
    startDate,
    endDate,
    instructions,
    prescribedBy,
    category,
    color,
    remindersEnabled,
  });

  res.status(201).json({
    success: true,
    message: "Medicine added successfully",
    data: { medicine },
  });
});

/**
 * @desc    Get all medicines for user
 * @route   GET /api/medicine/all
 * @access  Private
 */
export const getAllMedicines = asyncHandler(async (req, res) => {
  const { active, category, search } = req.query;

  const query = { userId: req.user._id };

  // Filter by active status
  if (active === "true") {
    query.isActive = true;
    query.startDate = { $lte: new Date() };
    query.$or = [{ endDate: null }, { endDate: { $gte: new Date() } }];
  } else if (active === "false") {
    query.$or = [
      { isActive: false },
      { endDate: { $lt: new Date() } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Search by name
  if (search) {
    query.medicineName = { $regex: search, $options: "i" };
  }

  const medicines = await Medicine.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: medicines.length,
    data: { medicines },
  });
});

/**
 * @desc    Get single medicine
 * @route   GET /api/medicine/:id
 * @access  Private
 */
export const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { medicine },
  });
});

/**
 * @desc    Update medicine
 * @route   PUT /api/medicine/:id
 * @access  Private
 */
export const updateMedicine = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "medicineName",
    "dosage",
    "frequency",
    "timings",
    "startDate",
    "endDate",
    "instructions",
    "prescribedBy",
    "category",
    "color",
    "isActive",
    "remindersEnabled",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const medicine = await Medicine.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Medicine updated successfully",
    data: { medicine },
  });
});

/**
 * @desc    Delete medicine
 * @route   DELETE /api/medicine/:id
 * @access  Private
 */
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  // Also delete associated logs
  await MedicineLog.deleteMany({ medicineId: req.params.id });

  res.status(200).json({
    success: true,
    message: "Medicine deleted successfully",
  });
});

/**
 * @desc    Get today's active medicines
 * @route   GET /api/medicine/today
 * @access  Private
 */
export const getTodayMedicines = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const medicines = await Medicine.find({
    userId: req.user._id,
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [{ endDate: null }, { endDate: { $gte: today } }],
  });

  // Get today's logs to check status
  const todayLogs = await MedicineLog.getTodayLogs(req.user._id);

  // Map medicines with their log status
  const medicinesWithStatus = medicines.map((med) => {
    const logs = todayLogs.filter(
      (log) => log.medicineId._id.toString() === med._id.toString()
    );

    return {
      ...med.toObject(),
      todayLogs: logs,
    };
  });

  res.status(200).json({
    success: true,
    count: medicinesWithStatus.length,
    data: { medicines: medicinesWithStatus },
  });
});

/**
 * @desc    Toggle medicine active status
 * @route   PATCH /api/medicine/:id/toggle
 * @access  Private
 */
export const toggleMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  medicine.isActive = !medicine.isActive;
  await medicine.save();

  res.status(200).json({
    success: true,
    message: `Medicine ${medicine.isActive ? "activated" : "deactivated"} successfully`,
    data: { medicine },
  });
});

export default {
  createMedicine,
  getAllMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getTodayMedicines,
  toggleMedicine,
};
