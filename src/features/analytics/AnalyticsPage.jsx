import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchRevenue } from './analyticsSlice';
import { formatCurrency } from '../../utils/formatters';

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { data, revenue, isLoading } = useSelector((s) => s.analytics);

  useEffect(() => {
    if (currentStore) {
      dispatch(fetchAnalytics(currentStore.id));
      dispatch(fetchRevenue(currentStore.id));
    }
  }, [dispatch, currentStore]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pengunjung', value: data?.visitors || 0, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Total Pesanan', value: data?.orders || 0, bg: 'bg-green-50', color: 'text-green-600' },
          { label: 'Conversion Rate', value: `${data?.conversion_rate || 0}%`, bg: 'bg-yellow-50', color: 'text-yellow-600' },
          { label: 'Revenue', value: data?.revenue ? formatCurrency(data.revenue) : 'Rp 0', bg: 'bg-purple-50', color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stat.value}</p>
            <p className="text-xs text-green-600 mt-1">+12% dari bulan lalu</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Kunjungan Website</h3>
          <div className="h-[200px] bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">Grafik Kunjungan</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pendapatan</h3>
          <div className="h-[200px] bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">Grafik Pendapatan</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Pesanan Terbaru</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-400 text-center py-6">Belum ada data pesanan</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Produk Terlaris</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
