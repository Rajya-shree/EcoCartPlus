const express = require("express");
const router = express.Router();
const { diagnoseDevice } = require("../controllers/diagnosisController");
//const { protect } = require("../middleware/authMiddleware");

// Dedicated endpoint for the Repair Advisor
router.post("/", diagnoseDevice);

module.exports = router;
