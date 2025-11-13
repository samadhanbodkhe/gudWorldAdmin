// src/redux/apis/userApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/userAuth`,
    credentials: "include",
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: "/getAllUsers",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUsersQuery } = userApi;
