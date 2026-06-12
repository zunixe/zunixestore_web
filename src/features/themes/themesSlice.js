import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchThemes = createAsyncThunk('themes/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/theme`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const activateTheme = createAsyncThunk('themes/activate', async ({ storeId, themeId }, { rejectWithValue }) => {
  try { const res = await api.put(`/stores/${storeId}/theme/activate`, { themeId }); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const themesSlice = createSlice({
  name: 'themes',
  initialState: { themes: [], activeTheme: null, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemes.pending, (s) => { s.isLoading = true; })
      .addCase(fetchThemes.fulfilled, (s, a) => { s.isLoading = false; s.themes = a.payload.filter ? a.payload : []; s.activeTheme = a.payload.themes ? a.payload.themes.find(t => t.is_active) : a.payload; })
      .addCase(fetchThemes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(activateTheme.fulfilled, (s, a) => { s.activeTheme = a.payload; });
  },
});
export default themesSlice.reducer;
