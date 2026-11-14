import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Eye, ShoppingBag, Wallet, ChevronRight, X, Plus, ChevronDown, Pencil, Copy, Megaphone,
  MessageCircle, Monitor, FileText, Send, Link2, Store, Bell,
} from 'lucide-react';
import { fetchDashboard } from './dashboardSlice';
import { api } from '../../utils/api';
import { Card, CardHeader, Button, StatTile, EmptyState, formatRp } from '../../components/ui';

const PERIODS = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'week', label: '7 hari terakhir' },
  { value: 'month', label: '30 hari terakhir' },
];

const RECOMMENDED_APPS = [
  { icon: MessageCircle, title: 'Zunixe untuk WhatsApp', desc: 'Kelola pesanan, pelanggan, dan template pesan langsung dari panel samping WhatsApp Web.' },
  { icon: Monitor, title: 'ZunixePOS', desc: 'Jalankan toko offline yang terhubung ke webstore. Stok dan penjualan tersinkron real-time.' },
  { icon: FileText, title: 'Formulir', desc: 'Buat formulir kustom untuk mengumpulkan feedback, data pelanggan, hingga giveaway.' },
  { icon: Send, title: 'WhatsApp Broadcast', desc: 'Kirim pesan broadcast langsung ke customer kamu.' },
];

const QUICK_KEY = 'zs-quick-access';

function readQuick() {
  try { return JSON.parse(localStorage.getItem(QUICK_KEY)) || []; } catch { return []; }
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { user } = useSelector((s) => s.auth);
  const { data, isLoading } = useSelector((s) => s.dashboard);
  const [period, setPeriod] = useState('today');
  const [showAds, setShowAds] = useState(true);
  const [statusCounts, setStatusCounts] = useState({ confirmed: 0, shipped: 0 });
  const [copied, setCopied] = useState(false);
  const quick = readQuick();

  useEffect(() => {
    if (currentStore) dispatch(fetchDashboard(currentStore.id));
  }, [dispatch, currentStore]);

  // Jumlah pesanan per status untuk kartu "Status Pesanan"
  useEffect(() => {
    if (!currentStore) return;
    let alive = true;
    Promise.all(['confirmed', 'shipped'].map((st) =>
      api.get(`/stores/${currentStore.id}/orders?status=${st}&limit=1`)
        .then((r) => r.data?.total ?? r.data?.pagination?.total ?? (Array.isArray(r.data) ? r.data.length : 0))
        .catch(() => 0)))
      .then(([confirmed, shipped]) => { if (alive) setStatusCounts({ confirmed, shipped }); });
    return () => { alive = false; };
  }, [currentStore]);

  if (!currentStore) {
    return (
      <Card>
        <EmptyState
          icon={Store}
          title="Belum ada toko"
          description="Buat toko pertamamu untuk mulai berjualan."
          action={<Button to="/stores/new" icon={Plus}>Tambah Toko</Button>}
        />
      </Card>
    );
  }

  const storeUrl = currentStore.domain || `${currentStore.slug}.zunixe.com`;
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`https://${storeUrl}/links`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* abaikan */ }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Kolom utama */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-neutral">Halo, {user?.full_name || 'Kamu'}!</h1>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              aria-label="Periode"
              className="h-9 pl-3 pr-9 rounded-md border border-divider bg-white text-sm appearance-none cursor-pointer"
            >
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subdued" aria-hidden="true" />
          </div>
        </div>

        <Card padded={false} className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-divider py-3">
          <div className="px-4 py-1"><StatTile icon={Eye} label="Pengunjung Website" value={isLoading ? '…' : (data?.visitors ?? 0)} /></div>
          <div className="px-4 py-1"><StatTile icon={ShoppingBag} label="Total Pesanan" value={isLoading ? '…' : (data?.orders ?? 0)} /></div>
          <div className="px-4 py-1"><StatTile icon={Wallet} label="Total Dibayar" value={isLoading ? '…' : formatRp(data?.revenue)} /></div>
        </Card>

        <Card className="!p-3">
          <CardHeader
            title="Status Pesanan"
            className="!mb-2"
            action={<Link to="/orders" className="text-xs font-semibold text-primary px-2 py-1 hover:underline">Lihat Semua</Link>}
          />
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Siap Dikirim', value: statusCounts.confirmed, to: '/pending/shipping' },
              { label: 'Terkirim', value: statusCounts.shipped, to: '/orders?status=shipped' },
            ].map((s) => (
              <Link key={s.label} to={s.to} className="flex items-center justify-between border border-divider rounded-lg p-2 hover:border-primary transition-colors">
                <div>
                  <div className="text-xs text-subdued font-[family-name:var(--font-label)]">{s.label}</div>
                  <div className="text-xl font-bold text-neutral tabular-nums">{s.value}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-subdued" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Card>

        {showAds && (
          <Card className="relative overflow-hidden">
            <button type="button" aria-label="Tutup" onClick={() => setShowAds(false)} className="absolute top-3 right-3 text-subdued hover:text-neutral cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <span className="w-9 h-9 rounded-lg bg-primary-surface flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4 text-primary" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-neutral">Coba Ads dan tinjau ads</h2>
                <p className="text-sm text-subdued mt-1">Periksa iklan yang sedang berjalan dan dapatkan rekomendasi untuk meningkatkan penargetan, anggaran, dan engagement.</p>
                <Button variant="secondary" size="sm" className="mt-3" to="/preferences/marketing">Lanjutkan ke Ads</Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Aplikasi untuk Anda" subtitle="Rekomendasi untuk Anda berdasarkan aktivitas toko Anda" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {RECOMMENDED_APPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral">{title}</h3>
                  <p className="text-xs text-subdued mt-0.5 line-clamp-2">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader
              title="Akses Cepat"
              action={<button type="button" aria-label="Tambah akses cepat" className="text-primary hover:bg-primary-surface rounded-md p-1 cursor-pointer"><Plus className="w-4 h-4" /></button>}
            />
            {quick.length === 0 ? (
              <p className="text-sm text-subdued text-center py-8">Menu favorit dan yang baru Anda kunjungi akan tampil di sini.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {quick.map((q) => <Link key={q.to} to={q.to} className="px-3 py-1.5 rounded-md border border-divider text-sm hover:border-primary">{q.label}</Link>)}
              </div>
            )}
          </Card>

          <Card padded={false}>
            <div className="px-4 pt-4"><CardHeader title="Website Toko" /></div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-subdued truncate">{storeUrl}</span>
                <Link to="/settings/domain" className="inline-flex items-center gap-1 text-neutral hover:text-primary">Ubah <Pencil className="w-3.5 h-3.5" aria-hidden="true" /></Link>
              </div>
              <div className="h-[140px] rounded-lg border border-divider bg-gradient-to-br from-primary-surface to-white flex flex-col items-center justify-center gap-1 mb-3">
                <Store className="w-8 h-8 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm font-semibold text-neutral">{currentStore.name}</span>
                <span className="text-xs text-subdued">Pratinjau toko</span>
              </div>
              <Button variant="tonal" className="w-full" icon={Pencil} to="/settings/themes">Edit Desain Toko</Button>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <Link2 className="w-3.5 h-3.5 text-subdued" aria-hidden="true" />
                <span className="text-subdued">Link toko:</span>
                <span className="text-neutral truncate flex-1">{storeUrl}/links</span>
                <button type="button" onClick={copyLink} aria-label="Salin link toko" className="text-subdued hover:text-primary cursor-pointer">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-success">Disalin</span>}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Kolom kanan */}
      <div className="w-full xl:w-[295px] shrink-0 flex flex-col gap-4">
        <div className="rounded-xl bg-gradient-to-br from-primary to-[#6d8ff0] text-white p-5 min-h-[130px] flex flex-col justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide opacity-80">Tips</div>
            <div className="text-lg font-bold leading-6 mt-1">Aktifkan pengingat pembayaran</div>
          </div>
          <Link to="/preferences/buyer-notifications" className="text-xs font-semibold underline underline-offset-2 mt-3">Atur sekarang</Link>
        </div>

        <Card padded={false}>
          <div className="flex justify-between items-center px-4 py-3 border-b border-divider">
            <h2 className="text-sm font-semibold text-neutral">Pengumuman</h2>
            <span className="text-xs font-semibold text-subdued">Lihat Semua</span>
          </div>
          <div className="flex flex-col items-center text-center px-4 py-10">
            <Bell className="w-8 h-8 text-gray-300 mb-2" aria-hidden="true" />
            <p className="text-sm text-subdued">Belum ada pengumuman.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
