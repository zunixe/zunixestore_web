import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Film, Copy, Check } from 'lucide-react';
import {
  PageHeader, Card, Button, Tabs, DataTable, Pagination, IconButton,
} from '../../components/ui';
import { useStoreSetting, newId, formatTanggal } from './useStoreSetting';
import { uploadFile, fileUrl } from './upload';
import RowMenu from './RowMenu';
import ConfirmModal from './ConfirmModal';
import Notice from './Notice';

const TABS = [
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
];
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';
const MAX_SIZE = 20 * 1024 * 1024;

function extOf(name = '') {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : '-';
}

export default function MediaGalleryPage() {
  const media = useStoreSetting('media_gallery', []);
  const list = Array.isArray(media.value) ? media.value : [];
  const inputRef = useRef(null);
  const [tab, setTab] = useState('image');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filtered = list.filter((m) => m.type === tab);
  const rows = filtered.slice((page - 1) * limit, page * limit);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setNotice(null);
    const added = [];
    const failed = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) { failed.push(`${file.name} (maks. 20 MB)`); continue; }
      try {
        const res = await uploadFile(file);
        added.push({
          id: newId(),
          name: file.name,
          url: res.url,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          size: file.size,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        failed.push(`${file.name}: ${err.message}`);
      }
    }
    let ok = true;
    if (added.length > 0) ok = await media.save([...added, ...list]);
    setUploading(false);
    if (added.length > 0) {
      setTab(added[0].type);
      setPage(1);
    }
    if (failed.length > 0 || !ok) {
      setNotice({ tone: 'danger', text: !ok ? 'File terunggah, tetapi daftar galeri gagal disimpan.' : `Gagal mengunggah ${failed.join(', ')}` });
    } else {
      setNotice({ tone: 'success', text: `${added.length} file berhasil diunggah.` });
    }
  };

  const copyUrl = async (m) => {
    try {
      await navigator.clipboard.writeText(fileUrl(m.url));
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((id) => (id === m.id ? null : id)), 1500);
    } catch {
      setNotice({ tone: 'danger', text: 'Tidak dapat menyalin URL.' });
    }
  };

  const confirmDelete = async () => {
    const ok = await media.save(list.filter((m) => m.id !== toDelete.id));
    setToDelete(null);
    setNotice(ok ? { tone: 'success', text: 'Media dihapus dari galeri.' } : { tone: 'danger', text: 'Gagal menghapus media.' });
  };

  const columns = [
    {
      key: 'thumb', label: <span className="sr-only">Pratinjau</span>, className: 'w-20', render: (m) => (
        <div className="w-12 h-12 rounded-md border border-divider bg-gray-50 overflow-hidden flex items-center justify-center">
          {m.type === 'image'
            ? <img src={fileUrl(m.url)} alt="" className="w-full h-full object-cover" loading="lazy" />
            : <Film className="w-5 h-5 text-subdued" aria-hidden="true" />}
        </div>
      ),
    },
    { key: 'name', label: 'Nama', render: (m) => <span className="block max-w-xs truncate" title={m.name}>{m.name}</span> },
    { key: 'type', label: 'Tipe', render: (m) => extOf(m.name) },
    { key: 'created_at', label: 'Dibuat', render: (m) => formatTanggal(m.created_at) },
    {
      key: 'actions', label: <span className="sr-only">Tindakan</span>, className: 'text-right w-28', render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton icon={copiedId === m.id ? Check : Copy} label={copiedId === m.id ? 'URL tersalin' : `Salin URL ${m.name}`} onClick={() => copyUrl(m)} />
          <RowMenu
            label={`Opsi ${m.name}`}
            items={[
              { label: 'Buka file', onClick: () => window.open(fileUrl(m.url), '_blank', 'noopener') },
              { label: 'Hapus', danger: true, onClick: () => setToDelete(m) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Galeri Media"
        actions={(
          <>
            <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={onFiles} aria-label="Pilih file media" />
            <Button icon={Upload} onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Mengunggah...' : 'Unggah media'}
            </Button>
          </>
        )}
      />
      <Notice tone={notice?.tone} onClose={() => setNotice(null)}>{notice?.text}</Notice>
      {media.error && !notice && <Notice tone="danger">{`Gagal memuat data: ${media.error}`}</Notice>}

      <Card padded={false}>
        <Tabs tabs={TABS} value={tab} onChange={(v) => { setTab(v); setPage(1); }} className="px-2" />
        <DataTable
          columns={columns}
          rows={rows}
          loading={!media.loaded}
          emptyText={(
            <span className="inline-flex flex-col items-center gap-1">
              <span>{tab === 'image' ? 'Belum ada gambar' : 'Belum ada video'}</span>
              <span className="text-xs inline-flex items-center gap-1">
                {tab === 'image' ? <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" /> : <Film className="w-3.5 h-3.5" aria-hidden="true" />}
                JPG, PNG, GIF, WEBP, MP4, WEBM, MOV hingga 20 MB
              </span>
            </span>
          )}
        />
        <Pagination
          page={page}
          limit={limit}
          total={filtered.length}
          onPage={setPage}
          onLimit={(n) => { setLimit(n); setPage(1); }}
          label="Items per page"
        />
      </Card>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus media?"
        message={toDelete ? `"${toDelete.name}" akan dihapus dari galeri. Halaman yang masih memakai file ini mungkin tidak menampilkannya lagi.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        busy={media.saving}
      />
    </div>
  );
}
