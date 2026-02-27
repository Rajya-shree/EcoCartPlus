import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import { useAuth } from "./context/AuthContext";
import axios from "axios"; // Add this
import { useState, useEffect } from "react"; // Add this
import { ToastContainer } from "react-toastify";
import { LIFECYCLE_URL } from "./utils/constants";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";


function App() {
  const { userInfo } = useAuth();
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 🟢 Redirect logic: If no user and not on login/register, go to login
    if (
      !userInfo &&
      location.pathname !== "/login" &&
      location.pathname !== "/register"
    ) {
      navigate("/login");
    }
    // 🟢 Optional: If user IS logged in and tries to go to /login, send them to dashboard
    if (
      userInfo &&
      (location.pathname === "/login" || location.pathname === "/register")
    ) {
      navigate("/dashboard");
    }
  }, [userInfo, location.pathname, navigate]);

  // 🟢 FETCH DATA FROM DATABASE
  const fetchData = async () => {
    if (!userInfo || !userInfo.token) return;

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      const { data } = await axios.get(LIFECYCLE_URL, config);
      setDevices(data);
    } catch (err) {
      // console.error("Error fetching data in App.jsx", err);
      console.error(
        "Error fetching data:",
        err.response?.data?.message || err.message,
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo]);

  return (
    // <div
    //   style={{
    //     display: "flex",
    //     width: "100vw",
    //     height: "100vh",
    //     overflow: "hidden",
    //   }}
    // >
    //   {/* 1. SIDEBAR (Fixed Width) */}
    //   {userInfo && <Sidebar />}

    //   {/* 2. MAIN CONTENT (Fills remaining place) */}
    //   <div
    //     style={{
    //       flex: 1,
    //       height: "100%",
    //       overflowY: "auto",
    //       backgroundColor: "#f8fafc",
    //     }}
    //   >
    //     <ToastContainer position="top-right" autoClose={3000} />

    //     {/* Responsive container for your screens */}
    //     <main style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
    //       <Outlet context={{ devices, userInfo, fetchData }} />
    //     </main>
    //   </div>
    // </div>

    // <div
    //   style={{
    //     display: "flex",
    //     width: "100vw",
    //     height: "100vh",
    //     overflow: "hidden",
    //   }}
    // >
    <div
      className="App"
      style={{
        display: "flex",
        backgroundColor: "rgb(241, 245, 249)",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Sidebar only shows if logged in */}
      {userInfo && <Sidebar />}

      <div
        className="main-content-area"
        style={{
          // flex: 1,
          flexGrow: 1,
          flexShrink: 1,
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#f8fafc",
          transition: "margin-left 0.3s ease",
          position: "relative",
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} />
        <main style={{ padding: "10px", maxWidth: "1200px", margin: "0 auto" }}>
          <Outlet context={{ userInfo, userInfo, fetchData }} />
        </main>
      </div>
    </div>

    //Old UI
    // <div className="App" style={{ backgroundColor: "rgb(241, 245, 249)" }}>
    //   <ToastContainer
    //     position="top-right"
    //     autoClose={3000}
    //     hideProgressBar={false}
    //   />
    //   {/* Vertical Sidebar handles all Header logic now */}
    //   <NavigationSidebar />
    //   <main className="main-content">
    //     <Outlet context={{ devices, userInfo, fetchData }} />{" "}
    //     {/* 3. Outlet renders the current page */}
    //   </main>
    // </div>
  );
}

export default App;
