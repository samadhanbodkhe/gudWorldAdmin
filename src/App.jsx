import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Banners from "./pages/Banners";
import Login from "./pages/Login";
import Header from "./components/Header";
import Sidebar from "./constants/Sidebar";
import LoadingSpinner from "./pages/LoadingSpinner";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoute";
import VerifyOtp from "./pages/VerifyOtp ";
import Refunds from "./pages/Refunds ";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { adminToken } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [adminToken]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            adminToken ? <Navigate to="/admin/dashboard" replace /> : <Login />
          }
        />

        <Route
          path="/verify-otp"
          element={
            adminToken ? <Navigate to="/admin/dashboard" replace /> : <VerifyOtp />
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="ml-64 flex-1 min-h-screen bg-[#F8F6F4]">
                  <Header />

                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="users" element={<Users />} />
                    <Route path="banners" element={<Banners />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="refunds" element={<Refunds />} />

                    {/* Default Route */}
                    <Route
                      path=""
                      element={<Navigate to="dashboard" replace />}
                    />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={adminToken ? "/admin/dashboard" : "/login"}
              replace
            />
          }
        />

        {/* 404 Redirect */}
        <Route
          path="*"
          element={
            <Navigate
              to={adminToken ? "/admin/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
