import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchStores = createAsyncThunk('stores/fetchStores', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/stores');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createStore = createAsyncThunk('stores/createStore', async (storeData, { rejectWithValue }) => {
  try {
    const res = await api.post('/stores', storeData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const storeSlice = createSlice({
  name: 'stores',
  initialState: {
    currentStore: JSON.parse(localStorage.getItem('currentStore')) || null,
    stores: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload;
      localStorage.setItem('currentStore', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => { state.isLoading = true; })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload;
        if (!state.currentStore && action.payload.length > 0) {
          state.currentStore = action.payload[0];
          localStorage.setItem('currentStore', JSON.stringify(action.payload[0]));
        }
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.stores.push(action.payload);
      });
  },
});

export const { setCurrentStore } = storeSlice.actions;
export default storeSlice.reducer;
