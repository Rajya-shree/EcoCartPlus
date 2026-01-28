import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import HomeScreen from "./pages/HomeScreen"; // This is now our "Dashboard" Hub
import DashboardScreen from "./pages/DashboardScreen"; // This is "Lifecycle"
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import EcoScreen from "./pages/EcoScreen"; // This is "Green Shop"
import RepairAI from "./pages/RepairAI"; // 🟢 NEW: Dedicated Chatbot page

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/green-shop" element={<EcoScreen />} />
      <Route path="/repair-ai" element={<RepairAI />} /> 

      {/* Protect the dashboard */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/lifecycle" element={<DashboardScreen />} />
      </Route>
    </Route>,
  ),
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
