const asyncHandler = require("express-async-handler");
const Device = require("../models/deviceModel");
const MaintenanceTask = require("../models/maintenanceTaskModel");
const DeviceTask = require("../models/deviceTaskModel");
const EcoProduct = require("../models/ecoProductModel"); // <-- 1. IMPORT ECOPRODUCT

/**
 * @desc    Get all of the logged-in user's devices
 * @route   GET /api/devices
 * @access  Private
 */
const getMyDevices = asyncHandler(async (req, res) => {
  const devices = await Device.find({ user: req.user._id });
  res.status(200).json(devices);
});

/**
 * @desc    Create a new device AND generate tasks AND get eco-score
 * @route   POST /api/devices
 * @access  Private
 */
const createDevice = asyncHandler(async (req, res) => {
  const { deviceName, purchaseDate, deviceModel, category } = req.body;

  if (!deviceName || !category) {
    res.status(400);
    throw new Error("Device name and category are required");
  }

  // --- 2. NEW ECO-SCORE LOGIC ---
  let finalEcoScore = 0;
  // Try to find a matching product in our eco-database
  const ecoProductMatch = await EcoProduct.findOne({
    $text: { $search: deviceName },
  });

  if (ecoProductMatch) {
    // If we find a match, calculate its score
    finalEcoScore =
      ecoProductMatch.materialScore * 5 +
      ecoProductMatch.repairabilityScore * 3 +
      ecoProductMatch.companyScore * 2;
  }
  // --- END OF NEW LOGIC ---

  // 3. Create the device, NOW WITH THE ECOSCORE
  const device = await Device.create({
    user: req.user._id,
    deviceName,
    purchaseDate,
    deviceModel,
    category,
    ecoScore: finalEcoScore, // <-- 4. SAVE THE SCORE
  });

  // 4. Find all matching "master" tasks for this category
  const masterTasks = await MaintenanceTask.find({ category: category });
  const startDate = purchaseDate ? new Date(purchaseDate) : new Date();

  // 5. Create a specific DeviceTask for each master task
  const newDeviceTasks = masterTasks.map((task) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + task.frequencyMonths);

    return {
      device: device._id,
      user: req.user._id,
      taskName: task.taskName,
      dueDate: dueDate,
      isComplete: false,
      frequencyMonths: task.frequencyMonths,
      deviceCategory: device.category,
    };
  });

  // 6. Save all the new tasks to the database
  if (newDeviceTasks.length > 0) {
    await DeviceTask.insertMany(newDeviceTasks);
  }

  res.status(201).json(device);
});

/**
 * @desc    Delete a device
 * @route   DELETE /api/devices/:id
 * @access  Private
 */
const deleteDevice = asyncHandler(async (req, res) => {
  const device = await Device.findById(req.params.id);

  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  if (device.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await device.deleteOne();
  await DeviceTask.deleteMany({ device: req.params.id });

  res.status(200).json({ id: req.params.id, message: "Device removed" });
});

/**
 * @desc    Increment a device's repair count
 * @route   PUT /api/devices/:id/addrepair
 * @access  Private
 */
const incrementRepairCount = asyncHandler(async (req, res) => {
  const device = await Device.findById(req.params.id);

  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  if (device.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  device.repairsDone = (device.repairsDone || 0) + 1;
  const updatedDevice = await device.save();

  res.status(200).json(updatedDevice);
});

module.exports = {
  getMyDevices,
  createDevice,
  deleteDevice,
  incrementRepairCount,
};
