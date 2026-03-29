import dotenv from "dotenv";

// Load environment variables BEFORE any other imports
dotenv.config();

const { default: app } = await import("./src/app.js");
const { default: connectDB } = await import("./src/config/db.js");
const { startReminderCron } = await import("./src/cron/reminderCron.js");

// Connect to database
connectDB();

// Start background cron jobs
startReminderCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║         🏥 MediTrack Server Started           ║
╠═══════════════════════════════════════════════╣
║  🚀 Server:  http://localhost:${PORT}            ║
║  📊 API:     http://localhost:${PORT}/api        ║
║  🔧 Mode:    ${process.env.NODE_ENV || "development"}                     ║
╚═══════════════════════════════════════════════╝
  `);
});
