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
          content: `You are the EcoNova Repair Mascot. Diagnose issues safely based on this context: ${contextData}. 
                    Acknowledge the problem, ask ONE safety question, and suggest 2 DIY steps. 
                    If smoke/fire risk exists, warn the user immediately.`,
        },
        {
          role: "user",
          content: `Problem: ${prompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile", // Best for logic and safety
      temperature: 0.7,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Repair Error:", error.message);
    return "The AI assistant is temporarily busy. Please consult a professional technician.";
  }
}

async function evaluateProductSustainability(productName) {
  try {
    const prompt = `Analyze product: "${productName}". Return STRICT JSON format ONLY. 
    No markdown backticks, no preamble. 
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
