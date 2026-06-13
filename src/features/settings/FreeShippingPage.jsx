import SettingsPageLayout from './SettingsPageLayout';

export default function FreeShippingPage() {
  return (
    <SettingsPageLayout title="Paket Gratis Ongkir" desc="Tingkatkan penjualan Anda melalui Paket Pengiriman Gratis.">
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2h-2V5H5v6h2v2H4a1 1 0 01-1-1V4zm11 6a1 1 0 011-1h2a1 1 0 011 1v2h-2v-1h-2v-1zm-1 3a1 1 0 011-1h1v1a1 1 0 01-1 1h-1v-1zm-6 0h6v2H7v-2z" />
        </svg>
        <p className="text-sm text-gray-500">Belum ada paket gratis ongkir.</p>
        <p className="text-xs text-gray-400 mt-1">Buat promo gratis ongkir untuk menarik lebih banyak pembeli.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          + Buat Paket
        </button>
      </div>
    </SettingsPageLayout>
  );
}
