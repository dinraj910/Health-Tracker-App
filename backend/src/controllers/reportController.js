import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import MedicineLog from "../models/MedicineLog.js";
import HealthLog from "../models/HealthLog.js";
import MedicalRecord from "../models/MedicalRecord.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { generateWithFallback, buildHealthPrompt } from "../services/aiService.js";
import PDFDocument from "pdfkit";

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  brand:       "#0d9488",
  brandLight:  "#14b8a6",
  heading:     "#111827",
  sub:         "#374151",
  body:        "#1f2937",
  label:       "#6b7280",
  muted:       "#9ca3af",
  success:     "#059669",
  warning:     "#d97706",
  danger:      "#dc2626",
  divider:     "#d1d5db",
  rowAlt:      "#f3f4f6",
  rowHdr:      "#e5e7eb",
  white:       "#ffffff",
  coverBg:     "#0f172a",
};

// ─── Layout Constants ─────────────────────────────────────────────────────────
const ML = 50;   // margin left
const MR = 545;  // margin right (A4 width 595 - 50)
const TW = MR - ML; // usable width = 495

// ─── PDF Helper Functions ─────────────────────────────────────────────────────

function newPage(doc) {
  doc.addPage();
  return 50; // reset Y to top margin
}

function ensureSpace(doc, needed, tableY = null) {
  const y = tableY !== null ? tableY : doc.y;
  if (y + needed > 780) {
    return newPage(doc);
  }
  return tableY !== null ? tableY : null;
}

function drawHRule(doc, y, color = C.divider, width = 0.5) {
  doc.strokeColor(color).lineWidth(width).moveTo(ML, y).lineTo(MR, y).stroke();
}

function sectionTitle(doc, title, icon = "▪") {
  // Background band
  doc.rect(ML, doc.y, TW, 22).fill(C.brand);
  doc.fontSize(11).font("Helvetica-Bold").fillColor(C.white)
    .text(`${icon}  ${title.toUpperCase()}`, ML + 10, doc.y - 18, { width: TW - 20 });
  doc.moveDown(0.8);
}

function infoRow(doc, label, value, y, colOffset = 0) {
  const labelW = 150;
  const valW = TW / 2 - labelW - 10;
  const x = ML + colOffset;
  doc.fontSize(9).font("Helvetica-Bold").fillColor(C.label).text(label, x, y, { width: labelW, lineBreak: false });
  doc.font("Helvetica").fillColor(C.body).text(value || "N/A", x + labelW, y, { width: valW, lineBreak: false });
}

function twoColGrid(doc, rows) {
  // rows = [[label, value], [label, value], ...]  pairs go in 2 columns
  const colW = TW / 2;
  let y = doc.y;
  for (let i = 0; i < rows.length; i += 2) {
    if (y > 760) { doc.addPage(); y = 50; }
    // left col
    if (rows[i]) {
      doc.rect(ML, y, colW - 5, 18).fill(i % 4 < 2 ? "#f9fafb" : C.white);
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.label).text(rows[i][0], ML + 6, y + 4, { width: 100, lineBreak: false });
      doc.font("Helvetica").fillColor(C.body).text(rows[i][1] || "—", ML + 115, y + 4, { width: colW - 125, lineBreak: false });
    }
    // right col
    if (rows[i + 1]) {
      doc.rect(ML + colW, y, colW - 5, 18).fill(i % 4 < 2 ? "#f9fafb" : C.white);
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.label).text(rows[i + 1][0], ML + colW + 6, y + 4, { width: 100, lineBreak: false });
      doc.font("Helvetica").fillColor(C.body).text(rows[i + 1][1] || "—", ML + colW + 115, y + 4, { width: colW - 125, lineBreak: false });
    }
    y += 20;
  }
  doc.y = y + 6;
}

/**
 * Draw a proper table with header + data rows.
 * @param {PDFDocument} doc
 * @param {string[]} headers - Column header labels
 * @param {number[]} colWidths - Width of each column (must sum <= TW)
 * @param {string[][]} rows - Array of row data (string arrays)
 * @param {object} opts - { rowHeight, fontSize, headerColor }
 * @returns {number} final Y position after table
 */
function drawTable(doc, headers, colWidths, rows, opts = {}) {
  const { rowH = 16, fs = 8, hdrFill = C.rowHdr } = opts;
  let y = doc.y;

  if (y + rowH + 10 > 780) { doc.addPage(); y = 50; }

  // ── Header Row ──
  doc.rect(ML, y, TW, rowH + 2).fill(hdrFill);
  let x = ML;
  headers.forEach((h, i) => {
    doc.fontSize(fs - 0.5).font("Helvetica-Bold").fillColor(C.sub)
      .text(h, x + 4, y + 4, { width: colWidths[i] - 6, lineBreak: false });
    x += colWidths[i];
  });
  y += rowH + 2;

  // outer border top
  drawHRule(doc, y - rowH - 2 + 0.5, C.divider, 0.7);
  drawHRule(doc, y, C.divider, 0.7);

  // ── Data Rows ──
  doc.font("Helvetica").fontSize(fs).fillColor(C.body);
  rows.forEach((row, ri) => {
    if (y + rowH > 780) { doc.addPage(); y = 50; }

    // Alt row fill
    if (ri % 2 === 0) doc.rect(ML, y, TW, rowH).fill("#f9fafb");

    x = ML;
    row.forEach((cell, ci) => {
      const cellStr = String(cell ?? "—");
      doc.fillColor(C.body).text(cellStr, x + 4, y + (rowH - fs) / 2, {
        width: colWidths[ci] - 8,
        lineBreak: false,
        ellipsis: true,
      });
      x += colWidths[ci];
    });
    y += rowH;
    drawHRule(doc, y, "#e5e7eb", 0.3);
  });

  // outer border bottom
  drawHRule(doc, y, C.divider, 0.7);
  doc.y = y + 8;
  return y + 8;
}

function statusColor(status) {
  if (!status) return C.muted;
  const s = String(status).toLowerCase();
  if (s.includes("normal") || s.includes("optimal") || s.includes("good")) return C.success;
  if (s.includes("high") || s.includes("fever") || s.includes("low")) return C.danger;
  return C.warning;
}

function bpStatus(sys, dia) {
  if (!sys || !dia) return "—";
  if (sys < 90 || dia < 60) return "Low";
  if (sys < 120 && dia < 80) return "Normal";
  if (sys < 130 && dia < 80) return "Elevated";
  if (sys < 140 || dia < 90) return "High Stage 1";
  return "High Stage 2";
}

function capitalize(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}

function fmtDate(d, options = { month: "short", day: "numeric", year: "numeric" }) {
  try { return new Date(d).toLocaleDateString("en-IN", options); }
  catch { return String(d); }
}

// ─── GET /api/reports/health-summary ─────────────────────────────────────────
export const getHealthSummary = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const userId = req.user._id;
  const healthData = await gatherHealthData(userId, parseInt(days));
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

// ─── GET /api/reports/download-pdf ───────────────────────────────────────────
export const downloadHealthReport = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const userId = req.user._id;

  const healthData = await gatherHealthData(userId, parseInt(days));
  const prompt = buildHealthPrompt(healthData);
  const aiResult = await generateWithFallback(prompt);

  // ── Setup PDF ──
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: ML, right: 50 },
    info: {
      Title: `MediTrack Health Report — ${healthData.user.name}`,
      Author: "MediTrack",
      Subject: "Comprehensive Health Report",
      Creator: "MediTrack v1.0",
    },
    bufferPages: true,
  });

  const filename = `MediTrack_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  // ══════════════════════════════════════════════════════════════
  //  COVER PAGE
  // ══════════════════════════════════════════════════════════════
  doc.rect(0, 0, 595, 842).fill(C.coverBg);

  // Brand + accent bar
  doc.rect(0, 0, 8, 842).fill(C.brandLight);

  const centerX = 297;
  doc.fontSize(38).font("Helvetica-Bold").fillColor(C.brandLight)
    .text("MediTrack", 0, 200, { align: "center" });
  doc.fontSize(14).font("Helvetica").fillColor("#94a3b8")
    .text("Comprehensive Health Report", 0, 248, { align: "center" });

  // Decorative line
  doc.strokeColor(C.brandLight).lineWidth(1)
    .moveTo(centerX - 80, 275).lineTo(centerX + 80, 275).stroke();

  // Patient name + period
  doc.fontSize(20).font("Helvetica-Bold").fillColor(C.white)
    .text(healthData.user.name || "Patient", 0, 295, { align: "center" });
  doc.fontSize(10).font("Helvetica").fillColor("#64748b")
    .text(`Report Period: Last ${days} Days`, 0, 322, { align: "center" });
  doc.text(`Generated on ${fmtDate(new Date())}`, 0, 338, { align: "center" });

  // Patient info box
  const boxY = 380;
  doc.rect(120, boxY, 355, 100).fillAndStroke("#1e293b", "#334155");
  const info = healthData.user;
  const infoLines = [
    [`Age`, info.age ? `${info.age} years` : "—"],
    [`Gender`, capitalize(info.gender)],
    [`Blood Group`, info.bloodGroup || "—"],
    [`Conditions`, info.chronicConditions?.length ? info.chronicConditions.join(", ") : "None"],
  ];
  infoLines.forEach(([lbl, val], i) => {
    const iy = boxY + 14 + i * 20;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#94a3b8").text(lbl, 140, iy, { width: 80, lineBreak: false });
    doc.font("Helvetica").fillColor(C.white).text(val, 230, iy, { width: 230, lineBreak: false });
  });

  // AI badge
  doc.fontSize(7.5).fillColor("#475569").font("Helvetica")
    .text(`AI Insights powered by ${aiResult.provider}`, 0, 510, { align: "center" });

  // Disclaimer
  doc.moveDown(18);
  doc.fontSize(7).fillColor("#475569").font("Helvetica")
    .text("This report is for informational purposes only and does not constitute medical advice.", 80, 790, { width: 435, align: "center" });

  // ══════════════════════════════════════════════════════════════
  //  PAGE 2+: Content starts here
  // ══════════════════════════════════════════════════════════════
  doc.addPage();

  // ─── SECTION 1: Patient Profile ──────────────────────────────
  sectionTitle(doc, "Patient Profile", "①");

  const { user } = healthData;
  twoColGrid(doc, [
    ["Full Name",        user.name],
    ["Age",              user.age ? `${user.age} years` : null],
    ["Gender",          capitalize(user.gender)],
    ["Blood Group",     user.bloodGroup],
    ["Height",          user.height ? `${user.height} cm` : null],
    ["Weight",          user.weight ? `${user.weight} kg` : null],
    ["BMI",             (user.height && user.weight) ? ((user.weight / ((user.height / 100) ** 2)).toFixed(1) + " kg/m²") : null],
    ["Chronic Conditions", user.chronicConditions?.length ? user.chronicConditions.join(", ") : "None"],
  ]);

  doc.moveDown(0.5);

  // ─── SECTION 2: Medication Overview ─────────────────────────
  if (healthData.adherence || healthData.medicines?.length) {
    ensureSpace(doc, 60);
    sectionTitle(doc, "Medication Overview", "②");

    const adh = healthData.adherence;
    if (adh) {
      twoColGrid(doc, [
        ["Adherence Rate",  `${adh.adherenceRate}%`],
        ["Current Streak",  `${adh.streak} days`],
        ["Total Doses",     String(adh.totalDoses)],
        ["Taken",           String(adh.takenDoses)],
        ["Missed",          String(adh.missedDoses)],
        ["Skipped",         String(adh.skippedDoses)],
      ]);
    }

    if (healthData.medicines?.length > 0) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(C.sub).text("Active Medicines", ML, doc.y + 4).moveDown(0.3);
      drawTable(doc,
        ["Medicine", "Dosage", "Category", "Adherence"],
        [185, 120, 110, 80],
        healthData.medicines.map(m => [m.medicineName, m.dosage || "—", m.category || "—", `${m.adherenceRate}%`])
      );
    }
  }

  // ─── SECTION 3: Day-by-Day Medication Log ────────────────────
  if (healthData.dayByDayMedicines && Object.keys(healthData.dayByDayMedicines).length > 0) {
    ensureSpace(doc, 80);
    sectionTitle(doc, "Day-by-Day Medication Log", "③");

    const sorted = Object.keys(healthData.dayByDayMedicines).sort((a, b) => new Date(b) - new Date(a));
    const rows = sorted.map(date => {
      const d = healthData.dayByDayMedicines[date];
      const taken = d.taken.length > 0 ? d.taken.join(", ") : "None";
      const missed = d.missed.length > 0 ? d.missed.join(", ") : "None";
      const skipped = d.skipped?.length > 0 ? d.skipped.join(", ") : "—";
      return [fmtDate(date, { weekday: "short", month: "short", day: "numeric" }), taken, missed, skipped];
    });

    drawTable(doc,
      ["Date", "Taken ✓", "Missed ✗", "Skipped"],
      [90, 155, 155, 95],
      rows
    );
  }

  // ─── SECTION 4: Latest Vital Signs ────────────────────────────
  if (healthData.vitals) {
    const v = healthData.vitals;
    const hasVitals = v.bloodPressure?.length || v.heartRate?.length || v.oxygenLevel?.length || v.bloodSugar?.length || v.bodyTemp?.length || v.weight?.length;
    if (hasVitals) {
      ensureSpace(doc, 80);
      sectionTitle(doc, "Latest Vital Signs", "④");

      const vitalRows = [];
      if (v.bloodPressure?.length) {
        const l = v.bloodPressure[v.bloodPressure.length - 1];
        const st = bpStatus(l.systolic, l.diastolic);
        vitalRows.push(["Blood Pressure", `${l.systolic}/${l.diastolic}`, "mmHg", "90-120 / 60-80", st]);
      }
      if (v.heartRate?.length) {
        const l = v.heartRate[v.heartRate.length - 1];
        vitalRows.push(["Heart Rate", `${l.value}`, "bpm", "60–100", l.value >= 60 && l.value <= 100 ? "Normal" : "Check"]);
      }
      if (v.oxygenLevel?.length) {
        const l = v.oxygenLevel[v.oxygenLevel.length - 1];
        vitalRows.push(["SpO2 (Oxygen)", `${l.value}`, "%", "≥ 95", l.value >= 95 ? "Normal" : "Low"]);
      }
      if (v.bloodSugar?.length) {
        const l = v.bloodSugar[v.bloodSugar.length - 1];
        if (l.fasting) vitalRows.push(["Blood Sugar (Fasting)", `${l.fasting}`, "mg/dL", "70–100", l.fasting <= 100 ? "Normal" : l.fasting <= 125 ? "Prediabetic" : "High"]);
        if (l.postMeal) vitalRows.push(["Blood Sugar (Post-Meal)", `${l.postMeal}`, "mg/dL", "< 140", l.postMeal < 140 ? "Normal" : "High"]);
      }
      if (v.bodyTemp?.length) {
        const l = v.bodyTemp[v.bodyTemp.length - 1];
        vitalRows.push(["Body Temperature", `${l.value}`, "°F", "97–99.5", l.value >= 97 && l.value <= 99.5 ? "Normal" : l.value > 99.5 ? "Fever" : "Low"]);
      }
      if (v.weight?.length) {
        const l = v.weight[v.weight.length - 1];
        vitalRows.push(["Body Weight", `${l.value}`, "kg", "— (BMI based)", "—"]);
      }

      drawTable(doc,
        ["Vital Sign", "Value", "Unit", "Normal Range", "Status"],
        [160, 60, 55, 130, 90],
        vitalRows
      );
    }
  }

  // ─── SECTION 5: Day-by-Day Vitals Table ──────────────────────
  if (healthData.vitals) {
    const v = healthData.vitals;
    const allDates = new Set([
      ...(v.bloodPressure || []).map(d => d.date),
      ...(v.heartRate || []).map(d => d.date),
      ...(v.oxygenLevel || []).map(d => d.date),
      ...(v.bloodSugar || []).map(d => d.date),
    ]);
    if (allDates.size > 1) {
      ensureSpace(doc, 80);
      sectionTitle(doc, "Day-by-Day Vitals Tracking", "⑤");

      const bpMap = Object.fromEntries((v.bloodPressure || []).map(d => [d.date, d]));
      const hrMap = Object.fromEntries((v.heartRate || []).map(d => [d.date, d]));
      const o2Map = Object.fromEntries((v.oxygenLevel || []).map(d => [d.date, d]));
      const bsMap = Object.fromEntries((v.bloodSugar || []).map(d => [d.date, d]));

      const sortedDates = [...allDates].sort();
      const rows = sortedDates.map(date => {
        const bp = bpMap[date];
        const hr = hrMap[date];
        const o2 = o2Map[date];
        const bs = bsMap[date];
        return [
          fmtDate(date, { weekday: "short", month: "short", day: "numeric" }),
          bp ? `${bp.systolic}/${bp.diastolic}` : "—",
          hr ? `${hr.value}` : "—",
          o2 ? `${o2.value}%` : "—",
          bs?.fasting ? `${bs.fasting}` : "—",
        ];
      });

      drawTable(doc,
        ["Date", "BP (mmHg)", "HR (bpm)", "SpO2", "Blood Sugar (mg/dL)"],
        [105, 100, 85, 75, 130],
        rows
      );
    }
  }

  // ─── SECTION 6: Medical Records Referenced ───────────────────
  if (healthData.medicalRecords?.length > 0) {
    ensureSpace(doc, 80);
    sectionTitle(doc, "Medical Records During This Period", "⑥");

    const rows = healthData.medicalRecords.map(r => [
      fmtDate(r.recordDate, { month: "short", day: "numeric", year: "numeric" }),
      capitalize(r.type),
      r.title,
      r.doctorName || "—",
      r.hospitalName || "—",
      r.description ? r.description.slice(0, 60) + (r.description.length > 60 ? "…" : "") : "—",
    ]);

    drawTable(doc,
      ["Date", "Type", "Title", "Doctor", "Hospital", "Notes"],
      [72, 72, 110, 80, 80, 81],
      rows,
      { rowH: 18, fs: 7.5 }
    );
  }

  // ─── SECTION 7: Day-by-Day Wellness ──────────────────────────
  if (healthData.wellness) {
    const w = healthData.wellness;
    const allDates = new Set([
      ...(w.sleep || []).map(d => d.date),
      ...(w.mood || []).map(d => d.date),
      ...(w.steps || []).map(d => d.date),
      ...(w.water || []).map(d => d.date),
    ]);
    if (allDates.size > 0) {
      ensureSpace(doc, 80);
      sectionTitle(doc, "Day-by-Day Wellness Tracking", "⑦");

      const sleepMap = Object.fromEntries((w.sleep || []).map(d => [d.date, d]));
      const moodMap  = Object.fromEntries((w.mood  || []).map(d => [d.date, d]));
      const stepsMap = Object.fromEntries((w.steps || []).map(d => [d.date, d]));
      const waterMap = Object.fromEntries((w.water || []).map(d => [d.date, d]));
      const exercMap = Object.fromEntries((w.exercise || []).map(d => [d.date, d]));

      const sortedDates = [...allDates].sort();
      const rows = sortedDates.map(date => [
        fmtDate(date, { weekday: "short", month: "short", day: "numeric" }),
        sleepMap[date] ? `${sleepMap[date].hours} hrs` : "—",
        moodMap[date]  ? capitalize(moodMap[date].value) : "—",
        stepsMap[date] ? stepsMap[date].value.toLocaleString() : "—",
        waterMap[date] ? `${waterMap[date].value} cups` : "—",
        exercMap[date] ? `${exercMap[date].value} min` : "—",
      ]);

      drawTable(doc,
        ["Date", "Sleep", "Mood", "Steps", "Water", "Exercise"],
        [105, 65, 75, 80, 75, 95],
        rows
      );
    }
  }

  // ─── SECTION 8: Wellness Averages ────────────────────────────
  if (healthData.wellness) {
    const w = healthData.wellness;
    const avgRows = [];
    if (w.sleep?.length) {
      const avg = (w.sleep.reduce((a, b) => a + b.hours, 0) / w.sleep.length).toFixed(1);
      avgRows.push(["Average Sleep", `${avg} hrs`, "Recommended: 7–9 hrs", parseFloat(avg) >= 7 ? "Good" : "Below Goal"]);
    }
    if (w.steps?.length) {
      const avg = Math.round(w.steps.reduce((a, b) => a + b.value, 0) / w.steps.length);
      avgRows.push(["Average Steps", avg.toLocaleString(), "Goal: ≥ 10,000", avg >= 10000 ? "Active" : "Below Goal"]);
    }
    if (w.water?.length) {
      const avg = (w.water.reduce((a, b) => a + b.value, 0) / w.water.length).toFixed(1);
      avgRows.push(["Avg. Water Intake", `${avg} cups`, "Recommended: 8 cups", parseFloat(avg) >= 8 ? "Well Hydrated" : "Drink More"]);
    }
    if (w.mood?.length) {
      avgRows.push(["Latest Mood", capitalize(w.mood[w.mood.length - 1].value), "—", "—"]);
    }
    if (avgRows.length > 0) {
      ensureSpace(doc, 60);
      sectionTitle(doc, "Wellness Summary & Averages", "⑧");
      drawTable(doc,
        ["Metric", "Value", "Benchmark", "Status"],
        [150, 95, 160, 90],
        avgRows
      );
    }
  }

  // ─── SECTION 9: AI Health Insights ───────────────────────────
  ensureSpace(doc, 80);
  sectionTitle(doc, "AI Health Insights", "⑨");

  doc.fontSize(7.5).font("Helvetica").fillColor(C.muted)
    .text(`Generated by ${aiResult.provider} AI  •  ${fmtDate(new Date())}`, ML, doc.y, { align: "left" })
    .moveDown(0.5);

  const insightLines = aiResult.text.split("\n").filter(l => l.trim());
  insightLines.forEach(line => {
    if (doc.y > 760) { doc.addPage(); }
    const t = line.trim().replace(/\*\*/g, "");
    if (t.match(/^#+\s/) || (t.endsWith(":") && t.length < 60)) {
      doc.moveDown(0.2);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(C.brand).text(t.replace(/^#+\s*/, "")).moveDown(0.1);
    } else if (t.startsWith("•") || t.startsWith("-") || t.startsWith("*")) {
      doc.fontSize(9).font("Helvetica").fillColor(C.body)
        .text("   " + t.replace(/^[-*]\s*/, "• "), { indent: 10, width: TW - 10 });
    } else if (t) {
      doc.fontSize(9).fillColor(C.sub).text(t, { width: TW });
    }
  });

  // ─── Footer on every page ─────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    // skip cover (page 0)
    doc.switchToPage(range.start + i);
    drawHRule(doc, 815, C.divider);
    doc.fontSize(7).fillColor(C.muted).font("Helvetica")
      .text("MediTrack — Confidential Patient Report. Not a substitute for professional medical advice.", ML, 820, { width: TW - 60, lineBreak: false });
    doc.text(`Page ${i} of ${range.count - 1}`, ML, 820, { width: TW, align: "right", lineBreak: false });
  }

  doc.end();
});

// ─── gatherHealthData ─────────────────────────────────────────────────────────
async function gatherHealthData(userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const [user, medicines, medicineLogs, healthLogs, medicalRecords] = await Promise.all([
    User.findById(userId),
    Medicine.find({ userId, isActive: true }),
    MedicineLog.find({
      userId,
      date: { $gte: startDate },
      status: { $in: ["taken", "missed", "skipped"] },
    }).populate("medicineId", "medicineName"),
    HealthLog.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }),
    MedicalRecord.find({ userId, recordDate: { $gte: startDate } }).sort({ recordDate: -1 }).limit(20),
  ]);

  // Adherence
  const totalTaken = medicineLogs.filter(l => l.status === "taken").length;
  const totalLogs = medicineLogs.length;
  const streak = await calculateStreak(userId, medicineLogs);

  // Medicine-wise stats
  const medicineStats = await Promise.all(
    medicines.map(async (med) => {
      const logs = medicineLogs.filter(l => l.medicineId?._id?.toString() === med._id.toString());
      const taken = logs.filter(l => l.status === "taken").length;
      return {
        medicineName: med.medicineName,
        dosage: med.dosage,
        category: med.category,
        adherenceRate: logs.length > 0 ? Math.round((taken / logs.length) * 100) : 100,
      };
    })
  );

  // Day-by-day medicines
  const dayByDayMedicines = {};
  medicineLogs.forEach(log => {
    const dateStr = log.date.toISOString().split("T")[0];
    if (!dayByDayMedicines[dateStr]) dayByDayMedicines[dateStr] = { taken: [], missed: [], skipped: [] };
    if (log.medicineId?.medicineName) {
      dayByDayMedicines[dateStr][log.status].push(log.medicineId.medicineName);
    }
  });

  // Vitals & Wellness from HealthLogs
  const vitals = { bloodPressure: [], heartRate: [], oxygenLevel: [], bloodSugar: [], bodyTemp: [], weight: [] };
  const wellness = { sleep: [], mood: [], steps: [], water: [], exercise: [] };

  healthLogs.forEach(log => {
    const d = log.date.toISOString().split("T")[0];
    if (log.bloodPressure?.systolic && log.bloodPressure?.diastolic) {
      vitals.bloodPressure.push({ date: d, systolic: log.bloodPressure.systolic, diastolic: log.bloodPressure.diastolic });
    }
    if (log.heartRate)    vitals.heartRate.push({ date: d, value: log.heartRate });
    if (log.oxygenLevel)  vitals.oxygenLevel.push({ date: d, value: log.oxygenLevel });
    if (log.bloodSugar?.fasting || log.bloodSugar?.postMeal) {
      vitals.bloodSugar.push({ date: d, fasting: log.bloodSugar.fasting, postMeal: log.bloodSugar.postMeal });
    }
    if (log.bodyTemp)     vitals.bodyTemp.push({ date: d, value: log.bodyTemp });
    if (log.weight)       vitals.weight.push({ date: d, value: log.weight });
    if (log.sleepHours != null) wellness.sleep.push({ date: d, hours: log.sleepHours, quality: log.sleepQuality });
    if (log.mood)         wellness.mood.push({ date: d, value: log.mood });
    if (log.stepsCount != null) wellness.steps.push({ date: d, value: log.stepsCount });
    if (log.waterIntake != null) wellness.water.push({ date: d, value: log.waterIntake });
    if (log.exerciseMinutes != null) wellness.exercise.push({ date: d, value: log.exerciseMinutes });
  });

  return {
    user: {
      name: user.name, age: user.age, gender: user.gender, bloodGroup: user.bloodGroup,
      chronicConditions: user.chronicConditions, height: user.height, weight: user.weight,
    },
    adherence: {
      adherenceRate: totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 100,
      totalDoses: totalLogs,
      takenDoses: totalTaken,
      missedDoses: medicineLogs.filter(l => l.status === "missed").length,
      skippedDoses: medicineLogs.filter(l => l.status === "skipped").length,
      streak,
    },
    medicines: medicineStats,
    dayByDayMedicines,
    medicalRecords: medicalRecords.map(r => ({
      title: r.title,
      type: r.type,
      description: r.description,
      recordDate: r.recordDate,
      doctorName: r.doctorName,
      hospitalName: r.hospitalName,
    })),
    vitals,
    wellness,
  };
}

// ─── Streak Calculation (reuses already-fetched logs) ────────────────────────
async function calculateStreak(userId, existingLogs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cur = new Date(today);

  while (streak < 365) {
    const dayStart = new Date(cur);
    const dayEnd = new Date(cur);
    dayEnd.setHours(23, 59, 59, 999);
    const dayLogs = existingLogs.filter(l => l.date >= dayStart && l.date <= dayEnd);

    if (dayLogs.length === 0) {
      if (cur.getTime() === today.getTime()) { cur.setDate(cur.getDate() - 1); continue; }
      break;
    }
    if (dayLogs.every(l => l.status === "taken")) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  return streak;
}

export default { getHealthSummary, downloadHealthReport };
