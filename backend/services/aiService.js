// backend/services/aiService.js
const Groq = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Groq with your API Key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateRepairDiagnosis(prompt, contextData) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          //   content: `You are the EcoNova Repair Mascot and a friendly and expert E-Waste Repair Assistant. Diagnose issues safely based on this context: ${contextData}.
          //   Acknowledge the problem, ask ONE safety question, and suggest 2 DIY steps.
          //   Follow this strict safety and guidance protocol:
          //   1. SAFETY TRIAGE: If the user mentions fire, smoke, sparks, a swollen battery, or liquid damage on a plugged-in device, STOP IMMEDIATELY. Direct them to a professional technician.
          //   2. TECHNICIAN HANDOVER: If the repair is highly complex (soldering, high voltage, or specialized glass repair), explicitly state that it should be handled by a professional. Recommend they check the "Repair Shops" tab in this app.
          //   3. VISUAL GUIDANCE: If the user is confused or the steps involve complex mechanical assembly, suggest they search YouTube using this link: https://www.youtube.com/results?search_query=${encodeURIComponent(prompt + " repair guide")}.
          //   4. DIY STEPS: If safe and manageable for a common adult, provide 2 detailed DIY steps and list needed tools.
          //   5. Acknowledge the problem immediately and ask ONE safety question before proceeding.`,
          // },
          content: `You are the EcoNova Repair Mascot, an expert E-Waste Repair Assistant. 
          Context: ${contextData}
          
          You must follow this STRICT logic tree based on the user's problem:
          
          IF DANGER (fire, smoke, sparks, swollen battery, liquid on plugged-in device):
          - STOP IMMEDIATELY. Do not provide any DIY steps.
          - Instruct them to safely power down if possible and direct them to a professional technician.
          
          IF COMPLEX REPAIR (soldering, high voltage, specialized glass repair):
          - Acknowledge the issue.
          - State explicitly that this requires a professional. Recommend they check the "Repair Shops" tab in this app.
          - Do not provide DIY steps.
          
          IF SAFE & MANAGEABLE (common DIY repairs):
          - Acknowledge the problem.
          - Ask ONE relevant safety question (e.g., "Have you unplugged the device?").
          - Provide exactly 2 clear, detailed DIY steps and a list of needed tools.
          - Provide this YouTube search link for visual help: https://www.youtube.com/results?search_query=${encodeURIComponent(prompt + " repair tutorial")}
          `,
        },
        {
          role: "user",
          content: `Problem: ${prompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile", // Best for logic and safety
      temperature: 0.6,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Repair Error:", error.message);
    return "The AI assistant is temporarily busy. Please consult a professional technician.";
  }
}

async function evaluateProductSustainability(productName) {
  try {
    const prompt = `Analyze the sustainability of the product: "${productName}". 
    Return the analysis STRICTLY as a JSON object matching this exact schema. Do not include markdown formatting or extra text.
    {
      "name": "Full product name",
      "price": "Estimated price in INR",
      "buyLink": "https://www.google.com/search?q=${encodeURIComponent(productName)}",
      "imageUrl": "https://via.placeholder.com/150",
      "materialScore": 5,
      "repairabilityScore": 5,
      "companyScore": 5,
      "ecoReasons": ["Reason 1", "Reason 2"],
      "features": ["Feature 1", "Feature 2"], 
      "greenerAlternative": "Sustainable version name"
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      // Set temperature to 0 for consistent JSON structure
      temperature: 0,
      response_format: { type: "json_object" }, // Forces Groq to return valid JSON
    });

    const content = chatCompletion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Groq Sustainability Error:", error.message);
    return null;
  }
}

module.exports = { generateRepairDiagnosis, evaluateProductSustainability };
