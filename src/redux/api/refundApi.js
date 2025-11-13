// src/redux/api/refundApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const refundApi = createApi({
  reducerPath: "refundApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/refunds`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Refunds", "Refund", "CancelledOrders"],
  endpoints: (builder) => ({
    // Get all refunds with filters
    getAllRefunds: builder.query({
      query: ({ page = 1, limit = 10, status = "", search = "" }) => ({
        url: `/getAllRefunds`,
        params: { page, limit, status, search }
      }),
      providesTags: ["Refunds"],
    }),

    // Get cancelled orders that need refunds
    getCancelledOrdersForRefund: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: `/getCancelledOrders`,
        params: { page, limit, search }
      }),
      providesTags: ["CancelledOrders"],
    }),

    getRefundById: builder.query({
      query: (id) => `/getRefundById/${id}`,
      providesTags: ["Refund"],
    }),

    // Process refund for cancelled order
    processRefundForOrder: builder.mutation({
      query: ({ orderId, refundAmount, refundReason }) => ({
        url: `/processRefundForOrder/${orderId}`,
        method: "POST",
        body: { refundAmount, refundReason }, // Send directly, not wrapped
      }),
      invalidatesTags: ["Refunds", "CancelledOrders"],
    }),

    // Process refund (direct parameters)
    processRefund: builder.mutation({
      query: ({ id, refundAmount, refundReason }) => ({
        url: `/processRefund/${id}`,
        method: "POST",
        body: { refundAmount, refundReason }, // Send directly, not wrapped
      }),
      invalidatesTags: ["Refunds", "CancelledOrders"],
    }),

    manualProcessRefund: builder.mutation({
      query: (id) => ({
        url: `/manualProcessRefund/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Refunds", "Refund"],
    }),

    getRefundAnalytics: builder.query({
      query: () => "/getRefundAnalytics",
      providesTags: ["Refunds"],
    }),
  }),
});

export const {
  useGetAllRefundsQuery,
  useGetCancelledOrdersForRefundQuery,
  useGetRefundByIdQuery,
  useProcessRefundForOrderMutation,
  useProcessRefundMutation,
  useManualProcessRefundMutation,
  useGetRefundAnalyticsQuery,
} = refundApi;