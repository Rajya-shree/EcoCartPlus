const mongoose = require("mongoose");

const maintenanceTaskSchema = mongoose.Schema({
  // e.g., "Smartphone", "Laptop", "Gaming Console"
  category: {
    type: String,
    required: true,
  },
  // e.g., "Check for Software Update", "Clean Fans"
  taskName: {
    type: String,
    required: true,
  },
  // How often this task should be done, in months
  frequencyMonths: {
    type: Number,
    required: true,
  },
  // A description of why this task is important
  description: {
    type: String,
  },
});

module.exports = mongoose.model("MaintenanceTask", maintenanceTaskSchema);
