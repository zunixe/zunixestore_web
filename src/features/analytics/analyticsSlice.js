import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/analytics`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const fetchRevenue = createAsyncThunk('analytics/fetchRevenue', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/analytics/revenue`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { data: null, revenue: [], isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (s) => { s.isLoading = true; })
      .addCase(fetchAnalytics.fulfilled, (s, a) => { s.isLoading = false; s.data = a.payload; })
      .addCase(fetchAnalytics.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchRevenue.fulfilled, (s, a) => { s.revenue = a.payload; });
  },
});
export default analyticsSlice.reducer;
