import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  User,
  Bot,
  ShieldAlert,
  Trash2,
  MapPin,
  History,
  Star,
  MessageSquare,
  Save,
  Plus,
  Share2,
  Terminal,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DIAGNOSIS_URL,
  VIDEO_RECOMMENDATIONS_URL,
  BASE_URL,
} from "../utils/constants";
import axios from "axios";
import VideoHelpCard from "../components/VideoHelpCard";
import ShopMap from "../components/ShopMap";
import { Grid, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
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
      isStarred: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 🟢 NEW: Image Upload States & Refs
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // 🟢 NEW: Handle image selection and conversion
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(",")[1];
        setSelectedImage({
          data: base64Data,
          mimeType: file.type,
          preview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const chatCanvasRef = useRef(null);
  const lastUserMsgRef = useRef(null);

  const textareaRef = useRef(null);

  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get("id");

  useEffect(() => {
    const loadVaultedSession = async () => {
      if (conversationIdFromUrl) {
        try {
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };

          const { data } = await axios.get(
            `${BASE_URL}/conversations/vault/${conversationIdFromUrl}`,
            config,
          );

          setMessages(data.messages);
          setConversationId(data._id);
          setIsSaved(true);
        } catch (err) {
          toast.error("Failed to load vaulted session");
        }
      } else {
        // 🟢 NEW: If no Vault ID, check for a temporary draft!
        const activeDraft = localStorage.getItem("ecoNova_chat_draft");
        if (activeDraft) {
          setMessages(JSON.parse(activeDraft));
        }
      }
    };
    loadVaultedSession();
  }, [conversationIdFromUrl]);

  // 🟢 NEW: Silently update the draft whenever messages change
  useEffect(() => {
    // Only save a draft if this ISN'T already a permanently vaulted session,
    // and only if they've actually started chatting (length > 1)
    if (!conversationId && messages.length > 1) {
      localStorage.setItem("ecoNova_chat_draft", JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  const toggleStar = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].isStarred = !updatedMessages[index].isStarred;
    setMessages(updatedMessages);
    setIsSaved(false);
    setIsDirty(true);
  };

  const vaultNode = async (customTitle) => {
    try {
      const userInfoString = localStorage.getItem("userInfo");

      if (!userInfoString) {
        return toast.error("Please login to vault this session");
      }

      const userInfo = JSON.parse(userInfoString);
      const token = userInfo?.token;

      if (!token) {
        return toast.error("Authentication failed. Please login again.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const finalTitle =
        customTitle ||
        messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
        "Hardware Diagnostic";

      const cleanMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        isStarred: !!msg.isStarred,
        grounding: msg.grounding
          ? JSON.parse(JSON.stringify(msg.grounding))
          : [],
      }));

      const { data } = await axios.post(
        `${BASE_URL}/conversations/vault`,
        {
          conversationId,
          messages: cleanMessages,
          title: finalTitle,
        },
        config,
      );

      setConversationId(data._id);
      setIsSaved(true);
      toast.success(`Node "${finalTitle}" Synchronized`);
    } catch (err) {
      console.error("Full Axios Error Object:", err);
      if (err.response) {
        console.error("Backend Data:", err.response.data);
        toast.error(err.response.data.message || "Server Error");
      } else {
        toast.error("Network error: Server might be down");
      }
    }
  };

  const displayedMessages = useMemo(() => {
    if (!showStarredOnly) return messages;
    return messages.filter((m, i) => i === 0 || m.isStarred);
  }, [messages, showStarredOnly]);

  const resetChat = () => {
    // 🟢 NEW: Wipe the temporary memory
    localStorage.removeItem("ecoNova_chat_draft");
    setMessages([
      {
        id: Date.now(),
        role: "model",
        content:
          "# Technical Diagnostic Node\nEcoNova Intelligence is active. Describe the hardware failure symptoms.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isStarred: false,
      },
    ]);
    setIsSaved(false);
    setShowStarredOnly(false);
    setConversationId(null);
  };

  const handleScroll = () => {
    if (!chatCanvasRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatCanvasRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 50;
    setShowScrollButton(isScrolledUp);
  };

  const scrollToBottom = () => {
    if (chatCanvasRef.current) {
      chatCanvasRef.current.scrollTo({
        top: chatCanvasRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  //   useEffect(() => {
  //     const lastMsg = messages[messages.length - 1];
  //     if (loading) {
  //       scrollToBottom();
  //     } else if (lastMsg?.role === "model" && messages.length > 1) {
  //       if (lastUserMsgRef.current) {
  //         lastUserMsgRef.current.scrollIntoView({
  //           behavior: "smooth",
  //           block: "start",
  //         });
  //       } else {
  //         scrollToBottom();
  //       }
  //     }
  //   }, [messages, loading]);

  // 🟢 FIXED: handleSend function restored with history, early-return, and accurate safety checks

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];

    // 🟢 NEW: Added a slight delay so the DOM has time to render UI blocks
    // before calculating the scroll position.
    const scrollTimeout = setTimeout(() => {
      if (loading) {
        scrollToBottom();
      } else if (lastMsg?.role === "model" && messages.length > 1) {
        if (lastUserMsgRef.current) {
          lastUserMsgRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          scrollToBottom();
        }
      }
    }, 150);

    return () => clearTimeout(scrollTimeout);
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 🟢 FIXED: Auto-generate text if they only send an image
    const userMessageContent =
      input.trim() ||
      (selectedImage ? "Analyze this image for repair advice." : "");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: userMessageContent,
      image: selectedImage ? selectedImage.preview : null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isStarred: false,
    };

    setInput("");

    const currentImage = selectedImage; // 🟢 Store temporarily for the API call
    setSelectedImage(null); // 🟢 Clear the UI preview immediately

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // We explicitly store the updated history locally before setting state
    // to pass it securely to the backend in the exact same format
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setLoading(true);
    setIsSaved(false);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const res = await fetch(DIAGNOSIS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        // 🟢 Pass history here to fix AI amnesia
        body: JSON.stringify({
          message: userMessage.content,
          history: updatedMessages,
          location,
          image: currentImage,
        }),
      });

      const data = await res.json();
      const diagnosisText = data.advice;

      // 🟢 Calculate Safety Warning AFTER text is generated
      const isSafetyWarning =
        diagnosisText?.toLowerCase().includes("for your safety") ||
        diagnosisText?.toLowerCase().includes("do not attempt");

      // Initialize grounding with Maps (if the backend sends them)
      let combinedGrounding = data.grounding || [];

      // 2. 🟢 RESTORED: Fetch Your Gemini Video Recommendations
      //   const aiGaveInstructions =
      //     diagnosisText?.toLowerCase().includes("1.") ||
      //     diagnosisText?.toLowerCase().includes("step");

      //   if (aiGaveInstructions) {
      //     try {
      //       const vRes = await fetch(VIDEO_RECOMMENDATIONS_URL, {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //           ...(token && { Authorization: `Bearer ${token}` }),
      //         },
      //         body: JSON.stringify({
      //           diagnosis: diagnosisText,
      //           deviceName: userMessage.content,
      //         }),
      //       });
      //       const vData = await vRes.json();
      //       if (vData.videos?.length > 0) {
      //         const videoGrounding = vData.videos.slice(0, 4).map((v) => ({
      //           web: { url: v.url, title: v.title, thumbnail: v.thumbnail },
      //         }));
      //         // Add Gemini videos to the map data
      //         combinedGrounding = [...combinedGrounding, ...videoGrounding];
      //       }
      //     } catch (vErr) {
      //       console.warn("Gemini Video Service skipped:", vErr);
      //     }
      //   }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "model",
          content: diagnosisText || "Trace failed.",
          grounding: data.grounding || [],
          //   grounding: combinedGrounding,
          isSafetyWarning: isSafetyWarning, // Sets the flag for rendering UI
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isStarred: false,
        },
      ]);
    } catch (err) {
      toast.error("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const renderGrounding = (grounding) => {
    if (!grounding || grounding.length === 0) return null;

    const webLinks = grounding.filter((g) => g.web);
    const mapLinks = grounding.filter((g) => g.maps);

    return (
      <div className="intelligence-grounding-container">
        {mapLinks.length > 0 && (
          <div className="grounding-block">
            <div className="grounding-header-main">
              <MapPin size={18} className="text-rose" />
              <span>Nearby Restoration Specialists</span>
            </div>
            {/* 🟢 NEW: This is where your visual map with pointers goes!
            <div
              className="map-visual-container"
              style={{
                width: "100%",
                height: "250px",
                marginBottom: "1rem",
                borderRadius: "1rem",
                overflow: "hidden",
              }}
            >
              <ShopMap shops={mapLinks} userLocation={location} />
            </div> */}
            <div className="shop-cards-stack">
              {mapLinks.map((g, idx) => (
                <div key={idx} className="shop-info-card">
                  <div className="shop-details">
                    <h4>{g.maps.title}</h4>
                    <p>{g.maps.address || "Verified Repair Center"}</p>
                  </div>
                  <button
                    className="directions-btn"
                    onClick={() =>
                      window.open(
                        g.maps.url ||
                          `https://www.google.com/maps/search/${encodeURIComponent(g.maps.title)}`,
                      )
                    }
                  >
                    DIRECTIONS
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {webLinks.length > 0 && (
          <div className="grounding-block">
            <div className="grounding-header-main">
              <Sparkles size={18} className="text-emerald" />
              <span>Technical Visual Guides</span>
            </div>
            <div className="video-grid-minimal">
              {webLinks.map((g, idx) => (
                <a
                  key={idx}
                  href={g.web.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-item-card"
                >
                  <div className="video-thumb-wrapper">
                    <img src={g.web.thumbnail} alt="Tutorial" />
                    <div className="play-hint">
                      <Plus size={20} />
                    </div>
                  </div>
                  <div className="video-meta">
                    <h5>{g.web.title}</h5>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInlineMarkdown = (text, isUser) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={i}
            className={`markdown-bold ${isUser ? "user-bold" : ""}`}
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
        <p className="pro-p text-white">
          {renderInlineMarkdown(content, true)}
        </p>
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
            <ChevronRight size={18} className="text-emerald" />{" "}
            {renderInlineMarkdown(line.replace("## ", ""), false)}
          </h2>
        );
      if (line.startsWith("* ") || line.startsWith("- "))
        return (
          <li key={i} className="pro-li">
            {renderInlineMarkdown(line.substring(2), false)}
          </li>
        );

      if (line.match(/^\d+\. /)) {
        const [num, ...rest] = line.split(". ");
        return (
          <div key={i} className="pro-numbered-list">
            <span className="pro-number-badge">{num}</span>
            <p className="pro-p">
              {renderInlineMarkdown(rest.join(". "), false)}
            </p>
          </div>
        );
      }

      if (!line.trim()) return <div key={i} className="spacer" />;
      return (
        <p key={i} className="pro-p">
          {renderInlineMarkdown(line, false)}
        </p>
      );
    });
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const lastUserMsgIndex = messages.map((m) => m.role).lastIndexOf("user");

  return (
    <div className="pro-diagnosis-screen">
      <div className="pro-sticky-header">
        <div className="header-inner">
          <div className="header-left">
            <button className="icon-btn" title="Toggle Archives">
              <History size={20} />
            </button>
            <div className="divider-v"></div>
            <h1 className="header-title">Active Investigation</h1>
          </div>

          <div className="header-right">
            <button
              className={`icon-btn ${showStarredOnly ? "active-star-filter" : ""}`}
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              title="Show Starred List"
            >
              <Star size={20} fill={showStarredOnly ? "#f59e0b" : "none"} />
            </button>

            <button
              className={`vault-btn ${isSaved ? "saved" : ""} ${isDirty ? "needs-update" : ""}`}
              onClick={() =>
                conversationId ? vaultNode(sessionTitle) : setShowModal(true)
              }
            >
              {isSaved ? <ShieldCheck size={16} /> : <Save size={16} />}
              <span className="hide-mobile">
                {isSaved
                  ? "Synchronized"
                  : conversationId
                    ? "Update Vault"
                    : "Vault Node"}
              </span>
            </button>

            <button
              className="icon-btn"
              onClick={resetChat}
              title="New Session"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="chat-canvas" ref={chatCanvasRef} onScroll={handleScroll}>
        <div className="chat-limit-container">
          {displayedMessages.map((msg, i) => {
            const originalIndex = messages.indexOf(msg);
            const isLastUserMsg = originalIndex === lastUserMsgIndex;

            return (
              <div
                key={msg.id || i}
                className={`msg-row ${msg.role === "user" ? "user-row" : "bot-row"}`}
                ref={isLastUserMsg ? lastUserMsgRef : null}
              >
                <div className="msg-content-wrapper">
                  <div
                    className={`avatar-container ${msg.role === "user" ? "user-avatar" : "bot-avatar"}`}
                  >
                    {msg.role === "user" ? (
                      <User size={24} />
                    ) : (
                      <Bot size={24} />
                    )}
                  </div>

                  <div className="bubble-and-actions">
                    {/* 🟢 FIXED: This adds a Red Border/Background class if safety warning is flagged */}
                    <div
                      className={`msg-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"} ${msg.isSafetyWarning ? "safety-alert-bubble" : ""}`}
                      style={
                        msg.isSafetyWarning
                          ? {
                              border: "1px solid #dc2626",
                              backgroundColor: "#fef2f2",
                            }
                          : {}
                      }
                    >
                      {/* 🟢 FIXED: Renders the explicit Danger Header */}
                      {/* {msg.isSafetyWarning && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#dc2626",
                            fontWeight: "bold",
                            marginBottom: "0.75rem",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}
                        >
                          <ShieldAlert size={16} />
                          Critical Safety Protocol
                        </div>
                      )} */}
                      {msg.isSafetyWarning && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#dc2626",
                            fontWeight: "bold",
                            marginBottom: "0.75rem",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}
                        >
                          <ShieldAlert size={16} />
                          Critical Safety Protocol
                        </div>
                      )}
                      {/* 🟢 NEW: Renders the user's uploaded image inside the green bubble */}
                      {msg.role === "user" && msg.image && (
                        <img
                          src={msg.image}
                          alt="User Upload"
                          className="user-uploaded-image"
                        />
                      )}
                      {renderFormattedContent(msg.content, msg.role === "user")}
                      {msg.role === "model" && renderGrounding(msg.grounding)}
                    </div>

                    <div className="msg-actions">
                      <button
                        className={`action-btn ${msg.isStarred ? "text-amber" : ""}`}
                        onClick={() => toggleStar(originalIndex)}
                      >
                        <Star
                          size={14}
                          fill={msg.isStarred ? "currentColor" : "none"}
                        />
                        {msg.isStarred ? "STARRED" : "STAR"}
                      </button>
                      <button className="action-btn">
                        <Share2 size={14} /> EXPORT
                      </button>
                      <span className="msg-timestamp">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="msg-row bot-row">
              <div className="msg-content-wrapper">
                <div className="avatar-container bot-avatar">
                  <Bot size={24} className="animate-bounce text-emerald" />
                </div>
                <div className="bubble-and-actions">
                  <div className="msg-bubble bot-bubble loading-bubble">
                    <div className="shimmer-effect"></div>
                    <div className="skeleton-line w-75"></div>
                    <div className="skeleton-line w-50"></div>
                    <div className="skeleton-line w-90"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="floating-command-center">
        {/* <div className="input-container relative">
          {showScrollButton && (
            <button
              className="scroll-to-bottom-btn"
              onClick={scrollToBottom}
              type="button"
            >
              <ChevronDown size={24} />
            </button>
          )}

          {/* <form onSubmit={handleSend} className="input-form">
            <div className="terminal-icon">
              <Terminal size={28} />
            </div>
            {/* <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the fault or enter the hardware SKU..."
              className="pro-input-field"
              disabled={loading}
            /> 
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Submit instantly on Enter. Allow new lines with Shift+Enter.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !loading) {
                    handleSend(e);
                  }
                }
              }}
              placeholder="Describe the fault or enter the hardware SKU... (Shift+Enter for new line)"
              className="pro-input-field"
              disabled={loading}
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="initiate-btn"
            >
              {loading ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : (
                <Sparkles size={24} />
              )}
              <span className="hide-mobile">Initiate Trace</span>
            </button>
          </form> //

          <form onSubmit={handleSend} className="modern-input-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !loading) {
                    handleSend(e);
                  }
                }
              }}
              placeholder="Describe the fault or attach an image..."
              className="modern-textarea"
              disabled={loading}
              rows={1}
            />

            <div className="modern-action-row">
              <div className="action-left">
                {/* Hidden file input mapped to the Plus icon 
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) =>
                    console.log("File selected:", e.target.files[0])
                  }
                />
                <label
                  htmlFor="file-upload"
                  className="attach-icon-btn"
                  title="Attach Image"
                >
                  <Plus size={20} />
                </label>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="modern-send-btn"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
              </button>
            </div>
          </form>
        </div> */}
        <div className="input-container relative">
          {showScrollButton && (
            <button
              className="scroll-to-bottom-btn"
              onClick={scrollToBottom}
              type="button"
            >
              <ChevronDown size={24} />
            </button>
          )}

          {/* 🟢 NEW: The floating image preview thumbnail */}
          {selectedImage && (
            <div className="image-preview-container">
              <div className="preview-wrapper">
                <img src={selectedImage.preview} alt="Upload preview" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="preview-remove-btn"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="modern-input-form">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // 🟢 FIXED: Allow enter key if there is text OR an image
                  if ((input.trim() || selectedImage) && !loading) {
                    handleSend(e);
                  }
                }
              }}
              placeholder="Describe the fault or attach an image..."
              className="modern-textarea"
              disabled={loading}
              rows={1}
            />

            <div className="modern-action-row">
              <div className="action-left">
                {/* 🟢 FIXED: Wired to the fileInputRef and handleImageUpload */}
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="attach-icon-btn"
                  title="Attach Image"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* 🟢 FIXED: Enabled if there is text OR an image */}
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || loading}
                className="modern-send-btn"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="vault-modal-overlay">
          <div className="vault-modal-content animate-in">
            <div className="modal-icon-header">
              <Save size={32} className="text-emerald" />
            </div>
            <h2>Vault Investigation</h2>
            <p>
              Confirm the designation for this technical node before committing
              to the dashboard.
            </p>

            <div className="modal-input-group">
              <label>SESSION TITLE</label>
              <input
                type="text"
                placeholder="Enter node identifier..."
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                CANCEL
              </button>
              <button
                className="confirm-btn"
                onClick={() => {
                  vaultNode(sessionTitle);
                  setShowModal(false);
                }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisScreen;
