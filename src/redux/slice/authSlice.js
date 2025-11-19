// src/redux/slice/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

// 🔥 CHANGE: Use admin-specific localStorage keys
const authSlice = createSlice({
    name: "authSlice",
    initialState: {
        admin: JSON.parse(localStorage.getItem("admin_data")) || null,
        adminToken: localStorage.getItem("admin_token") || null,
        isAuthenticated: !!localStorage.getItem("admin_token"),
        isLoading: false,
    },
    reducers: {
        setCredentials: (state, { payload }) => {
            state.admin = payload.admin;
            state.adminToken = payload.token;
            state.isAuthenticated = true;
            // 🔥 CHANGE: Admin-specific keys
            localStorage.setItem("admin_data", JSON.stringify(payload.admin));
            localStorage.setItem("admin_token", payload.token);
        },
        clearCredentials: (state) => {
            state.admin = null;
            state.adminToken = null;
            state.isAuthenticated = false;
            // 🔥 CHANGE: Clear admin-specific keys only
            localStorage.removeItem("admin_data");
            localStorage.removeItem("admin_token");
            localStorage.removeItem("adminEmail");
        },
        setLoading: (state, { payload }) => {
            state.isLoading = payload;
        }
    },
    extraReducers: builder => builder
        .addMatcher(authApi.endpoints.verifyAdmin.matchFulfilled, (state, { payload }) => {
            if (payload.admin && payload.token) {
                state.admin = payload.admin;
                state.adminToken = payload.token;
                state.isAuthenticated = true;
                localStorage.setItem("admin_data", JSON.stringify(payload.admin));
                localStorage.setItem("admin_token", payload.token);
            }
        })
        .addMatcher(authApi.endpoints.logoutAdmin.matchFulfilled, (state) => {
            state.admin = null;
            state.adminToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem("admin_data");
            localStorage.removeItem("admin_token");
            localStorage.removeItem("adminEmail");
        })
        .addMatcher(authApi.endpoints.verifyAdminToken.matchRejected, (state, { payload }) => {
            if (payload?.status === 401) {
                state.admin = null;
                state.adminToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem("admin_data");
                localStorage.removeItem("admin_token");
                localStorage.removeItem("adminEmail");
            }
        })
});

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions;
export default authSlice.reducer;