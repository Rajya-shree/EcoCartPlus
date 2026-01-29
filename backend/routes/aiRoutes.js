const express = require("express");
const router = express.Router();

const { handleRepairQuery } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/analyze", protect, handleRepairQuery);

module.exports = router;