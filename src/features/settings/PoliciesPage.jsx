import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';

const POLICIES = [
  { key: 'privacy_policy', title: 'Kebijakan Privasi', desc: 'Bagaimana data customer dikumpulkan, digunakan, dan dilindungi.' },
  { key: 'terms_conditions', title: 'Syarat & Ketentuan', desc: 'Aturan dan ketentuan yang mengatur penggunaan toko kamu.' },
  { key: 'return_policy', title: 'Kebijakan Pengembalian', desc: 'Ketentuan pengembalian barang dan refund.' },
  { key: 'shipping_policy', title: 'Kebijakan Pengiriman', desc: 'Ketentuan pengiriman dan estimasi waktu.' },
];

export default function PoliciesPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const [active, setActive] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!currentStore) return;
    try {
      const res = await api.get(`/stores/${currentStore.id}/settings`);
      setContent({
        privacy_policy: res.data?.privacy_policy || '',
        terms_conditions: res.data?.terms_conditions || '',
        return_policy: res.data?.return_policy || '',
        shipping_policy: res.data?.shipping_policy || '',
      });
    } catch {}
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/stores/${currentStore.id}/settings`, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleContentChange = (key) => (e) => {
    setContent({ ...content, [key]: e.target.value });
  };

  return (
    <SettingsPageLayout title="Kebijakan Toko" desc="Atur kebijakan toko kamu.">
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="w-64 shrink-0 space-y-1">
            {POLICIES.map((p) => (
              <button key={p.key} onClick={() => setActive(p.key)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${active === p.key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5">
            {active ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">{POLICIES.find((p) => p.key === active)?.title}</h4>
                <textarea value={content[active] || ''} onChange={handleContentChange(active)} rows={12} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none" placeholder="Tulis kebijakan di sini..." />
                <div className="flex justify-end mt-3">
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12h2v2H9v-2zm1-4a5.002 5.002 0 014.905 4H15a1 1 0 010 2h-1.095A5.002 5.002 0 015 10a5 5 0 015-5zm0 8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <p className="text-sm text-gray-400">Pilih kebijakan untuk mengedit konten</p>
              </div>
            )}
          </div>
        </div>
      )}
    </SettingsPageLayout>
  );
}
