const mongoose = require("mongoose");

const ecoProductSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String },
    buyLink: { type: String },
    imageUrl: { type: String },
    features: [String],

    // UPDATED FOR LOCAL ML FORMULA:
    // EcoScore = (0.4 * Repairability) + (0.3 * EPEAT) + (0.3 * EnergyStar)
    repairabilityScore: { type: Number, required: true, min: 1, max: 10 },
    epeatRating: { type: Number, required: true, min: 1, max: 10 },
    energyStarRating: { type: Number, required: true, min: 1, max: 10 },

    ecoReasons: [String],
  },
  {
    timestamps: true,
  }
);

ecoProductSchema.index({ name: "text" });

module.exports = mongoose.model("EcoProduct", ecoProductSchema);
