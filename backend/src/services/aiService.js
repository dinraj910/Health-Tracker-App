/**
 * AI Service — Multi-Provider Fallback Chain
 *
 * Tries 5 free AI APIs in order until one succeeds:
 *  1. Groq (Llama 3.3 70B) — Fastest, free tier
 *  2. Google Gemini (gemini-2.0-flash) — Free 15 RPM
 *  3. HuggingFace Inference (Mistral 7B) — Free tier
 *  4. Cohere (Command-R) — Free trial
 *  5. Mistral AI (mistral-small) — Free tier
 */

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import { CohereClientV2 } from "cohere-ai";
import { Mistral } from "@mistralai/mistralai";

// ─── Provider Configurations ───

const providers = [
  {
    name: "Groq",
    enabled: !!process.env.GROQ_API_KEY,
    generate: async (prompt) => {
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are MediTrack AI, a professional health analytics assistant. Provide clear, concise medical health summaries. Use professional medical terminology but keep it understandable. Always include disclaimers that this is AI-generated and not a substitute for professional medical advice.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content;
    },
  },
  {
    name: "Gemini",
    enabled: !!process.env.GEMINI_API_KEY,
    generate: async (prompt) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const systemPrompt =
        "You are MediTrack AI, a professional health analytics assistant. Provide clear, concise medical health summaries. Use professional medical terminology but keep it understandable. Always include disclaimers that this is AI-generated and not a substitute for professional medical advice.\n\n";
      const result = await model.generateContent(systemPrompt + prompt);
      return result.response.text();
    },
  },
  {
    name: "HuggingFace",
    enabled: !!process.env.HUGGINGFACE_API_KEY,
    generate: async (prompt) => {
      const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      const result = await hf.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "system",
            content:
              "You are MediTrack AI, a professional health analytics assistant. Provide clear, concise medical health summaries.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
      });
      return result.choices[0]?.message?.content;
    },
  },
  {
    name: "Cohere",
    enabled: !!process.env.COHERE_API_KEY,
    generate: async (prompt) => {
      const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });
      const response = await cohere.chat({
        model: "command-r",
        messages: [
          {
            role: "system",
            content:
              "You are MediTrack AI, a professional health analytics assistant. Provide clear, concise medical health summaries.",
          },
          { role: "user", content: prompt },
        ],
      });
      return response.message?.content?.[0]?.text;
    },
  },
  {
    name: "Mistral",
    enabled: !!process.env.MISTRAL_API_KEY,
    generate: async (prompt) => {
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      const result = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content:
              "You are MediTrack AI, a professional health analytics assistant. Provide clear, concise medical health summaries.",
          },
          { role: "user", content: prompt },
        ],
      });
      return result.choices[0]?.message?.content;
    },
  },
];

/**
 * Generate AI text with automatic fallback across providers
 * @param {string} prompt - The prompt to send
 * @returns {Promise<{text: string, provider: string}>}
 */
export async function generateWithFallback(prompt) {
  const enabledProviders = providers.filter((p) => p.enabled);

  if (enabledProviders.length === 0) {
    console.warn("No AI API keys configured. Returning fallback response.");
    return {
      text: generateFallbackInsights(),
      provider: "fallback",
    };
  }

  const errors = [];

  for (const provider of enabledProviders) {
    try {
      console.log(`[AI] Trying ${provider.name}...`);
      const text = await Promise.race([
        provider.generate(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 30000)
        ),
      ]);

      if (text && text.trim()) {
        console.log(`[AI] ✅ ${provider.name} succeeded`);
        return { text: text.trim(), provider: provider.name };
      }
      throw new Error("Empty response");
    } catch (error) {
      console.warn(
        `[AI] ❌ ${provider.name} failed: ${error.message}`
      );
      errors.push({ provider: provider.name, error: error.message });
    }
  }

  // All providers failed — return a static fallback
  console.error("[AI] All providers failed:", errors);
  return {
    text: generateFallbackInsights(),
    provider: "fallback",
  };
}

/**
 * Static fallback when no AI providers are available
 */
function generateFallbackInsights() {
  return `Health Summary Insights:

• Continue monitoring your vital signs regularly and track any changes over time.
• Maintain consistent medication adherence for optimal health outcomes.
• Stay hydrated, aim for 7-8 hours of sleep, and incorporate regular physical activity.
• Share this report with your healthcare provider during your next consultation.
• If you notice any sudden changes in your vitals, seek medical attention promptly.

Note: AI-powered insights are currently unavailable. Please configure at least one AI API key (Groq, Gemini, HuggingFace, Cohere, or Mistral) in your environment variables for personalized health insights.

Disclaimer: This report is auto-generated and does not constitute medical advice. Always consult a qualified healthcare professional for medical decisions.`;
}

/**
 * Build a health data prompt for AI analysis
 */
export function buildHealthPrompt(userData) {
  const { user, vitals, adherence, medicines, wellness } = userData;

  let prompt = `Analyze the following patient health data and provide a professional health summary with key insights, trends, and recommendations. Keep it concise (8-12 bullet points max). Format with clear sections.

PATIENT PROFILE:
- Name: ${user.name || "N/A"}
- Age: ${user.age || "N/A"}
- Gender: ${user.gender || "N/A"}
- Blood Group: ${user.bloodGroup || "N/A"}
- Chronic Conditions: ${user.chronicConditions?.length > 0 ? user.chronicConditions.join(", ") : "None reported"}
`;

  if (adherence) {
    prompt += `
MEDICATION ADHERENCE (last 30 days):
- Adherence Rate: ${adherence.adherenceRate}%
- Total Doses: ${adherence.totalDoses}
- Taken: ${adherence.takenDoses}
- Missed: ${adherence.missedDoses}
- Current Streak: ${adherence.streak} days
`;
  }

  if (medicines && medicines.length > 0) {
    prompt += `
ACTIVE MEDICINES:
${medicines.map((m) => `- ${m.medicineName} (${m.dosage}) — ${m.adherenceRate}% adherence`).join("\n")}
`;
  }

  if (vitals) {
    const bp = vitals.bloodPressure;
    const hr = vitals.heartRate;
    const o2 = vitals.oxygenLevel;
    const bs = vitals.bloodSugar;

    prompt += `
RECENT VITALS (last ${bp?.length || 0} readings):`;

    if (bp?.length > 0) {
      const latest = bp[bp.length - 1];
      prompt += `\n- Blood Pressure: ${latest.systolic}/${latest.diastolic} mmHg (latest)`;
    }
    if (hr?.length > 0) {
      prompt += `\n- Heart Rate: ${hr[hr.length - 1].value} bpm (latest)`;
    }
    if (o2?.length > 0) {
      prompt += `\n- SpO2: ${o2[o2.length - 1].value}% (latest)`;
    }
    if (bs?.length > 0) {
      const latest = bs[bs.length - 1];
      prompt += `\n- Blood Sugar: Fasting ${latest.fasting || "N/A"} mg/dL`;
    }
  }

  if (wellness) {
    const sleep = wellness.sleep;
    const mood = wellness.mood;
    const steps = wellness.steps;
    const water = wellness.water;

    if (sleep?.length > 0 || mood?.length > 0 || steps?.length > 0) {
      prompt += `\n\nWELLNESS DATA:`;
      if (sleep?.length > 0)
        prompt += `\n- Average Sleep: ${(sleep.reduce((a, b) => a + b.hours, 0) / sleep.length).toFixed(1)} hours`;
      if (mood?.length > 0)
        prompt += `\n- Recent Mood: ${mood[mood.length - 1].value}`;
      if (steps?.length > 0)
        prompt += `\n- Average Steps: ${Math.round(steps.reduce((a, b) => a + b.value, 0) / steps.length)}`;
      if (water?.length > 0)
        prompt += `\n- Average Water: ${(water.reduce((a, b) => a + b.value, 0) / water.length).toFixed(1)} glasses`;
    }
  }

  prompt += `

Please provide:
1. Overall Health Assessment (2-3 sentences)
2. Key Observations (bullet points)
3. Areas of Concern (if any)
4. Recommendations (actionable advice)
5. Add a disclaimer that this is AI-generated and not medical advice`;

  return prompt;
}

export default { generateWithFallback, buildHealthPrompt };
