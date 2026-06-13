import { useState } from 'react';

export default function ProductPreferencesPage() {
  const [prefs, setPrefs] = useState({
    auto_publish: true,
    sku_prefix: '',
    default_stock: '0',
    low_stock_threshold: '10',
    show_out_of_stock: true,
    enable_reviews: true,
  });

  const handleToggle = (key) => () => setPrefs({ ...prefs, [key]: !prefs[key] });
  const handleChange = (key) => (e) => setPrefs({ ...prefs, [key]: e.target.value });

  const toggleClass = (val) =>
    `relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-blue-600' : 'bg-gray-300'}`;

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan Produk</h2>
      <div className="space-y-4 max-w-[600px]">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Publikasi Otomatis</p>
              <p className="text-xs text-gray-500">Produk baru otomatis terpublikasi</p>
            </div>
            <button onClick={handleToggle('auto_publish')} className={toggleClass(prefs.auto_publish)}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.auto_publish ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div>
            <label className={labelClass}>Prefix SKU</label>
            <input value={prefs.sku_prefix} onChange={handleChange('sku_prefix')} className={inputClass} placeholder="Contoh: ZNX-" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Stok Default</label>
              <input type="number" value={prefs.default_stock} onChange={handleChange('default_stock')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Batas Stok Rendah</label>
              <input type="number" value={prefs.low_stock_threshold} onChange={handleChange('low_stock_threshold')} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Tampilkan Produk Habis</p>
              <p className="text-xs text-gray-500">Produk dengan stok 0 tetap terlihat di toko</p>
            </div>
            <button onClick={handleToggle('show_out_of_stock')} className={toggleClass(prefs.show_out_of_stock)}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.show_out_of_stock ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Ulasan Produk</p>
              <p className="text-xs text-gray-500">Izinkan pembeli memberi ulasan</p>
            </div>
            <button onClick={handleToggle('enable_reviews')} className={toggleClass(prefs.enable_reviews)}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.enable_reviews ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Simpan</button>
        </div>
      </div>
    </div>
  );
}
