// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ResearchRouter from "./routes/Research.js";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Check environment variables
console.log("Environment variables loaded:");
console.log("- OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Present (first 10 chars): " + process.env.OPENAI_API_KEY.substring(0, 10) + "..." : "MISSING");
console.log("- MONGO_URI:", process.env.MONGO_URI ? "Present" : "MISSING");
console.log("- PORT:", process.env.PORT || 5005);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  dbName: "newsApp",
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Use Research routes
app.use("/api/news", ResearchRouter);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));