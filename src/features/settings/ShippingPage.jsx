import { useState, useEffect, useCallback } from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

const COURIERS = [
  { key: 'jne', name: 'JNE', desc: 'Reguler, OKE, YES, Trucking', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { key: 'jnt', name: 'J&T', desc: 'Reguler, Economy, Express', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { key: 'sicepat', name: 'SiCepat', desc: 'REG, BEST, HALU', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { key: 'anteraja', name: 'AnterAja', desc: 'Same Day, Reguler', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { key: 'gosend', name: 'GoSend', desc: 'Instant, Same Day', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
];

export default function ShippingPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const [enabled, setEnabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!currentStore) return;
    try {
      const res = await api.get(`/stores/${currentStore.id}/settings`);
      setEnabled({
        jne: res.data?.shipping_jne === 'true',
        jnt: res.data?.shipping_jnt === 'true',
        sicepat: res.data?.shipping_sicepat === 'true',
        anteraja: res.data?.shipping_anteraja === 'true',
        gosend: res.data?.shipping_gosend === 'true',
      });
    } catch {}
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (key) => {
    const next = { ...enabled, [key]: !enabled[key] };
    setEnabled(next);
    setSaving(true);
    try {
      const body = {};
      for (const k of Object.keys(next)) body[`shipping_${k}`] = String(next[k]);
      await api.put(`/stores/${currentStore.id}/settings`, body);
    } catch {}
    setSaving(false);
  };

  return (
    <SettingsPageLayout title="Metode Pengiriman" desc="Tentukan metode pengiriman yang dapat dipilih customer.">
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {COURIERS.map((courier) => (
            <div key={courier.key} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d={courier.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{courier.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{courier.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={!!enabled[courier.key]} onChange={() => toggle(courier.key)} disabled={saving} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      )}
    </SettingsPageLayout>
  );
}
