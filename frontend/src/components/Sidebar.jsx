import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Sidebar.css'; // Your new CSS file

const Sidebar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="sidebar">
      <NavLink to="/" className="sidebar-logo">
        EcoCartPlus
      </NavLink>

      {/* Main App Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/" end className="sidebar-link">
          AI Repair Advisor
        </NavLink>
        <NavLink to="/eco-shopping" className="sidebar-link">
          Green Shopping
        </NavLink>
        
        {/* Only show "Lifecycle Tracker" if user is logged in */}
        {userInfo && (
          <NavLink to="/dashboard" className="sidebar-link">
            Lifecycle Tracker
          </NavLink>
        )}
      </nav>

      {/* User Info & Logout (at the bottom) */}
      <div className="sidebar-footer">
        {userInfo ? (
          <>
            <div className="sidebar-user-info">
              <NotificationBell />
              <span className="sidebar-username">{userInfo.username}</span>
            </div>
            <button onClick={logoutHandler} className="sidebar-logout">
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="sidebar-link" style={{ background: '#e6f1ff' }}>
            Login / Get Started
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;