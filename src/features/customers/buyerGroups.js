import { formatRp } from '../../components/ui';

/*
 * Grup customer belum punya tabel sendiri di backend, jadi disimpan sebagai
 * JSON di pengaturan toko (kunci `buyer_groups`). Keanggotaan dicatat lewat
 * `memberIds` (id customer).
 */
export const BUYER_GROUPS_KEY = 'buyer_groups';
export const BUYER_GROUPS_DEFAULT = { groups: [] };

export const newId = () => (globalThis.crypto?.randomUUID?.() || `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export function formatGroupDiscount(g) {
  const v = Number(g.discountValue) || 0;
  if (!v) return '-';
  return g.discountType === 'amount' ? formatRp(v) : `${v}%`;
}

export function groupsOfCustomer(groups, customerId) {
  return groups.filter((g) => (g.memberIds || []).includes(customerId));
}

export function addMembers(groups, groupId, ids) {
  return groups.map((g) => (g.id === groupId
    ? { ...g, memberIds: Array.from(new Set([...(g.memberIds || []), ...ids])) }
    : g));
}
