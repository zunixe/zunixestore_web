import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDiscounts, createDiscount, deleteDiscount } from './discountsSlice';
import { formatCurrency } from '../../utils/formatters';

export default function DiscountsPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, isLoading } = useSelector((s) => s.discounts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'percentage', value: '', code: '', min_purchase: '', start_date: '', end_date: '' });

  useEffect(() => { if (currentStore) dispatch(fetchDiscounts(currentStore.id)); }, [dispatch, currentStore]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createDiscount({ storeId: currentStore.id, data: form }));
    setShowForm(false);
    setForm({ type: 'percentage', value: '', code: '', min_purchase: '', start_date: '', end_date: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Diskon & Promosi</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">+ Tambah Diskon</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Kode</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="SUMMER2026" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Tipe</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="percentage">Persentase (%)</option>
                <option value="fixed_amount">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Nilai</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Min. Pembelian</label>
              <input type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Tanggal Mulai</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Tanggal Selesai</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-sm">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {isLoading ? <p className="text-gray-400 col-span-2 text-center py-8">Memuat...</p> :
          items.length === 0 ? <p className="text-gray-400 col-span-2 text-center py-8">Belum ada diskon</p> :
          items.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{d.code || `Diskon ${d.value}${d.type === 'percentage' ? '%' : ''}`}</p>
                  <p className="text-xs text-gray-500">{d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)} off</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                <button onClick={() => dispatch(deleteDiscount({ storeId: currentStore.id, discountId: d.id }))} className="text-xs text-red-500 hover:underline">Hapus</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
