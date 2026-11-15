import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, FileSpreadsheet, MoreVertical, ExternalLink, ImageIcon, FilePlus2, Upload, ChevronRight, ChevronDown, Trash2, Pencil, Columns3,
} from 'lucide-react';
import { fetchProducts, deleteProduct } from './productsSlice';
import { fetchUsage } from '../subscriptions/subscriptionSlice';
import api from '../../utils/api';
import {
  PageHeader, Card, Button, IconButton, Tabs, SearchInput, FilterChip, AddFilterChip, DataTable, Pagination, Modal, formatRp,
} from '../../components/ui';

const DEFAULT_MAX_PRODUCTS = 30;

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i += 1; } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',' || c === ';') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cur); rows.push(row); row = []; cur = '';
    } else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const CSV_HEADERS = ['sku', 'name', 'price', 'stock', 'category', 'status'];
const AVAILABILITY = [
  { value: 'stock', label: 'Gunakan Stok' },
  { value: 'always', label: 'Selalu Tersedia' },
  { value: 'preorder', label: 'Pre-order' },
];

function firstImage(p) {
  try { return JSON.parse(p.image_urls || '[]')[0]; } catch { return null; }
}
function extractAvailability(desc) {
  try { return JSON.parse(desc || '{}').availability || 'stock'; } catch { return 'stock'; }
}

function AvailabilityMenu({ value, onChange, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const label = AVAILABILITY.find((a) => a.value === value)?.label || 'Gunakan Stok';
  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full border border-divider px-3 py-0.5 text-[13px] text-neutral bg-white hover:border-primary cursor-pointer"
      >
        {label} <ChevronDown className="w-3.5 h-3.5 text-subdued" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white border border-divider rounded-lg shadow-lg z-20 py-1 min-w-[170px]">
          {AVAILABILITY.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => { onChange(a.value); setOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${value === a.value ? 'text-primary font-medium' : 'text-neutral'}`}
            >
              {a.label}
            </button>
          ))}
          <div className="border-t border-divider my-1" />
          <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-neutral hover:bg-gray-50 cursor-pointer">
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Ubah produk
          </button>
          <button type="button" onClick={() => { setOpen(false); onDelete(); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger-surface cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Hapus
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, total_all: totalAll, isLoading } = useSelector((s) => s.products);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState('');
  const fileRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const productCount = totalAll || total;
  const usage = useSelector((s) => s.subscriptions?.usage);
  const maxProducts = usage?.usage?.products?.limit ?? DEFAULT_MAX_PRODUCTS;

  const load = () => {
    if (!currentStore) return;
    const params = { page: String(page), limit: String(limit) };
    if (query) params.search = query;
    if (categoryFilter) params.category = categoryFilter;
    if (availFilter) params.status = availFilter;
    if (sort) params.sort = sort;
    dispatch(fetchProducts({ storeId: currentStore.id, params }));
    dispatch(fetchUsage(currentStore.id));
  };

  useEffect(load, [dispatch, currentStore, query, page, limit, categoryFilter, availFilter, sort]);

  const categories = useMemo(
    () => [...new Set([...items.map((p) => p.category).filter(Boolean), categoryFilter].filter(Boolean))].sort(),
    [items, categoryFilter],
  );

  const handleDelete = (id) => {
    if (window.confirm('Hapus produk ini?')) dispatch(deleteProduct({ storeId: currentStore.id, productId: id }));
  };

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [CSV_HEADERS, ...items.map((p) => [p.sku || '', p.name, p.price, p.stock, p.category || '', p.status || 'published'])];
    const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `produk-${currentStore?.slug || 'toko'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importCsv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentStore) return;
    setShowCreate(false);
    setImportStatus({ type: 'saving', message: 'Mengimpor produk…' });
    try {
      const rows = parseCsv(await file.text());
      const header = rows.shift()?.map((h) => h.trim().toLowerCase()) || [];
      if (!header.includes('name')) throw new Error('Format tidak dikenal — butuh kolom "name"');
      const idx = (k) => header.indexOf(k);
      let created = 0;
      let failed = 0;
      let lastErr = '';
      for (const r of rows) {
        const name = (idx('name') >= 0 ? r[idx('name')] : r[0])?.trim();
        const price = Number(idx('price') >= 0 ? r[idx('price')] : 0) || 0;
        if (!name) { failed += 1; continue; }
        try {
          await api.post(`/stores/${currentStore.id}/products`, {
            name,
            price,
            sku: idx('sku') >= 0 ? r[idx('sku')].trim() : undefined,
            stock: Number(idx('stock') >= 0 ? r[idx('stock')] : 0) || 0,
            category: idx('category') >= 0 ? r[idx('category')].trim() : undefined,
            status: idx('status') >= 0 ? r[idx('status')].trim() : undefined,
          });
          created += 1;
        } catch (err) { failed += 1; lastErr = err.message || ''; }
      }
      setImportStatus({ type: created ? 'saved' : 'error', message: `Impor selesai: ${created} produk ditambahkan${failed ? `, ${failed} gagal${lastErr ? ` (${lastErr})` : ''}` : ''}` });
      setPage(1);
      load();
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message || 'Gagal membaca file' });
    }
  };

  const handleAvailability = async (productId, availability) => {
    try {
      await api.put(`/stores/${currentStore.id}/products/${productId}/availability`, { availability });
      load();
    } catch { /* biarkan tampilan lama */ }
  };

  const columns = [
    {
      key: 'name', label: 'Nama', sortable: true,
      render: (p) => {
        const img = firstImage(p);
        return (
          <div className="flex items-center gap-3 min-w-[280px]">
            {img
              ? <img src={img} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0" />
              : <span className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="w-4 h-4 text-gray-400" aria-hidden="true" /></span>}
            <Link to={`/products/edit/${p.id}`} className="text-[13px] text-neutral underline underline-offset-2 decoration-gray-300 hover:text-primary hover:decoration-primary line-clamp-2">
              {p.name}
            </Link>
            <ExternalLink className="w-3.5 h-3.5 text-subdued shrink-0" aria-hidden="true" />
          </div>
        );
      },
    },
    { key: 'category', label: 'Kategori', render: (p) => p.category || '' },
    {
      key: 'stock', label: 'Inventaris',
      render: (p) => {
        const s = Number(p.stock || 0);
        return (
          <span className={`whitespace-nowrap ${s === 0 ? 'text-danger' : s <= 10 ? 'text-warning' : 'text-neutral'}`}>
            {s.toLocaleString('en-US')} {s === 0 ? 'habis' : 'ada stok'}
          </span>
        );
      },
    },
    { key: 'price', label: 'Harga', render: (p) => <span className="whitespace-nowrap">{formatRp(p.price)}</span> },
    {
      key: 'availability', label: 'Ketersediaan Produk',
      render: (p) => (
        <AvailabilityMenu
          value={extractAvailability(p.description)}
          onChange={(v) => handleAvailability(p.id, v)}
          onDelete={() => handleDelete(p.id)}
          onEdit={() => navigate(`/products/edit/${p.id}`)}
        />
      ),
    },
    { key: 'edit', label: <Columns3 className="w-4 h-4 text-subdued" aria-label="Atur kolom" />, className: 'w-10', render: () => null },
  ];

  const pct = maxProducts === null ? 100 : Math.min((productCount / maxProducts) * 100, 100);
  const over = maxProducts !== null && productCount > maxProducts;

  return (
    <div>
      <PageHeader
        title="Semua produk"
        actions={(
          <>
            <IconButton icon={MoreVertical} label="Opsi lain" />
            <Button variant="secondary" icon={FileSpreadsheet} onClick={exportCsv}>Unduh / Perbarui (Excel)</Button>
            <Button icon={Plus} onClick={() => setShowCreate(true)}>Buat produk</Button>
          </>
        )}
      >
        <div className="flex items-center gap-3 mt-1.5">
          <div className="w-[120px] h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={productCount} aria-valuemax={maxProducts ?? 0} aria-label="Kuota produk">
            <div className={`h-full rounded-full ${over ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] text-neutral tabular-nums">{productCount} / {maxProducts === null ? '∞' : maxProducts}</div>
            <Link to="/subscription" className="text-[11px] text-primary hover:underline">Tambah Limit</Link>
          </div>
        </div>
      </PageHeader>

      <Card padded={false} className="shadow-sm">
        <Tabs tabs={['Semua']} value="Semua" className="px-2" />
        <div className="p-4 pb-3 space-y-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            onSubmit={() => { setQuery(search); setPage(1); }}
            placeholder="Nama atau Kode Produk"
          />
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="Kategori"
              value={categoryFilter}
              options={categories.map((c) => ({ value: c, label: c }))}
              onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            />
            <FilterChip
              label="Ketersediaan Apa Pun"
              value={availFilter}
              options={[{ value: 'active', label: 'Aktif' }, { value: 'published', label: 'Tersedia' }, { value: 'draft', label: 'Draft' }]}
              onChange={(v) => { setAvailFilter(v); setPage(1); }}
            />
            <AddFilterChip />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={items}
          loading={isLoading}
          selectable
          selected={selected}
          onSelect={setSelected}
          sort={sort ? { key: 'name' } : undefined}
          onSort={() => { setSort(sort === 'name_asc' ? 'name_desc' : 'name_asc'); setPage(1); }}
          emptyText={query || categoryFilter || availFilter ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          minWidth={900}
        />
        <Pagination
          page={page}
          limit={limit}
          total={total}
          label="Items per page:"
          onPage={setPage}
          onLimit={(n) => { setLimit(n); setPage(1); }}
        />
      </Card>

      <Modal open={showCreate} title="Tambah Produk Baru" onClose={() => setShowCreate(false)} width="max-w-md">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => { setShowCreate(false); navigate('/products/add'); }}
            className="flex items-center gap-4 w-full p-4 border border-divider rounded-xl text-left hover:border-primary hover:bg-primary-surface/40 cursor-pointer"
          >
            <span className="w-10 h-10 rounded-lg bg-primary-surface flex items-center justify-center"><FilePlus2 className="w-5 h-5 text-primary" aria-hidden="true" /></span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-neutral">Tambah Manual</span>
              <span className="block text-xs text-subdued">Input data produk satu per satu secara manual</span>
            </span>
            <ChevronRight className="w-4 h-4 text-subdued" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-4 w-full p-4 border border-divider rounded-xl text-left hover:border-primary hover:bg-primary-surface/40 cursor-pointer"
          >
            <span className="w-10 h-10 rounded-lg bg-success-surface flex items-center justify-center"><Upload className="w-5 h-5 text-success" aria-hidden="true" /></span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-neutral">Upload dari Excel</span>
              <span className="block text-xs text-subdued">Import produk menggunakan file Excel</span>
            </span>
            <ChevronRight className="w-4 h-4 text-subdued" aria-hidden="true" />
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCsv} />
        </div>
      </Modal>
      {importStatus?.message && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm shadow-lg ${importStatus.type === 'error' ? 'bg-danger text-white' : 'bg-neutral text-white'}`}>
          {importStatus.message}
        </div>
      )}
    </div>
  );
}
