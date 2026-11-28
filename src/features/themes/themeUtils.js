/*
 * Util tema. Tema = template storefront (ZunixeStore-Frontend/src/templates/<template>).
 * Kunci warna config: primary_color (warna utama), secondary_color (tombol), footer_color.
 */
export const DEFAULT_CFG = { primary_color: '#DB0028', secondary_color: '#0C0103', footer_color: '#D62043' };

export function themeColors(theme) {
  let cfg;
  try { cfg = typeof theme?.config === 'string' ? JSON.parse(theme.config) : (theme?.config || {}); }
  catch { cfg = {}; }
  if (!cfg || typeof cfg !== 'object') cfg = {};
  return {
    primary_color: cfg.primary_color || DEFAULT_CFG.primary_color,
    secondary_color: cfg.secondary_color || DEFAULT_CFG.secondary_color,
    footer_color: cfg.footer_color || DEFAULT_CFG.footer_color,
    raw: cfg,
  };
}

/* URL storefront untuk "Lihat Tampilan". Saat dev pakai VITE_STOREFRONT_URL (storefront lokal). */
export function storefrontUrl(store) {
  const dev = import.meta.env.VITE_STOREFRONT_URL || (import.meta.env.DEV ? 'http://localhost:5174' : '');
  if (dev) return dev.replace(/\/$/, '');
  if (!store) return '';
  const host = store.domain || (store.slug ? `${store.slug}.zunixestore.com` : '');
  return host ? `https://${host}` : '';
}

export function previewUrl(store, theme) {
  const base = storefrontUrl(store);
  if (!base || !theme?.template) return '';
  const q = new URLSearchParams({ template: theme.template, _zxv: String(Date.now()) });
  if (store?.slug) q.set('store', store.slug);
  return `${base}/?${q.toString()}`;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/* Format seperti Plugo: "Apr 11 06:27", atau "Mei 31 2025 13:44" untuk tahun lain. */
export function formatWaktu(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${BULAN[d.getMonth()]} ${d.getDate()}${year} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
