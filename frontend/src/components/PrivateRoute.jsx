import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  const { userInfo } = useAuth();

  // If the user is logged in, show the child page (e.g., Dashboard)
  // The <Outlet /> is a placeholder for the child page.
  if (userInfo) {
    return <Outlet />;
  }

  // If not logged in, redirect them to the /login page
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
