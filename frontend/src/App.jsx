import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx"; // 1. Import Header
import { useAuth } from "./context/AuthContext";
import axios from "axios"; // Add this
import { useState, useEffect } from "react"; // Add this

function App() {
  const { userInfo } = useAuth();
  const [devices, setDevices] = useState([]);

  // 🟢 FETCH DATA FROM DATABASE
  const fetchData = async () => {
    if (!userInfo) return;
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      const { data } = await axios.get("/api/devices", config);
      setDevices(data);
    } catch (err) {
      console.error("Error fetching data in App.jsx", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo]);

  return (
    <div className="App" style={{ backgroundColor: "rgb(241, 245, 249)" }}>
      <Header /> {/* 2. Add Header at the top */}
      <main className="main-content">
        <Outlet context={{ devices, fetchData }} />{" "}
        {/* 3. Outlet renders the current page */}
      </main>
    </div>
  );
}

export default App;
