import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// ─── Multer: memory storage (files buffered in RAM, then uploaded to Cloudinary) ───

const memoryStorage = multer.memoryStorage();

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
  storage: memoryStorage,
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
  storage: memoryStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ─── Cloudinary helpers ───

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - Cloudinary folder (e.g., "meditrack/records")
 * @param {string} resourceType - "image" or "auto" (for PDFs)
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} resourceType - "image" or "raw" (for PDFs)
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return false;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

export default { uploadRecord, uploadAvatar, uploadToCloudinary, deleteFromCloudinary };
