const { generateRepairDiagnosis } = require("../services/aiService");
const { fetchRepairGuides } = require("../services/repairDataService");

const diagnoseDevice = async (req, res) => {
  const { deviceName, problemDescription } = req.body;

  try {
    // 1. Get real data from iFixit proxy
    const repairData = await fetchRepairGuides(
      `${deviceName} ${problemDescription}`
    );

    // 2. Feed it into Gemini with your specific instructions (Master Prompt)
    const diagnosis = await generateRepairDiagnosis(
      problemDescription,
      repairData
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

module.exports = { diagnoseDevice };
