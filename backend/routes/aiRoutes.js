const express = require("express");
const router = express.Router();
const { analyzeDescription } = require("../controllers/aiController");

// POST /api/ai/analyze
router.route("/analyze").post(analyzeDescription);

module.exports = router;
