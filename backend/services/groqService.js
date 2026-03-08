const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getRepairAdvice = async (issueDescription, history = [], location) => {
  const systemInstruction = `You are EcoNova+, an expert e-waste reduction and electronics repair assistant. 
You must analyze the user's problem and respond by strictly following this logical flow:

STEP 1: SAFETY CHECK (CRITICAL PRIORITY)
Analyze the issue for dangerous conditions: smoke, sparks, fire, burning smells, swollen/expanding batteries, shattered glass, or liquid damage on a plugged-in device.
IF UNSAFE: 
- Immediately warn the user.
- Explicitly tell them what NOT to do (e.g., "Do not plug it in").
- Refuse to provide DIY steps.
- Conclude by saying: "For your safety, please do not attempt to fix this yourself. I am pulling up a list of verified local repair specialists on the map below using our EcoNova Locator."
- STOP GENERATING TEXT.

STEP 2: DIAGNOSIS (ONLY IF SAFE)
If safe, clearly distinguish between Hardware issues (e.g., broken screen) and Software/OS issues (e.g., wiped C: drive, bootloop). Explain briefly why the issue is happening.

STEP 3: FIXING & PLATFORM INTEGRATION (ONLY IF SAFE)
- Provide 2 to 3 simple DIY troubleshooting steps.
- Naturally weave in the platform features: "I have attached some helpful visual guides and video tutorials below for you."
- Keep responses concise and easy to read.`;

  try {
    const formattedHistory = history.map((h) => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.content || h.parts?.[0]?.text || "",
    }));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...formattedHistory,
        { role: "user", content: issueDescription },
      ],
      model: "llama3-8b-8192",
      temperature: 0.2,
    });

    return {
      text:
        chatCompletion.choices[0]?.message?.content ||
        "I couldn't generate advice.",
      grounding: [],
    };
  } catch (error) {
    console.error("Groq AI Service Error:", error);
    throw error;
  }
};

module.exports = { getRepairAdvice };
