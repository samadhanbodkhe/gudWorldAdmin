// src/redux/api/cancelOrderApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cancelOrderApi = createApi({
  reducerPath: "cancelOrderApi",
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
  tagTypes: ["CancelledOrders"],
  endpoints: (builder) => ({
    // Get all cancelled orders
    getCancelledOrders: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "all" }) => ({
        url: `/getCancelledOrders`,
        params: { page, limit, search, status }
      }),
      providesTags: ["CancelledOrders"],
    }),

    // Get specific cancelled order by ID
    getCancelledOrderById: builder.query({
      query: (id) => `/getCancelledOrderById/${id}`,
      providesTags: ["CancelledOrders"],
    }),
  }),
});

export const {
  useGetCancelledOrdersQuery,
  useGetCancelledOrderByIdQuery,
} = cancelOrderApi;