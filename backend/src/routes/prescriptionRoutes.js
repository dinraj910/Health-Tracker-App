import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Use memory storage — image is NEVER written to disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const SYSTEM_PROMPT = `You are an expert clinical pharmacist with decades of experience reading highly illegible handwritten doctor prescriptions from India.

Analyze this prescription image carefully and extract all medicines and their usage instructions.

Return ONLY a valid JSON array (no markdown, no backticks, no explanation) in this exact format:
[
  {
    "name": "Medicine name (brand or generic as written)",
    "dosage": "Strength/dose e.g. 500mg, 10ml",
    "frequency": "How often e.g. Twice daily, 1-0-1, TDS",
    "duration": "How many days e.g. 5 days, 1 week",
    "instructions": "Special instructions e.g. After food, Before bed, With water",
    "quantity": "Total quantity if mentioned e.g. 10 tablets"
  }
]

If you cannot read a field clearly, use "Not specified". If the prescription is completely unreadable or no medicines are found, return an empty array []. Do NOT include any text outside the JSON array.`;

// POST /api/prescription/scan
router.post("/scan", protect, upload.single("prescription"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No prescription image uploaded. Please attach an image.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "AI service is not configured. Please contact support.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert buffer to base64 for Gemini vision
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const rawText = result.response.text().trim();

    // Parse and validate JSON response
    let medicines = [];
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawText.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
      medicines = JSON.parse(cleaned);
      if (!Array.isArray(medicines)) {
        medicines = [];
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", rawText);
      return res.status(200).json({
        success: true,
        medicines: [],
        message: "The prescription was analyzed but could not be parsed into a structured list. The handwriting may be too unclear.",
        rawResponse: rawText,
      });
    }

    // Image is in memory and will be garbage collected — never stored on disk
    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
      message:
        medicines.length > 0
          ? `Successfully extracted ${medicines.length} medicine(s) from the prescription.`
          : "No medicines could be identified from the prescription.",
    });
  } catch (error) {
    console.error("Prescription scan error:", error);

    if (error.message?.includes("API_KEY") || error.message?.includes("API key")) {
      return res.status(500).json({ success: false, message: "AI service authentication failed." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to analyze the prescription. Please try again with a clearer image.",
    });
  }
});

export default router;
