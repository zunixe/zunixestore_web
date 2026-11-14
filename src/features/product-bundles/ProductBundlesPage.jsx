import { useMemo, useState } from 'react';
import { Plus, Trash2, Boxes } from 'lucide-react';
import {
  PageHeader, Card, Button, IconButton, FilterChip, DataTable, Modal, TextInput, Select, EmptyState, formatRp,
} from '../../components/ui';
import { ThumbStack, ProductPicker, SaveStatus } from '../product-preferences/ProductParts';
import { useStoreSetting, useAllProducts, newId } from '../product-preferences/productData';

/* Bundel disimpan di pengaturan toko `product_bundles` (JSON). */
const EMPTY = [];
const TYPES = [
  { value: 'percent', label: 'Potongan persen' },
  { value: 'amount', label: 'Potongan harga' },
  { value: 'fixed', label: 'Harga bundel tetap' },
];

function describe(b) {
  const v = Number(b.value || 0);
  if (b.type === 'percent') return `Dapatkan Potongan ${v}%`;
  if (b.type === 'amount') return `Dapatkan Potongan ${formatRp(v)}`;
  return `Harga Bundle ${formatRp(v)}`;
}

function bundlePrice(type, value, normal) {
  const v = Number(value || 0);
  if (type === 'percent') return Math.max(0, Math.round(normal * (1 - v / 100)));
  if (type === 'amount') return Math.max(0, normal - v);
  return v;
}

export default function ProductBundlesPage() {
  const { items: products, loading: productsLoading } = useAllProducts();
  const { value: stored, save, status, loading } = useStoreSetting('product_bundles', EMPTY);
  const bundles = useMemo(() => (Array.isArray(stored) ? stored.filter((b) => b && b.id) : []), [stored]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [form, setForm] = useState(null);

  const usedProducts = useMemo(() => {
    const ids = new Set(bundles.flatMap((b) => b.product_ids || []));
    return products.filter((p) => ids.has(p.id));
  }, [bundles, products]);

  const rows = bundles.filter((b) => (!typeFilter || b.type === typeFilter) && (!productFilter || (b.product_ids || []).includes(productFilter)));

  const openForm = (b) => setForm(b
    ? { id: b.id, name: b.name, type: b.type, value: String(b.value ?? ''), product_ids: [...(b.product_ids || [])], error: '', saving: false }
    : { id: null, name: '', type: 'percent', value: '', product_ids: [], error: '', saving: false });

  const normalTotal = form ? form.product_ids.reduce((s, id) => s + Number(productById.get(id)?.price || 0), 0) : 0;

  const submit = async () => {
    const name = form.name.trim();
    const value = Number(form.value);
    if (!name) { setForm((f) => ({ ...f, error: 'Nama bundel wajib diisi' })); return; }
    if (form.product_ids.length < 2) { setForm((f) => ({ ...f, error: 'Pilih minimal 2 produk' })); return; }
    if (form.value === '' || !Number.isFinite(value) || value < 0) { setForm((f) => ({ ...f, error: 'Nilai harga tidak valid' })); return; }
    if (form.type === 'percent' && value > 100) { setForm((f) => ({ ...f, error: 'Potongan persen maksimal 100' })); return; }
    setForm((f) => ({ ...f, saving: true, error: '' }));
    const entry = { id: form.id || newId(), name, type: form.type, value, product_ids: form.product_ids, updated_at: new Date().toISOString() };
    const next = form.id ? bundles.map((b) => (b.id === form.id ? { ...b, ...entry } : b)) : [...bundles, { ...entry, created_at: entry.updated_at }];
    const ok = await save(next);
    if (ok) setForm(null);
    else setForm((f) => ({ ...f, saving: false, error: 'Gagal menyimpan bundel' }));
  };

  const remove = async (b) => {
    if (!window.confirm(`Hapus produk bundel "${b.name}"?`)) return;
    await save(bundles.filter((x) => x.id !== b.id));
  };

  const columns = [
    {
      key: 'name', label: 'Nama',
      render: (b) => (
        <button type="button" onClick={() => openForm(b)} className="text-[13px] text-left text-neutral underline underline-offset-2 decoration-gray-300 hover:text-primary hover:decoration-primary cursor-pointer">
          {b.name}
        </button>
      ),
    },
    { key: 'price', label: 'Harga Bundle Produk', render: (b) => <span className="whitespace-nowrap">{describe(b)}</span> },
    {
      key: 'products', label: 'Produk',
      render: (b) => {
        const list = (b.product_ids || []).map((id) => productById.get(id)).filter(Boolean);
        return list.length ? <ThumbStack products={list} /> : <span className="text-subdued">-</span>;
      },
    },
    {
      key: 'actions', label: <span className="sr-only">Aksi</span>, className: 'w-12',
      render: (b) => <IconButton icon={Trash2} label={`Hapus bundel ${b.name}`} onClick={() => remove(b)} className="text-danger" />,
    },
  ];

  const isEmpty = !loading && bundles.length === 0;

  return (
    <div>
      <PageHeader
        title="Produk bundle"
        actions={(
          <>
            <SaveStatus status={status} />
            <Button icon={Plus} onClick={() => openForm(null)}>Buat produk bundel</Button>
          </>
        )}
      />

      <Card padded={false} className="shadow-sm">
        {isEmpty ? (
          <EmptyState
            icon={Boxes}
            title="Buat produk bundel"
            description="Gabungkan beberapa produk menjadi satu paket dengan harga khusus."
            action={<Button icon={Plus} onClick={() => openForm(null)}>Buat produk bundel</Button>}
          />
        ) : (
          <>
            <div className="p-4 pb-3 flex flex-wrap items-center gap-2">
              <FilterChip label="Tipe Apa Pun" value={typeFilter} options={TYPES} onChange={setTypeFilter} />
              <FilterChip
                label="Semua produk"
                value={productFilter}
                options={usedProducts.map((p) => ({ value: p.id, label: p.name }))}
                onChange={setProductFilter}
              />
            </div>
            <DataTable
              columns={columns}
              rows={rows}
              loading={loading}
              emptyText="Bundel tidak ditemukan"
              minWidth={640}
            />
          </>
        )}
      </Card>

      <Modal
        open={!!form}
        title={form?.id ? 'Ubah produk bundel' : 'Buat produk bundel'}
        onClose={() => setForm(null)}
        width="max-w-xl"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit} disabled={form?.saving}>{form?.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <div className="space-y-4">
            <TextInput
              id="bundle-name"
              label="Nama bundel"
              value={form.name}
              maxLength={100}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, error: '' }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                id="bundle-type"
                label="Tipe harga"
                value={form.type}
                onChange={(v) => setForm((f) => ({ ...f, type: v, error: '' }))}
                options={TYPES}
              />
              <TextInput
                id="bundle-value"
                label={form.type === 'percent' ? 'Potongan' : form.type === 'amount' ? 'Potongan (Rp)' : 'Harga bundel (Rp)'}
                type="number"
                min="0"
                inputMode="numeric"
                suffix={form.type === 'percent' ? '%' : 'Rp'}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value, error: '' }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral">Produk</span>
                <span className="text-xs text-subdued">{form.product_ids.length} dipilih</span>
              </div>
              <ProductPicker
                products={products}
                selected={form.product_ids}
                onChange={(ids) => setForm((f) => ({ ...f, product_ids: ids, error: '' }))}
                emptyText={productsLoading ? 'Memuat produk...' : 'Produk tidak ditemukan'}
                showPrice
              />
            </div>
            {form.product_ids.length > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-page px-3 py-2 text-sm">
                <span className="text-subdued">Harga normal: <span className="text-neutral tabular-nums">{formatRp(normalTotal)}</span></span>
                <span className="text-subdued">Harga bundel: <span className="text-neutral font-semibold tabular-nums">{formatRp(bundlePrice(form.type, form.value, normalTotal))}</span></span>
              </div>
            )}
            {form.error && <p className="text-xs text-danger" role="alert">{form.error}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
