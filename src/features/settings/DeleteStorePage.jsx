import { useState } from 'react';
import SettingsPageLayout from './SettingsPageLayout';

export default function DeleteStorePage() {
  const [confirmText, setConfirmText] = useState('');

  return (
    <SettingsPageLayout title="Hapus Toko" desc="Toko, produk, integrasi & langganan kamu akan terhapus.">
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Tindakan ini tidak dapat dibatalkan</p>
            <p className="text-xs text-red-500 mt-0.5">Semua data toko, produk, pesanan, dan pengaturan akan dihapus permanen.</p>
          </div>
        </div>

        <div className="h-px bg-red-50 mb-4" />

        <p className="text-xs text-gray-500 mb-2">
          Ketik <span className="font-semibold text-gray-700">HAPUS TOKO</span> untuk konfirmasi:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="HAPUS TOKO"
          className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400 mb-4"
        />
        <button
          disabled={confirmText !== 'HAPUS TOKO'}
          className="w-full px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
        >
          Hapus Toko Permanen
        </button>
      </div>
    </SettingsPageLayout>
  );
}
