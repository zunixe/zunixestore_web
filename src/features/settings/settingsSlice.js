import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchSettings = createAsyncThunk('settings/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/settings`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const updateSettings = createAsyncThunk('settings/update', async ({ storeId, settings }, { rejectWithValue }) => {
  try { const res = await api.put(`/stores/${storeId}/settings`, settings); return settings; }
  catch (err) { return rejectWithValue(err.message); }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { data: {}, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (s) => { s.isLoading = true; })
      .addCase(fetchSettings.fulfilled, (s, a) => { s.isLoading = false; s.data = a.payload; })
      .addCase(fetchSettings.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(updateSettings.fulfilled, (s, a) => { s.data = { ...s.data, ...a.payload }; });
  },
});
export default settingsSlice.reducer;
