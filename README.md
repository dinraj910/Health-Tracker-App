<div align="center">

# 🏥 MediTrack

### Your Personal Health & Medication Management Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <strong>A modern, full-stack health management platform to track medicines, store medical records, and monitor your wellness journey.</strong>
</p>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 💊 Medicine Management
- Smart medication reminders
- Dosage tracking & scheduling
- Medicine inventory management
- Refill alerts

</td>
<td width="50%">

### 📁 Medical Records
- Secure document storage
- Prescription uploads
- Lab report management
- Cloud-synced records

</td>
</tr>
<tr>
<td width="50%">

### 📊 Health Analytics
- Visual health insights
- Medication adherence tracking
- Historical data analysis
- Customizable reports

</td>
<td width="50%">

### 🔒 Security & Privacy
- End-to-end encryption
- JWT authentication
- HIPAA-conscious design
- Data never shared

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

</td>
<td align="center" width="50%">

### Backend

![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/dinraj910/Health-Tracker-App.git
cd Health-Tracker-App

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Setup environment variables
cp ../.env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:5173   |
| Backend  | http://localhost:5000   |

---

## 📁 Project Structure

<details>
<summary><b>Frontend Architecture</b></summary>

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MedicineCard.jsx
│   │   ├── RecordCard.jsx
│   │   └── Chart.jsx
│   │
│   ├── pages/               # Route pages
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Medicines.jsx
│   │   ├── AddMedicine.jsx
│   │   ├── Records.jsx
│   │   ├── UploadRecord.jsx
│   │   ├── History.jsx
│   │   └── Profile.jsx
│   │
│   ├── layouts/             # Layout wrappers
│   │   └── AuthLayout.jsx
│   │
│   ├── routes/              # Route configuration
│   │   └── AppRoutes.jsx
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── UIContext.jsx
│   │
│   ├── services/            # API service layers
│   │   ├── authService.js
│   │   ├── medicineService.js
│   │   ├── recordService.js
│   │   ├── logService.js
│   │   └── analyticsService.js
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   │
│   ├── utils/               # Helper functions
│   │   └── helpers.js
│   │
│   ├── styles/              # Global styles
│   │   └── global.css
│   │
│   ├── main.jsx             # Entry point
│   └── App.jsx              # Root component
│
├── index.html
└── package.json
```

</details>

<details>
<summary><b>Backend Architecture</b></summary>

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.js            # Database connection
│   │   └── cloudinary.js    # Cloud storage config
│   │
│   ├── middleware/          # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── medicineController.js
│   │   ├── recordController.js
│   │   ├── logController.js
│   │   └── analyticsController.js
│   │
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   ├── MedicineLog.js
│   │   └── MedicalRecord.js
│   │
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── recordRoutes.js
│   │   ├── logRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── token.js
│   │   ├── validators.js
│   │   └── sendEmail.js
│   │
│   ├── cron/                # Scheduled tasks
│   │   └── reminderCron.js
│   │
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
│
├── .env
└── package.json
```

</details>

---

## 🔌 API Endpoints

<details>
<summary><b>Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

</details>

<details>
<summary><b>Medicines</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get all medicines |
| POST | `/api/medicines` | Add new medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |

</details>

<details>
<summary><b>Medical Records</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | Get all records |
| POST | `/api/records` | Upload record |
| DELETE | `/api/records/:id` | Delete record |

</details>

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "feat: add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Built with ❤️ by [Dinraj](https://github.com/dinraj910)

⭐ **Star this repo if you find it helpful!** ⭐

</div>
