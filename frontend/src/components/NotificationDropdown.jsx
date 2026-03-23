import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  X,
  ShieldCheck,
  Trash2,
  Settings,
  Clock,
} from "lucide-react";
import { NOTIFICATIONS_URL, TASKS_URL } from "../utils/constants";
import "./NotificationDropdown.css";

const NotificationDropdown = ({ userInfo, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userInfo?.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(NOTIFICATIONS_URL, config);
        setNotifications(data);
      } catch (err) {
        console.error("Dropdown sync failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userInfo]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const handleClearAll = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${NOTIFICATIONS_URL}/read`, {}, config);

      setNotifications([]);
      onClose();
      window.dispatchEvent(new Event("forceNotificationRefresh"));
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "NEW";
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60);
    if (hours > 24) return Math.floor(hours / 24) + "D AGO";
    if (hours > 0) return hours + "H AGO";
    if (minutes > 0) return minutes + "M AGO";
    return "JUST NOW";
  };

  const handleSnooze = async (taskId) => {
    // try {
    //   const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    //   await axios.put(`${TASKS_URL}/${taskId}/snooze`, {}, config);

    //   setNotifications((prev) => prev.filter((n) => n.task?._id !== taskId));
    //   window.dispatchEvent(new Event("forceNotificationRefresh"));
    // } catch (err) {
    //   console.error("Failed to snooze task", err);
    // }
    // 1. OPTIMISTIC UI: Instantly hide it from the screen so it feels fast
    setNotifications((prev) => prev.filter((n) => n.task?._id !== taskId));

    // 2. Instantly drop the red badge counter in the Sidebar by 1
    window.dispatchEvent(new Event("forceNotificationRefresh"));

    try {
      // 3. Tell the backend to do the heavy lifting in the background
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${TASKS_URL}/${taskId}/snooze`, {}, config);
    } catch (err) {
      console.error("Failed to snooze task", err);
    }
  };

  return (
    <div className="feed-backdrop" onClick={onClose}>
      <div className="feed-panel" onClick={(e) => e.stopPropagation()}>
        <div className="feed-drag-handle"></div>

        {/* HEADER */}
        <div className="feed-header">
          <div className="feed-header-content">
            <div className="feed-title-row">
              <div className="feed-icon-bg">
                <ShieldCheck size={20} color="#10b981" />
              </div>
              <h2>Intelligence Feed</h2>
            </div>
            <p className="feed-subtitle">REAL-TIME PLATFORM ALERTS</p>
          </div>
          <button className="feed-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="feed-body">
          {loading ? (
            <div className="feed-empty">
              <p style={{ color: "#94a3b8", fontWeight: 600 }}>
                Syncing Nodes...
              </p>
            </div>
          ) : safeNotifications.length === 0 ? (
            <div className="feed-empty">
              <ShieldCheck size={48} color="#10b981" strokeWidth={1} />
              <p>System Integrity Nominal</p>
              <span>All nodes are functioning within normal parameters.</span>
            </div>
          ) : (
            safeNotifications.map((n) => {
              const isUrgent =
                n.message?.toLowerCase().includes("urgent") ||
                n.message?.toLowerCase().includes("overdue");

              return (
                <div
                  key={n._id || Math.random()}
                  className={`feed-card ${isUrgent ? "high-priority" : "normal-priority"}`}
                >
                  {/* ICON ON THE LEFT */}
                  <div className="feed-card-icon">
                    {isUrgent ? (
                      <AlertCircle size={24} />
                    ) : (
                      <CheckCircle size={24} />
                    )}
                  </div>

                  {/* CONTENT ON THE RIGHT */}
                  <div className="feed-card-content">
                    {/* TOP ROW: Badge and Time */}
                    <div className="feed-card-top">
                      <div className="feed-top-left">
                        <span className="feed-badge">
                          {isUrgent ? "HIGH PRIORITY" : "NORMAL PRIORITY"}
                        </span>
                        <span className="feed-time">
                          {getTimeAgo(n.createdAt)}
                          <span className="pulse-dot"></span>
                        </span>
                      </div>
                    </div>

                    {/* MIDDLE: Title and Message */}
                    <h4>{n.task?.device?.deviceName || "System Alert"}</h4>
                    <p>{n.message}</p>

                    {/* BOTTOM: Big Snooze Button */}
                    <div className="feed-card-actions">
                      <button
                        className="snooze-action-btn"
                        onClick={() => handleSnooze(n.task?._id)}
                      >
                        <Clock size={14} />
                        Remind Me Later
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="feed-footer">
          <button
            className="feed-action-btn purge"
            onClick={handleClearAll}
            disabled={safeNotifications.length === 0 || loading}
          >
            <Trash2 size={16} />
            PURGE FEED
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
