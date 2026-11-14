import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Download } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, LinkRow, Select, DataTable, Badge, formatRp,
} from '../../components/ui';
import api from '../../utils/api';
import {
  buildPeriods, dbDayKey, isCancelled, isPaid, shortDate, sinceKey, downloadCsv, formatNumber,
} from './statsUtils';

const REPORTS = [
  { value: 'date', label: 'Penjualan berdasarkan tanggal', description: 'Jumlah order dan nilai penjualan per hari.' },
  { value: 'status', label: 'Penjualan berdasarkan status order', description: 'Jumlah order dan nilai penjualan per status order.' },
];
const RANGES = [
  { value: '7', label: '7 hari terakhir' },
  { value: '30', label: '30 hari terakhir' },
  { value: '90', label: '90 hari terakhir' },
];
const STATUS_LABEL = {
  pending: 'Baru', confirmed: 'Lunas', paid: 'Lunas', processing: 'Dikemas', packed: 'Dikemas',
  shipped: 'Terkirim', delivered: 'Selesai', completed: 'Selesai', cancelled: 'Dibatalkan', refunded: 'Dikembalikan', failed: 'Gagal',
};

export default function ReportsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [report, setReport] = useState(null);
  const [range, setRange] = useState('30');
  const [result, setResult] = useState({ key: null, orders: [], error: null });
  const days = Number(range);
  const fetchKey = `${storeId}-${days}`;

  useEffect(() => {
    if (!storeId || !report) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/orders?limit=10000&dateFrom=${sinceKey(Math.ceil(days / 2))}`)
      .then((res) => { if (!cancelled) setResult({ key: fetchKey, orders: res.data?.items || [], error: null }); })
      .catch((err) => { if (!cancelled) setResult({ key: fetchKey, orders: [], error: err.message }); });
    return () => { cancelled = true; };
  }, [storeId, days, report, fetchKey]);

  const loading = !!report && !!storeId && result.key !== fetchKey;

  const rows = useMemo(() => {
    const keys = buildPeriods(days).current;
    const set = new Set(keys);
    const orders = result.orders.filter((o) => set.has(dbDayKey(o.created_at)));
    if (report === 'status') {
      const map = new Map();
      for (const o of orders) {
        const st = String(o.status || 'pending').toLowerCase();
        const r = map.get(st) || { id: st, status: st, count: 0, total: 0 };
        r.count += 1;
        r.total += Number(o.total) || 0;
        map.set(st, r);
      }
      return [...map.values()].sort((a, b) => b.count - a.count);
    }
    const map = Object.fromEntries(keys.map((k) => [k, { id: k, date: k, count: 0, paid: 0, gross: 0, shipping: 0, net: 0 }]));
    for (const o of orders) {
      const r = map[dbDayKey(o.created_at)];
      if (!r || isCancelled(o)) continue;
      r.count += 1;
      if (isPaid(o)) r.paid += 1;
      r.gross += Number(o.total) || 0;
      r.shipping += Number(o.shipping_cost) || 0;
      r.net += Number(o.subtotal) || 0;
    }
    return keys.slice().reverse().map((k) => map[k]).filter((r) => r.count > 0);
  }, [result.orders, report, days]);

  const active = REPORTS.find((r) => r.value === report);

  const columns = report === 'status'
    ? [
      { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'cancelled' ? 'danger' : r.status === 'delivered' || r.status === 'completed' ? 'success' : 'neutral'}>{STATUS_LABEL[r.status] || r.status}</Badge> },
      { key: 'count', label: 'Jumlah order', className: 'tabular-nums', render: (r) => formatNumber(r.count) },
      { key: 'total', label: 'Nilai penjualan', className: 'tabular-nums', render: (r) => formatRp(r.total) },
    ]
    : [
      { key: 'date', label: 'Tanggal', render: (r) => shortDate(r.date) },
      { key: 'count', label: 'Jumlah order', className: 'tabular-nums' },
      { key: 'paid', label: 'Order dibayar', className: 'tabular-nums' },
      { key: 'net', label: 'Subtotal', className: 'tabular-nums', render: (r) => formatRp(r.net) },
      { key: 'shipping', label: 'Ongkos kirim', className: 'tabular-nums', render: (r) => formatRp(r.shipping) },
      { key: 'gross', label: 'Total', className: 'tabular-nums', render: (r) => formatRp(r.gross) },
    ];

  const exportCsv = () => {
    if (report === 'status') {
      downloadCsv(`penjualan-per-status-${range}hari.csv`, ['Status', 'Jumlah order', 'Nilai penjualan'],
        rows.map((r) => [STATUS_LABEL[r.status] || r.status, r.count, r.total]));
    } else {
      downloadCsv(`penjualan-per-tanggal-${range}hari.csv`, ['Tanggal', 'Jumlah order', 'Order dibayar', 'Subtotal', 'Ongkos kirim', 'Total'],
        rows.map((r) => [r.date, r.count, r.paid, r.net, r.shipping, r.gross]));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Laporan Penjualan" subtitle="Lihat dan unduh ringkasan penjualan toko Anda." />
      <Card>
        <div className="space-y-2">
          {REPORTS.map((r) => (
            <LinkRow key={r.value} label={r.label} description={r.description} onClick={() => setReport(r.value)} />
          ))}
        </div>
      </Card>

      {active && (
        <Card padded={false}>
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4">
            <CardHeader title={active.label} subtitle={active.description} className="mb-0" />
            <div className="flex items-center gap-2">
              <label htmlFor="report-range" className="sr-only">Rentang waktu</label>
              <Select id="report-range" value={range} onChange={setRange} options={RANGES} className="w-44" />
              <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={rows.length === 0}>Download</Button>
            </div>
          </div>
          {result.error && result.key === fetchKey && (
            <p role="alert" className="mx-4 mt-3 rounded-lg px-3 py-2 text-sm bg-danger-surface text-danger">Gagal memuat order: {result.error}</p>
          )}
          <div className="mt-3">
            <DataTable columns={columns} rows={rows} loading={loading} emptyText="Tidak ditemukan data pada rentang ini" />
          </div>
        </Card>
      )}
    </div>
  );
}
