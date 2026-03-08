// Export all middleware from a single file
export { protect, generateToken, optionalAuth } from "./authMiddleware.js";
export { errorHandler, notFound, asyncHandler } from "./errorMiddleware.js";
export { uploadRecord, uploadAvatar, uploadToCloudinary, deleteFromCloudinary } from "./uploadMiddleware.js";
