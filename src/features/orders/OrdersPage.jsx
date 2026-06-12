import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from './ordersSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, isLoading } = useSelector((s) => s.orders);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '', page: 1, limit: 10 });

  useEffect(() => {
    if (currentStore) dispatch(fetchOrders({ storeId: currentStore.id, params: filters }));
  }, [dispatch, currentStore, filters]);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ storeId: currentStore.id, orderId, status }));
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm mb-4">
        <div className="p-4">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Dari Tanggal</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Sampai Tanggal</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                <option value="">Semua Status</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <button onClick={() => setFilters({ ...filters, page: 1 })} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Filter</button>
            <button onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '', page: 1, limit: 10 })} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm">Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Daftar Pesanan</h3>
          <span className="text-sm text-gray-500">Total: {total} pesanan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                <th className="p-3 w-[14%]">Order ID</th>
                <th className="p-3 w-[16%]">Pelanggan</th>
                <th className="p-3 w-[22%]">Produk</th>
                <th className="p-3 w-[12%]">Total</th>
                <th className="p-3 w-[18%]">Status</th>
                <th className="p-3 w-[18%]">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada pesanan</td></tr>
              ) : (
                items.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-blue-600">{order.order_code}</td>
                    <td className="p-3 text-sm text-gray-700">{order.customer_name}</td>
                    <td className="p-3 text-sm text-gray-700">-</td>
                    <td className="p-3 text-sm font-medium">{formatCurrency(order.total)}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Menampilkan {items.length} dari {total}</span>
          <div className="flex gap-1">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50">Sebelumnya</button>
            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50" disabled={items.length < filters.limit}>Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
