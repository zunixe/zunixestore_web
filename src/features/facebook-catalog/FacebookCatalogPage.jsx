export default function FacebookCatalogPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Katalog Facebook</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <svg className="w-12 h-12 text-blue-500 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        <p className="text-sm text-gray-500 mb-4">Integrasi Katalog Facebook.</p>
        <p className="text-xs text-gray-400 mb-6">Tampilkan produk kamu di Facebook & Instagram Shopping.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Hubungkan</button>
      </div>
    </div>
  );
}
