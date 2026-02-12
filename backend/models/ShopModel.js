const mongoose = require("mongoose");

const repairShopSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

repairShopSchema.index({ name: "text" });

module.exports = mongoose.model("RepairShop", repairShopSchema);
