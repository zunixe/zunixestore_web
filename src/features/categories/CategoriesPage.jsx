import { useMemo, useState } from 'react';
import { ArrowUpDown, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import {
  PageHeader, Card, Button, IconButton, SearchInput, DataTable, Pagination, Modal, TextInput, Badge,
} from '../../components/ui';
import { ProductThumb, SaveStatus, SortableList } from '../product-preferences/ProductParts';
import { useStoreSetting, useAllProducts, firstImage, newId } from '../product-preferences/productData';

/*
 * Kategori = gabungan kategori yang dipakai produk (kolom products.category)
 * dan kategori yang dibuat di sini (disimpan di pengaturan toko
 * `product_categories` sebagai JSON, termasuk urutannya).
 */
const EMPTY = [];

export default function CategoriesPage() {
  const { items: products, loading: productsLoading, reload, storeId } = useAllProducts();
  const { value: stored, save, status, loading: settingsLoading } = useStoreSetting('product_categories', EMPTY);
  const storedList = useMemo(() => (Array.isArray(stored) ? stored.filter((c) => c && c.name) : []), [stored]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState(null); // { mode: 'create'|'edit', row, name, error, saving }
  const [order, setOrder] = useState(null); // array of rows while reordering
  const [orderSaving, setOrderSaving] = useState(false);

  const byCategory = useMemo(() => {
    const m = new Map();
    products.forEach((p) => {
      if (!p.category) return;
      const e = m.get(p.category) || { count: 0, image: null };
      e.count += 1;
      if (!e.image) e.image = firstImage(p);
      m.set(p.category, e);
    });
    return m;
  }, [products]);

  const rows = useMemo(() => {
    const seen = new Set();
    const list = [];
    storedList.forEach((c) => {
      if (seen.has(c.name)) return;
      seen.add(c.name);
      list.push({ id: c.id, name: c.name, stored: true, created_at: c.created_at });
    });
    [...byCategory.keys()]
      .filter((n) => !seen.has(n))
      .sort((a, b) => a.localeCompare(b, 'id'))
      .forEach((n) => list.push({ id: `p:${n}`, name: n, stored: false }));
    return list.map((c) => ({ ...c, count: byCategory.get(c.name)?.count || 0, image: byCategory.get(c.name)?.image || null }));
  }, [storedList, byCategory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
  }, [rows, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, pages);
  const paged = filtered.slice((safePage - 1) * limit, safePage * limit);

  const toStored = (list) => list.map((r) => ({ id: r.stored ? r.id : newId(), name: r.name, created_at: r.created_at || new Date().toISOString() }));

  /* ---------- Buat / ubah ---------- */
  const submitForm = async () => {
    const name = form.name.trim();
    if (!name) { setForm((f) => ({ ...f, error: 'Nama kategori wajib diisi' })); return; }
    const clash = rows.find((r) => r.name.toLowerCase() === name.toLowerCase() && r.id !== form.row?.id);
    if (clash) { setForm((f) => ({ ...f, error: 'Nama kategori sudah ada' })); return; }
    setForm((f) => ({ ...f, saving: true, error: '' }));

    if (form.mode === 'create') {
      const ok = await save([...toStored(rows), { id: newId(), name, created_at: new Date().toISOString() }]);
      if (ok) setForm(null);
      else setForm((f) => ({ ...f, saving: false, error: 'Gagal menyimpan kategori' }));
      return;
    }

    const old = form.row;
    try {
      // Produk yang memakai nama lama ikut diperbarui lewat API produk.
      const affected = products.filter((p) => p.category === old.name);
      for (const p of affected) {
        await api.put(`/stores/${storeId}/products/${p.id}`, { category: name });
      }
      const ok = await save(toStored(rows.map((r) => (r.id === old.id ? { ...r, name } : r))));
      if (affected.length) reload();
      if (ok) setForm(null);
      else setForm((f) => ({ ...f, saving: false, error: 'Gagal menyimpan kategori' }));
    } catch (err) {
      reload();
      setForm((f) => ({ ...f, saving: false, error: err.message || 'Gagal memperbarui produk' }));
    }
  };

  /* ---------- Hapus (hanya kategori tanpa produk) ---------- */
  const removeIds = async (ids) => {
    const deletable = rows.filter((r) => ids.includes(r.id) && r.count === 0);
    if (deletable.length === 0) return;
    const names = deletable.map((r) => r.name).join(', ');
    if (!window.confirm(`Hapus kategori ${names}?`)) return;
    const del = new Set(deletable.map((r) => r.id));
    const ok = await save(toStored(rows.filter((r) => !del.has(r.id))));
    if (ok) setSelected((s) => s.filter((x) => !del.has(x)));
  };
  const selectedDeletable = rows.filter((r) => selected.includes(r.id) && r.count === 0).length;

  /* ---------- Urutan ---------- */
  const saveOrder = async () => {
    setOrderSaving(true);
    const ok = await save(toStored(order));
    setOrderSaving(false);
    if (ok) setOrder(null);
  };

  const columns = [
    {
      key: 'name', label: 'Nama Kategori',
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[240px]">
          <ProductThumb src={r.image} />
          <button
            type="button"
            onClick={() => setForm({ mode: 'edit', row: r, name: r.name, error: '', saving: false })}
            className="text-[13px] text-left text-neutral underline underline-offset-2 decoration-gray-300 hover:text-primary hover:decoration-primary cursor-pointer"
          >
            {r.name}
          </button>
        </div>
      ),
    },
    { key: 'count', label: 'Produk', render: (r) => <span className="tabular-nums">{r.count}</span> },
    { key: 'condition', label: 'Kondisi', render: () => <Badge tone="muted">Manual</Badge> },
    {
      key: 'actions', label: <span className="sr-only">Aksi</span>, className: 'w-24',
      render: (r) => (
        <div className="flex items-center gap-1">
          <IconButton icon={Pencil} label={`Ubah kategori ${r.name}`} onClick={() => setForm({ mode: 'edit', row: r, name: r.name, error: '', saving: false })} />
          <IconButton
            icon={Trash2}
            label={r.count > 0 ? `Kategori ${r.name} masih dipakai ${r.count} produk` : `Hapus kategori ${r.name}`}
            disabled={r.count > 0}
            onClick={() => removeIds([r.id])}
            className="text-danger disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Semua kategori"
        actions={(
          <>
            <SaveStatus status={status} />
            <Button variant="secondary" icon={ArrowUpDown} onClick={() => setOrder(rows)} disabled={rows.length < 2}>Ubah Urutan</Button>
            <Button icon={Plus} onClick={() => setForm({ mode: 'create', row: null, name: '', error: '', saving: false })}>Buat kategori</Button>
          </>
        )}
      />

      <Card padded={false} className="shadow-sm">
        <div className="p-4 pb-3 space-y-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari" />
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-neutral">{selected.length} dipilih</span>
              <Button variant="secondary" size="sm" icon={Trash2} disabled={selectedDeletable === 0} onClick={() => removeIds(selected)}>
                Hapus ({selectedDeletable})
              </Button>
              {selectedDeletable < selected.length && (
                <span className="text-xs text-subdued">Kategori yang masih dipakai produk tidak bisa dihapus.</span>
              )}
            </div>
          )}
        </div>
        <DataTable
          columns={columns}
          rows={paged}
          loading={(productsLoading || settingsLoading) && rows.length === 0}
          selectable
          selected={selected}
          onSelect={setSelected}
          emptyText={search ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
          minWidth={640}
        />
        <Pagination
          page={safePage}
          limit={limit}
          total={filtered.length}
          label="Items per page:"
          onPage={setPage}
          onLimit={(n) => { setLimit(n); setPage(1); }}
        />
      </Card>

      <Modal
        open={!!form}
        title={form?.mode === 'edit' ? 'Ubah kategori' : 'Buat kategori'}
        onClose={() => setForm(null)}
        width="max-w-md"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submitForm} disabled={form?.saving}>{form?.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <form onSubmit={(e) => { e.preventDefault(); submitForm(); }} className="space-y-3">
            <TextInput
              id="cat-name"
              label="Nama kategori"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, error: '' }))}
              autoFocus
              maxLength={80}
              hint={form.mode === 'edit' && form.row?.count > 0 ? `${form.row.count} produk dengan kategori ini akan ikut diperbarui.` : undefined}
            />
            {form.error && <p className="text-xs text-danger" role="alert">{form.error}</p>}
          </form>
        )}
      </Modal>

      <Modal
        open={!!order}
        title="Ubah urutan kategori"
        onClose={() => setOrder(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setOrder(null)}>Batal</Button>
            <Button onClick={saveOrder} disabled={orderSaving}>{orderSaving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {order && (
          <div className="space-y-3">
            <p className="text-xs text-subdued">Seret atau gunakan tombol panah untuk mengubah urutan kategori di toko.</p>
            <SortableList
              items={order}
              label="Urutan kategori"
              getKey={(r) => r.id}
              getLabel={(r) => r.name}
              onReorder={setOrder}
              renderItem={(r) => (
                <div className="flex items-center gap-3">
                  <ProductThumb src={r.image} size="sm" />
                  <span className="text-sm text-neutral truncate">{r.name}</span>
                  <span className="text-xs text-subdued shrink-0">{r.count} produk</span>
                </div>
              )}
            />
            {status.type === 'error' && <p className="text-xs text-danger" role="alert">{status.message}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
