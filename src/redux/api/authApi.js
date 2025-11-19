// src/redux/api/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/adminAuth`,
        credentials: "include",
        prepareHeaders: (headers,{ getState }) => {
              const token = localStorage.getItem("adminToken") || 
                     getState()?.auth?.adminToken;
            if (token) {
            headers.set('authorization', `Bearer ${token}`);
            headers.set('x-admin-token', token); // ✅ Additional header
        }
        
        headers.set('x-client-type', 'admin');
        return headers;
    
        },
    }),
    
    tagTypes: ["Admin"],
    endpoints: (builder) => ({
        loginAdmin: builder.mutation({
            query: (userData) => ({
                url: "/Admin-login",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["Admin"],
        }),

        verifyAdmin: builder.mutation({
            query: (otpData) => ({
                url: "/Admin-verifyOtp",
                method: "POST",
                body: otpData,
            }),
            invalidatesTags: ["Admin"],
            transformResponse: (response) => {
                if (response?.admin && response?.token) {
                    localStorage.setItem("admin", JSON.stringify(response.admin));
                    localStorage.setItem("adminToken", response.token);
                }
                return response;
            },
        }),

        logoutAdmin: builder.mutation({
            query: () => ({
                url: "/logout-admin",
                method: "POST",
            }),
            invalidatesTags: ["Admin"],
        }),

        getAdminProfile: builder.query({
            query: () => ({
                url: "/getAdminProfile",
                method: "GET",
            }),
            providesTags: ["Admin"],
        }),

        verifyAdminToken: builder.query({
            query: () => ({
                url: "/verifyToken",
                method: "GET",
            }),
            providesTags: ["Admin"],
        }),

        // Updated mutations with correct endpoints
        updateAdminProfile: builder.mutation({
            query: (profileData) => ({
                url: "/updateAdminProfile",
                method: "PUT",
                body: profileData,
            }),
            invalidatesTags: ["Admin"],
        }),

        uploadAdminPhoto: builder.mutation({
            query: (file) => {
                const formData = new FormData();
                formData.append("photo", file);
                return {
                    url: "/uploadPhoto",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Admin"],
        }),

        removeAdminPhoto: builder.mutation({
            query: () => ({
                url: "/removePhoto",
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),

        updateAdminPreferences: builder.mutation({
            query: (preferences) => ({
                url: "/updatePreferences", // This matches the backend route now
                method: "PUT",
                body: preferences,
            }),
            invalidatesTags: ["Admin"],
        }),
    }),
});

export const {
    useLoginAdminMutation,
    useVerifyAdminMutation,
    useLogoutAdminMutation,
    useGetAdminProfileQuery,
    useVerifyAdminTokenQuery,
    useUpdateAdminProfileMutation,
    useUploadAdminPhotoMutation,
    useRemoveAdminPhotoMutation,
    useUpdateAdminPreferencesMutation
} = authApi;