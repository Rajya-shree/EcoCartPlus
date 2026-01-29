const express = require("express");
const router = express.Router();
const { diagnoseDevice } = require("../controllers/repairAssistantController");
//const { protect } = require("../middleware/authMiddleware");

// Dedicated endpoint for the Repair Advisor
router.post("/diagnose", diagnoseDevice);

module.exports = router;