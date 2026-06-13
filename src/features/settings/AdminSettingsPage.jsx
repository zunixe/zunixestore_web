import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const NOTIF_ITEMS = [
  { key: 'pending_order', label: 'Menunggu Order' },
  { key: 'new_order', label: 'Order Baru' },
  { key: 'order_cancelled', label: 'Order Dibatalkan oleh Customer' },
  { key: 'payment_received', label: 'Order Bukti Bayar Diterima' },
  { key: 'payment_confirmed', label: 'Pembayaran Order yang Dikonfirmasi EPAY' },
  { key: 'low_stock', label: 'Stok Menipis' },
  { key: 'customer_question', label: 'Pertanyaan Customer' },
  { key: 'customer_chat', label: 'Chat dari Customer' },
];

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res.json();
};

export default function AdminSettingsPage() {
  const [language, setLanguage] = useState('id');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiCall('/notifications').then((json) => {
      if (json.status === 'success' && json.data) {
        setLanguage(json.data.language || 'id');
        setPushEnabled(!!json.data.push_enabled);
        setNotifPrefs(json.data.notif_prefs || {});
      }
    });
  }, []);

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await apiCall('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ language, push_enabled: pushEnabled, notif_prefs: notifPrefs }),
    });
    setSaving(false);
  };

  const languages = [
    { value: 'id', label: 'Bahasa', flag: '🇮🇩' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Bahasa & Notifikasi Saya</h2>

      {/* Language Section */}
      <div className="flex items-start gap-6 mb-5">
        <div className="w-[140px] flex-shrink-0 pt-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">PlugoStore Bahasa Admin</h3>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">PlugoStore Bahasa Admin</h4>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none pr-8"
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 01.708 0L8 10.293l5.646-5.647a.5.5 0 01.708.708l-6 6a.5.5 0 01-.708 0l-6-6a.5.5 0 010-.708z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="flex items-start gap-6">
        <div className="w-[140px] flex-shrink-0 pt-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">Pemberitahuan Email & Notifikasi di Aplikasi untuk Kamu</h3>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Push Toggle */}
            <div className="flex items-start justify-between p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Aktifkan Push Notifikasi</p>
                  <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">Push notification memungkinkan Anda mengirimkan pembaruan dan informasi penting secara instan</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                <input type="checkbox" checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Notification Items */}
            {NOTIF_ITEMS.map((item, index) => (
              <div key={item.key}>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={!!notifPrefs[item.key]}
                      onChange={() => toggleNotif(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                {index < NOTIF_ITEMS.length - 1 && <div className="h-px bg-gray-100" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
