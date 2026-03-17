import express from "express";
import multer from "multer";
import Groq from "groq-sdk";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Use memory storage — image is NEVER written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Wrap multer in a promise so it works cleanly with Express 5's async error handling
function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("prescription")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const SYSTEM_PROMPT = `You are an expert clinical pharmacist with decades of experience reading highly illegible handwritten doctor prescriptions from India.

Analyze the prescription image carefully and extract all medicines and their usage instructions.

Return ONLY a valid JSON array (no markdown, no backticks, no explanation text) in this exact format:
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
router.post("/scan", protect, async (req, res) => {
  try {
    // Run multer via promise (Express 5 compatible)
    try {
      await runMulter(req, res);
    } catch (multerErr) {
      return res.status(400).json({
        success: false,
        message: multerErr.message || "File upload failed. Please try again.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No prescription image uploaded. Please attach an image.",
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return res.status(503).json({
        success: false,
        message: "AI service is not configured. Please add GROQ_API_KEY to the backend .env file.",
      });
    }

    const groq = new Groq({ apiKey: apiKey.trim() });

    // Convert buffer to base64 data URL for Groq vision
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const rawText = response.choices[0]?.message?.content?.trim() ?? "";

    // Parse and validate JSON response
    let medicines = [];
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawText
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      medicines = JSON.parse(cleaned);
      if (!Array.isArray(medicines)) {
        medicines = [];
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", rawText);
      return res.status(200).json({
        success: true,
        medicines: [],
        message:
          "The prescription was analyzed but could not be structured. The handwriting may be too unclear.",
        rawResponse: rawText,
      });
    }

    // Image is in memory only and will be garbage collected — never stored on disk
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
    console.error("Prescription scan error:", error?.message || error);

    if (error.status === 401 || error.message?.includes("Invalid API Key")) {
      return res.status(401).json({
        success: false,
        message: "Invalid Groq API key. Please check your GROQ_API_KEY in the backend .env file.",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI service quota exceeded. Please try again in a few moments.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to analyze the prescription. Please try again with a clearer, well-lit image.",
    });
  }
});

export default router;
