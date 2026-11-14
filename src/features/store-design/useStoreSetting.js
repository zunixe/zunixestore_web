/*
 * Hook kecil untuk membaca/menyimpan satu kunci di store_settings
 * (GET /stores/:id/settings/:key, PUT /stores/:id/settings).
 * Nilai disimpan sebagai JSON string. Tanpa toko aktif, data hanya disimpan di state lokal.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

function parseValue(raw, fallback) {
  if (raw === null || raw === undefined || raw === '') return fallback;
  try { return JSON.parse(raw); } catch { return raw; }
}

export function useStoreSetting(key, fallback) {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [initial] = useState(fallback);
  const [state, setState] = useState({ storeId: null, value: initial, loaded: false, error: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings/${key}`)
      .then((res) => {
        if (!cancelled) setState({ storeId, value: parseValue(res.data?.value, initial), loaded: true, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ storeId, value: initial, loaded: true, error: err.message });
      });
    return () => { cancelled = true; };
  }, [storeId, key, initial]);

  const save = useCallback(async (next) => {
    setState((s) => ({ ...s, value: next, error: null }));
    if (!storeId) return true;
    setSaving(true);
    try {
      await api.put(`/stores/${storeId}/settings`, { [key]: JSON.stringify(next) });
      return true;
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [storeId, key]);

  const current = state.storeId === storeId ? state : { value: initial, loaded: !storeId, error: null };
  return { value: current.value, loaded: current.loaded, error: current.error, saving, save };
}

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function formatTanggal(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
