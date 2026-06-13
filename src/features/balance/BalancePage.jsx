export default function BalancePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Saldo</h2>
      </div>
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-500 mb-1">Saldo Saat Ini</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">Rp 0</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Top Up</button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Riwayat</button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Riwayat Transaksi</h4>
            <div className="text-center py-8">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              <p className="text-sm text-gray-400">Belum ada transaksi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Informasi Saldo</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Masuk</span><span className="font-medium">Rp 0</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Keluar</span><span className="font-medium">Rp 0</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-3"><span className="text-gray-700 font-medium">Saldo Tersedia</span><span className="font-bold">Rp 0</span></div>
          </div>
          <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">Tarik Saldo</button>
        </div>
      </div>
    </div>
  );
}
