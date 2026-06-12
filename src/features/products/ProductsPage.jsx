import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from './productsSlice';
import { formatCurrency } from '../../utils/formatters';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, isLoading } = useSelector((s) => s.products);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (currentStore) dispatch(fetchProducts({ storeId: currentStore.id, params: { search, page, limit: 10 } }));
  }, [dispatch, currentStore, search, page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 h-9 w-80">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/></svg>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari berdasarkan nama atau SKU..." className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700" />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">+ Tambah Produk</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Daftar Produk</h3>
          <span className="text-sm text-gray-500">Total: {total} produk</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                <th className="p-3 w-[30%]">Nama Produk</th>
                <th className="p-3 w-[12%]">SKU</th>
                <th className="p-3 w-[12%]">Harga</th>
                <th className="p-3 w-[8%]">Stok</th>
                <th className="p-3 w-[12%]">Status</th>
                <th className="p-3 w-[10%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada produk</td></tr>
              ) : (
                items.map((prod) => (
                  <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">IMG</div>
                        <span className="font-medium text-sm">{prod.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{prod.sku || '-'}</td>
                    <td className="p-3 text-sm font-medium">{formatCurrency(prod.price)}</td>
                    <td className="p-3 text-sm">{prod.stock}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prod.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {prod.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50">Edit</button>
                      <button onClick={() => dispatch(deleteProduct({ storeId: currentStore.id, productId: prod.id }))} className="ml-1 px-3 py-1.5 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-50">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Menampilkan {items.length} dari {total}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50">Sebelumnya</button>
            <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50" disabled={items.length < 10}>Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
