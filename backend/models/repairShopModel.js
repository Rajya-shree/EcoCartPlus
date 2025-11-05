const mongoose = require("mongoose");

const repairShopSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    // e.g., "2.3 miles away"
    distance: { type: String, required: true },
    // e.g., 4.8
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

repairShopSchema.index({ name: "text" });

module.exports = mongoose.model("RepairShop", repairShopSchema);
