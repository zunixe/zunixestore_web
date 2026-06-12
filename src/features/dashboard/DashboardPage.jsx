import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboard } from './dashboardSlice';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { user } = useSelector((s) => s.auth);
  const { data, isLoading } = useSelector((s) => s.dashboard);

  useEffect(() => {
    if (currentStore) dispatch(fetchDashboard(currentStore.id));
  }, [dispatch, currentStore]);

  if (!currentStore) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold text-gray-500 mb-2">Belum ada toko</h3>
        <Link to="/stores/new" className="text-blue-600 font-medium">+ Tambah Toko</Link>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Halo, {user?.full_name || 'User'}!</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
            Hari Ini
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pengunjung Website', value: data?.visitors || 0 },
            { label: 'Total Pesanan', value: data?.orders || 0 },
            { label: 'Total Dibayar', value: data?.revenue ? formatCurrency(data.revenue) : 'Rp 0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Status Pesanan</h4>
            <Link to="/orders" className="text-xs text-blue-600">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['Siap Dikirim', 'Terkirim'].map((status) => (
              <Link key={status} to="/orders" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                <p className="text-sm text-gray-500">{status}</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Coba Ads dan tinjau ads</h4>
          </div>
          <p className="text-sm text-gray-500 mb-3">Periksa iklan yang sedang berjalan dan dapatkan rekomendasi untuk meningkatkan penargetan, anggaran, dan engagement.</p>
          <a href="#" className="text-blue-600 text-sm font-medium">Lanjutkan ke Ads &rarr;</a>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Zunixe Apps</h4>
          <p className="text-xs text-gray-500 mb-3">Rekomendasi untuk Anda berdasarkan aktivitas toko Anda</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { title: 'Zunixe for WhatsApp', desc: 'Kelola penjualan langsung di WhatsApp Web.' },
              { title: 'ZunixePOS', desc: 'Jalankan toko offline terhubung ke webstore.' },
              { title: 'Formulir', desc: 'Buat dan kelola forms kustom.' },
            ].map((app) => (
              <div key={app.title} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="w-6 h-6 rounded bg-gray-100 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">{app.title}</h5>
                  <p className="text-xs text-gray-500">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Akses Cepat</h4>
            <div className="flex flex-wrap gap-1">
              {['Home', 'WhatsApp Landing', 'Konten Multi Bahasa'].map((link) => (
                <a key={link} href="#" className="px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100">{link}</a>
              ))}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{currentStore?.domain || 'zunixe.com'}</span>
              <span className="text-xs text-blue-600 cursor-pointer">Ubah</span>
            </div>
            <div className="h-[80px] bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 mb-2">Pratinjau Toko</div>
            <div className="flex items-center justify-center gap-1 py-2 border-t border-gray-100 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z"/></svg>
              Edit Desain Toko
            </div>
          </div>
        </div>
      </div>

      <div className="w-[295px] flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">Pengumuman</h4>
            <Link to="/notifications" className="text-xs text-blue-600">Lihat Semua</Link>
          </div>
          {['Informasi Dampak Update Sistem', 'Informasi Pengembangan Jaringan Server', 'Penerapan Biaya Transaksi Baru'].map((ann, i) => (
            <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer">
              <p className="text-sm text-gray-700 mb-1">{ann}</p>
              <p className="text-xs text-gray-400">Apr 07 10:36</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
