const express = require("express");
const router = express.Router();
const { searchYouTube } = require("../controllers/youtubeController");

// This is a public route
// POST /api/youtube/search
router.route("/search").post(searchYouTube);

module.exports = router;
