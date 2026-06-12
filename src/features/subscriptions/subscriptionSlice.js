import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPlans = createAsyncThunk('subscriptions/fetchPlans', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/stores/subscription/plans'); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const fetchSubscription = createAsyncThunk('subscriptions/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/subscription`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const subscribe = createAsyncThunk('subscriptions/subscribe', async ({ storeId, plan }, { rejectWithValue }) => {
  try { const res = await api.post(`/stores/${storeId}/subscription`, plan); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState: { plans: {}, current: null, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.fulfilled, (s, a) => { s.plans = a.payload; })
      .addCase(fetchSubscription.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(fetchSubscription.pending, (s) => { s.isLoading = true; })
      .addCase(fetchSubscription.fulfilled, (s) => { s.isLoading = false; })
      .addCase(fetchSubscription.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(subscribe.fulfilled, (s, a) => { s.current = a.payload; });
  },
});
export default subscriptionSlice.reducer;
