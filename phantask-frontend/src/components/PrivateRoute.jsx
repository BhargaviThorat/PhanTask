import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const testToken = sessionStorage.getItem("testToken");

  // Backdoor: if testToken === "open", always allow
  if (testToken === "open") return children;

  if (loading) {
    // optional: show a small loader while /auth/me is in progress
    return <div className="text-center p-4 text-white">Checking session...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
