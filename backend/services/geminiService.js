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

// const getBestVideoQueryViaGemini = async (diagnosisText, userMessage) => {
//   try {
//     const prompt = `You are an expert technical researcher. Read this hardware diagnostic report.
//     User's original problem: "${userMessage}"
//     AI Diagnosis Report: "${diagnosisText}"
    
//     Your task: Generate the absolute best, highly specific 3 to 5 word search query to find a YouTube tutorial demonstrating this exact repair. 
//     DO NOT output any conversational text. Output ONLY the search query.
//     Example: "frayed data cable repair" or "fix sticking laptop keyboard key"`;

//     // 🟢 FIXED: Using the new 'ai' SDK instance instead of the undefined 'genAI'
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//     });

//     return response.text.trim();
//   } catch (error) {
//     console.error("Gemini Video Query Error:", error.message);
//     // 🟢 FIXED: A safer fallback that won't dump a whole paragraph into YouTube
//     return "broken data cable repair";
//   }
// };

// const getRepairAdviceGemini = async (
//   issueDescription,
//   history = [],
//   location,
//   image,
// ) => {
//   // Initialize inside the function as per your SDK best practices
//   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//   const systemInstruction = `You are EcoNova+, a friendly, expert e-waste reduction and electronics repair assistant.
// You must strictly follow these rules to ensure a highly readable, scannable, and safe UX:

// 1. GREETINGS (STRICT RULE)
// - IF the user's message is UNDER 5 WORDS total: Respond EXACTLY with "Hi there! I am EcoNova+. What electronic device can I help you diagnose and repair today?" and STOP.
// - IF the user mentions ANY device, uploads an image, or states a problem: Skip the greeting completely.

// 2. UNDERSTAND FIRST (CLARIFICATION)
// - IF the problem is vague: DO NOT provide repair steps. Ask them to describe the exact physical damage first.
// - 🚫 CRITICAL BUG FIX: If you are asking a clarifying question, YOU MUST NOT output the "[SHOW_VIDEOS]" tag.

// 3. SMART SAFETY PROTOCOL (CRITICAL vs. MINOR)
// - ⚡ CABLE / LOW-VOLTAGE EXCEPTION: If the user complains about a data cable, phone charger, or USB giving a "shock" or having exposed wires, THIS IS A MINOR HAZARD. Advise them to completely UNPLUG the cable and use electrical tape. You MUST append exactly "[SHOW_VIDEOS]" at the end. DO NOT trigger the map for a cable.
// - 🚨 CRITICAL DANGER (e.g., swollen batteries, sparking outlets, shattered glass, water damage): Warn the user. Say: "For your safety, please do not attempt to fix this yourself. I am pulling up a list of verified local repair specialists on the map below using our EcoNova Locator." You MUST append exactly "[SHOW_MAP]" at the end. STOP GENERATING TEXT.

// 4. DIAGNOSIS & FIXING (THE "SCAN BLOCK" STRUCTURE)
// When providing a diagnosis or repair steps, you MUST use this exact visual structure:
// - LEAD WITH THE ANSWER: Give a direct, short answer first. If an image is provided, explicitly state what you observe in the image.
// - VISUAL ANCHORS: Use professional emojis sparingly (e.g., 🔌, 🪛, ⚠️, 🔋, 💡).
// - FORMAT:
//   💡 **The Core Issue:** [1-2 sentences explaining what is wrong]
//   ⚠️ **Crucial Note:** [Highlight the most important safety or handling warning in **bold text**]
//   ✅ **Restoration Protocol:** [Brief transition to the steps below]
// - STEPS: You MUST use numbered lists (1., 2., 3.) for troubleshooting steps.
// - Weave in exactly: "I have attached some helpful visual guides and video tutorials below for you."
// - You MUST append exactly "[SHOW_VIDEOS]" at the very end.

// 5. DOMAIN RESTRICTION
// - You are EXCLUSIVELY a hardware diagnostic engine. Refuse all coding or non-hardware queries.`;

//   try {
//     // 1. Format History for Gemini (Gemini uses "user" and "model" roles)
//     const cleanHistory = history.filter((h) => {
//       const text = h.content || h.parts?.[0]?.text;
//       return typeof text === "string" && text.trim().length > 0;
//     });

//     if (
//       cleanHistory.length > 0 &&
//       cleanHistory[cleanHistory.length - 1].content === issueDescription
//     ) {
//       cleanHistory.pop();
//     }

//     const formattedContents = cleanHistory.map((h) => ({
//       role: h.role === "model" || h.role === "assistant" ? "model" : "user",
//       parts: [{ text: h.content || h.parts?.[0]?.text || "" }],
//     }));

//     // 2. Prepare the current user payload (Text + Image)
//     let userParts = [
//       {
//         text:
//           issueDescription || "Please analyze this image for repair advice.",
//       },
//     ];

//     if (image) {
//       console.log("📸 Image detected! Formatting for Gemini Vision...");
//       // Handle the object format sent from React { data: base64, mimeType: "image/jpeg" }
//       if (typeof image === "object" && image.data) {
//         userParts.push({
//           inlineData: {
//             data: image.data,
//             mimeType: image.mimeType || "image/jpeg",
//           },
//         });
//       } else if (typeof image === "string") {
//         // Fallback if it's just a raw base64 string
//         const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
//         userParts.push({
//           inlineData: {
//             data: base64Data,
//             mimeType: "image/jpeg",
//           },
//         });
//       }
//     }

//     // Append the current message to the contents array
//     formattedContents.push({
//       role: "user",
//       parts: userParts,
//     });

//     // 3. Call Gemini 2.5 Flash
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: formattedContents,
//       config: {
//         systemInstruction: systemInstruction,
//         temperature: 0.3,
//       },
//     });

//     return {
//       text: response.text || "I couldn't generate advice.",
//       grounding: [],
//     };
//   } catch (error) {
//     console.error("Gemini Diagnostic Error:", error);
//     throw error;
//   }
// };

/**
 * 🟢 Core Diagnostic Engine powered by Gemini 2.5 Multimodal
 */
const getRepairAdviceGemini = async (
  issueDescription,
  history = [],
  location,
  image,
) => {
  // Use a new instance right before the API call to comply with SDK best practices
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Merged the excellent visual analysis instructions from your other version
  const systemInstruction = `You are EcoNova, a professional technical documentation engine for E-Waste Repair.

1. VISUAL ANALYSIS (IF IMAGE PROVIDED)
- Carefully analyze the image to identify the exact hardware model, specific damage, or component failure.
- Explicitly state what you observe in the image before providing solutions.

2. GREETINGS (STRICT RULE)
- IF the user's message is UNDER 5 WORDS total: Respond EXACTLY with "Hi there! I am EcoNova+. What electronic device can I help you diagnose and repair today?" and STOP.
- IF the user mentions ANY device, uploads an image, or states a problem: Skip the greeting completely.

3. SMART SAFETY PROTOCOL (CRITICAL vs. MINOR)
- ⚡ CABLE / LOW-VOLTAGE EXCEPTION: If the user complains about a data cable, phone charger, or USB giving a "shock" or having exposed wires, THIS IS A MINOR HAZARD. Advise them to completely UNPLUG the cable and wrap the exposed metal in electrical tape. You MUST append exactly "[SHOW_VIDEOS]" at the end. DO NOT trigger the map for a cable.
- 🚨 CRITICAL DANGER (e.g., swollen batteries, sparking outlets, shattered glass, water damage): Warn the user. Say: "For your safety, please do not attempt to fix this yourself. I am pulling up a list of verified local repair specialists on the map below using our EcoNova Locator." You MUST append exactly "[SHOW_MAP]" at the end. STOP GENERATING TEXT.

4. DIAGNOSIS & FIXING (STRUCTURE)
- LEAD WITH THE ANSWER: Give a direct, short answer first.
- FORMAT:
  💡 **The Core Issue:** [Explain the fault or what you see in the image]
  ⚠️ **Crucial Note:** [Highlight the most important safety or handling warning in **bold text**]
  ✅ **Restoration Protocol:** [Brief transition to the steps below]
- STEPS: You MUST use numbered lists (1., 2., 3.) for troubleshooting steps.
- Weave in exactly: "I have attached some helpful visual guides and video tutorials below for you."
- You MUST append exactly "[SHOW_VIDEOS]" at the very end.

5. DOMAIN RESTRICTION
- You are EXCLUSIVELY a hardware diagnostic engine. Refuse all coding or non-hardware queries.`;

  try {
    // 1. Format History for Gemini (Gemini uses "user" and "model" roles)
    const cleanHistory = history.filter((h) => {
      const text = h.content || h.parts?.[0]?.text;
      return typeof text === "string" && text.trim().length > 0;
    });

    if (
      cleanHistory.length > 0 &&
      cleanHistory[cleanHistory.length - 1].content === issueDescription
    ) {
      cleanHistory.pop();
    }

    const formattedContents = cleanHistory.map((h) => ({
      role: h.role === "model" || h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content || h.parts?.[0]?.text || "" }],
    }));

    // 2. Prepare the current user payload cleanly (Text + Image)
    let userParts = [
      {
        text:
          issueDescription || "Please analyze this image for repair advice.",
      },
    ];

    // 🟢 Cleanly handling the image object exactly like your other version
    if (image && image.data) {
      console.log(
        `📸 Image detected! Type: ${image.mimeType}. Analyzing via Gemini Vision...`,
      );
      userParts.push({
        inlineData: {
          data: image.data, // Pure base64 data
          mimeType: image.mimeType || "image/jpeg",
        },
      });
    }

    formattedContents.push({
      role: "user",
      parts: userParts,
    });

    // 3. Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    return {
      text: response.text || "I couldn't generate advice.",
      grounding: [], // Your smartRepairService handles the complex Map/YouTube grounding separately!
    };
  } catch (error) {
    console.error("Gemini Diagnostic Error:", error);
    throw error;
  }
};

const getBestVideoQueryViaGemini = async (diagnosisText, userMessage) => {
  try {
    // Initialize the SDK correctly inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert technical researcher. Read this hardware diagnostic report.
    User's original problem: "${userMessage}"
    AI Diagnosis Report: "${diagnosisText}"
    
    Your task: Generate the absolute best, highly specific 3 to 5 word search query to find a YouTube tutorial demonstrating this exact repair. 
    
    CRITICAL RULES FOR YOUTUBE SEARCH:
    1. AVOID VIRAL HACKS: Force practical, easy, beginner-friendly fixes. If it is a frayed cable, you MUST include words like "electrical tape" or "heat shrink" to prevent YouTube from returning complex "sewing thread" or "superglue" hacks.
    2. BE SPECIFIC: Include the exact hardware component name.
    3. NO CHAT: DO NOT output any conversational text. Output ONLY the search query string.
    
    Good Examples: 
    - "fix frayed cable electrical tape"
    - "laptop screen replacement simple"
    - "heat shrink charger cable repair"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1, // Keep it low so it doesn't get overly creative with keywords
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Video Query Error:", error.message);
    // A much safer, easier fallback query
    return "easy electrical tape cable repair";
  }
};

// 🟢 EXPORT BOTH FUNCTIONS
module.exports = {
  generateGeminiContent,
  generateVideoQuery,
  getNearbyShopsViaGemini,
  getBestVideoQueryViaGemini,
  getRepairAdviceGemini,
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
