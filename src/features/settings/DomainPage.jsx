import { useState } from 'react';
import SettingsPageLayout from './SettingsPageLayout';

export default function DomainPage() {
  const [customDomain, setCustomDomain] = useState('');

  return (
    <SettingsPageLayout title="Domain & SEO" desc="Atur URL & SEO toko kamu.">
      {/* Custom Domain */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Domain Kustom</h4>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-3">Hubungkan domain kustom untuk toko kamu (contoh: tokokamu.com).</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="namatoko.com"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Hubungkan
            </button>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">SEO Toko</h4>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Meta Title</label>
            <input
              type="text"
              placeholder="ZunixeStore - Toko Online Terpercaya"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Meta Description</label>
            <textarea
              rows={3}
              placeholder="Deskripsi singkat tentang toko kamu untuk hasil pencarian."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  );
}
