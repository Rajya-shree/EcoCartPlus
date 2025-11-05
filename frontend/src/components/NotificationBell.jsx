import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaBell } from 'react-icons/fa'; // Import the bell icon
import './NotificationBell.css';

const NotificationBell = () => {
  const { userInfo } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!userInfo) return;

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };
    try {
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Fetch notifications when the component loads
  useEffect(() => {
    fetchNotifications();
    
    // Also fetch notifications every 1 minute
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); 

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  }, [userInfo]);

  const onBellClick = async () => {
    // Toggle the dropdown
    setIsOpen(!isOpen);

    // If opening the dropdown and there are new notifications, mark them as read
    if (!isOpen && notifications.length > 0) {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      try {
        // Call the "mark as read" endpoint
        await axios.put('/api/notifications/read', {}, config);
        // After a short delay, update the UI (so the dot doesn't vanish instantly)
        setTimeout(() => {
          setNotifications([]); // Clear the list
        }, 3000); // 3-second delay
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  return (
    <div className="notification-bell">
      <FaBell className="bell-icon" onClick={onBellClick} />
      {notifications.length > 0 && <span className="notification-dot"></span>}

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif._id} className="notification-item">
                  <strong>{notif.task.device.deviceName}</strong>: {notif.message}
                </div>
              ))
            ) : (
              <p className="no-notifications">No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;