import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../products/productsSlice';
import { formatCurrency } from '../../utils/formatters';

export default function InventoryPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, isLoading } = useSelector((s) => s.products);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentStore) dispatch(fetchProducts({ storeId: currentStore.id, params: { limit: 100 } }));
  }, [dispatch, currentStore]);

  const filtered = items.filter((p) => {
    if (filter === 'out') return Number(p.stock) === 0;
    if (filter === 'low') return Number(p.stock) > 0 && Number(p.stock) <= 10;
    if (filter === 'preorder') return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Stok</h2>
      </div>
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Semua', count: items.length },
          { key: 'out', label: 'Habis', count: items.filter((p) => Number(p.stock) === 0).length },
          { key: 'low', label: 'Hampir Habis', count: items.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              filter === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">
              <th className="p-3">Produk</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Nilai Stok</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Belum ada produk</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3"><span className="font-medium text-sm">{p.name}</span></td>
                  <td className="p-3 text-sm text-gray-500">{p.sku || '-'}</td>
                  <td className="p-3">
                    <span className={`text-sm font-medium ${
                      Number(p.stock) === 0 ? 'text-red-600' : Number(p.stock) <= 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{formatCurrency(Number(p.price) * Number(p.stock))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
