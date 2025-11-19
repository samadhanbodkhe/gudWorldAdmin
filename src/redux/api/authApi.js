// src/redux/api/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Custom base query for admin auth
const baseQueryWithAuth = async (args, api, extraOptions) => {
   const token = localStorage.getItem("admin_token");

  const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/adminAuth`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 errors without redirecting to prevent loops
  if (result.error && result.error.status === 401) {
     console.log('🛑 401 Unauthorized in base query');
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
  }

  return result;
};

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithAuth,
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
            // Prevent retries on 401
            keepUnusedDataFor: 0,
        }),

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
                url: "/updatePreferences",
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
    useUpdateAdminPreferencesMutation,
} = authApi;