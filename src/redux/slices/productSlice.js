import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";
import { createBreakageTransaction, createOpenSellTransaction, createTransaction } from "./billingSlice";

export const createProduct = createAsyncThunk(
    "product/create",
    async ({ name, description, price, qty }, { rejectWithValue }) => {
        try {
            const response = await api.post("/api/product", { name, description, price, qty });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.response?.message || "An error occurred");
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/update",
    async ({ name, description, price, qty, id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/api/product/${id}`, { name, description, price, qty });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.response?.message || "An error occurred");
        }
    }
);

export const fetchProducts = createAsyncThunk(
    "product/fetch",
    async ({ page = 1, search = "" }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, search });
            const response = await api.get(`/api/product?${params.toString()}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.response?.message || "An error occurred");
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: null,
        singleProduct: null,
        loading: false,
        error: null,
        success: null,
    },
    reducers: {
        clearProductState: (state) => {
            state.error = null;
            state.success = null;
            state.loading = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload?.message;
                if (state.products.data) {
                    state.products.data.unshift(action.payload.product);
                }
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Edit
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload?.message;
                if (state.products?.data) {
                    const index = state.products.data.findIndex(p => p.id === action.payload.product.id);
                    if (index !== -1) {
                        state.products.data[index] = action.payload.product;
                    }
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Handle product qty updates for Breakage transactions
            .addCase(createBreakageTransaction.fulfilled, (state, action) => {
                const usedProducts = action.payload?.data?.selectedProducts || [];

                if (state.products?.data) {
                    usedProducts.forEach((used) => {
                        const index = state.products.data.findIndex((p) => p.id === used.id);
                        if (index !== -1) {
                            state.products.data[index].qty -= used.quantity;
                            if (state.products.data[index].qty < 0) {
                                state.products.data[index].qty = 0;
                            }
                        }
                    });
                }
            })

            // Handle product qty updates for Open Sell transactions
            .addCase(createOpenSellTransaction.fulfilled, (state, action) => {
                const usedProducts = action.payload?.data?.selectedProducts || [];

                if (state.products?.data) {
                    usedProducts.forEach((used) => {
                        const index = state.products.data.findIndex((p) => p.id === used.id);
                        if (index !== -1) {
                            state.products.data[index].qty -= used.quantity;
                            if (state.products.data[index].qty < 0) {
                                state.products.data[index].qty = 0;
                            }
                        }
                    });
                }
            })

            .addCase(createTransaction.fulfilled, (state, action) => {
                const transaction = action.payload?.data;
                const type = transaction?.type;
                const usedProducts = transaction?.selectedProducts || [];

                if (state.products?.data && type) {
                    usedProducts.forEach((used) => {
                        const index = state.products.data.findIndex((p) => p.id === used.id);
                        if (index !== -1) {
                            if (["Buy", "Return-In"].includes(type)) {
                                // Increase qty
                                state.products.data[index].qty += used.quantity;
                            } else if (["Sell", "Open Sell", "Return-Out"].includes(type)) {
                                // Decrease qty
                                state.products.data[index].qty -= used.quantity;
                                if (state.products.data[index].qty < 0) {
                                    state.products.data[index].qty = 0;
                                }
                            }
                        }
                    });
                }
            })
    },
});

export const { clearProductState } = productSlice.actions;
export default productSlice.reducer;
