export default function DealPosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">DealPos</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h16v12H4z"/></svg>
        <p className="text-sm text-gray-500 mb-4">Integrasi Point of Sale dengan DealPos.</p>
        <p className="text-xs text-gray-400 mb-6">Sinkronkan penjualan offline kamu dengan toko online.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Hubungkan</button>
      </div>
    </div>
  );
}
