const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    // Link to the user who gets the notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Link to the specific task that is overdue
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'DeviceTask',
    },
    // The message to display
    message: {
      type: String,
      required: true,
    },
    // Has the user seen this notification?
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create an index to prevent duplicate notifications for the same task
notificationSchema.index({ user: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);