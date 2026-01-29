const { getRepairAdvice } = require("../services/aiService");

// @desc    Handle AI repair diagnostic query
// @route   POST /api/ai/analyze
// @access  Private
const handleRepairQuery = async (req, res) => {
  const { message, history } = req.body;

  try {
    // history is expected as an array of objects: { role: 'user'|'model', content: '...' }
    const advice = await getRepairAdvice(message, history || []);
    res.json({ advice });
  } catch (error) {
    console.error("AI Controller Error:", error.message);
    res.status(500).json({ error: "AI Diagnostic service unavailable." });
  }
};

module.exports = { handleRepairQuery };
