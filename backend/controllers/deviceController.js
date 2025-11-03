const asyncHandler = require("express-async-handler");
const Device = require("../models/deviceModel");

/**
 * @desc    Get all of the logged-in user's devices
 * @route   GET /api/devices
 * @access  Private
 */
const getMyDevices = asyncHandler(async (req, res) => {
  // We can use req.user.id because our 'protect' middleware adds it
  const devices = await Device.find({ user: req.user._id });
  res.status(200).json(devices);
});

/**
 * @desc    Create a new device
 * @route   POST /api/devices
 * @access  Private
 */
const createDevice = asyncHandler(async (req, res) => {
  const { deviceName, purchaseDate, deviceModel, category } = req.body;

  if (!deviceName) {
    res.status(400);
    throw new Error("Device name is required");
  }

  const device = await Device.create({
    user: req.user._id, // Attach the logged-in user's ID
    deviceName,
    purchaseDate,
    deviceModel,
    category,
  });

  res.status(201).json(device);
});

module.exports = {
  getMyDevices,
  createDevice,
};
