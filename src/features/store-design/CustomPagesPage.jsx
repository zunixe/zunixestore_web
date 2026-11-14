import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, DataTable, EmptyState, Modal, TextInput, Toggle,
} from '../../components/ui';
import { useStoreSetting, newId, formatTanggal } from './useStoreSetting';
import RowMenu from './RowMenu';
import ConfirmModal from './ConfirmModal';
import Notice from './Notice';
import TextArea from './TextArea';

const EMPTY = { title: '', slug: '', content: '', published: true };

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function CustomPagesPage() {
  const pages = useStoreSetting('custom_pages', []);
  const list = Array.isArray(pages.value) ? pages.value : [];
  const [form, setForm] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const openNew = () => { setForm({ ...EMPTY }); setSlugTouched(false); };
  const openEdit = (p) => { setForm({ ...p }); setSlugTouched(true); };

  const setField = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === 'title' && !slugTouched) next.slug = slugify(v);
    return next;
  });

  const valid = form && form.title.trim() && form.slug.trim();
  const slugTaken = form && list.some((p) => p.slug === form.slug && p.id !== form.id);

  const submit = async (e) => {
    e?.preventDefault();
    if (!valid || slugTaken) return;
    const now = new Date().toISOString();
    const item = { ...form, title: form.title.trim(), slug: slugify(form.slug), updated_at: now };
    const next = form.id
      ? list.map((p) => (p.id === form.id ? item : p))
      : [{ ...item, id: newId(), created_at: now }, ...list];
    const ok = await pages.save(next);
    setNotice(ok ? { tone: 'success', text: form.id ? 'Halaman diperbarui.' : 'Halaman dibuat.' } : { tone: 'danger', text: 'Gagal menyimpan halaman.' });
    if (ok) setForm(null);
  };

  const confirmDelete = async () => {
    const ok = await pages.save(list.filter((p) => p.id !== toDelete.id));
    setToDelete(null);
    setNotice(ok ? { tone: 'success', text: 'Halaman dihapus.' } : { tone: 'danger', text: 'Gagal menghapus halaman.' });
  };

  const togglePublish = (p) => pages.save(list.map((x) => (x.id === p.id ? { ...x, published: !x.published, updated_at: new Date().toISOString() } : x)));

  const columns = [
    {
      key: 'title', label: 'Judul', render: (p) => (
        <div className="min-w-0">
          <div className="font-medium text-neutral">{p.title}</div>
          <div className="text-xs text-subdued">/pages/{p.slug}</div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (p) => <Badge tone={p.published ? 'success' : 'muted'}>{p.published ? 'Tayang' : 'Draf'}</Badge> },
    { key: 'updated_at', label: 'Diperbarui', render: (p) => formatTanggal(p.updated_at || p.created_at) },
    {
      key: 'actions', label: <span className="sr-only">Tindakan</span>, className: 'text-right w-40', render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Ubah</Button>
          <RowMenu
            label={`Opsi ${p.title}`}
            items={[
              { label: p.published ? 'Jadikan draf' : 'Tayangkan', onClick: () => togglePublish(p) },
              { label: 'Hapus', danger: true, onClick: () => setToDelete(p) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Halaman Kustom"
        actions={list.length > 0 && <Button icon={Plus} onClick={openNew}>Tambah halaman</Button>}
      />
      <Notice tone={notice?.tone} onClose={() => setNotice(null)}>{notice?.text}</Notice>
      {pages.error && !notice && <Notice tone="danger">{`Gagal memuat data: ${pages.error}`}</Notice>}

      <Card padded={false}>
        {!pages.loaded ? (
          <DataTable columns={columns} rows={[]} loading />
        ) : list.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Buat halaman tambahan untuk toko Anda"
            description="Tambahkan halaman untuk FAQ, kebijakan, promosi, dan lainnya."
            action={<Button icon={Plus} onClick={openNew}>Tambah halaman</Button>}
          />
        ) : (
          <DataTable columns={columns} rows={list} />
        )}
      </Card>

      <Modal
        open={!!form}
        title={form?.id ? 'Ubah halaman' : 'Tambah halaman'}
        onClose={() => setForm(null)}
        width="max-w-2xl"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit} disabled={!valid || slugTaken || pages.saving}>{pages.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <TextInput id="page-title" label="Judul halaman" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="mis. Kebijakan Pengembalian" maxLength={100} autoFocus required />
            <TextInput
              id="page-slug"
              label="URL halaman"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); setField('slug', e.target.value); }}
              hint={slugTaken ? 'URL ini sudah dipakai halaman lain.' : `/pages/${slugify(form.slug) || '...'}`}
              required
            />
            <TextArea id="page-content" label="Konten" rows={8} value={form.content} onChange={(e) => setField('content', e.target.value)} placeholder="Tulis isi halaman..." />
            <Toggle label="Tayangkan halaman" description="Halaman yang tidak ditayangkan disimpan sebagai draf." checked={form.published} onChange={(v) => setField('published', v)} />
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus halaman?"
        message={toDelete ? `Halaman "${toDelete.title}" akan dihapus dari toko Anda.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        busy={pages.saving}
      />
    </div>
  );
}
