import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Connect to Database
connectDB();

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.set('trust proxy', 1);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Configure CORS with allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3001",
  "http://localhost:3001",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ROUTES */
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import authRoutes from "./routes/authRoutes.js";

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/", (_req, res) => {
  res.json({ message: "NexTask API is running" });
});

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/auth", authRoutes);

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler — must be LAST
app.use(errorHandler);

/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
