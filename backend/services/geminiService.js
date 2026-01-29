/**
 * geminiService.js
 * CommonJS format
 */

const getRepairAdvice = async (issueDescription, history, location) => {
  const systemInstruction = `You are EcoNova, a friendly and expert E-Waste Repair Assistant. 
  Follow this strict safety and guidance protocol:
  1. Acknowledge the problem immediately.
  2. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
  3. TECHNICIAN HANDOVER: If the repair is highly complex (soldering micro-components, high voltage power supplies, internal monitor disassembly, or specialized glass delamination), explicitly state that it should be handled by a professional technician. Use the Google Maps tool to provide local repair shop recommendations.
  4. VISUAL GUIDANCE & STRUGGLE: If the user expresses confusion, says "I don't understand", or if the steps involve complex mechanical assembly/disassembly, recommend YouTube videos using Google Search grounding. Frame these as "Simple visual guides for easy understanding".
  5. DIY VS PRO: If a "common adult" can safely fix it (like changing a modular battery, swapping a drive, or cleaning a fan) but they seem to struggle with text-based steps, pivot to recommending simple YouTube video walkthroughs.
  6. If safe, provide detailed DIY steps and suggest tools needed.
  7. Use the Google Maps tool for professional technician recommendations whenever DIY is deemed unsafe or the user prefers expert help.`;

  // Assuming 'ai' is your configured Gemini model instance
  const result = await ai.generateContent({
    contents: [
      ...history,
      { role: "user", parts: [{ text: issueDescription }] },
    ],
    generationConfig: {
      temperature: 0.7,
    },
    systemInstruction,
    tools: [{ googleSearch: {} }, { googleMaps: {} }],
    toolConfig: location
      ? {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          },
        }
      : undefined,
  });

  const response = await result.response;

  return {
    text: response.text(),
    grounding:
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

// Exporting using CommonJS format
module.exports = {
  getRepairAdvice,
};

// /**
//  * EcoNova E-Waste Repair Assistant Service
//  * Converts TypeScript implementation to clean ModuleJS
//  */

// export const getRepairAdvice = async (issueDescription, history, location) => {
//   const systemInstruction = `You are EcoNova, a friendly and expert E-Waste Repair Assistant.
//   Follow this strict safety and guidance protocol:
//   1. Acknowledge the problem immediately.
//   2. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
//   3. TECHNICIAN HANDOVER: If the repair is highly complex (soldering micro-components, high voltage power supplies, internal monitor disassembly, or specialized glass delamination), explicitly state that it should be handled by a professional technician. Use the Google Maps tool to provide local repair shop recommendations.
//   4. VISUAL GUIDANCE & STRUGGLE: If the user expresses confusion, says "I don't understand", or if the steps involve complex mechanical assembly/disassembly, recommend YouTube videos using Google Search grounding. Frame these as "Simple visual guides for easy understanding".
//   5. DIY VS PRO: If a "common adult" can safely fix it (like changing a modular battery, swapping a drive, or cleaning a fan) but they seem to struggle with text-based steps, pivot to recommending simple YouTube video walkthroughs.
//   6. If safe, provide detailed DIY steps and suggest tools needed.
//   7. Use the Google Maps tool for professional technician recommendations whenever DIY is deemed unsafe or the user prefers expert help.`;

//   // Ensure ai.getGenerativeModel is initialized outside or passed in
//   // Here we assume 'ai' is your configured model instance
//   const response = await ai.generateContent({
//     contents: [
//       ...history,
//       { role: "user", parts: [{ text: issueDescription }] },
//     ],
//     generationConfig: {
//       temperature: 0.7,
//     },
//     // The systemInstruction is usually passed during model initialization,
//     // but if your wrapper supports it here, keep it.
//     systemInstruction,
//     tools: [{ googleSearch: {} }, { googleMaps: {} }],
//     toolConfig: location
//       ? {
//           retrievalConfig: {
//             latLng: {
//               latitude: location.latitude,
//               longitude: location.longitude,
//             },
//           },
//         }
//       : undefined,
//   });

//   const result = await response.response;

//   return {
//     text: result.text(),
//     grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
//   };
// };

// // geminiService.js
// const {
//   GoogleGenerativeAI,
//   HarmBlockThreshold,
//   HarmCategory,
// } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const SYSTEM_INSTRUCTION = `You are EcoNova, a friendly and expert E-Waste Repair Assistant.
// Follow this strict safety and guidance protocol:
// 1. Acknowledge the problem immediately.
// 2. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
// 3. TECHNICIAN HANDOVER: If the repair is highly complex (soldering micro-components, high voltage power supplies, internal monitor disassembly, or specialized glass delamination), explicitly state that it should be handled by a professional technician. Use the Google Maps tool to provide local repair shop recommendations.
// 4. VISUAL GUIDANCE & STRUGGLE: If the user expresses confusion, says "I don't understand", or if the steps involve complex mechanical assembly/disassembly, recommend YouTube videos using Google Search grounding. Frame these as "Simple visual guides for easy understanding".
// 5. DIY VS PRO: If a "common adult" can safely fix it (like changing a modular battery, swapping a drive, or cleaning a fan) but they seem to struggle with text-based steps, pivot to recommending simple YouTube video walkthroughs.
// 6. If safe, provide detailed DIY steps and suggest tools needed.
// 7. Use the Google Maps tool for professional technician recommendations whenever DIY is deemed unsafe or the user prefers expert help.`;

// async function getRepairAdvice(
//   issueDescription,
//   history = [],
//   location = null,
// ) {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash-002", // stable, supports grounding
//       // You can also use "gemini-1.5-pro-002" if your project has access
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//         // Add more categories if needed (e.g. DANGEROUS_CONTENT)
//       ],
//       generationConfig: {
//         temperature: 0.7,
//         topP: 0.95,
//         topK: 40,
//         maxOutputTokens: 8192,
//       },
//       systemInstruction: SYSTEM_INSTRUCTION,
//     });

//     // Convert history to correct format for the Node SDK
//     const chatHistory = history.map((msg) => ({
//       role: msg.role === "model" ? "model" : "user",
//       parts: [{ text: msg.content || msg.parts?.[0]?.text || "" }],
//     }));

//     const chat = model.startChat({
//       history: chatHistory,
//       generationConfig: {
//         temperature: 0.7,
//       },
//     });

//     // Grounding options (Google Search works reliably)
//     const tools = [];
//     if (process.env.USE_GROUNDING === "true") {
//       tools.push({ googleSearchRetrieval: {} });
//       // Note: No native { googleMaps: {} } in current Node SDK
//     }

//     // Enhance prompt with location info (helps model suggest local shops)
//     let finalPrompt = issueDescription;
//     if (location?.latitude && location?.longitude) {
//       finalPrompt +=
//         `\n\nUser approximate location: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}. ` +
//         `Use this to recommend nearby repair shops / service centers when appropriate.`;
//     }

//     const result = await chat.sendMessage(finalPrompt, {
//       tools: tools.length > 0 ? tools : undefined,
//     });

//     const response = await result.response;

//     // Extract grounding chunks
//     const groundingChunks =
//       response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

//     // Format for frontend (same structure your React code expects)
//     const formattedGrounding = groundingChunks
//       .map((chunk) => {
//         if (chunk.web) {
//           return { web: chunk.web };
//         }
//         // Sometimes retrieved context appears here — treat as web for safety
//         if (chunk.retrievedContext) {
//           return { web: chunk.retrievedContext };
//         }
//         return null;
//       })
//       .filter(Boolean);

//     return {
//       text: response.text(),
//       grounding: formattedGrounding,
//     };
//   } catch (error) {
//     console.error("Gemini Repair Advice Error:", error.message || error);
//     throw error;
//   }
// }

// // Keep your placeholder
// const evaluateProductSustainability = async (productName) => {
//   return { name: productName, status: "Under analysis" };
// };

// module.exports = { getRepairAdvice, evaluateProductSustainability };

// // geminiService.js
// const {
//   GoogleGenerativeAI,
//   HarmBlockThreshold,
//   HarmCategory,
// } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const SYSTEM_INSTRUCTION = `You are EcoNova, a friendly and expert E-Waste Repair Assistant.
// Follow this strict safety and guidance protocol:
// 1. Acknowledge the problem immediately.
// 2. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
// 3. TECHNICIAN HANDOVER: If the repair is highly complex (soldering micro-components, high voltage power supplies, internal monitor disassembly, or specialized glass delamination), explicitly state that it should be handled by a professional technician. Use the Google Maps tool to provide local repair shop recommendations.
// 4. VISUAL GUIDANCE & STRUGGLE: If the user expresses confusion, says "I don't understand", or if the steps involve complex mechanical assembly/disassembly, recommend YouTube videos using Google Search grounding. Frame these as "Simple visual guides for easy understanding".
// 5. DIY VS PRO: If a "common adult" can safely fix it (like changing a modular battery, swapping a drive, or cleaning a fan) but they seem to struggle with text-based steps, pivot to recommending simple YouTube video walkthroughs.
// 6. If safe, provide detailed DIY steps and suggest tools needed.
// 7. Use the Google Maps tool for professional technician recommendations whenever DIY is deemed unsafe or the user prefers expert help.`;

// async function getRepairAdvice(
//   issueDescription,
//   history = [],
//   location = null,
// ) {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash-002", // or "gemini-1.5-pro-002" if you have access
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//       ],
//       generationConfig: {
//         temperature: 0.7,
//         topP: 0.95,
//         topK: 40,
//         maxOutputTokens: 8192,
//       },
//       systemInstruction: SYSTEM_INSTRUCTION,
//     });

//     // Prepare chat history in correct format
//     const chatHistory = history.map((msg) => ({
//       role: msg.role === "model" ? "model" : "user",
//       parts: [{ text: msg.content || msg.parts?.[0]?.text || "" }],
//     }));

//     const chat = model.startChat({
//       history: chatHistory,
//       generationConfig: {
//         temperature: 0.7,
//       },
//     });

//     let sendOptions = {};

//     // Enable grounding with Google Search + Maps (only available in certain regions & models)
//     if (process.env.USE_GROUNDING === "true") {
//       sendOptions = {
//         tools: [
//           { googleSearchRetrieval: {} }, // enables grounding with Google Search
//           // Google Maps grounding is currently experimental / not directly exposed in Node SDK yet
//           // We simulate it by including location in prompt when available
//         ],
//       };
//     }

//     // If location is provided → include it in the prompt (helps model suggest local shops)
//     let enhancedPrompt = issueDescription;
//     if (location?.latitude && location?.longitude) {
//       enhancedPrompt += `\n\nUser approximate location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)} (use this for recommending nearby repair shops if needed)`;
//     }

//     const result = await chat.sendMessage(enhancedPrompt, sendOptions);
//     const response = await result.response;

//     // Grounding metadata (only present when grounding is enabled)
//     const groundingChunks =
//       response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

//     // Format grounding in the way frontend expects
//     const formattedGrounding = groundingChunks
//       .map((chunk) => {
//         if (chunk.web) {
//           return { web: chunk.web };
//         }
//         if (chunk.retrievedContext) {
//           // Sometimes maps data comes here — but usually web for YouTube
//           return { web: chunk.retrievedContext };
//         }
//         return null;
//       })
//       .filter(Boolean);

//     return {
//       text: response.text(),
//       grounding: formattedGrounding,
//     };
//   } catch (error) {
//     console.error("Gemini Repair Advice Error:", error);
//     throw error;
//   }
// }

// // Keep your placeholder function
// const evaluateProductSustainability = async (productName) => {
//   return { name: productName, status: "Under analysis" };
// };

// module.exports = { getRepairAdvice, evaluateProductSustainability };

// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // Access API Key from .env
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const getRepairAdvice = async (issueDescription, history) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash", // Use stable model name
//       systemInstruction:
//         "You are EcoNova, an expert E-Waste Repair Assistant. Safety first: if you detect fire or battery swelling risks, warn the user to stop immediately.",
//     });

//     const chat = model.startChat({
//       history: history.map((h) => ({
//         role: h.role === "model" ? "model" : "user",
//         parts: [{ text: h.content }],
//       })),
//     });

//     const result = await chat.sendMessage(issueDescription);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Gemini Service Error:", error.message);
//     throw new Error("Failed to get response from Gemini AI");
//   }
// };

// // Also include the sustainability function to prevent crashes in other controllers
// const evaluateProductSustainability = async (productName) => {
//   // Placeholder for product evaluation logic
//   return { name: productName, status: "Under analysis" };
// };

// module.exports = { getRepairAdvice, evaluateProductSustainability };
