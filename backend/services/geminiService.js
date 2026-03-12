const { GoogleGenAI } = require("@google/genai");

require("dotenv").config();

// Initialize the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Handles Video Recommendations and Map routing via Gemini
 */
const generateGeminiContent = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      // model: "gemini-2.0-flash",
      model: "gemini-2.0-flash-lite",
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

/**
 * @desc Uses Gemini to generate an optimized YouTube search query
 * This is the exact function your controller was looking for!
 */
const generateVideoQuery = async (diagnosisText, deviceName) => {
  try {
    // const prompt = `
    //   You are an assistant for EcoNova+. Based on this repair diagnosis for a ${deviceName}: "${diagnosisText}",
    //   generate a single, highly effective YouTube search query to find a visual repair guide.
    //   Return ONLY the query string. No quotes, no preamble. Limit to 5 words max.
    // `;
    const prompt = `
      You are a technical researcher for EcoNova+. 
      Read this repair diagnosis: "${diagnosisText}"
      
      Generate a highly specific 3 to 5 word YouTube search query to find a visual repair tutorial for this exact issue.
      
      CRITICAL RULES:
      1. You MUST identify and include the specific hardware component name from the diagnosis (e.g., "USB data cable", "laptop keyboard").
      2. DO NOT use generic words like "broken", "hack", "hardware", "device", "any", or "electronics".
      3. Return ONLY the search query string. No quotes, no preamble.
    `;

    const response = await ai.models.generateContent({
      // model: "gemini-2.0-flash",
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    // 🟢 SMART FALLBACK: If you hit the 429 Rate Limit on gemini-2.0-flash,
    // this prevents the app from crashing and still fetches great YouTube videos!
    console.warn("Gemini Video Query Fallback Triggered:", error.message);
    return `${deviceName} repair tutorial`;
  }
};

// 🟢 NEW: Native Map Locator using Gemini 2.5 Flash
const getNearbyShopsViaGemini = async (location, message) => {
  try {
    const prompt = `Find exactly 3 local authorized electronics or computer repair shops near my location for fixing: ${message}. 
    Respond STRICTLY with a minified JSON array of objects. 
    Each object must have exactly these keys: "title" (shop name), "address" (street address), and "url" (Google Maps link). 
    Do not include any other text, markdown formatting, or backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Must be 2.5 to support native mapping tools
      contents: prompt,
      config: {
        temperature: 0.1,
        tools: [{ googleMaps: {} }], // Triggers Google Maps internally
        toolConfig:
          location && location.latitude
            ? {
                retrievalConfig: {
                  latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                },
              }
            : undefined,
      },
    });

    // Clean the JSON response and map it exactly how your React app expects it
    const cleanJson = response.text
      .trim()
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();
    const shops = JSON.parse(cleanJson);

    return shops.map((shop) => ({
      maps: {
        title: shop.title,
        address: shop.address,
        url: shop.url,
      },
    }));
  } catch (error) {
    console.warn("Gemini Native Maps Error:", error.message);
    return [];
  }
};

const getBestVideoQueryViaGemini = async (diagnosisText, userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert technical researcher. Read this hardware diagnostic report.
    User's original problem: "${userMessage}"
    AI Diagnosis Report: "${diagnosisText}"
    
    Your task: Generate the absolute best, highly specific 3 to 5 word search query to find a YouTube tutorial demonstrating this exact repair. 
    DO NOT output any conversational text. Output ONLY the search query.
    Example: "frayed iphone lightning cable repair" or "fix sticking laptop keyboard key"`;

    const result = await model.generateContent(prompt);
    const perfectQuery = result.response.text().trim();

    return perfectQuery;
  } catch (error) {
    console.error("Gemini Video Query Error:", error);
    // Fallback if Gemini fails
    return `${userMessage} repair tutorial`;
  }
};

// 🟢 EXPORT BOTH FUNCTIONS
module.exports = {
  generateGeminiContent,
  generateVideoQuery,
  getNearbyShopsViaGemini,
  getBestVideoQueryViaGemini,
};

// const { GoogleGenAI } = require("@google/genai");

// /**
//  * Handles Video Recommendations and Map routing via Gemini
//  */
// const generateGeminiContent = async (prompt) => {
//   // Initialization performed inside the function to comply with latest SDK practices
//   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: prompt,
//     });

//     return {
//       text: response.text,
//       // Safely extracting grounding data if map/search tools are used
//       grounding:
//         response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
//     };
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw new Error("Failed to fetch data from Gemini.");
//   }
// };

// module.exports = { generateGeminiContent };

// // // backend/services/geminiService.js
// // const { GoogleGenerativeAI } = require("@google/generative-ai");
// // const dotenv = require("dotenv");
// // dotenv.config();

// // // Initialize Gemini 1.5 Flash
// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// // /**
// //  * @desc Uses Gemini to generate an optimized YouTube search query
// //  */
// // exports.generateVideoQuery = async (diagnosisText, deviceName) => {
// //   try {
// //     const prompt = `
// //       You are an assistant for EcoNova+. Based on this repair diagnosis for a ${deviceName}: "${diagnosisText}",
// //       generate a single, highly effective YouTube search query to find a visual repair guide.
// //       Return ONLY the query string. No quotes, no preamble.
// //     `;

// //     const result = await model.generateContent(prompt);
// //     return result.response.text().trim();
// //   } catch (error) {
// //     console.error("Gemini Video Query Error:", error.message);
// //     return `${deviceName} repair guide`; // Fallback query
// //   }
// // };

// // /**
// //  * @desc Uses Gemini to extract a clean city/location name from user input
// //  */
// // exports.extractLocation = async (userInput) => {
// //   try {
// //     const prompt = `Extract the city or area name from this text: "${userInput}". Return only the location name. If no location found, return "nearby".`;
// //     const result = await model.generateContent(prompt);
// //     return result.response.text().trim();
// //   } catch (error) {
// //     return "nearby";
// //   }
// // };
