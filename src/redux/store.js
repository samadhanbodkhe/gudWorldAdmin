import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import authReducer from "./slice/authSlice"; // Changed from named to default import
import { dashboardApi } from "./api/dashboardApi";
import { productApi } from "./api/productApi";
import { ordersApi } from "./api/ordersApi";
import { userApi } from "./api/userApi";
import { refundApi } from "./api/refundApi";

const reduxStore = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [ordersApi.reducerPath]: ordersApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [refundApi.reducerPath]: refundApi.reducer,
        auth: authReducer, // Use the imported reducer
    },
    middleware: def=>[
        ...def(),
        authApi.middleware,
        dashboardApi.middleware,
        productApi.middleware,
        ordersApi.middleware,
        userApi.middleware,
        refundApi.middleware,

    ]

});

export default reduxStore;