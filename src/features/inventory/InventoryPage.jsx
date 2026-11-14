import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileSpreadsheet, SlidersHorizontal, Loader2, Check, AlertCircle } from 'lucide-react';
import { fetchProducts, updateProduct } from '../products/productsSlice';
import api from '../../utils/api';
import {
  PageHeader, Card, Button, SegmentedControl, SearchInput, Select, FilterChip, AddFilterChip,
  DataTable, Pagination, Modal, TextInput, Badge, InfoBanner,
} from '../../components/ui';
import { ProductThumb } from '../product-preferences/ProductParts';
import {
  useStoreSetting, parseExtra, parseDate, formatDateTime, PRODUCT_PREF_DEFAULTS,
} from '../product-preferences/productData';

const OUT_OF_STOCK = {
  sold_out: 'Habis Terjual',
  backorder: 'Terima Pesanan',
  hidden: 'Sembunyikan',
  preorder: 'Pre-order (PO)',
  waitlist: 'Waiting List',
};

const ADJUST_TYPES = [
  { value: 'add', label: 'Tambah stok' },
  { value: 'remove', label: 'Kurangi stok' },
  { value: 'set', label: 'Atur jumlah stok' },
];

function downloadCsv(rows, storeName) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['Nama Produk', 'Kode Varian', 'Kategori', 'Stok'].map(esc).join(',')];
  rows.forEach((p) => lines.push([p.name, p.sku, p.category, p.stock ?? 0].map(esc).join(',')));
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stok-${(storeName || 'toko').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InventoryPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, isLoading } = useSelector((s) => s.products);
  const { value: prefs } = useStoreSetting('product_preferences', PRODUCT_PREF_DEFAULTS);
  const lowThreshold = Number(prefs?.low_stock_threshold) >= 0 ? Number(prefs.low_stock_threshold) : 10;

  const [view, setView] = useState('stock');
  const [searchField, setSearchField] = useState('name');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [oosFilter, setOosFilter] = useState('');
  const [showOosFilter, setShowOosFilter] = useState(false);
  const [detail, setDetail] = useState('show');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [drafts, setDrafts] = useState({});
  const [rowStatus, setRowStatus] = useState({});
  const [announce, setAnnounce] = useState('');
  const [localHistory, setLocalHistory] = useState([]);
  const cancelRef = useRef(new Set());
  const timers = useRef({});

  const [adjust, setAdjust] = useState(null);

  const [histProduct, setHistProduct] = useState('');
  const [histPage, setHistPage] = useState(1);
  const [histLimit, setHistLimit] = useState(10);
  const [serverHist, setServerHist] = useState({ key: null, rows: [], error: '' });

  useEffect(() => {
    if (currentStore) dispatch(fetchProducts({ storeId: currentStore.id, params: { page: '1', limit: '1000' } }));
  }, [dispatch, currentStore]);

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  /* Riwayat dari server per produk (GET /products/:id/inventory). */
  const histKey = currentStore && histProduct ? `${currentStore.id}:${histProduct}` : null;
  useEffect(() => {
    if (!currentStore || !histProduct || view !== 'history') return undefined;
    let cancelled = false;
    const k = `${currentStore.id}:${histProduct}`;
    api.get(`/stores/${currentStore.id}/products/${histProduct}/inventory`)
      .then((res) => { if (!cancelled) setServerHist({ key: k, rows: res.data?.history || [], error: '' }); })
      .catch((err) => { if (!cancelled) setServerHist({ key: k, rows: [], error: err.message || 'Gagal memuat riwayat' }); });
    return () => { cancelled = true; };
  }, [currentStore, histProduct, view]);

  const productById = useMemo(() => new Map(items.map((p) => [p.id, p])), [items]);
  const categories = useMemo(() => [...new Set(items.map((p) => p.category).filter(Boolean))].sort(), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      const stock = Number(p.stock || 0);
      if (q) {
        const hay = searchField === 'sku' ? (p.sku || '') : (p.name || '');
        if (!hay.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (stockFilter === 'in' && stock <= lowThreshold) return false;
      if (stockFilter === 'low' && (stock === 0 || stock > lowThreshold)) return false;
      if (stockFilter === 'out' && stock !== 0) return false;
      if (oosFilter && (parseExtra(p).out_of_stock || 'sold_out') !== oosFilter) return false;
      return true;
    });
  }, [items, search, searchField, categoryFilter, stockFilter, oosFilter, lowThreshold]);

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, pages);
  const paged = filtered.slice((safePage - 1) * limit, safePage * limit);

  const flashStatus = (id, st) => {
    setRowStatus((s) => ({ ...s, [id]: st }));
    clearTimeout(timers.current[id]);
    if (st !== 'saving') {
      timers.current[id] = setTimeout(() => setRowStatus((s) => { const n = { ...s }; delete n[id]; return n; }), 2500);
    }
  };
  const clearDraft = (id) => setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });

  const saveStock = async (p, next, note) => {
    const prev = Number(p.stock || 0);
    flashStatus(p.id, 'saving');
    try {
      await dispatch(updateProduct({ storeId: currentStore.id, productId: p.id, data: { stock: next } })).unwrap();
      setLocalHistory((h) => [{
        id: `local-${Date.now()}-${p.id}`,
        product_id: p.id,
        change: next - prev,
        stock_after: next,
        notes: note,
        created_at: new Date().toISOString(),
      }, ...h]);
      clearDraft(p.id);
      flashStatus(p.id, 'saved');
      setAnnounce(`Stok ${p.name} disimpan: ${next}`);
      return true;
    } catch (err) {
      clearDraft(p.id);
      flashStatus(p.id, 'error');
      setAnnounce(`Gagal menyimpan stok ${p.name}. ${typeof err === 'string' ? err : err?.message || ''}`);
      return false;
    }
  };

  const commitStock = (p) => {
    if (cancelRef.current.has(p.id)) { cancelRef.current.delete(p.id); return; }
    const raw = drafts[p.id];
    if (raw === undefined) return;
    const next = Number(raw);
    if (String(raw).trim() === '' || !Number.isInteger(next) || next < 0) {
      clearDraft(p.id);
      flashStatus(p.id, 'error');
      setAnnounce('Stok harus berupa bilangan bulat 0 atau lebih');
      return;
    }
    if (next === Number(p.stock || 0)) { clearDraft(p.id); return; }
    saveStock(p, next, 'Diubah langsung di halaman Stok');
  };

  /* ---------- Modal Kelola Inventaris ---------- */
  const openAdjust = (productId = '') => setAdjust({ productId: productId || items[0]?.id || '', type: 'add', qty: '', note: '', error: '', saving: false });
  const adjProduct = adjust ? productById.get(adjust.productId) : null;
  const adjCurrent = Number(adjProduct?.stock || 0);
  const adjQty = Number(adjust?.qty);
  const adjValid = !!adjust && String(adjust.qty).trim() !== '' && Number.isInteger(adjQty) && adjQty >= 0;
  let adjNext = null;
  if (adjValid) adjNext = adjust.type === 'add' ? adjCurrent + adjQty : adjust.type === 'remove' ? adjCurrent - adjQty : adjQty;

  const submitAdjust = async () => {
    if (!adjProduct) { setAdjust((a) => ({ ...a, error: 'Pilih produk terlebih dahulu' })); return; }
    if (!adjValid || (adjust.type !== 'set' && adjQty === 0)) { setAdjust((a) => ({ ...a, error: 'Masukkan jumlah yang valid' })); return; }
    if (adjNext < 0) { setAdjust((a) => ({ ...a, error: 'Stok tidak boleh kurang dari 0' })); return; }
    setAdjust((a) => ({ ...a, saving: true, error: '' }));
    const typeLabel = ADJUST_TYPES.find((t) => t.value === adjust.type)?.label;
    const ok = await saveStock(adjProduct, adjNext, adjust.note.trim() || typeLabel);
    if (ok) setAdjust(null);
    else setAdjust((a) => (a ? { ...a, saving: false, error: 'Gagal menyimpan stok. Coba lagi.' } : a));
  };

  /* ---------- Kolom tabel stok ---------- */
  const stockColumns = [
    {
      key: 'name', label: 'Produk',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-[240px]">
          <ProductThumb product={p} />
          <Link to={`/products/edit/${p.id}`} className="text-[13px] text-neutral underline underline-offset-2 decoration-gray-300 hover:text-primary hover:decoration-primary line-clamp-2">
            {p.name}
          </Link>
        </div>
      ),
    },
    ...(detail === 'show' ? [
      {
        key: 'variant', label: 'Varian',
        render: (p) => {
          const models = parseExtra(p).models;
          return Array.isArray(models) && models.length > 0
            ? <span className="whitespace-nowrap">{models.length} varian</span>
            : <span className="text-subdued">-</span>;
        },
      },
      { key: 'sku', label: 'Kode Varian', render: (p) => p.sku || <span className="text-subdued">-</span> },
      {
        key: 'oos', label: 'Ketika tidak ada stok',
        render: (p) => {
          const x = parseExtra(p);
          if (x.availability === 'always') return <Badge tone="muted">Selalu Tersedia</Badge>;
          if (x.availability === 'preorder') return <Badge tone="muted">Pre-order (PO)</Badge>;
          return <span className="whitespace-nowrap">{OUT_OF_STOCK[x.out_of_stock] || OUT_OF_STOCK.sold_out}</span>;
        },
      },
    ] : []),
    {
      key: 'stock', label: 'Aktif',
      render: (p) => {
        const value = drafts[p.id] ?? String(p.stock ?? 0);
        const st = rowStatus[p.id];
        const n = Number(p.stock || 0);
        const tone = n === 0 ? 'text-danger' : n <= lowThreshold ? 'text-warning' : 'text-neutral';
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              aria-label={`Stok aktif untuk ${p.name}`}
              value={value}
              disabled={st === 'saving'}
              onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
              onBlur={() => commitStock(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') { cancelRef.current.add(p.id); clearDraft(p.id); e.currentTarget.blur(); }
              }}
              className={`w-20 h-8 px-2 rounded-md border text-sm bg-white tabular-nums focus:outline-none focus:border-primary disabled:opacity-60 ${st === 'error' ? 'border-danger' : 'border-divider'} ${tone}`}
            />
            <span className="w-4 h-4 inline-flex">
              {st === 'saving' && <Loader2 className="w-4 h-4 animate-spin text-subdued" aria-hidden="true" />}
              {st === 'saved' && <Check className="w-4 h-4 text-success" aria-hidden="true" />}
              {st === 'error' && <AlertCircle className="w-4 h-4 text-danger" aria-hidden="true" />}
            </span>
          </div>
        );
      },
    },
    {
      key: 'edit', label: 'Ubah', className: 'w-20',
      render: (p) => <Button variant="secondary" size="sm" onClick={() => openAdjust(p.id)} aria-label={`Ubah stok ${p.name}`}>Ubah</Button>,
    },
  ];

  /* ---------- Riwayat ---------- */
  const histRows = useMemo(() => {
    const local = localHistory.filter((h) => !histProduct || h.product_id === histProduct);
    const server = histProduct && serverHist.key === histKey ? serverHist.rows : [];
    return [...local, ...server].sort((a, b) => (parseDate(b.created_at)?.getTime() || 0) - (parseDate(a.created_at)?.getTime() || 0));
  }, [localHistory, histProduct, serverHist, histKey]);
  const histLoading = !!histProduct && serverHist.key !== histKey;
  const histPages = Math.max(1, Math.ceil(histRows.length / histLimit));
  const histSafePage = Math.min(histPage, histPages);
  const histPaged = histRows.slice((histSafePage - 1) * histLimit, histSafePage * histLimit);

  const histColumns = [
    { key: 'created_at', label: 'Waktu', render: (h) => <span className="whitespace-nowrap">{formatDateTime(h.created_at)}</span> },
    {
      key: 'product', label: 'Produk',
      render: (h) => {
        const p = productById.get(h.product_id);
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <ProductThumb product={p} size="sm" />
            <span className="line-clamp-2">{p?.name || 'Produk dihapus'}</span>
          </div>
        );
      },
    },
    {
      key: 'change', label: 'Perubahan',
      render: (h) => {
        const c = Number(h.change || 0);
        return <span className={`tabular-nums ${c > 0 ? 'text-success' : c < 0 ? 'text-danger' : 'text-subdued'}`}>{c > 0 ? `+${c}` : c}</span>;
      },
    },
    { key: 'stock_after', label: 'Stok Akhir', render: (h) => <span className="tabular-nums">{h.stock_after}</span> },
    { key: 'notes', label: 'Catatan', render: (h) => h.notes || <span className="text-subdued">-</span> },
  ];

  const productOptions = items.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div>
      <PageHeader
        title="Stok"
        actions={(
          <>
            <Button
              variant="secondary"
              icon={FileSpreadsheet}
              title="Unduh data stok (CSV, bisa dibuka di Excel)"
              disabled={filtered.length === 0}
              onClick={() => downloadCsv(filtered, currentStore?.name)}
            >
              Unduh / Perbarui (Excel)
            </Button>
            <Button icon={SlidersHorizontal} onClick={() => openAdjust()} disabled={items.length === 0}>Kelola Inventaris</Button>
          </>
        )}
      />

      <div className="mb-4">
        <SegmentedControl
          options={[{ value: 'stock', label: 'Stok' }, { value: 'history', label: 'Riwayat Inventaris' }]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === 'stock' ? (
        <Card padded={false} className="shadow-sm">
          <div className="p-4 pb-3 space-y-3">
            <div className="flex gap-2">
              <label htmlFor="inv-search-field" className="sr-only">Cari berdasarkan</label>
              <Select
                id="inv-search-field"
                value={searchField}
                onChange={(v) => { setSearchField(v); setPage(1); }}
                options={[{ value: 'name', label: 'Produk' }, { value: 'sku', label: 'Kode Varian' }]}
                className="w-40 shrink-0"
              />
              <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder={searchField === 'sku' ? 'Cari kode varian' : 'Cari nama produk'}
                className="[&_input]:h-10"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <FilterChip
                  label="Lokasi"
                  value="default"
                  options={[{ value: 'default', label: currentStore?.name || 'Lokasi utama' }]}
                  onChange={() => {}}
                />
                <FilterChip
                  label="Semua Inventaris"
                  value={stockFilter}
                  options={[
                    { value: 'in', label: 'Ada stok' },
                    { value: 'low', label: `Stok menipis (maks. ${lowThreshold})` },
                    { value: 'out', label: 'Habis' },
                  ]}
                  onChange={(v) => { setStockFilter(v); setPage(1); }}
                />
                <FilterChip
                  label="Kategori"
                  value={categoryFilter}
                  options={categories.map((c) => ({ value: c, label: c }))}
                  onChange={(v) => { setCategoryFilter(v); setPage(1); }}
                />
                {showOosFilter ? (
                  <FilterChip
                    label="Ketika Tidak Ada Stok"
                    value={oosFilter}
                    options={[
                      { value: 'sold_out', label: 'Habis Terjual' },
                      { value: 'backorder', label: 'Terima Pesanan' },
                      { value: 'hidden', label: 'Sembunyikan' },
                    ]}
                    onChange={(v) => { setOosFilter(v); setPage(1); }}
                  />
                ) : (
                  <AddFilterChip onClick={() => setShowOosFilter(true)} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="inv-detail" className="sr-only">Tampilan detail</label>
                <Select
                  id="inv-detail"
                  value={detail}
                  onChange={setDetail}
                  options={[{ value: 'show', label: 'Tampilkan Detail' }, { value: 'hide', label: 'Sembunyikan Detail' }]}
                  className="w-48"
                />
              </div>
            </div>
          </div>
          <DataTable
            columns={stockColumns}
            rows={paged}
            loading={isLoading && items.length === 0}
            emptyText={search || stockFilter || categoryFilter || oosFilter ? 'Produk tidak ditemukan' : 'Belum ada produk'}
            minWidth={detail === 'show' ? 900 : 560}
          />
          <Pagination
            page={safePage}
            limit={limit}
            total={filtered.length}
            onPage={setPage}
            onLimit={(n) => { setLimit(n); setPage(1); }}
          />
          <span className="sr-only" aria-live="polite">{announce}</span>
        </Card>
      ) : (
        <Card padded={false} className="shadow-sm">
          <div className="p-4 pb-3 space-y-3">
            <Select
              id="hist-product"
              label="Produk"
              value={histProduct}
              onChange={(v) => { setHistProduct(v); setHistPage(1); }}
              options={[{ value: '', label: 'Semua produk' }, ...productOptions]}
              className="max-w-sm"
            />
            {!histProduct && (
              <InfoBanner
                tone="primary"
                title="Riwayat per produk"
                description="Pilih produk untuk memuat riwayat inventaris yang tersimpan di server. Perubahan stok yang kamu buat di halaman ini juga langsung tercatat di sini."
              />
            )}
            {histProduct && serverHist.key === histKey && serverHist.error && (
              <p className="text-xs text-danger" role="alert">{serverHist.error}</p>
            )}
          </div>
          <DataTable
            columns={histColumns}
            rows={histPaged}
            loading={histLoading}
            emptyText="Belum ada riwayat inventaris"
            minWidth={760}
          />
          <Pagination
            page={histSafePage}
            limit={histLimit}
            total={histRows.length}
            onPage={setHistPage}
            onLimit={(n) => { setHistLimit(n); setHistPage(1); }}
          />
        </Card>
      )}

      <Modal
        open={!!adjust}
        title="Kelola Inventaris"
        onClose={() => setAdjust(null)}
        width="max-w-md"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setAdjust(null)}>Batal</Button>
            <Button onClick={submitAdjust} disabled={adjust?.saving}>{adjust?.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {adjust && (
          <div className="space-y-4">
            <Select
              id="adj-product"
              label="Produk"
              value={adjust.productId}
              onChange={(v) => setAdjust((a) => ({ ...a, productId: v, error: '' }))}
              options={productOptions}
            />
            <Select
              id="adj-type"
              label="Jenis penyesuaian"
              value={adjust.type}
              onChange={(v) => setAdjust((a) => ({ ...a, type: v, error: '' }))}
              options={ADJUST_TYPES}
            />
            <TextInput
              id="adj-qty"
              label="Jumlah"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={adjust.qty}
              onChange={(e) => setAdjust((a) => ({ ...a, qty: e.target.value, error: '' }))}
            />
            <TextInput
              id="adj-note"
              label="Catatan (opsional)"
              placeholder="Mis. stok opname, barang rusak"
              value={adjust.note}
              onChange={(e) => setAdjust((a) => ({ ...a, note: e.target.value }))}
            />
            <div className="flex items-center justify-between rounded-lg bg-page px-3 py-2 text-sm">
              <span className="text-subdued">Stok saat ini: <span className="text-neutral tabular-nums">{adjCurrent}</span></span>
              <span className="text-subdued">
                Stok baru: <span className={`tabular-nums font-semibold ${adjNext !== null && adjNext < 0 ? 'text-danger' : 'text-neutral'}`}>{adjNext ?? '-'}</span>
              </span>
            </div>
            {adjust.error && <p className="text-xs text-danger" role="alert">{adjust.error}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
