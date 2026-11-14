/*
 * Pemetaan status pesanan backend -> grup tab/label + nada Badge.
 * Backend (orders.status) memakai: pending, processing (setelah bayar via webhook), confirmed (lama),
 * packed, shipped, delivered, completed, cancelled, refunded.
 */

export const STATUS_GROUPS = {
  baru: { label: 'Baru', statuses: ['pending'], write: 'pending', tone: 'warning' },
  lunas: { label: 'Lunas', statuses: ['processing', 'confirmed', 'paid'], write: 'processing', tone: 'primary' },
  dikemas: { label: 'Dikemas', statuses: ['packed'], write: 'packed', tone: 'primary' },
  terkirim: { label: 'Terkirim', statuses: ['shipped'], write: 'shipped', tone: 'primary' },
  selesai: { label: 'Selesai', statuses: ['delivered', 'completed'], write: 'delivered', tone: 'success' },
  dibatalkan: { label: 'Dibatalkan', statuses: ['cancelled', 'refunded'], write: 'cancelled', tone: 'danger' },
};

export const ALL_GROUP_KEYS = Object.keys(STATUS_GROUPS);

export function groupOf(status) {
  return ALL_GROUP_KEYS.find((k) => STATUS_GROUPS[k].statuses.includes(status)) || null;
}

export function statusMeta(status) {
  const key = groupOf(status);
  if (!key) return { label: status || '-', tone: 'neutral' };
  return { label: status === 'refunded' ? 'Dikembalikan' : STATUS_GROUPS[key].label, tone: STATUS_GROUPS[key].tone };
}

/** Gabungkan status backend dari daftar key grup. */
export function statusesOf(groupKeys) {
  return groupKeys.flatMap((k) => STATUS_GROUPS[k]?.statuses || []);
}

const PAID_GROUPS = ['lunas', 'dikemas', 'terkirim', 'selesai'];

export function isPaid(order) {
  return order.payment_status === 'paid' || PAID_GROUPS.includes(groupOf(order.status));
}

export function paymentMeta(order) {
  if (order.payment_status === 'refunded') return { key: 'refunded', label: 'Dikembalikan', tone: 'muted' };
  if (order.payment_status === 'failed') return { key: 'failed', label: 'Gagal', tone: 'danger' };
  if (isPaid(order)) return { key: 'paid', label: 'Lunas', tone: 'success' };
  if (order.payment_status === 'pending') return { key: 'pending', label: 'Menunggu', tone: 'warning' };
  return { key: 'unpaid', label: 'Belum dibayar', tone: 'warning' };
}

export function isFulfilled(order) {
  return ['terkirim', 'selesai'].includes(groupOf(order.status));
}

export const PAYMENT_FILTER_OPTIONS = [
  { value: 'paid', label: 'Lunas' },
  { value: 'unpaid', label: 'Belum dibayar' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'failed', label: 'Gagal' },
  { value: 'refunded', label: 'Dikembalikan' },
];

export const FULFILLMENT_FILTER_OPTIONS = [
  { value: 'yes', label: 'Terpenuhi' },
  { value: 'no', label: 'Tidak terpenuhi' },
];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Hari ini' },
  { value: '7d', label: '7 hari terakhir' },
  { value: '30d', label: '30 hari terakhir' },
  { value: 'month', label: 'Bulan ini' },
];

export function dateRangeOf(key) {
  if (!key) return {};
  const now = new Date();
  const to = ymd(now);
  if (key === 'today') return { dateFrom: to, dateTo: to };
  if (key === 'month') return { dateFrom: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), dateTo: to };
  const days = key === '7d' ? 6 : 29;
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { dateFrom: ymd(from), dateTo: to };
}
