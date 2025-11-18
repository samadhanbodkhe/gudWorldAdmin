// src/hooks/useAuthInterceptor.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../redux/slice/authSlice'; // for admin
// import { invalidateToken } from '../redux/slice/userAuthSlice'; // for user

export const useAuthInterceptor = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      
      // Add credentials to all requests
      const modifiedOptions = {
        ...options,
        credentials: 'include',
      };

      try {
        const response = await originalFetch(url, modifiedOptions);
        
        // Check for 401 responses
        if (response.status === 401) {
          console.log('🛑 401 Unauthorized - Clearing auth');
          
          if (url.includes('/admin/')) {
            // Use Redux action instead of direct localStorage manipulation
            dispatch(clearAuth());
            // Optional: Redirect after state is cleared
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          } else {
            // For user panel
            // dispatch(invalidateToken());
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