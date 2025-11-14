import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useVerifyAdminTokenQuery } from '../redux/api/authApi';
import { rehydrateAuth, setLoading } from '../redux/slice/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, adminToken } = useSelector(state => state.auth);

  // Skip token verification if no token exists
  const { isLoading, isError } = useVerifyAdminTokenQuery(undefined, {
    skip: !adminToken,
  });

  useEffect(() => {
    // Rehydrate auth state from localStorage on app start
    dispatch(rehydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    // Update loading state based on token verification
    if (adminToken) {
      dispatch(setLoading(isLoading));
    } else {
      dispatch(setLoading(false));
    }
  }, [isLoading, adminToken, dispatch]);

  // Show loading only when we're verifying token and have a token
  if (adminToken && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F4] to-[#E8D5C4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#B97A57] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5C3A21] font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;