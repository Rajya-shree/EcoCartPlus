import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  User,
  Bot,
  ShieldAlert,
  Trash2,
  Zap,
  Info,
  MapPin,
  History,
  Star,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Plus,
} from "lucide-react";
import { DIAGNOSIS_URL, VIDEO_RECOMMENDATIONS_URL } from "../utils/constants";
import VideoHelpCard from "../components/VideoHelpCard";
import ShopMap from "../components/ShopMap";
import { Grid, Typography, Box } from "@mui/material";
import "./DiagnosisScreen.css";

const DiagnosisScreen = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "# Technical Diagnostic Node\nEcoNova Intelligence is active. Describe the hardware failure symptoms to generate a technical restoration protocol.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // --- Logic: Backend Communication ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const token = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo")).token
      : null;

    const userMessage = input;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp },
    ]);
    setLoading(true);

    try {
      const res = await fetch(DIAGNOSIS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: userMessage, location }),
      });

      const data = await res.json();
      const diagnosisText = data.advice;

      let videoGrounding = [];
      const aiGaveInstructions =
        diagnosisText.toLowerCase().includes("step") ||
        diagnosisText.toLowerCase().includes("tools");

      if (userMessage.length > 10 && aiGaveInstructions) {
        try {
          const videoRes = await fetch(VIDEO_RECOMMENDATIONS_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              diagnosis: diagnosisText,
              deviceName: userMessage,
            }),
          });
          const videoData = await videoRes.json();
          if (videoData.videos?.length > 0) {
            videoGrounding = videoData.videos.slice(0, 4).map((v) => ({
              web: { url: v.url, title: v.title, thumbnail: v.thumbnail },
            }));
          }
        } catch (vErr) {
          console.warn("Video search failed.");
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            diagnosisText || "Trace failed. Check hardware connectivity.",
          grounding: videoGrounding,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("EcoNova Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- UI: Typography System / Markdown Parser ---
  const renderInlineMarkdown = (text, isUser) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={i}
            style={{
              fontWeight: 900,
              textDecoration: isUser ? "underline" : "none",
            }}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedContent = (content, isUser) => {
    if (isUser)
      return (
        <p className="user-text-base">{renderInlineMarkdown(content, true)}</p>
      );

    return content.split("\n").map((line, i) => {
      if (line.startsWith("# "))
        return (
          <h1 key={i} className="pro-h1">
            {renderInlineMarkdown(line.replace("# ", ""), false)}
          </h1>
        );
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="pro-h2">
            <ChevronRight size={18} />{" "}
            {renderInlineMarkdown(line.replace("## ", ""), false)}
          </h2>
        );
      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <li key={i} className="pro-li">
            {renderInlineMarkdown(line.substring(2), false)}
          </li>
        );
      }
      if (!line.trim()) return <div key={i} style={{ height: "1rem" }} />;
      return (
        <p key={i} className="pro-p">
          {renderInlineMarkdown(line, false)}
        </p>
      );
    });
  };

  return (
    <div className="pro-diagnosis-screen">
      {/* Top Header */}
      <div className="pro-sticky-header">
        <div className="header-inner">
          <div className="header-left">
            <History className="icon-btn-gray" />
            <div className="divider-v" />
            <h1 className="header-title">Hardware Diagnostic Session</h1>
          </div>
          <div className="header-right">
            <div className="sync-badge">
              <ShieldCheck size={14} /> Synchronized
            </div>
            <button
              className="new-session-btn"
              onClick={() => window.location.reload()}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Canvas */}
      <div className="chat-canvas" ref={scrollRef}>
        <div className="chat-limit-container">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                className={`msg-row ${isUser ? "user-row" : "bot-row"}`}
              >
                <div
                  className={`avatar-container ${isUser ? "user-avatar" : "bot-avatar"}`}
                >
                  {isUser ? <User size={24} /> : <Bot size={24} />}
                </div>
                <div className="msg-bubble-group">
                  <div
                    className={`msg-bubble ${isUser ? "user-bubble" : "bot-bubble"}`}
                  >
                    {renderFormattedContent(msg.content, isUser)}

                    {!isUser && msg.grounding?.length > 0 && (
                      <div className="grounding-area">
                        <h4 className="grounding-label">
                          <Sparkles size={14} /> Visual Reference Nodes
                        </h4>
                        <Grid container spacing={2}>
                          {msg.grounding.map((g, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <VideoHelpCard video={g.web} />
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                    )}
                  </div>
                  <div className="msg-meta">
                    <button className="vault-btn">
                      <Star size={12} /> ADD TO VAULT
                    </button>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="msg-row bot-row loading-anim">
              <div className="bot-avatar">
                <Bot className="animate-bounce" />
              </div>
              <div className="loading-shimmer-bubble">
                <div className="shimmer-line line-75" />
                <div className="shimmer-line line-50" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Command Center */}
      <div className="floating-command-center">
        <div className="input-container">
          <form onSubmit={handleSend} className="input-form">
            <div className="terminal-icon">
              <Terminal size={24} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the hardware fault SKU..."
              className="pro-input-field"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="initiate-btn"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
              <span>Initiate Trace</span>
            </button>
          </form>
          <p className="engine-version">
            Predictive Hardware Diagnostic Engine v4.2
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisScreen;
// OLD UI
// import React, { useState, useRef, useEffect } from "react";
// import {
//   Send,
//   User,
//   Bot,
//   ShieldAlert,
//   Trash2,
//   Zap,
//   Info,
//   MapPin,
//   YoutubeIcon,
//   ExternalLink,
//   Star,
//   Menu,
// } from "lucide-react";
// // import { DIAGNOSIS_URL } from "../utils/constants";
// // import VideoHelpCard from "../components/VideoHelpCard";
// // import ShopMap from "../components/ShopMap";
// import { DIAGNOSIS_URL, VIDEO_RECOMMENDATIONS_URL } from "../utils/constants"; // Add VIDEO_RECOMMENDATIONS_URL
// import VideoHelpCard from "../components/VideoHelpCard";
// import ShopMap from "../components/ShopMap";
// import { Grid, Typography, Box } from "@mui/material";

// const DiagnosisScreen = () => {
//   const [messages, setMessages] = useState([
//     {
//       role: "model",
//       content:
//         "Hi! I'm EcoNova, your expert e-waste repair assistant. Describe the issue with your electronics, and I'll help you extend its life safely.",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [location, setLocation] = useState(null);
//   const [locationLoading, setLocationLoading] = useState(true);

//   const scrollRef = useRef(null);

//   // Inline style objects (shared across component)
//   const styles = {
//     container: {
//       maxWidth: "1024px",
//       margin: "0 auto",
//       padding: "1rem",
//       display: "flex",
//       flexDirection: "column",
//       gap: "1rem",
//     },
//     header: {
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       padding: "0 0.5rem",
//     },
//     title: {
//       fontSize: "1.5rem",
//       fontWeight: "bold",
//       color: "#111827",
//       display: "flex",
//       alignItems: "center",
//       gap: "0.5rem",
//       fontFamily: "Outfit, sans-serif", // Fallback if font not loaded
//     },
//     activeBadge: {
//       fontSize: "0.625rem",
//       backgroundColor: "#d1fae5",
//       color: "#065f46",
//       padding: "0.125rem 0.5rem",
//       borderRadius: "9999px",
//       fontWeight: "bold",
//       textTransform: "uppercase",
//       letterSpacing: "0.05em",
//     },
//     geoStatus: {
//       fontSize: "0.875rem",
//       color: "#6b7280",
//       marginLeft: "0.25rem",
//     },
//     chatContainer: {
//       height: "450px",
//       display: "flex",
//       flexDirection: "column",
//       backgroundColor: "#ffffff",
//       borderRadius: "32px",
//       border: "1px solid #f3f4f6",
//       boxShadow:
//         "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
//       overflow: "hidden",
//       position: "relative",
//     },
//     messagesArea: {
//       flex: 1,
//       overflowY: "auto",
//       padding: "1.5rem",
//       display: "flex",
//       flexDirection: "column",
//       gap: "1rem",
//       backgroundColor: "rgba(248, 250, 252, 0.5)",
//     },
//     messageWrapper: (role) => ({
//       display: "flex",
//       justifyContent: role === "user" ? "flex-end" : "flex-start",
//       animation: "slideInFromBottom 0.3s ease-out",
//     }),
//     messageBubbleWrapper: (role) => ({
//       display: "flex",
//       gap: "0.75rem",
//       maxWidth: "85%",
//       flexDirection: role === "user" ? "row-reverse" : "row",
//     }),
//     avatar: (role) => ({
//       flexShrink: 0,
//       width: "2rem",
//       height: "2rem",
//       borderRadius: "9999px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       border: "1px solid",
//       ...(role === "user"
//         ? {
//             backgroundColor: "#059669",
//             color: "#ffffff",
//             borderColor: "#047857",
//           }
//         : {
//             backgroundColor: "#ffffff",
//             color: "#059669",
//             borderColor: "#f3f4f6",
//           }),
//     }),
//     icon: { width: "1rem", height: "1rem" },
//     messageBubble: (role, isSafety) => ({
//       padding: "1rem",
//       borderRadius: "16px",
//       boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//       position: "relative",
//       maxWidth: "100%",
//       ...(role === "user"
//         ? {
//             backgroundColor: "#059669",
//             color: "#ffffff",
//             borderTopRightRadius: 0,
//           }
//         : isSafety
//           ? {
//               backgroundColor: "#fef2f2",
//               border: "2px solid #fecaca",
//               color: "#dc2626",
//               borderTopLeftRadius: 0,
//               boxShadow: "0 0 0 1px rgba(239, 68, 68, 0.1)",
//             }
//           : {
//               backgroundColor: "#ffffff",
//               color: "#1f2937",
//               border: "1px solid #f3f4f6",
//               borderTopLeftRadius: 0,
//             }),
//     }),
//     safetyHeader: {
//       display: "flex",
//       alignItems: "center",
//       gap: "0.5rem",
//       color: "#dc2626",
//       fontWeight: "bold",
//       marginBottom: "0.5rem",
//       textTransform: "uppercase",
//       fontSize: "0.625rem",
//       letterSpacing: "0.05em",
//     },
//     messageText: {
//       whiteSpace: "pre-wrap",
//       fontSize: "0.875rem",
//       lineHeight: "1.5",
//       margin: 0,
//     },
//     loadingBubble: {
//       display: "flex",
//       justifyContent: "flex-start",
//     },
//     loadingContent: {
//       padding: "1rem",
//       backgroundColor: "#ffffff",
//       border: "1px solid #f3f4f6",
//       borderRadius: "16px",
//       borderTopLeftRadius: 0,
//       boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//       display: "flex",
//       alignItems: "center",
//       gap: "0.75rem",
//     },
//     dots: { display: "flex", gap: "0.25rem" },
//     dot: (delay) => ({
//       width: "0.375rem",
//       height: "0.375rem",
//       backgroundColor: "#059669",
//       borderRadius: "9999px",
//       animation: "bounce 1.4s ease-in-out infinite both",
//       animationDelay: delay,
//     }),
//     loadingText: {
//       fontSize: "0.625rem",
//       color: "#9ca3af",
//       fontWeight: "bold",
//       textTransform: "uppercase",
//       letterSpacing: "0.05em",
//     },
//     inputArea: {
//       padding: "1rem",
//       backgroundColor: "#ffffff",
//       borderTop: "1px solid #f9fafb",
//     },
//     form: { position: "relative" },
//     input: {
//       width: "100%",
//       padding: "0.875rem 3.5rem 0.875rem 1.25rem",
//       borderRadius: "16px",
//       backgroundColor: "#f9fafb",
//       border: "1px solid #f3f4f6",
//       outline: "none",
//       fontSize: "0.875rem",
//       transition: "all 0.2s",
//       "&:focus": { borderColor: "#059669", backgroundColor: "#ffffff" },
//     },
//     sendButton: {
//       position: "absolute",
//       right: "0.5rem",
//       top: "0.5rem",
//       bottom: "0.5rem",
//       backgroundColor: "#059669",
//       color: "#ffffff",
//       padding: "0 1rem",
//       borderRadius: "12px",
//       border: "none",
//       cursor: "pointer",
//       transition: "all 0.2s",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       "&:hover:not(:disabled)": { backgroundColor: "#047857" },
//       "&:disabled": { backgroundColor: "#e5e7eb" },
//     },
//     footerCredits: {
//       display: "flex",
//       justifyContent: "center",
//       gap: "1.5rem",
//       marginTop: "0.75rem",
//     },
//     creditItem: {
//       display: "flex",
//       alignItems: "center",
//       gap: "0.375rem",
//       fontSize: "0.5625rem",
//       fontWeight: "bold",
//       color: "#9ca3af",
//       textTransform: "uppercase",
//       letterSpacing: "0.05em",
//     },
//     creditIcon: { width: "0.75rem", height: "0.75rem" },
//     groundingButtons: {
//       display: "flex",
//       justifyContent: "center",
//       gap: "1rem",
//       margin: "0.75rem 0",
//     },
//     groundingButton: {
//       display: "flex",
//       alignItems: "center",
//       gap: "0.375rem",
//       fontSize: "0.625rem",
//       fontWeight: "bold",
//       color: "#4b5563",
//       background: "none",
//       border: "none",
//       cursor: "pointer",
//       transition: "color 0.2s",
//       padding: 0,
//       "&:hover": { color: "#dc2626" },
//     },
//     groundingSection: {
//       marginTop: "1rem",
//       display: "flex",
//       flexDirection: "column",
//       gap: "0.75rem",
//       fontSize: "0.875rem",
//     },
//     groundingHeader: {
//       fontSize: "0.625rem",
//       fontWeight: "bold",
//       color: "#9ca3af",
//       textTransform: "uppercase",
//       letterSpacing: "0.05em",
//       display: "flex",
//       alignItems: "center",
//       gap: "0.375rem",
//     },
//     groundingLink: {
//       backgroundColor: "#ffffff",
//       border: "1px solid #f3f4f6",
//       padding: "0.625rem",
//       borderRadius: "12px",
//       display: "flex",
//       alignItems: "center",
//       gap: "0.75rem",
//       fontSize: "0.75rem",
//       fontWeight: "bold",
//       color: "#374151",
//       textDecoration: "none",
//       boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//       transition: "all 0.2s",
//       "&:hover": {
//         boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//         transform: "translateY(-1px)",
//       },
//     },
//     linkIconWrapper: {
//       width: "2rem",
//       height: "2rem",
//       borderRadius: "8px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "#fef2f2",
//       color: "#dc2626",
//       transition: "all 0.2s",
//       "&:hover": { backgroundColor: "#dc2626", color: "#ffffff" },
//     },
//     externalIcon: {
//       width: "0.875rem",
//       height: "0.875rem",
//       color: "#d1d5db",
//       "&:hover": { color: "#9ca3af" },
//     },
//     resetButton: {
//       color: "#9ca3af",
//       padding: "0.5rem",
//       cursor: "pointer",
//       transition: "color 0.2s",
//       border: "none",
//       background: "none",
//       "&:hover": { color: "#dc2626" },
//     },
//   };

//   // CSS Keyframes for animations (injected via <style> tag)
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.textContent = `
//       @keyframes slideInFromBottom {
//         from { opacity: 0; transform: translateY(8px); }
//         to { opacity: 1; transform: translateY(0); }
//       }
//       @keyframes bounce {
//         0%, 80%, 100% { transform: scale(0); }
//         40% { transform: scale(1); }
//       }
//     `;
//     document.head.appendChild(style);
//     return () => document.head.removeChild(style);
//   }, []);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setLocation({
//             latitude: pos.coords.latitude,
//             longitude: pos.coords.longitude,
//           });
//           setLocationLoading(false);
//         },
//         (err) => {
//           console.warn("Location access denied", err);
//           setLocationLoading(false);
//         },
//       );
//     } else {
//       setLocationLoading(false);
//     }
//   }, []);

//   // const handleSend = async (e) => {
//   //   e.preventDefault();
//   //   if (!input.trim() || loading) return;

//   //   // const token = localStorage.getItem("token");

//   //   // if (!token) {
//   //   //   setMessages((prev) => [
//   //   //     ...prev,
//   //   //     {
//   //   //       role: "model",
//   //   //       content: "Please log in to use the AI repair assistant.",
//   //   //     },
//   //   //   ]);
//   //   //   return;
//   //   // }

//   //   const token = localStorage.getItem("userInfo")
//   //     ? JSON.parse(localStorage.getItem("userInfo")).token
//   //     : null;

//   //   const userMessage = input;
//   //   setInput("");
//   //   setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
//   //   setLoading(true);

//   //   try {
//   //     const history = messages.map((m) => ({
//   //       role: m.role,
//   //       parts: [{ text: m.content }],
//   //     }));

//   //     const res = await fetch(DIAGNOSIS_URL, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         // Authorization: `Bearer ${token}`, // ← use the variable
//   //         ...(token && { Authorization: `Bearer ${token}` }),
//   //       },
//   //       body: JSON.stringify({ message: userMessage, history, location }),
//   //     });

//   //     if (res.status === 401) {
//   //       // Token invalid or expired
//   //       localStorage.removeItem("token"); // optional: clean up
//   //       setMessages((prev) => [
//   //         ...prev,
//   //         {
//   //           role: "model",
//   //           content: "Your session has expired. Please log in again.",
//   //         },
//   //       ]);
//   //       setLoading(false);
//   //       return;
//   //     }

//   //     if (!res.ok) {
//   //       const errorData = await res.json().catch(() => ({}));
//   //       throw new Error(errorData.message || `Server error: ${res.status}`);
//   //     }

//   //     const data = await res.json();
//   //     const text = data.advice;
//   //     const grounding = data.grounding || [];

//   //     const isSafetyWarning =
//   //       text?.toLowerCase().includes("stop immediately") ||
//   //       text?.toLowerCase().includes("fire") ||
//   //       text?.toLowerCase().includes("professional");

//   //     setMessages((prev) => [
//   //       ...prev,
//   //       {
//   //         role: "model",
//   //         content:
//   //           text || "I'm sorry, I couldn't process that. Please try again.",
//   //         isSafetyWarning,
//   //         grounding,
//   //       },
//   //     ]);
//   //   } catch (error) {
//   //     console.error("Repair assistant error:", error);
//   //     setMessages((prev) => [
//   //       ...prev,
//   //       {
//   //         role: "model",
//   //         content:
//   //           "An error occurred while getting repair advice. Please try again later.",
//   //       },
//   //     ]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || loading) return;

//     const token = localStorage.getItem("userInfo")
//       ? JSON.parse(localStorage.getItem("userInfo")).token
//       : null;

//     const userMessage = input;

//     const isRealRepairIssue = userMessage.trim().length > 10;

//     setInput("");
//     setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
//     setLoading(true);

//     try {
//       // --- 1. Get AI Diagnosis (Text) ---
//       const res = await fetch(DIAGNOSIS_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//         body: JSON.stringify({ message: userMessage, location }),
//       });

//       const data = await res.json();
//       const diagnosisText = data.advice;

//       // --- 2. Fetch Visual YouTube Cards ---
//       let videoGrounding = [];

//       // 🟢 NEW: Only fetch if the AI actually gave repair instructions
//       const aiGaveInstructions =
//         diagnosisText.toLowerCase().includes("step") ||
//         diagnosisText.toLowerCase().includes("tools");

//       // if (containsRepairSteps && !loading) {
//       if (isRealRepairIssue && aiGaveInstructions) {
//         try {
//           const videoRes = await fetch(VIDEO_RECOMMENDATIONS_URL, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               ...(token && { Authorization: `Bearer ${token}` }),
//             },
//             // We send the diagnosis text to Gemini to ensure alignment
//             body: JSON.stringify({
//               diagnosis: diagnosisText,
//               deviceName: userMessage,
//             }),
//           });

//           const videoData = await videoRes.json();

//           // Only include videos if they exist and align with the results
//           // if (videoData.videos && videoData.videos.length > 0) {
//           if (videoData.videos?.length > 0) {
//             // Limit to maximum 4 videos as requested
//             // Each object in the array MUST have a 'web' key
//             videoGrounding = videoData.videos.slice(0, 4).map((v) => ({
//               web: {
//                 url: v.url,
//                 title: v.title,
//                 thumbnail: v.thumbnail,
//               },
//             }));
//           }
//         } catch (vErr) {
//           console.warn("No relevant videos found or search failed.");
//         }
//       }

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "model",
//           content:
//             diagnosisText || "I couldn't process that. Please try again.",
//           grounding: videoGrounding, // 🟢 Triggers the visual VideoHelpCard components
//         },
//       ]);
//     } catch (error) {
//       console.error("EcoNova Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleSend = async (e) => {
//   //   e.preventDefault();
//   //   if (!input.trim() || loading) return;

//   //   const userMessage = input;
//   //   setInput("");
//   //   setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
//   //   setLoading(true);

//   //   try {
//   //     const history = messages.map((m) => ({
//   //       role: m.role,
//   //       parts: [{ text: m.content }],
//   //     }));

//   //     const res = await fetch("/api/repair-assistant/diagnose", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${localStorage.getItem("token")}`,
//   //       },
//   //       body: JSON.stringify({ message: userMessage, history, location }),
//   //     });

//   //     const data = await res.json();
//   //     const text = data.advice;
//   //     const grounding = data.grounding || [];

//   //     const isSafetyWarning =
//   //       text?.toLowerCase().includes("stop immediately") ||
//   //       text?.toLowerCase().includes("fire") ||
//   //       text?.toLowerCase().includes("professional");

//   //     setMessages((prev) => [
//   //       ...prev,
//   //       {
//   //         role: "model",
//   //         content:
//   //           text || "I'm sorry, I couldn't process that. Please try again.",
//   //         isSafetyWarning,
//   //         grounding,
//   //       },
//   //     ]);
//   //   } catch (error) {
//   //     console.error(error);
//   //     setMessages((prev) => [
//   //       ...prev,
//   //       {
//   //         role: "model",
//   //         content: "An error occurred while getting repair advice.",
//   //       },
//   //     ]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // const renderGrounding = (grounding) => {
//   //   if (!grounding || grounding.length === 0) return null;

//   //   const webLinks = grounding.filter((g) => g.web);
//   //   const mapLinks = grounding.filter((g) => g.maps);

//   //   return (
//   //     <div style={styles.groundingSection}>
//   //       {webLinks.length > 0 && (
//   //         <div>
//   //           <p style={styles.groundingHeader}>
//   //             <Star size={12} style={{ color: "#f59e0b" }} />
//   //             Grounded Search
//   //           </p>
//   //           <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
//   //             {webLinks.map((g, idx) => (
//   //               <a
//   //                 key={idx}
//   //                 href={g.web.uri}
//   //                 target="_blank"
//   //                 rel="noopener noreferrer"
//   //                 style={styles.groundingLink}
//   //               >
//   //                 <div style={styles.linkIconWrapper}>
//   //                   <Youtube size={16} />
//   //                 </div>
//   //                 <span
//   //                   style={{
//   //                     display: "-webkit-box",
//   //                     WebkitLineClamp: 1,
//   //                     WebkitBoxOrient: "vertical",
//   //                     overflow: "hidden",
//   //                   }}
//   //                 >
//   //                   {g.web.title || "Repair Guide"}
//   //                 </span>
//   //               </a>
//   //             ))}
//   //           </div>
//   //         </div>
//   //       )}
//   //       {mapLinks.length > 0 && (
//   //         <div>
//   //           <p style={styles.groundingHeader}>
//   //             <Menu size={12} style={{ color: "#dc2626" }} />
//   //             Local Shop Finder
//   //           </p>
//   //           <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
//   //             {mapLinks.map((g, idx) => (
//   //               <a
//   //                 key={idx}
//   //                 href={g.maps.uri}
//   //                 target="_blank"
//   //                 rel="noopener noreferrer"
//   //                 style={styles.groundingLink}
//   //               >
//   //                 <div style={styles.linkIconWrapper}>
//   //                   <MapPin size={16} />
//   //                 </div>
//   //                 <span>{g.maps.title || "View on Maps"}</span>
//   //               </a>
//   //             ))}
//   //           </div>
//   //         </div>
//   //       )}
//   //     </div>
//   //   );
//   // };

//   const renderGrounding = (grounding) => {
//     //console.log("Current Grounding Data:", grounding);
//     if (!grounding || grounding.length === 0) return null;

//     const webLinks = grounding.filter((g) => g.web);
//     const mapLinks = grounding.filter((g) => g.maps);

//     return (
//       <div style={styles.groundingSection}>
//         {/* --- 🟢 1. Visual Shop Cards (Maps) --- */}
//         {mapLinks.length > 0 && (
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
//           >
//             <p style={styles.groundingHeader}>
//               <MapPin size={12} style={{ color: "#dc2626" }} />
//               Nearby Repair Specialists
//             </p>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
//               {mapLinks.map((g, idx) => (
//                 <ShopMap key={idx} shop={g.maps} />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* --- 🟢 2. Visual Video Cards (YouTube) --- */}
//         {/* {webLinks.length > 0 && (
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: "0.5rem",
//               marginTop: "0.5rem",
//             }}
//           >
//             <p style={styles.groundingHeader}>

//               <Zap size={12} style={{ color: "#f59e0b" }} />
//               Educational Resources & Videos
//             </p>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "0.5rem",
//               }}
//             >
//               {webLinks.map((g, idx) => (
//                 <VideoHelpCard key={idx} video={g.web} />
//               ))}
//             </div>
//           </div>
//         )} */}
//         {/* --- 🟢 2. Modern Video Grid (YouTube) --- */}
//         <Box sx={{ mt: 3, width: "100%" }}>
//           {webLinks.length > 0 && (
//             <>
//               <Typography
//                 variant="overline"
//                 sx={{
//                   fontWeight: "bold",
//                   color: "text.secondary",
//                   mb: 2,
//                   display: "block",
//                 }}
//               >
//                 Curated Educational Resources
//               </Typography>

//               {/* 🟢 The Grid Container handles the "Box" arrangement */}
//               <Grid container spacing={2}>
//                 {webLinks.map((g, idx) => (
//                   <Grid item xs={12} sm={6} key={idx}>
//                     {/* xs={12} is full width on mobile, sm={6} is half width on desktop */}
//                     <VideoHelpCard video={g.web} />
//                   </Grid>
//                 ))}
//               </Grid>
//             </>
//           )}
//         </Box>
//       </div>
//     );
//   };

//   const lastMessage = messages[messages.length - 1];

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div style={{ display: "flex", flexDirection: "column" }}>
//           <h2 style={styles.title}>
//             AI Diagnostic Assistant
//             <span style={styles.activeBadge}>Active</span>
//           </h2>
//           {locationLoading && (
//             <p style={styles.geoStatus}>(AWAITING GEOLOCATION...)</p>
//           )}
//         </div>
//         <button
//           onClick={() =>
//             setMessages([
//               { role: "model", content: "Chat reset. How can I help?" },
//             ])
//           }
//           style={styles.resetButton}
//         >
//           <Trash2 className="w-5 h-5" />
//         </button>
//       </div>

//       <div style={styles.chatContainer}>
//         <div ref={scrollRef} style={styles.messagesArea}>
//           {messages.map((msg, i) => (
//             <div key={i} style={styles.messageWrapper(msg.role)}>
//               <div style={styles.messageBubbleWrapper(msg.role)}>
//                 <div style={styles.avatar(msg.role)}>
//                   {msg.role === "user" ? (
//                     <User style={styles.icon} />
//                   ) : (
//                     <Bot style={styles.icon} />
//                   )}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={styles.messageBubble(msg.role, msg.isSafetyWarning)}
//                   >
//                     {msg.isSafetyWarning && (
//                       <div style={styles.safetyHeader}>
//                         <ShieldAlert
//                           style={{ width: "1rem", height: "1rem" }}
//                         />
//                         Critical Safety Protocol
//                       </div>
//                     )}
//                     <p style={styles.messageText}>{msg.content}</p>
//                   </div>
//                   {msg.role === "model" && renderGrounding(msg.grounding)}
//                 </div>
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div style={styles.loadingBubble}>
//               <div style={styles.loadingContent}>
//                 <div style={styles.dots}>
//                   <div style={styles.dot("0s")} />
//                   <div style={styles.dot("75ms")} />
//                   <div style={styles.dot("150ms")} />
//                 </div>
//                 <span style={styles.loadingText}>Diagnosing...</span>
//               </div>
//             </div>
//           )}
//         </div>

//         <div style={styles.inputArea}>
//           <form onSubmit={handleSend} style={styles.form}>
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="e.g. 'My tablet's screen is flickering'..."
//               style={styles.input}
//               disabled={loading}
//             />
//             <button
//               type="submit"
//               disabled={!input.trim() || loading}
//               style={styles.sendButton}
//             >
//               <Send style={styles.icon} />
//             </button>
//           </form>

//           {lastMessage?.role === "model" &&
//             lastMessage.grounding &&
//             lastMessage.grounding.length > 0 && (
//               <div style={styles.groundingButtons}>
//                 {(() => {
//                   const webLinks = lastMessage.grounding.filter((g) => g.web);
//                   const mapLinks = lastMessage.grounding.filter((g) => g.maps);
//                   return (
//                     <>
//                       {webLinks.length > 0 && (
//                         <button style={styles.groundingButton}>
//                           <Star
//                             style={{ width: "0.75rem", height: "0.75rem" }}
//                           />
//                           Grounded Search
//                         </button>
//                       )}
//                       {mapLinks.length > 0 && (
//                         <button style={styles.groundingButton}>
//                           <Menu
//                             style={{ width: "0.75rem", height: "0.75rem" }}
//                           />
//                           Local Shop Finder
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             )}

//           <div style={styles.footerCredits}>
//             <div style={styles.creditItem}>
//               <Zap style={{ ...styles.creditIcon, color: "#d97706" }} />
//               Powered by Gemini
//             </div>
//             <div style={styles.creditItem}>
//               <Info style={{ ...styles.creditIcon, color: "#059669" }} />
//               Safe DIY Focus
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DiagnosisScreen;
