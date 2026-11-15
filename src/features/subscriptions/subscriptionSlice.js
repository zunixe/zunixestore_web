import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPlans = createAsyncThunk('subscriptions/fetchPlans', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/subscription/plans`); return res.data; }
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
export const fetchUsage = createAsyncThunk('subscriptions/usage', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/subscription/usage`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const fetchBilling = createAsyncThunk('subscriptions/billing', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/subscription/billing`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState: { plans: {}, current: null, usage: null, billing: [], isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.fulfilled, (s, a) => { s.plans = a.payload; })
      .addCase(fetchSubscription.pending, (s) => { s.isLoading = true; })
      .addCase(fetchSubscription.fulfilled, (s, a) => { s.isLoading = false; s.current = a.payload; })
      .addCase(fetchSubscription.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(subscribe.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(fetchUsage.fulfilled, (s, a) => { s.usage = a.payload; })
      .addCase(fetchBilling.fulfilled, (s, a) => { s.billing = a.payload || []; });
  },
});
export default subscriptionSlice.reducer;
