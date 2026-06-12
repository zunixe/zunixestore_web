import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDiscounts = createAsyncThunk('discounts/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/discounts`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const createDiscount = createAsyncThunk('discounts/create', async ({ storeId, data }, { rejectWithValue }) => {
  try { const res = await api.post(`/stores/${storeId}/discounts`, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const deleteDiscount = createAsyncThunk('discounts/delete', async ({ storeId, discountId }, { rejectWithValue }) => {
  try { await api.delete(`/stores/${storeId}/discounts/${discountId}`); return discountId; }
  catch (err) { return rejectWithValue(err.message); }
});

const discountsSlice = createSlice({
  name: 'discounts',
  initialState: { items: [], isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (s) => { s.isLoading = true; })
      .addCase(fetchDiscounts.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; })
      .addCase(fetchDiscounts.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(createDiscount.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(deleteDiscount.fulfilled, (s, a) => { s.items = s.items.filter(d => d.id !== a.payload); });
  },
});
export default discountsSlice.reducer;
