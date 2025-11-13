import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../pages/LoadingSpinner";
import { useVerifyAdminTokenQuery } from "../redux/api/authApi";

const ProtectedRoute = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const { adminToken } = useSelector(state => state.auth);
  const location = useLocation();
  
  // Use the token verification query
  const { 
    data: verifyData, 
    error, 
    isLoading, 
    isError 
  } = useVerifyAdminTokenQuery(undefined, {
    skip: !adminToken, // Skip if no token
  });

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while verifying token
  if ((adminToken && isLoading) || isVerifying) {
    return <LoadingSpinner />;
  }

  // If no token, redirect to login
  if (!adminToken) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location.pathname }} 
      />
    );
  }

  // If token verification failed, redirect to login
  if (adminToken && isError) {
    console.error("Token verification failed:", error);
    // Clear invalid token from storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname,
          message: "Session expired. Please login again." 
        }} 
      />
    );
  }

  // If token is valid, render children
  return children;
};

export default ProtectedRoute;