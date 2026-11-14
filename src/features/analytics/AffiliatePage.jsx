import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Link2, Copy, Check } from 'lucide-react';
import {
  PageHeader, Card, Button, DataTable, EmptyState, Modal, TextInput, IconButton,
} from '../../components/ui';
import { useStoreSetting, newId, formatTanggal } from '../store-design/useStoreSetting';
import RowMenu from '../store-design/RowMenu';
import ConfirmModal from '../store-design/ConfirmModal';

/* Tautan afiliasi disimpan di store_settings "affiliate_links". Klik belum dilacak backend. */

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function storeUrlOf(store) {
  const host = store?.domain || (store?.slug ? `${store.slug}.zunixe.com` : '');
  return host ? `https://${host}` : '';
}

function validUrl(s) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}

function buildTrackingUrl(target, name, code) {
  if (!validUrl(target)) return '';
  const u = new URL(target);
  u.searchParams.set('ref', code);
  u.searchParams.set('utm_source', 'affiliate');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', slugify(name) || code);
  return u.toString();
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard tidak tersedia */ }
  };
  return <IconButton icon={copied ? Check : Copy} label={copied ? 'Tersalin' : label} onClick={copy} disabled={!text} className={copied ? 'text-success' : ''} />;
}

export default function AffiliatePage() {
  const { currentStore } = useSelector((s) => s.stores);
  const links = useStoreSetting('affiliate_links', []);
  const list = Array.isArray(links.value) ? links.value : [];
  const [form, setForm] = useState(null);
  const [learnOpen, setLearnOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState(null);

  const openNew = () => setForm({ name: '', target: storeUrlOf(currentStore), code: newId().slice(-6) });
  const tracking = form ? buildTrackingUrl(form.target.trim(), form.name, form.code) : '';
  const valid = form && form.name.trim() && tracking;

  const submit = async (e) => {
    e?.preventDefault();
    if (!valid) return;
    const ok = await links.save([{ id: newId(), name: form.name.trim(), target: form.target.trim(), code: form.code, url: tracking, created_at: new Date().toISOString() }, ...list]);
    if (ok) { setForm(null); setError(null); } else setError('Gagal menyimpan tautan afiliasi.');
  };

  const confirmDelete = async () => {
    const ok = await links.save(list.filter((l) => l.id !== toDelete.id));
    setToDelete(null);
    if (!ok) setError('Gagal menghapus tautan.');
  };

  const columns = [
    { key: 'name', label: 'Nama kampanye', render: (l) => <span className="font-medium">{l.name}</span> },
    {
      key: 'url', label: 'Tautan pelacakan', render: (l) => (
        <div className="flex items-center gap-1 max-w-md">
          <span className="truncate text-subdued" title={l.url}>{l.url}</span>
          <CopyButton text={l.url} label={`Salin tautan ${l.name}`} />
        </div>
      ),
    },
    { key: 'code', label: 'Kode', render: (l) => <code className="text-xs">{l.code}</code> },
    { key: 'created_at', label: 'Dibuat', render: (l) => formatTanggal(l.created_at) },
    {
      key: 'actions', label: <span className="sr-only">Tindakan</span>, className: 'w-14', render: (l) => (
        <RowMenu label={`Opsi ${l.name}`} items={[{ label: 'Hapus', danger: true, onClick: () => setToDelete(l) }]} />
      ),
    },
  ];

  const learnLink = (
    <button type="button" onClick={() => setLearnOpen(true)} className="text-sm text-primary hover:underline cursor-pointer">Pelajari lebih lanjut</button>
  );

  return (
    <div>
      <PageHeader
        title="Kampanye Afiliasi"
        actions={list.length > 0 && <Button icon={Plus} onClick={openNew}>Buat Tautan Afiliasi</Button>}
      />
      {(error || links.error) && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm mb-4 bg-danger-surface text-danger">{error || `Gagal memuat data: ${links.error}`}</div>
      )}

      <Card padded={false}>
        {!links.loaded ? (
          <DataTable columns={columns} rows={[]} loading />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="Kampanye Afiliasi"
            description="Lihat performa kampanye Anda"
            action={(
              <div className="flex flex-col items-center gap-3">
                <Button icon={Plus} onClick={openNew}>Buat Tautan Afiliasi</Button>
                {learnLink}
              </div>
            )}
          />
        ) : (
          <>
            <DataTable columns={columns} rows={list} />
            <div className="px-4 py-3 border-t border-divider flex justify-between items-center gap-3 flex-wrap">
              <span className="text-xs text-subdued">Pelacakan klik dan konversi akan tampil setelah tersedia.</span>
              {learnLink}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!form}
        title="Buat Tautan Afiliasi"
        onClose={() => setForm(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit} disabled={!valid || links.saving}>{links.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <TextInput id="aff-name" label="Nama kampanye" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Promo Influencer Desember" maxLength={80} autoFocus />
            <TextInput
              id="aff-target"
              label="URL tujuan"
              type="url"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              placeholder="https://"
              hint={form.target && !validUrl(form.target.trim()) ? 'Masukkan URL lengkap yang diawali http:// atau https://' : 'Halaman toko yang dituju saat tautan diklik.'}
            />
            <div>
              <span className="block text-sm font-medium text-neutral mb-1.5" id="aff-url-label">Tautan pelacakan</span>
              <div className="flex items-center gap-2 rounded-md border border-divider bg-page px-3 h-10" aria-labelledby="aff-url-label">
                <span className="flex-1 truncate text-sm text-neutral">{tracking || <span className="text-subdued">Isi nama dan URL tujuan</span>}</span>
                <CopyButton text={tracking} label="Salin tautan pelacakan" />
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={learnOpen} title="Tentang Kampanye Afiliasi" onClose={() => setLearnOpen(false)} footer={<Button onClick={() => setLearnOpen(false)}>Mengerti</Button>}>
        <div className="space-y-2 text-sm text-neutral">
          <p>Tautan afiliasi membantu Anda mengetahui pembeli yang datang dari mitra, influencer, atau kampanye tertentu.</p>
          <p>Setiap tautan berisi kode unik dan parameter UTM, sehingga kunjungan dari tautan tersebut bisa dibedakan di alat analitik seperti Google Analytics.</p>
          <p className="text-subdued">Bagikan tautan pelacakan kepada mitra Anda, lalu pantau hasilnya di Statistik Toko atau alat pemantauan yang terhubung.</p>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus tautan?"
        message={toDelete ? `Tautan "${toDelete.name}" akan dihapus. Tautan yang sudah dibagikan tetap mengarah ke URL tujuan.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        busy={links.saving}
      />
    </div>
  );
}
