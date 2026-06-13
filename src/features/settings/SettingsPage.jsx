import { NavLink } from 'react-router-dom';

const SETTINGS = [
  {
    title: 'Pembayaran & Pengiriman',
    items: [
      { label: 'Metode pembayaran', desc: 'Tentukan metode pembayaran yang dapat dipilih customer.', icon: 'M4 2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v4h16V4H4zm0 6v6h16v-6H4z', href: '/settings/payments' },
      { label: 'Metode pengiriman', desc: 'Tentukan metode pengiriman yang dapat dipilih customer.', icon: 'M3.5 2A1.5 1.5 0 012 3.5V5h12V3.5A1.5 1.5 0 0012.5 2h-9zM2 12V6h12v6H2zm0 2v.5A1.5 1.5 0 003.5 16h9a1.5 1.5 0 001.5-1.5V14H2zm13-2V6.586l1.293-1.293a1 1 0 111.414 1.414L17.414 7H20v2h-2.586l.293.293a1 1 0 01-1.414 1.414L15 9.414V12h-2z', href: '/settings/shipping' },
      { label: 'Lokasi', desc: 'Kelola lokasi gudang kamu untuk kemudahan distribusi produk.', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z', href: '/settings/locations' },
      { label: 'Paket Gratis Ongkir', desc: 'Tingkatkan penjualan Anda melalui Paket Pengiriman Gratis.', icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2h-2V5H5v6h2v2H4a1 1 0 01-1-1V4zm11 6a1 1 0 011-1h2a1 1 0 011 1v2h-2v-1h-2v-1zm-1 3a1 1 0 011-1h1v1a1 1 0 01-1 1h-1v-1zm-6 0h6v2H7v-2z', href: '/settings/free-shipping' },
      { label: 'Penjualan internasional', desc: 'Atur pengiriman internasional ke berbagai negara pilihan.', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', href: '/settings/international' },
    ],
  },
  {
    title: 'Manajemen Toko / Preferensi Toko',
    items: [
      { label: 'Pengaturan Toko', desc: 'Atur ketentuan toko online kamu.', icon: 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z', href: '/settings' },
      { label: 'Paket Upgrade', desc: 'Dapatkan berbagai fitur khusus untuk kebutuhan bisnis kamu.', icon: 'M13 2.5a1 1 0 011 1v3.5l2.5-2.5a1 1 0 111.414 1.414L14.414 8H21a1 1 0 010 2h-6.586l2.793 2.793a1 1 0 01-1.414 1.414L13 11.414V14.5a1 1 0 11-2 0v-12a1 1 0 011-1zM3 5a1 1 0 000 2h6a1 1 0 000-2H3zm0 4a1 1 0 000 2h4a1 1 0 000-2H3zm0 4a1 1 0 100 2h2a1 1 0 000-2H3z', href: '/subscription' },
      { label: 'Staf', desc: 'Kelola sumber daya manusia toko kamu.', icon: 'M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 017 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 01-.014.002H7.022zM11 7a2 2 0 100-4 2 2 0 000 4z', href: '/settings/staff' },
      { label: 'Domain & SEO', desc: 'Atur URL & SEO toko kamu.', icon: 'M12 1a8 8 0 00-8 8c0 2.5 1.5 5.5 3 7l2 3h6l2-3c1.5-1.5 3-4.5 3-7a8 8 0 00-8-8zm0 12a4 4 0 110-8 4 4 0 010 8z', href: '/settings/domain' },
      { label: 'Aplikasi Toko Saya', desc: 'Bagi aplikasi toko kamu & kirim update terbaru ke customer.', icon: 'M2 4a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm4.5 0a1 1 0 011-1H9a1 1 0 011 1v1.5a1 1 0 01-1 1H7.5a1 1 0 01-1-1V4zm4.75 0a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75zM2 8.5a1 1 0 011-1h1.5a1 1 0 011 1V10a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5zm4.5 0a1 1 0 011-1H9a1 1 0 011 1V10a1 1 0 01-1 1H7.5a1 1 0 01-1-1V8.5zm4.75-.5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0011.25 8z', href: '/settings/store-apps' },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      { label: 'Kebijakan Toko', desc: 'Lihat kebijakan dan syarat & ketentuan toko kamu.', icon: 'M9 12h2v2H9v-2zm1-4a5.002 5.002 0 014.905 4H15a1 1 0 010 2h-1.095A5.002 5.002 0 015 10a5 5 0 015-5zm0 8a3 3 0 100-6 3 3 0 000 6z', href: '/settings/policies' },
      { label: 'Hapus toko', desc: 'Toko, produk, integrasi & langganan kamu akan terhapus.', icon: 'M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM7 6a1 1 0 011 1v5a1 1 0 01-2 0V7a1 1 0 011-1zm3 0a1 1 0 011 1v5a1 1 0 01-2 0V7a1 1 0 011-1z', href: '/settings/delete-store', danger: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div>
      {SETTINGS.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h3>
          <div className="grid grid-cols-2 gap-3">
            {section.items.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    item.danger
                      ? 'border-red-100 hover:border-red-200 hover:bg-red-50'
                      : isActive
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`
                }
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.danger ? 'bg-red-50' : 'bg-gray-100'}`}>
                  <svg className={`w-5 h-5 ${item.danger ? 'text-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d={item.icon} /></svg>
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${item.danger ? 'text-red-700' : 'text-gray-900'}`}>{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
