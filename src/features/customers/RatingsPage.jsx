import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { Download, Settings, Star, MessageSquareText, User } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, InfoBanner, FilterChip, EmptyState, Modal, Toggle,
} from '../../components/ui';
import { formatDate } from '../../utils/formatters';
import { useStoreSetting } from './useStoreSetting';
import { usePlan } from '../subscriptions/usePlan';
import { TextArea, SaveStatus } from './CustomerParts';

/*
 * Backend belum menyediakan endpoint ulasan, jadi daftar ulasan kosong.
 * Bentuk data yang diharapkan bila nanti tersedia:
 * { id, productId, productName, customerName, rating (1-5), text, createdAt,
 *   aspects?: { quality, service, shipping, price }, reply? }
 */
// Ulasan dimuat dari GET /stores/:id/reviews (backend tabel `reviews`).

const REVIEW_SETTINGS_KEY = 'review_settings';
const REVIEW_SETTINGS_DEFAULT = {
  enabled: false,
  autoPublish: true,
  verifiedBuyersOnly: true,
  allowPhotos: true,
};

const ASPECTS = [
  { key: 'quality', label: 'Kualitas Produk' },
  { key: 'service', label: 'Pelayanan' },
  { key: 'shipping', label: 'Kecepatan Pengiriman' },
  { key: 'price', label: 'Harga Produk' },
];

function scoreLabel(score, count) {
  if (!count) return { text: 'Belum ada rating', tone: 'muted' };
  if (score >= 4.5) return { text: 'Sangat Baik', tone: 'success' };
  if (score >= 3.5) return { text: 'Baik', tone: 'success' };
  if (score >= 2.5) return { text: 'Cukup', tone: 'warning' };
  return { text: 'Kurang', tone: 'danger' };
}

function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function Bar({ label, value, max, display, labelClass = 'w-40' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={`${labelClass} shrink-0 text-neutral truncate`}>{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden" role="presentation">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-subdued tabular-nums">{display ?? value}</span>
    </div>
  );
}

function ReviewItem({ review, onReply }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(review.reply || '');
  const replyId = `reply-${review.id}`;
  return (
    <li className="py-4 border-b border-divider last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/products/edit/${review.productId}`} className="text-sm font-semibold text-primary hover:underline">
          {review.productName}
        </Link>
        <span className="text-xs text-subdued">{formatDate(review.createdAt)}</span>
      </div>
      <div className="mt-1.5"><Stars value={review.rating} /></div>
      {review.text && <p className="text-sm text-neutral mt-2 leading-6">{review.text}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-neutral">
          <User className="w-3.5 h-3.5 text-subdued" aria-hidden="true" /> {review.customerName}
        </span>
        {!open && (
          <Button size="sm" variant="tonal" onClick={() => setOpen(true)} aria-expanded={open} aria-controls={replyId}>
            {review.reply ? 'Ubah jawaban' : 'Jawab'}
          </Button>
        )}
      </div>
      {review.reply && !open && (
        <div className="mt-3 rounded-lg bg-page p-3 text-sm">
          <div className="text-xs font-semibold text-neutral mb-1">Jawaban penjual</div>
          <p className="text-neutral leading-6">{review.reply}</p>
        </div>
      )}
      {open && (
        <div id={replyId} className="mt-3 space-y-2">
          <TextArea
            id={`${replyId}-text`}
            label="Jawaban Anda"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tulis jawaban untuk ulasan ini"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button size="sm" disabled={!draft.trim()} onClick={() => { onReply(review.id, draft.trim()); setOpen(false); }}>
              Kirim jawaban
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function downloadCsv(reviews) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    ['Produk', 'Customer', 'Rating', 'Ulasan', 'Tanggal', 'Jawaban'].map(esc).join(','),
    ...reviews.map((r) => [r.productName, r.customerName, r.rating, r.text, r.createdAt, r.reply].map(esc).join(',')),
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ulasan.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function RatingsPage() {
  const setting = useStoreSetting(REVIEW_SETTINGS_KEY, REVIEW_SETTINGS_DEFAULT);
  const storeId = useSelector((s) => s.stores.currentStore?.id);
  const [apiReviews, setApiReviews] = useState([]);
  const [replies, setReplies] = useState({});

  const loadReviews = () => {
    if (!storeId) return;
    api.get(`/stores/${storeId}/reviews`)
      .then((res) => setApiReviews((res.data || []).map((r) => ({
        id: r.id, productId: r.product_id, productName: r.product_name,
        customerName: r.customer_name, rating: r.rating, text: r.text,
        aspects: r.aspects, reply: r.reply, createdAt: r.created_at,
      }))))
      .catch(() => setApiReviews([]));
  };
  useEffect(loadReviews, [storeId]);

  const onReply = (id, text) => {
    setReplies((m) => ({ ...m, [id]: text }));
    api.put(`/stores/${storeId}/reviews/${id}/reply`, { reply: text }).catch(() => setReplies((m) => { const n = { ...m }; delete n[id]; return n; }));
  };
  const [ratingFilter, setRatingFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(REVIEW_SETTINGS_DEFAULT);

  const reviews = useMemo(() => apiReviews.map((r) => ({ ...r, reply: replies[r.id] ?? r.reply })), [apiReviews, replies]);
  const count = reviews.length;

  const summary = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => Math.round(r.rating) === star).length }));
    const avg = count ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / count : 0;
    const aspects = ASPECTS.map((a) => {
      const vals = reviews.map((r) => r.aspects?.[a.key]).filter((v) => typeof v === 'number');
      return { ...a, avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0 };
    });
    return { dist, avg, aspects };
  }, [reviews, count]);

  const filtered = reviews.filter((r) => (
    (!ratingFilter || String(Math.round(r.rating)) === ratingFilter)
    && (!productFilter || String(r.productId) === productFilter)
    && (!customerFilter || r.customerName === customerFilter)
  ));
  const anyFilter = ratingFilter || productFilter || customerFilter;

  const productOptions = [...new Map(reviews.map((r) => [String(r.productId), r.productName])).entries()]
    .map(([value, label]) => ({ value, label }));
  const customerOptions = [...new Set(reviews.map((r) => r.customerName))].map((c) => ({ value: c, label: c }));
  const ratingOptions = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} bintang` }));

  const label = scoreLabel(summary.avg, count);
  const enabled = setting.value.enabled;
  const busy = setting.status.type === 'saving';
  const { can, requiredPlan } = usePlan();
  const reviewLocked = !can('reviews');

  const enableReviews = () => setting.save({ ...setting.value, enabled: true });
  const openSettings = () => { setDraft(setting.value); setSettingsOpen(true); };
  const saveSettings = async () => { if (await setting.save(draft)) setSettingsOpen(false); };
  const clearFilters = () => { setRatingFilter(''); setProductFilter(''); setCustomerFilter(''); };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rating"
        actions={(
          <>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
              title={filtered.length === 0 ? 'Belum ada ulasan untuk diunduh' : 'Unduh ulasan (CSV)'}
            >
              Download
            </Button>
            <Button variant="secondary" icon={Settings} onClick={openSettings} disabled={!setting.hasStore || setting.loading}>
              Pengaturan
            </Button>
          </>
        )}
      />

      {setting.hasStore && !setting.loading && !enabled && (
        <InfoBanner
          title="Review sedang disembunyikan di toko"
          description="Nyalakan fitur review untuk tingkatkan kepercayaan dan konversi."
          action={(
            <div className="flex items-center gap-3">
              {reviewLocked ? (
                <Button size="sm" to="/settings/plans">{`Upgrade ke ${requiredPlan('reviews')}`}</Button>
              ) : (
                <Button size="sm" onClick={enableReviews} disabled={busy}>
                  {busy ? 'Mengaktifkan...' : 'Aktifkan Review'}
                </Button>
              )}
              {setting.status.type === 'error' && <SaveStatus status={setting.status} />}
            </div>
          )}
        />
      )}
      {enabled && setting.status.type === 'saved' && !settingsOpen && (
        <SaveStatus status={{ type: 'saved', message: 'Review ditampilkan di toko' }} />
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <div className="flex flex-col items-center justify-center text-center md:border-r md:border-divider md:pr-6">
            <div className="text-5xl font-bold text-neutral tabular-nums leading-none">{summary.avg.toFixed(1)}</div>
            <div className="mt-2"><Stars value={summary.avg} size="w-5 h-5" /></div>
            <Badge tone={label.tone} className="mt-3">{label.text}</Badge>
            <div className="text-sm text-subdued mt-2">{count} Ulasan</div>
          </div>
          <div className="space-y-2.5">
            <h2 className="text-sm font-semibold text-neutral mb-1">Distribusi rating</h2>
            {summary.dist.map((d) => (
              <Bar
                key={d.star}
                label={(
                  <span className="inline-flex items-center gap-1">
                    {d.star} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                    <span className="sr-only">bintang</span>
                  </span>
                )}
                value={d.n}
                max={count}
                labelClass="w-10"
              />
            ))}
          </div>
          <div className="space-y-2.5">
            <h2 className="text-sm font-semibold text-neutral mb-1">Penilaian aspek</h2>
            {summary.aspects.map((a) => (
              <Bar key={a.key} label={a.label} labelClass="w-36 sm:w-40" value={a.avg} max={5} display={a.avg.toFixed(1)} />
            ))}
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-divider">
          <button
            type="button"
            onClick={clearFilters}
            aria-pressed={!anyFilter}
            className={`inline-flex items-center h-7 px-2.5 rounded-full border text-xs cursor-pointer ${!anyFilter ? 'border-primary text-primary bg-primary-surface' : 'border-divider text-neutral bg-white hover:bg-gray-50'}`}
          >
            Semua
          </button>
          <FilterChip label="Rating" value={ratingFilter} options={ratingOptions} onChange={setRatingFilter} />
          <FilterChip label="Produk" value={productFilter} options={productOptions} onChange={setProductFilter} />
          <FilterChip label="Customer" value={customerFilter} options={customerOptions} onChange={setCustomerFilter} />
        </div>

        {count === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Belum ada ulasan"
            description={enabled
              ? 'Ulasan dari customer akan muncul di sini setelah mereka menilai produk yang dibeli.'
              : 'Aktifkan review agar customer dapat memberi ulasan pada produk yang mereka beli.'}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Ulasan tidak ditemukan"
            description="Tidak ada ulasan yang cocok dengan filter."
            action={<Button variant="secondary" onClick={clearFilters}>Hapus filter</Button>}
          />
        ) : (
          <ul className="px-4">
            {filtered.map((r) => (
              <ReviewItem key={r.id} review={r} onReply={onReply} />
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={settingsOpen}
        title="Pengaturan Review"
        onClose={() => !busy && setSettingsOpen(false)}
        footer={(
          <>
            <SaveStatus status={setting.status.type === 'error' ? setting.status : { type: 'idle' }} />
            <Button variant="secondary" onClick={() => setSettingsOpen(false)} disabled={busy}>Batal</Button>
            <Button onClick={saveSettings} disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        <div className="space-y-5">
          <Toggle
            id="rv-enabled"
            label="Tampilkan review di toko"
            description="Rating dan ulasan tampil di halaman produk."
            checked={draft.enabled}
            onChange={(v) => setDraft((d) => ({ ...d, enabled: v }))}
          />
          <Toggle
            id="rv-auto"
            label="Terbitkan ulasan otomatis"
            description="Jika nonaktif, ulasan baru perlu disetujui dulu sebelum tampil."
            checked={draft.autoPublish}
            onChange={(v) => setDraft((d) => ({ ...d, autoPublish: v }))}
          />
          <Toggle
            id="rv-verified"
            label="Hanya pembeli terverifikasi"
            description="Hanya customer dengan pesanan selesai yang bisa memberi ulasan."
            checked={draft.verifiedBuyersOnly}
            onChange={(v) => setDraft((d) => ({ ...d, verifiedBuyersOnly: v }))}
          />
          <Toggle
            id="rv-photos"
            label="Izinkan foto pada ulasan"
            checked={draft.allowPhotos}
            onChange={(v) => setDraft((d) => ({ ...d, allowPhotos: v }))}
          />
        </div>
      </Modal>
    </div>
  );
}
