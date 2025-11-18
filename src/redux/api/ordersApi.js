// src/redux/api/ordersApi.js (Admin Panel)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const token = localStorage.getItem('adminToken');
  
  const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/booking`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/admin/login';
  }

  return result;
};

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Order", "CancelledOrder"],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ page = 1, limit = 10, status = "", paymentStatus = "" }) => ({
        url: "/admin/bookings",
        method: "GET",
        params: { page, limit, status, paymentStatus },
      }),
      providesTags: ["Order"],
      keepUnusedDataFor: 0,
    }),

    getOrder: builder.query({
      query: (id) => `/getBookingById/${id}`,
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status, trackingNumber }) => ({
        url: `/admin/booking/status/${id}`,
        method: "PUT",
        body: { status, trackingNumber },
      }),
      invalidatesTags: ["Order"],
    }),

    completeOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/booking/complete/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Order"],
    }),

    cancelOrder: builder.mutation({
      query: ({ id, cancellationReason }) => ({
        url: `/cancel/booking/${id}`,
        method: "POST",
        body: { cancellationReason },
      }),
      invalidatesTags: ["Order"],
    }),

    processRefund: builder.mutation({
      query: ({ id, refundAmount, refundReason }) => ({
        url: `/admin/booking/refund/${id}`,
        method: "POST",
        body: { refundAmount, refundReason },
      }),
      invalidatesTags: ["Order", "CancelledOrder"],
    }),

    getCancelledOrders: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/getCancelledOrders",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["CancelledOrder"],
    }),

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
  useGetCancelledOrdersQuery,
  useGetCancelledOrderByIdQuery,
} = ordersApi;