import SettingsPageLayout from './SettingsPageLayout';

export default function StaffPage() {
  return (
    <SettingsPageLayout title="Kelola Staf" desc="Kelola sumber daya manusia toko kamu.">
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 017 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 01-.014.002H7.022zM11 7a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <p className="text-sm text-gray-500">Belum ada staf.</p>
        <p className="text-xs text-gray-400 mt-1">Undang staf untuk membantu mengelola toko kamu.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          + Undang Staf
        </button>
      </div>
    </SettingsPageLayout>
  );
}
