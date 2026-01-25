const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();

// Initialize with your API key from .env
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

/**
 * Merged AI Logic to satisfy "EcoNova Repair Mascot" identity
 * and "Safety Guardrails" from the project abstract.
 */
async function generateRepairDiagnosis(prompt, contextData) {
  // Using gemini-1.5-flash for fast, efficient diagnostic responses
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // const systemInstructions = `
  //   You are the EcoNova Repair Mascot. You help users diagnose device issues using this logic:

  //   1. REPEAT: Acknowledge the device and problem clearly (e.g., "I'm sorry your 3-year-old laptop won't turn on").
  //   2. TRIAGE: Ask exactly ONE safe follow-up question to narrow down the issue.
  //   3. DIAGNOSE: Use the provided iFixit [CONTEXT] to suggest 2 simple, safe DIY steps.
  //   4. SAFETY GUARDRAIL: If you detect signs of battery swelling, smoke, fire risk, or internal short-circuits,
  //      immediately say: "This looks like an internal hardware failure. For your safety, do not open the device.
  //      I am providing a list of nearby certified repair centers below."

  //   **CONTEXTUAL DATA (iFixit Guides):**
  //   ---
  //   ${contextData}
  //   ---
  // `;
  // Inside your existing generateRepairDiagnosis function
  const systemInstructions = `
    You are the EcoNova Repair Mascot. You are an expert in the circular economy.
    
    RULES:
    1. ${
      contextData
        ? "Use this technical data: " + contextData
        : "Use your general knowledge."
    }
    2. Suggest exactly 2 DIY steps.
    3. Calculate the 'Eco-Benefit': Tell the user how much e-waste they prevent by fixing this.
    4. SAFETY GUARDRAIL: If you detect signs of battery swelling, smoke, fire risk, or internal short-circuits, 
        immediately say: "This looks like an internal hardware failure. For your safety, do not open the device. 
        I am providing a list of nearby certified repair centers below."
`;

  try {
    const result = await model.generateContent(
      systemInstructions + "\nUser's Problem: " + prompt
    );
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return "I'm having trouble connecting to my repair database. For your safety, please check with a local technician if the issue persists.";
  }
}

module.exports = { generateRepairDiagnosis };

// backend/services/aiService.js

// ... keep existing GoogleGenAI initialization

/**
 * @desc Evaluates a product's sustainability using Gen AI
 */
async function evaluateProductSustainability(productName) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
        Act as an environmental sustainability expert. 
        Analyze the following product: "${productName}"
        
        Provide a detailed sustainability report in STRICT JSON format:
        {
            "name": "Full product name",
            "materialScore": (score 1-10),
            "repairabilityScore": (score 1-10),
            "companyScore": (score 1-10),
            "ecoReasons": ["Reason 1", "Reason 2"],
            "keyFeatures": ["Feature 1", "Feature 2"],
            "greenerAlternative": "Name of a more sustainable version",
            "priceRange": "Estimated market price in INR"
        }
        
        Base the scores on global standards for e-waste and sustainability.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Ensure we only parse the JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("Gemini Sustainability Error:", error);
    return null;
  }
}

// Update exports to include the new function
module.exports = {
  generateRepairDiagnosis: require("./aiService").generateRepairDiagnosis, // keep existing
  evaluateProductSustainability,
};
