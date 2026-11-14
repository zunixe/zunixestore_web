import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Star } from 'lucide-react';
import {
  PageHeader, Card, Button, DataTable, Modal, TextInput, Select,
} from '../../components/ui';
import api from '../../utils/api';
import { useStoreSetting, newId } from './useStoreSetting';
import ConfirmModal from './ConfirmModal';
import Notice from './Notice';
import TextArea from './TextArea';

const EMPTY = { title: '', customer: '', productId: '', content: '', rating: '5' };

function Stars({ value }) {
  const n = Number(value) || 0;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function TestimonialsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const testimonials = useStoreSetting('testimonials', []);
  const list = Array.isArray(testimonials.value) ? testimonials.value : [];
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/products?limit=200`)
      .then((res) => { if (!cancelled) setProducts(res.data?.items || []); })
      .catch(() => { if (!cancelled) setProducts([]); });
    return () => { cancelled = true; };
  }, [storeId]);

  const productName = (t) => products.find((p) => p.id === t.productId)?.name || t.productName || '-';
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form && form.title.trim() && form.content.trim();

  const submit = async (e) => {
    e?.preventDefault();
    if (!valid) return;
    const now = new Date().toISOString();
    const item = {
      ...form,
      title: form.title.trim(),
      productName: products.find((p) => p.id === form.productId)?.name || '',
      updated_at: now,
    };
    const next = form.id
      ? list.map((t) => (t.id === form.id ? item : t))
      : [{ ...item, id: newId(), created_at: now }, ...list];
    const ok = await testimonials.save(next);
    setNotice(ok ? { tone: 'success', text: form.id ? 'Testimoni diperbarui.' : 'Testimoni dibuat.' } : { tone: 'danger', text: 'Gagal menyimpan testimoni.' });
    if (ok) setForm(null);
  };

  const confirmDelete = async () => {
    const ok = await testimonials.save(list.filter((t) => t.id !== toDelete.id));
    setToDelete(null);
    setNotice(ok ? { tone: 'success', text: 'Testimoni dihapus.' } : { tone: 'danger', text: 'Gagal menghapus testimoni.' });
  };

  const columns = [
    {
      key: 'title', label: 'Judul', render: (t) => (
        <div className="min-w-0 max-w-md">
          <div className="font-medium text-neutral truncate">{t.title}</div>
          <div className="flex items-center gap-2 text-xs text-subdued mt-0.5">
            <Stars value={t.rating} />
            {t.customer && <span className="truncate">oleh {t.customer}</span>}
          </div>
        </div>
      ),
    },
    { key: 'product', label: 'Produk', render: productName },
    {
      key: 'actions', label: 'Tindakan', className: 'w-44', render: (t) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ ...EMPTY, ...t })}>Ubah</Button>
          <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-surface" onClick={() => setToDelete(t)}>Hapus</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Testimoni" actions={<Button icon={Plus} onClick={() => setForm({ ...EMPTY })}>Buat testimoni</Button>} />
      <Notice tone={notice?.tone} onClose={() => setNotice(null)}>{notice?.text}</Notice>
      {testimonials.error && !notice && <Notice tone="danger">{`Gagal memuat data: ${testimonials.error}`}</Notice>}

      <Card padded={false}>
        <DataTable columns={columns} rows={list} loading={!testimonials.loaded} emptyText="Belum ada data" />
      </Card>

      <Modal
        open={!!form}
        title={form?.id ? 'Ubah testimoni' : 'Buat testimoni'}
        onClose={() => setForm(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit} disabled={!valid || testimonials.saving}>{testimonials.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <TextInput id="testi-title" label="Judul" value={form.title} onChange={(e) => setField('title', e.target.value)} maxLength={100} autoFocus required />
            <TextInput id="testi-customer" label="Nama customer" value={form.customer} onChange={(e) => setField('customer', e.target.value)} maxLength={60} />
            <Select
              id="testi-product"
              label="Produk"
              value={form.productId}
              onChange={(v) => setField('productId', v)}
              options={[{ value: '', label: 'Tanpa produk' }, ...products.map((p) => ({ value: p.id, label: p.name }))]}
            />
            <Select
              id="testi-rating"
              label="Rating"
              value={String(form.rating)}
              onChange={(v) => setField('rating', v)}
              options={['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: `${v} bintang` }))}
            />
            <TextArea id="testi-content" label="Isi testimoni" rows={5} value={form.content} onChange={(e) => setField('content', e.target.value)} required />
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus testimoni?"
        message={toDelete ? `Testimoni "${toDelete.title}" akan dihapus.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        busy={testimonials.saving}
      />
    </div>
  );
}
