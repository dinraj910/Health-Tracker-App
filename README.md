frontend/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MedicineCard.jsx
│   │   ├── RecordCard.jsx
│   │   └── Chart.jsx
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Medicines.jsx
│   │   ├── AddMedicine.jsx
│   │   ├── Records.jsx
│   │   ├── UploadRecord.jsx
│   │   ├── History.jsx
│   │   └── Profile.jsx
│   │
│   ├── layouts/
│   │   └── AuthLayout.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── UIContext.jsx
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── medicineService.js
│   │   ├── recordService.js
│   │   ├── logService.js
│   │   └── analyticsService.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── main.jsx
│   └── App.jsx
│
├── index.html
├── package.json
└── README.md




backend/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js       
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── medicineController.js
│   │   ├── recordController.js
│   │   ├── logController.js
│   │   └── analyticsController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   ├── MedicineLog.js
│   │   └── MedicalRecord.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── recordRoutes.js
│   │   ├── logRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   ├── utils/
│   │   ├── token.js
│   │   ├── validators.js
│   │   └── sendEmail.js    
│   │
│   ├── cron/
│   │   └── reminderCron.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
