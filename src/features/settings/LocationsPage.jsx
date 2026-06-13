import SettingsPageLayout from './SettingsPageLayout';

export default function LocationsPage() {
  return (
    <SettingsPageLayout title="Lokasi" desc="Kelola lokasi gudang kamu untuk kemudahan distribusi produk.">
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
        </svg>
        <p className="text-sm text-gray-500">Belum ada lokasi gudang.</p>
        <p className="text-xs text-gray-400 mt-1">Tambahkan lokasi untuk memudahkan pengaturan ongkos kirim.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          + Tambah Lokasi
        </button>
      </div>
    </SettingsPageLayout>
  );
}
