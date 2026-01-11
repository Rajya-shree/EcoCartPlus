const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    // This connects the device to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // This tells Mongoose to link to the 'User' model
    },
    // Your 'name' field
    deviceName: {
      type: String,
      required: [true, "Please add a device name"],
    },
    // This is from your plan
    purchaseDate: {
      type: Date,
    },
    // We can add other fields from your plan
    deviceModel: {
      type: String,
    },
    category: {
      type: String,
    },
    repairsDone: {
      type: Number,
      default: 0,
    },
    ecoScore: {
      type: Number,
      default: 0, // Default to 0 if no match is found
    },
    // Add these to your deviceSchema in backend/models/deviceModel.js
    estimatedLifespanMonths: {
      type: Number,
      default: 60, // Default 5 years
    },
    status: {
      type: String,
      enum: ["Active", "Repaired", "Recycled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Device", deviceSchema);
