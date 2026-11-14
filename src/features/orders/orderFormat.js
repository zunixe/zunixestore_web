/* Helper format kecil khusus fitur pesanan. */

/** SQLite `datetime('now')` menghasilkan "YYYY-MM-DD HH:MM:SS" (UTC) tanpa zona waktu. */
export function parseDbDate(value) {
  if (!value) return null;
  const s = String(value);
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s) ? `${s.replace(' ', 'T')}Z` : s;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDbDateTime(value) {
  const d = parseDbDate(value);
  if (!d) return '-';
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Alamat pengiriman bisa berupa string biasa, string JSON, atau objek. */
export function formatAddress(value) {
  if (!value) return '-';
  let v = value;
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { return value; }
  }
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') return Object.values(v).filter(Boolean).join(', ') || '-';
  return String(v);
}
