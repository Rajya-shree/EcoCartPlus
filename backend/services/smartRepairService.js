const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc Advanced AI Advisor with Google Search & YouTube Grounding
 */
const getSmartRepairAdvice = async (issueDescription, location = null) => {
  try {
    // 1. Initialize Gemini with Google Search tool enabled
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ googleSearch: {} }],
    });

    const systemInstruction = `You are EcoNova, a high-tech E-Waste Repair Assistant. 
    1. If the user is confused or the repair is mechanical, provide a direct YouTube link for "${issueDescription} step by step guide".
    2. SAFETY: If you see smoke, fire, or sparks, stop and warn them immediately.
    3. MAPS: If coordinates are provided (${location ? `Lat: ${location.lat}, Lng: ${location.lng}` : "None"}), 
       recommend specific nearby repair shops by name and general distance.
    4. Keep steps simple but technical enough to be useful.`;

    const result = await model.generateContent(
      `${systemInstruction}\n\nProblem: ${issueDescription}`,
    );
    const response = await result.response;

    // Return the grounded text which includes links to YouTube and Maps
    return response.text();
  } catch (error) {
    console.error("Smart Service Error:", error.message);
    return "Error connecting to Grounded AI. Using internal knowledge: Please search YouTube for a fix.";
  }
};

module.exports = { getSmartRepairAdvice };
