const asyncHandler = require("express-async-handler");
const RepairShop = require("../models/repairShopModel");

/**
 * @desc    Get all repair shops
 * @route   GET /api/repair-shops
 * @access  Public
 */
const getRepairShops = asyncHandler(async (req, res) => {
  // For now, we just return all shops.
  // Later, we could add search logic based on the user's query.
  const shops = await RepairShop.find({});
  res.status(200).json(shops);
});

module.exports = {
  getRepairShops,
};
