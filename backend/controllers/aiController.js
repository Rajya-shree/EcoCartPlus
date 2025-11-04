const asyncHandler = require("express-async-handler");

/**
 * @desc    Analyzes a user's problem description
 * @route   POST /api/ai/analyze
 * @access  Public
 */
const analyzeDescription = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const query = description.toLowerCase();

  // --- Canned Response 1: Screen ---
  if (
    query.includes("screen") ||
    query.includes("cracked") ||
    query.includes("display")
  ) {
    // This JSON matches your UI mockup (Screenshot 094420)
    return res.json({
      status: "success",
      diagnosis: "Screen Display Issue - Likely LCD Damage",
      confidence: "92%",
      difficulty: "Intermediate",
      time: "45-60 minutes",
      tools: ["Screwdriver set", "Plastic prying tools", "Suction cup"],
      steps: [
        "Power off the device completely",
        "Remove the back cover using appropriate tools",
        "Disconnect the battery connector",
        "Carefully remove the damaged LCD screen",
        "Install the new LCD screen",
        "Reconnect all cables and test functionality",
      ],
    });
  }

  // --- Canned Response 2: Battery / Power ---
  if (
    query.includes("battery") ||
    query.includes("wont turn on") ||
    query.includes("charge")
  ) {
    // This JSON matches your conversational flow
    return res.json({
      status: "further_steps_required",
      // This response will trigger the conversational (Yes/No) part
      nextQuestion:
        "Got it. You’re reporting an issue with power. Let’s check if this can be fixed safely at home. Please confirm — does the charger show any indicator light when plugged in?",
      options: ["Yes", "No", "Not sure"],
    });
  }

  // --- Canned Response 3: "I don't know" ---
  // This matches your "acknowledge limits" requirement
  return res.status(200).json({
    status: "unknown",
    message:
      "Thanks for the details. I couldn’t identify the exact cause based on your description — it might be an internal issue that needs professional inspection. Here’s what I can still help with:",
    options: ["Upload Photos", "Find Repair Center"],
  });
});

module.exports = {
  analyzeDescription,
};
