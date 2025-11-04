const mongoose = require("mongoose");

const repairCenterSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  // We'll use a simple string for distance for this project
  distance: { type: String, required: true },
});

module.exports = mongoose.model("RepairCenter", repairCenterSchema);
