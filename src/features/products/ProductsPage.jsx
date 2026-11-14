import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, FileSpreadsheet, MoreVertical, ExternalLink, ImageIcon, FilePlus2, Upload, ChevronRight, ChevronDown, Trash2, Pencil, Columns3,
} from 'lucide-react';
import { fetchProducts, deleteProduct } from './productsSlice';
import api from '../../utils/api';
import {
  PageHeader, Card, Button, IconButton, Tabs, SearchInput, FilterChip, AddFilterChip, DataTable, Pagination, Modal, formatRp,
} from '../../components/ui';

const MAX_PRODUCTS = 100;
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

  const productCount = totalAll || total;

  const load = () => {
    if (!currentStore) return;
    const params = { page: String(page), limit: String(limit) };
    if (query) params.search = query;
    if (categoryFilter) params.category = categoryFilter;
    if (availFilter) params.status = availFilter;
    if (sort) params.sort = sort;
    dispatch(fetchProducts({ storeId: currentStore.id, params }));
  };

  useEffect(load, [dispatch, currentStore, query, page, limit, categoryFilter, availFilter, sort]);

  const categories = useMemo(
    () => [...new Set([...items.map((p) => p.category).filter(Boolean), categoryFilter].filter(Boolean))].sort(),
    [items, categoryFilter],
  );

  const handleDelete = (id) => {
    if (window.confirm('Hapus produk ini?')) dispatch(deleteProduct({ storeId: currentStore.id, productId: id }));
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

  const pct = Math.min((productCount / MAX_PRODUCTS) * 100, 100);
  const over = productCount > MAX_PRODUCTS;

  return (
    <div>
      <PageHeader
        title="Semua produk"
        actions={(
          <>
            <IconButton icon={MoreVertical} label="Opsi lain" />
            <Button variant="secondary" icon={FileSpreadsheet}>Unduh / Perbarui (Excel)</Button>
            <Button icon={Plus} onClick={() => setShowCreate(true)}>Buat produk</Button>
          </>
        )}
      >
        <div className="flex items-center gap-3 mt-1.5">
          <div className="w-[120px] h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={productCount} aria-valuemax={MAX_PRODUCTS} aria-label="Kuota produk">
            <div className={`h-full rounded-full ${over ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] text-neutral tabular-nums">{productCount} / {MAX_PRODUCTS}</div>
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
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" />
        </div>
      </Modal>
    </div>
  );
}
