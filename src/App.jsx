import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import VerifyOtp from "./pages/VerifyOtp ";
import ProtectedRoute from "./pages/ProtectedRoute";
import Refunds from "./pages/Refunds ";
import { useAuthInterceptor } from "./hooks/useAuthInterceptor";
import { rehydrateAuth, validateAndUpdateAuth } from "./redux/slice/authSlice";

const App = () => {
  // ✅ ALL HOOKS AT TOP LEVEL
  useAuthInterceptor();
  const [isLoading, setIsLoading] = useState(true);
  const { adminToken, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch(); 
  const location = useLocation();

  // ✅ SINGLE AUTH INITIALIZATION EFFECT
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing admin auth...');
        
        // Rehydrate auth state from localStorage
        dispatch(rehydrateAuth());
        
        // Validate and update auth state
        dispatch(validateAndUpdateAuth());

        // Simulate loading for better UX
        setTimeout(() => {
          setIsLoading(false);
          console.log('✅ Auth initialization complete');
        }, 1000);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // ✅ PERIODIC AUTH VALIDATION
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(validateAndUpdateAuth());
    }, 30000); // Validate every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <VerifyOtp />
          } 
        />
        
        {/* Protected routes - require authentication */}
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
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirects */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={isAuthenticated ? "/admin/dashboard" : "/login"} 
              replace 
            />
          } 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={isAuthenticated ? "/admin/dashboard" : "/login"} 
              replace 
            />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;