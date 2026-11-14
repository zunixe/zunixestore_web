import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Award } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, StatTile, DataTable, Badge, Button, EmptyState, formatRp,
} from '../../components/ui';
import api from '../../utils/api';
import { useStoreSetting } from '../store-design/useStoreSetting';
import { formatNumber } from './statsUtils';

/*
 * Program loyalty disimpan di store_settings "loyalty_program" (diatur di halaman Loyalty).
 * Backend belum mencatat transaksi poin, jadi poin diberikan/ditukar tampil 0.
 * Member per tier dihitung dari total belanja customer terhadap batas minimum tiap tier.
 */
export default function LoyaltyAnalyticsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const program = useStoreSetting('loyalty_program', null);
  const [customers, setCustomers] = useState({ storeId: null, items: [], error: null });

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/customers?limit=10000`)
      .then((res) => { if (!cancelled) setCustomers({ storeId, items: res.data?.items || [], error: null }); })
      .catch((err) => { if (!cancelled) setCustomers({ storeId, items: [], error: err.message }); });
    return () => { cancelled = true; };
  }, [storeId]);

  const cfg = program.value && typeof program.value === 'object' ? program.value : null;
  const tiers = useMemo(() => (Array.isArray(cfg?.tiers) ? [...cfg.tiers] : [])
    .sort((a, b) => Number(a.minSpend || 0) - Number(b.minSpend || 0)), [cfg]);

  const tierRows = useMemo(() => {
    const counts = tiers.map(() => 0);
    for (const c of customers.items) {
      const spent = Number(c.total_spent) || 0;
      let idx = -1;
      tiers.forEach((t, i) => { if (spent >= Number(t.minSpend || 0)) idx = i; });
      if (idx >= 0) counts[idx] += 1;
    }
    return tiers.map((t, i) => ({ id: t.id || t.name, name: t.name, minSpend: Number(t.minSpend || 0), multiplier: t.multiplier, members: counts[i] }));
  }, [tiers, customers.items]);

  const members = tierRows.reduce((s, r) => s + r.members, 0);
  const loading = !program.loaded || (storeId && customers.storeId !== storeId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Laporan Program Loyalty"
        actions={<Button variant="secondary" to="/loyalty">Atur program loyalty</Button>}
      />

      {customers.error && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm bg-danger-surface text-danger">Gagal memuat customer: {customers.error}</div>
      )}

      <Card>
        <CardHeader
          title="Ringkasan Poin"
          subtitle={cfg?.enabled ? 'Program loyalty aktif.' : 'Program loyalty belum diaktifkan.'}
          action={<Badge tone={cfg?.enabled ? 'success' : 'muted'}>{cfg?.enabled ? 'Aktif' : 'Tidak Aktif'}</Badge>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Poin diberikan', value: formatNumber(0), dot: '#4169E1' },
            { label: 'Poin ditukar', value: formatNumber(0), dot: '#10B981' },
            { label: 'Nilai poin ditukar', value: formatRp(0), dot: '#F59E0B' },
            { label: 'Member', value: loading ? '...' : formatNumber(members), dot: '#8B5CF6' },
          ].map((t) => (
            <div key={t.label} className="rounded-lg border border-divider p-3">
              <StatTile label={t.label} value={t.value} dot={t.dot} />
            </div>
          ))}
        </div>
        <p className="text-xs text-subdued mt-3">Riwayat pemberian dan penukaran poin akan tampil setelah transaksi poin mulai tercatat.</p>
      </Card>

      <Card padded={false}>
        <div className="px-4 pt-4">
          <CardHeader title="Member per Tier" subtitle="Dihitung dari total belanja customer terhadap minimum belanja tiap tier." />
        </div>
        {!loading && tiers.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Belum ada tier membership"
            description="Buat tier di halaman Loyalty untuk melihat sebaran member."
            action={<Button to="/loyalty">Atur tier</Button>}
            className="py-10"
          />
        ) : (
          <DataTable
            loading={loading}
            rows={tierRows}
            columns={[
              { key: 'name', label: 'Tier', render: (r) => <span className="font-medium">{r.name}</span> },
              { key: 'minSpend', label: 'Minimum belanja', className: 'tabular-nums', render: (r) => formatRp(r.minSpend) },
              { key: 'multiplier', label: 'Pengali poin', className: 'tabular-nums', render: (r) => `${formatNumber(r.multiplier || 1)}x` },
              { key: 'members', label: 'Jumlah member', className: 'tabular-nums', render: (r) => formatNumber(r.members) },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
