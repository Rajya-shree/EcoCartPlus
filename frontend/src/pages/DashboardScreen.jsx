import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css";
// This import is correct, make sure this file exists
import { generateMaintenanceReminders } from "../utils/maintenance.js";

const DashboardScreen = () => {
  const { userInfo } = useAuth();
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const getMyDevices = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/devices", config);
      setDevices(data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (userInfo) {
      getMyDevices();
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!deviceName) {
      toast.error("Device name is required");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      const deviceData = {
        deviceName,
        deviceModel,
        purchaseDate,
      };

      const { data } = await axios.post("/api/devices", deviceData, config);

      toast.success("Device added!");
      setDeviceName("");
      setDeviceModel("");
      setPurchaseDate("");
      getMyDevices();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (!userInfo) {
    return <div>Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {userInfo.username}!</h1>{" "}
      <p>This is your personalized maintenance hub.</p>{" "}
      <div className="dashboard-content">
        {" "}
        <div className="device-form-container">
          <h3>Add a New Device</h3>{" "}
          <form onSubmit={submitHandler} className="device-form">
            {/* Your form inputs... (no change needed here) */}{" "}
            <div className="form-group">
              <label>Device Name (e.g., "Dell XPS 15")</label>{" "}
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
              />{" "}
            </div>{" "}
            <div className="form-group">
              <label>Model (e.g., "9510")</label>{" "}
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
              />{" "}
            </div>{" "}
            <div className="form-group">
              <label>Purchase Date</label>{" "}
              <input
                _x0009_
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />{" "}
            </div>{" "}
            <button type="submit" className="auth-button green">
              Add Device{" "}
            </button>{" "}
          </form>{" "}
        </div>{" "}
        <div className="device-list-container">
          <h3>My Devices</h3>{" "}
          <div className="device-list">
            {" "}
            {devices.length === 0 ? (
              <p>You haven't added any devices yet.</p>
            ) : (
              // --- THIS IS THE BLOCK YOU REPLACED ---
              devices.map((device) => {
                // Get the list of reminders for this device
                const reminders = generateMaintenanceReminders(
                  device.purchaseDate
                );

                return (
                  <div key={device._id} className="device-card">
                    <h4>{device.deviceName}</h4>
                    <p>Model: {device.deviceModel || "N/A"}</p>
                    <p>Purchased: {formatDate(device.purchaseDate)}</p>

                    <div className="maintenance-list">
                      <strong>Maintenance Tasks:</strong>
                      <ul>
                        {reminders.map((reminder, index) => (
                          <li key={index}>{reminder}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })
              // --- END OF THE REPLACED BLOCK ---
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default DashboardScreen;
