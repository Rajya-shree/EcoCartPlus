const express = require("express");
const router = express.Router();
// Changed analyzeDescription to diagnoseDevice to match your controller
const { diagnoseDevice } = require("../controllers/aiController");

// Updated the route path and function name to match your frontend calls
router.post("/diagnose", diagnoseDevice);

module.exports = router;
