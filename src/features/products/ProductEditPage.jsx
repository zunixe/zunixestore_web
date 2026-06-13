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
  const [tab, setTab] = useState('toko');
  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', price: '', retail_price: '', cost_price: '',
    stock: '0', weight: '500', length: '', width: '', height: '',
    description: '', short_desc: '', category: '', status: 'published',
    availability: 'stock', out_of_stock: 'sold_out',
    min_order: '', max_order: '', bundle_qty: '',
    shipping_time: '24', shipping_unit: 'hours',
    custom_label: 'Stok Tersedia', digital_product: false,
    interest_count: 0, audience: 'all',
    schedule_display: false, schedule_launch: false,
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
          interest_count: extra.interest_count || 0,
          audience: extra.audience || 'all',
          schedule_display: extra.schedule_display || false,
          schedule_launch: extra.schedule_launch || false,
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
          interest_count: form.interest_count,
          audience: form.audience,
          schedule_display: form.schedule_display,
          schedule_launch: form.schedule_launch,
        }),
      },
    }));
    setSaving(false);
    navigate('/products');
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  if (loading) {
    return <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Memuat...</p></div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Edit Produk</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">Batal</button>
          <button type="submit" disabled={saving || !form.name || !form.price} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6">
        <button type="button" onClick={() => setTab('toko')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'toko' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Toko</button>
        <button type="button" onClick={() => setTab('umum')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'umum' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Umum</button>
      </div>

      <div className="max-w-[800px] space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Media *</h3>
              <p className="text-xs text-gray-400 mt-0.5">Images (0/20) • Video (0/1) • Youtube URL (0/1)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
              <span className="text-sm text-gray-700">Gambar</span>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              <span className="text-sm text-gray-700">Video</span>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" /></svg>
              <span className="text-sm text-gray-700">Youtube</span>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi Produk</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nama Produk *</label>
              <input required value={form.name} onChange={handleChange('name')} placeholder="(maks. 255 karakter)" maxLength={255} className={inputClass} />
              <span className="text-xs text-gray-400 mt-0.5 block text-right">{form.name.length} / 255</span>
            </div>
            <div>
              <label className={labelClass}>Kode</label>
              <div className="relative">
                <input value={form.sku} onChange={handleChange('sku')} className={inputClass} placeholder="Otomatis" />
                <button type="button" onClick={() => setForm({ ...form, sku: `SKU-${Date.now()}` })} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Barcode</label>
              <input value={form.barcode} onChange={handleChange('barcode')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Deskripsi Singkat</label>
              <input value={form.short_desc} onChange={handleChange('short_desc')} maxLength={120} className={inputClass} placeholder="Deskripsi singkat produk" />
              <span className="text-xs text-gray-400 mt-0.5 block text-right">{form.short_desc.length} / 120</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Deskripsi</label>
                <span className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">Edit HTML</span>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
                  <select className="text-xs border-0 bg-transparent outline-none px-1 py-0.5"><option>Default</option></select>
                  <select className="text-xs border-0 bg-transparent outline-none px-1 py-0.5"><option>Normal</option><option>Heading 1</option><option>Heading 2</option></select>
                  <span className="w-px h-4 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded"><svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded"><svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded"><svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg></button>
                  <span className="w-px h-4 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded"><svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg></button>
                  <span className="w-px h-4 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded"><svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg></button>
                </div>
                <textarea value={form.description} onChange={handleChange('description')} rows={5} className="w-full px-3 py-2 text-sm border-0 outline-none resize-none" placeholder="Tambahkan Deskripsi" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className={labelClass}>Produk yang diminati</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={form.interest_count} onChange={handleChange('interest_count')} className={`${inputClass} w-20`} />
                  <svg className="w-4 h-4 text-gray-400 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>
                </div>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Produk ditampilkan ke</label>
                <select value={form.audience} onChange={handleChange('audience')} className={`${inputClass} bg-white`}>
                  <option value="all">Semua Orang</option>
                  <option value="member">Member</option>
                  <option value="wholesale">Grosir</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.schedule_display} onChange={handleChange('schedule_display')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Tentukan tanggal ditampilkan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.schedule_launch} onChange={handleChange('schedule_launch')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Atur tanggal rilis</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Manajemen Produk</h3>
          <div className="space-y-4">
            <p className="text-xs text-blue-600">Kamu dapat mengelola stok produk kamu saat atur Ketersediaan Produk ke 'Gunakan Stok'.</p>
            <div>
              <label className={labelClass}>Ketersediaan Produk</label>
              <select value={form.availability} onChange={handleChange('availability')} className={`${inputClass} bg-white`}>
                <option value="stock">Gunakan Stok</option>
                <option value="always">Selalu Tersedia</option>
                <option value="preorder">Pre-order</option>
              </select>
            </div>
            {form.availability === 'stock' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Pengaturan Stok</label>
                  <span className="text-xs text-blue-600 cursor-pointer">Lihat riwayat inventaris</span>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                        <th className="px-3 py-2">Lokasi</th>
                        <th className="px-3 py-2">Jumlah Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="px-3 py-2 text-sm text-gray-700">{currentStore?.name || 'Toko'}</td>
                        <td className="px-3 py-2">
                          <input type="number" value={form.stock} onChange={handleChange('stock')} className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {form.availability === 'preorder' && (
              <div>
                <label className={labelClass}>Jumlah Pre-order</label>
                <input type="number" value={form.stock} onChange={handleChange('stock')} className={inputClass} />
              </div>
            )}
            <div>
              <label className={labelClass}>Label Custom</label>
              <input value={form.custom_label} onChange={handleChange('custom_label')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Setelah customer melakukan pembayaran, produk akan dikirim dalam:</label>
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
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Detail Produk</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.digital_product} onChange={handleChange('digital_product')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label className="text-sm text-gray-700">Produk Digital</label>
              <svg className="w-4 h-4 text-gray-400 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Harga pokok</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                <input type="number" value={form.cost_price} onChange={handleChange('cost_price')} placeholder="0" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Berat (gram) *</label>
              <input type="number" value={form.weight} onChange={handleChange('weight')} className={inputClass} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-1">
                <span className={labelClass}>Panjang (cm)</span>
                <span className={labelClass}>Lebar (cm)</span>
                <span className={labelClass}>Tinggi (cm)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={form.length} onChange={handleChange('length')} placeholder="Panjang" className={inputClass} />
                <input type="number" value={form.width} onChange={handleChange('width')} placeholder="Lebar" className={inputClass} />
                <input type="number" value={form.height} onChange={handleChange('height')} placeholder="Tinggi" className={inputClass} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Dimensi diperlukan jika kamu ingin menggunakan metode pengiriman instan.</p>
            </div>
            <div>
              <label className={labelClass}>Jumlah Minimal Per Order</label>
              <input type="number" value={form.min_order} onChange={handleChange('min_order')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Jumlah Maksimal Per Order</label>
              <input type="number" value={form.max_order} onChange={handleChange('max_order')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Jumlah Bundle</label>
              <input type="number" value={form.bundle_qty} onChange={handleChange('bundle_qty')} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">Cth. produk ini hanya bisa di-order dalam kelipatan 3 (1, 4, 7, dst.)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Varian</h3>
          <p className="text-xs text-gray-500 mb-3">Tambahkan varian jika produk ini memiliki beberapa versi berbeda, seperti ukuran atau warna.</p>
          <button type="button" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            Tambahkan
          </button>
        </div>

        <button type="button" className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700">
          Lihat pilihan lain
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
        </button>
      </div>
    </form>
  );
}
