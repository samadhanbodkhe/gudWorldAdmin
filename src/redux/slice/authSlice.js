import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

// ✅ Helper function to safely check token validity
const checkTokenValidity = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) return false;
  
  try {
    // Simple token validation - check if it's a valid JWT format
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if token is expired
    const payload = JSON.parse(atob(parts[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch {
    return false;
  }
};

// ✅ Helper function to safely parse JSON
const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    admin: safeParse("admin"),
    adminToken: localStorage.getItem("adminToken") || null,
    isAuthenticated: checkTokenValidity(), // ✅ Check token validity on initial load
    isLoading: false,
  },
  reducers: {
    clearAuth: (state) => {
      state.admin = null;
      state.adminToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");
    },
    setAuth: (state, action) => {
      state.admin = action.payload.admin;
      state.adminToken = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem("admin", JSON.stringify(action.payload.admin));
      localStorage.setItem("adminToken", action.payload.token);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // ✅ NEW: Rehydrate auth state from localStorage
    rehydrateAuth: (state) => {
      const admin = safeParse("admin");
      const adminToken = localStorage.getItem("adminToken");
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
          state.admin = payload.admin;
          state.adminToken = payload.token;
          state.isAuthenticated = true;
          state.isLoading = false;
          localStorage.setItem("admin", JSON.stringify(payload.admin));
          localStorage.setItem("adminToken", payload.token);
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdmin.matchPending,
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdmin.matchRejected,
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        authApi.endpoints.logoutAdmin.matchFulfilled,
        (state) => {
          state.admin = null;
          state.adminToken = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          localStorage.removeItem("admin");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminEmail");
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
          localStorage.removeItem("adminEmail");
        }
      )
      .addMatcher(
        authApi.endpoints.getAdminProfile.matchFulfilled,
        (state, { payload }) => {
          state.admin = payload;
          localStorage.setItem("admin", JSON.stringify(payload));
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdminToken.matchFulfilled,
        (state, { payload }) => {
          // Update admin data if token is still valid
          if (payload.admin) {
            state.admin = payload.admin;
            state.isAuthenticated = true;
            localStorage.setItem("admin", JSON.stringify(payload.admin));
          }
        }
      )
      .addMatcher(
        authApi.endpoints.verifyAdminToken.matchRejected,
        (state) => {
          // Token is invalid, clear auth
          state.admin = null;
          state.adminToken = null;
          state.isAuthenticated = false;
          localStorage.removeItem("admin");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminEmail");
        }
      );
  },
});

export const { clearAuth, setAuth, setLoading, rehydrateAuth } = authSlice.actions;
export default authSlice.reducer;