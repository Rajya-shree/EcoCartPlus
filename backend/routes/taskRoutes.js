const express = require("express");
const router = express.Router();
const {
  getUpcomingTasks,
  completeTask,
  getTasksForDevice,
  getAllTasks,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const MaintenanceRule = require("../models/MaintenanceRule");

// POST: Simulate a manufacturer releasing an update live
router.post("/admin/trigger-update", async (req, res) => {
  try {
    const { targetBrand, targetModel, taskName, description, urgency } =
      req.body;

    // Create a new rule in the database
    const newRule = await MaintenanceRule.create({
      taskName,
      description,
      type: "Software Update",
      urgency: urgency || "High",
      targetBrand,
      targetModel,
      frequencyDays: 0, // One-time push
      isActive: true,
    });

    // The Cron Job will automatically pick this up on its next 1-minute cycle!
    res.status(201).json({
      message: "Live update injected into rule engine successfully.",
      rule: newRule,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// DELETE: Clear all rules (To fix Postman Spam from testing)
router.delete("/admin/clear-rules", async (req, res) => {
  try {
    await MaintenanceRule.deleteMany({});
    res.status(200).json({ message: "All spam rules deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protect all task routes
router.use(protect);

// GET /api/tasks (The missing route!)
router.route("/").get(getAllTasks);

// GET /api/tasks/upcoming
router.route("/upcoming").get(getUpcomingTasks);

router.patch("/:id", protect, completeTask);

// PUT /api/tasks/:id/complete
router.route("/:id/complete").put(completeTask);

// GET /api/tasks/device/:id
router.route("/device/:id").get(getTasksForDevice);

module.exports = router;
