import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Zap, Rocket, Headset, Check, Star } from 'lucide-react';
import {
  fetchPlans, fetchSubscription, fetchUsage, fetchBilling, subscribe,
} from './subscriptionSlice';
import { fetchStores } from '../stores/storeSlice';
import {
  Card, Button, Badge, Tabs, Modal, EmptyState, formatRp,
} from '../../components/ui';

const PLAN_ORDER = ['lite', 'basic', 'business', 'enterprise'];
const PLAN_ICONS = { lite: Rocket, basic: Rocket, business: Rocket, enterprise: Headset };
const PREV_LABEL = { lite: null, basic: 'Lite', business: 'Basic', enterprise: 'Business' };

const fmtUsage = (u) => (u?.limit === null || u?.limit === undefined ? 'tidak terbatas' : u.limit);

export default function SubscriptionPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { plans, current, usage, billing } = useSelector((s) => s.subscriptions);
  const [tab, setTab] = useState('overview');
  const [showPlans, setShowPlans] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (currentStore) {
      dispatch(fetchPlans(currentStore.id));
      dispatch(fetchSubscription(currentStore.id));
      dispatch(fetchUsage(currentStore.id));
      dispatch(fetchBilling(currentStore.id));
    }
  }, [dispatch, currentStore]);

  const planKey = usage?.plan || current?.plan || 'lite';
  const plan = plans?.[planKey] || {};
  const u = usage?.usage || {};

  const handleSubscribe = async (key) => {
    if (!currentStore) return;
    const res = await dispatch(subscribe({ storeId: currentStore.id, plan: { plan: key } }));
    if (!res.error) {
      setShowPlans(false);
      setNotice(`Paket "${plans?.[key]?.name || key}" berhasil diaktifkan.`);
      dispatch(fetchUsage(currentStore.id));
      dispatch(fetchBilling(currentStore.id));
      dispatch(fetchStores()); // refresh pill paket di Topbar
    }
  };

  const stats = [
    { label: 'Produk', used: u.products?.used ?? 0, limit: u.products?.limit },
    { label: 'Pesanan Bulan Ini', used: u.orders_month?.used ?? 0, limit: null },
    { label: 'Pemilik', used: u.owners?.used ?? 0, limit: u.owners?.limit ?? 1 },
    { label: 'Staf', used: u.staff?.used ?? 0, limit: u.staff?.limit, ineligible: (u.staff?.limit ?? 0) === 0 },
    { label: 'Lokasi', used: u.locations?.used ?? 0, limit: u.locations?.limit },
    { label: 'Kuota Pembayaran Manual', used: u.manual_payment_quota?.used ?? 0, limit: u.manual_payment_quota?.limit },
  ];

  return (
    <div>
      <h1 className="text-base font-semibold text-neutral mb-4">Rincian paket</h1>

      {notice && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-neutral">{notice}</div>
      )}

      {/* Kartu paket saat ini + kuota — ala Plugo */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral">{plan.name || 'Lite'}</h2>
            <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <Button size="sm" onClick={() => setShowPlans(true)}>Beli Paket</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-lg border border-divider bg-divider overflow-hidden">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-4 py-3">
              <p className="text-xs text-subdued font-[family-name:var(--font-label)]">{s.label}</p>
              <p className="mt-1 text-sm font-semibold text-neutral tabular-nums">
                {s.ineligible ? 'Tidak memenuhi syarat' : `${s.used} / ${fmtUsage(s)}`}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: 'Overview Paket' },
          { value: 'addons', label: 'Tambahan' },
          { value: 'billing', label: 'Riwayat Penagihan' },
        ]}
      />

      {tab === 'overview' && (
        <Card className="text-center py-12">
          <Star className="w-8 h-8 text-warning mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-base font-bold text-neutral">Buka Potensi Penuh Toko</h3>
          <p className="text-sm text-subdued mt-2 max-w-md mx-auto">
            Tampil menonjol dengan fitur seperti domain gratis, promosi hitung mundur, program
            keanggotaan, laporan yang dapat diunduh, dan kursi tim tambahan.
          </p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={() => setShowPlans(true)}>Cari tahu lebih lanjut</Button>
        </Card>
      )}

      {tab === 'addons' && (
        <Card>
          <EmptyState
            icon={Star}
            title="Belum ada tambahan"
            description="Tambahan seperti kursi staf ekstra dan kuota pembayaran manual akan tersedia di sini."
          />
        </Card>
      )}

      {tab === 'billing' && (
        <Card padded={false}>
          {billing.length === 0 ? (
            <EmptyState title="Belum ada riwayat penagihan" description="Transaksi paket kamu akan muncul di sini." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider text-left">
                  {['Tanggal', 'Paket', 'Jumlah', 'Status Pembayaran', 'Status'].map((h) => (
                    <th key={h} className="py-3 px-4 font-semibold text-neutral">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billing.map((b) => (
                  <tr key={b.id} className="border-b border-divider last:border-0">
                    <td className="py-2.5 px-4 text-neutral">{new Date(b.start_date || b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="py-2.5 px-4 text-neutral capitalize">{b.plan}</td>
                    <td className="py-2.5 px-4 text-neutral tabular-nums">{b.amount ? formatRp(b.amount) : 'Gratis'}</td>
                    <td className="py-2.5 px-4"><Badge tone={b.payment_status === 'paid' ? 'success' : 'warning'}>{b.payment_status === 'paid' ? 'Lunas' : 'Pending'}</Badge></td>
                    <td className="py-2.5 px-4"><Badge tone={b.status === 'active' ? 'success' : 'muted'}>{b.status === 'active' ? 'Aktif' : b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Modal pilih paket — meniru modal Plugo */}
      <Modal open={showPlans} onClose={() => setShowPlans(false)} title="Pilih paket yang tepat untuk kebutuhan bisnismu" width="max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -m-5">
          {PLAN_ORDER.map((key, idx) => {
            const p = plans?.[key];
            if (!p) return null;
            const Icon = PLAN_ICONS[key] || Rocket;
            const isCurrent = planKey === key;
            const prev = PREV_LABEL[key];
            return (
              <div key={key} className={`p-6 ${idx > 0 ? 'border-l border-divider' : ''} ${isCurrent ? 'bg-primary-surface/40' : ''}`}>
                <Icon className="w-6 h-6 text-primary mb-3" aria-hidden="true" />
                <h3 className="text-base font-bold text-neutral">{p.name}</h3>
                <p className="text-xs text-subdued mt-1 min-h-8">{p.tagline}</p>
                <p className="mt-4 text-lg font-bold text-neutral">
                  {p.price === null ? '' : p.price === 0 ? 'FREE' : (
                    <><span className="block text-xs font-normal text-subdued">Mulai dari</span>{formatRp(Math.round(p.price * 1.11))}</>
                  )}
                </p>
                {p.price !== null && p.price > 0 && <p className="text-[11px] text-subdued">Sudah termasuk PPN</p>}
                {p.price === null ? (
                  <Button variant="secondary" size="sm" className="mt-3" href="mailto:sales@zunixe.id">Hubungi Kami</Button>
                ) : isCurrent ? (
                  <Badge tone="primary" className="mt-3">Paket Aktif</Badge>
                ) : (
                  <Button size="sm" className="mt-3" onClick={() => handleSubscribe(key)}>Beli Paket</Button>
                )}
                <ul className="mt-5 space-y-1.5">
                  <li className="text-xs font-semibold text-subdued">{prev ? `Semua di ${prev} plus` : 'Termasuk di semua paket'}</li>
                  {(p.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-neutral">
                      <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" aria-hidden="true" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
