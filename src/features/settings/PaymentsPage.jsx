import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Landmark, Wallet, HandCoins, CreditCard, QrCode } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { SettingsSection, Toggle } from '../../components/ui';
import { SaveStatus } from '../product-preferences/ProductParts';

// Fallback statis bila API channel iPaymu belum bisa diakses.
const FALLBACK_METHODS = [
  { code: 'va', name: 'Virtual Account', channels: [
    { code: 'bca', name: 'BCA' }, { code: 'bni', name: 'BNI' }, { code: 'bri', name: 'BRI' },
    { code: 'mandiri', name: 'Mandiri' }, { code: 'permata', name: 'Permata' }, { code: 'bsi', name: 'BSI' },
    { code: 'cimb', name: 'CIMB Niaga' }, { code: 'danamon', name: 'Danamon' }, { code: 'btn', name: 'BTN' },
    { code: 'bmi', name: 'Muamalat' }, { code: 'bag', name: 'Artha Graha' },
  ] },
  { code: 'qris', name: 'QRIS', channels: [{ code: 'mpm', name: 'QRIS' }] },
  { code: 'ewallet', name: 'E-Wallet', channels: [{ code: 'dana', name: 'DANA' }, { code: 'shopeepay', name: 'ShopeePay' }] },
  { code: 'debitonline', name: 'Debit Online', channels: [{ code: 'cc', name: 'Direct Debit' }] },
];
const METHOD_ICON = { va: Landmark, ewallet: Wallet, qris: QrCode, debitonline: CreditCard, cstore: Landmark, paylater: CreditCard, cc: CreditCard };
const channelKey = (m, c) => (m === 'qris' ? 'qris' : `${m}_${c}`);

export default function PaymentsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [data, setData] = useState({ storeId: null, enabled: {}, gateway: { va: '', api_key: '', is_production: false } });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [gwStatus, setGwStatus] = useState({ type: 'idle', message: '' });
  const [gwMethods, setGwMethods] = useState(null); // channel aktif di akun iPaymu

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        const enabled = {};
        Object.keys(res.data || {}).forEach((k) => {
          if (k.startsWith('payment_') && k !== 'payment_gateway') enabled[k.slice(8)] = res.data[k] === 'true';
        });
        let gateway = { va: '', api_key: '', is_production: false };
        try {
          const g = JSON.parse(res.data?.payment_gateway || '{}');
          gateway = { va: g.va || '', api_key: g.api_key || '', is_production: g.is_production === true || g.is_production === 'true' };
        } catch { /* abaikan */ }
        setData({ storeId, enabled, gateway });
      })
      .catch(() => { if (!cancelled) setData((d) => ({ ...d, storeId })); });
    return () => { cancelled = true; };
  }, [storeId]);

  useEffect(() => {
    if (!currentStore?.slug) return undefined;
    let cancelled = false;
    api.get(`/payment/channels?store_slug=${currentStore.slug}`)
      .then((res) => { if (!cancelled) setGwMethods(res.data?.methods?.length ? res.data.methods : FALLBACK_METHODS); })
      .catch(() => { if (!cancelled) setGwMethods(FALLBACK_METHODS); });
    return () => { cancelled = true; };
  }, [currentStore?.slug]);

  const loading = !!storeId && data.storeId !== storeId;
  const { enabled, gateway } = data;
  const methods = gwMethods || FALLBACK_METHODS;

  const toggle = async (key) => {
    if (status.type === 'saving') return;
    const prev = enabled;
    const next = { ...enabled, [key]: !enabled[key] };
    setData((d) => ({ ...d, enabled: next }));
    setStatus({ type: 'saving', message: '' });
    try {
      const body = {};
      Object.keys(next).forEach((k) => { body[`payment_${k}`] = String(!!next[k]); });
      await api.put(`/stores/${storeId}/settings`, body);
      setStatus({ type: 'saved', message: 'Perubahan tersimpan' });
    } catch (err) {
      setData((d) => ({ ...d, enabled: prev }));
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const saveGateway = async () => {
    setGwStatus({ type: 'saving', message: '' });
    try {
      await api.put(`/stores/${storeId}/settings`, {
        payment_gateway: JSON.stringify({ provider: 'ipaymu', va: gateway.va.trim(), api_key: gateway.api_key.trim(), is_production: gateway.is_production }),
      });
      setGwStatus({ type: 'saved', message: 'Gateway tersimpan' });
    } catch (err) {
      setGwStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-divider rounded-lg text-sm';

  return (
    <SettingsPageLayout
      title="Metode Pembayaran"
      desc="Tentukan metode pembayaran yang dapat dipilih customer."
      actions={<SaveStatus status={status} />}
    >
      <SettingsSection title="Metode yang tersedia" description="Daftar channel diambil langsung dari akun iPaymu (yang aktif di akunmu). Nonaktifkan channel yang tidak ingin ditawarkan; bila semua aktif, semua channel tampil. Perubahan langsung tersimpan.">
        <div className="bg-white rounded-xl px-4 divide-y divide-divider">
          {loading || gwMethods === null ? (
            <div className="space-y-3 py-4" aria-busy="true">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <>
              {methods.map((m) => {
                const Icon = METHOD_ICON[m.code] || Landmark;
                return (
                  <div key={m.code} className="py-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
                        <Icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
                      </span>
                      <div className="text-sm font-semibold">{m.name}</div>
                    </div>
                    <div className="pl-13 space-y-1">
                      {m.channels.map((c) => {
                        const key = channelKey(m.code, c.code);
                        return (
                          <Toggle
                            key={key}
                            id={`pay-${key}`}
                            label={m.code === 'va' ? `VA ${c.name}` : c.name}
                            description={c.buyer_fee > 0 ? `Biaya layanan customer Rp ${Number(c.buyer_fee).toLocaleString('id-ID')}` : undefined}
                            checked={!!enabled[key]}
                            onChange={() => toggle(key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
                    <HandCoins className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
                  </span>
                  <div className="text-sm font-semibold">Manual</div>
                </div>
                <div className="pl-13 space-y-1">
                  <Toggle id="pay-cod" label="COD (Bayar di Tempat)" description="Pembayaran tunai saat pengiriman — tanpa gateway" checked={!!enabled.cod} onChange={() => toggle('cod')} />
                </div>
              </div>
            </>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Payment Gateway"
        description="Sambungkan iPaymu agar customer membayar online (VA, QRIS, e-wallet, minimarket). Kunci diambil dari dashboard iPaymu → Integration — sama seperti integrasi ChatYuk."
      >
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
              <CreditCard className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium">iPaymu Redirect Payment</div>
              <div className="text-xs text-neutral-secondary mt-0.5">Customer diarahkan ke halaman bayar iPaymu lalu kembali ke toko — semua channel bayar dalam satu link.</div>
            </div>
            <div className="flex rounded-lg border border-divider overflow-hidden text-xs shrink-0">
              {[['false', 'Sandbox'], ['true', 'Production']].map(([v, label]) => (
                <button key={v} type="button" onClick={() => setData((d) => ({ ...d, gateway: { ...d.gateway, is_production: v === 'true' } }))}
                  className={`px-3 py-1.5 ${String(gateway.is_production) === v ? 'bg-primary text-white' : 'text-neutral-secondary'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-xs text-neutral-secondary">Nomor VA iPaymu
            <input value={gateway.va} onChange={(e) => setData((d) => ({ ...d, gateway: { ...d.gateway, va: e.target.value } }))} placeholder="11790078…" className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs text-neutral-secondary">API Key iPaymu <span className="text-neutral-400">(rahasia — tidak dikirim ke storefront)</span>
            <input value={gateway.api_key} onChange={(e) => setData((d) => ({ ...d, gateway: { ...d.gateway, api_key: e.target.value } }))} placeholder="APIKEY-…" type="password" className={`${inputClass} mt-1`} />
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={saveGateway} disabled={gwStatus.type === 'saving'} className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50">
              {gwStatus.type === 'saving' ? 'Menyimpan…' : 'Simpan Gateway'}
            </button>
            <SaveStatus status={gwStatus} />
          </div>
          <p className="text-xs text-neutral-400">Callback URL untuk dashboard iPaymu → Integration → Setting: <code className="bg-gray-50 px-1 rounded">/api/payment/webhook</code></p>
        </div>
      </SettingsSection>
    </SettingsPageLayout>
  );
}
