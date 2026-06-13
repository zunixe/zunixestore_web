import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

export default function WalletReportPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const [coins, setCoins] = useState({ coins: 0, points: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentStore) return;
    setLoading(true);
    api.get(`/stores/${currentStore.id}/coins`).then(res => {
      setCoins(res.data || { coins: 0, points: 0 });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentStore]);

  if (loading) return <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Memuat...</p></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">PlugoCoins & Poin</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-500 mb-1">PlugoCoins</p>
          <p className="text-3xl font-bold text-yellow-600">{coins.coins.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Dapatkan PlugoCoins dari setiap transaksi</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-500 mb-1">Poin</p>
          <p className="text-3xl font-bold text-blue-600">{coins.points.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Poin reward untuk customer setia</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Riwayat Transaksi</h3>
        <div className="text-center py-8">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
          </svg>
          <p className="text-sm text-gray-400">Belum ada transaksi</p>
        </div>
      </div>
    </div>
  );
}
