import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
const recordsDir = path.join(uploadsDir, "records");
const avatarsDir = path.join(uploadsDir, "avatars");

[uploadsDir, recordsDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Storage configuration for medical records
 */
const recordStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `record-${req.user._id}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Storage configuration for avatars
 */
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});

/**
 * File filter for medical records (PDFs and images)
 */
const recordFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed."),
      false
    );
  }
};

/**
 * File filter for avatars (images only)
 */
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."), false);
  }
};

/**
 * Multer instance for medical records
 * Max file size: 10MB
 */
export const uploadRecord = multer({
  storage: recordStorage,
  fileFilter: recordFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Multer instance for avatars
 * Max file size: 5MB
 */
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Delete file utility
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Get file URL from filename
 */
export const getFileUrl = (filename, type = "records") => {
  return `/uploads/${type}/${filename}`;
};

export default { uploadRecord, uploadAvatar, deleteFile, getFileUrl };
