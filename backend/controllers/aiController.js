// // backend/controllers/aiController.js
// const asyncHandler = require("express-async-handler");
// const { generateRepairDiagnosis } = require("../services/aiService");
// const { fetchRepairGuides } = require("../services/repairDataService");

// const diagnoseDevice = asyncHandler(async (req, res) => {
//   const { deviceName, problemDescription } = req.body;

//   if (!deviceName || !problemDescription) {
//     res.status(400);
//     throw new Error("Device name and problem description are required.");
//   }

//   try {
//     // 1. Fetch iFixit data to act as context (RAG)
//     const repairContext = await fetchRepairGuides(
//       `${deviceName} ${problemDescription}`
//     );

//     // 2. Custom Prompt Engineering for the requested flow
//     const structuredPrompt = `
//       USER DEVICE: ${deviceName}
//       USER PROBLEM: ${problemDescription}

//       Follow this strict protocol:
//       1. Repeat the problem to show understanding.
//       2. Ask exactly ONE safety question (e.g., about indicator lights or smoke).
//       3. Suggest 2 simple DIY checks based on this context: ${repairContext}
//       4. If unsafe, advise professional help and trigger the guardrail phrase: "CERTIFIED_REPAIR_NEEDED".
//     `;

//     const diagnosis = await generateRepairDiagnosis(
//       structuredPrompt,
//       repairContext
//     );

//     res.status(200).json({
//       success: true,
//       diagnosis,
//       // Pass raw guides separately so Material UI can render cards if desired
//       guides: repairContext,
//     });
//   } catch (error) {
//     res.status(500);
//     throw new Error("Diagnosis process failed.");
//   }
// });

// module.exports = { diagnoseDevice };

const { generateRepairDiagnosis } = require("../services/aiService");
const { fetchRepairGuides } = require("../services/repairDataService");
const asyncHandler = require("express-async-handler");

const diagnoseDevice = async (req, res) => {
  const { deviceName, problemDescription } = req.body;

  try {
    // 1. Get real data from iFixit proxy
    const repairData = await fetchRepairGuides(
      `${deviceName} ${problemDescription}`,
    );

    // 2. Feed it into Gemini with your specific instructions (Master Prompt)
    const diagnosis = await generateRepairDiagnosis(
      problemDescription,
      repairData,
    );

    // 3. Logic: If AI suggests professional help, trigger fallback data
    let fallbackData = { shops: [], videos: [] };

    if (
      diagnosis.toLowerCase().includes("professional inspection") ||
      diagnosis.toLowerCase().includes("certified repair")
    ) {
      // These are placeholders - we will implement the actual API calls next
      fallbackData.shops = [
        { name: "Verified Local Tech Center", contact: "Nearby" },
      ];
      fallbackData.videos = [
        { title: `How to fix ${deviceName}`, url: "https://youtube.com/..." },
      ];
    }

    res.status(200).json({
      success: true,
      message: diagnosis,
      guides: repairData,
      fallbacks: fallbackData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "AI Assistant is resting. Try again soon." });
  }
};

module.exports = {
  diagnoseDevice,
};
