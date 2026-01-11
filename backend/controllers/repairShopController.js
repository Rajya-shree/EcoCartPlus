const asyncHandler = require("express-async-handler");
const RepairShop = require("../models/repairShopModel"); // This was missing and caused a crash

/**
 * @desc    Get all repair shops with distance calculation
 * @route   GET /api/repair-shops
 * @access  Public
 */
const getRepairShops = asyncHandler(async (req, res) => {
  const { userLat, userLon } = req.query; // Passed from frontend
  const shops = await RepairShop.find({});

  if (!userLat || !userLon) {
    return res.status(200).json(shops);
  }

  // Haversine Formula Implementation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const shopsWithDistance = shops
    .map((shop) => ({
      ...shop.toObject(),
      distance:
        calculateDistance(
          userLat,
          userLon,
          shop.latitude,
          shop.longitude
        ).toFixed(2) + " km",
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  res.status(200).json(shopsWithDistance);
});

module.exports = {
  getRepairShops,
};
