import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Record type is required"],
      enum: [
        "prescription",
        "lab-report",
        "scan",
        "x-ray",
        "mri",
        "ct-scan",
        "blood-test",
        "vaccination",
        "discharge-summary",
        "insurance",
        "other",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    fileType: {
      type: String,
      // e.g., "application/pdf", "image/jpeg"
    },
    fileSize: {
      type: Number,
      // File size in bytes
    },
    recordDate: {
      type: Date,
      default: Date.now,
      // Date of the medical record (e.g., when test was done)
    },
    doctorName: {
      type: String,
      trim: true,
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      // For easy searching/filtering
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
medicalRecordSchema.index({ userId: 1, type: 1 });
medicalRecordSchema.index({ userId: 1, recordDate: -1 });
medicalRecordSchema.index({ userId: 1, tags: 1 });

// Text index for searching
medicalRecordSchema.index({
  title: "text",
  description: "text",
  doctorName: "text",
  hospitalName: "text",
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
