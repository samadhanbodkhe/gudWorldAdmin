// src/pages/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useVerifyAdminTokenQuery } from '../redux/api/authApi';
import { clearCredentials } from '../redux/slice/authSlice';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { adminToken, isAuthenticated } = useSelector((state) => state.auth);
  
  // Only verify token if we have one and are authenticated
  const { isLoading, error, isError } = useVerifyAdminTokenQuery(undefined, {
    skip: !adminToken || !isAuthenticated,
    refetchOnMountOrArgChange: false, // Prevent unnecessary refetches
  });

  // Handle authentication errors
  useEffect(() => {
    if (isError || error) {
      console.log('🛑 Token verification failed:', error);
      // Clear credentials and redirect to login
      dispatch(clearCredentials());
    }
  }, [isError, error, dispatch]);

  // Show loading while verifying token
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !adminToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;