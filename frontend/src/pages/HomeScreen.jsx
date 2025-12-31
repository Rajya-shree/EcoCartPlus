import React from "react";
import Chatbot from "../components/Chatbot.jsx";

// Add a simple style to center the page content
const homeScreenStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
};

const HomeScreen = () => {
  return (
    <div style={homeScreenStyles}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        AI Diagnostic Assistant
      </h2>
      <p>This is the home page. The chatbot will go here.</p>
      <Chatbot />
    </div>
  );
};

export default HomeScreen;
