const express = require("express");
const router = express.Router();
const {
  getUpcomingTasks,
  completeTask,
  getTasksForDevice,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// Protect all task routes
router.use(protect);

// GET /api/tasks/upcoming
router.route("/upcoming").get(getUpcomingTasks);

// PUT /api/tasks/:id/complete
router.route("/:id/complete").put(completeTask);

// GET /api/tasks/device/:id
router.route("/device/:id").get(getTasksForDevice);

module.exports = router;
