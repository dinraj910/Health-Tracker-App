import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import MedicineLog from "../models/MedicineLog.js";
import HealthLog from "../models/HealthLog.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { generateWithFallback, buildHealthPrompt } from "../services/aiService.js";
import PDFDocument from "pdfkit";

/**
 * @desc    Generate AI-powered health report (JSON)
 * @route   GET /api/reports/health-summary
 * @access  Private
 */
export const getHealthSummary = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const userId = req.user._id;

  // Gather all health data
  const healthData = await gatherHealthData(userId, parseInt(days));

  // Generate AI insights
  const prompt = buildHealthPrompt(healthData);
  const aiResult = await generateWithFallback(prompt);

  res.status(200).json({
    success: true,
    data: {
      ...healthData,
      aiInsights: aiResult.text,
      aiProvider: aiResult.provider,
      generatedAt: new Date().toISOString(),
      period: `${days} days`,
    },
  });
});

/**
 * @desc    Generate AI-powered health report (PDF download)
 * @route   GET /api/reports/download-pdf
 * @access  Private
 */
export const downloadHealthReport = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const userId = req.user._id;

  // Gather all health data
  const healthData = await gatherHealthData(userId, parseInt(days));

  // Generate AI insights
  const prompt = buildHealthPrompt(healthData);
  const aiResult = await generateWithFallback(prompt);

  // Build PDF
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `MediTrack Health Report - ${healthData.user.name}`,
      Author: "MediTrack AI",
      Subject: "Health Summary Report",
    },
  });

  // Set response headers for PDF download
  const filename = `MediTrack_Health_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  // ─── Color Palette (print-friendly, readable on white paper) ───
  const C = {
    brand: "#0d9488",      // teal-600
    heading: "#111827",    // gray-900
    subheading: "#374151", // gray-700
    body: "#1f2937",       // gray-800
    label: "#6b7280",      // gray-500
    muted: "#9ca3af",      // gray-400
    success: "#059669",    // green-600
    warning: "#d97706",    // amber-600
    danger: "#dc2626",     // red-600
    divider: "#d1d5db",    // gray-300
    tableBorder: "#e5e7eb",// gray-200
    tableBg: "#f9fafb",    // gray-50
  };

  // ─── Header ───
  doc.fontSize(26).fillColor(C.brand).text("MediTrack", { align: "center" }).moveDown(0.2);
  doc.fontSize(13).fillColor(C.subheading).text("Health Summary Report", { align: "center" }).moveDown(0.5);
  doc.fontSize(9).fillColor(C.muted).text(
    `Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} | Period: Last ${days} days | AI Provider: ${aiResult.provider}`,
    { align: "center" }
  ).moveDown(0.8);

  drawDivider(doc, C.divider);

  // ── Section 1: Patient Profile ──
  sectionHeader(doc, "Patient Profile", C.brand);

  const { user } = healthData;
  const profileData = [
    ["Name", user.name || "N/A"],
    ["Age", user.age ? `${user.age} years` : "N/A"],
    ["Gender", capitalize(user.gender) || "N/A"],
    ["Blood Group", user.bloodGroup || "N/A"],
    ["Height / Weight", `${user.height || "N/A"} cm / ${user.weight || "N/A"} kg`],
    ["Chronic Conditions", user.chronicConditions?.length > 0 ? user.chronicConditions.join(", ") : "None reported"],
  ];

  profileData.forEach(([label, value]) => {
    doc.fontSize(10).fillColor(C.label).text(`${label}: `, { continued: true });
    doc.fillColor(C.body).text(value);
  });

  doc.moveDown(0.8);
  drawDivider(doc, C.divider);

  // ── Section 2: Medication Adherence ──
  if (healthData.adherence) {
    sectionHeader(doc, "Medication Adherence", C.brand);

    const adh = healthData.adherence;
    doc.fontSize(10);
    doc.fillColor(C.label).text("Overall Adherence Rate: ", { continued: true });
    doc.fillColor(adh.adherenceRate >= 80 ? C.success : adh.adherenceRate >= 50 ? C.warning : C.danger)
      .font("Helvetica-Bold").text(`${adh.adherenceRate}%`).font("Helvetica");

    doc.fillColor(C.body).text(`Total Doses: ${adh.totalDoses}  |  Taken: ${adh.takenDoses}  |  Missed: ${adh.missedDoses}  |  Skipped: ${adh.skippedDoses}  |  Streak: ${adh.streak} days`);
    doc.moveDown(0.5);

    // Active medicines
    if (healthData.medicines?.length > 0) {
      doc.fontSize(10).fillColor(C.subheading).font("Helvetica-Bold").text("Active Medicines:").font("Helvetica");
      doc.moveDown(0.3);

      healthData.medicines.forEach((med) => {
        const adhColor = med.adherenceRate >= 80 ? C.success : med.adherenceRate >= 50 ? C.warning : C.danger;
        doc.fontSize(9).fillColor(C.body)
          .text(`  • ${med.medicineName} (${med.dosage})`, { continued: true });
        doc.fillColor(adhColor).text(` — ${med.adherenceRate}% adherence`);
      });
    }

    doc.moveDown(0.8);
    drawDivider(doc, C.divider);
  }

  // ── Section 3: Latest Vitals Summary ──
  if (healthData.vitals) {
    sectionHeader(doc, "Latest Vital Signs", C.brand);

    const v = healthData.vitals;

    if (v.bloodPressure?.length > 0) {
      const latest = v.bloodPressure[v.bloodPressure.length - 1];
      vitalLine(doc, "Blood Pressure", `${latest.systolic}/${latest.diastolic} mmHg`, latest.status, C);
    }
    if (v.heartRate?.length > 0) {
      const latest = v.heartRate[v.heartRate.length - 1];
      vitalLine(doc, "Heart Rate", `${latest.value} bpm`, latest.value >= 60 && latest.value <= 100 ? "Normal" : "Abnormal", C);
    }
    if (v.oxygenLevel?.length > 0) {
      const latest = v.oxygenLevel[v.oxygenLevel.length - 1];
      vitalLine(doc, "SpO2", `${latest.value}%`, latest.value >= 95 ? "Normal" : "Low", C);
    }
    if (v.bloodSugar?.length > 0) {
      const latest = v.bloodSugar[v.bloodSugar.length - 1];
      vitalLine(doc, "Blood Sugar (Fasting)", `${latest.fasting || "N/A"} mg/dL`, "", C);
    }

    doc.moveDown(0.8);
    drawDivider(doc, C.divider);
  }

  // ── Section 4: Day-by-Day Vitals Tracking ──
  if (healthData.vitals) {
    const v = healthData.vitals;
    const hasVitalData = v.bloodPressure?.length > 1 || v.heartRate?.length > 1 || v.oxygenLevel?.length > 1 || v.bloodSugar?.length > 1;

    if (hasVitalData) {
      checkPageSpace(doc, 150);
      sectionHeader(doc, "Day-by-Day Vitals Tracking", C.brand);

      // Build a combined vitals table
      const allDates = new Set();
      v.bloodPressure?.forEach(d => allDates.add(d.date));
      v.heartRate?.forEach(d => allDates.add(d.date));
      v.oxygenLevel?.forEach(d => allDates.add(d.date));
      v.bloodSugar?.forEach(d => allDates.add(d.date));

      const sortedDates = [...allDates].sort();
      const bpMap = Object.fromEntries((v.bloodPressure || []).map(d => [d.date, d]));
      const hrMap = Object.fromEntries((v.heartRate || []).map(d => [d.date, d]));
      const o2Map = Object.fromEntries((v.oxygenLevel || []).map(d => [d.date, d]));
      const bsMap = Object.fromEntries((v.bloodSugar || []).map(d => [d.date, d]));

      // Table header
      const colWidths = [80, 100, 80, 65, 90];
      const headers = ["Date", "Blood Pressure", "Heart Rate", "SpO2", "Blood Sugar"];
      const tableX = 50;
      let tableY = doc.y;

      // Header row
      doc.fontSize(8).font("Helvetica-Bold").fillColor(C.subheading);
      let xPos = tableX;
      headers.forEach((h, i) => {
        doc.text(h, xPos, tableY, { width: colWidths[i], align: "left" });
        xPos += colWidths[i];
      });
      tableY += 16;
      doc.strokeColor(C.divider).lineWidth(0.5).moveTo(tableX, tableY).lineTo(tableX + colWidths.reduce((a, b) => a + b, 0), tableY).stroke();
      tableY += 4;

      // Data rows
      doc.font("Helvetica").fontSize(8);
      sortedDates.forEach((date, idx) => {
        if (tableY > 720) {
          doc.addPage();
          tableY = 50;
        }

        // Alternating row background
        if (idx % 2 === 0) {
          doc.rect(tableX, tableY - 2, colWidths.reduce((a, b) => a + b, 0), 14).fill(C.tableBg);
        }

        xPos = tableX;
        const formattedDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        doc.fillColor(C.body).text(formattedDate, xPos, tableY, { width: colWidths[0] });
        xPos += colWidths[0];

        const bp = bpMap[date];
        doc.fillColor(C.body).text(bp ? `${bp.systolic}/${bp.diastolic} mmHg` : "—", xPos, tableY, { width: colWidths[1] });
        xPos += colWidths[1];

        const hr = hrMap[date];
        doc.fillColor(C.body).text(hr ? `${hr.value} bpm` : "—", xPos, tableY, { width: colWidths[2] });
        xPos += colWidths[2];

        const o2 = o2Map[date];
        doc.fillColor(C.body).text(o2 ? `${o2.value}%` : "—", xPos, tableY, { width: colWidths[3] });
        xPos += colWidths[3];

        const bs = bsMap[date];
        doc.fillColor(C.body).text(bs ? `${bs.fasting || "—"} mg/dL` : "—", xPos, tableY, { width: colWidths[4] });

        tableY += 14;
      });

      doc.y = tableY + 8;
      doc.moveDown(0.5);
      drawDivider(doc, C.divider);
    }
  }

  // ── Section 5: Day-by-Day Wellness Tracking ──
  if (healthData.wellness) {
    const w = healthData.wellness;
    const hasWellnessData = w.sleep?.length > 1 || w.mood?.length > 1 || w.steps?.length > 1 || w.water?.length > 1;

    if (hasWellnessData) {
      checkPageSpace(doc, 150);
      sectionHeader(doc, "Day-by-Day Wellness Tracking", C.brand);

      // Build combined wellness table
      const allDates = new Set();
      w.sleep?.forEach(d => allDates.add(d.date));
      w.mood?.forEach(d => allDates.add(d.date));
      w.steps?.forEach(d => allDates.add(d.date));
      w.water?.forEach(d => allDates.add(d.date));

      const sortedDates = [...allDates].sort();
      const sleepMap = Object.fromEntries((w.sleep || []).map(d => [d.date, d]));
      const moodMap = Object.fromEntries((w.mood || []).map(d => [d.date, d]));
      const stepsMap = Object.fromEntries((w.steps || []).map(d => [d.date, d]));
      const waterMap = Object.fromEntries((w.water || []).map(d => [d.date, d]));

      const colWidths = [80, 80, 80, 85, 85];
      const headers = ["Date", "Sleep (hrs)", "Mood", "Steps", "Water (glasses)"];
      const tableX = 50;
      let tableY = doc.y;

      // Header row
      doc.fontSize(8).font("Helvetica-Bold").fillColor(C.subheading);
      let xPos = tableX;
      headers.forEach((h, i) => {
        doc.text(h, xPos, tableY, { width: colWidths[i], align: "left" });
        xPos += colWidths[i];
      });
      tableY += 16;
      doc.strokeColor(C.divider).lineWidth(0.5).moveTo(tableX, tableY).lineTo(tableX + colWidths.reduce((a, b) => a + b, 0), tableY).stroke();
      tableY += 4;

      // Data rows
      doc.font("Helvetica").fontSize(8);
      sortedDates.forEach((date, idx) => {
        if (tableY > 720) {
          doc.addPage();
          tableY = 50;
        }

        if (idx % 2 === 0) {
          doc.rect(tableX, tableY - 2, colWidths.reduce((a, b) => a + b, 0), 14).fill(C.tableBg);
        }

        xPos = tableX;
        const formattedDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        doc.fillColor(C.body).text(formattedDate, xPos, tableY, { width: colWidths[0] });
        xPos += colWidths[0];

        const sl = sleepMap[date];
        doc.fillColor(C.body).text(sl ? `${sl.hours}` : "—", xPos, tableY, { width: colWidths[1] });
        xPos += colWidths[1];

        const mood = moodMap[date];
        doc.fillColor(C.body).text(mood ? capitalize(mood.value) : "—", xPos, tableY, { width: colWidths[2] });
        xPos += colWidths[2];

        const steps = stepsMap[date];
        doc.fillColor(C.body).text(steps ? steps.value.toLocaleString() : "—", xPos, tableY, { width: colWidths[3] });
        xPos += colWidths[3];

        const water = waterMap[date];
        doc.fillColor(C.body).text(water ? `${water.value}` : "—", xPos, tableY, { width: colWidths[4] });

        tableY += 14;
      });

      doc.y = tableY + 8;
      doc.moveDown(0.5);
      drawDivider(doc, C.divider);
    }
  }

  // ── Section 6: Wellness Summary ──
  if (healthData.wellness) {
    const w = healthData.wellness;
    const hasWellness = w.sleep?.length > 0 || w.mood?.length > 0 || w.steps?.length > 0 || w.water?.length > 0;

    if (hasWellness) {
      checkPageSpace(doc, 80);
      sectionHeader(doc, "Wellness Averages", C.brand);

      if (w.sleep?.length > 0) {
        const avgSleep = (w.sleep.reduce((a, b) => a + b.hours, 0) / w.sleep.length).toFixed(1);
        vitalLine(doc, "Average Sleep", `${avgSleep} hours`, parseFloat(avgSleep) >= 7 ? "Good" : "Below recommended", C);
      }
      if (w.mood?.length > 0) {
        vitalLine(doc, "Most Recent Mood", capitalize(w.mood[w.mood.length - 1].value), "", C);
      }
      if (w.steps?.length > 0) {
        const avgSteps = Math.round(w.steps.reduce((a, b) => a + b.value, 0) / w.steps.length);
        vitalLine(doc, "Average Steps", avgSteps.toLocaleString(), avgSteps >= 10000 ? "Active" : "Below goal", C);
      }
      if (w.water?.length > 0) {
        const avgWater = (w.water.reduce((a, b) => a + b.value, 0) / w.water.length).toFixed(1);
        vitalLine(doc, "Average Water Intake", `${avgWater} glasses`, parseFloat(avgWater) >= 8 ? "Well hydrated" : "Drink more", C);
      }

      doc.moveDown(0.8);
      drawDivider(doc, C.divider);
    }
  }

  // ── Section 7: AI Health Insights ──
  checkPageSpace(doc, 100);
  sectionHeader(doc, "AI Health Insights", C.brand);
  doc.fontSize(8).fillColor(C.muted).text(`Powered by: ${aiResult.provider}`).moveDown(0.3);

  // Parse and write AI text
  const insightLines = aiResult.text.split("\n").filter((l) => l.trim());
  insightLines.forEach((line) => {
    if (doc.y > 720) {
      doc.addPage();
    }
    const trimmed = line.trim();
    // Section headers in AI response
    if (trimmed.match(/^#+\s/) || trimmed.match(/^\d+\.\s\*\*/) || trimmed.endsWith(":")) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor(C.brand).font("Helvetica-Bold").text(trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "")).font("Helvetica");
    } else if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      doc.fontSize(9).fillColor(C.body).text("  " + trimmed.replace(/^\*\s?/, "• ").replace(/\*\*/g, ""));
    } else {
      doc.fontSize(9).fillColor(C.subheading).text(trimmed.replace(/\*\*/g, ""));
    }
  });

  // ── Footer ──
  doc.moveDown(1.5);
  drawDivider(doc, C.divider);
  doc.fontSize(8).fillColor(C.label).text(
    "This report was generated by MediTrack AI and is for informational purposes only. It does not constitute medical advice. Always consult a healthcare professional for medical decisions.",
    { align: "center" }
  );
  doc.moveDown(0.3);
  doc.fontSize(7).fillColor(C.muted).text(
    `© ${new Date().getFullYear()} MediTrack — Your Personal Health Management Platform`,
    { align: "center" }
  );

  doc.end();
});

// ─── Helpers ───

function sectionHeader(doc, title, brandColor) {
  doc.fontSize(13).fillColor(brandColor || "#0d9488").font("Helvetica-Bold").text(title).font("Helvetica").moveDown(0.4);
}

function drawDivider(doc, color) {
  doc.moveDown(0.3);
  doc
    .strokeColor(color || "#d1d5db")
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.5);
}

function vitalLine(doc, label, value, status, C) {
  doc.fontSize(10).fillColor(C?.label || "#6b7280").text(`${label}: `, { continued: true });
  doc.fillColor(C?.body || "#1f2937").text(value, { continued: !!status });
  if (status) {
    doc.fillColor(C?.muted || "#9ca3af").text(` (${status})`);
  }
}

function checkPageSpace(doc, needed) {
  if (doc.y > 842 - 50 - needed) {
    doc.addPage();
  }
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gather all health data for the report
 */
async function gatherHealthData(userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  // Fetch all data in parallel
  const [user, medicines, medicineLogs, healthLogs] = await Promise.all([
    User.findById(userId),
    Medicine.find({ userId, isActive: true }),
    MedicineLog.find({
      userId,
      date: { $gte: startDate },
      status: { $in: ["taken", "missed", "skipped"] },
    }),
    HealthLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 }),
  ]);

  // Calculate adherence
  const totalTaken = medicineLogs.filter((l) => l.status === "taken").length;
  const totalLogs = medicineLogs.length;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentDate = new Date(today);

  while (streak < 365) {
    const startOfDay = new Date(currentDate);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayLogs = medicineLogs.filter(
      (l) => l.date >= startOfDay && l.date <= endOfDay
    );

    if (dayLogs.length === 0) {
      if (currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }

    if (dayLogs.every((l) => l.status === "taken")) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Medicine-wise stats
  const medicineStats = await Promise.all(
    medicines.map(async (med) => {
      const logs = medicineLogs.filter(
        (l) => l.medicineId?.toString() === med._id.toString()
      );
      const taken = logs.filter((l) => l.status === "taken").length;
      return {
        medicineName: med.medicineName,
        dosage: med.dosage,
        category: med.category,
        adherenceRate: logs.length > 0 ? Math.round((taken / logs.length) * 100) : 100,
      };
    })
  );

  // Extract vitals
  const vitals = {
    bloodPressure: [],
    heartRate: [],
    oxygenLevel: [],
    bloodSugar: [],
  };

  const wellness = {
    sleep: [],
    mood: [],
    steps: [],
    water: [],
  };

  healthLogs.forEach((log) => {
    const dateStr = log.date.toISOString().split("T")[0];

    if (log.bloodPressure?.systolic && log.bloodPressure?.diastolic) {
      vitals.bloodPressure.push({
        date: dateStr,
        systolic: log.bloodPressure.systolic,
        diastolic: log.bloodPressure.diastolic,
        status: log.bpStatus || "recorded",
      });
    }
    if (log.heartRate) vitals.heartRate.push({ date: dateStr, value: log.heartRate });
    if (log.oxygenLevel) vitals.oxygenLevel.push({ date: dateStr, value: log.oxygenLevel });
    if (log.bloodSugar?.fasting) {
      vitals.bloodSugar.push({ date: dateStr, fasting: log.bloodSugar.fasting, postMeal: log.bloodSugar.postMeal });
    }
    if (log.sleepHours != null) wellness.sleep.push({ date: dateStr, hours: log.sleepHours });
    if (log.mood) wellness.mood.push({ date: dateStr, value: log.mood });
    if (log.stepsCount != null) wellness.steps.push({ date: dateStr, value: log.stepsCount });
    if (log.waterIntake != null) wellness.water.push({ date: dateStr, value: log.waterIntake });
  });

  return {
    user: {
      name: user.name,
      age: user.age,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      chronicConditions: user.chronicConditions,
      height: user.height,
      weight: user.weight,
    },
    adherence: {
      adherenceRate: totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 100,
      totalDoses: totalLogs,
      takenDoses: totalTaken,
      missedDoses: medicineLogs.filter((l) => l.status === "missed").length,
      skippedDoses: medicineLogs.filter((l) => l.status === "skipped").length,
      streak,
    },
    medicines: medicineStats,
    vitals,
    wellness,
  };
}

export default { getHealthSummary, downloadHealthReport };
