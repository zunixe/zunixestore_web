import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const MENUS = [
  { label: 'Home', icon: 'M6.5 1.5a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5h3zm5 0a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5h3zm-5 6a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V8a.5.5 0 01.5-.5h3zm5 0a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V8a.5.5 0 01.5-.5h3z', href: '/dashboard' },
  { label: 'Pesanan', icon: 'M2 4a1 1 0 011-1h10a1 1 0 011 1v1H2V4zm0 3h12v5a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm3 2a1 1 0 000 2h6a1 1 0 000-2H5z', href: '/orders' },
  { label: 'Produk', icon: 'M8 1a3 3 0 00-3 3v1h6V4a3 3 0 00-3-3zm4 4V4a4 4 0 10-8 0v1H3a1 1 0 00-.994.89l-1 9A1 1 0 002 16h12a1 1 0 00.994-1.11l-1-9A1 1 0 0013 5H5z', href: '/products' },
  { label: 'Diskon', icon: 'M10.5 1.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-4a.5.5 0 010-1h2.793L4.146 1.854a.5.5 0 11.708-.708L10 4.793V2a.5.5 0 01.5-.5z', href: '/discounts' },
  { label: 'Customer', icon: 'M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 017 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 01-.014.002H7.022zM11 7a2 2 0 100-4 2 2 0 000 4z', href: '/customers' },
  { label: 'Desain Toko', icon: 'M4 1h5.5L13 4.5V7h-1V5H9V2H4v12h4v1H4a1 1 0 01-1-1V2a1 1 0 011-1z', href: '/themes' },
  { label: 'Analitik & Marketing', icon: 'M1 1h1v12h13v1H1V1zM4 11.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm4-4a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-5zm4-4a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-9z', href: '/analytics' },
];

export default function Sidebar() {
  const [appsOpen, setAppsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="w-[280px] bg-[#f9fafb] h-[calc(100vh-64px)] sticky top-[64px] shrink-0 flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 space-y-1">
        <NavLink to="/my-balance" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/></svg>
          <span className="text-gray-500 text-xs">Saldo</span>
          <span className="font-semibold text-xs ml-auto">Rp 0</span>
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>
        </NavLink>

      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {MENUS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d={item.icon} /></svg>
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}

        <div className="cursor-pointer" onClick={() => setAppsOpen(!appsOpen)}>
          <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm4.5 0a1 1 0 011-1H9a1 1 0 011 1v1.5a1 1 0 01-1 1H7.5a1 1 0 01-1-1V4zm4.75 0a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75zM2 8.5a1 1 0 011-1h1.5a1 1 0 011 1V10a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5zm4.5 0a1 1 0 011-1H9a1 1 0 011 1V10a1 1 0 01-1 1H7.5a1 1 0 01-1-1V8.5zm4.75-.5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0011.25 8z"/></svg>
            <span className="flex-1">Aplikasi</span>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${appsOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </div>
          {appsOpen && (
            <div className="ml-2">
              {['ZunixeLinks','Conversion API','DealPos','Desty','Ginee','Google Merchant','Jubelio','Katalog Facebook','Konten Multi Bahasa','Whatsapp Landing'].map(app => (
                <div key={app} className="flex items-center gap-2.5 px-4 py-2.5 ml-4 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer rounded">
                  {app}
                </div>
              ))}
            </div>
          )}
        </div>

        <NavLink to="/settings" className={({ isActive }) =>
          `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`
        }>
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M11.5 2a.5.5 0 01.5.5v1.793l4.146-4.146a.5.5 0 11.708.708L12.707 5H14.5a.5.5 0 010 1h-4a.5.5 0 01-.5-.5v-4a.5.5 0 01.5-.5z"/></svg>
          <span className="flex-1">Pengaturan</span>
        </NavLink>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-xs text-gray-700">
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span>Tambahkan Store ke Layar Depan!</span>
        </div>
      </div>
    </nav>
  );
}
