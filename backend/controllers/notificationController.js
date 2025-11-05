const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");

/**
 * @desc    Get all unread notifications for the logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getUnreadNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
    isRead: false,
  })
    .sort({ createdAt: -1 }) // Show newest first
    .populate({
      path: "task",
      select: "taskName device",
      populate: {
        path: "device",
        select: "deviceName",
      },
    });

  res.status(200).json(notifications);
});

/**
 * @desc    Mark all unread notifications as read
 * @route   PUT /api/notifications/read
 * @access  Private
 */
const markNotificationsAsRead = asyncHandler(async (req, res) => {
  // Find all unread notifications for this user and update them
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({ message: "Notifications marked as read" });
});

module.exports = {
  getUnreadNotifications,
  markNotificationsAsRead,
};
