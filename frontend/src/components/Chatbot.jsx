import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Chatbot.css"; // Your new CSS file

// Define our conversation steps
const CHAT_STEPS = {
  STEP_1_WELCOME: "STEP_1_WELCOME",
  STEP_2_ASK_PROBLEM: "STEP_2_ASK_PROBLEM",
  STEP_3_GATHERING_INFO: "STEP_3_GATHERING_INFO",
  STEP_4_SHOW_RESULTS: "STEP_4_SHOW_RESULTS",
  STEP_5_ESCALATE: "STEP_5_ESCALATE",
};

// Our initial welcome message
const welcomeMessage = {
  from: "bot",
  text: "Hello! I can help you diagnose your electronic device. What are we looking at today?",
  buttons: ["Laptop", "Smartphone", "Desktop PC", "Gaming Console"],
};

const Chatbot = () => {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- This is the "Brain" ---
  const [chatStep, setChatStep] = useState(CHAT_STEPS.STEP_1_WELCOME);
  const [deviceType, setDeviceType] = useState("");

  // Handles all user text input
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const query = input;
    setInput("");

    // --- CONVERSATION LOGIC ---
    if (chatStep === CHAT_STEPS.STEP_2_ASK_PROBLEM) {
      // User has described the problem (e.g., "won't turn on")
      // This is where we implement your "won't turn on" logic

      if (query.includes("won't turn on") || query.includes("no power")) {
        setChatStep(CHAT_STEPS.STEP_3_GATHERING_INFO);
        // Ask the specific question from your example
        const botMessage = {
          from: "bot",
          text: `Got it. You’re reporting a ${deviceType} that doesn’t power on. Let’s check a few things.`,
        };
        const botMessage2 = {
          from: "bot",
          text: "Please confirm — does the charger show any indicator light when plugged in?",
          buttons: ["Yes, it has a light", "No, no light", "I'm not sure"],
        };
        setMessages((prev) => [...prev, botMessage, botMessage2]);
      } else {
        // For any other problem, just get the results
        await fetchAllResults(deviceType, query);
      }
    }
  };

  // Handles all button clicks
  const buttonClickHandler = async (buttonText) => {
    if (isLoading) return;

    // Add user's button click as a message
    const userMessage = { from: "user", text: buttonText };
    setMessages((prev) => [...prev, userMessage]);

    // --- CONVERSATION LOGIC ---
    if (chatStep === CHAT_STEPS.STEP_1_WELCOME) {
      // User selected a device type
      setDeviceType(buttonText); // Save the device type
      setChatStep(CHAT_STEPS.STEP_2_ASK_PROBLEM);
      const botMessage = {
        from: "bot",
        text: `Great! I can help with your ${buttonText}. What specific issue are you experiencing? (e.g., "won't turn on", "screen issues", "battery problems")`,
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    if (chatStep === CHAT_STEPS.STEP_3_GATHERING_INFO) {
      // User answered the "charger light" question
      if (
        buttonText.includes("No, no light") ||
        buttonText.includes("not sure")
      ) {
        // This is the "graceful failure" / escalation path from your example
        setChatStep(CHAT_STEPS.STEP_5_ESCALATE);
        const botMessage = {
          from: "bot",
          text: "Thanks for the details. I couldn’t identify the exact cause based on this — it might be an internal issue that needs professional inspection.",
        };
        const botMessage2 = {
          from: "bot",
          text: "Here’s what I can still help with. Would you like to find DIY guides or a local repair center?",
          buttons: ["Find DIY Guides", "Find Repair Center"],
        };
        setMessages((prev) => [...prev, botMessage, botMessage2]);
      } else {
        // User said "Yes, it has a light"
        const botMessage = {
          from: "bot",
          text: "Okay, let's try a power cycle. Unplug the charger, remove the battery (if possible), and hold the power button for 30 seconds. Then, connect only the charger and try turning it on.",
        };
        const botMessage2 = {
          from: "bot",
          text: "If that doesn't work, let's find some guides for you.",
          buttons: ["Find DIY Guides", "Find Repair Center"],
        };
        setChatStep(CHAT_STEPS.STEP_5_ESCALATE); // Move to the next step
        setMessages((prev) => [...prev, botMessage, botMessage2]);
      }
    }

    if (chatStep === CHAT_STEPS.STEP_5_ESCALATE) {
      // User has chosen what to do next
      if (buttonText.includes("Find DIY Guides")) {
        await fetchAllResults(deviceType, "repair"); // Get all guides
      }
      if (buttonText.includes("Find Repair Center")) {
        await fetchAllResults(deviceType, "", true); // Get only shops
      }
    }
  };

  // Inside Chatbot.jsx, replace the fetchAllResults function:

  const fetchAllResults = async (device, problem) => {
    setIsLoading(true);
    try {
      const apiPrefix = "http://localhost:5000"; // Your backend URL

      // 1. Call the new AI Diagnosis route we created
      const { data } = await axios.post(`${apiPrefix}/api/ai/diagnose`, {
        deviceName: device,
        problemDescription: problem,
      });

      const botMessage = {
        from: "bot",
        text: data.message, // This is the personalized diagnosis from Gemini
        guides: data.guides || [],
        shops: data.fallbacks?.shops || [],
        videos: data.fallbacks?.videos || [],
      };

      setMessages((prev) => [...prev, botMessage]);
      setChatStep(CHAT_STEPS.STEP_4_SHOW_RESULTS);
    } catch (err) {
      console.error(err);
      toast.error("AI Assistant is offline. Please check your API key.");
    }
    setIsLoading(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    const chatWindow = document.querySelector(".chatbot-messages");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot-container">
      {/* --- 1. THE MESSAGE WINDOW --- */}
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from}`}>
            <p>{msg.text}</p>

            {msg.buttons && (
              <div className="quick-select-buttons">
                {msg.buttons.map((btn, i) => (
                  <button
                    key={i}
                    className="quick-select-btn"
                    onClick={() => buttonClickHandler(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}

            {/* --- Display all the results --- */}
            {msg.guides?.length > 0 && (
              <div className="results-container">
                <h4 className="results-header">iFixit Repair Guides</h4>
                <div className="guides-list">
                  {msg.guides.map((guide) => (
                    <a
                      key={guide.guideid}
                      href={guide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-card"
                    >
                      <img src={guide.imageUrl} alt={guide.title} />
                      <div className="result-info">
                        <strong>{guide.title}</strong>
                        <p>{guide.summary}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {msg.videos?.length > 0 && (
              <div className="results-container">
                <h4 className="results-header">YouTube Tutorials</h4>
                <div className="videos-list">
                  {msg.videos.map((video) => (
                    <a
                      key={video.videoId}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-card"
                    >
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="result-info">
                        <strong>{video.title}</strong>
                        <p>{video.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {msg.shops?.length > 0 && (
              <div className="results-container">
                <h4 className="results-header">Nearby Repair Centers</h4>
                <div className="shops-list">
                  {msg.shops.map((shop) => (
                    <div key={shop._id} className="result-card shop-card">
                      <div className="shop-info">
                        <strong>{shop.name}</strong>
                        <p>{shop.distance}</p>
                      </div>
                      <span className="shop-rating">★ {shop.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className="message bot">Bot is typing...</div>}
      </div>

      {/* --- 2. THE INPUT BAR --- */}
      <form className="chatbot-input-form" onSubmit={submitHandler}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Or, describe your problem here..."
          disabled={chatStep !== CHAT_STEPS.STEP_2_ASK_PROBLEM || isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || chatStep !== CHAT_STEPS.STEP_2_ASK_PROBLEM}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
