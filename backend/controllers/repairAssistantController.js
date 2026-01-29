// repairAssistantController.js
const { getRepairAdvice } = require("../services/geminiService");

const diagnoseDevice = async (req, res) => {
  const { message, history, location } = req.body;

  try {
    const { text, grounding } = await getRepairAdvice(
      message,
      history || [],
      location,
    );

    res.json({
      advice: text,
      grounding: grounding || [],
    });
  } catch (error) {
    console.error("Repair Assistant Error:", error);
    res.status(500).json({ error: "AI Diagnostic service failed" });
  }
};

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
