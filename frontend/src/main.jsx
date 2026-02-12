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
import LifecycleScreen from "./pages/LifecycleScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
//import EcoScreen from "./pages/EcoScreen"; // This is "Green Shop"
//import RepairAI from "./pages/RepairAI"; // 🟢 NEW: Dedicated Chatbot page
import GreenShoppingScreen from "./pages/GreenShoppingScreen"; // Renamed from EcoScreen
import DiagnosisScreen from "./pages/DiagnosisScreen.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} element={<HomeScreen />} />
      <Route path="/dashboard" element={<HomeScreen />} />

      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      {/* Updated EcoNova+ Paths */}
      <Route path="/green-shopping" element={<GreenShoppingScreen />} />
      <Route path="/diagnosis" element={<DiagnosisScreen />} />

      {/* Protected Routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/lifecycle" element={<LifecycleScreen />} />
      </Route>

      {/* <Route path="/green-shop" element={<EcoScreen />} />
      <Route path="/repair-ai" element={<RepairAssistant />} /> */}
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
