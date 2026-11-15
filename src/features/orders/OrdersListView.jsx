import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Package, Plus } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, Tabs, SearchInput, FilterChip, AddFilterChip, DataTable, Pagination, formatRp,
} from '../../components/ui';
import api from '../../utils/api';
import { fetchOrders, updateOrderStatus } from './ordersSlice';
import {
  STATUS_GROUPS, ALL_GROUP_KEYS, statusesOf, statusMeta, paymentMeta, isFulfilled,
  PAYMENT_FILTER_OPTIONS, FULFILLMENT_FILTER_OPTIONS, DATE_FILTER_OPTIONS, dateRangeOf,
} from './orderStatus';
import { formatDbDateTime, parseDbDate } from './orderFormat';
import OrderDetailModal from './OrderDetailModal';
import CreateOrderModal from './CreateOrderModal';

const SEARCH_FIELDS = [
  { value: 'order_code', label: 'ID Pesanan' },
  { value: 'customer_name', label: 'Nama Penerima' },
];

const EXTRA_FILTERS = [
  { key: 'payment', label: 'Status Pembayaran', options: PAYMENT_FILTER_OPTIONS },
  { key: 'fulfillment', label: 'Status Fulfillment', options: FULFILLMENT_FILTER_OPTIONS },
];

/** Batas data yang diambil sekaligus saat filter tidak bisa dikerjakan backend (multi-status, pencarian, dsb). */
const CLIENT_FETCH_LIMIT = 1000;

const intersect = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return a.filter((x) => b.includes(x));
};

function ProductCell({ items }) {
  const first = items?.[0];
  return (
    <div className="flex items-center gap-2.5 min-w-[180px] max-w-[240px]">
      <div className="w-10 h-10 rounded-md bg-page border border-divider flex items-center justify-center shrink-0">
        <Package className="w-4 h-4 text-subdued" aria-hidden="true" />
      </div>
      {items === undefined ? (
        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
      ) : first ? (
        <div className="min-w-0">
          <div className="text-sm text-neutral truncate">{first.product_name}</div>
          <div className="text-xs text-subdued">
            {first.quantity} x {formatRp(first.price)}
            {items.length > 1 && ` · +${items.length - 1} lainnya`}
          </div>
        </div>
      ) : (
        <span className="text-xs text-subdued">-</span>
      )}
    </div>
  );
}

function AddFilterMenu({ available, onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  if (available.length === 0) return null;
  return (
    <div className="relative" ref={ref}>
      <AddFilterChip onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="absolute z-30 mt-1 min-w-[200px] bg-white rounded-lg shadow-lg border border-divider py-1">
          {available.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => { onAdd(f.key); setOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Daftar pesanan reusable: tab + pencarian + chip filter + tabel + paginasi.
 *
 * Props:
 * - title: judul halaman
 * - tabs: key grup status untuk tab (selain "Semua"), lihat STATUS_GROUPS
 * - fixedStatuses: batasi isi tab "Semua" ke grup-grup ini (null = semua status)
 * - initialStatusFilter: isi awal chip Status (array key grup)
 * - showCreate: tampilkan tombol "+ Buat pesanan"
 */
export default function OrdersListView({
  title,
  tabs = ALL_GROUP_KEYS,
  fixedStatuses = null,
  initialStatusFilter = [],
  showCreate = true,
  emptyText = 'Order tidak ditemukan',
}) {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, isLoading, error } = useSelector((s) => s.orders);
  const storeId = currentStore?.id;

  const [tab, setTab] = useState('all');
  const [statusChip, setStatusChip] = useState(initialStatusFilter.join(','));
  const [dateChip, setDateChip] = useState('');
  const [extraShown, setExtraShown] = useState([]);
  const [extra, setExtra] = useState({ payment: '', fulfillment: '' });
  const [searchField, setSearchField] = useState('order_code');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [details, setDetails] = useState({});
  const requested = useRef(new Set());

  const resetPaging = () => { setPage(1); setSelected([]); };

  /* ---- status efektif ---- */
  const scopeKeys = fixedStatuses;
  const tabKeys = tab === 'all' ? scopeKeys : [tab];
  const chipKeys = statusChip ? statusChip.split(',') : null;
  const effectiveKeys = intersect(tabKeys, chipKeys);
  const statuses = effectiveKeys ? statusesOf(effectiveKeys) : null;
  const noMatch = !!statuses && statuses.length === 0;
  const clientMode = (!!statuses && statuses.length !== 1) || !!extra.payment || !!extra.fulfillment || !!search;

  const paramsKey = useMemo(() => {
    const p = { ...dateRangeOf(dateChip) };
    if (search) p.search = search;
    if (clientMode) {
      p.page = 1;
      p.limit = CLIENT_FETCH_LIMIT;
    } else {
      p.page = page;
      p.limit = limit;
      if (statuses) p.status = statuses[0];
    }
    return JSON.stringify(p);
  }, [dateChip, search, clientMode, page, limit, statuses]);

  useEffect(() => {
    if (!storeId || noMatch) return;
    dispatch(fetchOrders({ storeId, params: JSON.parse(paramsKey) }));
  }, [dispatch, storeId, paramsKey, noMatch, reload]);

  /* ---- baris yang ditampilkan ---- */
  const { rows, rowTotal } = useMemo(() => {
    if (noMatch) return { rows: [], rowTotal: 0 };
    let list = items || [];
    if (clientMode) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) => {
        if (statuses && !statuses.includes(o.status)) return false;
        if (extra.payment && paymentMeta(o).key !== extra.payment) return false;
        if (extra.fulfillment && (extra.fulfillment === 'yes') !== isFulfilled(o)) return false;
        if (q && !String(o[searchField] || '').toLowerCase().includes(q)) return false;
        return true;
      });
    }
    if (sort) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      const val = (o) => {
        if (sort.key === 'created_at') return parseDbDate(o.created_at)?.getTime() || 0;
        if (sort.key === 'total') return Number(o.total ?? o.subtotal ?? 0);
        return String(o[sort.key] || '');
      };
      list = [...list].sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
    }
    if (clientMode) {
      return { rows: list.slice((page - 1) * limit, page * limit), rowTotal: list.length };
    }
    return { rows: list, rowTotal: total || 0 };
  }, [items, total, noMatch, clientMode, statuses, extra, search, searchField, sort, page, limit]);

  /* ---- ringkasan produk per baris (lazy) ---- */
  const visibleIds = rows.map((r) => r.id).join(',');
  useEffect(() => {
    if (!storeId || !visibleIds) return;
    visibleIds.split(',').forEach((id) => {
      if (requested.current.has(id)) return;
      requested.current.add(id);
      api.get(`/stores/${storeId}/orders/${id}`)
        .then((res) => setDetails((d) => ({ ...d, [id]: res?.data?.items || [] })))
        .catch(() => setDetails((d) => ({ ...d, [id]: [] })));
    });
  }, [storeId, visibleIds]);

  /* ---- aksi ---- */
  const applySearch = () => { setSearch(searchDraft.trim()); resetPaging(); };

  const onSort = (key) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'desc' };
      if (s.dir === 'desc') return { key, dir: 'asc' };
      return null;
    });
  };

  const applyBulk = async () => {
    if (!bulkStatus || selected.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(selected.map((id) => dispatch(updateOrderStatus({
        storeId, orderId: id, status: STATUS_GROUPS[bulkStatus].write,
      })).unwrap()));
      setSelected([]);
      setBulkStatus('');
      setReload((n) => n + 1);
    } finally {
      setBulkBusy(false);
    }
  };

  const filtersActive = !!(dateChip || search || extra.payment || extra.fulfillment || extraShown.length
    || statusChip !== initialStatusFilter.join(','));

  const resetFilters = () => {
    setStatusChip(initialStatusFilter.join(','));
    setDateChip('');
    setExtra({ payment: '', fulfillment: '' });
    setExtraShown([]);
    setSearch('');
    setSearchDraft('');
    resetPaging();
  };

  /* ---- opsi chip ---- */
  const chipScope = fixedStatuses || ALL_GROUP_KEYS;
  const statusOptions = [
    ...(initialStatusFilter.length > 1
      ? [{ value: initialStatusFilter.join(','), label: initialStatusFilter.map((k) => STATUS_GROUPS[k].label).join(', ') }]
      : []),
    ...chipScope.map((k) => ({ value: k, label: STATUS_GROUPS[k].label })),
  ];

  const tabItems = [{ value: 'all', label: 'Semua' }, ...tabs.map((k) => ({ value: k, label: STATUS_GROUPS[k].label }))];
  const bulkOptions = ALL_GROUP_KEYS;

  const nowrap = 'whitespace-nowrap';
  const columns = [
    { key: 'product', label: 'Produk', render: (r) => <ProductCell items={details[r.id]} /> },
    {
      key: 'order_code', label: 'ID Pesanan', sortable: true, className: nowrap,
      render: (r) => (
        <button type="button" onClick={() => setDetailId(r.id)} className="text-primary font-medium hover:underline cursor-pointer">
          {r.order_code || r.id.slice(0, 8)}
        </button>
      ),
    },
    { key: 'status', label: 'Status', render: (r) => { const m = statusMeta(r.status); return <Badge tone={m.tone}>{m.label}</Badge>; } },
    {
      key: 'customer_name', label: 'Penerima', className: nowrap,
      render: (r) => (
        <div>
          <div className="font-medium">{r.customer_name || '-'}</div>
          {r.customer_phone && <div className="text-xs text-subdued">{r.customer_phone}</div>}
        </div>
      ),
    },
    { key: 'buyer_type', label: 'Tipe Pembeli', render: () => <Badge>Regular</Badge> },
    {
      key: 'fulfillment', label: 'Fulfillment', className: nowrap,
      render: (r) => (
        <div>
          <div>{r.shipping_courier ? r.shipping_courier.toUpperCase() : '-'}</div>
          <div className="text-xs text-subdued">Nomor Resi: {r.shipping_awb || '-'}</div>
        </div>
      ),
    },
    {
      key: 'fulfillment_status', label: 'Status Fulfillment',
      render: (r) => (isFulfilled(r) ? <Badge tone="success">Terpenuhi</Badge> : <Badge tone="muted">Tidak terpenuhi</Badge>),
    },
    { key: 'payment_status', label: 'Status Pembayaran', render: (r) => { const m = paymentMeta(r); return <Badge tone={m.tone}>{m.label}</Badge>; } },
    {
      key: 'payment_info', label: 'Info Pembayaran', className: nowrap,
      render: (r) => (
        <span className="text-subdued">
          {r.payment_method || (paymentMeta(r).key === 'paid' ? 'Pembayaran diterima' : 'Menunggu pembayaran')}
        </span>
      ),
    },
    {
      key: 'total', label: 'Subtotal', sortable: true, className: nowrap,
      render: (r) => (
        <div>
          <div className="font-medium tabular-nums">{formatRp(r.total ?? r.subtotal)}</div>
          <div className="text-xs text-subdued">
            {r.shipping_cost ? `Ongkir ${formatRp(r.shipping_cost)}` : (r.payment_method || 'Tanpa ongkir')}
          </div>
        </div>
      ),
    },
    {
      key: 'paid_at', label: 'Dibayar pada', className: nowrap,
      render: (r) => (r.paid_at || r.payment_status === 'paid' ? formatDbDateTime(r.paid_at || r.updated_at) : '-'),
    },
    { key: 'assignee', label: 'Ditugaskan untuk', render: (r) => <span className="text-subdued">{r.assigned_to || '-'}</span> },
    { key: 'created_at', label: 'Dibuat', sortable: true, className: nowrap, render: (r) => formatDbDateTime(r.created_at) },
    { key: 'dropship', label: 'Dropship', render: (r) => <span className="text-subdued">{r.is_dropship ? 'Ya' : 'Tidak'}</span> },
  ];

  return (
    <div>
      <PageHeader
        title={title}
        actions={showCreate && (
          <Button icon={Plus} onClick={() => setCreateOpen(true)} disabled={!storeId}>Buat pesanan</Button>
        )}
      />

      <Card padded={false}>
        <div className="px-4">
          <Tabs tabs={tabItems} value={tab} onChange={(v) => { setTab(v); resetPaging(); }} />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                aria-label="Cari berdasarkan"
                className="h-9 pl-3 pr-8 rounded-md border border-divider text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:border-primary"
              >
                {SEARCH_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-subdued absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
            <SearchInput
              value={searchDraft}
              onChange={setSearchDraft}
              onSubmit={applySearch}
              placeholder="Cari..."
              className="min-w-[200px]"
            />
            <Button variant="secondary" onClick={applySearch}>Cari</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="Status"
              value={statusChip}
              options={statusOptions}
              onChange={(v) => { setStatusChip(v); resetPaging(); }}
            />
            <FilterChip
              label="Tanggal"
              value={dateChip}
              options={DATE_FILTER_OPTIONS}
              onChange={(v) => { setDateChip(v); resetPaging(); }}
            />
            {EXTRA_FILTERS.filter((f) => extraShown.includes(f.key)).map((f) => (
              <FilterChip
                key={f.key}
                label={f.label}
                value={extra[f.key]}
                options={f.options}
                onChange={(v) => { setExtra((x) => ({ ...x, [f.key]: v })); resetPaging(); }}
              />
            ))}
            <AddFilterMenu
              available={EXTRA_FILTERS.filter((f) => !extraShown.includes(f.key))}
              onAdd={(k) => setExtraShown((s) => [...s, k])}
            />
            {filtersActive && (
              <button type="button" onClick={resetFilters} className="text-xs text-primary hover:underline cursor-pointer ml-1">
                Hapus filter
              </button>
            )}
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary-surface px-3 py-2">
              <span className="text-sm text-neutral font-medium">{selected.length} pesanan dipilih</span>
              <div className="relative">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  aria-label="Ubah status pesanan terpilih"
                  className="h-8 pl-3 pr-8 rounded-md border border-divider text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="">Ubah status ke...</option>
                  {bulkOptions.map((k) => <option key={k} value={k}>{STATUS_GROUPS[k].label}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-subdued absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              </div>
              <Button size="sm" onClick={applyBulk} disabled={!bulkStatus || bulkBusy}>
                {bulkBusy ? 'Menyimpan...' : 'Terapkan'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Batal</Button>
            </div>
          )}

          {error && !isLoading && (
            <p className="text-sm text-danger" role="alert">Gagal memuat pesanan: {error}</p>
          )}
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          selectable
          selected={selected}
          onSelect={setSelected}
          loading={isLoading && !noMatch}
          emptyText={currentStore ? emptyText : 'Pilih toko terlebih dahulu'}
          sort={sort}
          onSort={onSort}
          minWidth={1800}
        />
        <Pagination
          page={page}
          limit={limit}
          total={rowTotal}
          onPage={(p) => { setPage(p); setSelected([]); }}
          onLimit={(l) => { setLimit(l); resetPaging(); }}
        />
      </Card>

      {detailId && (
        <OrderDetailModal
          key={detailId}
          storeId={storeId}
          orderId={detailId}
          onClose={() => { setDetailId(null); setReload((n) => n + 1); }}
        />
      )}
      {createOpen && (
        <CreateOrderModal
          storeId={storeId}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); setReload((n) => n + 1); }}
        />
      )}
    </div>
  );
}
