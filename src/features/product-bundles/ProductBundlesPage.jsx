export default function ProductBundlesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Produk Bundle</h2>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"/>
        </svg>
        <p className="text-gray-500 text-sm mb-4">Belum ada produk bundle</p>
        <p className="text-gray-400 text-xs mb-6">Gabungkan beberapa produk menjadi satu paket dengan harga khusus.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Buat Bundle</button>
      </div>
    </div>
  );
}
