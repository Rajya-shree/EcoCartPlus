// backend/index.js

const videoRecommendationRoutes = require("./routes/videoRecommendationRoutes");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const { startAutomation } = require('./utils/automationEngine');
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const conversationRoutes = require("./routes/ConversationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

// --- 1. Session Management  ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "econova_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      httpOnly: true, // Security: prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day session
    },
  }),
);

// app.use(express.json());
// Increase limits to handle Base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true, // Required for sessions to work over CORS
//   }),
// );
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://resplendent-pie-a488f0.netlify.app",
    ],
    credentials: true,
  }),
);

// Logger Middleware
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.originalUrl);
  next();
});

// --- 2. Routes ---

//Root End
app.get("/", (req, res) => {
  res.send("EcoNova+ Backend is running securely.");
});

// User & Auth
app.use("/api/auth", require("./routes/authRoutes"));

// Device Lifecycle & Maintenance
app.use("/api/lifecycle", require("./routes/lifecycleRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// AI Diagnosis & Repair Guides
app.use("/api/diagnosis", require("./routes/diagnosisRoutes")); // Groq Powered
app.use("/api/ifixit", require("./routes/ifixitRoutes")); // iFixit API Proxy

// Green Shopping & Eco-Products
app.use("/api/green-shopping", require("./routes/greenShoppingRoutes"));

app.use("/api/conversations", conversationRoutes);

// New Features (Gemini Powered)
app.use("/api/video-recommendations", videoRecommendationRoutes);
app.use("/api/shop-locator", require("./routes/locatorRoutes"));

// 🟢 AI Route - Fixed (Uncommented and verified)
app.use("/api/ai", require("./routes/aiRoutes"));

// --- 3. Global Error Handling ---
app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    startAutomation();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection failed:", err.message));
