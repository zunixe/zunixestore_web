import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from './customersSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomersPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, isLoading } = useSelector((s) => s.customers);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (currentStore) dispatch(fetchCustomers({ storeId: currentStore.id, params: { page, limit: 10 } }));
  }, [dispatch, currentStore, page]);

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Daftar Pembeli</h3>
          <span className="text-sm text-gray-500">Total: {total} pembeli</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                <th className="p-3 w-[18%]">Nama</th>
                <th className="p-3 w-[22%]">Email</th>
                <th className="p-3 w-[15%]">Telepon</th>
                <th className="p-3 w-[10%]">Pesanan</th>
                <th className="p-3 w-[15%]">Total Belanja</th>
                <th className="p-3 w-[15%]">Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada pembeli</td></tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium">{c.name}</td>
                    <td className="p-3 text-sm text-gray-500">{c.email || '-'}</td>
                    <td className="p-3 text-sm">{c.phone || '-'}</td>
                    <td className="p-3 text-sm">{c.total_orders}</td>
                    <td className="p-3 text-sm font-medium">{formatCurrency(c.total_spent)}</td>
                    <td className="p-3 text-sm text-gray-500">{formatDate(c.created_at)}</td>
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
