// src/pages/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useVerifyAdminTokenQuery } from '../redux/api/authApi';

const ProtectedRoute = ({ children }) => {
  const { adminToken, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Skip the query if no token
  const { isLoading, error } = useVerifyAdminTokenQuery(undefined, {
    skip: !adminToken,
  });

  // Show loading while verifying token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#B97A57] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5C3A21]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or token verification failed
  if (!isAuthenticated || !adminToken || error) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;