// pages/RepairAI.jsx
import React from "react";
import Chatbot from "../components/Chatbot.jsx";

const RepairAI = () => {
  return (
    <div
      className="repair-ai-container"
      style={{ padding: "40px", textAlign: "center" }}
    >
      <h2>AI Diagnostic Assistant</h2>
      <p>Describe your device issue below for a step-by-step repair guide.</p>
      <Chatbot />
    </div>
  );
};

export default RepairAI;
