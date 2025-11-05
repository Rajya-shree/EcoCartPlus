const asyncHandler = require("express-async-handler");
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

/**
 * @desc    Search for YouTube videos
 * @route   POST /api/youtube/search
 * @access  Public
 */
const searchYouTube = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error("A search query is required");
  }

  try {
    const { data } = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: "snippet",
        q: `${query} repair tutorial`, // Add "repair tutorial" to the query
        key: YOUTUBE_API_KEY,
        maxResults: 3, // Get the top 3 videos
        type: "video",
      },
    });

    // Simplify the data
    const videos = data.items.map((item) => {
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      };
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error("YouTube API Error:", error.response.data.error);
    res.status(500);
    throw new Error("Failed to fetch YouTube videos");
  }
});

module.exports = {
  searchYouTube,
};
