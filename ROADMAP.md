# 🏥 MediTrack — Project Roadmap & Development Tracker

> **Full-stack Health Tracker App** — React + Vite + TailwindCSS (Frontend) · Express + MongoDB + JWT (Backend)
>
> Last Updated: February 23, 2026

---

## Table of Contents

- [Project Vision](#-project-vision)
- [Tech Stack](#-tech-stack)
- [Development Phases](#-development-phases)
  - [Phase 1: Foundation](#phase-1-foundation--core-architecture)
  - [Phase 2: Auth & Security](#phase-2-authentication--security)
  - [Phase 3: Core Features](#phase-3-core-features--health-management)
  - [Phase 4: Dashboard & Analytics](#phase-4-dashboard--analytics)
  - [Phase 5: UI/UX Polish](#phase-5-uiux-polish--experience)
  - [Phase 6: Medicine Intelligence](#phase-6-medicine-intelligence--api-integration)
  - [Phase 7: AI & Automation](#phase-7-ai--smart-automation)
  - [Phase 8: Notifications & Real-time](#phase-8-notifications--real-time)
  - [Phase 9: Social & Export](#phase-9-social-export--sharing)
  - [Phase 10: Production & Deployment](#phase-10-production--deployment)
- [Future Ideas](#-future-ideas)

---

## 🎯 Project Vision

MediTrack is a comprehensive health management platform that enables users to:
- Track daily medicines and never miss a dose
- Store medical records and prescriptions securely
- Monitor vitals, mood, sleep, and lifestyle metrics
- Get AI-powered health insights and medicine information
- Share health reports with doctors

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose |
| **Auth** | JWT (httpOnly cookies), bcryptjs, Google OAuth 2.0 |
| **Email** | Nodemailer (Gmail SMTP) |
| **File Upload** | Multer |
| **Validation** | Joi (backend), custom validators (frontend) |
| **Deployment** | Docker, CI/CD (GitHub Actions) |

---

## 📋 Development Phases

### Phase 1: Foundation & Core Architecture
> *Setting up the project skeleton, database models, and basic routing*

| # | Task | Status |
|---|------|--------|
| 1.1 | Initialize React + Vite frontend with TailwindCSS | ✅ Done |
| 1.2 | Initialize Express backend with ES modules | ✅ Done |
| 1.3 | MongoDB connection setup with Mongoose | ✅ Done |
| 1.4 | Design and implement **User** model (name, email, password, health profile, lifestyle, insurance, doctors) | ✅ Done |
| 1.5 | Design and implement **Medicine** model (name, dosage, frequency, timings, category, color) | ✅ Done |
| 1.6 | Design and implement **MedicineLog** model (taken/skipped tracking) | ✅ Done |
| 1.7 | Design and implement **MedicalRecord** model (file uploads, categories) | ✅ Done |
| 1.8 | Design and implement **HealthLog** model (vitals, lifestyle, mood, symptoms) | ✅ Done |
| 1.9 | Set up API routing structure (`/api/auth`, `/api/user`, `/api/medicine`, etc.) | ✅ Done |
| 1.10 | Create reusable UI components (`Button`, `Input`, `Card`, `Modal`, `Badge`, `Loader`) | ✅ Done |
| 1.11 | Set up React Router with protected & public routes | ✅ Done |
| 1.12 | Create `DashboardLayout` with Sidebar, Topbar, and MobileNav | ✅ Done |

---

### Phase 2: Authentication & Security
> *User registration, login, and account security*

| # | Task | Status |
|---|------|--------|
| 2.1 | Local auth — Register (name, email, password) with Joi validation | ✅ Done |
| 2.2 | Local auth — Login with JWT token (httpOnly cookie) | ✅ Done |
| 2.3 | Logout endpoint with cookie clearing | ✅ Done |
| 2.4 | Auth middleware for protected routes | ✅ Done |
| 2.5 | Frontend `AuthContext` + `useAuth` hook | ✅ Done |
| 2.6 | Google OAuth 2.0 — Sign In / Sign Up | ✅ Done |
| 2.7 | Forgot Password — OTP email (Nodemailer + Gmail App Passwords) | ✅ Done |
| 2.8 | Reset Password — Verify OTP + set new password | ✅ Done |
| 2.9 | Block password reset for Google-auth users | ✅ Done |
| 2.10 | Change password from Profile page | ✅ Done |
| 2.11 | Account deletion with confirmation | ✅ Done |
| 2.12 | Session persistence (localStorage token verification on mount) | ✅ Done |
| 2.13 | Rate limiting on auth endpoints | ⬜ To Do |
| 2.14 | Email verification on registration (send verification link) | ⬜ To Do |
| 2.15 | Two-Factor Authentication (TOTP / SMS) | ⬜ To Do |
| 2.16 | Login attempt tracking & account lockout | ⬜ To Do |

---

### Phase 3: Core Features — Health Management
> *The primary CRUD features for medicines, records, and health logs*

| # | Task | Status |
|---|------|--------|
| **Medicines** | | |
| 3.1 | Add medicine (name, dosage, frequency, timings, category, color, instructions) | ✅ Done |
| 3.2 | View all medicines (active / completed / all) | ✅ Done |
| 3.3 | Edit medicine details | ✅ Done |
| 3.4 | Delete medicine | ✅ Done |
| 3.5 | Toggle medicine active/inactive | ✅ Done |
| 3.6 | Today's medicines — list doses for today | ✅ Done |
| 3.7 | Mark medicine as taken / skipped (MedicineLog) | ✅ Done |
| 3.8 | Medicine reminders toggle | ✅ Done |
| **Medical Records** | | |
| 3.9 | Upload medical record (file + metadata) | ✅ Done |
| 3.10 | View all records with filtering | ✅ Done |
| 3.11 | Download / view individual record | ✅ Done |
| 3.12 | Delete record | ✅ Done |
| **Health Logs** | | |
| 3.13 | Log daily vitals (BP, heart rate, SpO2, temperature, blood sugar) | ✅ Done |
| 3.14 | Log lifestyle (water intake, sleep, steps, exercise) | ✅ Done |
| 3.15 | Log mood, stress level, energy level | ✅ Done |
| 3.16 | Log symptoms with notes | ✅ Done |
| 3.17 | View health log history over time | ✅ Done |
| **Profile** | | |
| 3.18 | View/edit personal info (name, phone, DOB, gender, blood group) | ✅ Done |
| 3.19 | View/edit body metrics (height, weight, BMI) | ✅ Done |
| 3.20 | Manage chronic conditions | ✅ Done |
| 3.21 | Manage doctors list | ✅ Done |
| 3.22 | Manage insurance info | ✅ Done |
| 3.23 | Lifestyle preferences (smoking, alcohol, activity, diet) | ✅ Done |
| 3.24 | Avatar upload | ✅ Done |

---

### Phase 4: Dashboard & Analytics
> *Visual health insights and data-driven dashboard*

| # | Task | Status |
|---|------|--------|
| 4.1 | Dashboard — Time-based greeting | ✅ Done |
| 4.2 | Dashboard — Health progress rings (adherence, water, steps) | ✅ Done |
| 4.3 | Dashboard — Today's vitals card display | ✅ Done |
| 4.4 | Dashboard — Mood selector widget | ✅ Done |
| 4.5 | Dashboard — Stats row (active meds, weekly adherence, streak, sleep) | ✅ Done |
| 4.6 | Dashboard — Wellness snapshot (sleep, water, steps, exercise) | ✅ Done |
| 4.7 | Dashboard — Quick vitals input modal | ✅ Done |
| 4.8 | Analytics page — Adherence trends chart | ✅ Done |
| 4.9 | Analytics page — Vitals history graphs | ✅ Done |
| 4.10 | Analytics page — Summary statistics | ✅ Done |
| 4.11 | Dashboard — BMI calculator with status indicator | 🔲 To Do |
| 4.12 | Dashboard — Weekly/monthly health score | 🔲 To Do |
| 4.13 | Analytics — Export health report as PDF | 🔲 To Do |
| 4.14 | Analytics — Compare metrics over custom date ranges | 🔲 To Do |

---

### Phase 5: UI/UX Polish & Experience
> *Making the app visually stunning and intuitive*

| # | Task | Status |
|---|------|--------|
| 5.1 | Home page — Guest landing with features, stats, CTA | ✅ Done |
| 5.2 | Home page — Logged-in hero with greeting, quick actions, user info | ✅ Done |
| 5.3 | Topbar — Command palette search (Ctrl+K) with page navigation | ✅ Done |
| 5.4 | Topbar — Settings dropdown (Profile, Security, Appearance links) | ✅ Done |
| 5.5 | Topbar — Enhanced profile dropdown with avatar, email, status | ✅ Done |
| 5.6 | Sidebar — Navigation with collapse/expand + quick add button | ✅ Done |
| 5.7 | Mobile bottom navigation bar | ✅ Done |
| 5.8 | Framer Motion animations across all pages | ✅ Done |
| 5.9 | Home page navbar — Profile dropdown with links | ✅ Done |
| 5.10 | Dark theme (current default) | ✅ Done |
| 5.11 | Light theme toggle | 🔲 To Do |
| 5.12 | Search bar — Search medicines & records by keyword (actual data search) | 🔲 To Do |
| 5.13 | Toast notifications system (success/error/info messages) | 🔲 To Do |
| 5.14 | Skeleton loading states for all data-fetching pages | 🔲 To Do |
| 5.15 | Empty states with illustrations (no medicines, no records, etc.) | 🔲 To Do |
| 5.16 | Onboarding flow for new users (welcome tour / setup wizard) | 🔲 To Do |
| 5.17 | Responsive design audit across all breakpoints | 🔲 To Do |
| 5.18 | Accessibility audit (ARIA labels, keyboard nav, contrast) | 🔲 To Do |
| 5.19 | 404 and error boundary pages | 🔲 To Do |

---

### Phase 6: Medicine Intelligence & API Integration
> *Leverage external medicine databases to power smart features*

| # | Task | Status | Priority |
|---|------|--------|----------|
| 6.1 | Integrate **OpenFDA API** or **RxNorm API** for medicine lookup | 🔲 To Do | 🔴 High |
| 6.2 | Medicine search autocomplete — search by name, get dosage/info | 🔲 To Do | 🔴 High |
| 6.3 | Medicine details page — side effects, uses, warnings from API | 🔲 To Do | 🔴 High |
| 6.4 | Drug interaction checker — warn when adding conflicting medicines | 🔲 To Do | 🟡 Medium |
| 6.5 | Medicine alternatives / generic equivalents suggestion | 🔲 To Do | 🟡 Medium |
| 6.6 | Auto-fill medicine details when user selects from search | 🔲 To Do | 🟡 Medium |
| 6.7 | Medicine image recognition (scan pill / packaging) | 🔲 To Do | 🟢 Low |
| 6.8 | Barcode / QR scanner for medicine box | 🔲 To Do | 🟢 Low |
| 6.9 | Cache frequently searched medicines locally | 🔲 To Do | 🟡 Medium |

> **APIs to consider:**
> - [OpenFDA Drug API](https://open.fda.gov/apis/drug/) — Free, official FDA drug data
> - [RxNorm API](https://rxnav.nlm.nih.gov/RxNormAPIs.html) — NLM medicine normalization
> - [DrugBank API](https://www.drugbank.com/api) — Comprehensive drug database
> - [MedlinePlus Connect](https://medlineplus.gov/connect/overview.html) — Patient-facing drug info

---

### Phase 7: AI & Smart Automation
> *AI-powered features to make health management intelligent*

| # | Task | Status | Priority |
|---|------|--------|----------|
| **LLM-Powered Features** | | | |
| 7.1 | AI Health Chat — Ask health questions, get conversational answers | 🔲 To Do | 🔴 High |
| 7.2 | AI Medicine Explainer — "Explain this medicine in simple terms" | 🔲 To Do | 🔴 High |
| 7.3 | AI-powered symptom checker (conversational) | 🔲 To Do | 🟡 Medium |
| 7.4 | Natural language medicine entry — "Add Paracetamol 500mg twice daily" | 🔲 To Do | 🟡 Medium |
| 7.5 | AI-generated daily health summary / insights | 🔲 To Do | 🟡 Medium |
| **ML / Automation Models** | | | |
| 7.6 | Medication adherence prediction (predict skip risk) | 🔲 To Do | 🟡 Medium |
| 7.7 | Health trend anomaly detection (alert unusual vitals) | 🔲 To Do | 🔴 High |
| 7.8 | Smart medicine timing suggestions based on routine | 🔲 To Do | 🟢 Low |
| 7.9 | Prescription OCR — Extract medicine info from uploaded prescription photo | 🔲 To Do | 🔴 High |
| 7.10 | Medical report summary — Upload a lab report, get key findings | 🔲 To Do | 🟡 Medium |
| **Automation** | | | |
| 7.11 | Auto-refill reminders (alert when medicine course is ending) | 🔲 To Do | 🔴 High |
| 7.12 | Scheduled health check reminders (monthly BP, quarterly blood work) | 🔲 To Do | 🟡 Medium |
| 7.13 | Auto-generated weekly health report email | 🔲 To Do | 🟡 Medium |
| 7.14 | Smart dosage adjustment notes based on logged vitals | 🔲 To Do | 🟢 Low |

> **AI/LLM Integration Options:**
> - **Gemini API** (Google) — Free tier available, great for health Q&A
> - **OpenAI GPT-4** — Best quality, paid API
> - **Groq** (Llama 3) — Fast inference, free tier
> - **Tesseract.js** / **Google Vision API** — For OCR on prescriptions
> - **TensorFlow.js** — Client-side ML for anomaly detection

---

### Phase 8: Notifications & Real-time
> *Push notifications, email alerts, and real-time updates*

| # | Task | Status | Priority |
|---|------|--------|----------|
| 8.1 | Email reminders for medicine doses (Nodemailer cron job) | 🔲 To Do | 🔴 High |
| 8.2 | Browser push notifications (Service Worker + Web Push API) | 🔲 To Do | 🔴 High |
| 8.3 | In-app notification center (bell icon with notification list) | 🔲 To Do | 🔴 High |
| 8.4 | Notification preferences (toggle per category in Profile) | 🔲 To Do | 🟡 Medium |
| 8.5 | Cron job — Daily medicine reminder emails at scheduled times | 🔲 To Do | 🔴 High |
| 8.6 | Cron job — Weekly health summary email | 🔲 To Do | 🟡 Medium |
| 8.7 | Socket.io real-time updates (live dashboard refresh) | 🔲 To Do | 🟢 Low |
| 8.8 | Missed dose alerts (if not marked taken within X hours) | 🔲 To Do | 🔴 High |

---

### Phase 9: Social, Export & Sharing
> *Share health data with doctors and family*

| # | Task | Status | Priority |
|---|------|--------|----------|
| 9.1 | Generate PDF health report (full summary with charts) | 🔲 To Do | 🔴 High |
| 9.2 | Share report via email to doctor | 🔲 To Do | 🟡 Medium |
| 9.3 | Export medicine list as CSV/PDF | 🔲 To Do | 🟡 Medium |
| 9.4 | Export health logs as CSV | 🔲 To Do | 🟡 Medium |
| 9.5 | Shareable health cards (like appointment summaries) | 🔲 To Do | 🟢 Low |
| 9.6 | Family member profiles (track health for family) | 🔲 To Do | 🟢 Low |
| 9.7 | Doctor portal — Shared view for healthcare providers | 🔲 To Do | 🟢 Low |

---

### Phase 10: Production & Deployment
> *Making the app production-ready and deploying*

| # | Task | Status | Priority |
|---|------|--------|----------|
| 10.1 | Dockerize frontend and backend | 🔲 To Do | 🔴 High |
| 10.2 | CI/CD pipeline (GitHub Actions — lint, test, build, deploy) | 🔲 To Do | 🔴 High |
| 10.3 | Environment configuration (.env management) | ✅ Done | — |
| 10.4 | Deploy backend to Railway / Render / AWS | 🔲 To Do | 🔴 High |
| 10.5 | Deploy frontend to Vercel / Netlify | 🔲 To Do | 🔴 High |
| 10.6 | MongoDB Atlas setup for production | 🔲 To Do | 🔴 High |
| 10.7 | Custom domain + SSL configuration | 🔲 To Do | 🟡 Medium |
| 10.8 | Comprehensive README.md with screenshots | 🔲 To Do | 🔴 High |
| 10.9 | API documentation (Swagger / Postman collection) | 🔲 To Do | 🟡 Medium |
| 10.10 | Error monitoring (Sentry integration) | 🔲 To Do | 🟡 Medium |
| 10.11 | Performance optimization (lazy loading, code splitting) | 🔲 To Do | 🟡 Medium |
| 10.12 | SEO optimization (meta tags, OG images) | 🔲 To Do | 🟢 Low |
| 10.13 | PWA support (installable, offline-capable) | 🔲 To Do | 🟢 Low |
| 10.14 | Backend unit + integration tests (Jest / Vitest) | 🔲 To Do | 🟡 Medium |
| 10.15 | Frontend component tests (React Testing Library) | 🔲 To Do | 🟡 Medium |

---

## 📊 Progress Overview

```
Phase 1: Foundation          ████████████████████ 100%  (12/12)
Phase 2: Auth & Security     ████████████████░░░░  75%  (12/16)
Phase 3: Core Features       ████████████████████ 100%  (24/24)
Phase 4: Dashboard           ██████████████░░░░░░  71%  (10/14)
Phase 5: UI/UX Polish        ██████████░░░░░░░░░░  53%  (10/19)
Phase 6: Medicine API        ░░░░░░░░░░░░░░░░░░░░   0%  (0/9)
Phase 7: AI & Automation     ░░░░░░░░░░░░░░░░░░░░   0%  (0/14)
Phase 8: Notifications       ░░░░░░░░░░░░░░░░░░░░   0%  (0/8)
Phase 9: Social & Export     ░░░░░░░░░░░░░░░░░░░░   0%  (0/7)
Phase 10: Deployment         ██░░░░░░░░░░░░░░░░░░   7%  (1/15)
───────────────────────────────────────────────────────
OVERALL                      ██████████░░░░░░░░░░  49%  (69/142)
```

---

## 🚀 Recommended Next Priorities

Based on development cycle maturity and resume impact, here's the **recommended order**:

### 🔥 Immediate (This Week)
1. **Toast notification system** (5.13) — Essential UX
2. **Actual search functionality** (5.12) — Search medicines/records by keyword
3. **404 and error pages** (5.19) — Polish
4. **Light theme toggle** (5.11) — User preference

### ⚡ Short-Term (Next 2 Weeks)
5. **Medicine API integration** (6.1–6.3) — OpenFDA drug search + autocomplete
6. **Drug interaction checker** (6.4) — High-impact feature
7. **Email medicine reminders** (8.1, 8.5) — Core value proposition
8. **In-app notification center** (8.3) — Make the bell work

### 🧠 Medium-Term (Next Month)
9. **AI Health Chat** (7.1–7.2) — LLM integration with Gemini/GPT
10. **Prescription OCR** (7.9) — Upload prescription → extract medicines
11. **PDF health report generation** (9.1) — Doctor-ready export
12. **Anomaly detection** (7.7) — Alert on unusual vitals

### 🏁 Pre-Deployment
13. **Docker + CI/CD** (10.1–10.2)
14. **Deploy to cloud** (10.4–10.6)
15. **README with screenshots** (10.8)
16. **API documentation** (10.9)

---

## 💡 Future Ideas

| Idea | Notes |
|------|-------|
| Apple Health / Google Fit sync | Import steps, heart rate, sleep from wearables |
| Multilingual support (i18n) | Hindi, Spanish, etc. |
| Voice commands | "Hey MediTrack, what medicines do I take today?" |
| Pharmacy locator | Find nearby pharmacies via Maps API |
| Telemedicine integration | Book appointments directly |
| Wearable device support | Smartwatch companion app |
| Gamification | Health streaks, badges, weekly challenges |
| Community forum | Users share health tips and experiences |

---

> **Legend:**  ✅ Done · 🔲 To Do · 🔴 High Priority · 🟡 Medium Priority · 🟢 Low Priority

---

*Built with ❤️ for better health — MediTrack Team*
