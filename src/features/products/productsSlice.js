import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetch', async ({ storeId, params }, { rejectWithValue }) => {
  try { const q = new URLSearchParams(params).toString(); const res = await api.get(`/stores/${storeId}/products?${q}`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const fetchProductById = createAsyncThunk('products/fetchById', async ({ storeId, productId }, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/products/${productId}`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const createProduct = createAsyncThunk('products/create', async ({ storeId, data }, { rejectWithValue }) => {
  try { const res = await api.post(`/stores/${storeId}/products`, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const updateProduct = createAsyncThunk('products/update', async ({ storeId, productId, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/stores/${storeId}/products/${productId}`, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const deleteProduct = createAsyncThunk('products/delete', async ({ storeId, productId }, { rejectWithValue }) => {
  try { await api.delete(`/stores/${storeId}/products/${productId}`); return productId; }
  catch (err) { return rejectWithValue(err.message); }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], total: 0, total_all: 0, page: 1, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.isLoading = true; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.items; s.total = a.payload.total; s.total_all = a.payload.total_all ?? s.total_all; s.page = a.payload.page; })
      .addCase(fetchProducts.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(createProduct.fulfilled, (s, a) => { s.items.unshift(a.payload); s.total++; })
      .addCase(updateProduct.fulfilled, (s, a) => { const idx = s.items.findIndex(p => p.id === a.payload.id); if (idx !== -1) s.items[idx] = a.payload; })
      .addCase(deleteProduct.fulfilled, (s, a) => { s.items = s.items.filter(p => p.id !== a.payload); s.total--; });
  },
});
export default productsSlice.reducer;
