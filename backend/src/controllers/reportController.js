import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import MedicineLog from "../models/MedicineLog.js";
import HealthLog from "../models/HealthLog.js";
import MedicalRecord from "../models/MedicalRecord.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { generateWithFallback, buildHealthPrompt } from "../services/aiService.js";
import PDFDocument from "pdfkit";

// ─── Palette ──────────────────────────────────────────────────────────────────
const TEAL   = "#0d9488";
const TEAL_L = "#ccfbf1";
const NAVY   = "#0f172a";
const DARK   = "#1e293b";
const GRAY   = "#64748b";
const LGRAY  = "#f1f5f9";
const WHITE  = "#ffffff";
const GREEN  = "#16a34a";
const AMBER  = "#d97706";
const RED    = "#dc2626";
const BLACK  = "#111827";

// ─── Layout ───────────────────────────────────────────────────────────────────
const PW = 595.28;   // A4 width  (points)
const PH = 841.89;   // A4 height (points)
const LM = 48;       // left  margin
const RM = 547;      // right margin  (PW - 48)
const TM = 48;       // top   margin
const BM = 48;       // bottom margin
const CW = RM - LM;  // content width = 499

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a fresh doc.y after adding a new page */
function addPage(doc) {
  doc.addPage();
  return TM;
}

/** If remaining space < needed, add a page and return the new Y; else return current Y */
function guard(doc, y, needed = 80) {
  if (y + needed > PH - BM) return addPage(doc);
  return y;
}

/** Draw a horizontal rule at Y, return Y + 1 */
function hr(doc, y, color = "#e2e8f0", thick = 0.5) {
  doc.save().strokeColor(color).lineWidth(thick).moveTo(LM, y).lineTo(RM, y).stroke().restore();
  return y + 1;
}

/** Coloured section header bar, returns Y after the bar */
function sectionBar(doc, y, title, num) {
  const barH = 26;
  doc.save()
    .rect(LM, y, CW, barH).fill(TEAL)
    .restore();
  // Circle number badge
  doc.save()
    .circle(LM + 19, y + barH / 2, 10).fill(WHITE)
    .restore();
  doc.fontSize(9).font("Helvetica-Bold").fillColor(TEAL)
    .text(String(num), LM + 15, y + 8, { width: 20, align: "center", lineBreak: false });
  // Title text inside bar
  doc.fontSize(10).font("Helvetica-Bold").fillColor(WHITE)
    .text(title.toUpperCase(), LM + 36, y + 8, { width: CW - 44, lineBreak: false });
  return y + barH + 10;
}

/** Key-value row — returns updated Y */
function kvRow(doc, y, label, value, altBg = false) {
  const rowH = 18;
  if (altBg) {
    doc.save().rect(LM, y, CW, rowH).fill(LGRAY).restore();
  }
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(GRAY)
    .text(label, LM + 6, y + 4, { width: 150, lineBreak: false });
  doc.fontSize(8.5).font("Helvetica").fillColor(BLACK)
    .text(value || "—", LM + 162, y + 4, { width: CW - 168, lineBreak: false });
  return y + rowH;
}

/** Simple label:value two-column grid for profile section */
function infoGrid(doc, startY, pairs) {
  let y = startY;
  const half = CW / 2;
  for (let i = 0; i < pairs.length; i += 2) {
    const rowH = 20;
    const even = Math.floor(i / 2) % 2 === 0;
    doc.save().rect(LM, y, CW, rowH).fill(even ? LGRAY : WHITE).restore();

    // left cell
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(GRAY)
      .text(pairs[i][0], LM + 8, y + 5, { width: 90, lineBreak: false });
    doc.fontSize(8.5).font("Helvetica").fillColor(BLACK)
      .text(pairs[i][1] || "—", LM + 102, y + 5, { width: half - 110, lineBreak: false });

    // right cell (if exists)
    if (pairs[i + 1]) {
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(GRAY)
        .text(pairs[i + 1][0], LM + half + 8, y + 5, { width: 90, lineBreak: false });
      doc.fontSize(8.5).font("Helvetica").fillColor(BLACK)
        .text(pairs[i + 1][1] || "—", LM + half + 102, y + 5, { width: half - 110, lineBreak: false });
    }
    y += rowH;
  }
  return y + 6;
}

/**
 * Draw a full table.
 * colDefs: [{label, width, align?}]
 * rows: string[][]
 * Returns final Y.
 */
function drawTable(doc, startY, colDefs, rows) {
  const HDR_H = 20;
  const ROW_H = 17;
  let y = guard(doc, startY, HDR_H + ROW_H * 2);

  // Header
  doc.save().rect(LM, y, CW, HDR_H).fill("#e2e8f0").restore();
  let x = LM;
  colDefs.forEach(col => {
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#374151")
      .text(col.label, x + 4, y + 5, { width: col.width - 8, align: col.align || "left", lineBreak: false });
    x += col.width;
  });
  y += HDR_H;

  // Rows
  rows.forEach((row, ri) => {
    y = guard(doc, y, ROW_H);
    if (ri % 2 === 0) {
      doc.save().rect(LM, y, CW, ROW_H).fill("#f8fafc").restore();
    }
    let rx = LM;
    row.forEach((cell, ci) => {
      const col = colDefs[ci];
      if (!col) return;
      const cellStr = cell != null && cell !== "" ? String(cell) : "—";
      doc.fontSize(8).font("Helvetica").fillColor(BLACK)
        .text(cellStr, rx + 4, y + 4, { width: col.width - 8, align: col.align || "left", lineBreak: false, ellipsis: true });
      rx += col.width;
    });
    y += ROW_H;
  });

  // Bottom border
  hr(doc, y, "#cbd5e1");
  return y + 8;
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtDate(d, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", opts); } catch { return String(d); }
}
function cap(s) { return s ? s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—"; }
function bpLabel(sys, dia) {
  if (!sys || !dia) return "—";
  if (sys < 90)  return "Low";
  if (sys < 120 && dia < 80) return "Normal";
  if (sys < 130 && dia < 80) return "Elevated";
  if (sys < 140 || dia < 90) return "High‑Stage 1";
  return "High‑Stage 2";
}

// ─── GET /api/reports/health-summary ─────────────────────────────────────────
export const getHealthSummary = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await gatherHealthData(req.user._id, parseInt(days));
  const ai = await generateWithFallback(buildHealthPrompt(data));
  res.status(200).json({ success: true, data: { ...data, aiInsights: ai.text, aiProvider: ai.provider } });
});

// ─── GET /api/reports/download-pdf ───────────────────────────────────────────
export const downloadHealthReport = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await gatherHealthData(req.user._id, parseInt(days));
  const ai   = await generateWithFallback(buildHealthPrompt(data));

  const doc = new PDFDocument({ size: "A4", margins: { top: TM, bottom: BM, left: LM, right: LM }, autoFirstPage: false });
  const fname = `MediTrack_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
  doc.pipe(res);

  // ══════════════════════════════
  //  COVER PAGE
  // ══════════════════════════════
  doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(NAVY);
  doc.rect(0, 0, 8, PH).fill(TEAL);                       // left accent stripe
  doc.rect(0, PH - 8, PW, 8).fill(TEAL);                  // bottom accent stripe

  // Brand
  doc.fontSize(42).font("Helvetica-Bold").fillColor(TEAL).text("MediTrack", 0, 140, { align: "center" });
  doc.fontSize(15).font("Helvetica").fillColor("#94a3b8").text("Personal Health Report", 0, 193, { align: "center" });

  // Divider
  doc.save().strokeColor(TEAL).lineWidth(1).moveTo(PW / 2 - 90, 225).lineTo(PW / 2 + 90, 225).stroke().restore();

  // Patient box
  const bx = 100, by = 248, bw = PW - 200, bh = 120;
  doc.save().rect(bx, by, bw, bh).fill("#1e293b").restore();
  doc.save().rect(bx, by, 4, bh).fill(TEAL).restore();

  const u = data.user;
  doc.fontSize(18).font("Helvetica-Bold").fillColor(WHITE).text(u.name || "Patient", bx + 20, by + 18, { align: "left", width: bw - 30 });
  const patInfo = [
    `Age: ${u.age ? u.age + " yrs" : "—"}`,
    `Gender: ${cap(u.gender)}`,
    `Blood Group: ${u.bloodGroup || "—"}`,
    `Height/Weight: ${u.height || "—"} cm / ${u.weight || "—"} kg`,
  ];
  doc.fontSize(9.5).font("Helvetica").fillColor("#94a3b8").text(patInfo.join("   |   "), bx + 20, by + 50, { width: bw - 30, lineBreak: false });
  if (u.chronicConditions?.length) {
    doc.fontSize(9).fillColor("#64748b").text("Conditions: " + u.chronicConditions.join(", "), bx + 20, by + 70, { width: bw - 30 });
  }

  // Period + date
  doc.fontSize(10).font("Helvetica").fillColor("#475569")
    .text(`Period Covered: Last ${days} Days   •   Generated: ${fmtDate(new Date())}`, 0, by + bh + 20, { align: "center" });
  doc.fontSize(9).fillColor("#334155")
    .text(`AI Insights: ${ai.provider}`, 0, by + bh + 40, { align: "center" });

  // Disclaimer
  doc.fontSize(7.5).fillColor("#334155")
    .text("This document is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional.", 60, PH - 60, { width: PW - 120, align: "center" });

  // ══════════════════════════════
  //  CONTENT PAGES
  // ══════════════════════════════
  doc.addPage({ size: "A4", margins: { top: TM, bottom: BM, left: LM, right: LM } });
  let y = TM;

  // ── § 1  PATIENT PROFILE ─────────────────────────────────────
  y = sectionBar(doc, y, "Patient Profile", 1);
  y = infoGrid(doc, y, [
    ["Full Name",        u.name],
    ["Age",              u.age ? `${u.age} years` : null],
    ["Gender",          cap(u.gender)],
    ["Blood Group",     u.bloodGroup],
    ["Height",          u.height ? `${u.height} cm` : null],
    ["Weight",          u.weight ? `${u.weight} kg` : null],
    ["BMI",             u.height && u.weight ? ((u.weight / ((u.height / 100) ** 2)).toFixed(1) + " kg/m²") : null],
    ["Chronic Conditions", u.chronicConditions?.length ? u.chronicConditions.join(", ") : "None reported"],
  ]);
  y += 14;

  // ── § 2  MEDICATION SUMMARY ──────────────────────────────────
  const adh = data.adherence;
  if (adh || data.medicines?.length) {
    y = guard(doc, y, 120);
    y = sectionBar(doc, y, "Medication Summary", 2);

    if (adh) {
      const adhColor = adh.adherenceRate >= 80 ? GREEN : adh.adherenceRate >= 50 ? AMBER : RED;
      // Summary bar
      doc.save().rect(LM, y, CW, 36).fill("#f0fdf4").restore();
      doc.fontSize(22).font("Helvetica-Bold").fillColor(adhColor)
        .text(`${adh.adherenceRate}%`, LM + 12, y + 7, { width: 80, lineBreak: false });
      doc.fontSize(9).font("Helvetica-Bold").fillColor(BLACK).text("Adherence Rate", LM + 96, y + 7, { lineBreak: false });
      doc.fontSize(8).font("Helvetica").fillColor(GRAY)
        .text(`Taken: ${adh.takenDoses}  |  Missed: ${adh.missedDoses}  |  Skipped: ${adh.skippedDoses}  |  Total: ${adh.totalDoses}  |  Streak: ${adh.streak} days`, LM + 96, y + 22, { lineBreak: false });
      y += 44;
    }

    if (data.medicines?.length) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(DARK).text("Active Medicines", LM, y).moveDown(0);
      y += 14;
      y = drawTable(doc, y,
        [{ label: "Medicine Name", width: 200 }, { label: "Dosage", width: 110 }, { label: "Category", width: 100 }, { label: "Adherence", width: 89, align: "center" }],
        data.medicines.map(m => [m.medicineName, m.dosage || "—", cap(m.category), `${m.adherenceRate}%`])
      );
    }
    y += 10;
  }

  // ── § 3  DAY-BY-DAY MEDICATION LOG ───────────────────────────
  const dailyMeds = data.dayByDayMedicines;
  if (dailyMeds && Object.keys(dailyMeds).length > 0) {
    y = guard(doc, y, 100);
    y = sectionBar(doc, y, "Day-by-Day Medication Log", 3);
    doc.fontSize(8).font("Helvetica").fillColor(GRAY)
      .text("✓ = Taken   ✗ = Missed.  Most recent dates shown first.", LM, y).moveDown(0);
    y += 14;

    const sortedDays = Object.keys(dailyMeds).sort((a, b) => new Date(b) - new Date(a));
    const rows = sortedDays.map(date => {
      const d = dailyMeds[date];
      return [
        fmtDate(date, { weekday: "short", day: "numeric", month: "short" }),
        d.taken.length  ? "✓ " + d.taken.join(", ")  : "None taken",
        d.missed.length ? "✗ " + d.missed.join(", ") : "—",
      ];
    });
    y = drawTable(doc, y,
      [{ label: "Date", width: 90 }, { label: "Medicines Taken", width: 250 }, { label: "Missed", width: 159 }],
      rows
    );
    y += 10;
  }

  // ── § 4  LATEST VITAL SIGNS ───────────────────────────────────
  const v = data.vitals;
  const hasVitals = v && (v.bloodPressure?.length || v.heartRate?.length || v.oxygenLevel?.length || v.bloodSugar?.length || v.bodyTemp?.length || v.weight?.length);
  if (hasVitals) {
    y = guard(doc, y, 100);
    y = sectionBar(doc, y, "Current Vital Signs  (Most Recent Reading)", 4);
    doc.fontSize(8).font("Helvetica").fillColor(GRAY)
      .text("Based on the latest logged entry for each vital sign.", LM, y);
    y += 16;

    const vRows = [];
    if (v.bloodPressure?.length) {
      const l = v.bloodPressure.at(-1);
      const st = bpLabel(l.systolic, l.diastolic);
      vRows.push([fmtDate(l.date), "Blood Pressure", `${l.systolic} / ${l.diastolic}`, "mmHg", "90–120 / 60–80", st]);
    }
    if (v.heartRate?.length) {
      const l = v.heartRate.at(-1);
      vRows.push([fmtDate(l.date), "Heart Rate", `${l.value}`, "bpm", "60–100", l.value >= 60 && l.value <= 100 ? "Normal" : "Abnormal"]);
    }
    if (v.oxygenLevel?.length) {
      const l = v.oxygenLevel.at(-1);
      vRows.push([fmtDate(l.date), "Oxygen Saturation (SpO2)", `${l.value}`, "%", "≥ 95", l.value >= 95 ? "Normal" : "Low"]);
    }
    if (v.bloodSugar?.length) {
      const l = v.bloodSugar.at(-1);
      if (l.fasting)  vRows.push([fmtDate(l.date), "Blood Glucose  (Fasting)",  `${l.fasting}`,  "mg/dL", "70–100", l.fasting <= 100 ? "Normal" : l.fasting <= 125 ? "Pre-diabetic" : "High"]);
      if (l.postMeal) vRows.push([fmtDate(l.date), "Blood Glucose  (Post-meal)", `${l.postMeal}`, "mg/dL", "< 140",  l.postMeal < 140 ? "Normal" : "Elevated"]);
    }
    if (v.bodyTemp?.length) {
      const l = v.bodyTemp.at(-1);
      vRows.push([fmtDate(l.date), "Body Temperature", `${l.value}`, "°F", "97–99.5", l.value <= 99.5 ? "Normal" : "Fever"]);
    }
    if (v.weight?.length) {
      const l = v.weight.at(-1);
      vRows.push([fmtDate(l.date), "Body Weight", `${l.value}`, "kg", "—", "—"]);
    }

    y = drawTable(doc, y,
      [{ label: "Date", width: 72 }, { label: "Vital Sign", width: 160 }, { label: "Value", width: 52, align: "center" }, { label: "Unit", width: 44 }, { label: "Normal Range", width: 90 }, { label: "Status", width: 81 }],
      vRows
    );
    y += 10;
  }

  // ── § 5  VITALS HISTORY TABLE ─────────────────────────────────
  if (v) {
    const allDates = [...new Set([
      ...(v.bloodPressure || []).map(d => d.date),
      ...(v.heartRate     || []).map(d => d.date),
      ...(v.oxygenLevel   || []).map(d => d.date),
      ...(v.bloodSugar    || []).map(d => d.date),
    ])].sort((a, b) => new Date(b) - new Date(a));

    if (allDates.length > 1) {
      y = guard(doc, y, 100);
      y = sectionBar(doc, y, "Vitals Trend History", 5);
      doc.fontSize(8).font("Helvetica").fillColor(GRAY)
        .text("Complete day-by-day record of vital signs across the report period.", LM, y);
      y += 16;

      const bpMap  = Object.fromEntries((v.bloodPressure || []).map(d => [d.date, d]));
      const hrMap  = Object.fromEntries((v.heartRate     || []).map(d => [d.date, d]));
      const o2Map  = Object.fromEntries((v.oxygenLevel   || []).map(d => [d.date, d]));
      const bsMap  = Object.fromEntries((v.bloodSugar    || []).map(d => [d.date, d]));

      y = drawTable(doc, y,
        [
          { label: "Date",          width: 80 },
          { label: "BP (mmHg)",     width: 90, align: "center" },
          { label: "HR (bpm)",      width: 70, align: "center" },
          { label: "SpO2 (%)",      width: 65, align: "center" },
          { label: "Glucose  mg/dL",width: 100, align: "center" },
          { label: "BP Status",     width: 94 },
        ],
        allDates.map(d => [
          fmtDate(d, { weekday: "short", day: "numeric", month: "short" }),
          bpMap[d]  ? `${bpMap[d].systolic} / ${bpMap[d].diastolic}` : "—",
          hrMap[d]  ? `${hrMap[d].value}`  : "—",
          o2Map[d]  ? `${o2Map[d].value}%` : "—",
          bsMap[d]?.fasting ? `${bsMap[d].fasting}` : "—",
          bpMap[d]  ? bpLabel(bpMap[d].systolic, bpMap[d].diastolic) : "—",
        ])
      );
      y += 10;
    }
  }

  // ── § 6  MEDICAL RECORDS ─────────────────────────────────────
  if (data.medicalRecords?.length) {
    y = guard(doc, y, 100);
    y = sectionBar(doc, y, "Medical Records on File", 6);
    doc.fontSize(8).font("Helvetica").fillColor(GRAY)
      .text("Records uploaded during the report period, including prescriptions, lab reports, and test results.", LM, y, { width: CW });
    y += 18;

    y = drawTable(doc, y,
      [
        { label: "Date",     width: 72 },
        { label: "Type",     width: 85 },
        { label: "Title",    width: 145 },
        { label: "Doctor",   width: 100 },
        { label: "Hospital", width: 97 },
      ],
      data.medicalRecords.map(r => [
        fmtDate(r.recordDate, { day: "numeric", month: "short", year: "numeric" }),
        cap(r.type),
        r.title,
        r.doctorName  || "—",
        r.hospitalName || "—",
      ])
    );

    // Note / description for each relevant record
    const notable = data.medicalRecords.filter(r => r.description);
    if (notable.length) {
      y = guard(doc, y, 20 + notable.length * 28);
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(DARK).text("Record Notes:", LM, y);
      y += 14;
      notable.forEach((r, i) => {
        y = guard(doc, y, 30);
        const even = i % 2 === 0;
        doc.save().rect(LM, y, CW, 26).fill(even ? LGRAY : WHITE).restore();
        doc.fontSize(8).font("Helvetica-Bold").fillColor(TEAL)
          .text(`${cap(r.type)} — ${r.title}`, LM + 6, y + 4, { width: CW - 12, lineBreak: false });
        doc.font("Helvetica").fillColor(GRAY)
          .text(r.description, LM + 6, y + 15, { width: CW - 12, lineBreak: false, ellipsis: true });
        y += 28;
      });
    }
    y += 10;
  }

  // ── § 7  WELLNESS TRACKING ────────────────────────────────────
  const w = data.wellness;
  const hasWellness = w && (w.sleep?.length || w.mood?.length || w.steps?.length || w.water?.length);
  if (hasWellness) {
    y = guard(doc, y, 100);
    y = sectionBar(doc, y, "Wellness & Lifestyle Tracking", 7);

    // Averages summary strip
    const summaryItems = [];
    if (w.sleep?.length)   summaryItems.push(`Avg. Sleep: ${(w.sleep.reduce((a, b) => a + b.hours, 0) / w.sleep.length).toFixed(1)} hrs`);
    if (w.steps?.length)   summaryItems.push(`Avg. Steps: ${Math.round(w.steps.reduce((a, b) => a + b.value, 0) / w.steps.length).toLocaleString()}`);
    if (w.water?.length)   summaryItems.push(`Avg. Water: ${(w.water.reduce((a, b) => a + b.value, 0) / w.water.length).toFixed(1)} cups`);
    if (w.mood?.length)    summaryItems.push(`Latest Mood: ${cap(w.mood.at(-1).value)}`);

    if (summaryItems.length) {
      doc.save().rect(LM, y, CW, 22).fill("#f0fdf4").restore();
      doc.fontSize(8.5).font("Helvetica").fillColor(DARK)
        .text(summaryItems.join("   |   "), LM + 8, y + 6, { width: CW - 16, lineBreak: false });
      y += 30;
    }

    // Day-by-day wellness table
    const wDates = [...new Set([
      ...(w.sleep || []).map(d => d.date),
      ...(w.mood  || []).map(d => d.date),
      ...(w.steps || []).map(d => d.date),
      ...(w.water || []).map(d => d.date),
    ])].sort((a, b) => new Date(b) - new Date(a));

    if (wDates.length) {
      const sleepMap = Object.fromEntries((w.sleep || []).map(d => [d.date, d]));
      const moodMap  = Object.fromEntries((w.mood  || []).map(d => [d.date, d]));
      const stepMap  = Object.fromEntries((w.steps || []).map(d => [d.date, d]));
      const watrMap  = Object.fromEntries((w.water || []).map(d => [d.date, d]));
      const exerMap  = Object.fromEntries((w.exercise || []).map(d => [d.date, d]));

      y = drawTable(doc, y,
        [
          { label: "Date",              width: 88 },
          { label: "Sleep (hrs)",       width: 75, align: "center" },
          { label: "Mood",              width: 80 },
          { label: "Steps",             width: 80, align: "center" },
          { label: "Water (cups)",      width: 80, align: "center" },
          { label: "Exercise (min)",    width: 96, align: "center" },
        ],
        wDates.map(d => [
          fmtDate(d, { weekday: "short", day: "numeric", month: "short" }),
          sleepMap[d] ? `${sleepMap[d].hours}` : "—",
          moodMap[d]  ? cap(moodMap[d].value)  : "—",
          stepMap[d]  ? stepMap[d].value.toLocaleString() : "—",
          watrMap[d]  ? `${watrMap[d].value}`  : "—",
          exerMap[d]  ? `${exerMap[d].value}`  : "—",
        ])
      );
    }
    y += 10;
  }

  // ── § 8  AI HEALTH INSIGHTS ───────────────────────────────────
  y = guard(doc, y, 100);
  y = sectionBar(doc, y, "AI Health Analysis & Recommendations", 8);
  doc.fontSize(7.5).font("Helvetica").fillColor(GRAY)
    .text(`Powered by ${ai.provider}  •  Generated ${fmtDate(new Date())}  •  For informational use only`, LM, y, { width: CW });
  y += 16;

  // Render AI text cleanly
  const lines = ai.text.split("\n").filter(l => l.trim());
  for (const line of lines) {
    y = guard(doc, y, 20);
    const t = line.trim().replace(/\*\*/g, "");
    if (t.match(/^#+\s/) || (t.endsWith(":") && t.length < 70 && !t.includes("."))) {
      // Section headings in AI output
      y += 4;
      doc.fontSize(10).font("Helvetica-Bold").fillColor(TEAL).text(t.replace(/^#+\s*/, ""), LM, y, { width: CW });
      y += 16;
    } else if (t.startsWith("•") || t.startsWith("-") || t.startsWith("*") || t.match(/^\d+\./)) {
      // Bullet points
      const clean = t.replace(/^[-*•]\s?/, "").replace(/^\d+\.\s?/, "");
      doc.fontSize(9).font("Helvetica").fillColor(BLACK).text("•  " + clean, LM + 10, y, { width: CW - 10 });
      y += doc.heightOfString("•  " + clean, { width: CW - 10 }) + 4;
    } else if (t) {
      doc.fontSize(9).font("Helvetica").fillColor("#374151").text(t, LM, y, { width: CW });
      y += doc.heightOfString(t, { width: CW }) + 4;
    }
  }

  // Disclaimer box
  y += 10;
  y = guard(doc, y, 50);
  doc.save().rect(LM, y, CW, 36).fill("#fef9c3").restore();
  doc.save().rect(LM, y, 4, 36).fill("#eab308").restore();
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#92400e")
    .text("⚠  Important Disclaimer", LM + 12, y + 6);
  doc.font("Helvetica").fillColor("#78350f")
    .text("This report is generated by MediTrack AI and is for informational purposes only. It does not constitute medical advice. Always consult a qualified healthcare professional before making any health decisions.", LM + 12, y + 18, { width: CW - 20 });

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
    MedicineLog.find({ userId, date: { $gte: startDate }, status: { $in: ["taken", "missed", "skipped"] } })
      .populate("medicineId", "medicineName"),
    HealthLog.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }),
    MedicalRecord.find({ userId, recordDate: { $gte: startDate } }).sort({ recordDate: -1 }).limit(20),
  ]);

  const totalTaken = medicineLogs.filter(l => l.status === "taken").length;
  const totalLogs  = medicineLogs.length;

  // Medicine-wise adherence
  const medicineStats = medicines.map(med => {
    const logs  = medicineLogs.filter(l => l.medicineId?._id?.toString() === med._id.toString());
    const taken = logs.filter(l => l.status === "taken").length;
    return { medicineName: med.medicineName, dosage: med.dosage, category: med.category, adherenceRate: logs.length ? Math.round((taken / logs.length) * 100) : 100 };
  });

  // Day-by-day medicines
  const dayByDayMedicines = {};
  medicineLogs.forEach(l => {
    const d = l.date.toISOString().split("T")[0];
    if (!dayByDayMedicines[d]) dayByDayMedicines[d] = { taken: [], missed: [], skipped: [] };
    if (l.medicineId?.medicineName) dayByDayMedicines[d][l.status].push(l.medicineId.medicineName);
  });

  // Vitals & Wellness
  const vitals  = { bloodPressure: [], heartRate: [], oxygenLevel: [], bloodSugar: [], bodyTemp: [], weight: [] };
  const wellness = { sleep: [], mood: [], steps: [], water: [], exercise: [] };

  healthLogs.forEach(log => {
    const d = log.date.toISOString().split("T")[0];
    if (log.bloodPressure?.systolic && log.bloodPressure?.diastolic)
      vitals.bloodPressure.push({ date: d, systolic: log.bloodPressure.systolic, diastolic: log.bloodPressure.diastolic });
    if (log.heartRate)   vitals.heartRate.push({ date: d, value: log.heartRate });
    if (log.oxygenLevel) vitals.oxygenLevel.push({ date: d, value: log.oxygenLevel });
    if (log.bloodSugar?.fasting || log.bloodSugar?.postMeal)
      vitals.bloodSugar.push({ date: d, fasting: log.bloodSugar.fasting, postMeal: log.bloodSugar.postMeal });
    if (log.bodyTemp)    vitals.bodyTemp.push({ date: d, value: log.bodyTemp });
    if (log.weight)      vitals.weight.push({ date: d, value: log.weight });
    if (log.sleepHours  != null) wellness.sleep.push({ date: d, hours: log.sleepHours });
    if (log.mood)        wellness.mood.push({ date: d, value: log.mood });
    if (log.stepsCount  != null) wellness.steps.push({ date: d, value: log.stepsCount });
    if (log.waterIntake != null) wellness.water.push({ date: d, value: log.waterIntake });
    if (log.exerciseMinutes != null) wellness.exercise.push({ date: d, value: log.exerciseMinutes });
  });

  // Streak
  let streak = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
  while (streak < 365) {
    const ds = new Date(cur), de = new Date(cur);
    de.setHours(23, 59, 59, 999);
    const dl = medicineLogs.filter(l => l.date >= ds && l.date <= de);
    if (!dl.length) { if (cur.toDateString() === new Date().toDateString()) { cur.setDate(cur.getDate() - 1); continue; } break; }
    if (dl.every(l => l.status === "taken")) { streak++; cur.setDate(cur.getDate() - 1); } else break;
  }

  return {
    user: { name: user.name, age: user.age, gender: user.gender, bloodGroup: user.bloodGroup, chronicConditions: user.chronicConditions, height: user.height, weight: user.weight },
    adherence: { adherenceRate: totalLogs ? Math.round((totalTaken / totalLogs) * 100) : 100, totalDoses: totalLogs, takenDoses: totalTaken, missedDoses: medicineLogs.filter(l => l.status === "missed").length, skippedDoses: medicineLogs.filter(l => l.status === "skipped").length, streak },
    medicines: medicineStats,
    dayByDayMedicines,
    medicalRecords: medicalRecords.map(r => ({ title: r.title, type: r.type, description: r.description, recordDate: r.recordDate, doctorName: r.doctorName, hospitalName: r.hospitalName })),
    vitals,
    wellness,
  };
}

export default { getHealthSummary, downloadHealthReport };
