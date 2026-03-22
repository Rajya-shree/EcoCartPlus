// components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { generateMaintenanceReminders } from "../utils/maintenance.js";
import { LIFECYCLE_URL, NOTIFICATIONS_URL } from "../utils/constants";
import { toast } from "react-toastify";
import NotificationDropdown from "./NotificationDropdown";

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
import SmartToyIcon from "@mui/icons-material/SmartToy"; // 🟢 Added for Repair AI icon

const Header = () => {
  const { userInfo, logout } = useAuth();
  //const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  // 🟢 Cleaned up States - Only these are needed!
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchUnreadNotifications = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Fetch actual unread notifications from the database
      const { data } = await axios.get(NOTIFICATIONS_URL, config);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    // Poll every 1 minute instead of 5 for a snappier feel
    const interval = setInterval(fetchUnreadNotifications, 60000);
    window.addEventListener(
      "forceNotificationRefresh",
      fetchUnreadNotifications,
    );
    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "forceNotificationRefresh",
        fetchUnreadNotifications,
      );
    };
  }, [userInfo]);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const checkNotifications = async () => {
  //   if (!userInfo) return;
  //   try {
  //     const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
  //     const { data } = await axios.get(LIFECYCLE_URL, config);

  //     // Logic to check if any device in 'data' needs attention
  //     const needsAttention = data.filter(
  //       (device) => device.status === "Needs Maintenance",
  //     );
  //     setNotificationCount(needsAttention.length);

  //     let totalPending = 0;
  //     data.forEach((device) => {
  //       const tasks = generateMaintenanceReminders(device.purchaseDate);
  //       if (tasks.length > 0) totalPending += tasks.length;
  //     });
  //     setNotificationCount(totalPending);
  //   } catch (err) {
  //     console.error("Error checking notifications", err);
  //   }
  // };

  // useEffect(() => {
  //   checkNotifications();
  //   const interval = setInterval(checkNotifications, 300000);
  //   return () => clearInterval(interval);
  // }, [userInfo]);

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

          {/* 🟢 NAVIGATION LINKS - UPDATED FOR NEW STRUCTURE */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            <Button
              component={Link}
              to="/dashboard"
              color="inherit"
              sx={{ fontWeight: 600 }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/green-shopping"
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              Green Shopping
            </Button>
            <Button
              component={Link}
              to="/diagnosis" // 🟢 NEW SECTION
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              Repair Assistant
            </Button>
            <Button
              component={Link}
              to="/lifecycle" // 🟢 RENAMED PATH
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              Lifecycle
            </Button>
          </Box>

          {/* User Actions Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {userInfo ? (
              // <>
              //   <IconButton
              //     onClick={() => navigate("/lifecycle")}
              //     color="inherit"
              //   >
              //     <Badge badgeContent={notificationCount} color="error">
              //       <NotificationsIcon />
              //     </Badge>
              //   </IconButton>

              //   <Typography
              //     sx={{
              //       ml: 1,
              //       mr: 2,
              //       fontWeight: 500,
              //       display: { xs: "none", lg: "block" },
              //     }}
              //   >
              //     Hi, {userInfo.username}
              //   </Typography>

              //   <IconButton
              //     onClick={logoutHandler}
              //     color="primary"
              //     title="Logout"
              //   >
              //     <LogoutIcon />
              //   </IconButton>
              // </>
              <>
                {/* 🟢 THIS IS THE FIXED NOTIFICATION BELL AND DROPDOWN */}
                <Box ref={notifRef} sx={{ position: "relative" }}>
                  <IconButton
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    color="inherit"
                  >
                    <Badge badgeContent={notifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  {/* Render the dropdown when clicked */}
                  {isNotifOpen && (
                    <NotificationDropdown
                      userInfo={userInfo}
                      notifications={notifications}
                      setNotifications={setNotifications}
                      onClose={() => setIsNotifOpen(false)}
                    />
                  )}
                </Box>

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
                  Login
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

// // components/Header.jsx
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";
// import { generateMaintenanceReminders } from "../utils/maintenance.js";
// import { LIFECYCLE_URL, NOTIFICATIONS_URL } from "../utils/constants";
// import { toast } from "react-toastify";

// // Material UI Imports
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Badge,
//   IconButton,
//   Box,
//   Container,
// } from "@mui/material";
// import NotificationsIcon from "@mui/icons-material/Notifications";
// import LogoutIcon from "@mui/icons-material/Logout";
// import SmartToyIcon from "@mui/icons-material/SmartToy"; // 🟢 Added for Repair AI icon

// const Header = () => {
//   const { userInfo, logout } = useAuth();
//   const navigate = useNavigate();
//   const [notificationCount, setNotificationCount] = useState(0);

//   const checkNotifications = async () => {
//     if (!userInfo) return;
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data } = await axios.get(LIFECYCLE_URL, config);

//       // Logic to check if any device in 'data' needs attention
//       const needsAttention = data.filter(
//         (device) => device.status === "Needs Maintenance",
//       );
//       setNotificationCount(needsAttention.length);

//       let totalPending = 0;
//       data.forEach((device) => {
//         const tasks = generateMaintenanceReminders(device.purchaseDate);
//         if (tasks.length > 0) totalPending += tasks.length;
//       });
//       setNotificationCount(totalPending);
//     } catch (err) {
//       console.error("Error checking notifications", err);
//     }
//   };

//   useEffect(() => {
//     checkNotifications();
//     const interval = setInterval(checkNotifications, 300000);
//     return () => clearInterval(interval);
//   }, [userInfo]);

//   const logoutHandler = () => {
//     logout();
//     toast.success("Logged out successfully");
//     navigate("/login");
//   };

//   return (
//     <AppBar
//       position="sticky"
//       sx={{
//         backgroundColor: "#ffffff",
//         color: "#333",
//         boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
//       }}
//     >
//       <Container maxWidth="xl">
//         <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
//           {/* Brand/Logo Section */}
//           <Box sx={{ display: "flex", alignItems: "center" }}>
//             <Link
//               to="/"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 textDecoration: "none",
//               }}
//             >
//               <img
//                 src="/ECOCART+ Robot Mascot.png"
//                 alt="Logo"
//                 style={{ height: "40px", marginRight: "12px" }}
//               />
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontWeight: 800,
//                   color: "#2e7d32",
//                   display: { xs: "none", sm: "block" },
//                 }}
//               >
//                 EcoNova
//               </Typography>
//             </Link>
//           </Box>

//           {/* 🟢 NAVIGATION LINKS - UPDATED FOR NEW STRUCTURE */}
//           {/* <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
//             <Button
//               component={Link}
//               to="/dashboard"
//               color="inherit"
//               sx={{ fontWeight: 600 }}
//             >
//               Dashboard
//             </Button>
//             <Button
//               component={Link}
//               to="/green-shopping"
//               color="inherit"
//               sx={{ fontWeight: 500 }}
//             >
//               Green Shopping
//             </Button>
//             <Button
//               component={Link}
//               to="/diagnosis" // 🟢 NEW SECTION
//               color="inherit"
//               sx={{ fontWeight: 500 }}
//             >
//               Repair Assistant
//             </Button>
//             <Button
//               component={Link}
//               to="/lifecycle" // 🟢 RENAMED PATH
//               color="inherit"
//               sx={{ fontWeight: 500 }}
//             >
//               Lifecycle
//             </Button>
//           </Box> */}

//           {/* User Actions Section */}
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             {userInfo ? (
//               <>
//                 <IconButton
//                   onClick={() => navigate("/lifecycle")}
//                   color="inherit"
//                 >
//                   <Badge badgeContent={notificationCount} color="error">
//                     <NotificationsIcon />
//                   </Badge>
//                 </IconButton>

//                 <Typography
//                   sx={{
//                     ml: 1,
//                     mr: 2,
//                     fontWeight: 500,
//                     display: { xs: "none", lg: "block" },
//                   }}
//                 >
//                   Hi, {userInfo.username}
//                 </Typography>

//                 <IconButton
//                   onClick={logoutHandler}
//                   color="primary"
//                   title="Logout"
//                 >
//                   <LogoutIcon />
//                 </IconButton>
//               </>
//             ) : (
//               <Box sx={{ gap: 1, display: "flex" }}>
//                 <Button
//                   component={Link}
//                   to="/login"
//                   variant="text"
//                   color="inherit"
//                 >
//                   Login
//                 </Button>
//                 <Button
//                   component={Link}
//                   to="/register"
//                   variant="contained"
//                   sx={{
//                     borderRadius: "20px",
//                     backgroundColor: "#2e7d32",
//                     "&:hover": { backgroundColor: "#1b5e20" },
//                   }}
//                 >
//                   Get Started
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );
// };

// export default Header;
