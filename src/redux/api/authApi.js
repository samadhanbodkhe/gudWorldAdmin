import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/adminAuth`,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            const token = localStorage.getItem("adminToken");
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
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
            transformResponse: (response) => {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                return response;
            },
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

        // Profile mutations
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
                    // Don't set Content-Type header - let browser set it with boundary
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

        // Email verification mutations
        sendEmailVerification: builder.mutation({
            query: (emailData) => ({
                url: "/send-email-verification",
                method: "POST",
                body: emailData,
            }),
        }),

        verifyEmailOtp: builder.mutation({
            query: (otpData) => ({
                url: "/verify-email-otp",
                method: "POST",
                body: otpData,
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
    useSendEmailVerificationMutation,
    useVerifyEmailOtpMutation
} = authApi;