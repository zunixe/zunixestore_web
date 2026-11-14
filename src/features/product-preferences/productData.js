import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

/*
 * Data bersama untuk subhalaman Produk (Stok, Kategori, Produk bundle,
 * Produk unggulan, Pengaturan Produk).
 *
 * - useStoreSetting: baca/simpan satu kunci pengaturan toko berbentuk JSON lewat
 *   GET/PUT /stores/:id/settings (backend menyimpan nilai sebagai string).
 *   `defaults` harus konstanta level modul agar referensinya stabil.
 * - useAllProducts: semua produk toko (satu permintaan, limit besar) untuk
 *   pemilih produk dan hitungan per kategori.
 */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function mergeDefaults(defaults, stored) {
  if (stored === undefined) return defaults;
  if (Array.isArray(defaults)) return Array.isArray(stored) ? stored : defaults;
  if (!isPlainObject(defaults) || !isPlainObject(stored)) return stored;
  const out = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    out[k] = isPlainObject(defaults[k]) && isPlainObject(v) ? mergeDefaults(defaults[k], v) : v;
  }
  return out;
}

function parseValue(raw) {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string') return raw;
  try { return JSON.parse(raw); } catch { return undefined; }
}

export function useStoreSetting(key, defaults) {
  const storeId = useSelector((s) => s.stores.currentStore?.id);
  const [state, setState] = useState({ storeId: null, value: defaults, loadError: false });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [dirty, setDirty] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        setState({ storeId, value: mergeDefaults(defaults, parseValue(res.data?.[key])), loadError: false });
        setDirty(false);
      })
      .catch(() => {
        if (cancelled) return;
        setState({ storeId, value: defaults, loadError: true });
      });
    return () => { cancelled = true; };
  }, [storeId, key, defaults]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const setValue = useCallback((updater) => {
    setState((s) => ({ ...s, value: typeof updater === 'function' ? updater(s.value) : updater }));
    setDirty(true);
    setStatus((st) => (st.type === 'saved' ? { type: 'idle', message: '' } : st));
  }, []);

  const save = useCallback(async (nextValue) => {
    if (!storeId) return false;
    const value = nextValue === undefined ? state.value : nextValue;
    if (nextValue !== undefined) setState((s) => ({ ...s, value }));
    setStatus({ type: 'saving', message: '' });
    try {
      await api.put(`/stores/${storeId}/settings`, { [key]: JSON.stringify(value) });
      setDirty(false);
      setStatus({ type: 'saved', message: 'Perubahan tersimpan' });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
      return true;
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
      return false;
    }
  }, [storeId, key, state.value]);

  return {
    value: state.value,
    setValue,
    save,
    status,
    dirty,
    loading: !!storeId && state.storeId !== storeId,
    loadError: state.loadError,
    hasStore: !!storeId,
  };
}

export function useAllProducts() {
  const storeId = useSelector((s) => s.stores.currentStore?.id);
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ key: null, items: [], error: '' });
  const reqKey = storeId ? `${storeId}:${version}` : null;

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    const k = `${storeId}:${version}`;
    api.get(`/stores/${storeId}/products?page=1&limit=1000`)
      .then((res) => { if (!cancelled) setState({ key: k, items: res.data?.items || [], error: '' }); })
      .catch((err) => { if (!cancelled) setState({ key: k, items: [], error: err.message || 'Gagal memuat produk' }); });
    return () => { cancelled = true; };
  }, [storeId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    items: state.items,
    error: state.error,
    loading: !!storeId && state.key !== reqKey,
    reload,
    storeId,
  };
}

/* Default Pengaturan Produk — dipakai halaman Pengaturan Produk & Stok. */
export const PRODUCT_PREF_DEFAULTS = {
  default_status: 'stock',
  out_of_stock: 'sold_out',
  preorder_time: '24h',
  show_new_products: true,
  low_stock_alert: false,
  low_stock_threshold: 10,
  stock_visibility: 'none',
  hide_sold_out: false,
  notify_button_text: 'Beritahu Saya',
  allow_photo_download: false,
};

export function firstImage(p) {
  try { return JSON.parse(p?.image_urls || '[]')[0] || null; } catch { return null; }
}

export function parseExtra(p) {
  try {
    const v = JSON.parse(p?.description || '{}');
    return isPlainObject(v) ? v : {};
  } catch { return {}; }
}

/* SQLite menyimpan "YYYY-MM-DD HH:MM:SS" (UTC) tanpa zona waktu. */
export function parseDate(s) {
  if (!s) return null;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s) ? `${s.replace(' ', 'T')}Z` : s;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(s) {
  const d = parseDate(s);
  if (!d) return '';
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
