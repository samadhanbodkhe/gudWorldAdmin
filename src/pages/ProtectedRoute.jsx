import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);

  // Show loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F4] to-[#E8D5C4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#B97A57] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5C3A21]">Loading...</p>
        </div>
      </div>
    );
  }

  // ❗ FIXED — Redirect always to /login (NOT /admin/login)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
