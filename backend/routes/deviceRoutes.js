const express = require('express');
const router = express.Router();
const {
  getMyDevices,
  createDevice,
} = require('../controllers/deviceController');
const { protect } = require('../middleware/authMiddleware'); // Import our protection

// All routes here will be protected by the 'protect' middleware

// GET /api/devices
// POST /api/devices
router.route('/').get(protect, getMyDevices).post(protect, createDevice);

module.exports = router;