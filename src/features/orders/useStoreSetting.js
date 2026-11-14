import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

/*
 * Baca/tulis satu kunci pengaturan toko lewat API backend:
 *   GET  /stores/:id/settings/:key  -> { key, value }
 *   PUT  /stores/:id/settings       -> { [key]: value }  (disimpan sebagai string)
 * Nilai disimpan sebagai JSON string. Tanpa toko aktif, nilai hanya disimpan di state lokal.
 */
export function useStoreSetting(key, defaultValue) {
  const storeId = useSelector((s) => s.stores.currentStore?.id) || null;
  const [fallback] = useState(defaultValue);
  const [state, setState] = useState({ storeId: undefined, value: defaultValue, error: null });

  useEffect(() => {
    if (!storeId) return undefined;
    let alive = true;
    api.get(`/stores/${storeId}/settings/${key}`)
      .then((res) => {
        if (!alive) return;
        let value = fallback;
        const raw = res?.data?.value;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            value = Array.isArray(fallback) || typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)
              ? parsed
              : { ...fallback, ...parsed };
          } catch {
            value = fallback;
          }
        }
        setState({ storeId, value, error: null });
      })
      .catch((err) => {
        if (alive) setState({ storeId, value: fallback, error: err.message || 'Gagal memuat pengaturan' });
      });
    return () => { alive = false; };
  }, [storeId, key, fallback]);

  const loading = !!storeId && state.storeId !== storeId;
  const value = storeId && state.storeId === storeId ? state.value : (storeId ? fallback : state.value);

  const save = useCallback(async (next) => {
    if (storeId) await api.put(`/stores/${storeId}/settings`, { [key]: JSON.stringify(next) });
    setState((s) => ({ ...s, storeId: storeId || s.storeId, value: next, error: null }));
    return next;
  }, [storeId, key]);

  return { value, loading, error: state.error, save, persisted: !!storeId };
}

export default useStoreSetting;
