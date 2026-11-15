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

export const updateThemeConfig = createAsyncThunk('themes/updateConfig', async ({ storeId, themeId, config }, { rejectWithValue }) => {
  try { await api.put(`/stores/${storeId}/theme/config`, { config }); return { themeId, config }; }
  catch (err) { return rejectWithValue(err.message); }
});

const themesSlice = createSlice({
  name: 'themes',
  initialState: { themes: [], activeTheme: null, isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemes.pending, (s) => { s.isLoading = true; })
      .addCase(fetchThemes.fulfilled, (s, a) => {
        s.isLoading = false;
        s.themes = Array.isArray(a.payload) ? a.payload : [];
        s.activeTheme = s.themes.find(t => t.is_active) || s.themes[0] || null;
      })
      .addCase(fetchThemes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(activateTheme.pending, (s) => { s.error = null; })
      .addCase(activateTheme.fulfilled, (s, a) => {
        s.themes = s.themes.map(t => ({ ...t, is_active: t.id === a.payload?.id ? 1 : 0 }));
        s.activeTheme = a.payload || null;
      })
      .addCase(activateTheme.rejected, (s, a) => { s.error = a.payload; })
      .addCase(updateThemeConfig.fulfilled, (s, a) => {
        const config = JSON.stringify(a.payload.config);
        const updated_at = new Date().toISOString();
        s.themes = s.themes.map(t => (t.id === a.payload.themeId ? { ...t, config, updated_at } : t));
        if (s.activeTheme?.id === a.payload.themeId) s.activeTheme = { ...s.activeTheme, config, updated_at };
      });
  },
});
export default themesSlice.reducer;
