import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

// ✅ Safe localStorage functions
const getStoredAdmin = () => {
  try {
    const admin = localStorage.getItem("admin");
    return admin ? JSON.parse(admin) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem("adminToken");
};

// ✅ Better token validation
const checkTokenValidity = () => {
  const token = getStoredToken();
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch {
    return false;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    admin: getStoredAdmin(),
    adminToken: getStoredToken(),
    isAuthenticated: checkTokenValidity(),
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAuth: (state) => {
      state.admin = null;
      state.adminToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
    },
    setAuth: (state, action) => {
      state.admin = action.payload.admin;
      state.adminToken = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      
      localStorage.setItem("admin", JSON.stringify(action.payload.admin));
      localStorage.setItem("adminToken", action.payload.token);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // ✅ Improved rehydrate function
    rehydrateAuth: (state) => {
      const admin = getStoredAdmin();
      const adminToken = getStoredToken();
      const isAuthenticated = checkTokenValidity();
      
      state.admin = admin;
      state.adminToken = adminToken;
      state.isAuthenticated = isAuthenticated;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.verifyAdmin.matchFulfilled,
        (state, { payload }) => {
          if (payload.success && payload.admin && payload.token) {
            state.admin = payload.admin;
            state.adminToken = payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
            
            localStorage.setItem("admin", JSON.stringify(payload.admin));
            localStorage.setItem("adminToken", payload.token);
          }
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdmin.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdmin.matchRejected,
        (state, { payload }) => {
          state.isLoading = false;
          state.error = payload?.data?.message || "Verification failed";
        }
      )
      .addMatcher(
        authApi.endpoints.logoutAdmin.matchFulfilled,
        (state) => {
          state.admin = null;
          state.adminToken = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = null;
          
          localStorage.removeItem("admin");
          localStorage.removeItem("adminToken");
        }
      )
      .addMatcher(
        authApi.endpoints.logoutAdmin.matchRejected,
        (state) => {
          // Clear state even if API call fails
          state.admin = null;
          state.adminToken = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          
          localStorage.removeItem("admin");
          localStorage.removeItem("adminToken");
        }
      )
      .addMatcher(
        authApi.endpoints.getAdminProfile.matchFulfilled,
        (state, { payload }) => {
          if (payload.success && payload.admin) {
            state.admin = payload.admin;
            localStorage.setItem("admin", JSON.stringify(payload.admin));
          }
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdminToken.matchFulfilled,
        (state, { payload }) => {
          if (payload.success && payload.admin) {
            state.admin = payload.admin;
            state.isAuthenticated = true;
            localStorage.setItem("admin", JSON.stringify(payload.admin));
          }
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdminToken.matchRejected,
        (state) => {
          state.admin = null;
          state.adminToken = null;
          state.isAuthenticated = false;
          
          localStorage.removeItem("admin");
          localStorage.removeItem("adminToken");
        }
      );
  },
});

export const { clearAuth, setAuth, setLoading, clearError, rehydrateAuth } = authSlice.actions;
export default authSlice.reducer;