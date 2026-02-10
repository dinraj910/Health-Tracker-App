import MedicalRecord from "../models/MedicalRecord.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { deleteFile } from "../middleware/uploadMiddleware.js";
import path from "path";

/**
 * @desc    Upload medical record
 * @route   POST /api/records/upload
 * @access  Private
 */
export const uploadRecord = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a file",
    });
  }

  const {
    title,
    type,
    description,
    recordDate,
    doctorName,
    hospitalName,
    tags,
    isImportant,
  } = req.body;

  const record = await MedicalRecord.create({
    userId: req.user._id,
    title,
    type,
    description,
    fileUrl: `/uploads/records/${req.file.filename}`,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    recordDate: recordDate || new Date(),
    doctorName,
    hospitalName,
    tags: tags ? JSON.parse(tags) : [],
    isImportant: isImportant === "true",
  });

  res.status(201).json({
    success: true,
    message: "Record uploaded successfully",
    data: { record },
  });
});

/**
 * @desc    Get all records
 * @route   GET /api/records/all
 * @access  Private
 */
export const getAllRecords = asyncHandler(async (req, res) => {
  const { type, search, important, page = 1, limit = 20 } = req.query;

  const query = { userId: req.user._id };

  // Filter by type
  if (type) {
    query.type = type;
  }

  // Filter by importance
  if (important === "true") {
    query.isImportant = true;
  }

  // Search in title, description, doctor, hospital
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [records, total] = await Promise.all([
    MedicalRecord.find(query)
      .sort({ recordDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    MedicalRecord.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: { records },
  });
});

/**
 * @desc    Get single record
 * @route   GET /api/records/:id
 * @access  Private
 */
export const getRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { record },
  });
});

/**
 * @desc    Update record
 * @route   PUT /api/records/:id
 * @access  Private
 */
export const updateRecord = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "title",
    "type",
    "description",
    "recordDate",
    "doctorName",
    "hospitalName",
    "tags",
    "isImportant",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "tags" && typeof req.body[field] === "string") {
        updates[field] = JSON.parse(req.body[field]);
      } else if (field === "isImportant") {
        updates[field] = req.body[field] === "true" || req.body[field] === true;
      } else {
        updates[field] = req.body[field];
      }
    }
  });

  const record = await MedicalRecord.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Record updated successfully",
    data: { record },
  });
});

/**
 * @desc    Delete record
 * @route   DELETE /api/records/:id
 * @access  Private
 */
export const deleteRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // Delete the file from storage
  const filePath = path.join(process.cwd(), record.fileUrl);
  deleteFile(filePath);

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Record deleted successfully",
  });
});

/**
 * @desc    Get records by type
 * @route   GET /api/records/type/:type
 * @access  Private
 */
export const getRecordsByType = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({
    userId: req.user._id,
    type: req.params.type,
  }).sort({ recordDate: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: { records },
  });
});

/**
 * @desc    Toggle record importance
 * @route   PATCH /api/records/:id/important
 * @access  Private
 */
export const toggleImportant = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  record.isImportant = !record.isImportant;
  await record.save();

  res.status(200).json({
    success: true,
    message: `Record marked as ${record.isImportant ? "important" : "not important"}`,
    data: { record },
  });
});

export default {
  uploadRecord,
  getAllRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getRecordsByType,
  toggleImportant,
};
