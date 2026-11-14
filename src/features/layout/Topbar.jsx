import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MessageCircle, Bell, Store, ChevronDown, Check, Plus, Languages, UserCog, LogOut, Zap, X,
} from 'lucide-react';
import { logout } from '../auth/authSlice';
import { setCurrentStore } from '../stores/storeSlice';

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOutside]);
}

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { stores, currentStore } = useSelector((state) => state.stores);
  const userRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  useClickOutside(userRef, () => setDropdownOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  // Pintasan ⌘J / Ctrl+J untuk fokus ke pencarian
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const plan = currentStore?.plan ? currentStore.plan.charAt(0).toUpperCase() + currentStore.plan.slice(1) : 'Basic';
  const storeName = currentStore?.name || user?.full_name || 'Toko saya';

  return (
    <header className="h-[68px] bg-white border-b border-divider flex items-center px-6 sticky top-0 z-50">
      <Link to="/dashboard" className="flex items-baseline shrink-0 w-[232px]" aria-label="ZunixeStore beranda">
        <span className="text-[22px] font-bold tracking-tight text-neutral">zunixe</span>
        <span className="text-[22px] font-normal tracking-tight text-primary">store</span>
      </Link>

      {/* Pencarian */}
      <div className="flex-1 flex justify-center px-6">
        <div className="relative w-full max-w-[360px]">
          <Search className="w-4 h-4 text-subdued absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Cari apa saja..."
            aria-label="Cari apa saja"
            className="w-full h-9 pl-9 pr-14 rounded-lg bg-gray-100 text-sm placeholder:text-subdued focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/30"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1" aria-hidden="true">
            <kbd className="text-[10px] text-subdued bg-white border border-divider rounded px-1.5 py-0.5">⌘</kbd>
            <kbd className="text-[10px] text-subdued bg-white border border-divider rounded px-1.5 py-0.5">J</kbd>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button type="button" aria-label="Chat" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-neutral cursor-pointer">
          <MessageCircle className="w-[22px] h-[22px]" strokeWidth={1.6} />
        </button>

        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifikasi"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-neutral cursor-pointer"
          >
            <Bell className="w-[22px] h-[22px]" strokeWidth={1.6} />
          </button>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-divider z-[200] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral">Notifikasi</span>
                <button type="button" aria-label="Tutup" onClick={() => setNotifOpen(false)} className="text-subdued hover:text-neutral cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center py-8 text-subdued text-sm">Belum ada notifikasi</div>
            </div>
          )}
        </div>

        {/* Toko & akun */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Store className="w-4 h-4 text-subdued" aria-hidden="true" />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-xs text-neutral max-w-[120px] truncate">{storeName}</span>
              <span className="mt-0.5 text-[10px] font-semibold text-white bg-primary rounded-full px-2 py-px">{plan}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-neutral" aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-divider z-[200] overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-surface text-success text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" /> {plan}
                  </span>
                  <Link to="/subscription" onClick={() => setDropdownOpen(false)} className="text-primary text-sm font-medium hover:underline">Perpanjang</Link>
                </div>
                <p className="text-xs text-subdued">
                  {currentStore?.plan_expiry ? `Berlaku sampai ${new Date(currentStore.plan_expiry).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Tanpa batas waktu'}
                </p>
              </div>
              <div className="h-px bg-divider mx-4" />
              <div className="p-2">
                {stores.map((store) => (
                  <button
                    type="button"
                    key={store.id}
                    onClick={() => { dispatch(setCurrentStore(store)); setDropdownOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-left cursor-pointer ${
                      currentStore?.id === store.id ? 'bg-primary-surface text-primary font-medium' : 'text-neutral hover:bg-gray-50'
                    }`}
                  >
                    <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{store.name}</span>
                    {currentStore?.id === store.id && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                  </button>
                ))}
                <Link
                  to="/stores/new"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium hover:bg-gray-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" /> Tambah Toko
                </Link>
              </div>
              <div className="h-px bg-divider mx-4" />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-subdued font-semibold text-sm">
                    {(user?.full_name || 'Z').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral truncate">{user?.full_name || '-'}</p>
                    <p className="text-xs text-subdued truncate">{user?.email || ''}</p>
                  </div>
                </div>
                <Link to="/settings/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 py-2 text-sm text-neutral hover:text-primary">
                  <Languages className="w-4 h-4 text-subdued" aria-hidden="true" /> Bahasa & Notifikasi Saya
                </Link>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 py-2 text-sm text-neutral hover:text-primary">
                  <UserCog className="w-4 h-4 text-subdued" aria-hidden="true" /> Pengaturan Akun
                </Link>
                <button type="button" onClick={handleLogout} className="flex items-center gap-2 py-2 text-sm text-danger hover:text-red-700 w-full text-left cursor-pointer">
                  <LogOut className="w-4 h-4" aria-hidden="true" /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
