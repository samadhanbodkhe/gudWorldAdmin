// src/redux/slice/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

const authSlice = createSlice({
    name: "authSlice",
    initialState: {
        admin: JSON.parse(localStorage.getItem("admin")) || null,
        adminToken: localStorage.getItem("adminToken") || null,
        isAuthenticated: !!localStorage.getItem("adminToken"),
        isLoading: false,
    },
    reducers: {
        setCredentials: (state, { payload }) => {
            state.admin = payload.admin;
            state.adminToken = payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("admin", JSON.stringify(payload.admin));
            localStorage.setItem("adminToken", payload.token);
        },
        clearCredentials: (state) => {
            state.admin = null;
            state.adminToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem("admin");
            localStorage.removeItem("adminToken");
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
                localStorage.setItem("admin", JSON.stringify(payload.admin));
                localStorage.setItem("adminToken", payload.token);
            }
        })
        .addMatcher(authApi.endpoints.logoutAdmin.matchFulfilled, (state) => {
            state.admin = null;
            state.adminToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem("admin");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminEmail");
        })
        .addMatcher(authApi.endpoints.verifyAdminToken.matchRejected, (state, { payload }) => {
            // Clear credentials on token verification failure
            if (payload?.status === 401) {
                state.admin = null;
                state.adminToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem("admin");
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminEmail");
            }
        })
});

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions;
export default authSlice.reducer;