import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Clock,
  Leaf,
  LogOut,
  Bell,
  LogIn,
  Menu,
  ChevronRight,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { LIFECYCLE_URL, NOTIFICATIONS_URL } from "../utils/constants";
import NotificationDropdown from "./NotificationDropdown"; // 🟢 NEW IMPORT
import "./Sidebar.css";

const Sidebar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const getCount = async () => {
      if (!userInfo?.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(NOTIFICATIONS_URL, config);
        // Set count based on devices needing maintenance
        // setNotifCount(
        //   data.filter((d) => d.status === "Needs Maintenance").length,
        // );
        setNotifCount(data.length);
      } catch (err) {
        console.error("Count sync failed", err);
      }
    };
    getCount();
    // Refresh every 5 minutes
    const interval = setInterval(getCount, 300000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const notifyRef = useRef(null);

  const checkNotifications = async () => {
    if (!userInfo || !userInfo.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(LIFECYCLE_URL, config);
      const needsAttention = data.filter(
        (device) => device.status === "Needs Maintenance",
      );
      setNotifications(needsAttention);
    } catch (err) {
      console.error("Sidebar sync failed", err);
    }
  };

  useEffect(() => {
    checkNotifications();
  }, [userInfo]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavContent = ({ mobile = false }) => {
    const isActuallyCollapsed = !mobile && isCollapsed;

    return (
      <div
        className={`sidebar-wrapper ${isActuallyCollapsed ? "is-collapsed" : ""}`}
      >
        <div className="sidebar-header">
          <div className="brand-box">
            <div
              className="logo-icon"
              onClick={() => !mobile && setIsCollapsed(!isCollapsed)}
              style={{ cursor: "pointer" }}
            >
              <Leaf color="white" size={20} />
            </div>
            {!isActuallyCollapsed && (
              <span className="brand-name">EcoNova+</span>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-item">
            <LayoutDashboard size={22} className="icon" />
            {!isActuallyCollapsed && <span>Command Hub</span>}
          </NavLink>
          <NavLink to="/green-shopping" className="nav-item">
            <ShoppingCart size={22} className="icon" />
            {!isActuallyCollapsed && <span>Green Advisor</span>}
          </NavLink>
          <NavLink to="/diagnosis" className="nav-item">
            <Wrench size={22} className="icon" />
            {!isActuallyCollapsed && <span>Repair Intelligence</span>}
          </NavLink>
          {userInfo && userInfo.token && (
            <NavLink to="/lifecycle" className="nav-item">
              <Clock size={22} className="icon" />
              {!isActuallyCollapsed && <span>Lifecycle Engine</span>}
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {userInfo && userInfo.token ? (
            <>
              {/* 🟢 BELL PLACED HERE: COMPLETELY ABOVE THE BOX */}
              {/* {!isActuallyCollapsed && (
                <div className="notification-bell-container" style={{ position: 'relative' }}>
                  <div 
                    className="notification-bell-trigger" 
                    ref={notifyRef} 
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell size={20} color="#94a3b8" />
                    {notifications.length > 0 && (
                      <span className="bell-badge">
                        {notifications.length} <p>Notification</p>
                      </span>
                    )}
                  </div>
                  
                  {showNotifications && (
                    <NotificationDropdown 
                      notifications={notifications} 
                      onClose={() => setShowNotifications(false)}
                      markAsRead={(id) => {/* sync logic }}
                    />
                  )}
                </div>
              )} */}
              {/* 🟢 TRIGGER ONLY: Functional logic is now inside the Dropdown file */}
              {!isCollapsed && (
                <div className="feed-trigger-wrapper" ref={notifyRef}>
                  <button
                    className={`feed-item ${showNotifications ? "active" : ""}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <div className="feed-left">
                      <Bell size={20} />
                      <span>Feed</span>
                    </div>
                    {/* You can pass notification count through props if you still want it on the badge, 
                otherwise the dropdown handles the details */}
                    <span className="feed-badge">
                      {notifCount > 0 ? notifCount : 0}
                    </span>
                  </button>

                  {showNotifications && (
                    <NotificationDropdown
                      userInfo={userInfo}
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>
              )}

              <div className="user-card">
                <div
                  className="user-card-main"
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div className="avatar">
                    {userInfo.username[0].toUpperCase()}
                  </div>
                  {!isActuallyCollapsed && (
                    <div className="user-info">
                      <p className="username">{userInfo.username}</p>
                      <p className="status">Verified Node</p>
                    </div>
                  )}
                </div>
              </div>

              {!isActuallyCollapsed && (
                <button onClick={handleLogout} className="terminate-btn">
                  <LogOut size={14} /> <span>Terminate</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="login-trigger-btn"
            >
              <LogIn size={20} />{" "}
              {!isActuallyCollapsed && <span>Initialize Core</span>}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside
      //   className={`hidden lg:block h-screen sticky top-0 shrink-0 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-80"}`}
      className={`sidebar-aside ${isCollapsed ? "collapsed" : "expanded"}`}
    >
      <NavContent />
    </aside>
  );
};

export default Sidebar;
