/* Util tanggal & agregasi untuk halaman analitik. */

const DAY = 86400000;

const pad = (n) => String(n).padStart(2, '0');

export function dayKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** created_at dari SQLite ("YYYY-MM-DD HH:MM:SS", UTC) atau ISO string. */
export function parseDbDate(s) {
  if (!s) return null;
  const str = String(s);
  const d = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str) ? new Date(`${str.replace(' ', 'T')}Z`) : new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dbDayKey(s) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))) return s;
  const d = parseDbDate(s);
  return d ? dayKey(d) : null;
}

/** Hari-hari periode terpilih (berakhir hari ini) dan periode sebelumnya, masing-masing `days` hari. */
export function buildPeriods(days, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const current = [];
  const previous = [];
  for (let i = days - 1; i >= 0; i -= 1) current.push(dayKey(new Date(today.getTime() - i * DAY)));
  for (let i = 2 * days - 1; i >= days; i -= 1) previous.push(dayKey(new Date(today.getTime() - i * DAY)));
  return { current, previous };
}

/** Tanggal (YYYY-MM-DD) paling awal yang dibutuhkan, dengan cadangan 1 hari untuk selisih zona waktu. */
export function sinceKey(days, now = new Date()) {
  return dayKey(new Date(now.getTime() - 2 * days * DAY));
}

const keyToDate = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function shortDate(k) {
  return keyToDate(k).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function rangeLabel(keys) {
  if (!keys.length) return '';
  const a = keyToDate(keys[0]);
  const b = keyToDate(keys[keys.length - 1]);
  const opt = { day: 'numeric', month: 'short' };
  return `${a.toLocaleDateString('id-ID', opt)} - ${b.toLocaleDateString('id-ID', { ...opt, year: 'numeric' })}`;
}

/** Kelompokkan item ke per-hari. valueFn(item) -> angka; keyFn(item) -> YYYY-MM-DD. */
export function bucket(keys, items, keyFn, valueFn = () => 1) {
  const map = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const it of items) {
    const k = keyFn(it);
    if (k in map) map[k] += Number(valueFn(it)) || 0;
  }
  return keys.map((k) => map[k]);
}

export const sum = (arr) => arr.reduce((s, v) => s + (Number(v) || 0), 0);

export function pctChange(cur, prev) {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export const ratio = (a, b) => (b > 0 ? Math.round((a / b) * 10000) / 100 : 0);

const CANCELLED = ['cancelled', 'canceled', 'refunded', 'failed', 'expired'];
const PAID_STATUS = ['confirmed', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'completed'];

export const isCancelled = (o) => CANCELLED.includes(String(o.status || '').toLowerCase());
export const isPaid = (o) => !isCancelled(o)
  && (String(o.payment_status || '').toLowerCase() === 'paid' || PAID_STATUS.includes(String(o.status || '').toLowerCase()));

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

export function formatCompactRp(n) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1e9) return `Rp ${(v / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  if (Math.abs(v) >= 1e6) return `Rp ${(v / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (Math.abs(v) >= 1e3) return `Rp ${(v / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

/** Unduh baris sebagai file CSV (dipicu oleh klik pengguna). */
export function downloadCsv(filename, header, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
