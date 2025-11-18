// src/redux/slice/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

// ✅ Safe token validation
const checkTokenValidity = () => {
  const token = localStorage.getItem("adminToken");
  return !!(token && token !== "undefined" && token !== "null");
};

// ✅ Safe JSON parsing
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
    isAuthenticated: checkTokenValidity(),
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
    // ✅ Enhanced rehydration
    rehydrateAuth: (state) => {
      const admin = safeParse("admin");
      const adminToken = localStorage.getItem("adminToken");
      const isAuthenticated = checkTokenValidity();
      
      state.admin = admin;
      state.adminToken = adminToken;
      state.isAuthenticated = isAuthenticated;
    },
    // ✅ NEW: Validate and update auth state without clearing
    validateAndUpdateAuth: (state) => {
      const token = localStorage.getItem('adminToken');
      const admin = safeParse('admin');
      
      if (token && admin) {
        state.adminToken = token;
        state.admin = admin;
        state.isAuthenticated = true;
      } else {
        state.adminToken = null;
        state.admin = null;
        state.isAuthenticated = false;
      }
    },
  },
  // ... your existing extraReducers
});

export const { 
  clearAuth, 
  setAuth, 
  setLoading, 
  rehydrateAuth,
  validateAndUpdateAuth 
} = authSlice.actions;
export default authSlice.reducer;