import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchOrders = createAsyncThunk('orders/fetch', async ({ storeId, params }, { rejectWithValue }) => {
  try { const q = new URLSearchParams(params).toString(); const res = await api.get(`/stores/${storeId}/orders?${q}`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ storeId, orderId, status }, { rejectWithValue }) => {
  try { const res = await api.put(`/stores/${storeId}/orders/${orderId}/status`, { status }); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], total: 0, page: 1, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (s) => { s.isLoading = true; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.items; s.total = a.payload.total; s.page = a.payload.page; })
      .addCase(fetchOrders.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => { const idx = s.items.findIndex(o => o.id === a.payload.id); if (idx !== -1) s.items[idx] = a.payload; });
  },
});
export default ordersSlice.reducer;
