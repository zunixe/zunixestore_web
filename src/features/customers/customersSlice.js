import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCustomers = createAsyncThunk('customers/fetch', async ({ storeId, params }, { rejectWithValue }) => {
  try { const q = new URLSearchParams(params).toString(); const res = await api.get(`/stores/${storeId}/customers?${q}`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const customersSlice = createSlice({
  name: 'customers',
  initialState: { items: [], total: 0, page: 1, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (s) => { s.isLoading = true; })
      .addCase(fetchCustomers.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.items; s.total = a.payload.total; s.page = a.payload.page; })
      .addCase(fetchCustomers.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  },
});
export default customersSlice.reducer;
