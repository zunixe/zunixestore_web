import { useState } from 'react';
import { Plus, PenLine } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, Tabs, SearchInput, DataTable, EmptyState, Modal, TextInput, Select,
} from '../../components/ui';
import { useStoreSetting, newId, formatTanggal } from './useStoreSetting';
import RowMenu from './RowMenu';
import ConfirmModal from './ConfirmModal';
import Notice from './Notice';
import TextArea from './TextArea';

const EMPTY = { title: '', excerpt: '', content: '', status: 'published' };
const TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'published', label: 'Tayang' },
  { value: 'draft', label: 'Draf' },
];

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function BlogPage() {
  // Kunci "blog_posts" juga dibaca storefront (GET /public/.../content?type=blog).
  const posts = useStoreSetting('blog_posts', []);
  const list = Array.isArray(posts.value) ? posts.value : [];
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const rows = list
    .filter((p) => tab === 'all' || p.status === tab)
    .filter((p) => !query || p.title.toLowerCase().includes(query.toLowerCase()));

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form && form.title.trim() && form.content.trim();

  const submit = async (e) => {
    e?.preventDefault();
    if (!valid) return;
    const now = new Date().toISOString();
    const base = { ...form, title: form.title.trim(), slug: slugify(form.title), updated_at: now };
    const next = form.id
      ? list.map((p) => (p.id === form.id ? base : p))
      : [{ ...base, id: newId(), created_at: now }, ...list];
    const ok = await posts.save(next);
    setNotice(ok ? { tone: 'success', text: form.id ? 'Postingan diperbarui.' : 'Postingan dibuat.' } : { tone: 'danger', text: 'Gagal menyimpan postingan.' });
    if (ok) setForm(null);
  };

  const confirmDelete = async () => {
    const ok = await posts.save(list.filter((p) => p.id !== toDelete.id));
    setToDelete(null);
    setNotice(ok ? { tone: 'success', text: 'Postingan dihapus.' } : { tone: 'danger', text: 'Gagal menghapus postingan.' });
  };

  const columns = [
    {
      key: 'title', label: 'Judul', render: (p) => (
        <div className="min-w-0 max-w-md">
          <div className="font-medium text-neutral truncate">{p.title}</div>
          {p.excerpt && <div className="text-xs text-subdued truncate">{p.excerpt}</div>}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (p) => <Badge tone={p.status === 'published' ? 'success' : 'muted'}>{p.status === 'published' ? 'Tayang' : 'Draf'}</Badge> },
    { key: 'created_at', label: 'Dibuat', render: (p) => formatTanggal(p.created_at) },
    {
      key: 'actions', label: <span className="sr-only">Tindakan</span>, className: 'text-right w-40', render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ ...p })}>Ubah</Button>
          <RowMenu label={`Opsi ${p.title}`} items={[{ label: 'Hapus', danger: true, onClick: () => setToDelete(p) }]} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Artikel blog"
        actions={list.length > 0 && <Button icon={Plus} onClick={() => setForm({ ...EMPTY })}>Buat postingan blog</Button>}
      />
      <Notice tone={notice?.tone} onClose={() => setNotice(null)}>{notice?.text}</Notice>
      {posts.error && !notice && <Notice tone="danger">{`Gagal memuat data: ${posts.error}`}</Notice>}

      <Card padded={false}>
        {!posts.loaded ? (
          <DataTable columns={columns} rows={[]} loading />
        ) : list.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title="Tulis blog"
            description="Bagikan wawasan, promosi, dan berita untuk menarik perhatian pembeli."
            action={<Button icon={Plus} onClick={() => setForm({ ...EMPTY })}>Buat postingan blog</Button>}
          />
        ) : (
          <>
            <Tabs tabs={TABS} value={tab} onChange={setTab} className="px-2" />
            <div className="p-4 border-b border-divider">
              <SearchInput value={query} onChange={setQuery} placeholder="Cari judul postingan" />
            </div>
            <DataTable columns={columns} rows={rows} emptyText="Postingan tidak ditemukan" />
          </>
        )}
      </Card>

      <Modal
        open={!!form}
        title={form?.id ? 'Ubah postingan blog' : 'Buat postingan blog'}
        onClose={() => setForm(null)}
        width="max-w-2xl"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit} disabled={!valid || posts.saving}>{posts.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <TextInput id="post-title" label="Judul" value={form.title} onChange={(e) => setField('title', e.target.value)} maxLength={120} autoFocus required />
            <TextInput id="post-excerpt" label="Ringkasan (opsional)" value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} maxLength={200} />
            <TextArea id="post-content" label="Isi postingan" rows={10} value={form.content} onChange={(e) => setField('content', e.target.value)} required />
            <Select
              id="post-status"
              label="Status"
              value={form.status}
              onChange={(v) => setField('status', v)}
              options={[{ value: 'published', label: 'Tayang' }, { value: 'draft', label: 'Draf' }]}
            />
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus postingan?"
        message={toDelete ? `Postingan "${toDelete.title}" akan dihapus.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        busy={posts.saving}
      />
    </div>
  );
}
