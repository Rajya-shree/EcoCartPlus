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
} from "lucide-react";
// DELETE the two separate import blocks and use this one:
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
  const [showModal, setShowModal] = useState(false); // 🟢 Controls the modal visibility
  const [isDirty, setIsDirty] = useState(false);

  const chatCanvasRef = useRef(null);
  const lastUserMsgRef = useRef(null);

  // Inside DiagnosisScreen component
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

          // We'll add this specific GET route to your backend next
          const { data } = await axios.get(
            // `http://localhost:5000/api/conversations/vault/${conversationIdFromUrl}`,
            `${BASE_URL}/conversations/vault/${conversationIdFromUrl}`,
            config,
          );

          setMessages(data.messages);
          setConversationId(data._id);
          setIsSaved(true);
        } catch (err) {
          toast.error("Failed to load vaulted session");
        }
      }
    };
    loadVaultedSession();
  }, [conversationIdFromUrl]);

  // 🟢 FEATURE: Toggle Star on a message
  const toggleStar = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].isStarred = !updatedMessages[index].isStarred;
    setMessages(updatedMessages);
    setIsSaved(false);
    setIsDirty(true);
    // If it's already vaulted, you would typically make an API call here to update the star status in the DB
  };

  // const vaultNode = async () => {
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     if (!userInfo) return toast.error("Please login to vault this session");

  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userInfo.token}`,
  //       },
  //     };

  //     const { data } = await axios.post(
  //       "/api/conversations/vault",
  //       {
  //         conversationId, // null if new, has ID if updating
  //         messages,
  //         title:
  //           messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
  //           "Hardware Diagnostic",
  //       },
  //       config,
  //     );

  //     setConversationId(data._id); // Store the ID returned by MongoDB
  //     setIsSaved(true);
  //     toast.success("Session synchronized to Vault");
  //   } catch (err) {
  //     toast.error("Vault synchronization failed");
  //   }
  // };
  // 🟢 FEATURE: Vault Node (Backend Integration)
  // 🟢 FEATURE: Vault Node (Backend Integration)
  const vaultNode = async (customTitle) => {
    try {
      // 1. Get the string from storage FIRST
      const userInfoString = localStorage.getItem("userInfo");

      if (!userInfoString) {
        return toast.error("Please login to vault this session");
      }

      // 2. Parse it into an object SECOND
      const userInfo = JSON.parse(userInfoString);
      const token = userInfo?.token;

      // 3. Now you can safely use 'token' and 'userInfo'
      console.log("Token being sent:", token);

      if (!token) {
        return toast.error("Authentication failed. Please login again.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Logical naming: Use customTitle from modal,
      // fallback to first user message, or default "Hardware Diagnostic"
      const finalTitle =
        customTitle ||
        messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
        "Hardware Diagnostic";

      // // 🟢 Ensure you are ONLY picking the data strings, not any UI elements
      // videoGrounding = vData.videos.slice(0, 4).map((v) => ({
      //   web: {
      //     url: v.url,
      //     title: v.title,
      //     thumbnail: v.thumbnail,
      //   },
      // }));

      // const cleanMessages = messages.map((msg) => ({
      //   role: msg.role,
      //   content: msg.content,
      //   timestamp: msg.timestamp,
      //   isStarred: !!msg.isStarred,
      //   // 🟢 Only send grounding if it's plain data
      //   grounding: msg.grounding
      //     ? JSON.parse(JSON.stringify(msg.grounding))
      //     : [],
      // }));
      const cleanMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        isStarred: !!msg.isStarred,
        // grounding: msg.grounding
        //   ? JSON.parse(JSON.stringify(msg.grounding))
        //   : [],
        grounding: msg.grounding
          ? JSON.parse(JSON.stringify(msg.grounding))
          : [],
      }));

      const { data } = await axios.post(
        // "/api/conversations/vault",
        `${BASE_URL}/conversations/vault`,
        {
          conversationId,
          messages: cleanMessages,
          title:
            // messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
            // "Hardware Diagnostic",
            finalTitle,
        },
        config,
      );

      setConversationId(data._id);
      setIsSaved(true);
      // toast.success("Session synchronized to Vault");4
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
  // const vaultNode = async () => {
  //   try {
  //     const userInfo = JSON.parse(userInfoString);
  //     const token = userInfo.token;

  //     const userInfoString = localStorage.getItem("userInfo");
  //     console.log("Token being sent:", userInfo?.token);
  //     if (!userInfoString)
  //       return toast.error("Please login to vault this session");

  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };

  //     const { data } = await axios.post(
  //       "/api/conversations/vault",
  //       {
  //         conversationId,
  //         messages,
  //         title:
  //           messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
  //           "Hardware Diagnostic",
  //       },
  //       config,
  //     );

  //     setConversationId(data._id);
  //     setIsSaved(true);
  //     toast.success("Session synchronized to Vault");
  //   } catch (err) {
  //     // 🟢 Better logging to find the root cause
  //     console.error("Full Axios Error Object:", err);
  //     if (err.response) {
  //       console.error("Backend Data:", err.response.data);
  //       toast.error(err.response.data.message || "Server Error");
  //     } else {
  //       console.error("Request Error:", err.message);
  //       toast.error("Network error: Server might be down");
  //     }
  //   }
  // };

  // 🟢 FEATURE: Vault Node (Save entire session)
  // const vaultNode = async () => {
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     if (!userInfo) return toast.error("Please login to vault this session");

  //     // Logic to save to your backend (adjust URL to your specific save endpoint)
  //     // await axios.post('/api/vault', { title: messages[1]?.content.slice(0,30) || "New Scan", messages }, config);

  //     setIsSaved(true);
  //     toast.success("Session synchronized to Vault");
  //   } catch (err) {
  //     toast.error("Vault synchronization failed");
  //   }
  // };

  // 🟢 FEATURE: Filter logic for showing only starred messages
  const displayedMessages = useMemo(() => {
    if (!showStarredOnly) return messages;
    // Always show the first system message + any starred ones
    return messages.filter((m, i) => i === 0 || m.isStarred);
  }, [messages, showStarredOnly]);

  const resetChat = () => {
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
    if (!chatCanvasRef.current) return console.log("This is returned");
    const { scrollTop, scrollHeight, clientHeight } = chatCanvasRef.current;
    console.log("ERTYUISNJ WEIRD hi" + scrollHeight - scrollTop - clientHeight);
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollButton(isScrolledUp);

    // if (scrollHeight - scrollTop - clientHeight > 150) {
    //   setShowScrollButton(true);
    // } else {
    //   setShowScrollButton(false);
    // }
  };

  const scrollToBottom = () => {
    if (chatCanvasRef.current) {
      chatCanvasRef.current.scrollTo({
        top: chatCanvasRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 🟢 SMART SCROLL LOGIC
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (loading) {
      scrollToBottom();
    } else if (lastMsg?.role === "model" && messages.length > 1) {
      // Scroll to the user's exact last message so they can read the bot's reply top-down
      if (lastUserMsgRef.current) {
        lastUserMsgRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        scrollToBottom();
      }
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isStarred: false,
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
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
        body: JSON.stringify({ message: userMessage.content, location }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "model",
          content: data.advice || "Trace failed.",
          grounding: data.grounding || [],
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

  // const renderGrounding = (grounding) => {
  //   if (!grounding || grounding.length === 0) return null;
  //   const webLinks = grounding.filter((g) => g.web);
  //   const mapLinks = grounding.filter((g) => g.maps);

  //   return (
  //     <div className="grounding-section">
  //       {mapLinks.length > 0 && (
  //         <Box sx={{ mb: 3 }}>
  //           <div className="grounding-header">
  //             <MapPin size={14} className="text-red" />{" "}
  //             <span>Nearby Repair Specialists</span>
  //           </div>
  //           <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
  //             {mapLinks.map((g, idx) => (
  //               <ShopMap key={idx} shop={g.maps} />
  //             ))}
  //           </Box>
  //         </Box>
  //       )}
  //       {webLinks.length > 0 && (
  //         <Box>
  //           <div className="grounding-header">
  //             <Sparkles size={14} className="text-emerald" />{" "}
  //             <span>Curated Educational Resources</span>
  //           </div>
  //           <Grid container spacing={2}>
  //             {webLinks.map((g, idx) => (
  //               <Grid item xs={12} sm={6} key={idx}>
  //                 <VideoHelpCard video={g.web} />
  //               </Grid>
  //             ))}
  //           </Grid>
  //         </Box>
  //       )}
  //     </div>
  //   );
  // };

  const renderGrounding = (grounding) => {
    if (!grounding || grounding.length === 0) return null;

    const webLinks = grounding.filter((g) => g.web);
    const mapLinks = grounding.filter((g) => g.maps);

    return (
      <div className="intelligence-grounding-container">
        {/* 🟢 MAPS SECTION: Local Specialists */}
        {mapLinks.length > 0 && (
          <div className="grounding-block">
            <div className="grounding-header-main">
              <MapPin size={18} className="text-rose" />
              <span>Nearby Restoration Specialists</span>
            </div>
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

        {/* 🟢 YOUTUBE SECTION: Visual Guides */}
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

  // const handleSend = async (e) => {
  //   e.preventDefault();
  //   if (!input.trim() || loading) return;

  //   const token = localStorage.getItem("userInfo")
  //     ? JSON.parse(localStorage.getItem("userInfo")).token
  //     : null;
  //   const userMessage = input;
  //   const timestamp = new Date().toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });

  //   setInput("");
  //   setMessages((prev) => [
  //     ...prev,
  //     { role: "user", content: userMessage, timestamp },
  //   ]);
  //   setLoading(true);
  //   setIsSaved(false);

  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const token = userInfo?.token;
  //     const res = await fetch(DIAGNOSIS_URL, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(token && { Authorization: `Bearer ${token}` }),
  //       },
  //       body: JSON.stringify({ message: userMessage, location }),
  //     });

  //     const data = await res.json();
  //     let videoGrounding = [];
  //     const aiGaveInstructions =
  //       data.advice?.toLowerCase().includes("step") ||
  //       data.advice?.toLowerCase().includes("tools");

  //     if (userMessage.length > 10 && aiGaveInstructions) {
  //       try {
  //         const vRes = await fetch(VIDEO_RECOMMENDATIONS_URL, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             ...(token && { Authorization: `Bearer ${token}` }),
  //           },
  //           body: JSON.stringify({
  //             diagnosis: data.advice,
  //             deviceName: userMessage,
  //           }),
  //         });
  //         const vData = await vRes.json();
  //         if (vData.videos?.length > 0) {
  //           videoGrounding = vData.videos.slice(0, 4).map((v) => ({
  //             web: { url: v.url, title: v.title, thumbnail: v.thumbnail },
  //           }));
  //         }
  //       } catch (vErr) {
  //         console.warn("Video failed.");
  //       }
  //     }

  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         id: Date.now() + 1,
  //         role: "model",
  //         content: data.advice || "Trace failed.",
  //         grounding: videoGrounding,
  //         timestamp: new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         }),
  //         isStarred: false,
  //         grounding: [],
  //       },
  //     ]);
  //   } catch (err) {
  //     // console.error(err);
  //     toast.error("Connection failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  // 🟢 Locate the exact index of the last user message
  const lastUserMsgIndex = messages.map((m) => m.role).lastIndexOf("user");

  return (
    <div className="pro-diagnosis-screen">
      {/* Top Header */}
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
            {/* 🟢 Star Filter Button */}
            {/* <button className="icon-btn" title="Highlight Stars">
              <Star size={20} />
            </button> */}
            <button
              className={`icon-btn ${showStarredOnly ? "active-star-filter" : ""}`}
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              title="Show Starred List"
            >
              <Star size={20} fill={showStarredOnly ? "#f59e0b" : "none"} />
            </button>

            {/* <button className="icon-btn" title="Filter">
              <MessageSquare size={20} />
            </button> */}

            {/* <button className="vault-btn">
              <Save size={16} /> <span className="hide-mobile">Vault Node</span>
            </button> */}
            {/* 🟢 Vault Node Button */}
            {/* <button
              className={`vault-btn ${isSaved ? "saved" : ""}`}
              // onClick={vaultNode}
              onClick={() => setShowModal(true)}
            >
              {isSaved ? <ShieldCheck size={16} /> : <Save size={16} />}
              <span className="hide-mobile">
                {isSaved ? "Synchronized" : "Vault Node"}
              </span>
            </button> */}
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

            {/* <button
              className="icon-btn bg-emerald-light"
              onClick={resetChat}
              title="New Session"
            >
              <Plus size={20} className="text-emerald" />
            </button> */}
            {/* <button
              className={`icon-btn ${showStarredOnly ? "active-star-filter" : ""}`}
              onClick={() => setShowStarredOnly(!showStarredOnly)}
            >
              <Star size={20} fill={showStarredOnly ? "#f59e0b" : "none"} />
            </button> */}
          </div>
        </div>
      </div>

      {/* Chat Canvas */}
      <div className="chat-canvas" ref={chatCanvasRef} onScroll={handleScroll}>
        <div className="chat-limit-container">
          {/* {messages.map((msg, i) => {
            const isLastUserMsg = i === lastUserMsgIndex; */}
          {displayedMessages.map((msg, i) => {
            const originalIndex = messages.indexOf(msg);
            const isLastUserMsg = originalIndex === lastUserMsgIndex;

            return (
              <div
                key={msg.id || i}
                className={`msg-row ${msg.role === "user" ? "user-row" : "bot-row"}`}
                ref={
                  isLastUserMsg ? lastUserMsgRef : null
                } /* 🟢 Ref Attached! */
              >
                <div className="msg-content-wrapper">
                  {/* Avatar */}
                  <div
                    className={`avatar-container ${msg.role === "user" ? "user-avatar" : "bot-avatar"}`}
                  >
                    {msg.role === "user" ? (
                      <User size={24} />
                    ) : (
                      <Bot size={24} />
                    )}
                  </div>

                  {/* Bubble & Grounding */}
                  <div className="bubble-and-actions">
                    <div
                      className={`msg-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}
                    >
                      {renderFormattedContent(msg.content, msg.role === "user")}
                      {msg.role === "model" && renderGrounding(msg.grounding)}
                    </div>

                    {/* Action Bar beneath message */}
                    <div className="msg-actions">
                      {/* <button className="action-btn"> */}
                      <button
                        className={`action-btn ${msg.isStarred ? "text-amber" : ""}`}
                        // onClick={() => toggleStar(messages.indexOf(msg))}
                        onClick={() => toggleStar(originalIndex)}
                      >
                        {/* <Star size={14} /> ADD TO VAULT */}
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

      {/* Floating Command Center */}
      <div className="floating-command-center">
        <div className="input-container relative">
          {/* 🟢 Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              className="scroll-to-bottom-btn"
              onClick={scrollToBottom}
              type="button"
            >
              <ChevronDown size={24} />
            </button>
          )}

          <form onSubmit={handleSend} className="input-form">
            <div className="terminal-icon">
              <Terminal size={28} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the fault or enter the hardware SKU..."
              className="pro-input-field"
              disabled={loading}
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
          </form>
          {/* <div className="engine-version">
            Predictive Hardware Diagnostic Engine v4.2
          </div> */}
        </div>
      </div>
      {/* 🟢 VAULT MODAL - Add this before the final closing </div> */}
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
                  vaultNode(sessionTitle); // Passes the edited title to your vaultNode function
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
