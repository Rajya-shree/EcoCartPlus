const mongoose = require("mongoose");

const deviceTaskSchema = mongoose.Schema(
  {
    // Link to the specific device
    device: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Device",
    },
    // Link to the user who owns the device
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // The name of the task (copied from the master list)
    taskName: {
      type: String,
      required: true,
    },
    // The calculated date this task is next due
    dueDate: {
      type: Date,
      required: true,
    },
    // Tracks if the user has completed it
    isComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
    // When the task was completed
    completedAt: {
      type: Date,
    },

    // --- NEW FIELDS FOR RECURRING LOGIC ---
    frequencyMonths: {
      type: Number,
      required: true,
    },
    deviceCategory: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DeviceTask", deviceTaskSchema);
