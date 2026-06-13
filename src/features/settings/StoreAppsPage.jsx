import SettingsPageLayout from './SettingsPageLayout';

export default function StoreAppsPage() {
  return (
    <SettingsPageLayout title="Aplikasi Toko Saya" desc="Bagi aplikasi toko kamu & kirim update terbaru ke customer.">
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 4a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm4.5 0a1 1 0 011-1H9a1 1 0 011 1v1.5a1 1 0 01-1 1H7.5a1 1 0 01-1-1V4zm4.75 0a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75zM2 8.5a1 1 0 011-1h1.5a1 1 0 011 1V10a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5zm4.5 0a1 1 0 011-1H9a1 1 0 011 1V10a1 1 0 01-1 1H7.5a1 1 0 01-1-1V8.5zm4.75-.5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0011.25 8z" />
        </svg>
        <p className="text-sm text-gray-500">Bagikan aplikasi toko kamu ke customer.</p>
        <p className="text-xs text-gray-400 mt-1">Customer bisa mengakses toko kamu langsung dari layar beranda mereka.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Bagikan Aplikasi
        </button>
      </div>
    </SettingsPageLayout>
  );
}
