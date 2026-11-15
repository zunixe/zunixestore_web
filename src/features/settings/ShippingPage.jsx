import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Truck, MapPin, KeyRound, Printer } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { SettingsSection, Toggle } from '../../components/ui';
import { SaveStatus } from '../product-preferences/ProductParts';

const COURIERS = [
  { key: 'jne', name: 'JNE', desc: 'Reguler, OKE, YES, Trucking' },
  { key: 'jnt', name: 'J&T', desc: 'Reguler, Economy, Express' },
  { key: 'sicepat', name: 'SiCepat', desc: 'REG, BEST, HALU' },
  { key: 'anteraja', name: 'AnterAja', desc: 'Same Day, Reguler' },
  { key: 'gosend', name: 'GoSend', desc: 'Instant, Same Day' },
  { key: 'pos', name: 'POS Indonesia', desc: 'Sameday, Nextday, Reguler' },
  { key: 'tiki', name: 'TIKI', desc: 'Reguler, Ekonomi' },
  { key: 'lion', name: 'Lion Parcel', desc: 'Reg Pack, Boss Pack' },
  { key: 'ninja', name: 'Ninja Xpress', desc: 'Standard' },
];

export default function ShippingPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [data, setData] = useState({ storeId: null, enabled: {}, origin: { postal_code: '', area_id: '', label: '' }, apiKey: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [originStatus, setOriginStatus] = useState({ type: 'idle', message: '' });
  const [keyStatus, setKeyStatus] = useState({ type: 'idle', message: '' });
  const [inv, setInv] = useState({ logo_url: '', footnote: '' });
  const [invStatus, setInvStatus] = useState({ type: 'idle', message: '' });
  const [areaQ, setAreaQ] = useState('');
  const [areas, setAreas] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        const enabled = {};
        COURIERS.forEach((c) => { enabled[c.key] = res.data?.[`shipping_${c.key}`] === 'true'; });
        let origin = { postal_code: '', area_id: '', label: '' };
        try {
          const o = JSON.parse(res.data?.shipping_origin || '{}');
          origin = { postal_code: o.postal_code || '', area_id: o.area_id || '', label: o.label || o.city || '' };
        } catch { /* abaikan */ }
        setData({ storeId, enabled, origin, apiKey: res.data?.shipping_api_key || '' });
        try { const iv = JSON.parse(res.data?.invoice_settings || '{}'); setInv({ logo_url: iv.logo_url || '', footnote: iv.footnote || '' }); } catch { /* abaikan */ }
      })
      .catch(() => { if (!cancelled) setData((d) => ({ ...d, storeId })); });
    return () => { cancelled = true; };
  }, [storeId]);

  const loading = !!storeId && data.storeId !== storeId;
  const { enabled, origin, apiKey } = data;
  const activeCount = COURIERS.filter((c) => enabled[c.key]).length;

  const toggle = async (key) => {
    if (status.type === 'saving') return;
    const prev = enabled;
    const next = { ...enabled, [key]: !enabled[key] };
    setData((d) => ({ ...d, enabled: next }));
    setStatus({ type: 'saving', message: '' });
    try {
      const body = {};
      COURIERS.forEach((c) => { body[`shipping_${c.key}`] = String(!!next[c.key]); });
      body.active_couriers = JSON.stringify(COURIERS.filter((c) => next[c.key]).map((c) => c.key));
      await api.put(`/stores/${storeId}/settings`, body);
      setStatus({ type: 'saved', message: 'Perubahan tersimpan' });
    } catch (err) {
      setData((d) => ({ ...d, enabled: prev }));
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const saveOrigin = async (patch = {}) => {
    const next = { ...origin, ...patch };
    setData((d) => ({ ...d, origin: next }));
    setOriginStatus({ type: 'saving', message: '' });
    try {
      await api.put(`/stores/${storeId}/settings`, { shipping_origin: JSON.stringify(next) });
      setOriginStatus({ type: 'saved', message: 'Alamat asal tersimpan' });
    } catch (err) {
      setOriginStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const searchArea = (q) => {
    setAreaQ(q);
    clearTimeout(searchTimer.current);
    if (q.trim().length < 3) { setAreas([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/public/shipping/areas?q=${encodeURIComponent(q.trim())}`);
        setAreas(res.data?.areas || []);
      } catch { setAreas([]); }
      finally { setSearching(false); }
    }, 400);
  };

  const saveApiKey = async () => {
    setKeyStatus({ type: 'saving', message: '' });
    try {
      await api.put(`/stores/${storeId}/settings`, { shipping_api_key: apiKey.trim() });
      setKeyStatus({ type: 'saved', message: 'API key tersimpan' });
    } catch (err) {
      setKeyStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const saveInvoice = async () => {
    setInvStatus({ type: 'saving', message: '' });
    try {
      await api.put(`/stores/${storeId}/settings`, { invoice_settings: JSON.stringify({ logo_url: inv.logo_url.trim(), footnote: inv.footnote }) });
      setInvStatus({ type: 'saved', message: 'Pengaturan invoice tersimpan' });
    } catch (err) {
      setInvStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-divider rounded-lg text-sm';

  return (
    <SettingsPageLayout
      title="Metode Pengiriman"
      desc="Tentukan metode pengiriman yang dapat dipilih customer."
      actions={<SaveStatus status={status} />}
    >
      <SettingsSection
        title="Kurir"
        description={`Aktifkan kurir yang bisa dipilih customer saat checkout. ${loading ? '' : `${activeCount} dari ${COURIERS.length} kurir aktif.`}`}
      >
        <div className="bg-white rounded-xl px-4 divide-y divide-divider">
          {loading ? (
            <div className="space-y-3 py-4" aria-busy="true">
              {COURIERS.map((c) => <div key={c.key} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : COURIERS.map(({ key, name, desc }) => (
            <div key={key} className="flex items-start gap-3 py-4">
              <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
                <Truck className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <Toggle id={`ship-${key}`} label={name} description={desc} checked={!!enabled[key]} onChange={() => toggle(key)} />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Alamat Asal Pengiriman"
        description="Titik asal untuk hitung ongkir — sama seperti alamat penjemputan di Plugo. Cari kecamatan/kode pos asal pengirimanmu."
      >
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
              <MapPin className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </span>
            <div className="flex-1 relative">
              <input
                value={areaQ}
                onChange={(e) => searchArea(e.target.value)}
                placeholder="Cari kecamatan/kelurahan asal (mis. Kebayoran Baru)…"
                className={inputClass}
              />
              {searching && <div className="text-xs text-neutral-400 mt-1">Mencari…</div>}
              {areas.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-divider rounded-lg shadow-lg max-h-56 overflow-auto">
                  {areas.map((a) => (
                    <button key={a.id} type="button"
                      onClick={() => { setAreas([]); setAreaQ(a.name); saveOrigin({ area_id: a.id, postal_code: a.postal_code || '', label: a.name }); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-neutral-400">{[a.administrative_division_level_2, a.administrative_division_level_1, a.postal_code].filter(Boolean).join(', ')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {origin.label || origin.postal_code ? (
            <div className="text-sm text-neutral-secondary bg-gray-50 rounded-lg px-3 py-2">
              Asal: <span className="font-medium">{origin.label || origin.postal_code}</span>
              {origin.postal_code && <span className="text-neutral-400"> · {origin.postal_code}</span>}
            </div>
          ) : <p className="text-xs text-amber-600">Alamat asal belum diatur — customer hanya melihat tarif flat.</p>}
          <SaveStatus status={originStatus} />
        </div>
      </SettingsSection>

      <SettingsSection
        title="API Ongkir (Biteship)"
        description="Sambungkan Biteship agar ongkir dihitung otomatis per layanan kurir (JNE REG, J&T EZ, dst) — fungsi yang sama dengan agregator KiriminAja di Plugo. Kosongkan untuk tarif flat."
      >
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
              <KeyRound className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </span>
            <label className="flex-1 block text-xs text-neutral-secondary">Biteship API Key <span className="text-neutral-400">(dari biteship.com → API Keys)</span>
              <input value={apiKey} onChange={(e) => setData((d) => ({ ...d, apiKey: e.target.value }))} placeholder="biteship_live_…" type="password" className={`${inputClass} mt-1`} />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={saveApiKey} disabled={keyStatus.type === 'saving'} className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50">
              {keyStatus.type === 'saving' ? 'Menyimpan…' : 'Simpan API Key'}
            </button>
            <SaveStatus status={keyStatus} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Invoice & Dokumen Cetak"
        description="Logo dan catatan kaki yang tampil di faktur cetak — setara Pengaturan invoice di Plugo."
      >
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
              <Printer className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </span>
            <div className="flex-1 space-y-3">
              <label className="block text-xs text-neutral-secondary">URL logo toko (opsional — tampil di header faktur)
                <input value={inv.logo_url} onChange={(e) => setInv((v) => ({ ...v, logo_url: e.target.value }))} placeholder="https://…/logo.png" className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-xs text-neutral-secondary">Catatan kaki faktur (opsional)
                <textarea value={inv.footnote} onChange={(e) => setInv((v) => ({ ...v, footnote: e.target.value }))} rows={3} placeholder="Terima kasih telah berbelanja di toko kami." className={`${inputClass} mt-1`} />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={saveInvoice} disabled={invStatus.type === 'saving'} className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50">
              {invStatus.type === 'saving' ? 'Menyimpan…' : 'Simpan Invoice'}
            </button>
            <SaveStatus status={invStatus} />
          </div>
        </div>
      </SettingsSection>
    </SettingsPageLayout>
  );
}
