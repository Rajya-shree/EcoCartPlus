import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: 'Hi! What device is having an issue? (e.g., "iPhone 14" or "laptop battery")',
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input) return;

    const userMessage = { from: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // --- NEW LOGIC: Call both APIs at the same time ---
      const guideQuery = { query: input };
      const scoreQuery = { query: input }; // Can be the same query

      const guidePromise = axios.post("/api/repair-guides", guideQuery);
      const scorePromise = axios.post("/api/repair-guides/score", scoreQuery);

      // Wait for both to finish
      const [guideResponse, scoreResponse] = await Promise.all([
        guidePromise,
        scorePromise,
      ]);

      // --- END OF NEW LOGIC ---

      // Create a "bot" response
      const botResponse = {
        from: "bot",
        text: `Here's what I found for "${input}":`,
        guides: guideResponse.data, // Attach the guides
        score: scoreResponse.data, // Attach the score
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      // This will catch errors from either API call
      console.error(err);
      toast.error("Sorry, I had trouble fetching data. Please try again.");
      const errorResponse = {
        from: "bot",
        text: "Sorry, I had trouble fetching guides. Please try again.",
      };
      setMessages((prev) => [...prev, errorResponse]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from}`}>
            <p>{msg.text}</p>

            {/* --- NEW: Logic to display the score --- */}
            {msg.from === "bot" && msg.score && msg.score.score && (
              <a
                href={msg.score.url}
                target="_blank"
                rel="noopener noreferrer"
                className="score-card"
              >
                <strong>Repairability Score: {msg.score.score}/10</strong>
                <p>{msg.score.summary}</p>
              </a>
            )}

            {/* Logic to display the guides */}
            {msg.from === "bot" && msg.guides && msg.guides.length > 0 && (
              <div className="guides-list">
                {msg.guides.map((guide) => (
                  <a
                    key={guide.guideid}
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guide-card"
                  >
                    <img src={guide.imageUrl} alt={guide.title} />
                    <div className="guide-info">
                      <strong>{guide.title}</strong>
                      <p>{guide.summary}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className="message bot">Bot is typing...</div>}
      </div>
      <form className="chatbot-input-form" onSubmit={submitHandler}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., iPhone 14 screen replacement"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
