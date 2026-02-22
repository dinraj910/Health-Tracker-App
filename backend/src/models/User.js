import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authProvider === "local";
        },
        "Password is required",
      ],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
      default: "unknown",
    },
    allergies: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },

    // ── Physical Info ──
    height: {
      type: Number,
      min: [30, "Height must be at least 30 cm"],
      max: [300, "Height cannot exceed 300 cm"],
    },
    weight: {
      type: Number,
      min: [1, "Weight must be at least 1 kg"],
      max: [500, "Weight cannot exceed 500 kg"],
    },
    dateOfBirth: {
      type: Date,
    },

    // ── Medical Profile ──
    chronicConditions: {
      type: [String],
      default: [],
    },
    currentDoctors: [
      {
        name: { type: String, trim: true },
        specialty: { type: String, trim: true },
        hospital: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
    ],
    insuranceInfo: {
      provider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
      validTill: { type: Date },
    },

    // ── Lifestyle ──
    smokingStatus: {
      type: String,
      enum: ["never", "former", "current", "occasional"],
    },
    alcoholUse: {
      type: String,
      enum: ["never", "none", "social", "occasional", "moderate", "heavy"],
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very-active", "intense"],
    },
    dietaryPreference: {
      type: String,
      enum: ["none", "vegetarian", "non-vegetarian", "vegan", "keto", "other"],
    },

    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
