require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// --- 1. Get your secret variables ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- 2. Create your Express app ---
const app = express();
app.use(express.json()); // Allows your app to accept JSON data
app.use(cors()); // Allows your frontend to make requests

// --- 3. Define your routes ---
// Test route
app.get("/", (req, res) => {
  res.send("Hello! Your AI Repair Assistant backend is running.");
});

// User routes
app.use("/api/users", require("./routes/userRoutes"));

// Device routes
app.use("/api/devices", require("./routes/deviceRoutes"));

// Repair guides routes (Public)
app.use("/api/repair-guides", require("./routes/repairRoutes"));

// Eco-Product routes
app.use("/api/eco-products", require("./routes/ecoProductRoutes"));

// 🟢 NEW: AI Repair Advisor routes 🟢
// This links the new AI diagnosis logic to the /api/ai endpoint
app.use("/api/repair-centers", require("./routes/repairCenterRoutes"));
app.use("/api/ai", require("./routes/aiRoutes.js"));

// --- 4. Add your Error Middleware ---
// (These must be at the end, after all your routes)
app.use(notFound);
app.use(errorHandler);

// --- 5. Connect to DB and Start Server ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");

    // Only start the server if the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
