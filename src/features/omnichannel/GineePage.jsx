export default function GineePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Ginee</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        <p className="text-sm text-gray-500 mb-4">Integrasi Omnichannel dengan Ginee.</p>
        <p className="text-xs text-gray-400 mb-6">Kelola semua marketplace dalam satu dashboard dengan Ginee.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Hubungkan</button>
      </div>
    </div>
  );
}
