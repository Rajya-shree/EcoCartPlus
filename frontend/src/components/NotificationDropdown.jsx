import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  Zap,
  X,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { LIFECYCLE_URL, NOTIFICATIONS_URL } from "../utils/constants";
import "./NotificationDropdown.css"; // Dedicated CSS

const NotificationDropdown = ({ userInfo, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 SELF-CONTAINED FETCHING LOGIC
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userInfo?.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(NOTIFICATIONS_URL, config);

        // Filter for devices needing maintenance from your DB
        //const alerts = data.filter((d) => d.status === "Needs Maintenance");
        setNotifications(data);
      } catch (err) {
        console.error("Dropdown sync failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userInfo]);

  // 🟢 NEW: CLEAR LOGIC
  const handleClearAll = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      // Tell the backend database to mark all as read
      await axios.put(`${NOTIFICATIONS_URL}/read`, {}, config);

      // Clear the UI and close the dropdown
      setNotifications([]);
      onClose();
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  return (
    <div className="notif-popup-overlay animate-in fade-in zoom-in-95 duration-200">
      {/* Header with Title and Close button */}
      <div className="notif-popup-header">
        <div className="notif-header-left">
          <span className="notif-dot"></span>
          <h3 className="notif-title">LIVE ALERTS</h3>
        </div>
        <button onClick={onClose} className="notif-close-btn">
          <X size={14} />
        </button>
      </div>

      {/* Body containing the scrollable list */}
      <div className="notif-popup-body">
        {loading ? (
          <div className="notif-state-msg">Syncing Nodes...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty-state">
            <ShieldCheck
              size={28}
              className="text-emerald-500 mb-2 opacity-20"
            />
            <p>System Integrity Nominal</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="notif-card unread">
              <div className="notif-card-icon">
                <AlertCircle size={16} className="text-rose-500" />
              </div>
              <div className="notif-card-content">
                {/* 🟢 Correct Mapping based on your backend populated fields */}
                <h4 className="notif-card-title">
                  {n.task?.device?.deviceName || "System Alert"}
                </h4>
                <p className="notif-card-desc">{n.message}</p>
              </div>
              <div className="notif-unread-indicator"></div>
            </div>
          ))
        )}
      </div>

      {/* Footer with Clear Action */}
      <div className="notif-popup-footer">
        <button className="notif-clear-btn" onClick={onClose}>
          CLEAR ALL ALERTS
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
