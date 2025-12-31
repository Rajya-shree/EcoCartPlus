import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { generateMaintenanceReminders } from "../utils/maintenance.js";
import { toast } from "react-toastify";

// Material UI Imports
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  IconButton,
  Box,
  Container,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

const Header = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  const checkNotifications = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get("/api/devices", config);

      let totalPending = 0;
      data.forEach((device) => {
        const tasks = generateMaintenanceReminders(device.purchaseDate);
        if (tasks.length > 0) totalPending += tasks.length;
      });
      setNotificationCount(totalPending);
    } catch (err) {
      console.error("Error checking notifications", err);
    }
  };

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 300000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const logoutHandler = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#ffffff",
        color: "#333",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Brand/Logo Section */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <img
                src="/ECOCART+ Robot Mascot.png"
                alt="Logo"
                style={{ height: "40px", marginRight: "12px" }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#2e7d32",
                  display: { xs: "none", sm: "block" },
                }}
              >
                EcoNova
              </Typography>
            </Link>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            <Button
              component={Link}
              to="/"
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/eco-shopping"
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              Green Shopping
            </Button>
            <Button
              component={Link}
              to="/dashboard"
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              Lifecycle Tracker
            </Button>
          </Box>

          {/* User Actions Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {userInfo ? (
              <>
                {/* Dynamic Notification Badge */}
                <IconButton
                  onClick={() => navigate("/dashboard")}
                  color="inherit"
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <Typography
                  sx={{
                    ml: 1,
                    mr: 2,
                    fontWeight: 500,
                    display: { xs: "none", lg: "block" },
                  }}
                >
                  Hi, {userInfo.username}
                </Typography>

                <IconButton
                  onClick={logoutHandler}
                  color="primary"
                  title="Logout"
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <Box sx={{ gap: 1, display: "flex" }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  color="inherit"
                >
                  Unlock
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    backgroundColor: "#2e7d32",
                    "&:hover": { backgroundColor: "#1b5e20" },
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
