import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/uploadMiddleware.js";

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "name",
    "phone",
    "age",
    "gender",
    "bloodGroup",
    "allergies",
    "emergencyContact",
    "height",
    "weight",
    "dateOfBirth",
    "chronicConditions",
    "currentDoctors",
    "insuranceInfo",
    "smokingStatus",
    "alcoholUse",
    "activityLevel",
    "dietaryPreference",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

/**
 * @desc    Update avatar (upload to Cloudinary)
 * @route   PUT /api/user/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image",
    });
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary if exists
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId, "image");
  }

  // Upload new avatar to Cloudinary
  const cloudinaryResult = await uploadToCloudinary(
    req.file.buffer,
    "meditrack/avatars",
    "image"
  );

  user.avatar = cloudinaryResult.secure_url;
  user.avatarPublicId = cloudinaryResult.public_id;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    data: { avatar: cloudinaryResult.secure_url },
  });
});

/**
 * @desc    Add allergy
 * @route   POST /api/user/allergies
 * @access  Private
 */
export const addAllergy = asyncHandler(async (req, res) => {
  const { allergy } = req.body;

  if (!allergy || !allergy.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide an allergy",
    });
  }

  const user = await User.findById(req.user._id);

  // Check if allergy already exists
  if (user.allergies.includes(allergy.trim())) {
    return res.status(400).json({
      success: false,
      message: "Allergy already added",
    });
  }

  user.allergies.push(allergy.trim());
  await user.save();

  res.status(200).json({
    success: true,
    message: "Allergy added successfully",
    data: { allergies: user.allergies },
  });
});

/**
 * @desc    Remove allergy
 * @route   DELETE /api/user/allergies/:allergy
 * @access  Private
 */
export const removeAllergy = asyncHandler(async (req, res) => {
  const { allergy } = req.params;

  const user = await User.findById(req.user._id);

  const index = user.allergies.indexOf(allergy);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Allergy not found",
    });
  }

  user.allergies.splice(index, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Allergy removed successfully",
    data: { allergies: user.allergies },
  });
});

/**
 * @desc    Update emergency contact
 * @route   PUT /api/user/emergency-contact
 * @access  Private
 */
export const updateEmergencyContact = asyncHandler(async (req, res) => {
  const { name, phone, relationship } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        emergencyContact: { name, phone, relationship },
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Emergency contact updated successfully",
    data: { emergencyContact: user.emergencyContact },
  });
});

/**
 * @desc    Deactivate account
 * @route   DELETE /api/user/account
 * @access  Private
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.status(200).json({
    success: true,
    message: "Account deactivated successfully",
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/user/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  // Get user with password field
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save(); // pre-save hook will hash the password

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

export default {
  getProfile,
  updateProfile,
  updateAvatar,
  addAllergy,
  removeAllergy,
  updateEmergencyContact,
  deactivateAccount,
  updatePassword,
};
