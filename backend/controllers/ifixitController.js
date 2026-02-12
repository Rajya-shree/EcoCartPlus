const asyncHandler = require("express-async-handler");
const axios = require("axios"); // Import axios

/**
 * @desc    Fetch repair guides from iFixit
 * @route   POST /api/repair-guides
 * @access  Public
 */
const getRepairGuides = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error("A search query is required");
  }

  try {
    // 1. Make the external API call to the correct URL
    const { data } = await axios.get(
      `https://www.ifixit.com/api/2.0/suggest/${encodeURIComponent(
        query
      )}?doctypes=guide`
    );

    // 2. Simplify the data using the correct key: data.results
    const simplifiedGuides = data.results.slice(0, 5).map((guide) => {
      return {
        guideid: guide.guideid,
        title: guide.title,
        url: guide.url,
        // Add a check in case 'image' is missing
        imageUrl: guide.image ? guide.image.standard : null,
        summary: guide.summary,
      };
    });

    // 3. Send the clean list back to our frontend
    res.status(200).json(simplifiedGuides);
  } catch (error) {
    // This will now only run if the iFixit API is truly down
    console.error("iFixit API Error:", error.message);
    res.status(500);
    throw new Error("Failed to fetch repair guides");
  }
});
/**
 * @desc    Fetch repairability score from iFixit
 * @route   POST /api/repair-score
 * @access  Public
 */
const getRepairScore = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error("A search query is required");
  }

  try {
    // 1. Make the external API call to the suggest API
    // We'll search for the device "topic"
    const { data } = await axios.get(
      `https://www.ifixit.com/api/2.0/suggest/${encodeURIComponent(
        query
      )}?doctypes=topic`
    );

    // 2. Find the first result that has a repairability score
    const device = data.results.find(
      (result) => result.repairability_score !== null
    );

    if (device) {
      // 3. Send back the score and summary
      res.status(200).json({
        title: device.title,
        score: device.repairability_score,
        summary: device.summary,
        url: device.url,
      });
    } else {
      // 4. Send a "not found" message
      res.status(404).json({
        message: "No repairability score found for that device.",
      });
    }
  } catch (error) {
    console.error("iFixit Score API Error:", error.message);
    res.status(500);
    throw new Error("Failed to fetch repairability score");
  }
});

// Make sure your module.exports includes the new function
module.exports = {
  getRepairGuides,
  getRepairScore, // <-- ADD THIS
};
