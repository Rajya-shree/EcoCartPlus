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
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { LIFECYCLE_URL, NOTIFICATIONS_URL } from "../utils/constants";
import NotificationDropdown from "./NotificationDropdown";
import "./Sidebar.css";

const Sidebar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // 🟢 Controls mobile slide-in
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // Fixed missing state
  const notifyRef = useRef(null);

  // 🟢 NEW: Automatically close mobile sidebar when clicking a link
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const getCount = async () => {
      if (!userInfo?.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(NOTIFICATIONS_URL, config);
        setNotifCount(data.length);
      } catch (err) {
        console.error("Count sync failed", err);
      }
    };
    getCount();
    const interval = setInterval(getCount, 300000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const checkNotifications = async () => {
    if (!userInfo || !userInfo.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(LIFECYCLE_URL, config);
      const needsAttention = data.filter(
        (device) => device.status === "Needs Maintenance"
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

  // 🟢 We removed the `<NavContent>` sub-component and put the HTML directly here
  return (
    <>
      {/* 🟢 MOBILE HAMBURGER BUTTON (Hidden on Desktop) */}
      {!isMobileOpen && (
        <button 
          className="mobile-hamburger-btn" 
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      {/* 🟢 MOBILE DARK OVERLAY (Click outside to close) */}
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* 🟢 MAIN SIDEBAR ASIDE */}
      <aside
        className={`sidebar-aside ${isCollapsed ? "collapsed" : "expanded"} ${isMobileOpen ? "mobile-open" : ""}`}
      >
        <div className={`sidebar-wrapper ${isCollapsed ? "is-collapsed" : ""}`}>
          
          {/* Header & Brand */}
          <div className="sidebar-header">
            <div className="brand-box">
              <div className="brand-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  className="logo-icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <Leaf color="white" size={20} />
                </div>
                {!isCollapsed && <span className="brand-name">EcoNova+</span>}
              </div>
              
              {/* 🟢 MOBILE CLOSE BUTTON (X) */}
              <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className="nav-item">
              <LayoutDashboard size={22} className="icon" />
              {!isCollapsed && <span>Command Hub</span>}
            </NavLink>
            <NavLink to="/green-shopping" className="nav-item">
              <ShoppingCart size={22} className="icon" />
              {!isCollapsed && <span>Green Advisor</span>}
            </NavLink>
            <NavLink to="/diagnosis" className="nav-item">
              <Wrench size={22} className="icon" />
              {!isCollapsed && <span>Repair Intelligence</span>}
            </NavLink>
            {userInfo && userInfo.token && (
              <NavLink to="/lifecycle" className="nav-item">
                <Clock size={22} className="icon" />
                {!isCollapsed && <span>Lifecycle Engine</span>}
              </NavLink>
            )}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            {userInfo && userInfo.token ? (
              <>
                {/* Notifications */}
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

                {/* User Profile */}
                <div className="user-card">
                  <div className="avatar">
                    {userInfo.username[0].toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="user-info">
                      <p className="username">{userInfo.username}</p>
                      <p className="status">Verified Node</p>
                    </div>
                  )}
                </div>

                {/* Terminate (Logout) */}
                {!isCollapsed && (
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
                {!isCollapsed && <span>Initialize Core</span>}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;