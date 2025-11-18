// src/redux/api/ordersApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/booking`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Order", "CancelledOrder"],
  endpoints: (builder) => ({
    // Get all orders (admin)
    getOrders: builder.query({
      query: ({ page = 1, limit = 10, status = "", paymentStatus = "" }) => ({
        url: "/admin/bookings",
        method: "GET",
        params: { page, limit, status, paymentStatus },
      }),
      providesTags: ["Order"],
    }),

    // Get single order
    getOrder: builder.query({
      query: (id) => `/getBookingById/${id}`,
      providesTags: ["Order"],
    }),

    // Update order status
    updateOrderStatus: builder.mutation({
      query: ({ id, status, trackingNumber }) => ({
        url: `/admin/booking/status/${id}`,
        method: "PUT",
        body: { status, trackingNumber },
      }),
      invalidatesTags: ["Order"],
    }),

    // Complete order
    completeOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/booking/complete/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Order"],
    }),

    // Cancel order
    cancelOrder: builder.mutation({
      query: ({ id, cancellationReason }) => ({
        url: `/cancel/booking/${id}`,
        method: "POST",
        body: { cancellationReason },
      }),
      invalidatesTags: ["Order"],
    }),

    // Process refund
    processRefund: builder.mutation({
      query: ({ id, refundAmount, refundReason }) => ({
        url: `/admin/booking/refund/${id}`,
        method: "POST",
        body: { refundAmount, refundReason },
      }),
      invalidatesTags: ["Order", "CancelledOrder"],
    }),

    // Get cancelled orders - NEW endpoint
    getCancelledOrders: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/getCancelledOrders",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["CancelledOrder"],
    }),

    // Get cancelled order by ID - NEW endpoint
    getCancelledOrderById: builder.query({
      query: (id) => `/getCancelledOrderById/${id}`,
      providesTags: ["CancelledOrder"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
  useProcessRefundMutation,
  useGetCancelledOrdersQuery, // NEW
  useGetCancelledOrderByIdQuery, // NEW
} = ordersApi;