import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Star } from 'lucide-react';
import {
  PageHeader, Card, Button, IconButton, Modal, EmptyState, formatRp,
} from '../../components/ui';
import { ProductThumb, SortableList, ProductPicker, SaveStatus } from '../product-preferences/ProductParts';
import { useStoreSetting, useAllProducts } from '../product-preferences/productData';

/* Urutan produk unggulan disimpan di pengaturan toko `featured_products` (array ID produk). */
const EMPTY = [];
const TOP_N = 10;

export default function FeaturedProductsPage() {
  const { items: products, loading: productsLoading } = useAllProducts();
  const { value: stored, save, status, loading } = useStoreSetting('featured_products', EMPTY);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Hanya produk yang masih ada; ID produk yang sudah dihapus terbuang saat simpan berikutnya.
  const featured = useMemo(() => {
    const ids = Array.isArray(stored) ? stored : [];
    return ids.map((id) => productById.get(id)).filter(Boolean);
  }, [stored, productById]);

  const [adding, setAdding] = useState(null);

  const persist = (list) => save(list.map((p) => p.id));

  const remove = (p) => persist(featured.filter((x) => x.id !== p.id));

  const available = products.filter((p) => !featured.some((f) => f.id === p.id));

  const submitAdd = async () => {
    const add = adding.map((id) => productById.get(id)).filter(Boolean);
    const ok = await persist([...featured, ...add]);
    if (ok) setAdding(null);
  };

  const busy = loading || productsLoading;

  return (
    <div>
      <PageHeader
        title="Produk unggulan"
        actions={(
          <>
            <SaveStatus status={status} />
            <Button icon={Plus} onClick={() => setAdding([])} disabled={busy}>Tambah produk unggulan</Button>
          </>
        )}
      />

      <Card>
        {busy && featured.length === 0 ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : featured.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Belum ada produk unggulan"
            description="Pilih produk terbaik untuk ditampilkan di halaman utama toko."
            action={<Button icon={Plus} onClick={() => setAdding([])}>Tambah produk unggulan</Button>}
          />
        ) : (
          <>
            <p className="text-sm text-subdued mb-3">
              Seret untuk mengurutkan. {TOP_N} produk teratas akan ditampilkan di rekomendasi (jika diaktifkan).
            </p>
            <SortableList
              items={featured}
              label="Urutan produk unggulan"
              disabled={status.type === 'saving'}
              getKey={(p) => p.id}
              getLabel={(p) => p.name}
              onReorder={persist}
              renderItem={(p, i) => (
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center text-xs font-medium tabular-nums shrink-0 ${i < TOP_N ? 'text-primary' : 'text-subdued'}`}
                    aria-label={`Posisi ${i + 1}`}
                  >
                    {i + 1}
                  </span>
                  <ProductThumb product={p} />
                  <span className="min-w-0">
                    <Link to={`/products/edit/${p.id}`} className="block text-sm text-neutral hover:text-primary truncate" draggable={false}>{p.name}</Link>
                    <span className="block text-xs text-subdued">
                      {formatRp(p.price)}
                      {i >= TOP_N && ' · Tidak tampil di rekomendasi'}
                    </span>
                  </span>
                </div>
              )}
              renderActions={(p) => (
                <IconButton icon={Trash2} label={`Hapus ${p.name} dari produk unggulan`} onClick={() => remove(p)} className="w-8 h-8 text-danger" />
              )}
            />
          </>
        )}
      </Card>

      <Modal
        open={!!adding}
        title="Tambah produk unggulan"
        onClose={() => setAdding(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setAdding(null)}>Batal</Button>
            <Button onClick={submitAdd} disabled={!adding?.length || status.type === 'saving'}>
              {status.type === 'saving' ? 'Menyimpan...' : `Tambahkan${adding?.length ? ` (${adding.length})` : ''}`}
            </Button>
          </>
        )}
      >
        {adding && (
          <div className="space-y-3">
            <ProductPicker
              products={available}
              selected={adding}
              onChange={setAdding}
              emptyText={products.length === 0 ? 'Belum ada produk di toko' : 'Semua produk sudah menjadi unggulan'}
              showPrice
            />
            {status.type === 'error' && <p className="text-xs text-danger" role="alert">{status.message}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
