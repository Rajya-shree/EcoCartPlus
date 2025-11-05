const express = require("express");
const router = express.Router();
const {
  getMyDevices,
  createDevice,
  deleteDevice, // <-- IMPORT
  incrementRepairCount,
} = require("../controllers/deviceController");
const { protect } = require("../middleware/authMiddleware"); // Import our protection

// All routes here will be protected by the 'protect' middleware

// GET /api/devices
// POST /api/devices
router.route("/").get(protect, getMyDevices).post(protect, createDevice);

// DELETE /api/devices/:id
router.route("/:id").delete(protect, deleteDevice);

// PUT /api/devices/:id/addrepair
router.route('/:id/addrepair').put(protect, incrementRepairCount);

module.exports = router;
