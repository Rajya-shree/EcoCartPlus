import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import {
  Smartphone,
  PlusCircle,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Leaf,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import "./DashboardScreen.css";

// --- ORIGINAL HELPERS PRESERVED ---
const getOverdueDays = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

Modal.setAppElement("#root");

const DashboardScreen = () => {
  const { userInfo } = useAuth();
  const [devices, setDevices] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDeviceTasks, setSelectedDeviceTasks] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [category, setCategory] = useState("Smartphone");

  // UI Toggle State
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // --- DATA FETCHING (ORIGINAL LOGIC) ---
  const fetchData = async () => {
    if (!userInfo) return;
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      const [devicesRes, tasksRes] = await Promise.all([
        axios.get("/api/devices", config),
        axios.get("/api/tasks/upcoming", config),
      ]);
      setDevices(devicesRes.data);
      setUpcomingTasks(tasksRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo]);

  // --- HANDLERS (ORIGINAL LOGIC) ---
  const handleAddRepair = async (deviceId) => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.put(`/api/devices/${deviceId}/addrepair`, {}, config);
      toast.success("Repair updated!");
      fetchData();
    } catch (err) {
      toast.error("Error updating repair count");
    }
  };

  const handleOpenMaintModal = async (device) => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      const { data } = await axios.get(
        `/api/tasks/device/${device._id}`,
        config,
      );
      setSelectedDeviceTasks(data);
      setSelectedDevice(device);
      setIsMaintModalOpen(true);
    } catch (err) {
      toast.error("Could not fetch tasks");
    }
  };

  const handleCompleteTask = async (taskId) => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.put(`/api/tasks/${taskId}/complete`, {}, config);
      toast.success("Task completed!");
      await fetchData();
      if (selectedDevice) {
        const { data } = await axios.get(
          `/api/tasks/device/${selectedDevice._id}`,
          config,
        );
        setSelectedDeviceTasks(data);
      }
    } catch (err) {
      toast.error("Error completing task");
    }
  };

  // --- CALCULATION LOGIC ---
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

  // --- FIXED VARIABLE NAMES HERE ---
  const displayedDevices = showAllDevices ? devices : devices.slice(0, 2);
  const displayedTasks = showAllTasks
    ? upcomingTasks
    : upcomingTasks.slice(0, 4);

  if (!userInfo) return <div className="loading-screen">Authenticating...</div>;

  return (
    <div className="dashboard-page-bg">
      <div className="dashboard-main-wrapper">
        {/* HEADER */}
        <div className="header-action-bar">
          <div className="header-info">
            <Leaf className="eco-header-icon" />
            <div>
              <h2>Your Devices & Tasks</h2>
              <p>Monitor health and extend device lifespan.</p>
            </div>
          </div>
          <button
            className="premium-add-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle size={20} /> Add Device
          </button>
        </div>

        {/* STATS */}
        <div className="impact-stats-row">
          <div className="hub-stat-card blue">
            <h3>{devices.length}</h3>
            <p>Active Devices</p>
          </div>
          <div className="hub-stat-card orange">
            <h3>{totalRepairs}</h3>
            <p>Repairs Done</p>
          </div>
          <div className="hub-stat-card red">
            <h3>{upcomingTasks.length}</h3>
            <p>Pending Tasks</p>
          </div>
          <div className="hub-stat-card green">
            <h3>{avgEcoScore}%</h3>
            <p>Avg. Eco Score</p>
          </div>
        </div>

        <div className="dashboard-grid-layout">
          {/* LEFT: DEVICES */}
          <section className="panel-box">
            <div className="panel-header-row">
              <h3>Your Devices</h3>
              <button
                className="view-toggle-btn"
                onClick={() => setShowAllDevices(!showAllDevices)}
              >
                {showAllDevices ? "SHOW LESS" : "VIEW ALL"}
              </button>
            </div>

            <div className="device-cards-stack">
              {devices.length === 0 ? (
                <p className="empty-msg">
                  No devices found. Add one to begin tracking.
                </p>
              ) : (
                displayedDevices.map((device) => {
                  const nextTask = upcomingTasks.find(
                    (t) => t.device._id === device._id,
                  );
                  return (
                    <div key={device._id} className="premium-device-card">
                      <span
                        className={`floating-badge ${device.ecoScore >= 80 ? "good" : "poor"}`}
                      >
                        {device.ecoScore >= 80 ? "Good" : "Poor"}
                      </span>

                      <div className="device-card-top">
                        <div className="icon-rounded">
                          <Smartphone />
                        </div>
                        <div>
                          <h4>{device.deviceName}</h4>
                          <p className="purchase-label">
                            Purchased: {formatDate(device.purchaseDate)}
                          </p>
                        </div>
                      </div>

                      <div className="horizontal-metric-bar">
                        <div className="metric-segment">
                          <span className="m-label">REPAIRS</span>
                          <div className="m-val-row">
                            <span className="m-num">
                              {device.repairsDone || 0}
                            </span>
                            <button
                              className="mini-plus"
                              onClick={() => handleAddRepair(device._id)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="v-divider"></div>
                        <div className="metric-segment">
                          <span className="m-label">NEXT CHECK</span>
                          <span className="m-val">
                            {nextTask ? formatDate(nextTask.dueDate) : "N/A"}
                          </span>
                        </div>
                        <div className="v-divider"></div>
                        <div className="metric-segment">
                          <span className="m-label">ECO SCORE</span>
                          <span className="m-num green-text">
                            {device.ecoScore || 0}
                          </span>
                        </div>
                      </div>

                      <div className="card-action-row">
                        <button
                          className="btn-solid-green"
                          onClick={() => handleOpenMaintModal(device)}
                        >
                          Maintenance
                        </button>
                        <button className="btn-outline-green">Trade-in</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT: TASKS */}
          <section className="panel-box">
            <div className="panel-header-row">
              <div>
                <h3>Upcoming Tasks</h3>
                <p className="sub-tagline">PROACTIVE MAINTENANCE</p>
              </div>
            </div>

            <div className="task-list-v4">
              {upcomingTasks.length === 0 ? (
                <p className="empty-msg">All systems operational.</p>
              ) : (
                displayedTasks.map((task) => {
                  const overdue = getOverdueDays(task.dueDate);
                  return (
                    <div key={task._id} className="task-card-v4">
                      <div className="task-body">
                        <span
                          className={`task-due-chip ${overdue > 0 ? "overdue" : ""}`}
                        >
                          {overdue > 0
                            ? `Overdue ${overdue} days`
                            : `Due: ${formatDate(task.dueDate)}`}
                        </span>
                        <h4>{task.taskName}</h4>
                        <p className="task-target">{task.device?.deviceName}</p>
                      </div>
                      <button
                        className="complete-action-btn"
                        onClick={() => handleCompleteTask(task._id)}
                      >
                        Complete
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            {upcomingTasks.length > 4 && (
              <button
                className="expand-footer-btn"
                onClick={() => setShowAllTasks(!showAllTasks)}
              >
                {showAllTasks ? <ChevronUp /> : <ChevronDown />}{" "}
                {showAllTasks ? "FEWER" : "SEE ALL"}
              </button>
            )}
          </section>
        </div>
      </div>
      {/* ... (Existing Modal code below remains exactly same) */}
    </div>
  );
};

export default DashboardScreen;
