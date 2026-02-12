const Groq = require("groq-sdk");

// 1. Initialize Groq with your API Key from .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getRepairAdvice = async (issueDescription, history, location) => {
  // 2. Define the System Instruction (The "Brain" of EcoNova)
  const systemInstruction = `You are EcoNova, a friendly and expert E-Waste Repair Assistant. 
  Follow this strict safety and guidance protocol:
  1. SAFETY TRIAGE: If the user mentions fire, smoke, or swollen batteries, STOP IMMEDIATELY.
  2. DIY VS PRO: Suggest professional help for high-voltage or complex soldering.
  3. Guidance: Provide clear, numbered DIY steps for simple repairs.`;

  try {
    // 3. Request completion from Llama 3
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...history.map((h) => ({
          role: h.role === "model" ? "assistant" : "user",
          content: h.parts[0].text,
        })),
        { role: "user", content: issueDescription },
      ],
      model: "llama-3.3-70b-versatile", // High-performance free-tier model
      temperature: 0.7,
    });

    return {
      text:
        chatCompletion.choices[0]?.message?.content ||
        "I couldn't generate advice.",
      grounding: [], // Note: Llama 3 doesn't have native Google Search grounding like Gemini
    };
  } catch (error) {
    console.error("Groq AI Service Error:", error);
    throw error;
  }
};

module.exports = { getRepairAdvice };

// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // 1. Initialize the SDK with your API Key
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const getRepairAdvice = async (issueDescription, history, location) => {
//   // 2. Define the System Instruction
//   const systemInstruction = `You are EcoNova, a friendly and expert E-Waste Repair Assistant.
//   Follow this strict safety and guidance protocol:
//   1. Acknowledge the problem immediately.
//   2. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
//   3. TECHNICIAN HANDOVER: If the repair is highly complex, explicitly state that it should be handled by a professional.
//   4. VISUAL GUIDANCE: If the user is confused, recommend YouTube videos using Google Search grounding.
//   5. DIY VS PRO: If safe, provide detailed DIY steps and suggest tools needed.`;

//   // 3. Initialize the model with the correct version and instruction
//   // We use 'gemini-1.5-flash' which is the stable version you requested
//   const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash-latest",
//     systemInstruction: {
//       role: "system",
//       parts: [{ text: systemInstruction }],
//     },
//   });

//   try {
//     // 4. Call the model with the correct tool names
//     const result = await model.generateContent({
//       contents: [
//         ...history,
//         { role: "user", parts: [{ text: issueDescription }] },
//       ],
//       generationConfig: {
//         temperature: 0.7,
//       },
//       // Note: 'googleSearchRetrieval' is the correct tool name for search grounding
//       tools: [{ googleSearchRetrieval: {} }],
//     });

//     const response = await result.response;

//     return {
//       text: response.text(),
//       grounding:
//         response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
//     };
//   } catch (error) {
//     console.error("Gemini Service Error Details:", error);
//     throw error; // Let the controller catch this and send the 500 status
//   }
// };

// module.exports = { getRepairAdvice };
