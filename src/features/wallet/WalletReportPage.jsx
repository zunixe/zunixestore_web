import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coins, Award } from 'lucide-react';
import api from '../../utils/api';
import {
  PageHeader, Card, CardHeader, DataTable,
} from '../../components/ui';

const HISTORY_COLUMNS = [
  { key: 'date', label: 'Tanggal' },
  { key: 'desc', label: 'Keterangan' },
  { key: 'coins', label: 'Koin' },
  { key: 'points', label: 'Poin' },
];

function BalanceTile({ icon: Icon, label, value, hint, loading }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-xs text-subdued font-[family-name:var(--font-label)]">
        <span className="w-7 h-7 rounded-full bg-primary-surface flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
        </span>
        {label}
      </div>
      {loading
        ? <div className="h-9 w-24 mt-2 rounded bg-gray-100 animate-pulse" />
        : <p className="text-3xl font-bold text-neutral mt-2 tabular-nums">{Number(value || 0).toLocaleString('en-US')}</p>}
      <p className="text-xs text-subdued mt-2">{hint}</p>
    </Card>
  );
}

export default function WalletReportPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [data, setData] = useState({ storeId: null, coins: 0, points: 0, error: '' });

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/coins`)
      .then((res) => { if (!cancelled) setData({ storeId, coins: res.data?.coins || 0, points: res.data?.points || 0, error: '' }); })
      .catch((err) => { if (!cancelled) setData({ storeId, coins: 0, points: 0, error: err.message || 'Gagal memuat data' }); });
    return () => { cancelled = true; };
  }, [storeId]);

  const loading = !!storeId && data.storeId !== storeId;

  return (
    <div>
      <PageHeader title="Koin & Poin" subtitle="Ringkasan koin toko dan poin reward customer." />
      {data.error && <p className="text-xs text-danger mb-3" role="alert">{data.error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <BalanceTile icon={Coins} label="Koin" value={data.coins} hint="Dapatkan Koin dari setiap transaksi" loading={loading} />
        <BalanceTile icon={Award} label="Poin" value={data.points} hint="Poin reward untuk customer setia" loading={loading} />
      </div>
      <Card padded={false}>
        <CardHeader title="Riwayat Transaksi" className="px-4 pt-4 mb-0" />
        <DataTable columns={HISTORY_COLUMNS} rows={[]} emptyText="Belum ada transaksi" minWidth={520} />
      </Card>
    </div>
  );
}
