// const Groq = require("groq-sdk");

// // 1. Initialize Groq with your API Key from .env
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const getRepairAdvice = async (issueDescription, history, location) => {
//   // 2. Define the System Instruction (The "Brain" of EcoNova)
//   // const systemInstruction = `You are EcoNova, a friendly and expert E-Waste Repair Assistant.
//   // Follow this strict safety and guidance protocol:
//   // 1. SAFETY TRIAGE: If the user mentions fire, smoke, or swollen batteries, STOP IMMEDIATELY.
//   // 2. DIY VS PRO: Suggest professional help for high-voltage or complex soldering.
//   // 3. Guidance: Provide clear, numbered DIY steps for simple repairs.`;
//   // const systemInstruction = `You are EcoNova Intelligence, a friendly and expert E-Waste Repair Assistant.
//   // Diagnose issues safely and accurately.

//   // Follow this strict protocol:
//   // 1. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, or swollen batteries, STOP IMMEDIATELY. Direct them to a professional.
//   // 2. DIAGNOSTIC ACCURACY: Distinguish between hardware and software/OS failures. (e.g., deleting a C: drive is an OS failure, not a hardware/power issue).
//   // 3. DIY STEPS: If safe and manageable, provide 2 detailed DIY steps and list needed tools.
//   // 4. NO RAW LINKS: DO NOT generate raw YouTube or Google Maps URLs in your text. Instead, say: "I have attached visual technical guides and local restoration specialists below for you."
//   // 5. CONVERSATION: Acknowledge the user's previous messages. End with ONE concise follow-up question.`;
//   const systemInstruction = `You are the EcoNova Repair Mascot and a friendly, highly expert E-Waste Repair Assistant.
//   Acknowledge the problem, ask ONE safety question, and suggest 2 DIY steps.

//   Follow this strict safety and guidance protocol:
//   1. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
//   2. TECHNICIAN HANDOVER: If the repair is highly complex (soldering, high voltage, or specialized glass repair), explicitly state that it should be handled by a professional.
//   3. VISUAL GUIDANCE: DO NOT output raw URLs in your text. Instead, simply state: "I have attached visual technical guides and nearby restoration specialists below for you."
//   4. DIY STEPS: If safe and manageable for a common adult, provide 2 detailed DIY steps and list needed tools.
//   5. CONVERSATION: Always acknowledge the user's previous context. End with ONE concise follow-up question.`;

//   try {
//     // Format history for Groq
//     const formattedHistory = history.map((h) => ({
//       role: h.role === "model" ? "assistant" : "user",
//       content: h.content || h.parts?.[0]?.text || "", // Handles different frontend formats
//     }));
//     // 3. Request completion from Llama 3
//     const chatCompletion = await groq.chat.completions.create({
//       // messages: [
//       //   { role: "system", content: systemInstruction },
//       //   ...history.map((h) => ({
//       //     role: h.role === "model" ? "assistant" : "user",
//       //     content: h.parts[0].text,
//       //   })),
//       //   { role: "user", content: issueDescription },
//       // ],
//       messages: [
//         { role: "system", content: systemInstruction },
//         ...formattedHistory,
//         { role: "user", content: `Problem: ${issueDescription}` },
//       ],
//       model: "llama-3.3-70b-versatile", // High-performance free-tier model
//       temperature: 0.65,
//     });

//     return {
//       text:
//         chatCompletion.choices[0]?.message?.content ||
//         "I couldn't generate advice.",
//       grounding: [], // Note: Llama 3 doesn't have native Google Search grounding like Gemini
//     };
//   } catch (error) {
//     console.error("Groq AI Service Error:", error);
//     throw error;
//   }
// };

// module.exports = { getRepairAdvice };

/*
const Groq = require("groq-sdk");

/**
 * Handles standard chat responses and intent classification via Groq

const getGroqChatResponse = async (userMessage) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are EcoNova+, an expert e-waste reduction and electronics repair assistant. 
          
          Core Directives:
          1. Accurate Diagnostics: Accurately distinguish between hardware and software/OS failures. If a user deletes critical system files (like the C: drive), explicitly state that they require OS recovery, NOT power troubleshooting.
          2. Safety First: Always prioritize user safety. If an issue sounds physically dangerous (e.g., swelling battery, smoke, sparks), immediately halt DIY advice and recommend professional repair.
          3. Deep Integration: Naturally weave our platform's modules into your responses. 
             - When suggesting professional repair or video tutorials, state: "I am pulling up a list of verified local repair specialists on the map below using our EcoNova Locator."
             - When suggesting maintenance, ask: "Would you like me to add a reminder for this to your EcoNova Lifecycle Tracker?"
          4. Tone: Speak in a concise, professional, and eco-conscious tone. Focus on extending device longevity to prevent e-waste.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      // Llama 3 handles complex system instructions exceptionally well
      model: "llama3-8b-8192",
      temperature: 0.2, // Lowered temperature to make the AI more analytical and less prone to hallucinating random fixes
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Chat Error:", error);
    throw new Error("Failed to generate chat response.");
  }
};

module.exports = { getGroqChatResponse };*/

const Groq = require("groq-sdk");

/**
 * Handles standard chat responses and intent classification via Groq
 */
const getGroqChatResponse = async (userMessage, history = []) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Format history for Groq so it remembers the conversation naturally
  const formattedHistory = history.map((h) => ({
    role: h.role === "model" ? "assistant" : "user",
    content: h.content || h.parts?.[0]?.text || "",
  }));

  const systemInstruction = `You are EcoNova+, an expert e-waste reduction and electronics repair assistant. 
You must analyze the user's problem and respond by strictly following this logical flow:

STEP 1: SAFETY CHECK (CRITICAL PRIORITY)
Analyze the issue for dangerous conditions: smoke, sparks, fire, burning smells, swollen/expanding batteries, shattered glass, or liquid damage on a plugged-in device.
IF UNSAFE: 
- Immediately warn the user.
- Explicitly tell them what NOT to do (e.g., "Do not plug it in," "Do not press on the swollen battery," "Do not turn it on").
- Refuse to provide DIY steps.
- Conclude by saying: "For your safety, please do not attempt to fix this yourself. I am pulling up a list of verified local repair specialists on the map below using our EcoNova Locator."
- STOP GENERATING TEXT. Do not move to Step 2 or 3.

STEP 2: DIAGNOSIS (ONLY IF SAFE)
If the device is completely safe to handle, diagnose the root cause.
- Clearly distinguish between Hardware issues (e.g., broken screen, dead battery) and Software/OS issues (e.g., wiped C: drive, bootloop, blue screen).
- Explain briefly *why* the issue is happening so the user understands their device better.

STEP 3: FIXING & PLATFORM INTEGRATION (ONLY IF SAFE)
- Provide 2 to 3 simple, easy-to-read DIY troubleshooting steps.
- Naturally weave in the platform features: "I have attached some helpful visual guides and video tutorials below for you."
- If the issue is related to long-term care (like cleaning vents or updating software), ask: "Would you like me to add a reminder for this to your EcoNova Lifecycle Tracker?"

TONE & STYLE:
- Speak like a friendly, empathetic human expert. 
- NEVER use robotic transitions like "Initiating Step 1" or "Safety condition detected." 
- Keep responses concise and easy to read on a screen.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...formattedHistory,
        { role: "user", content: userMessage },
      ],
      // Llama 3 handles complex logic trees exceptionally well
      model: "llama3-8b-8192",
      temperature: 0.2, // Keeps the AI logical, strict, and prevents hallucinated behavior
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Chat Error:", error);
    throw new Error("Failed to generate chat response.");
  }
};

module.exports = { getGroqChatResponse };

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
