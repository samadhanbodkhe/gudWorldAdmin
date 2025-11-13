// src/redux/api/dashboardApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/dashboard`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("adminToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getDashboardStats: builder.query({
            query: () => "/getDashboardStats",
            providesTags: ["Dashboard"],
        }),
        getRealTimeUpdates: builder.query({
            query: () => "/getRealTimeUpdates",
            providesTags: ["Dashboard"],
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetRealTimeUpdatesQuery
} = dashboardApi;