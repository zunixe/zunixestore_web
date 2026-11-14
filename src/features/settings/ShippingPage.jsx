import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Truck } from 'lucide-react';
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
];

export default function ShippingPage() {
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
        COURIERS.forEach((c) => { enabled[c.key] = res.data?.[`shipping_${c.key}`] === 'true'; });
        setData({ storeId, enabled });
      })
      .catch(() => { if (!cancelled) setData({ storeId, enabled: {} }); });
    return () => { cancelled = true; };
  }, [storeId]);

  const loading = !!storeId && data.storeId !== storeId;
  const { enabled } = data;
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
      await api.put(`/stores/${storeId}/settings`, body);
      setStatus({ type: 'saved', message: 'Perubahan tersimpan' });
    } catch (err) {
      setData((d) => ({ ...d, enabled: prev }));
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

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
    </SettingsPageLayout>
  );
}
