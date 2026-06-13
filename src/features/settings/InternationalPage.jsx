import SettingsPageLayout from './SettingsPageLayout';

export default function InternationalPage() {
  return (
    <SettingsPageLayout title="Penjualan Internasional" desc="Atur pengiriman internasional ke berbagai negara pilihan.">
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <p className="text-sm text-gray-500">Fitur penjualan internasional belum aktif.</p>
        <p className="text-xs text-gray-400 mt-1">Atur pengiriman ke berbagai negara untuk menjangkau lebih banyak customer.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Aktifkan
        </button>
      </div>
    </SettingsPageLayout>
  );
}
