import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

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
