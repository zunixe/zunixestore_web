export default function FeaturedProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Produk Unggulan</h2>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg className="w-12 h-12 text-yellow-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <p className="text-gray-500 text-sm mb-4">Belum ada produk unggulan</p>
        <p className="text-gray-400 text-xs mb-6">Pilih produk terbaik untuk ditampilkan di halaman utama toko.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Tambah Unggulan</button>
      </div>
    </div>
  );
}
