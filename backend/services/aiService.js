// backend/services/aiService.js

const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();

// Initialize the GoogleGenAI client (gets key from .env automatically)
const ai = new GoogleGenAI({});

const systemPrompt = `
You are the EcoNova Repair Mascot. You must help the user diagnose their device issues using this logic:

1. REPEAT: Start by acknowledging the device and age (e.g. "I see your 2-year old laptop has power issues").
2. TRIAGE: Ask exactly ONE safe follow-up question (e.g. "Is the charger indicator light on?").
3. DIAGNOSE: If the user answers, use the provided iFixit [CONTEXT] to suggest 2 simple DIY steps.
4. SAFETY GUARDRAIL: If the issue sounds like a battery swelling, smoke, or internal short-circuit, say: "This looks like an internal hardware failure. For your safety, please do not open the device. I am providing a list of nearby certified repair centers below."

Always be calm and helpful. If iFixit data is not found, use your general knowledge but prioritize safety.
`;

async function generateRepairDiagnosis(prompt, contextData) {
  // 1. Master System Prompt - Simplified for this test, but includes the RAG structure
  const systemPrompt = `
        You are a friendly electronics repair bot named 'EcoNova AI Advisor'.
        Acknowledge the user's problem clearly.
        Your goal is to suggest a single, simple, safe, DIY solution based ONLY on the provided CONTEXTUAL DATA and common sense troubleshooting.
        
        **CONTEXTUAL DATA (iFixit Guides):**
        ---
        ${contextData}
        ---
        
        **USER'S PROBLEM:**
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Fast and effective model
      contents: systemPrompt + prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    // CRUCIAL: If the AI fails, return a graceful error message.
    return "I apologize, my diagnostic AI is currently offline. Please ensure your GEMINI_API_KEY is valid and try restarting the server.";
  }
}

module.exports = { generateRepairDiagnosis };
