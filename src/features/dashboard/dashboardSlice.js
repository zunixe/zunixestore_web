import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/analytics`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { data: null, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (s) => { s.isLoading = true; })
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.isLoading = false; s.data = a.payload; })
      .addCase(fetchDashboard.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  },
});
export default dashboardSlice.reducer;
