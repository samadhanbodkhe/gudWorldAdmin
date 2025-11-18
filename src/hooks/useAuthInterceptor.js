// src/hooks/useAuthInterceptor.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../redux/slice/authSlice';

export const useAuthInterceptor = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      let urlString = '';
      
      // ✅ SAFELY extract URL from different parameter types
      if (typeof args[0] === 'string') {
        urlString = args[0];
      } else if (args[0] instanceof Request) {
        urlString = args[0].url;
      } else {
        urlString = String(args[0]);
      }
      
      const options = args[1] || {};

      // Add credentials to all requests
      const modifiedOptions = {
        ...options,
        credentials: 'include',
      };

      try {
        const response = await originalFetch(args[0], modifiedOptions);
        
        // Check for 401 responses
        if (response.status === 401) {
          console.log('🛑 401 Unauthorized - Clearing auth');
          
          // ✅ SAFELY check if it's admin route
          if (urlString.includes('/admin/') || urlString.includes('/api/v1/admin') || urlString.includes('/api/v1/dashboard')) {
            // Use Redux action instead of direct localStorage manipulation
            dispatch(clearAuth());
            // Optional: Redirect after state is cleared
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          } else {
            // For user panel
            localStorage.removeItem('token');
            localStorage.removeItem('userAuth');
            window.location.href = '/login';
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [dispatch]);
};