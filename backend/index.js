// backend/index.js

//const repairAssistantRoutes = require("./routes/repairAssistantRoutes");
const videoRecommendationRoutes = require("./routes/videoRecommendationRoutes");


if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
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

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Required for sessions to work over CORS
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

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/devices", require("./routes/deviceRoutes"));
// app.use("/api/repair-guides", require("./routes/repairRoutes"));
// app.use("/api/eco-products", require("./routes/ecoProductRoutes"));
// app.use("/api/tasks", require("./routes/taskRoutes"));
// app.use("/api/notifications", require("./routes/notificationRoutes"));
// app.use("/api/repair-shops", require("./routes/repairShopRoutes"));
// app.use("/api/youtube", require("./routes/youtubeRoutes"));

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

// New Features (Gemini Powered)
// app.use(
//   "/api/video-recommendations",
//   require("./routes/videoRecommendationRoutes"),
// );
app.use("/api/video-recommendations", videoRecommendationRoutes);
app.use("/api/shop-locator", require("./routes/locatorRoutes"));

// 🟢 AI Route - Fixed (Uncommented and verified)
// app.use("/api/ai", require("./routes/aiRoutes"));

// app.use("/api/repair-assistant", repairAssistantRoutes);
// app.use("/api/diagnosis", require("./routes/diagnosisRoutes"));



// Root Endpoint
// app.get("/", (req, res) => {
//   res.send("EcoNova+ Backend is running securely.");
// });

// --- 3. Global Error Handling (Professor's Requirement) ---
app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection failed:", err.message));
