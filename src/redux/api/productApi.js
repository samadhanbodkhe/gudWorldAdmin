// src/redux/api/productApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/product`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Don't set Content-Type for FormData - browser will set it automatically with boundary
      return headers;
    },
  }),
  tagTypes: ["Product", "Stock"],
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query({
      query: ({ page = 1, limit = 10, q = "", category = "", lowStock = "" }) => ({
        url: "/getProducts",
        method: "GET",
        params: { page, limit, q, category, lowStock },
      }),
      providesTags: ["Product"],
    }),

    // Get single product
    getProduct: builder.query({
      query: (id) => `/getProductById/${id}`,
      providesTags: ["Product"],
    }),

    // Create product - FIXED: Remove Content-Type header for FormData
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/createProduct",
        method: "POST",
        body: formData,
        // Let the browser set the Content-Type with boundary for FormData
      }),
      invalidatesTags: ["Product"],
    }),

    // Update product - FIXED: Remove Content-Type header for FormData
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/updateProduct/${id}`,
        method: "PUT",
        body: formData,
        // Let the browser set the Content-Type with boundary for FormData
      }),
      invalidatesTags: ["Product"],
    }),

    // Delete product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/deleteProduct/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // Adjust stock - FIXED: Send proper JSON data
    adjustStock: builder.mutation({
      query: ({ id, qty, note }) => ({
        url: `/adjustStock/${id}`,
        method: "POST",
        body: { 
          qty: parseFloat(qty), // Ensure it's a number
          note: note || `Stock adjustment: ${qty > 0 ? '+' : ''}${qty}`
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ["Product", "Stock"],
    }),

    // Stock history
    getStockHistory: builder.query({
      query: ({ id, page = 1, limit = 10 }) => ({
        url: `/stockHistory/${id}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Stock"],
    }),

    // Low stock alerts
    getLowStockAlerts: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/lowStockAlerts",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Product"],
    }),

    // Get categories
    getCategories: builder.query({
      query: () => "/getCategories",
      providesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAdjustStockMutation,
  useGetStockHistoryQuery,
  useGetLowStockAlertsQuery,
  useGetCategoriesQuery,
} = productApi;