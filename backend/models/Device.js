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
  },
);

// Add this to deviceModel.js before module.exports
deviceSchema.virtual("calculatedEcoScore").get(function () {
  const base = 50;
  const repairs = (this.repairsDone || 0) * 10;
  // If the device is older than 2 years, subtract points
  const ageInYears =
    (new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
  const agePenalty = ageInYears > 2 ? 20 : 0;

  return Math.min(Math.max(base + repairs - agePenalty, 0), 100);
});

// Ensure virtuals are included in JSON
deviceSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Device", deviceSchema);
