// src/hooks/useAuthInterceptor.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

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
          // Check if it's admin or user route
          if (url.includes('/admin/')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');
            window.location.href = '/login';
          } else {
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