import { NavLink, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Home, ClipboardList, Package, BadgePercent, Users, Palette, BarChart3, LayoutGrid, Settings,
  ChevronDown, ChevronRight, Wallet, Coins, Plus,
} from 'lucide-react';

/* Struktur menu mengikuti design-system/plugo-reference.md */
const MENU = [
  { label: 'Home', icon: Home, to: '/dashboard' },
  {
    label: 'Pesanan', icon: ClipboardList, to: '/orders',
    children: [
      { label: 'Semua pesanan', to: '/orders' },
      { label: 'Konfirmasi Pembayaran', to: '/pending/payment' },
      { label: 'Pengiriman Tertunda', to: '/pending/shipping' },
      { label: 'Pengaturan Pesanan', to: '/preferences/orders' },
      { label: 'Kalender Open Order', to: '/open-order' },
    ],
  },
  {
    label: 'Produk', icon: Package, to: '/products',
    children: [
      { label: 'Semua produk', to: '/products' },
      { label: 'Stok', to: '/inventory' },
      { label: 'Kategori', to: '/categories' },
      { label: 'Produk bundle', to: '/product-bundles' },
      { label: 'Produk unggulan', to: '/featured-products' },
      { label: 'Pengaturan Produk', to: '/preferences/products' },
    ],
  },
  {
    label: 'Diskon', icon: BadgePercent, to: '/product-promotions',
    children: [
      { label: 'Diskon produk', to: '/product-promotions' },
      { label: 'Diskon pengiriman', to: '/shipment-promotions' },
    ],
  },
  {
    label: 'Customer', icon: Users, to: '/buyers',
    children: [
      { label: 'Semua Customer', to: '/buyers' },
      { label: 'Grup Customer', to: '/buyer-groups' },
      { label: 'Rating', to: '/ratings' },
      { label: 'Loyalty', to: '/loyalty' },
      { label: 'Pengaturan Customer', to: '/preferences/checkout' },
      { label: 'Notifikasi Customer', to: '/preferences/buyer-notifications' },
    ],
  },
  {
    label: 'Desain Toko', icon: Palette, to: '/settings/themes',
    children: [
      { label: 'Desain & Template', to: '/settings/themes' },
      { label: 'Halaman Kustom', to: '/shop/pages' },
      { label: 'Galeri Media', to: '/preferences/asset-manager' },
      { label: 'Post Blog', to: '/news' },
      { label: 'FAQ', to: '/preferences/faqs' },
      { label: 'Testimoni', to: '/testimonials' },
    ],
  },
  {
    label: 'Analitik & Marketing', icon: BarChart3, to: '/analytics',
    children: [
      { label: 'Statistik Toko', to: '/analytics' },
      { label: 'Laporan Penjualan', to: '/reports' },
      { label: 'Analisis Real-time', to: '/analytics/realtime' },
      { label: 'Laporan Wishlist', to: '/analytics/wishlist' },
      { label: 'Laporan Program Loyalty', to: '/loyalty/analytics' },
      { label: 'Alat Pemantauan', to: '/preferences/marketing' },
      { label: 'Kampanye Afiliasi', to: '/affiliate-links' },
    ],
  },
];

const APPS_LIST = [
  { label: 'PlugoLinks', href: '/links' },
  { label: 'Conversion API', href: 'https://ads.plugo.world/' },
  { label: 'DealPos', href: '/preferences/integrations' },
  { label: 'Desty', href: '/omnichannel/desty' },
  { label: 'Ginee', href: '/omnichannel/ginee' },
  { label: 'Google Merchant Center', href: '/google-merchant-center/setup' },
  { label: 'Jubelio', href: '/omnichannel/jubelio' },
  { label: 'Katalog Facebook', href: '/facebook-catalog/setup' },
  { label: 'Konten Multi Bahasa', href: '/apps/localizations/products' },
  { label: 'PlugoSync', href: 'https://sync.plugo.world/' },
  { label: 'Whatsapp Landing Page', href: '/whatsapp-landing-pages' },
];

const itemBase = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors';
const itemIdle = 'text-subdued hover:bg-gray-100';
const itemActive = 'bg-primary-surface text-primary';

/** Path aktif untuk grup: cocok dengan salah satu anak, atau prefix-nya. */
function groupMatches(group, pathname) {
  return group.children.some((c) => pathname === c.to || pathname.startsWith(`${c.to}/`))
    || (group.to === '/products' && pathname.startsWith('/products'));
}

function childActive(child, pathname, siblings) {
  if (pathname === child.to) return true;
  if (!pathname.startsWith(`${child.to}/`)) return false;
  // Jangan aktifkan '/analytics' saat berada di '/analytics/realtime' yang punya entri sendiri.
  return !siblings.some((s) => s.to !== child.to && (pathname === s.to || pathname.startsWith(`${s.to}/`)) && s.to.length > child.to.length);
}

export default function Sidebar() {
  const { pathname } = useLocation();
  // Grup yang terbuka mengikuti rute aktif; klik manual hanya berlaku sampai rute berubah.
  const [manual, setManual] = useState({ path: null, label: null });
  const routeGroup = MENU.find((m) => m.children && groupMatches(m, pathname))?.label ?? null;
  const open = manual.path === pathname ? manual.label : routeGroup;
  const setOpen = (label) => setManual({ path: pathname, label });
  const [appsOpen, setAppsOpen] = useState(false);

  return (
    <nav aria-label="Navigasi utama" className="w-[280px] bg-sidebar h-[calc(100vh-68px)] sticky top-[68px] shrink-0 flex flex-col border-r border-divider">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Saldo & Koin */}
        <div className="rounded-lg border border-divider bg-white mb-4 divide-y divide-divider">
          <Link to="/my-balance" className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 rounded-t-lg">
            <Wallet className="w-4 h-4 text-subdued" aria-hidden="true" />
            <span className="text-xs text-subdued font-medium font-[family-name:var(--font-label)]">Saldo</span>
            <span className="ml-auto text-xs font-semibold text-neutral">Rp 0</span>
            <ChevronRight className="w-4 h-4 text-subdued" aria-hidden="true" />
          </Link>
          <Link to="/wallet/report" className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 rounded-b-lg">
            <Coins className="w-4 h-4 text-subdued" aria-hidden="true" />
            <div className="flex-1 text-xs text-subdued font-medium font-[family-name:var(--font-label)] leading-4">
              <div className="flex justify-between"><span>Koin</span><span className="font-semibold text-neutral">0</span></div>
              <div className="flex justify-between"><span>Poin</span><span className="text-neutral">0</span></div>
            </div>
            <ChevronRight className="w-4 h-4 text-subdued" aria-hidden="true" />
          </Link>
        </div>

        <ul className="space-y-0.5">
          {MENU.map((item) => {
            const Icon = item.icon;
            if (!item.children) {
              return (
                <li key={item.label}>
                  <NavLink to={item.to} end className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemIdle}`}>
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                </li>
              );
            }
            const isOpen = open === item.label;
            const inGroup = groupMatches(item, pathname);
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(isOpen && inGroup ? null : item.label)}
                  aria-expanded={isOpen}
                  className={`${itemBase} ${inGroup && !isOpen ? itemActive : itemIdle} ${inGroup ? 'text-neutral' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                </Link>
                {isOpen && (
                  <ul className="mt-0.5 space-y-0.5">
                    {item.children.map((c) => {
                      const active = childActive(c, pathname, item.children);
                      return (
                        <li key={c.to + c.label}>
                          <Link to={c.to} className={`block pl-6 pr-3 py-2 rounded-lg text-sm ${active ? itemActive : 'text-neutral hover:bg-gray-100'}`}>
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}

          {/* Aplikasi */}
          <li>
            <button
              type="button"
              onClick={() => setAppsOpen(!appsOpen)}
              aria-expanded={appsOpen}
              className={`${itemBase} ${itemIdle} w-full cursor-pointer`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">Aplikasi</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${appsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {appsOpen && (
              <ul className="mt-0.5 space-y-0.5">
                {APPS_LIST.map((app) => {
                  const external = app.href.startsWith('http');
                  const cls = `flex flex-col pl-9 pr-3 py-1.5 rounded-lg ${pathname === app.href ? itemActive : 'hover:bg-gray-100'}`;
                  const body = (
                    <>
                      <span className="text-sm text-neutral">{app.label}</span>
                      <span className="text-[11px] text-subdued">Tanpa Kedaluwarsa</span>
                    </>
                  );
                  return (
                    <li key={app.label}>
                      {external
                        ? <a href={app.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
                        : <Link to={app.href} className={cls}>{body}</Link>}
                    </li>
                  );
                })}
                <li>
                  <button type="button" className="flex items-center gap-2 pl-9 pr-3 py-2 text-sm text-primary hover:bg-gray-100 rounded-lg w-full cursor-pointer">
                    <Plus className="w-4 h-4" aria-hidden="true" /> Tambahkan Aplikasi
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Pengaturan menempel di bawah */}
      <div className="px-4 py-1.5 border-t border-divider bg-sidebar">
        <NavLink to="/preferences" className={({ isActive }) => `${itemBase} ${isActive || pathname.startsWith('/settings/') && !pathname.startsWith('/settings/themes') ? itemActive : itemIdle}`}>
          <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">Pengaturan</span>
        </NavLink>
      </div>
    </nav>
  );
}
