// repairAssistantController.js
// const { getRepairAdvice } = require("../services/groqService");

// const diagnoseDevice = async (req, res) => {
//   const { message, history, location } = req.body;

//   try {
//     const { text, grounding } = await getRepairAdvice(
//       message,
//       history || [],
//       location,
//     );

//     res.json({
//       advice: text,
//       grounding: grounding || [],
//     });
//   } catch (error) {
//     console.error("Repair Assistant Error:", error);
//     res.status(500).json({ error: "AI Diagnostic service failed" });
//   }
// };

// the latest
// const asyncHandler = require("express-async-handler");

// const { getSmartRepairAdvice } = require("../services/smartRepairService");

// const diagnoseDevice = async (req, res, next) => {
//   try {
//     const { message, history, location } = req.body;

//     // ✅ Call the SMART service which attaches the Map Grounding
//     const result = await getSmartRepairAdvice(message, history, location);

//     res.status(200).json({
//       advice: result.text,
//       grounding: result.grounding
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { diagnoseDevice };

const asyncHandler = require("express-async-handler");

// 🟢 THIS IS THE FIX: We MUST import the Smart Service, not the Groq Service!
const { getSmartRepairAdvice } = require("../services/smartRepairService");

const diagnoseDevice = asyncHandler(async (req, res) => {
  const { message, history, location } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  // 🟢 THIS IS THE FIX: Call the Smart Service so it actually fetches the Map!
  const result = await getSmartRepairAdvice(message, history || [], location);

  res.status(200).json({
    advice: result.text,
    grounding: result.grounding, // This is where the Maps are finally attached!
  });
});

module.exports = { diagnoseDevice };

// const { getRepairAdvice } = require("../services/geminiService");

// const diagnoseDevice = async (req, res) => {
//   const { message, history, location } = req.body;
//   try {
//     // Calling your geminiService
//     const result = await getRepairAdvice(message, history, location);

//     // Returning exactly what your frontend expects
//     res.json({
//       advice: result.text,
//       grounding: result.grounding,
//     });
//   } catch (error) {
//     console.error("Repair Assistant Error:", error);
//     res.status(500).json({ error: "AI Diagnostic service failed" });
//   }
// };

// module.exports = { diagnoseDevice };

// const { getRepairAdvice } = require("../services/geminiService");

// const diagnoseDevice = async (req, res) => {
//   const { message, history, location } = req.body;
//   try {
//     // Destructure both from your geminiService
//     const { text, grounding } = await getRepairAdvice(message, history, location);
//     res.json({ advice: text, grounding: grounding });
//   } catch (error) {
//     res.status(500).json({ error: "AI failed" });
//   }
// };

// module.exports = { diagnoseDevice };

// const { getRepairAdvice } = require("../services/geminiService");

// // @desc    Handle EcoNova Repair Advisor queries
// // @route   POST /api/repair-assistant/diagnose
// const diagnoseDevice = async (req, res) => {
//   const { message, history } = req.body;
//   try {
//     const advice = await getRepairAdvice(message, history || []);
//     res.json({ advice: advice });
//   } catch (error) {
//     console.error("Repair Assistant Error:", error.message);
//     res
//       .status(500)
//       .json({ error: "Diagnostic service is temporarily unavailable." });
//   }
// };

// module.exports = { diagnoseDevice };
