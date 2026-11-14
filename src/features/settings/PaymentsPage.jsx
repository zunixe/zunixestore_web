import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Landmark, Wallet, HandCoins } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { SettingsSection, Toggle } from '../../components/ui';
import { SaveStatus } from '../product-preferences/ProductParts';

const PAYMENT_METHODS = [
  { key: 'transfer_bank', name: 'Transfer Bank', desc: 'BRI, BCA, Mandiri, BNI', icon: Landmark },
  { key: 'ewallet', name: 'E-Wallet', desc: 'GoPay, OVO, Dana, LinkAja', icon: Wallet },
  { key: 'cod', name: 'COD (Bayar di Tempat)', desc: 'Pembayaran tunai saat pengiriman', icon: HandCoins },
];

export default function PaymentsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [data, setData] = useState({ storeId: null, enabled: {} });
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        const enabled = {};
        PAYMENT_METHODS.forEach((m) => { enabled[m.key] = res.data?.[`payment_${m.key}`] === 'true'; });
        setData({ storeId, enabled });
      })
      .catch(() => { if (!cancelled) setData({ storeId, enabled: {} }); });
    return () => { cancelled = true; };
  }, [storeId]);

  const loading = !!storeId && data.storeId !== storeId;
  const { enabled } = data;

  const toggle = async (key) => {
    if (status.type === 'saving') return;
    const prev = enabled;
    const next = { ...enabled, [key]: !enabled[key] };
    setData((d) => ({ ...d, enabled: next }));
    setStatus({ type: 'saving', message: '' });
    try {
      const body = {};
      PAYMENT_METHODS.forEach((m) => { body[`payment_${m.key}`] = String(!!next[m.key]); });
      await api.put(`/stores/${storeId}/settings`, body);
      setStatus({ type: 'saved', message: 'Perubahan tersimpan' });
    } catch (err) {
      setData((d) => ({ ...d, enabled: prev }));
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  return (
    <SettingsPageLayout
      title="Metode Pembayaran"
      desc="Tentukan metode pembayaran yang dapat dipilih customer."
      actions={<SaveStatus status={status} />}
    >
      <SettingsSection title="Metode yang tersedia" description="Aktifkan metode pembayaran yang ingin kamu tawarkan saat checkout. Perubahan langsung tersimpan.">
        <div className="bg-white rounded-xl px-4 divide-y divide-divider">
          {loading ? (
            <div className="space-y-3 py-4" aria-busy="true">
              {PAYMENT_METHODS.map((m) => <div key={m.key} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : PAYMENT_METHODS.map(({ key, name, desc, icon: Icon }) => (
            <div key={key} className="flex items-start gap-3 py-4">
              <span className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <Toggle id={`pay-${key}`} label={name} description={desc} checked={!!enabled[key]} onChange={() => toggle(key)} />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>
    </SettingsPageLayout>
  );
}
