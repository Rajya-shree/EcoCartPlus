//const { getRepairAdvice } = require("../services/aiService");

// @desc    Handle AI repair diagnostic query
// @route   POST /api/ai/analyze
// @access  Private
// const handleRepairQuery = async (req, res) => {
//   const { message, history } = req.body;

//   try {
//     // history is expected as an array of objects: { role: 'user'|'model', content: '...' }
//     const advice = await getRepairAdvice(message, history || []);
//     res.json({ advice });
//   } catch (error) {
//     console.error("AI Controller Error:", error.message);
//     res.status(500).json({ error: "AI Diagnostic service unavailable." });
//   }
// };

// module.exports = { handleRepairQuery };

const asyncHandler = require("express-async-handler");
// 1. Import the actual function names from your aiService.js
const {
  generateRepairDiagnosis,
  evaluateProductSustainability,
} = require("../services/aiService");

// @desc    Handle AI repair diagnostic query
// @route   POST /api/ai/diagnose
// @access  Private
const diagnoseDevice = asyncHandler(async (req, res) => {
  const { deviceName, problemDescription } = req.body;

  if (!deviceName || !problemDescription) {
    res.status(400);
    throw new Error("Missing device name or problem description");
  }

  // Use the correct function name you defined in aiService.js
  const diagnosis = await generateRepairDiagnosis(
    problemDescription,
    "Generic electronic repair context"
  );

  res.status(200).json({
    success: true,
    message: diagnosis,
  });
});

module.exports = { diagnoseDevice };
