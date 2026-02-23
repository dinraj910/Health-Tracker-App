import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { generateToken } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender, bloodGroup } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already registered. Please login instead.",
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    age,
    gender,
    bloodGroup,
  });

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    success: true,
    message: "Registration successful! Welcome to MediTrack.",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact support.",
    });
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful!",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
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

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    data: { token },
  });
});

/**
 * @desc    Authenticate with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }

  // Verify the Google ID token
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }

  const { sub: googleId, email, name, picture } = payload;

  // Find existing user by googleId or email
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (user) {
    // If user exists with email but no googleId, link the Google account
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }
  } else {
    // Create a new user
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: "google",
      avatar: picture || "",
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact support.",
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Google authentication successful!",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Forgot password – send OTP via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide your email address",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal whether email exists
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset code has been sent.",
    });
  }

  // Block Google-auth users
  if (user.authProvider === "google") {
    return res.status(400).json({
      success: false,
      message: "This account uses Google Sign-In. Please sign in with Google instead.",
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before storing
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  user.passwordResetOTP = hashedOTP;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send email
  try {
    await transporter.sendMail({
      from: `"MediTrack Health" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code – MediTrack",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; border-radius: 16px;">
          <h2 style="color: #e2e8f0; margin-bottom: 8px;">Password Reset</h2>
          <p style="color: #94a3b8; font-size: 14px;">You requested a password reset for your MediTrack account. Use the code below:</p>
          <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #3b82f6;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This code expires in <strong style="color: #e2e8f0;">10 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    // Clear OTP on email failure
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again later.",
    });
  }

  res.status(200).json({
    success: true,
    message: "If an account with that email exists, a reset code has been sent.",
  });
});

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, reset code, and new password",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  // Hash the provided OTP to compare
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({ email }).select(
    "+passwordResetOTP +passwordResetExpires"
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset code",
    });
  }

  // Verify OTP and expiry
  if (
    !user.passwordResetOTP ||
    user.passwordResetOTP !== hashedOTP ||
    user.passwordResetExpires < Date.now()
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset code",
    });
  }

  // Update password and clear OTP
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful! You can now login with your new password.",
  });
});

export default {
  register,
  login,
  logout,
  getMe,
  changePassword,
  googleAuth,
  forgotPassword,
  resetPassword,
};
