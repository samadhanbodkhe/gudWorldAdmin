// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        admin: JSON.parse(localStorage.getItem("admin")) || null,
        adminToken: localStorage.getItem("adminToken") || null,
        isAuthenticated: !!localStorage.getItem("adminToken"),
    },
    reducers: {
        clearAuth: (state) => {
            state.admin = null;
            state.adminToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem("admin");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminEmail");
        },
        setAuth: (state, action) => {
            state.admin = action.payload.admin;
            state.adminToken = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("admin", JSON.stringify(action.payload.admin));
            localStorage.setItem("adminToken", action.payload.token);
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
                    localStorage.setItem("admin", JSON.stringify(payload.admin));
                    localStorage.setItem("adminToken", payload.token);
                }
            )
            .addMatcher(
                authApi.endpoints.logoutAdmin.matchFulfilled,
                (state) => {
                    state.admin = null;
                    state.adminToken = null;
                    state.isAuthenticated = false;
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
            );
    },
});

export const { clearAuth, setAuth } = authSlice.actions;
export default authSlice.reducer;