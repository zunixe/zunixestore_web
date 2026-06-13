import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, updateProduct } from './productsSlice';

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', price: '', retail_price: '', cost_price: '',
    stock: '0', weight: '500', length: '', width: '', height: '',
    description: '', short_desc: '', category: '', status: 'published',
    availability: 'stock', out_of_stock: 'sold_out',
    min_order: '', max_order: '', bundle_qty: '',
    shipping_time: '24', shipping_unit: 'hours',
    custom_label: 'Stok Tersedia', digital_product: false,
  });

  useEffect(() => {
    if (!currentStore || !id) return;
    setLoading(true);
    dispatch(fetchProductById({ storeId: currentStore.id, productId: id }))
      .unwrap()
      .then((p) => {
        let extra = {};
        try { extra = JSON.parse(p.description || '{}'); } catch {}
        setForm({
          name: p.name || '',
          sku: p.sku || '',
          price: String(p.price ?? ''),
          stock: String(p.stock ?? '0'),
          status: p.status || 'published',
          category: p.category || '',
          description: extra.text || '',
          short_desc: extra.short_desc || '',
          barcode: extra.barcode || '',
          retail_price: extra.retail_price ? String(extra.retail_price) : '',
          cost_price: extra.cost_price ? String(extra.cost_price) : '',
          weight: String(extra.weight ?? '500'),
          length: extra.dimensions?.length ? String(extra.dimensions.length) : '',
          width: extra.dimensions?.width ? String(extra.dimensions.width) : '',
          height: extra.dimensions?.height ? String(extra.dimensions.height) : '',
          min_order: extra.min_order ? String(extra.min_order) : '',
          max_order: extra.max_order ? String(extra.max_order) : '',
          bundle_qty: extra.bundle_qty ? String(extra.bundle_qty) : '',
          shipping_time: String(extra.shipping_time ?? '24'),
          shipping_unit: extra.shipping_unit || 'hours',
          custom_label: extra.custom_label || 'Stok Tersedia',
          availability: extra.availability || 'stock',
          out_of_stock: extra.out_of_stock || 'sold_out',
          digital_product: extra.digital_product || false,
        });
        setLoading(false);
      })
      .catch(() => { setLoading(false); navigate('/products'); });
  }, [currentStore, id]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentStore) return;
    setSaving(true);
    await dispatch(updateProduct({
      storeId: currentStore.id,
      productId: id,
      data: {
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.status,
        category: form.category,
        description: JSON.stringify({
          text: form.description,
          short_desc: form.short_desc,
          barcode: form.barcode,
          retail_price: form.retail_price ? Number(form.retail_price) : null,
          cost_price: form.cost_price ? Number(form.cost_price) : null,
          weight: Number(form.weight),
          dimensions: form.length ? { length: Number(form.length), width: Number(form.width), height: Number(form.height) } : null,
          min_order: form.min_order ? Number(form.min_order) : null,
          max_order: form.max_order ? Number(form.max_order) : null,
          bundle_qty: form.bundle_qty ? Number(form.bundle_qty) : null,
          shipping_time: Number(form.shipping_time),
          shipping_unit: form.shipping_unit,
          custom_label: form.custom_label,
          availability: form.availability,
          out_of_stock: form.out_of_stock,
          digital_product: form.digital_product,
        }),
      },
    }));
    setSaving(false);
    navigate('/products');
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';
  const sectionTitle = 'text-sm font-semibold text-gray-900 mb-3';

  if (loading) {
    return <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Memuat...</p></div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit Produk</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">Batal</button>
          <button type="submit" disabled={saving || !form.name || !form.price} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className={sectionTitle}>Informasi Produk</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nama Produk *</label>
                <input required value={form.name} onChange={handleChange('name')} placeholder="(maks. 255 karakter)" maxLength={255} className={inputClass} />
                <span className="text-xs text-gray-400 mt-0.5 block text-right">{form.name.length} / 255</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kode</label>
                  <input value={form.sku} onChange={handleChange('sku')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Barcode</label>
                  <input value={form.barcode} onChange={handleChange('barcode')} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deskripsi Singkat</label>
                <input value={form.short_desc} onChange={handleChange('short_desc')} maxLength={120} className={inputClass} placeholder="Deskripsi singkat produk" />
                <span className="text-xs text-gray-400 mt-0.5 block text-right">{form.short_desc.length} / 120</span>
              </div>
              <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea value={form.description} onChange={handleChange('description')} rows={4} className={`${inputClass} resize-none`} placeholder="Deskripsi lengkap produk..." />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className={sectionTitle}>Detail Produk</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.digital_product} onChange={handleChange('digital_product')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label className="text-sm text-gray-700">Produk Digital</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Harga *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                    <input required type="number" value={form.price} onChange={handleChange('price')} placeholder="0" className={`${inputClass} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Harga eceran</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                    <input type="number" value={form.retail_price} onChange={handleChange('retail_price')} className={`${inputClass} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Harga pokok</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                    <input type="number" value={form.cost_price} onChange={handleChange('cost_price')} className={`${inputClass} pl-8`} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Berat (gram) *</label>
                <input type="number" value={form.weight} onChange={handleChange('weight')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Dimensi (cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={form.length} onChange={handleChange('length')} placeholder="Panjang" className={inputClass} />
                  <input type="number" value={form.width} onChange={handleChange('width')} placeholder="Lebar" className={inputClass} />
                  <input type="number" value={form.height} onChange={handleChange('height')} placeholder="Tinggi" className={inputClass} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Dimensi diperlukan jika kamu ingin menggunakan metode pengiriman instan.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Minimal Per Order</label>
                  <input type="number" value={form.min_order} onChange={handleChange('min_order')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Maksimal Per Order</label>
                  <input type="number" value={form.max_order} onChange={handleChange('max_order')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Jumlah Bundle</label>
                  <input type="number" value={form.bundle_qty} onChange={handleChange('bundle_qty')} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className={sectionTitle}>Varian</h3>
            <p className="text-xs text-gray-500 mb-3">Tambahkan varian jika produk ini memiliki beberapa versi berbeda, seperti ukuran atau warna.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              <p className="text-sm text-gray-400">Belum ada varian</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className={sectionTitle}>Media *</h3>
            <p className="text-xs text-gray-400 mb-3">Images (0/20) • Video (0/1) • Youtube URL (0/1)</p>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
              <p className="text-sm text-gray-400 mt-2">Upload Gambar</p>
              <p className="text-xs text-gray-300 mt-1">Klik untuk menambahkan gambar produk</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className={sectionTitle}>Manajemen Produk</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Ketersediaan Produk</label>
                  <select value={form.availability} onChange={handleChange('availability')} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="stock">Gunakan Stok</option>
                    <option value="always">Selalu Tersedia</option>
                    <option value="preorder">Pre-order</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Jumlah Stok</label>
                  <input type="number" value={form.stock} onChange={handleChange('stock')} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Label Custom</label>
                <input value={form.custom_label} onChange={handleChange('custom_label')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Estimasi pengiriman</label>
                <div className="flex gap-2 items-center">
                  <input type="number" value={form.shipping_time} onChange={handleChange('shipping_time')} className={`${inputClass} w-20`} />
                  <select value={form.shipping_unit} onChange={handleChange('shipping_unit')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="hours">Jam</option>
                    <option value="days">Hari</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Ketika tidak ada stok</label>
                <select value={form.out_of_stock} onChange={handleChange('out_of_stock')} className={`${inputClass} bg-white`}>
                  <option value="sold_out">Habis Terjual</option>
                  <option value="backorder">Terima Pesanan</option>
                  <option value="hidden">Sembunyikan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className={sectionTitle}>Status</h3>
            <select value={form.status} onChange={handleChange('status')} className={`${inputClass} bg-white`}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
