import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { sinceKey, buildPeriods, dbDayKey, isCancelled } from './statsUtils';

const MAX_ITEM_ORDERS = 100;

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/analytics`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});
export const fetchRevenue = createAsyncThunk('analytics/fetchRevenue', async (storeId, { rejectWithValue }) => {
  try { const res = await api.get(`/stores/${storeId}/analytics/revenue`); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

/*
 * Data mentah untuk Statistik Toko: order (periode terpilih + sebelumnya), kunjungan harian,
 * customer, produk, dan item order (untuk produk terlaris, maks. 100 order terbaru).
 */
export const fetchStoreStats = createAsyncThunk('analytics/fetchStoreStats', async ({ storeId, days }, { rejectWithValue }) => {
  try {
    const since = sinceKey(days);
    const [summary, orders, customers, products] = await Promise.allSettled([
      api.get(`/stores/${storeId}/analytics?period=month`),
      api.get(`/stores/${storeId}/orders?limit=10000&dateFrom=${since}`),
      api.get(`/stores/${storeId}/customers?limit=10000`),
      api.get(`/stores/${storeId}/products?limit=10000`),
    ]);
    const val = (r, pick) => (r.status === 'fulfilled' ? pick(r.value) : null);
    const orderList = val(orders, (r) => r.data?.items) || [];
    const { current } = buildPeriods(days);
    const currentSet = new Set(current);
    const soldOrders = orderList.filter((o) => !isCancelled(o) && currentSet.has(dbDayKey(o.created_at)));
    const detailTargets = soldOrders.slice(0, MAX_ITEM_ORDERS);
    const details = await Promise.allSettled(detailTargets.map((o) => api.get(`/stores/${storeId}/orders/${o.id}`)));
    const orderItems = details.flatMap((r) => (r.status === 'fulfilled' ? (r.value.data?.items || []) : []));
    const failed = [summary, orders, customers, products].filter((r) => r.status === 'rejected');
    if (failed.length === 4) return rejectWithValue(failed[0].reason?.message || 'Gagal memuat statistik');
    return {
      days,
      daily: val(summary, (r) => r.data?.daily) || [],
      orders: orderList,
      customers: val(customers, (r) => r.data?.items) || [],
      products: val(products, (r) => r.data?.items) || [],
      orderItems,
      itemsCapped: soldOrders.length > MAX_ITEM_ORDERS,
      partialError: failed.length ? (failed[0].reason?.message || 'Sebagian data gagal dimuat') : null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) { return rejectWithValue(err.message); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { data: null, revenue: [], isLoading: false, error: null, stats: null, statsLoading: false, statsError: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (s) => { s.isLoading = true; })
      .addCase(fetchAnalytics.fulfilled, (s, a) => { s.isLoading = false; s.data = a.payload; })
      .addCase(fetchAnalytics.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchRevenue.fulfilled, (s, a) => { s.revenue = a.payload; })
      .addCase(fetchStoreStats.pending, (s) => { s.statsLoading = true; s.statsError = null; })
      .addCase(fetchStoreStats.fulfilled, (s, a) => { s.statsLoading = false; s.stats = a.payload; })
      .addCase(fetchStoreStats.rejected, (s, a) => { s.statsLoading = false; s.statsError = a.payload; });
  },
});
export default analyticsSlice.reducer;
