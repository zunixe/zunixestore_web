import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth/authSlice';
import { setCurrentStore } from '../stores/storeSlice';

export default function Topbar({ title, children }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { stores, currentStore } = useSelector((state) => state.stores);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-[69px] bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-50">
      <div className="w-[180px] flex items-center gap-2">
        <div className="h-7 rounded bg-blue-100 px-3 flex items-center">
          <span className="text-blue-600 font-bold text-sm">ZunixeStore</span>
        </div>
      </div>

      <div className="flex-1 max-w-[500px] flex items-center bg-gray-100 rounded-lg px-3 h-[42px] gap-2 cursor-pointer">
        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span className="text-gray-500 text-sm flex-1">Cari apa saja...</span>
        <span className="text-gray-400 text-xs flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[11px]">Ctrl</kbd><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[11px]">J</kbd></span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {stores.length > 0 && (
          <select
            value={currentStore?.id || ''}
            onChange={(e) => {
              const store = stores.find(s => s.id === e.target.value);
              if (store) dispatch(setCurrentStore(store));
            }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 mr-2"
          >
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        <button className="w-11 h-11 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3c-4.42 0-8 3.58-8 8v6l-2 2v1h20v-1l-2-2v-6c0-4.42-3.58-8-8-8zm-2 22h4a2 2 0 01-4 0z"/></svg>
        </button>

        <button className="w-11 h-11 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor"><path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm1 17.93V19h-2v2.93A8.002 8.002 0 019.07 15H12v-2H9.07A8.002 8.002 0 0115 9.07V12h2V9.07A8.002 8.002 0 0122.93 15H20v2h2.93A8.002 8.002 0 0117 21.93z"/></svg>
        </button>

        <div className="relative">
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer h-[47px]"
            onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
          >
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-gray-900 font-medium">{user?.full_name || 'zunixe'}</span>
              <span className="text-xs text-gray-500">Basic</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </div>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-[200] overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M11.251.068a.5.5 0 01.227.58L9.677 6.5H13a.5.5 0 01.364.843l-8 8.5a.5.5 0 01-.842-.49L6.323 9.5H3a.5.5 0 01-.364-.843l8-8.5a.5.5 0 01.615-.09z"/></svg>
                    Basic
                  </span>
                  <a href="/subscription" className="text-blue-600 text-sm font-medium hover:underline">Perpanjang</a>
                </div>
                <p className="text-xs text-gray-500">Berlaku Sampai 05 Jul 2026, 16:24</p>
              </div>
              <div className="h-px bg-gray-100 mx-4"></div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4.5 h-4.5 text-gray-500" viewBox="0 0 16 16" fill="currentColor"><path d="M2.97 1.35A1 1 0 013.477 1h9.046a1 1 0 01.507.13l3.5 2a1 1 0 010 1.74l-3.5 2A1 1 0 0111.523 7H3.477a1 1 0 01-.507-.13l-3.5-2a1 1 0 010-1.74l3.5-2zM4 5.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zM2 9.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zM2 12.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"/></svg>
                  <span className="text-sm font-medium text-gray-900 flex-1">{currentStore?.name || 'zunixe'}</span>
                  <svg className="w-4.5 h-4.5 text-blue-500" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z"/></svg>
                </div>
                <a href="/stores/new" className="text-blue-600 text-sm font-medium">+ Tambah Toko</a>
              </div>
              <div className="h-px bg-gray-100 mx-4"></div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">Z</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Zaini Hafid'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'zunixe@gmail.com'}</p>
                  </div>
                </div>
                <a href="/settings" className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-gray-900">
                  <svg className="w-4.5 h-4.5 text-gray-500" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 0a.5.5 0 01.5.5V3h5a.5.5 0 010 1h-5v3h5a.5.5 0 010 1h-5v2a.5.5 0 01-.5.5h-5a.5.5 0 010-1h4V7h-4a.5.5 0 010-1h4V1h-4a.5.5 0 010-1h5V.5a.5.5 0 01.5-.5z"/></svg>
                  Bahasa & Notifikasi Saya
                </a>
                <a href="/profile" className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-gray-900">
                  <svg className="w-4.5 h-4.5 text-gray-500" viewBox="0 0 16 16" fill="currentColor"><path d="M11 6a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Pengaturan Akun
                </a>
                <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-sm text-red-500 hover:text-red-600 w-full text-left">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 001.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z" clipRule="evenodd"/><path fillRule="evenodd" d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z" clipRule="evenodd"/></svg>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
