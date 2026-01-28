import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Zap,
  Recycle,
  TrendingUp,
  Smartphone,
  Clock,
  ChevronRight,
  AlertCircle,
  Battery,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./HomeScreen.css";

const HomeScreen = () => {
  const { devices = [] } = useOutletContext();
  const navigate = useNavigate();

  // --- 🟢 DYNAMIC LOGIC (Preserving your variable names) ---
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

  const stats = [
    {
      label: "E-Waste Saved",
      value: "12.4kg",
      icon: <Recycle size={20} />,
      color: "emerald",
      bg: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      label: "Repairs Done",
      value: totalRepairs.toString(),
      icon: <TrendingUp size={20} />,
      color: "orange",
      bg: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      label: "Repair Score",
      value: `${avgEcoScore}/100`,
      icon: <Zap size={20} />,
      color: "blue",
      bg: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Active Devices",
      value: devices.length.toString(),
      icon: <Smartphone size={20} />,
      color: "purple",
      bg: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  const pieData = [
    {
      name: "Good",
      value: devices.filter((d) => d.ecoScore >= 80).length,
      color: "#10b981",
    },
    {
      name: "Fair",
      value: devices.filter((d) => d.ecoScore < 80 && d.ecoScore >= 50).length,
      color: "#f59e0b",
    },
    {
      name: "Poor",
      value: devices.filter((d) => d.ecoScore < 50).length,
      color: "#ef4444",
    },
  ];

  // 🟢 DYNAMIC PRIORITY ACTIONS: Maps tasks based on your actual device list
  const priorityTasks = devices.slice(0, 3).map((device, index) => {
    const tasks = [
      {
        name: "Dust Vents & Internal Cleaning",
        urgency: "High",
        icon: AlertCircle,
        color: "text-rose-500",
        bg: "bg-rose-50",
      },
      {
        name: "Battery Calibration Cycle",
        urgency: "Medium",
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
      {
        name: "System Optimization",
        urgency: "Scheduled",
        icon: Zap,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      },
    ];
    return {
      ...tasks[index],
      id: device._id,
      device: device.deviceName,
    };
  });

  return (
    <div
      className="dashboard-wrapper"
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "rgb(241, 245, 249)",
      }}
    >
      {/* Header Area */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              margin: 0,
              color: "#1a1a1a",
            }}
          >
            Sustainability Hub
          </h1>
          <p style={{ color: "#71717a", fontSize: "1rem", marginTop: "4px" }}>
            Monitoring your impact on the circular economy.
          </p>
        </div>
        <button
          className="quick-scan-btn"
          style={{
            backgroundColor: "#10b981",
            color: "white",
            padding: "12px 24px",
            borderRadius: "16px",
            border: "none",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)",
          }}
        >
          <Zap size={18} fill="currentColor" /> Quick Scan
        </button>
      </div>

      {/* 4-Column Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "24px",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              className={stat.bg}
              style={{ padding: "12px", borderRadius: "16px" }}
            >
              <div className={stat.textColor}>{stat.icon}</div>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#1a1a1a",
                }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        {/* LEFT BLOCK: Device Health Matrix */}
        <div
          style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "40px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "32px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>
              Device Health Matrix
            </h3>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "700",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: "#f8fafc",
                padding: "4px 12px",
                borderRadius: "99px",
              }}
            >
              Visual Audit
            </span>
          </div>
          <div style={{ height: "260px", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              marginTop: "24px",
            }}
          >
            {pieData.map((d, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "24px",
                    height: "4px",
                    backgroundColor: d.color,
                    borderRadius: "2px",
                    margin: "0 auto 8px",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  {d.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: "800",
                    color: "#334155",
                  }}
                >
                  {d.value} Units
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT BLOCK: Priority Actions (Replacing Bar Graph) */}
        <div
          style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "40px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "32px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>
              Priority Actions
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#059669",
                backgroundColor: "#ecfdf5",
                padding: "4px 12px",
                borderRadius: "99px",
                fontSize: "0.65rem",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: "#059669",
                  borderRadius: "50%",
                }}
              />{" "}
              Live Tasks
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {priorityTasks.length > 0 ? (
              priorityTasks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate("/lifecycle")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: "20px",
                    border: "1px solid #f8fafc",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="action-item-hover"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      className={item.bg}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <item.icon size={20} className={item.color} />
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        {item.name}
                      </h4>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.65rem",
                          fontWeight: "700",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.device}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: "800",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        backgroundColor: "#f1f5f9",
                        color: "#64748b",
                      }}
                    >
                      {item.urgency}
                    </span>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>
                No active devices found.
              </p>
            )}
          </div>
          <div
            style={{
              marginTop: "32px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "20px",
              border: "1px solid #f1f5f9",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.7rem",
                color: "#64748b",
                fontStyle: "italic",
              }}
            >
              "Proactive maintenance reduces hardware failure by 40% annually."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div
        style={{
          backgroundColor: "#064e3b",
          padding: "48px",
          borderRadius: "40px",
          position: "relative",
          overflow: "hidden",
          color: "white",
        }}
      >
        <div style={{ position: "relative", zIndex: 10, maxWidth: "600px" }}>
          <span
            style={{
              backgroundColor: "rgba(52, 211, 153, 0.2)",
              color: "#6ee7b7",
              padding: "6px 16px",
              borderRadius: "99px",
              fontSize: "0.65rem",
              fontWeight: "800",
              letterSpacing: "0.2em",
              border: "1px solid rgba(110, 231, 183, 0.3)",
            }}
          >
            SUSTAINABILITY FACT
          </span>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              margin: "24px 0 16px",
            }}
          >
            Revive, don't replace.
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#d1fae5",
              lineHeight: "1.6",
              marginBottom: "32px",
              opacity: 0.9,
            }}
          >
            Repairing a single laptop instead of buying a new one saves 1,200kg
            of raw materials and prevents 150kg of CO₂.
          </p>
          <button
            onClick={() => navigate("/repair-ai")}
            style={{
              backgroundColor: "#34d399",
              color: "#064e3b",
              padding: "14px 32px",
              borderRadius: "16px",
              border: "none",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(52, 211, 153, 0.3)",
            }}
          >
            Start Repair Guide
          </button>
        </div>
        <Recycle
          style={{
            position: "absolute",
            right: "-40px",
            bottom: "-40px",
            width: "320px",
            height: "320px",
            color: "#059669",
            opacity: 0.1,
            transform: "rotate(15deg)",
          }}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
