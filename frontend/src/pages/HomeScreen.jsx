import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  ArrowUpRight,
  Wrench,
  ShieldCheck,
  Search,
  Zap,
  ChevronRight,
  Leaf,
  History,
  AlertCircle,
  TrendingUp,
  Recycle,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import "./HomeScreen.css";
import { BASE_URL } from "../utils/constants";

const INSIGHTS = [
  {
    id: 1,
    quote:
      "Sustainable asset lifecycle management prevents 50M tons of hazardous e-waste globally every year.",
    desktop:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&h=400&fit=crop",
    tablet:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&h=400&fit=crop",
    mobile:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&h=600&fit=crop",
  },
  {
    id: 2,
    quote:
      "Repairing a single device saves up to 80kg of CO2 emissions compared to manufacturing a new one.",
    desktop:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&h=400&fit=crop",
    tablet:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&h=400&fit=crop",
    mobile:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&h=600&fit=crop",
  },
  {
    id: 3,
    quote:
      "The circular economy isn't just about recycling; it's about extending the heartbeat of our technology.",
    desktop:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1600&h=400&fit=crop",
    tablet:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=800&h=400&fit=crop",
    mobile:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=600&h=600&fit=crop",
  },
];

const HomeScreen = () => {
  const { devices = [] } = useOutletContext();
  const navigate = useNavigate();
  // Moving Slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return; // Pause slider when user hovers/holds

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INSIGHTS.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [isPaused]);

  // 🟢 NEW STATE: For Vaulted Sessions
  const [savedSessions, setSavedSessions] = useState([]);
  const [loadingVault, setLoadingVault] = useState(true);

  // 🟢 FETCH VAULT DATA
  useEffect(() => {
    const fetchVault = async () => {
      try {
        const userInfoString = localStorage.getItem("userInfo");
        if (!userInfoString) return console.log("No user found in storage");

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        // const { data } = await axios.get("/api/conversations/vault", config);
        const { data } = await axios.get(
          `${BASE_URL}/conversations/vault`,
          config,
        );
        console.log("Vault sessions found:", data.length);
        setSavedSessions(data.slice(0, 5)); // Show latest 5
      } catch (err) {
        console.error("Vault fetch failed", err);
      } finally {
        setLoadingVault(false);
      }
    };
    fetchVault();
  }, []);

  // Dynamic calculations from your current logic
  const totalRepairs = devices.reduce(
    (acc, dev) => acc + (dev.repairsDone || 0),
    0,
  );
  const avgEcoScore =
    devices.length > 0
      ? (
          devices.reduce((acc, dev) => acc + (dev.ecoScore || 0), 0) /
          devices.length
        ).toFixed(0)
      : 0;

  // Tasks logic adjusted for Command Hub Priority Queue
  const pendingTasks = devices
    .flatMap((dev) =>
      (dev.maintenanceTasks || [])
        .filter((t) => !t.isCompleted)
        .map((t) => ({ ...t, deviceName: dev.deviceName })),
    )
    .slice(0, 4);

  const isEmpty = devices.length === 0;

  // return (
  //   <div className="command-hub-container animate-in">
  //     <header className="hub-header">
  //       <h1 className="hub-title">Command Hub</h1>
  //       <p className="hub-subtitle">
  //         Platform oversight and asset lifecycle synchronization.
  //       </p>
  //     </header>

  //     {isEmpty ? (
  //       <div className="empty-state-grid">
  //         <div
  //           className="action-card group"
  //           onClick={() => navigate("/green-shopping")}
  //         >
  //           <div className="icon-box-emerald">
  //             <Search size={32} />
  //           </div>
  //           <h3>Green Advisor</h3>
  //           <p>
  //             Audit sustainability metrics and lifecycle repairability for
  //             hardware assets.
  //           </p>
  //           <div className="action-footer">
  //             Launch Search <ArrowUpRight size={18} />
  //           </div>
  //         </div>

  //         <div
  //           className="action-card group"
  //           onClick={() => navigate("/diagnosis")}
  //         >
  //           <div className="icon-box-emerald">
  //             <Zap size={32} />
  //           </div>
  //           <h3>Repair AI</h3>
  //           <p>
  //             Consult technical restoration protocols and diagnostic logic for
  //             hardware faults.
  //           </p>
  //           <div className="action-footer">
  //             Consult Intelligence <ArrowUpRight size={18} />
  //           </div>
  //         </div>
  //         {/* New Monitoring Grid for Specific Needs */}
  //         <div className="hub-metrics-grid animate-in">
  //           <div className="metric-card">
  //             <div className="metric-header">
  //               <AlertCircle className="text-rose-500" size={18} />
  //               <span>Urgent Fixes</span>
  //             </div>
  //             <div className="metric-value">
  //               {devices.filter((d) => d.ecoScore < 50).length}
  //             </div>
  //             <p className="metric-desc">
  //               Critical hardware assets requiring restoration.
  //             </p>
  //           </div>

  //           <div className="metric-card">
  //             <div className="metric-header">
  //               <Leaf className="text-emerald-500" size={18} />
  //               <span>Green Savings</span>
  //             </div>
  //             <div className="metric-value">₹4,200</div>
  //             <p className="metric-desc">
  //               Estimated value saved through DIY repairs.
  //             </p>
  //           </div>
  //         </div>

  //         {/* Existing Action Cards follow below... */}
  //       </div>
  //     ) : (
  //       <div className="hub-layout-grid">
  //         {/* Left Column: Stats & Priority Queue */}
  //         <div className="hub-main-col">
  //           {/* 4-Column Stats Row */}
  //           <div className="stats-row">
  //             {[
  //               {
  //                 label: "E-Waste Saved",
  //                 value: "12.4kg",
  //                 icon: <Recycle />,
  //                 color: "emerald",
  //               },
  //               {
  //                 label: "Repairs Done",
  //                 value: totalRepairs,
  //                 icon: <TrendingUp />,
  //                 color: "orange",
  //               },
  //               {
  //                 label: "Repair Score",
  //                 value: `${avgEcoScore}/100`,
  //                 icon: <Zap />,
  //                 color: "blue",
  //               },
  //               {
  //                 label: "Active Devices",
  //                 value: devices.length,
  //                 icon: <Smartphone />,
  //                 color: "purple",
  //               },
  //             ].map((stat, i) => (
  //               <div key={i} className={`stat-pill ${stat.color}`}>
  //                 <div className="stat-icon">{stat.icon}</div>
  //                 <div className="stat-info">
  //                   <span className="stat-label">{stat.label}</span>
  //                   <span className="stat-value">{stat.value}</span>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>

  //           {/* Priority Queue Section */}
  //           <section className="hub-section">
  //             <div className="section-header">
  //               <div>
  //                 <h3>Priority Queue</h3>
  //                 <p className="tagline">Active Maintenance Nodes</p>
  //               </div>
  //               {pendingTasks.length > 0 && (
  //                 <span className="status-badge-rose">
  //                   {pendingTasks.length} Tasks Pending
  //                 </span>
  //               )}
  //             </div>

  //             <div className="task-list">
  //               {pendingTasks.length === 0 ? (
  //                 <div className="operational-state">
  //                   <ShieldCheck size={48} className="text-emerald" />
  //                   <h4>System Operational</h4>
  //                   <p>Lifecycle health is within optimal parameters.</p>
  //                 </div>
  //               ) : (
  //                 pendingTasks.map((task, idx) => (
  //                   <div
  //                     key={idx}
  //                     className="task-item"
  //                     onClick={() => navigate("/lifecycle")}
  //                   >
  //                     <div className="task-left">
  //                       <div className="task-icon-bg">
  //                         <Wrench size={20} />
  //                       </div>
  //                       <div>
  //                         <h4>{task.label || "General Maintenance"}</h4>
  //                         <p className="task-meta">{task.deviceName}</p>
  //                       </div>
  //                     </div>
  //                     <button className="chevron-btn">
  //                       <ChevronRight size={20} />
  //                     </button>
  //                   </div>
  //                 ))
  //               )}
  //             </div>
  //           </section>
  //         </div>

  //         {/* Right Column: Insight Widget */}
  //         {/* <aside className="hub-side-col">
  //           <div className="insight-widget">
  //             <Leaf className="leaf-icon" />
  //             <h4 className="insight-tag">Environment Insight</h4>
  //             <p className="insight-text">
  //               "Sustainable asset lifecycle management prevents 50M tons of
  //               hazardous e-waste globally every year."
  //             </p>
  //             <div className="insight-footer">
  //               <div className="accent-line" />
  //               <span>Intelligence Directive</span>
  //             </div>
  //             <Zap className="bg-zap-icon" />
  //           </div>
  //         </aside> */}
  //         {/* 🟢 UPDATED RIGHT COLUMN: Insight + Technical Vault */}
  //         <aside className="hub-side-col">
  //           {/* 1. Technical Vault Widget */}
  //           <div className="vault-widget-card">
  //             <div className="vault-card-header">
  //               <History size={18} className="text-emerald-500" />
  //               <h3>Technical Vault</h3>
  //             </div>

  //             <div className="vault-list">
  //               {loadingVault ? (
  //                 <div className="vault-loading">Synchronizing Nodes...</div>
  //               ) : savedSessions.length === 0 ? (
  //                 <div className="vault-empty">
  //                   <MessageSquare size={32} />
  //                   <p>No vaulted sessions detected.</p>
  //                 </div>
  //               ) : (
  //                 savedSessions.map((session) => (
  //                   <div
  //                     key={session._id}
  //                     className="vault-item"
  //                     onClick={() => navigate(`/diagnosis?id=${session._id}`)} // 🟢 Navigate to specific session
  //                   >
  //                     <div className="vault-info">
  //                       <span className="vault-title">{session.title}</span>
  //                       <span className="vault-date">
  //                         {new Date(session.updatedAt).toLocaleDateString()}
  //                       </span>
  //                     </div>
  //                     <ChevronRight size={16} />
  //                   </div>
  //                 ))
  //               )}
  //             </div>
  //             <button
  //               className="view-all-vault"
  //               onClick={() => navigate("/vault-archives")}
  //             >
  //               Access Full Archives
  //             </button>
  //           </div>

  //           {/* 2. Insight Widget (Your existing one) */}
  //           <div className="insight-widget">
  //             <Leaf className="leaf-icon" />
  //             <h4 className="insight-tag">Environment Insight</h4>
  //             <p className="insight-text">
  //               "Sustainable asset lifecycle management prevents 50M tons of
  //               hazardous e-waste globally."
  //             </p>
  //             <Zap className="bg-zap-icon" />
  //           </div>
  //         </aside>
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <div className="command-hub-container animate-in">
      <header className="hub-header">
        <h1 className="hub-title">Command Hub</h1>
        <p className="hub-subtitle">
          Platform oversight and asset lifecycle synchronization.
        </p>
      </header>

      {/* 🟢 NEW: FULL-WIDTH DYNAMIC SLIDER INSERTED HERE */}
      <div
        className="insight-hero-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {INSIGHTS.map((insight, index) => (
          <div
            key={insight.id}
            className={`insight-slide ${index === currentSlide ? "active" : ""}`}
          >
            {/* Responsive Images using Picture Tag */}
            <picture>
              <source media="(max-width: 600px)" srcSet={insight.mobile} />
              <source media="(max-width: 1024px)" srcSet={insight.tablet} />
              <img
                src={insight.desktop}
                alt="Nature Background"
                className="slide-bg"
              />
            </picture>

            {/* Dark Overlay for Text Readability */}
            <div className="slide-overlay"></div>

            {/* Content */}
            <div className="slide-content">
              <div className="slide-badge">
                <Leaf size={14} />
                <span>ENVIRONMENT INSIGHT</span>
              </div>

              <h2 className="slide-quote">"{insight.quote}"</h2>

              <div className="slide-footer">
                <div className="directive-bar"></div>
                <span>INTELLIGENCE DIRECTIVE</span>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination Dots */}
        <div className="slider-dots">
          {INSIGHTS.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </div>
      {/* 🟢 END OF SLIDER */}

      <div className="hub-layout-grid">
        {/* LEFT COLUMN: Stats & Priority Queue OR Empty State */}
        <div className="hub-main-col">
          {isEmpty ? (
            <div className="empty-state-inner-grid">
              <div
                className="action-card group"
                onClick={() => navigate("/green-shopping")}
              >
                <div className="icon-box-emerald">
                  <Search size={32} />
                </div>
                <h3>Green Advisor</h3>
                <p>
                  Audit sustainability metrics and lifecycle repairability for
                  hardware assets.
                </p>
                <div className="action-footer">
                  Launch Search <ArrowUpRight size={18} />
                </div>
              </div>

              <div
                className="action-card group"
                onClick={() => navigate("/diagnosis")}
              >
                <div className="icon-box-emerald">
                  <Zap size={32} />
                </div>
                <h3>Repair AI</h3>
                <p>
                  Consult technical restoration protocols and diagnostic logic
                  for hardware faults.
                </p>
                <div className="action-footer">
                  Consult Intelligence <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 4-Column Stats Row */}
              <div className="stats-row">
                {[
                  {
                    label: "E-Waste Saved",
                    value: "12.4kg",
                    icon: <Recycle />,
                    color: "emerald",
                  },
                  {
                    label: "Repairs Done",
                    value: totalRepairs,
                    icon: <TrendingUp />,
                    color: "orange",
                  },
                  {
                    label: "Repair Score",
                    value: `${avgEcoScore}/100`,
                    icon: <Zap />,
                    color: "blue",
                  },
                  {
                    label: "Active Devices",
                    value: devices.length,
                    icon: <Smartphone />,
                    color: "purple",
                  },
                ].map((stat, i) => (
                  <div key={i} className={`stat-pill ${stat.color}`}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-info">
                      <span className="stat-label">{stat.label}</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Priority Queue Section */}
              <section className="hub-section">
                <div className="section-header">
                  <div>
                    <h3>Priority Queue</h3>
                    <p className="tagline">Active Maintenance Nodes</p>
                  </div>
                  {pendingTasks.length > 0 && (
                    <span className="status-badge-rose">
                      {pendingTasks.length} Tasks Pending
                    </span>
                  )}
                </div>

                <div className="task-list">
                  {pendingTasks.length === 0 ? (
                    <div className="operational-state">
                      <ShieldCheck size={48} className="text-emerald" />
                      <h4>System Operational</h4>
                      <p>Lifecycle health is within optimal parameters.</p>
                    </div>
                  ) : (
                    pendingTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="task-item"
                        onClick={() => navigate("/lifecycle")}
                      >
                        <div className="task-left">
                          <div className="task-icon-bg">
                            <Wrench size={20} />
                          </div>
                          <div>
                            <h4>{task.label || "General Maintenance"}</h4>
                            <p className="task-meta">{task.deviceName}</p>
                          </div>
                        </div>
                        <button className="chevron-btn">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Technical Vault & Insight Widget (Always Visible) */}
        <aside className="hub-side-col">
          {/* 1. Technical Vault Widget */}
          <div className="vault-widget-card">
            <div className="vault-card-header">
              <History size={18} className="text-emerald-500" />
              <h3>Technical Vault</h3>
            </div>

            <div className="vault-list">
              {loadingVault ? (
                <div className="vault-loading">Synchronizing Nodes...</div>
              ) : savedSessions.length === 0 ? (
                <div
                  className="vault-empty"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#94a3b8",
                  }}
                >
                  <MessageSquare
                    size={32}
                    style={{ margin: "0 auto 10px", opacity: 0.5 }}
                  />
                  <p style={{ fontSize: "0.8rem" }}>
                    No vaulted sessions detected.
                  </p>
                </div>
              ) : (
                savedSessions.map((session) => (
                  <div
                    key={session._id}
                    className="vault-item"
                    onClick={() => navigate(`/diagnosis?id=${session._id}`)}
                  >
                    <div className="vault-info">
                      <span className="vault-title">{session.title}</span>
                      <span className="vault-date">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))
              )}
            </div>
            <button
              className="view-all-vault"
              onClick={() => navigate("/vault-archives")}
            >
              Access Full Archives
            </button>
          </div>

          {/* 2. Insight Widget */}
          {/* <div className="insight-widget">
            <Leaf className="leaf-icon" />
            <h4 className="insight-tag">Environment Insight</h4>
            <p className="insight-text">
              "Sustainable asset lifecycle management prevents 50M tons of
              hazardous e-waste globally every year."
            </p>
            <div className="insight-footer">
              <div className="accent-line" />
              <span>Intelligence Directive</span>
            </div>
            <Zap className="bg-zap-icon" />
          </div> */}
        </aside>
      </div>
    </div>
  );
};

export default HomeScreen;

// import React from "react";
// import { useNavigate, useOutletContext } from "react-router-dom";
// import {
//   Wrench,
//   ShieldCheck,
//   Search,
//   Leaf,
//   MessageSquare,
//   History,
//   Trash2,
//   ArrowUpRight,
//   Zap,
//   Recycle,
//   TrendingUp,
//   Smartphone,
//   Clock,
//   ChevronRight,
//   AlertCircle,
//   Battery,
// } from "lucide-react";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// import {
//   Box,
//   Typography,
//   Button,
//   Grid,
//   Card,
//   CardContent,
//   Chip,
//   Divider,
// } from "@mui/material";
// import "./HomeScreen.css"; // We'll create/update this

// const HomeScreen = () => {
//   const { devices = [] } = useOutletContext();
//   const navigate = useNavigate();

//   const savedProducts = []; // ← replace later with real data if you add watchlist
//   const savedSessions = []; // ← same for repair AI chat history

//   const pendingCount = devices.reduce((sum, d) => {
//     return sum + 0; // placeholder
//   }, 0);

//   const isEmpty =
//     devices.length === 0 &&
//     savedProducts.length === 0 &&
//     savedSessions.length === 0;

//   // Your existing dynamic logic (unchanged)
//   const totalRepairs = devices.reduce(
//     (acc, dev) => acc + (dev.repairsDone || 0),
//     0,
//   );
//   const avgEcoScore =
//     devices.length > 0
//       ? (
//           devices.reduce((acc, dev) => acc + (dev.ecoScore || 0), 0) /
//           devices.length
//         ).toFixed(0)
//       : 0;

//   const stats = [
//     {
//       label: "E-Waste Saved",
//       value: "12.4kg",
//       icon: <Recycle size={24} />,
//       color: "emerald",
//     },
//     {
//       label: "Repairs Done",
//       value: totalRepairs.toString(),
//       icon: <TrendingUp size={24} />,
//       color: "orange",
//     },
//     {
//       label: "Repair Score",
//       value: `${avgEcoScore}/100`,
//       icon: <Zap size={24} />,
//       color: "blue",
//     },
//     {
//       label: "Active Devices",
//       value: devices.length.toString(),
//       icon: <Smartphone size={24} />,
//       color: "purple",
//     },
//   ];

//   const pieData = [
//     {
//       name: "Good",
//       value: devices.filter((d) => d.ecoScore >= 80).length,
//       color: "#10b981",
//     },
//     {
//       name: "Fair",
//       value: devices.filter((d) => d.ecoScore < 80 && d.ecoScore >= 50).length,
//       color: "#f59e0b",
//     },
//     {
//       name: "Poor",
//       value: devices.filter((d) => d.ecoScore < 50).length,
//       color: "#ef4444",
//     },
//   ];

//   const priorityTasks = devices.slice(0, 3).map((device, index) => {
//     const tasks = [
//       {
//         name: "Dust Vents & Internal Cleaning",
//         urgency: "High",
//         icon: AlertCircle,
//         color: "rose",
//       },
//       {
//         name: "Battery Calibration Cycle",
//         urgency: "Medium",
//         icon: Clock,
//         color: "amber",
//       },
//       {
//         name: "System Optimization",
//         urgency: "Scheduled",
//         icon: Zap,
//         color: "emerald",
//       },
//     ];
//     return { ...tasks[index], id: device._id, device: device.deviceName };
//   });

//   return (
//     // <Box className="dashboard-wrapper animate-in">
//     //   {/* Header */}
//     //   <Box className="dashboard-header">
//     //     <Box>
//     //       <Typography
//     //         variant="h3"
//     //         component="h1"
//     //         className="dashboard-title font-outfit"
//     //       >
//     //         Command Hub
//     //       </Typography>
//     //       <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
//     //         Platform oversight and asset lifecycle synchronization.
//     //       </Typography>
//     //     </Box>
//     //     <Button
//     //       variant="contained"
//     //       startIcon={<Zap />}
//     //       className="quick-scan-btn"
//     //       onClick={() => navigate("/repair-ai")} // or wherever quick scan should go
//     //     >
//     //       Quick Scan
//     //     </Button>
//     //   </Box>

//     //   {/* Stats Cards */}
//     //   <Grid container spacing={3} sx={{ mb: 5 }}>
//     //     {stats.map((stat, i) => (
//     //       <Grid item xs={6} sm={6} md={3} key={i}>
//     //         <Card className={`stat-card ${stat.color}`}>
//     //           <CardContent
//     //             sx={{ display: "flex", alignItems: "center", gap: 2 }}
//     //           >
//     //             <Box className={`stat-icon ${stat.color}`}>{stat.icon}</Box>
//     //             <Box>
//     //               <Typography variant="caption" className="stat-label">
//     //                 {stat.label}
//     //               </Typography>
//     //               <Typography variant="h5" className="stat-value font-outfit">
//     //                 {stat.value}
//     //               </Typography>
//     //             </Box>
//     //           </CardContent>
//     //         </Card>
//     //       </Grid>
//     //     ))}
//     //   </Grid>

//     //   <Grid container spacing={4}>
//     //     {/* Device Health Matrix (Pie Chart) */}
//     //     <Grid item xs={12} lg={6}>
//     //       <Card className="section-card">
//     //         <CardContent>
//     //           <Box className="section-header">
//     //             <Typography variant="h5" className="section-title font-outfit">
//     //               Device Health Matrix
//     //             </Typography>
//     //             <Chip
//     //               label="Visual Audit"
//     //               size="small"
//     //               className="audit-chip"
//     //             />
//     //           </Box>
//     //           <Box sx={{ height: 300, mt: 3 }}>
//     //             <ResponsiveContainer width="100%" height="100%">
//     //               <PieChart>
//     //                 <Pie
//     //                   data={pieData}
//     //                   innerRadius={80}
//     //                   outerRadius={110}
//     //                   paddingAngle={10}
//     //                   dataKey="value"
//     //                 >
//     //                   {pieData.map((entry, index) => (
//     //                     <Cell key={`cell-${index}`} fill={entry.color} />
//     //                   ))}
//     //                 </Pie>
//     //                 <Tooltip />
//     //               </PieChart>
//     //             </ResponsiveContainer>
//     //           </Box>
//     //           <Box className="pie-legend">
//     //             {pieData.map((d, i) => (
//     //               <Box key={i} className="legend-item">
//     //                 <Box
//     //                   sx={{
//     //                     width: 12,
//     //                     height: 4,
//     //                     backgroundColor: d.color,
//     //                     borderRadius: 2,
//     //                   }}
//     //                 />
//     //                 <Typography variant="caption" className="legend-label">
//     //                   {d.name}
//     //                 </Typography>
//     //                 <Typography variant="body2" fontWeight={700}>
//     //                   {d.value} Units
//     //                 </Typography>
//     //               </Box>
//     //             ))}
//     //           </Box>
//     //         </CardContent>
//     //       </Card>
//     //     </Grid>

//     //     {/* Priority Actions */}
//     //     <Grid item xs={12} lg={6}>
//     //       <Card className="section-card">
//     //         <CardContent>
//     //           <Box className="section-header">
//     //             <Typography variant="h5" className="section-title font-outfit">
//     //               Priority Actions
//     //             </Typography>
//     //             <Chip
//     //               icon={<Zap size={16} />}
//     //               label="Live Tasks"
//     //               size="small"
//     //               className="live-tasks-chip"
//     //             />
//     //           </Box>

//     //           <Box sx={{ mt: 3 }}>
//     //             {priorityTasks.length > 0 ? (
//     //               priorityTasks.map((item) => (
//     //                 <Card
//     //                   key={item.id}
//     //                   variant="outlined"
//     //                   className="action-item"
//     //                   onClick={() => navigate("/lifecycle")}
//     //                 >
//     //                   <CardContent
//     //                     sx={{
//     //                       display: "flex",
//     //                       alignItems: "center",
//     //                       justifyContent: "space-between",
//     //                       p: 2,
//     //                     }}
//     //                   >
//     //                     <Box
//     //                       sx={{ display: "flex", alignItems: "center", gap: 2 }}
//     //                     >
//     //                       <Box className={`action-icon ${item.color}`}>
//     //                         <item.icon size={24} />
//     //                       </Box>
//     //                       <Box>
//     //                         <Typography variant="subtitle1" fontWeight={700}>
//     //                           {item.name}
//     //                         </Typography>
//     //                         <Typography
//     //                           variant="caption"
//     //                           color="text.secondary"
//     //                         >
//     //                           {item.device}
//     //                         </Typography>
//     //                       </Box>
//     //                     </Box>
//     //                     <Box
//     //                       sx={{
//     //                         display: "flex",
//     //                         alignItems: "center",
//     //                         gap: 1.5,
//     //                       }}
//     //                     >
//     //                       <Chip
//     //                         label={item.urgency}
//     //                         size="small"
//     //                         className={`urgency-chip ${item.urgency.toLowerCase()}`}
//     //                       />
//     //                       <ChevronRight size={20} color="#94a3b8" />
//     //                     </Box>
//     //                   </CardContent>
//     //                 </Card>
//     //               ))
//     //             ) : (
//     //               <Typography textAlign="center" color="text.secondary" py={6}>
//     //                 No active devices found.
//     //               </Typography>
//     //             )}
//     //           </Box>

//     //           <Divider sx={{ my: 3 }} />

//     //           <Box className="quote-box">
//     //             <Typography
//     //               variant="body2"
//     //               fontStyle="italic"
//     //               color="text.secondary"
//     //             >
//     //               "Proactive maintenance reduces hardware failure by 40%
//     //               annually."
//     //             </Typography>
//     //           </Box>
//     //         </CardContent>
//     //       </Card>
//     //     </Grid>
//     //   </Grid>

//     //   {/* Bottom Sustainability Banner */}
//     //   <Card className="banner-card">
//     //     <CardContent className="banner-content">
//     //       <Chip
//     //         label="SUSTAINABILITY FACT"
//     //         className="fact-chip"
//     //         size="small"
//     //       />
//     //       <Typography variant="h4" className="banner-title font-outfit">
//     //         Revive, don't replace.
//     //       </Typography>
//     //       <Typography variant="body1" className="banner-text">
//     //         Repairing a single laptop instead of buying a new one saves 1,200kg
//     //         of raw materials and prevents 150kg of CO₂.
//     //       </Typography>
//     //       <Button
//     //         variant="contained"
//     //         size="large"
//     //         className="banner-btn"
//     //         onClick={() => navigate("/repair-ai")}
//     //       >
//     //         Start Repair Guide
//     //       </Button>
//     //     </CardContent>
//     //     <Recycle className="banner-bg-icon" />
//     //   </Card>
//     // </Box>

//     <div className="home-command-hub animate-in">
//       <header className="mb-10 md:mb-12">
//         <h1 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight text-gray-900">
//           Command Hub
//         </h1>
//         <p className="mt-1.5 text-base text-gray-500 font-medium">
//           Platform oversight and asset lifecycle synchronization.
//         </p>
//       </header>

//       {isEmpty ? (
//         // ── Empty state ────────────────────────────────────────────────
//         <div className="grid gap-8 md:grid-cols-2">
//           <div
//             onClick={() => navigate("/green-shopping")}
//             className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 md:p-12 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
//           >
//             <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
//               <Search size={32} />
//             </div>
//             <h3 className="mb-3 text-3xl font-bold font-outfit text-gray-900">
//               Green Advisor
//             </h3>
//             <p className="text-base leading-relaxed text-gray-500">
//               Audit sustainability metrics and lifecycle repairability for
//               hardware assets.
//             </p>
//             <div className="mt-10 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-600">
//               Launch Advisor <ArrowUpRight size={20} />
//             </div>
//           </div>

//           <div
//             onClick={() => navigate("/diagnosis")}
//             className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 md:p-12 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
//           >
//             <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
//               <Zap size={32} />
//             </div>
//             <h3 className="mb-3 text-3xl font-bold font-outfit text-gray-900">
//               Repair Intelligence
//             </h3>
//             <p className="text-base leading-relaxed text-gray-500">
//               Consult technical restoration protocols and diagnostic logic for
//               hardware faults.
//             </p>
//             <div className="mt-10 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-600">
//               Start Diagnosis <ArrowUpRight size={20} />
//             </div>
//           </div>
//         </div>
//       ) : (
//         // ── Logged-in + has data ───────────────────────────────────────
//         <div className="grid gap-10 xl:grid-cols-12">
//           <div className="space-y-10 xl:col-span-8">
//             {/* Priority Queue */}
//             <section className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
//               <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
//                 <div>
//                   <h3 className="text-2xl font-bold font-outfit text-gray-900">
//                     Priority Queue
//                   </h3>
//                   <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
//                     Active Maintenance Nodes
//                   </p>
//                 </div>
//                 {pendingCount > 0 && (
//                   <span className="rounded-full border border-rose-100 bg-rose-50 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-600">
//                     {pendingCount} Tasks Pending
//                   </span>
//                 )}
//               </div>

//               <div className="space-y-4">
//                 {pendingCount === 0 ? (
//                   <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 py-16 text-center">
//                     <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
//                     <h4 className="text-base font-bold uppercase tracking-widest text-emerald-900">
//                       All Systems Nominal
//                     </h4>
//                     <p className="mt-2 text-sm text-emerald-700/80">
//                       No pending maintenance tasks detected.
//                     </p>
//                   </div>
//                 ) : (
//                   // You would map real tasks here when you have them
//                   <div className="rounded-3xl bg-gray-50/40 p-8 text-center text-gray-500">
//                     Maintenance task visualization coming soon...
//                   </div>
//                 )}
//               </div>
//             </section>

//             {/* Green Watchlist / Saved Products */}
//             <section className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
//               <h3 className="mb-8 text-2xl font-bold font-outfit text-gray-900">
//                 Green Watchlist
//               </h3>
//               {savedProducts.length === 0 ? (
//                 <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-16 text-center">
//                   <p className="text-sm font-bold uppercase tracking-widest text-gray-400/80">
//                     No products saved yet
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                   {/* map savedProducts here when you have them */}
//                 </div>
//               )}
//             </section>
//           </div>

//           {/* Right column – Technical Vault + Insight */}
//           <aside className="space-y-10 xl:col-span-4">
//             {/* Technical Vault (saved repair sessions) */}
//             <div className="flex min-h-[480px] flex-col rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
//               <h3 className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-gray-900 font-outfit">
//                 <History className="h-5 w-5 text-emerald-600" /> Technical Vault
//               </h3>
//               {savedSessions.length === 0 ? (
//                 <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
//                   <MessageSquare className="mb-4 h-10 w-10 text-gray-200" />
//                   <p className="text-sm font-medium italic leading-relaxed text-gray-400">
//                     Saved Repair AI sessions appear here.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {/* map savedSessions here later */}
//                 </div>
//               )}
//             </div>

//             {/* Insight block */}
//             <div className="group relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-10 text-white shadow-2xl md:p-12">
//               <Leaf className="mb-8 h-10 w-10 text-emerald-400 transition-transform group-hover:rotate-12" />
//               <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400">
//                 Environment Insight
//               </h4>
//               <p className="text-xl font-semibold leading-relaxed font-outfit">
//                 Sustainable lifecycle management prevents millions of tons of
//                 e-waste annually.
//               </p>
//               <div className="mt-10 flex items-center gap-4">
//                 <div className="h-1 w-12 rounded-full bg-emerald-500" />
//                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
//                   Core Directive
//                 </span>
//               </div>
//             </div>
//           </aside>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomeScreen;

// Old UI
// import React from "react";
// import { useNavigate, useOutletContext } from "react-router-dom";
// import {
//   Zap,
//   Recycle,
//   TrendingUp,
//   Smartphone,
//   Clock,
//   ChevronRight,
//   AlertCircle,
//   Battery,
// } from "lucide-react";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// import "./HomeScreen.css";

// const HomeScreen = () => {
//   const { devices = [] } = useOutletContext();
//   const navigate = useNavigate();

//   // --- 🟢 DYNAMIC LOGIC (Preserving your variable names) ---
//   const totalRepairs = devices.reduce(
//     (acc, dev) => acc + (dev.repairsDone || 0),
//     0,
//   );
//   const avgEcoScore =
//     devices.length > 0
//       ? (
//           devices.reduce((acc, dev) => acc + (dev.ecoScore || 0), 0) /
//           devices.length
//         ).toFixed(0)
//       : 0;

//   const stats = [
//     {
//       label: "E-Waste Saved",
//       value: "12.4kg",
//       icon: <Recycle size={20} />,
//       color: "emerald",
//       bg: "bg-emerald-100",
//       textColor: "text-emerald-600",
//     },
//     {
//       label: "Repairs Done",
//       value: totalRepairs.toString(),
//       icon: <TrendingUp size={20} />,
//       color: "orange",
//       bg: "bg-orange-100",
//       textColor: "text-orange-600",
//     },
//     {
//       label: "Repair Score",
//       value: `${avgEcoScore}/100`,
//       icon: <Zap size={20} />,
//       color: "blue",
//       bg: "bg-blue-100",
//       textColor: "text-blue-600",
//     },
//     {
//       label: "Active Devices",
//       value: devices.length.toString(),
//       icon: <Smartphone size={20} />,
//       color: "purple",
//       bg: "bg-purple-100",
//       textColor: "text-purple-600",
//     },
//   ];

//   const pieData = [
//     {
//       name: "Good",
//       value: devices.filter((d) => d.ecoScore >= 80).length,
//       color: "#10b981",
//     },
//     {
//       name: "Fair",
//       value: devices.filter((d) => d.ecoScore < 80 && d.ecoScore >= 50).length,
//       color: "#f59e0b",
//     },
//     {
//       name: "Poor",
//       value: devices.filter((d) => d.ecoScore < 50).length,
//       color: "#ef4444",
//     },
//   ];

//   // 🟢 DYNAMIC PRIORITY ACTIONS: Maps tasks based on your actual device list
//   const priorityTasks = devices.slice(0, 3).map((device, index) => {
//     const tasks = [
//       {
//         name: "Dust Vents & Internal Cleaning",
//         urgency: "High",
//         icon: AlertCircle,
//         color: "text-rose-500",
//         bg: "bg-rose-50",
//       },
//       {
//         name: "Battery Calibration Cycle",
//         urgency: "Medium",
//         icon: Clock,
//         color: "text-amber-500",
//         bg: "bg-amber-50",
//       },
//       {
//         name: "System Optimization",
//         urgency: "Scheduled",
//         icon: Zap,
//         color: "text-emerald-500",
//         bg: "bg-emerald-50",
//       },
//     ];
//     return {
//       ...tasks[index],
//       id: device._id,
//       device: device.deviceName,
//     };
//   });

//   return (
//     <div
//       className="dashboard-wrapper"
//       style={{
//         padding: "40px",
//         maxWidth: "1200px",
//         margin: "0 auto",
//         backgroundColor: "rgb(241, 245, 249)",
//       }}
//     >
//       {/* Header Area */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "40px",
//         }}
//       >
//         <div>
//           <h1
//             style={{
//               fontSize: "2.5rem",
//               fontWeight: "800",
//               margin: 0,
//               color: "#1a1a1a",
//             }}
//           >
//             Sustainability Hub
//           </h1>
//           <p style={{ color: "#71717a", fontSize: "1rem", marginTop: "4px" }}>
//             Monitoring your impact on the circular economy.
//           </p>
//         </div>
//         <button
//           className="quick-scan-btn"
//           style={{
//             backgroundColor: "#10b981",
//             color: "white",
//             padding: "12px 24px",
//             borderRadius: "16px",
//             border: "none",
//             fontWeight: "700",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             cursor: "pointer",
//             boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)",
//           }}
//         >
//           <Zap size={18} fill="currentColor" /> Quick Scan
//         </button>
//       </div>

//       {/* 4-Column Stats Row */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4, 1fr)",
//           gap: "24px",
//           marginBottom: "40px",
//         }}
//       >
//         {stats.map((stat, i) => (
//           <div
//             key={i}
//             style={{
//               backgroundColor: "white",
//               padding: "24px",
//               borderRadius: "24px",
//               border: "1px solid #f1f5f9",
//               display: "flex",
//               alignItems: "center",
//               gap: "16px",
//               boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//             }}
//           >
//             <div
//               className={stat.bg}
//               style={{ padding: "12px", borderRadius: "16px" }}
//             >
//               <div className={stat.textColor}>{stat.icon}</div>
//             </div>
//             <div>
//               <p
//                 style={{
//                   margin: 0,
//                   fontSize: "0.75rem",
//                   fontWeight: "700",
//                   color: "#94a3b8",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.05em",
//                 }}
//               >
//                 {stat.label}
//               </p>
//               <p
//                 style={{
//                   margin: 0,
//                   fontSize: "1.5rem",
//                   fontWeight: "800",
//                   color: "#1a1a1a",
//                 }}
//               >
//                 {stat.value}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 1fr",
//           gap: "32px",
//           marginBottom: "40px",
//         }}
//       >
//         {/* LEFT BLOCK: Device Health Matrix */}
//         <div
//           style={{
//             backgroundColor: "white",
//             padding: "32px",
//             borderRadius: "40px",
//             border: "1px solid #f1f5f9",
//             boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: "32px",
//             }}
//           >
//             <h3 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>
//               Device Health Matrix
//             </h3>
//             <span
//               style={{
//                 fontSize: "0.65rem",
//                 fontWeight: "700",
//                 color: "#94a3b8",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.1em",
//                 backgroundColor: "#f8fafc",
//                 padding: "4px 12px",
//                 borderRadius: "99px",
//               }}
//             >
//               Visual Audit
//             </span>
//           </div>
//           <div style={{ height: "260px", position: "relative" }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   innerRadius={70}
//                   outerRadius={100}
//                   paddingAngle={8}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={index} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               gap: "32px",
//               marginTop: "24px",
//             }}
//           >
//             {pieData.map((d, i) => (
//               <div key={i} style={{ textAlign: "center" }}>
//                 <div
//                   style={{
//                     width: "24px",
//                     height: "4px",
//                     backgroundColor: d.color,
//                     borderRadius: "2px",
//                     margin: "0 auto 8px",
//                   }}
//                 />
//                 <p
//                   style={{
//                     margin: 0,
//                     fontSize: "0.65rem",
//                     fontWeight: "700",
//                     color: "#94a3b8",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   {d.name}
//                 </p>
//                 <p
//                   style={{
//                     margin: 0,
//                     fontSize: "0.875rem",
//                     fontWeight: "800",
//                     color: "#334155",
//                   }}
//                 >
//                   {d.value} Units
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT BLOCK: Priority Actions (Replacing Bar Graph) */}
//         <div
//           style={{
//             backgroundColor: "white",
//             padding: "32px",
//             borderRadius: "40px",
//             border: "1px solid #f1f5f9",
//             boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: "32px",
//             }}
//           >
//             <h3 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>
//               Priority Actions
//             </h3>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 color: "#059669",
//                 backgroundColor: "#ecfdf5",
//                 padding: "4px 12px",
//                 borderRadius: "99px",
//                 fontSize: "0.65rem",
//                 fontWeight: "700",
//                 textTransform: "uppercase",
//               }}
//             >
//               <span
//                 style={{
//                   width: "6px",
//                   height: "6px",
//                   backgroundColor: "#059669",
//                   borderRadius: "50%",
//                 }}
//               />{" "}
//               Live Tasks
//             </div>
//           </div>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "16px" }}
//           >
//             {priorityTasks.length > 0 ? (
//               priorityTasks.map((item) => (
//                 <div
//                   key={item.id}
//                   onClick={() => navigate("/lifecycle")}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     padding: "16px",
//                     borderRadius: "20px",
//                     border: "1px solid #f8fafc",
//                     cursor: "pointer",
//                     transition: "all 0.2s",
//                   }}
//                   className="action-item-hover"
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "16px",
//                     }}
//                   >
//                     <div
//                       className={item.bg}
//                       style={{
//                         width: "40px",
//                         height: "40px",
//                         borderRadius: "12px",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <item.icon size={20} className={item.color} />
//                     </div>
//                     <div>
//                       <h4
//                         style={{
//                           margin: 0,
//                           fontSize: "0.875rem",
//                           fontWeight: "700",
//                           color: "#1e293b",
//                         }}
//                       >
//                         {item.name}
//                       </h4>
//                       <p
//                         style={{
//                           margin: "4px 0 0",
//                           fontSize: "0.65rem",
//                           fontWeight: "700",
//                           color: "#94a3b8",
//                           textTransform: "uppercase",
//                         }}
//                       >
//                         {item.device}
//                       </p>
//                     </div>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "12px",
//                     }}
//                   >
//                     <span
//                       style={{
//                         fontSize: "0.6rem",
//                         fontWeight: "800",
//                         padding: "4px 8px",
//                         borderRadius: "8px",
//                         backgroundColor: "#f1f5f9",
//                         color: "#64748b",
//                       }}
//                     >
//                       {item.urgency}
//                     </span>
//                     <ChevronRight size={16} color="#cbd5e1" />
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p style={{ textAlign: "center", color: "#94a3b8" }}>
//                 No active devices found.
//               </p>
//             )}
//           </div>
//           <div
//             style={{
//               marginTop: "32px",
//               padding: "16px",
//               backgroundColor: "#f8fafc",
//               borderRadius: "20px",
//               border: "1px solid #f1f5f9",
//               textAlign: "center",
//             }}
//           >
//             <p
//               style={{
//                 margin: 0,
//                 fontSize: "0.7rem",
//                 color: "#64748b",
//                 fontStyle: "italic",
//               }}
//             >
//               "Proactive maintenance reduces hardware failure by 40% annually."
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Banner */}
//       <div
//         style={{
//           backgroundColor: "#064e3b",
//           padding: "48px",
//           borderRadius: "40px",
//           position: "relative",
//           overflow: "hidden",
//           color: "white",
//         }}
//       >
//         <div style={{ position: "relative", zIndex: 10, maxWidth: "600px" }}>
//           <span
//             style={{
//               backgroundColor: "rgba(52, 211, 153, 0.2)",
//               color: "#6ee7b7",
//               padding: "6px 16px",
//               borderRadius: "99px",
//               fontSize: "0.65rem",
//               fontWeight: "800",
//               letterSpacing: "0.2em",
//               border: "1px solid rgba(110, 231, 183, 0.3)",
//             }}
//           >
//             SUSTAINABILITY FACT
//           </span>
//           <h2
//             style={{
//               fontSize: "2rem",
//               fontWeight: "800",
//               margin: "24px 0 16px",
//             }}
//           >
//             Revive, don't replace.
//           </h2>
//           <p
//             style={{
//               fontSize: "1.125rem",
//               color: "#d1fae5",
//               lineHeight: "1.6",
//               marginBottom: "32px",
//               opacity: 0.9,
//             }}
//           >
//             Repairing a single laptop instead of buying a new one saves 1,200kg
//             of raw materials and prevents 150kg of CO₂.
//           </p>
//           <button
//             onClick={() => navigate("/repair-ai")}
//             style={{
//               backgroundColor: "#34d399",
//               color: "#064e3b",
//               padding: "14px 32px",
//               borderRadius: "16px",
//               border: "none",
//               fontWeight: "800",
//               cursor: "pointer",
//               boxShadow: "0 10px 15px -3px rgba(52, 211, 153, 0.3)",
//             }}
//           >
//             Start Repair Guide
//           </button>
//         </div>
//         <Recycle
//           style={{
//             position: "absolute",
//             right: "-40px",
//             bottom: "-40px",
//             width: "320px",
//             height: "320px",
//             color: "#059669",
//             opacity: 0.1,
//             transform: "rotate(15deg)",
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default HomeScreen;
