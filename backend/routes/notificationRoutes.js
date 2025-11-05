const express = require("express");
const router = express.Router();
const {
  getUnreadNotifications,
  markNotificationsAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// Protect all notification routes
router.use(protect);

// GET /api/notifications
router.route("/").get(getUnreadNotifications);

// PUT /api/notifications/read
router.route("/read").put(markNotificationsAsRead);

module.exports = router;
