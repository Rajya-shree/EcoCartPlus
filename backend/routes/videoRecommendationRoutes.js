const express = require("express");
const router = express.Router();
const { searchYouTube } = require("../controllers/videoRecommendationController");
const { getVideoRecommendations } = require("../controllers/videoRecommendationController");
const { protect } = require("../middleware/authMiddleware");

// This is a public route
// POST /api/youtube/search
router.route("/search").post(searchYouTube);
router.post("/", protect, getVideoRecommendations);

module.exports = router;

