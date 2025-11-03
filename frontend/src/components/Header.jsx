import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import our auth hook
import { toast } from "react-toastify";
import "./Header.css"; // Import the CSS
//import logo from "R:FINAL YEAR PROJECTai-repair-assistant\frontendpublicECOCART+ Robot Mascot.png";

const Header = () => {
  // Get the user info and logout function from the global state
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout(); // Call the logout function from our context
    toast.success("Logged out successfully");
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <img
            src="/ECOCART+ Robot Mascot.png"
            alt="Repair Advisor Logo"
            className="logo-image"
          />
        </Link>
        <Link to="/" className="header-link">
          {/* You can put your logo image here */}
          Repair Advisor
        </Link>
        <Link to="/eco-shopping" className="header-link">
          Green Shopping
        </Link>
        <Link to="/dashboard" className="header-link">
          LifeCycle Maintenance
        </Link>

        <nav className="header-nav">
          {userInfo ? (
            // If user IS logged in, show this:
            <>
              <span className="header-username">
                Welcome, {userInfo.username}
              </span>
              <button
                onClick={logoutHandler}
                className="header-link logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            // If user is NOT logged in, show this:
            <>
              <Link to="/login" className="header-link">
                Unlock (Login)
              </Link>
              <Link to="/register" className="header-link button-primary">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
