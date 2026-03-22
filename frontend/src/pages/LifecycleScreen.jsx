import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import {
  Smartphone,
  Laptop,
  PlusCircle,
  Wrench,
  Trash2,
  CheckCircle,
  Zap,
  X,
  History,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  Sparkles,
  Info,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

// MUI Imports
import { TextField, Rating, Box } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LIFECYCLE_URL, TASKS_URL } from "../utils/constants";
import dayjs from "dayjs";

import "./LifecycleScreen.css";

// --- HELPERS ---
// const getSmartRecommendations = (device) => {
//   const model = device.deviceModel?.toLowerCase() || "";
//   const name = device.deviceName?.toLowerCase() || "";
//   if (
//     model.includes("apple") ||
//     name.includes("iphone") ||
//     name.includes("mac")
//   ) {
//     return {
//       tip: "Battery Longevity",
//       action: "Calibrate charging cycles to maintain peak capacity.",
//     };
//   }
//   if (
//     model.includes("samsung") ||
//     model.includes("pixel") ||
//     model.includes("android")
//   ) {
//     return {
//       tip: "Software Decay",
//       action: "Wipe system cache partition to prevent background lag.",
//     };
//   }
//   if (device.category === "Laptop") {
//     return {
//       tip: "Thermal Safety",
//       action: "Inspect heat-sink vents and check fan RPM consistency.",
//     };
//   }
//   return {
//     tip: "Sustainability",
//     action: "Audit background app sync to reduce motherboard stress.",
//   };
// };

const getTaskInstructions = (taskName) => {
  const name = taskName.toLowerCase();
  if (name.includes("software") || name.includes("update")) {
    return [
      "Back up data to the cloud.",
      "Check for OS updates.",
      "Delete unused apps.",
    ];
  }
  if (name.includes("clean") || name.includes("physical")) {
    return [
      "Use 70% isopropyl alcohol.",
      "Clear charging ports.",
      "Blow compressed air into vents.",
    ];
  }
  if (name.includes("battery")) {
    return [
      "Drain to 0% then charge to 100%.",
      "Check 'Peak Performance' status.",
      "Disable high-drain location tracking.",
    ];
  }
  return [
    "Review digital manual.",
    "Inspect for physical wear.",
    "Update security patches.",
  ];
};

// const calculateHealth = (device) => {
//   let score = 85;
//   const repairImpact = (device.repairsDone || 0) * 12;
//   score = score - repairImpact;
//   return Math.min(100, Math.max(5, score));
// };

const calculateHealth = (device) => {
  // Base score assumes a healthy device
  let score = 100;

  // 1. Age Degradation (Simulates natural battery/hardware aging)
  // Deducts 3 points for every year old the device is
  const ageInYears = dayjs().diff(dayjs(device.purchaseDate), "year");
  score -= ageInYears * 3;

  // 2. The Hero Bonus (Circular Economy Right-to-Repair)
  // Rewards the user massively for fixing the device instead of throwing it away
  const repairBonus = (device.repairsDone || 0) * 15;
  score += repairBonus;

  // Ensure score stays between 5 and 100
  return Math.min(100, Math.max(5, score));
};

Modal.setAppElement("#root");

const LifecycleScreen = () => {
  const { userInfo } = useAuth();
  const [devices, setDevices] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // UI States
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintTab, setMaintTab] = useState("pending"); // 'pending' or 'completed'
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  // Form States
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(dayjs());
  const [category, setCategory] = useState("Smartphone");

  // Selection/Repair States
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [repairRating, setRepairRating] = useState(3);
  const [repairDesc, setRepairDesc] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [checklist, setChecklist] = useState({
    software: false,
    physical: false,
    optimize: false,
  });

  const [aiInstructions, setAiInstructions] = useState({});
  const [isLoadingInstructions, setIsLoadingInstructions] = useState({});

  // Add this near your other functions in LifecycleScreen.jsx
  const handleSimulateUpdate = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        "/api/tasks/admin/trigger-update",
        {
          taskName: "System Alert",
          description: "Thermal thresholds approaching limit for MacBook.",
          urgency: "High",
        },
        config,
      );

      toast.success("Admin Alert Sent! Check your bell icon.");
      await fetchData();
      window.dispatchEvent(new Event("forceNotificationRefresh"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to trigger alert.");
    }
  };

  const fetchTaskInstructions = async (taskId, taskName, deviceName) => {
    // Toggle the accordion if it's already open
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      return;
    }

    setExpandedTaskId(taskId);

    // If we already fetched instructions for this task, don't fetch again
    if (aiInstructions[taskId]) return;

    setIsLoadingInstructions((prev) => ({ ...prev, [taskId]: true }));

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        "/api/ai/task-steps", // Ensure this matches your route setup
        { taskName, deviceName },
        config,
      );

      setAiInstructions((prev) => ({ ...prev, [taskId]: data.steps }));
    } catch (err) {
      toast.error("Failed to load AI instructions");
    } finally {
      setIsLoadingInstructions((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const isAnyModalOpen =
    isAddModalOpen ||
    isMaintModalOpen ||
    isDeleteModalOpen ||
    isRepairModalOpen;

  const fetchData = async () => {
    if (!userInfo) return;
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      const [devicesRes, tasksRes] = await Promise.all([
        axios.get(LIFECYCLE_URL, config),
        // axios.get(`${TASKS_URL}/upcoming`, config),
        axios.get(`${TASKS_URL}`, config), // Fetch ALL tasks to build the complete Maintenance Log
      ]);
      setDevices(devicesRes.data);
      setUpcomingTasks(tasksRes.data);
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo]);

  // const triggerSimulatedUpdate = async () => {
  //   try {
  //     // Sends the invisible command to your backend (Port 5000)
  //     await axios.post(`${TASKS_URL}/admin/trigger-update`, {
  //       targetBrand: "Apple",
  //       taskName: "Critical macOS Sonoma Update",
  //       description: "Apple released a zero-day patch. Please update.",
  //       urgency: "High",
  //     });
  //     toast.info("📡 Manufacturer Update Triggered!");
  //   } catch (err) {
  //     toast.error("Failed to trigger update.");
  //   }
  // };

  const handleRepairSubmit = async () => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.put(
        `${LIFECYCLE_URL}/${selectedDevice._id}/addrepair`,
        {
          rating: repairRating,
          description: repairDesc,
        },
        config,
      );
      toast.success(`Repair Logged (${repairRating}/5)`);
      setIsRepairModalOpen(false);
      setRepairDesc("");
      fetchData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleCompleteTask = async (taskId) => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    // 1. Optimistic UI: Temporarily flag it for the "turn green" animation
    setUpcomingTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, isCompleting: true } : t)),
    );

    try {
      // 1. Update the task status in the database
      // We assume your taskRoutes/Controller handles PATCH/PUT for completion
      // await axios.patch(`${TASKS_URL}/${taskId}`, { isComplete: true }, config);
      await axios.patch(
        `${TASKS_URL}/${taskId}`,
        { status: "completed" },
        config,
      );

      toast.success("Task marks as completed! 🚀");

      // // 2. Remove the task from the local state so it disappears immediately
      // setUpcomingTasks((prevTasks) =>
      //   prevTasks.filter((task) => task._id !== taskId),
      // );
      // 2. Wait 400ms for the user to see the green checkmark, then move it to completed
      setTimeout(() => {
        setUpcomingTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? { ...t, isComplete: true, isCompleting: false }
              : t,
          ),
        );
        fetchData(); // Sync health scores in the background
      }, 400);

      // 3. Optional: Refresh inventory if completion affects health score
      // fetchData();
    } catch (err) {
      console.error("EcoNova+ Task Error:", err);
      toast.error("Failed to update task");
      // Revert animation on fail
      setUpcomingTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, isCompleting: false } : t)),
      );
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!userInfo) return;

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.post(
        LIFECYCLE_URL,
        {
          deviceName,
          deviceModel,
          purchaseDate: purchaseDate.toISOString(),
          category,
        },
        config,
      );
      toast.success("Tracking Initialized");
      setIsAddModalOpen(false);
      // Reset form
      setDeviceName("");
      setDeviceModel("");
      setPurchaseDate(dayjs());
      fetchData();
    } catch (err) {
      console.error("Add Device Error:", err);
      toast.error("Failed to initialize tracking");
    }
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) return toast.warning("Provide a reason");
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.delete(`${LIFECYCLE_URL}/${deviceToDelete._id}`, {
        data: { reason: deleteReason },
        headers: config.headers,
      });
      toast.success("Record archived.");
      setIsDeleteModalOpen(false);
      setDeleteReason("");
      fetchData();
    } catch (err) {
      toast.error("Error deleting device");
    }
  };

  // const displayedTasks = showAllTasks
  //   ? upcomingTasks
  //   : upcomingTasks.slice(0, 3);
  // Filter out completed tasks so the Priority Queue only shows what needs attention
  const todayDate = dayjs();
  const pendingPriorityTasks = upcomingTasks.filter(
    // (task) => task.status === "pending",
    (task) =>
      task.isComplete === false &&
      dayjs(task.dueDate).isBefore(todayDate.add(7, "day")),
  );

  const displayedTasks = showAllTasks
    ? pendingPriorityTasks
    : pendingPriorityTasks.slice(0, 3);

  if (!userInfo) return <div className="loading-screen">Authenticating...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="modern-dashboard">
        {/* --- DASHBOARD BACKGROUND (BLURRED) --- */}
        <div
          className={`dashboard-content-wrapper ${isAnyModalOpen ? "apply-blur" : ""}`}
        >
          <div className="dashboard-container">
            <header className="dashboard-header">
              <div>
                <h1 className="header-title">Lifecycle Intelligence</h1>
                <p className="header-subtitle">
                  Maximize performance, minimize e-waste.
                </p>
              </div>
              <button
                onClick={handleSimulateUpdate}
                style={{
                  background: "#333",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Admin: Simulate Update
              </button>
              <button
                className="btn-primary"
                onClick={() => setIsAddModalOpen(true)}
                // onClick={handleSimulateUpdate}
              >
                <PlusCircle size={18} /> Log Hardware
              </button>
            </header>
            {/* STATS ROW (Restored) */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <Smartphone size={20} className="text-emerald" />
                  <h3>{devices.length}</h3>
                </div>
                <p>Active Inventory</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <History size={20} className="text-orange" />
                  <h3 className="text-orange">
                    {devices.reduce(
                      (acc, dev) => acc + (dev.repairsDone || 0),
                      0,
                    )}
                  </h3>
                </div>
                <p>Repairs Logged</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <Zap size={20} className="text-red" />
                  {/* <h3 className="text-red">{upcomingTasks.length}</h3> */}
                  <h3 className="text-red">{pendingPriorityTasks.length}</h3>
                </div>
                <p>Priority Tasks</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <ShieldCheck size={20} className="text-green" />
                  <h3 className="text-green">
                    {devices.length > 0
                      ? (
                          devices.reduce(
                            (acc, dev) => acc + calculateHealth(dev),
                            0,
                          ) / devices.length
                        ).toFixed(0)
                      : 0}
                    %
                  </h3>
                </div>
                <p>Avg. Health Index</p>
              </div>
            </div>

            <div className="main-grid">
              {/* LEFT: INVENTORY */}
              <section className="inventory-section">
                <div className="section-header">
                  <h2>Hardware Inventory</h2>
                </div>
                <div className="device-grid">
                  {devices.map((device) => {
                    const health = calculateHealth(device);
                    // const smartTip = getSmartRecommendations(device);
                    return (
                      <div key={device._id} className="modern-device-card">
                        <div className="card-top">
                          <div className="device-icon">
                            {device.category === "Laptop" ? (
                              <Laptop />
                            ) : (
                              <Smartphone />
                            )}
                          </div>
                          <div>
                            <h4>{device.deviceName}</h4>
                            <p className="sub-text">{device.deviceModel}</p>
                          </div>
                          <div
                            className="repair-tracker"
                            onClick={() => {
                              setSelectedDevice(device);
                              setIsRepairModalOpen(true);
                            }}
                          >
                            <History size={14} />{" "}
                            <span>{device.repairsDone || 0}</span>
                          </div>
                        </div>

                        {/* <div className="smart-tip-box">
                          <Sparkles size={14} className="sparkle-icon" />
                          <div>
                            <p className="tip-title">{smartTip.tip}</p>
                            <p className="tip-desc">{smartTip.action}</p>
                          </div>
                        </div> */}

                        <div className="health-section">
                          <div className="health-labels">
                            <span>System Health</span>
                            <span className="health-value">{health}%</span>
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${health}%`,
                                backgroundColor:
                                  health > 60 ? "#10b981" : "#ef4444",
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button
                            className="btn-maint"
                            onClick={() => {
                              setSelectedDevice(device);
                              setMaintTab("pending");
                              setIsMaintModalOpen(true);
                              setChecklist({
                                software: false,
                                physical: false,
                                optimize: false,
                              });
                            }}
                          >
                            <Wrench size={14} /> Maintenance
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => {
                              setDeviceToDelete(device);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* RIGHT: TASK QUEUE */}
              <aside className="tasks-section">
                <h2>Priority Tasks</h2>
                <div className="task-panel">
                  <div className="task-list">
                    {displayedTasks.map((task) => {
                      const instructions = getTaskInstructions(task.taskName);
                      const isExpanded = expandedTaskId === task._id;
                      return (
                        <div
                          key={task._id}
                          className={`task-item-v5 ${isExpanded ? "expanded" : ""}`}
                        >
                          <div className="task-main-row">
                            <div className="task-info">
                              <h5>{task.taskName}</h5>
                              <p>{task.device?.deviceName}</p>
                            </div>
                            <div className="task-actions">
                              <button
                                className={`btn-info ${isExpanded ? "active" : ""}`}
                                // onClick={() =>
                                //   setExpandedTaskId(
                                //     isExpanded ? null : task._id,
                                //   )
                                // }
                                onClick={() =>
                                  fetchTaskInstructions(
                                    task._id,
                                    task.taskName,
                                    task.device?.deviceName,
                                  )
                                }
                              >
                                <HelpCircle size={18} />
                              </button>
                              <button
                                className="btn-zap"
                                onClick={() => handleCompleteTask(task._id)}
                              >
                                <Zap size={16} />
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="task-instructions animate-slide-down">
                              <h6>How to complete:</h6>
                              {/* <ul>
                                {instructions.map((step, idx) => (
                                  <li key={idx}>
                                    <CheckCircle2 size={12} /> {step}
                                  </li>
                                ))}
                              </ul> */}
                              {isLoadingInstructions[task._id] ? (
                                <p style={{ fontSize: "12px", color: "#888" }}>
                                  Analyzing device protocol...
                                </p>
                              ) : (
                                <ul>
                                  {(aiInstructions[task._id] || []).map(
                                    (step, idx) => (
                                      <li key={idx}>
                                        <CheckCircle2 size={12} /> {step}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* {upcomingTasks.length > 3 && ( */}
                  {pendingPriorityTasks.length > 3 && (
                    <button
                      className="view-all-tasks"
                      onClick={() => setShowAllTasks(!showAllTasks)}
                    >
                      {showAllTasks ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      {showAllTasks ? "Show Fewer" : "View All Tasks"}
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* --- MODALS --- */}

        {/* LOG HARDWARE MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          className="compact-dialog"
          overlayClassName="modal-overlay"
          onRequestClose={() => setIsAddModalOpen(false)}
        >
          <div className="modal-header">
            <h3>Log New Hardware</h3>
            <button
              className="close-btn"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X />
            </button>
          </div>
          <form onSubmit={handleAddDevice} className="modal-form">
            <div className="form-group">
              <label>Device Name</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. iPhone"
                required
              />
            </div>
            <div className="form-group">
              <label>Model / Brand</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g. Apple"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Smartphone</option>
                <option>Laptop</option>
                <option>Monitor</option>
                <option>Tablet</option>
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <DatePicker
                value={purchaseDate}
                onChange={(v) => setPurchaseDate(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    onClick: (e) => e.stopPropagation(),
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f9fafb",
                        cursor: "pointer",
                      },
                      "& .MuiInputBase-input": {
                        cursor: "pointer",
                      },
                    },
                  },
                  popper: {
                    sx: { zIndex: 20000 },
                  },
                }}
              />
            </div>
            <button type="submit" className="btn-finalize">
              Initialize Tracking
            </button>
          </form>
        </Modal>

        {/* MAINTENANCE MODAL */}
        {/* <Modal
          isOpen={isMaintModalOpen}
          className="compact-dialog"
          overlayClassName="modal-overlay"
          onRequestClose={() => setIsMaintModalOpen(false)}
        >
          <div className="modal-header">
            <h3>{selectedDevice?.deviceName} Maintenance Log</h3>
            <button
              className="close-btn"
              onClick={() => setIsMaintModalOpen(false)}
            >
              <X />
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="checklist-v2">
              {["software", "physical", "optimize"].map((type) => (
                <div
                  key={type}
                  className={`check-row ${checklist[type] ? "active" : ""}`}
                  onClick={() =>
                    setChecklist({ ...checklist, [type]: !checklist[type] })
                  }
                >
                  <CheckCircle size={20} />
                  <div>
                    <label style={{ textTransform: "capitalize" }}>
                      {type} Cleanup
                    </label>
                    <span>
                      Maintain performance for {selectedDevice?.deviceName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn-finalize"
              disabled={
                !checklist.software ||
                !checklist.physical ||
                !checklist.optimize
              }
              onClick={() => {
                toast.success("Health Boost Applied!");
                setIsMaintModalOpen(false);
              }}
            >
              Apply Health Boost
            </button>
          </div>
        </Modal> */}
        {/* MAINTENANCE MODAL (The Single Source of Truth) */}
        <Modal
          isOpen={isMaintModalOpen}
          className="compact-dialog"
          overlayClassName="modal-overlay"
          onRequestClose={() => setIsMaintModalOpen(false)}
        >
          <div className="modal-header">
            <h3>{selectedDevice?.deviceName} Maintenance Log</h3>
            <button
              className="close-btn"
              onClick={() => setIsMaintModalOpen(false)}
            >
              <X />
            </button>
          </div>

          {/* NEW: Clean Tab Navigation */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #eee",
              marginBottom: "10px",
              marginTop: "-10px",
            }}
          >
            <button
              style={{
                flex: 1,
                padding: "12px",
                background: "none",
                border: "none",
                borderBottom:
                  maintTab === "pending"
                    ? "2px solid #10b981"
                    : "2px solid transparent",
                fontWeight: maintTab === "pending" ? "bold" : "normal",
                color: maintTab === "pending" ? "#10b981" : "#888",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setMaintTab("pending")}
            >
              Pending Tasks
            </button>
            <button
              style={{
                flex: 1,
                padding: "12px",
                background: "none",
                border: "none",
                borderBottom:
                  maintTab === "completed"
                    ? "2px solid #10b981"
                    : "2px solid transparent",
                fontWeight: maintTab === "completed" ? "bold" : "normal",
                color: maintTab === "completed" ? "#10b981" : "#888",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setMaintTab("completed")}
            >
              Completed History
            </button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <div className="checklist-v2">
              {/* Dynamically filter tasks that belong ONLY to this specific device */}
              {upcomingTasks
                .filter(
                  (task) =>
                    (task.device?._id || task.device) === selectedDevice?._id,
                )
                .filter((task) =>
                  maintTab === "pending" ? !task.isComplete : task.isComplete,
                )
                .map((task) => (
                  <div
                    key={task._id}
                    className={`check-row ${task.status === "completed" ? "active" : ""}`}
                  >
                    {/* If task is pending, clicking the circle completes it. If completed, it's disabled. */}
                    <CheckCircle
                      size={20}
                      color={
                        task.isCompleting || task.isComplete
                          ? "#10b981"
                          : "currentColor"
                      }
                      // style={{
                      //   cursor:
                      //     task.status === "completed" ? "default" : "pointer",
                      //   flexShrink: 0,
                      // }}
                      style={{
                        cursor: task.isComplete ? "default" : "pointer",
                        flexShrink: 0,
                        transition: "color 0.3s ease",
                      }}
                      onClick={() => {
                        // if (task.status !== "completed") {
                        //   handleCompleteTask(task._id);
                        // }
                        if (!task.isComplete && !task.isCompleting) {
                          handleCompleteTask(task._id);
                        }
                      }}
                    />
                    <div>
                      <label
                        style={{
                          textTransform: "capitalize",
                          // textDecoration:
                          //   task.status === "completed"
                          //     ? "line-through"
                          //     : "none",
                          // display: "block",
                          // marginBottom: "4px",
                          textDecoration: task.isComplete
                            ? "line-through"
                            : "none",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {task.taskName}
                      </label>

                      {/* Display task description or the due date */}
                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          color: "#666",
                          lineHeight: "1.4",
                        }}
                      >
                        {/* {task.status === "completed"
                          ? "Completed ✓"
                          : `Due: ${dayjs(task.dueDate).format("MMM D, YYYY")} - ${task.urgency || "Standard"} Priority`} */}
                        {task.isComplete
                          ? "Completed ✓"
                          : `Due: ${dayjs(task.dueDate).format("MMM D, YYYY")} - ${task.urgency || "Standard"} Priority`}
                      </span>
                    </div>
                  </div>
                ))}

              {/* Empty State if the Cron job hasn't assigned tasks yet */}
              {upcomingTasks.filter(
                (task) =>
                  (task.device?._id || task.device) === selectedDevice?._id,
              ).length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20 px",
                    color: "#888",
                  }}
                >
                  <ShieldCheck
                    size={40}
                    style={{ opacity: 0.5, marginBottom: "10px" }}
                  />
                  <p style={{ margin: "0 0 5px 0", fontWeight: "500" }}>
                    No maintenance required currently.
                  </p>
                  <p style={{ fontSize: "12px", margin: 0 }}>
                    Automated tasks will appear here based on manufacturer
                    updates.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn-finalize"
              onClick={() => setIsMaintModalOpen(false)}
            >
              Close Log
            </button>
          </div>
        </Modal>

        {/* REPAIR FEEDBACK MODAL */}
        <Modal
          isOpen={isRepairModalOpen}
          className="compact-dialog"
          overlayClassName="modal-overlay"
          onRequestClose={() => setIsRepairModalOpen(false)}
        >
          <div className="modal-header">
            <h3>Repair Assessment</h3>
            <button
              className="close-btn"
              onClick={() => setIsRepairModalOpen(false)}
            >
              <X />
            </button>
          </div>
          <div className="modal-body">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "center",
              }}
            >
              <Rating
                value={repairRating}
                onChange={(e, val) => setRepairRating(val)}
                size="large"
              />
              <TextField
                label="Issue Description"
                multiline
                rows={2}
                fullWidth
                value={repairDesc}
                onChange={(e) => setRepairDesc(e.target.value)}
              />
            </Box>
          </div>
          <div className="modal-footer">
            <button className="btn-finalize" onClick={handleRepairSubmit}>
              Log Repair
            </button>
          </div>
        </Modal>

        {/* DELETE MODAL */}
        <Modal
          isOpen={isDeleteModalOpen}
          className="compact-dialog delete-theme"
          overlayClassName="modal-overlay"
          onRequestClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="modal-header">
            <h3>Remove Device</h3>
            <button
              className="close-btn"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <X />
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Reason for Removal</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Upgraded, Recycled, Lost"
                rows="2"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-confirm-delete" onClick={confirmDelete}>
              Archive Record
            </button>
          </div>
        </Modal>
      </div>
    </LocalizationProvider>
  );
};

export default LifecycleScreen;
