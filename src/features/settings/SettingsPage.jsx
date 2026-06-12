import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from './settingsSlice';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { data, isLoading } = useSelector((s) => s.settings);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (currentStore) dispatch(fetchSettings(currentStore.id));
  }, [dispatch, currentStore]);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const handleSave = () => {
    dispatch(updateSettings({ storeId: currentStore.id, settings: form }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi Toko</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Nama Toko</label>
            <input value={form.store_name || currentStore?.name || ''} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Domain</label>
            <input value={form.domain || currentStore?.domain || ''} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Email</label>
            <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Telepon</label>
            <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Simpan Perubahan</button>
          <button onClick={() => setForm(data || {})} className="px-6 py-2 border border-gray-300 rounded-lg text-sm">Reset</button>
        </div>
      </div>
    </div>
  );
}
