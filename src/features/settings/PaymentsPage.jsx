import { useState, useEffect, useCallback } from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

const PAYMENT_METHODS = [
  { key: 'transfer_bank', name: 'Transfer Bank', desc: 'BRI, BCA, Mandiri, BNI', icon: 'M4 2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v4h16V4H4zm0 6v6h16v-6H4z' },
  { key: 'ewallet', name: 'E-Wallet', desc: 'GoPay, OVO, Dana, LinkAja', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { key: 'cod', name: 'COD (Bayar di Tempat)', desc: 'Pembayaran tunai saat pengiriman', icon: 'M12 2l9 4.5v7.5c0 4.5-4 8-9 9-5-1-9-4.5-9-9V6.5L12 2z' },
];

export default function PaymentsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const [enabled, setEnabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!currentStore) return;
    try {
      const res = await api.get(`/stores/${currentStore.id}/settings`);
      setEnabled({
        transfer_bank: res.data?.payment_transfer_bank === 'true',
        ewallet: res.data?.payment_ewallet === 'true',
        cod: res.data?.payment_cod === 'true',
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
      for (const k of Object.keys(next)) body[`payment_${k}`] = String(next[k]);
      await api.put(`/stores/${currentStore.id}/settings`, body);
    } catch {}
    setSaving(false);
  };

  return (
    <SettingsPageLayout title="Metode Pembayaran" desc="Tentukan metode pembayaran yang dapat dipilih customer.">
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <div key={method.key} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d={method.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{method.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={!!enabled[method.key]} onChange={() => toggle(method.key)} disabled={saving} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      )}
    </SettingsPageLayout>
  );
}
