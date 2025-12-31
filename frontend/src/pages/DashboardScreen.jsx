import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import "./Dashboard.css";

// Helper function to calculate "Overdue" days
const getOverdueDays = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Helper function to format dates
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

  const [dismissedTasks, setDismissedTasks] = useState([]);

  const fetchData = async () => {
    if (!userInfo) return;
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
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

  const handleAddDeviceSubmit = async (e) => {
    e.preventDefault();
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
    try {
      const deviceData = { deviceName, deviceModel, purchaseDate, category };
      await axios.post("/api/devices", deviceData, config);

      toast.success("Device added & maintenance scheduled!");
      setDeviceName("");
      setDeviceModel("");
      setPurchaseDate("");
      setCategory("Smartphone");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // --- NEW: DELETE HANDLER ---
  const handleDeleteDevice = async (deviceId) => {
    if (
      !window.confirm(
        "Are you sure? This will delete the device and all its tasks."
      )
    )
      return;

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
    try {
      await axios.delete(`/api/devices/${deviceId}`, config);
      toast.success("Device deleted");
      setIsMaintModalOpen(false); // Close the modal
      fetchData(); // Refresh all data
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // --- NEW: ADD REPAIR HANDLER ---
  const handleAddRepair = async (deviceId) => {
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
    try {
      await axios.put(`/api/devices/${deviceId}/addrepair`, {}, config);
      toast.success("Repair count updated!");
      fetchData(); // Refresh all data
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleOpenMaintModal = async (device) => {
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
    try {
      const { data } = await axios.get(
        `/api/tasks/device/${device._id}`,
        config
      );
      setSelectedDeviceTasks(data);
      setSelectedDevice(device);
      setIsMaintModalOpen(true);
    } catch (err) {
      toast.error("Could not fetch maintenance tasks");
    }
  };

  const handleCompleteTask = async (taskId) => {
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
    try {
      await axios.put(`/api/tasks/${taskId}/complete`, {}, config);
      toast.success("Task completed!");

      await fetchData();

      // Re-fetch data for the modal
      const { data } = await axios.get(
        `/api/tasks/device/${selectedDevice._id}`,
        config
      );
      setSelectedDeviceTasks(data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleComplete = (taskId) => {
    setDismissedTasks([...dismissedTasks, taskId]);
    toast.success("Task marked as complete!");
  };

  const totalRepairs = devices.reduce((acc, dev) => acc + dev.repairsDone, 0);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* --- HEADER --- */}
      <div className="dashboard-header">
        <div>
          <h2>Device Lifecycle Tracker</h2>
          <p>
            Monitor your devices' health and get automatic maintenance
            reminders.
          </p>
        </div>
        <button
          className="add-device-btn"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Device
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{devices.length}</h3>
          <p>Active Devices</p>
        </div>
        <div className="stat-card">
          <h3>{totalRepairs}</h3>
          <p>Repairs Done</p>
        </div>
        <div className="stat-card">
          <h3>{upcomingTasks.length}</h3>
          <p>Pending Tasks</p>
        </div>
        <div className="stat-card">
          <h3>...</h3>
          <p>Avg. Eco Score</p>
        </div>
      </div>

      {/* --- MAIN 2-COLUMN LAYOUT --- */}
      <div className="dashboard-main-content">
        {/* --- LEFT SIDE: YOUR DEVICES --- */}
        <div className="your-devices-section">
          <h3>Your Devices</h3>
          <div className="device-list">
            {devices.length === 0 ? (
              <p>
                You haven't added any devices yet. Click "+ Add Device" to
                start.
              </p>
            ) : (
              devices.map((device) => {
                const nextTask = upcomingTasks.find(
                  (t) => t.device._id === device._id
                );
                return (
                  <div key={device._id} className="device-card-v3">
                    <span
                      className={`status-badge ${
                        device.ecoScore >= 80 ? "good" : "fail"
                      }`}
                    >
                      {device.ecoScore >= 80 ? "Good" : "Poor"}
                    </span>
                    <div className="device-card-header">
                      <span className="device-icon">📱</span>
                      <div>
                        <h4>{device.deviceName}</h4>
                        <p>Purchased: {formatDate(device.purchaseDate)}</p>
                      </div>
                    </div>
                    <div className="device-card-body">
                      <div className="metric-item">
                        <h5>
                          {device.repairsDone}
                          {/* --- NEW: ADD REPAIR BUTTON --- */}
                          <button
                            className="add-repair-btn"
                            onClick={() => handleAddRepair(device._id)}
                          >
                            +
                          </button>
                        </h5>
                        <p>Repairs</p>
                      </div>
                      <div className="metric-item">
                        <h5>
                          {nextTask ? formatDate(nextTask.dueDate) : "N/A"}
                        </h5>
                        <p>Next Check</p>
                      </div>
                      <div className="metric-item">
                        <h5>{device.ecoScore || 0}</h5>
                        <p>Eco Score</p>
                      </div>
                    </div>
                    <div className="device-card-footer">
                      <button
                        className="maint-button"
                        onClick={() => handleOpenMaintModal(device)}
                      >
                        Maintenance
                      </button>
                      <button className="trade-in-button" disabled>
                        Trade-in
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: REMINDERS --- */}
        <div className="reminders-section">
          <h3>Upcoming Tasks</h3>
          <p>Proactive maintenance to prevent repairs.</p>
          <div className="task-list">
            {upcomingTasks.length === 0 ? (
              <p>No upcoming tasks. You're all set!</p>
            ) : (
              upcomingTasks.map((task) => {
                const overdueDays = getOverdueDays(task.dueDate);
                return (
                  <div key={task._id} className="task-card">
                    <div className="task-info">
                      <strong>{task.taskName}</strong>
                      <span className="task-device-name">
                        {task.device.deviceName}
                      </span>
                      {overdueDays > 0 ? (
                        <span className="task-due overdue">
                          Overdue by {overdueDays} days
                        </span>
                      ) : (
                        <span className="task-due">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <button
                      className="task-complete-btn"
                      onClick={() => handleCompleteTask(task._id)}
                    >
                      Complete
                    </button>
                  </div>
                );
              })
            )}
            
          </div>
        </div>
      </div>

      {/* --- MODAL 1: ADD DEVICE --- */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Add a New Device</h2>
          <button
            className="modal-close-btn"
            onClick={() => setIsAddModalOpen(false)}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleAddDeviceSubmit} className="modal-form">
          {/* (The form fields are identical to V3.0) */}
          <div className="form-group">
            <label>Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Gaming Console">Gaming Console</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="auth-button green"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            Add Device
          </button>
        </form>
      </Modal>

      {/* --- MODAL 2: MAINTENANCE TASKS --- */}
      <Modal
        isOpen={isMaintModalOpen}
        onRequestClose={() => setIsMaintModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Maintenance for {selectedDevice?.deviceName}</h2>
          <button
            className="modal-close-btn"
            onClick={() => setIsMaintModalOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="task-list">
          {selectedDeviceTasks.length === 0 ? (
            <p>No tasks found for this device.</p>
          ) : (
            selectedDeviceTasks.map((task) => (
              <div
                key={task._id}
                className="task-card"
                style={{
                  backgroundColor: task.isComplete ? "#e6f7ec" : "#fdf6f6",
                }}
              >
                <div className="task-info">
                  <strong>{task.taskName}</strong>
                  {task.isComplete ? (
                    <span className="task-due" style={{ color: "green" }}>
                      Completed: {formatDate(task.completedAt)}
                    </span>
                  ) : (
                    <span className="task-due">
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
                {!task.isComplete && (
                  <button
                    className="task-complete-btn"
                    onClick={() => handleCompleteTask(task._id)}
                  >
                    Complete
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* --- NEW: DELETE BUTTON INSIDE MODAL --- */}
        <button
          className="delete-button-modal"
          onClick={() => handleDeleteDevice(selectedDevice._id)}
        >
          Delete This Device
        </button>
      </Modal>
    </div>
  );
};

export default DashboardScreen;
