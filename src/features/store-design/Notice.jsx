/** Pesan status singkat (berhasil / gagal) di atas konten halaman. */
export default function Notice({ tone = 'success', children, onClose }) {
  if (!children) return null;
  const cls = tone === 'success' ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger';
  return (
    <div role={tone === 'success' ? 'status' : 'alert'} className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm mb-4 ${cls}`}>
      <span>{children}</span>
      {onClose && <button type="button" onClick={onClose} className="text-xs underline cursor-pointer shrink-0">Tutup</button>}
    </div>
  );
}
