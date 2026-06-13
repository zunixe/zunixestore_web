import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';

export default function DomainPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const [customDomain, setCustomDomain] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!currentStore) return;
    try {
      const res = await api.get(`/stores/${currentStore.id}/settings`);
      setCustomDomain(res.data?.custom_domain || '');
      setMetaTitle(res.data?.meta_title || '');
      setMetaDesc(res.data?.meta_description || '');
    } catch {}
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/stores/${currentStore.id}/settings`, {
        custom_domain: customDomain,
        meta_title: metaTitle,
        meta_description: metaDesc,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  return (
    <SettingsPageLayout title="Domain & SEO" desc="Atur URL & SEO toko kamu.">
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Domain Kustom</h4>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-3">Hubungkan domain kustom untuk toko kamu (contoh: tokokamu.com).</p>
              <div className="flex gap-2">
                <input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="namatoko.com" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Menyimpan...' : 'Hubungkan'}
                </button>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">SEO Toko</h4>
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Meta Title</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="ZunixeStore - Toko Online Terpercaya" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Meta Description</label>
                <textarea rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="Deskripsi singkat tentang toko kamu untuk hasil pencarian." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan SEO'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </SettingsPageLayout>
  );
}
