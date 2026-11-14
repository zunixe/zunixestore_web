import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Select, SegmentedControl, StatTile, DataTable, IconButton, formatRp,
} from '../../components/ui';
import { fetchStoreStats } from './analyticsSlice';
import LineChart, { ChartLegend } from './LineChart';
import {
  buildPeriods, bucket, dbDayKey, isCancelled, isPaid, sum, pctChange, ratio, shortDate, rangeLabel,
  formatNumber, formatCompactRp,
} from './statsUtils';

const RANGES = [
  { value: '7', label: '7 hari terakhir' },
  { value: '30', label: '30 hari terakhir' },
  { value: '90', label: '90 hari terakhir' },
];
const TABS = [
  { value: 'sales', label: 'Penjualan' },
  { value: 'products', label: 'Produk' },
  { value: 'customers', label: 'Customer' },
];
const C_CURRENT = '#4169E1';
const C_PREVIOUS = '#9CA3AF';
const DOTS = ['#4169E1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const VISIT_HISTORY_DAYS = 30;

const fmtPct = (v) => `${formatNumber(v)}%`;
const fmtInt = (v) => formatNumber(v);
const buyerKey = (o) => o.customer_id || o.customer_email || o.customer_phone || o.customer_name || o.id;

function computeStats(stats, days) {
  const { current, previous } = buildPeriods(days);
  const orders = stats?.orders || [];
  const daily = stats?.daily || [];
  const customers = stats?.customers || [];
  const okey = (o) => dbDayKey(o.created_at);
  const valid = orders.filter((o) => !isCancelled(o));
  const paid = orders.filter(isPaid);
  const cancelled = orders.filter(isCancelled);

  const per = (keys) => {
    const set = new Set(keys);
    const p = {
      orders: bucket(keys, orders, okey),
      valid: bucket(keys, valid, okey),
      paid: bucket(keys, paid, okey),
      cancelled: bucket(keys, cancelled, okey),
      gross: bucket(keys, valid, okey, (o) => o.total),
      net: bucket(keys, paid, okey, (o) => o.subtotal ?? o.total),
      visitors: bucket(keys, daily, (d) => d.date, (d) => d.visitors),
      pageViews: bucket(keys, daily, (d) => d.date, (d) => d.page_views),
      expenses: keys.map(() => 0),
      newCustomers: bucket(keys, customers, (c) => dbDayKey(c.created_at)),
      buyers: new Set(valid.filter((o) => set.has(okey(o))).map(buyerKey)).size,
    };
    p.conversion = p.valid.map((v, i) => ratio(v, p.visitors[i]));
    p.t = Object.fromEntries(['orders', 'valid', 'paid', 'cancelled', 'gross', 'net', 'visitors', 'pageViews', 'expenses', 'newCustomers'].map((k) => [k, sum(p[k])]));
    p.t.conversion = ratio(p.t.valid, p.t.visitors);
    p.t.purchaseRate = ratio(p.t.paid, p.t.visitors);
    p.t.aov = p.t.valid > 0 ? Math.round(p.t.gross / p.t.valid) : 0;
    p.t.pagesPerVisitor = p.t.visitors > 0 ? Math.round((p.t.pageViews / p.t.visitors) * 100) / 100 : 0;
    return p;
  };

  return { current, previous, cur: per(current), prev: per(previous) };
}

function TileBox({ children }) {
  return <div className="rounded-lg border border-divider p-3 min-w-0">{children}</div>;
}

function ChartSection({ title, description, tiles, labels, cur, prev, format, integer, legend, note }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={description} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {tiles.map((t) => (
          <TileBox key={t.label}><StatTile label={t.label} value={t.value} change={t.change} /></TileBox>
        ))}
      </div>
      <LineChart
        ariaLabel={`Grafik ${title}`}
        labels={labels}
        format={format}
        integer={integer}
        series={[
          { label: 'Periode sebelumnya', values: prev, color: C_PREVIOUS, dashed: true },
          { label: 'Periode terpilih', values: cur, color: C_CURRENT },
        ]}
      />
      <ChartLegend items={legend} />
      {note && <p className="text-xs text-subdued mt-2">{note}</p>}
    </Card>
  );
}

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { stats, statsLoading, statsError } = useSelector((s) => s.analytics);
  const storeId = currentStore?.id;
  const [range, setRange] = useState('7');
  const [tab, setTab] = useState('sales');
  const days = Number(range);

  useEffect(() => {
    if (storeId) dispatch(fetchStoreStats({ storeId, days }));
  }, [dispatch, storeId, days]);

  const s = useMemo(() => computeStats(stats, days), [stats, days]);
  const { cur, prev } = s;
  const labels = s.current.map(shortDate);
  const legend = [
    { label: `Periode terpilih: ${rangeLabel(s.current)}`, color: C_CURRENT },
    { label: `Periode sebelumnya: ${rangeLabel(s.previous)}`, color: C_PREVIOUS, dashed: true },
  ];
  const ch = (k) => pctChange(cur.t[k], prev.t[k]);
  const visitNote = 2 * days > VISIT_HISTORY_DAYS
    ? `Data kunjungan saat ini tersedia untuk ${VISIT_HISTORY_DAYS} hari terakhir; hari di luar rentang itu dihitung 0.`
    : null;

  const productStats = useMemo(() => {
    const map = new Map();
    for (const it of stats?.orderItems || []) {
      const key = it.product_id || it.product_name;
      const prevVal = map.get(key) || { id: key, name: it.product_name || 'Produk', qty: 0, revenue: 0 };
      prevVal.qty += Number(it.quantity) || 0;
      prevVal.revenue += Number(it.total) || 0;
      map.set(key, prevVal);
    }
    const top = [...map.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1 }));
    const products = stats?.products || [];
    return {
      top,
      sold: sum([...map.values()].map((p) => p.qty)),
      total: products.length,
      active: products.filter((p) => ['published', 'active'].includes(String(p.status || '').toLowerCase())).length,
      outOfStock: products.filter((p) => Number(p.stock) <= 0).length,
    };
  }, [stats]);

  const customerStats = useMemo(() => {
    const customers = stats?.customers || [];
    const top = [...customers]
      .filter((c) => Number(c.total_spent) > 0 || Number(c.total_orders) > 0)
      .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
      .slice(0, 10);
    return {
      total: customers.length,
      repeat: customers.filter((c) => Number(c.total_orders) > 1).length,
      top,
    };
  }, [stats]);

  const summaryTiles = [
    { label: 'Jumlah Pembayaran', value: fmtInt(cur.t.paid), change: ch('paid') },
    { label: 'Penjualan Bersih', value: formatRp(cur.t.net), change: ch('net') },
    { label: 'Laba Kotor', value: formatRp(0), change: 0 },
    { label: 'Total Pengeluaran', value: formatRp(cur.t.expenses), change: 0 },
    { label: 'Pengunjung', value: fmtInt(cur.t.visitors), change: ch('visitors') },
    { label: 'Tingkat Pembelian', value: fmtPct(cur.t.purchaseRate), change: pctChange(cur.t.purchaseRate, prev.t.purchaseRate) },
  ];

  const loading = statsLoading && !stats;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Statistik Toko"
        actions={(
          <>
            {stats?.fetchedAt && (
              <span className="text-xs text-subdued hidden sm:inline">
                Diperbarui {new Date(stats.fetchedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <IconButton
              icon={RefreshCw}
              label="Muat ulang data"
              className={statsLoading ? 'animate-spin' : ''}
              onClick={() => storeId && dispatch(fetchStoreStats({ storeId, days }))}
            />
            <label htmlFor="stats-range" className="sr-only">Rentang waktu</label>
            <Select id="stats-range" value={range} onChange={setRange} options={RANGES} className="w-48" />
          </>
        )}
      />

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {statsError && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm bg-danger-surface text-danger">Gagal memuat statistik: {statsError}</div>
      )}
      {stats?.partialError && !statsError && (
        <div role="status" className="rounded-xl px-4 py-3 text-sm bg-warning-surface text-warning">Sebagian data tidak dapat dimuat: {stats.partialError}</div>
      )}

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-white animate-pulse" />)}
        </div>
      ) : tab === 'sales' ? (
        <>
          <Card>
            <CardHeader
              title="Ringkasan Statistik"
              subtitle={`Performa toko pada ${RANGES.find((r) => r.value === range)?.label.toLowerCase()} dibandingkan periode sebelumnya.`}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {summaryTiles.map((t, i) => (
                <TileBox key={t.label}><StatTile label={t.label} value={t.value} change={t.change} dot={DOTS[i]} /></TileBox>
              ))}
            </div>
            <p className="text-xs text-subdued mt-3">Laba Kotor dan Total Pengeluaran membutuhkan data harga modal dan biaya toko, yang belum tercatat.</p>
          </Card>

          <ChartSection
            title="Jumlah Order"
            description="Total order yang masuk setiap hari, termasuk yang belum dibayar."
            tiles={[
              { label: 'Total order', value: fmtInt(cur.t.orders), change: ch('orders') },
              { label: 'Order dibayar', value: fmtInt(cur.t.paid), change: ch('paid') },
              { label: 'Order dibatalkan', value: fmtInt(cur.t.cancelled), change: ch('cancelled') },
            ]}
            labels={labels}
            cur={cur.orders}
            prev={prev.orders}
            format={fmtInt}
            integer
            legend={legend}
          />

          <ChartSection
            title="Nilai Penjualan"
            description="Total nilai order yang tidak dibatalkan, termasuk ongkos kirim."
            tiles={[
              { label: 'Penjualan kotor', value: formatRp(cur.t.gross), change: ch('gross') },
              { label: 'Penjualan bersih', value: formatRp(cur.t.net), change: ch('net') },
              { label: 'Rata-rata nilai order', value: formatRp(cur.t.aov), change: pctChange(cur.t.aov, prev.t.aov) },
            ]}
            labels={labels}
            cur={cur.gross}
            prev={prev.gross}
            format={formatCompactRp}
            legend={legend}
          />

          <ChartSection
            title="Pengeluaran"
            description="Biaya operasional toko seperti iklan dan pembelian stok."
            tiles={[{ label: 'Total pengeluaran', value: formatRp(cur.t.expenses), change: 0 }]}
            labels={labels}
            cur={cur.expenses}
            prev={prev.expenses}
            format={formatCompactRp}
            legend={legend}
            note="Belum ada data pengeluaran yang tercatat untuk toko ini."
          />

          <ChartSection
            title="Traffic Toko"
            description="Jumlah pengunjung website toko setiap hari."
            tiles={[
              { label: 'Pengunjung', value: fmtInt(cur.t.visitors), change: ch('visitors') },
              { label: 'Tampilan halaman', value: fmtInt(cur.t.pageViews), change: ch('pageViews') },
              { label: 'Halaman per pengunjung', value: formatNumber(cur.t.pagesPerVisitor), change: pctChange(cur.t.pagesPerVisitor, prev.t.pagesPerVisitor) },
            ]}
            labels={labels}
            cur={cur.visitors}
            prev={prev.visitors}
            format={fmtInt}
            integer
            legend={legend}
            note={visitNote}
          />

          <ChartSection
            title="Tingkat Konversi"
            description="Persentase pengunjung yang membuat order."
            tiles={[
              { label: 'Tingkat konversi', value: fmtPct(cur.t.conversion), change: pctChange(cur.t.conversion, prev.t.conversion) },
              { label: 'Order', value: fmtInt(cur.t.valid), change: ch('valid') },
              { label: 'Pengunjung', value: fmtInt(cur.t.visitors), change: ch('visitors') },
            ]}
            labels={labels}
            cur={cur.conversion}
            prev={prev.conversion}
            format={fmtPct}
            legend={legend}
            note={visitNote}
          />
        </>
      ) : tab === 'products' ? (
        <>
          <Card>
            <CardHeader title="Ringkasan Produk" subtitle="Produk terjual pada periode terpilih dan kondisi katalog saat ini." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TileBox><StatTile label="Produk terjual" value={fmtInt(productStats.sold)} dot={DOTS[0]} /></TileBox>
              <TileBox><StatTile label="Total produk" value={fmtInt(productStats.total)} dot={DOTS[1]} /></TileBox>
              <TileBox><StatTile label="Produk aktif" value={fmtInt(productStats.active)} dot={DOTS[2]} /></TileBox>
              <TileBox><StatTile label="Stok habis" value={fmtInt(productStats.outOfStock)} dot={DOTS[3]} /></TileBox>
            </div>
          </Card>
          <Card padded={false}>
            <div className="px-4 pt-4">
              <CardHeader
                title="Produk Terlaris"
                subtitle={stats?.itemsCapped ? 'Dihitung dari 100 order terbaru pada periode terpilih.' : 'Berdasarkan jumlah terjual pada periode terpilih.'}
              />
            </div>
            <DataTable
              rowKey="id"
              rows={productStats.top}
              emptyText="Belum ada penjualan produk pada periode ini"
              columns={[
                { key: 'rank', label: '#', className: 'w-12 text-subdued' },
                { key: 'name', label: 'Produk', render: (p) => <span className="font-medium">{p.name}</span> },
                { key: 'qty', label: 'Terjual', className: 'tabular-nums', render: (p) => fmtInt(p.qty) },
                { key: 'revenue', label: 'Pendapatan', className: 'tabular-nums', render: (p) => formatRp(p.revenue) },
              ]}
            />
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader title="Ringkasan Customer" subtitle="Customer baru dan pembeli pada periode terpilih dibandingkan periode sebelumnya." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TileBox><StatTile label="Total customer" value={fmtInt(customerStats.total)} dot={DOTS[0]} /></TileBox>
              <TileBox><StatTile label="Customer baru" value={fmtInt(cur.t.newCustomers)} change={ch('newCustomers')} dot={DOTS[1]} /></TileBox>
              <TileBox><StatTile label="Pembeli" value={fmtInt(cur.buyers)} change={pctChange(cur.buyers, prev.buyers)} dot={DOTS[2]} /></TileBox>
              <TileBox><StatTile label="Customer berulang" value={fmtInt(customerStats.repeat)} dot={DOTS[4]} /></TileBox>
            </div>
          </Card>
          <ChartSection
            title="Customer Baru"
            description="Jumlah customer yang terdaftar setiap hari."
            tiles={[{ label: 'Customer baru', value: fmtInt(cur.t.newCustomers), change: ch('newCustomers') }]}
            labels={labels}
            cur={cur.newCustomers}
            prev={prev.newCustomers}
            format={fmtInt}
            integer
            legend={legend}
          />
          <Card padded={false}>
            <div className="px-4 pt-4">
              <CardHeader title="Customer Teratas" subtitle="Berdasarkan total belanja sepanjang waktu." />
            </div>
            <DataTable
              rows={customerStats.top}
              emptyText="Belum ada customer yang berbelanja"
              columns={[
                { key: 'name', label: 'Nama', render: (c) => <span className="font-medium">{c.name || '-'}</span> },
                { key: 'contact', label: 'Kontak', render: (c) => <span className="text-subdued">{c.email || c.phone || '-'}</span> },
                { key: 'total_orders', label: 'Total pesanan', className: 'tabular-nums', render: (c) => fmtInt(c.total_orders) },
                { key: 'total_spent', label: 'Total belanja', className: 'tabular-nums', render: (c) => formatRp(c.total_spent) },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
