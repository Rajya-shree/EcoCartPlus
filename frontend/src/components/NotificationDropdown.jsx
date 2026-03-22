// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   AlertCircle,
//   CheckCircle,
//   X,
//   ShieldCheck,
//   Trash2,
//   Settings,
//   Clock,
// } from "lucide-react";
// import { NOTIFICATIONS_URL, TASKS_URL } from "../utils/constants";
// import "./NotificationDropdown.css";

// // 🟢 1. Cleaned up props (It only needs userInfo and onClose now)
// const NotificationDropdown = ({ userInfo, onClose }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🟢 FETCH ITS OWN DATA ON OPEN
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if (!userInfo?.token) return;
//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${userInfo.token}` },
//         };
//         const { data } = await axios.get(NOTIFICATIONS_URL, config);
//         setNotifications(data);
//       } catch (err) {
//         console.error("Dropdown sync failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, [userInfo]);

//   const safeNotifications = Array.isArray(notifications) ? notifications : [];

//   const handleClearAll = async () => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(`${NOTIFICATIONS_URL}/read`, {}, config);

//       setNotifications([]);
//       onClose();
//       // 🟢 NEW: Yell at the Sidebar to update its count to 0!
//       window.dispatchEvent(new Event("forceNotificationRefresh"));
//     } catch (err) {
//       console.error("Failed to clear notifications", err);
//     }
//   };

//   const getTimeAgo = (dateString) => {
//     if (!dateString) return "NEW";
//     const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor(seconds / 60);
//     if (hours > 24) return Math.floor(hours / 24) + "D AGO";
//     if (hours > 0) return hours + "H AGO";
//     if (minutes > 0) return minutes + "M AGO";
//     return "JUST NOW";
//   };

//   const handleSnooze = async (taskId) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(`${TASKS_URL}/${taskId}/snooze`, {}, config);

//       // Instantly remove it from the UI feed
//       setNotifications((prev) => prev.filter((n) => n.task?._id !== taskId));

//       // Update the Sidebar badge count
//       window.dispatchEvent(new Event("forceNotificationRefresh"));
//     } catch (err) {
//       console.error("Failed to snooze task", err);
//     }
//   };

//   return (
//     <div className="feed-backdrop" onClick={onClose}>
//       <div className="feed-panel" onClick={(e) => e.stopPropagation()}>
//         <div className="feed-drag-handle"></div>
//         {/* HEADER */}
//         <div className="feed-header">
//           <div className="feed-header-content">
//             <div className="feed-title-row">
//               <div className="feed-icon-bg">
//                 <ShieldCheck size={20} color="#10b981" />
//               </div>
//               <h2>Intelligence Feed</h2>
//             </div>
//             <p className="feed-subtitle">REAL-TIME PLATFORM ALERTS</p>
//           </div>
//           <button className="feed-close-btn" onClick={onClose}>
//             <X size={20} />
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="feed-body">
//           {/* 🟢 2. Added the loading UI back so it says "Syncing Nodes..." while fetching */}
//           {loading ? (
//             <div className="feed-empty">
//               <p style={{ color: "#94a3b8", fontWeight: 600 }}>
//                 Syncing Nodes...
//               </p>
//             </div>
//           ) : safeNotifications.length === 0 ? (
//             <div className="feed-empty">
//               <ShieldCheck size={48} color="#10b981" strokeWidth={1} />
//               <p>System Integrity Nominal</p>
//               <span>All nodes are functioning within normal parameters.</span>
//             </div>
//           ) : (
//             safeNotifications.map((n) => {
//               const isUrgent =
//                 n.message?.toLowerCase().includes("urgent") ||
//                 n.message?.toLowerCase().includes("overdue");

//               return (
//                 <div
//                   key={n._id || Math.random()}
//                   className={`feed-card ${isUrgent ? "high-priority" : "normal-priority"}`}
//                 >
//                   <div className="feed-card-icon">
//                     {isUrgent ? (
//                       <AlertCircle size={24} />
//                     ) : (
//                       <CheckCircle size={24} />
//                     )}
//                   </div>

//                   {/* <div className="feed-card-content">
//                     <div className="feed-card-top">
//                       <span className="feed-badge">
//                         {isUrgent ? "HIGH PRIORITY" : "NORMAL PRIORITY"}
//                       </span>
//                       <span className="feed-time">
//                         {getTimeAgo(n.createdAt)}
//                         <span className="pulse-dot"></span>
//                       </span>
//                     </div>

//                     <h4>{n.task?.device?.deviceName || "System Alert"}</h4>
//                     <p>{n.message}</p>
//                   </div> */}
//                   <div className="feed-card-content">
//                     <div className="feed-card-top">
//                       <div className="feed-top-left">
//                         <span className="feed-badge">
//                           {isUrgent ? "HIGH PRIORITY" : "NORMAL PRIORITY"}
//                         </span>
//                         <span className="feed-time">
//                           {getTimeAgo(n.createdAt)}
//                           <span className="pulse-dot"></span>
//                         </span>
//                       </div>

//                       {/* MIDDLE: Title and Message */}
//                       <h4>{n.task?.device?.deviceName || "System Alert"}</h4>
//                       <p>{n.message}</p>

//                       {/* BOTTOM: Big Snooze Button */}
//                       <div className="feed-card-actions">
//                         <button
//                           className="snooze-action-btn"
//                           onClick={() => handleSnooze(n.task?._id)}
//                         >
//                           <Clock size={18} />
//                           Remind Me Later
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* FOOTER */}
//         <div className="feed-footer">
//           <button
//             className="feed-action-btn purge"
//             onClick={handleClearAll}
//             disabled={safeNotifications.length === 0 || loading}
//           >
//             <Trash2 size={16} />
//             PURGE FEED
//           </button>
//           {/* <button
//             className="feed-action-btn config"
//             onClick={() => console.log("Config clicked")}
//           >
//             <Settings size={16} />
//             NODE CONFIG
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationDropdown;
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
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   AlertCircle,
//   CheckCircle,
//   Zap,
//   X,
//   Bell,
//   ShieldCheck,
// } from "lucide-react";
// import { LIFECYCLE_URL, NOTIFICATIONS_URL } from "../utils/constants";
// import "./NotificationDropdown.css"; // Dedicated CSS

// const NotificationDropdown = ({
//   userInfo,
//   notifications,
//   setNotifications,
//   onClose,
// }) => {
//   // const [notifications, setNotifications] = useState([]);
//   // const [loading, setLoading] = useState(true);

//   // // 🟢 SELF-CONTAINED FETCHING LOGIC
//   // useEffect(() => {
//   //   const fetchNotifications = async () => {
//   //     if (!userInfo?.token) return;
//   //     try {
//   //       const config = {
//   //         headers: { Authorization: `Bearer ${userInfo.token}` },
//   //       };
//   //       const { data } = await axios.get(NOTIFICATIONS_URL, config);

//   //       // Filter for devices needing maintenance from your DB
//   //       //const alerts = data.filter((d) => d.status === "Needs Maintenance");
//   //       setNotifications(data);
//   //     } catch (err) {
//   //       console.error("Dropdown sync failed", err);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
//   //   fetchNotifications();
//   // }, [userInfo]);

//   // 🟢 NEW: CLEAR LOGIC
//   // const handleClearAll = async () => {
//   //   try {
//   //     const config = {
//   //       headers: { Authorization: `Bearer ${userInfo.token}` },
//   //     };

//   //     // Tell the backend database to mark all as read
//   //     await axios.put(`${NOTIFICATIONS_URL}/read`, {}, config);

//   //     // Clear the UI and close the dropdown
//   //     setNotifications([]);
//   //     onClose();
//   //   } catch (err) {
//   //     console.error("Failed to clear notifications", err);
//   //   }
//   // };
//   const handleClearAll = async () => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(`${NOTIFICATIONS_URL}/read`, {}, config);

//       setNotifications([]); // Instantly clear in the UI
//       onClose(); // Close the dropdown
//     } catch (err) {
//       console.error("Failed to clear notifications", err);
//     }
//   };

//   return (
//     <div className="notif-popup-overlay animate-in fade-in zoom-in-95 duration-200">
//       {/* Header with Title and Close button */}
//       <div className="notif-popup-header">
//         <div className="notif-header-left">
//           <span className="notif-dot"></span>
//           <h3 className="notif-title">LIVE ALERTS</h3>
//         </div>
//         <button onClick={onClose} className="notif-close-btn">
//           <X size={14} />
//         </button>
//       </div>

//       {/* Body containing the scrollable list */}
//       <div className="notif-popup-body">
//         {loading ? (
//           <div className="notif-state-msg">Syncing Nodes...</div>
//         ) : notifications.length === 0 ? (
//           <div className="notif-empty-state">
//             <ShieldCheck
//               size={28}
//               className="text-emerald-500 mb-2 opacity-20"
//             />
//             <p>System Integrity Nominal</p>
//           </div>
//         ) : (
//           notifications.map((n) => (
//             <div key={n._id} className="notif-card unread">
//               <div className="notif-card-icon">
//                 <AlertCircle size={16} className="text-rose-500" />
//               </div>
//               <div className="notif-card-content">
//                 {/* 🟢 Correct Mapping based on your backend populated fields */}
//                 <h4 className="notif-card-title">
//                   {n.task?.device?.deviceName || "System Alert"}
//                 </h4>
//                 <p className="notif-card-desc">{n.message}</p>
//               </div>
//               <div className="notif-unread-indicator"></div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Footer with Clear Action */}
//       <div className="notif-popup-footer">
//         <button className="notif-clear-btn" onClick={handleClearAll}>
//           CLEAR ALL ALERTS
//         </button>
//       </div>
//     </div>
//   );
// };

// export default NotificationDropdown;
