import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";

// Import Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";
import HomeScreen from "./pages/HomeScreen.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import RegisterScreen from "./pages/RegisterScreen.jsx";
import DashboardScreen from "./pages/DashboardScreen.jsx";
import EcoScreen from "./pages/EcoScreen.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx"; 

// This creates your page routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* These are the "children" pages */}
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/eco-shopping" element={<EcoScreen />} />

      <Route path="" element={<PrivateRoute />}>
        {/* All routes inside here are now protected */}
        <Route path="/dashboard" element={<DashboardScreen />} />
        {/* You can add more private routes here later */}
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {/* We add the ToastContainer here */}
      <ToastContainer position="top-right" autoClose={3000} />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
