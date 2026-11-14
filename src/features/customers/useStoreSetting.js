import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

/*
 * Membaca & menyimpan satu kunci pengaturan toko berbentuk JSON lewat
 * GET/PUT /stores/:id/settings. Backend menyimpan nilai sebagai string,
 * jadi objek di-JSON.stringify saat simpan dan di-parse saat dibaca.
 * `defaults` harus konstanta level modul agar referensinya stabil.
 */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function mergeDefaults(defaults, stored) {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) return stored === undefined ? defaults : stored;
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
