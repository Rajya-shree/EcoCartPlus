const { GoogleGenAI } = require("@google/genai");

/**
 * Handles Video Recommendations and Map routing via Gemini
 */
const generateGeminiContent = async (prompt) => {
  // Initialization performed inside the function to comply with latest SDK practices
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return {
      text: response.text,
      // Safely extracting grounding data if map/search tools are used
      grounding:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch data from Gemini.");
  }
};

module.exports = { generateGeminiContent };

// // backend/services/geminiService.js
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const dotenv = require("dotenv");
// dotenv.config();

// // Initialize Gemini 1.5 Flash
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// /**
//  * @desc Uses Gemini to generate an optimized YouTube search query
//  */
// exports.generateVideoQuery = async (diagnosisText, deviceName) => {
//   try {
//     const prompt = `
//       You are an assistant for EcoNova+. Based on this repair diagnosis for a ${deviceName}: "${diagnosisText}",
//       generate a single, highly effective YouTube search query to find a visual repair guide.
//       Return ONLY the query string. No quotes, no preamble.
//     `;

//     const result = await model.generateContent(prompt);
//     return result.response.text().trim();
//   } catch (error) {
//     console.error("Gemini Video Query Error:", error.message);
//     return `${deviceName} repair guide`; // Fallback query
//   }
// };

// /**
//  * @desc Uses Gemini to extract a clean city/location name from user input
//  */
// exports.extractLocation = async (userInput) => {
//   try {
//     const prompt = `Extract the city or area name from this text: "${userInput}". Return only the location name. If no location found, return "nearby".`;
//     const result = await model.generateContent(prompt);
//     return result.response.text().trim();
//   } catch (error) {
//     return "nearby";
//   }
// };
