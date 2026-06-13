import SettingsPageLayout from './SettingsPageLayout';

const POLICIES = [
  { title: 'Kebijakan Privasi', desc: 'Bagaimana data customer dikumpulkan, digunakan, dan dilindungi.' },
  { title: 'Syarat & Ketentuan', desc: 'Aturan dan ketentuan yang mengatur penggunaan toko kamu.' },
  { title: 'Kebijakan Pengembalian', desc: 'Ketentuan pengembalian barang dan refund.' },
  { title: 'Kebijakan Pengiriman', desc: 'Ketentuan pengiriman dan estimasi waktu.' },
];

export default function PoliciesPage() {
  return (
    <SettingsPageLayout title="Kebijakan Toko" desc="Lihat kebijakan dan syarat & ketentuan toko kamu.">
      <div className="space-y-3">
        {POLICIES.map((policy) => (
          <div key={policy.title} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12h2v2H9v-2zm1-4a5.002 5.002 0 014.905 4H15a1 1 0 010 2h-1.095A5.002 5.002 0 015 10a5 5 0 015-5zm0 8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{policy.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{policy.desc}</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
            </svg>
          </div>
        ))}
      </div>
    </SettingsPageLayout>
  );
}
