const asyncHandler = require('express-async-handler');
const RepairCenter = require('../models/repairCenterModel');

/**
 * @desc    Get all repair centers
 * @route   GET /api/repair-centers
 * @access  Public
 */
const getRepairCenters = asyncHandler(async (req, res) => {
  // For this project, we'll just get all centers.
  // A real-world app would use the user's location (GeoJSON).
  const centers = await RepairCenter.find({});
  res.status(200).json(centers);
});

module.exports = {
  getRepairCenters,
};