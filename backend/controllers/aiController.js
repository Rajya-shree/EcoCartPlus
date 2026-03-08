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
const { getSmartRepairAdvice } = require("../services/smartRepairService");
// 1. Import the actual function names from your aiService.js
const {
  generateRepairDiagnosis,
  evaluateProductSustainability,
} = require("../services/aiService");

// @desc    Handle AI repair diagnostic query
// @route   POST /api/ai/diagnose
// @access  Private

/**
 * @desc    Get AI Repair Advice with YouTube & Maps Grounding
 * @route   POST /api/repair-assistant/diagnose
 * @access  Private
 */

// const diagnoseDevice = asyncHandler(async (req, res) => {
//   const { deviceName, problemDescription } = req.body;

//   if (!deviceName || !problemDescription) {
//     res.status(400);
//     throw new Error("Missing device name or problem description");
//   }

//   // Use the correct function name you defined in aiService.js
//   const diagnosis = await generateRepairDiagnosis(
//     problemDescription,
//     "Generic electronic repair context"
//   );

//   const advice = await getSmartRepairAdvice(problemDescription, location);

//   res.status(200).json({
//     success: true,
//     message: advice || diagnosis || "AI repair advice generated successfully",
//   });
// });

const diagnoseDevice = asyncHandler(async (req, res) => {
  // Destructure exactly what the frontend sends
  const { message, history, location } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Please provide a problem description");
  }

  // 1. Call the grounded service we created
  // This function now handles the YouTube and Maps grounding logic
  const adviceData = await getSmartRepairAdvice(message, history, location);

  // 2. Return the data in the format the frontend expects
  // Your frontend looks for 'advice' and 'grounding'
  res.status(200).json({
    success: true,
    advice: adviceData.text, // The main AI response
    grounding: adviceData.grounding || [], // The YouTube/Maps links
  });
});

module.exports = { diagnoseDevice };
