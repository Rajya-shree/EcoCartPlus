import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx"; // 1. Import Header
import { useAuth } from "./context/AuthContext";
import axios from "axios"; // Add this
import { useState, useEffect } from "react"; // Add this
import { ToastContainer } from "react-toastify";
import { LIFECYCLE_URL } from "./utils/constants";  
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { userInfo } = useAuth();
  const [devices, setDevices] = useState([]);

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
    <div className="App" style={{ backgroundColor: "rgb(241, 245, 249)" }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Header /> {/* 2. Add Header at the top */}
      <main className="main-content">
        <Outlet context={{ devices, userInfo, fetchData }} />{" "}
        {/* 3. Outlet renders the current page */}
      </main>
    </div>
  );
}

export default App;
