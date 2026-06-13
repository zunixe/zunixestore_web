export default function GoogleMerchantPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Google Merchant Center</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 5.34 1.89 5.34 1.89l2.09-2.09S16.57 1.73 12.2 1.73C6.15 1.73 1.73 6.15 1.73 12s4.42 10.27 10.47 10.27c5.73 0 9.11-4.42 9.11-9.45.01-1.09-.14-1.72-.46-1.72z"/></svg>
        <p className="text-sm text-gray-500 mb-4">Integrasi Google Merchant Center.</p>
        <p className="text-xs text-gray-400 mb-6">Tampilkan produk kamu di Google Shopping dan jangkau lebih banyak pembeli.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Hubungkan</button>
      </div>
    </div>
  );
}
