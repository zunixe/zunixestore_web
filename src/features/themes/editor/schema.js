/*
 * Skema editor tema ala Plugo. Draft editor = satu objek yang disimpan utuh ke
 * theme.config; saat desain tayang, subset yang dibaca storefront dipetakan ke
 * store_settings (lihat toStoreSettings).
 */

export const PAGE_OPTIONS = [
  'Halaman Home', 'Halaman Katalog', 'Halaman Detail Produk', 'Halaman keranjang',
  'Halaman Pemesanan', 'Halaman Akun', 'Masuk & Daftar',
];

export const LAYOUT6 = [
  { value: 'Grid', label: 'Grid' },
  { value: 'Banner - Grid', label: 'Banner - Grid' },
  { value: 'Slider', label: 'Slider' },
  { value: 'Banner - Slider', label: 'Banner - Slider' },
  { value: 'Carousel', label: 'Carousel' },
  { value: 'Banner - Carousel', label: 'Banner - Carousel' },
];

export const PRODUCT_STYLE = ['Original', 'Flat', 'Elegant', 'Grid', 'Boutique'];
export const IMG_EFFECT = ['Original', 'Slideshow', 'Hover'];
export const LEBAR = ['Penuh', 'Rapat', 'Konten'];
export const FONT_OPTS = ['Ubuntu', 'Roboto', 'Inter', 'Poppins', 'Lato', 'Open Sans'];
export const SCROLL_ANIM = ['Tanpa animasi', 'Fade', 'Slide Up', 'Slide Left', 'Zoom'];

const TITLE_DEFAULT = { text: '', size: 'Sedang', bold: false, italic: false, underline: false, posisi: 'Kiri' };

/* Default draft. key = id seksi yang dipakai di editor + config. */
export const DEFAULT_DRAFT = {
  page: 'Halaman Home',
  global: {
    warna: {
      brand: '#DB0028',
      latar: '#FFFFFF',
      teks: '#1B1C20',
      tombol: '#0C0103',
      teksTombol: '#FFFFFF',
      label: '#DB0028',
      teksLabel: '#FFFFFF',
      gradasiLabel: false,
    },
    font: { kustom: false, judul: 'Roboto', teks: 'Ubuntu', spasiTeks: 'Normal', spasiTombol: 'Normal' },
    produk: { rasio: '1:1', tinggiFoto: 'Kustom', kesesuaian: 'Isi', diskonPct: false, diskonLabel: false, deskripsi: false },
    tombol: { warna: '#0C0103', teks: '#FFFFFF', hover: 'Bayangan', sudut: 'Sudut Sedang Melengkung' },
    tampilan: { gapX: 16, gapY: 16 },
    wishlist: true,
    bottomNav: { aktif: true, items: ['Home', 'Produk', 'keranjang', 'Akun', 'Chat'], latar: '#FFFFFF', teks: '#6B7280', teksAktif: '#DB0028' },
    customCss: '',
  },
  home: {
    pengumuman: { popup: false, teksBerjalan: false, teks: 'Get our latest products!' },
    header: {
      lebar: 'Konten', posisiLogo: 'kiri-bawah', topHeader: false,
      logo: '', tampilanLogo: 'Logo penuh', ukuranLogo: 'Sedang',
      posisiMenu: 'Kanan', latar: '#FFFFFF', transparanDinamis: false,
      menuSamping: true, scroll: 'Geser', hover: 'Garis bawah',
    },
    floating: { kustom: false, diskon: false },
  },
  /* Seksi "Bagian" — urutan = urutan render. hidden = disembunyikan. */
  sections: {
    namaToko: { tampilan: 'default', visible: true, desain: {} },
    slideshow: {
      tampilan: 'default', visible: true,
      images: [], tinggi: 'Sedang', interval: 5, carousel: false,
      nav: 'Sisi', paginasi: 'Titik', desain: {},
    },
    countdown: {
      tampilan: 'default', visible: true,
      bgMode: 'image', image: '', bgColor: '#DB0028', tinggi: 'Sedang',
      warnaTeks: '#DB0028', judul: 'Super Promo', deskripsi: '',
      tanggal: '', waktu: '12:00',
      tombolShow: true, tombolTeks: 'Lihat Produk', tombolLink: '', tombolTipe: 'Outlined', tombolWarna: '#0C0103',
      latarKonten: true, posisi: 'Tengah', aksiSelesai: 'Sembunyikan', desain: {},
    },
    featured: {
      tampilan: 'Grid', visible: true, produkIds: [],
      judul: { ...TITLE_DEFAULT, text: 'Best Seller' },
      efek: 'Original', style: 'Original', deskripsi: 'Standar', label: 'Standar',
      tampilkanSemua: true, desain: {},
    },
    latest: {
      tampilan: 'Grid', visible: true,
      judul: { ...TITLE_DEFAULT, text: 'Produk Terbaru' },
      efek: 'Original', style: 'Original', tombolTipe: 'Outlined', tombolWarna: '#0C0103',
      perBaris: 5, jumlah: 10, deskripsi: 'Standar', label: 'Standar',
      tampilkanSemua: true, desain: {},
    },
    bundle: {
      tampilan: 'Grid', visible: true, bundleIds: [],
      judul: { ...TITLE_DEFAULT, text: '' }, perBaris: 2,
      efek: 'Original', style: 'Grid', tampilkanSemua: true, desain: {},
    },
    faq: {
      tampilan: 'Grid', visible: true,
      judul: { ...TITLE_DEFAULT, text: 'Tanya Kami' }, kategori: '', desain: {},
    },
    footer: {
      baris: '1 Baris', visible: true,
      col1: 'Powered By :', col2: 'Informasi pembayaran dan pengiriman', col3: 'Terms & Conditions',
      latar: '#D62043', teks: '#FFFFFF', lebar: 'Konten', seluler: true, desain: {},
    },
  },
  order: ['namaToko', 'slideshow', 'countdown', 'featured', 'latest', 'bundle', 'faq', 'footer'],
};

/* Metadata seksi di sidebar (ikon dipetakan di panels). */
export const SECTION_META = {
  namaToko: { label: 'Nama Toko', sub: '' },
  slideshow: { label: 'Gambar sampul (Slideshow)', sub: '' },
  countdown: { label: 'Banner Hitung Mundur', sub: (s) => s.judul || 'Super Promo' },
  featured: { label: 'Produk terpilih', sub: (s) => s.judul?.text || 'Best Seller' },
  latest: { label: 'Produk baru', sub: (s) => s.judul?.text || 'Produk Terbaru' },
  bundle: { label: 'Produk bundle', sub: '' },
  faq: { label: 'FAQ', sub: (s) => s.judul?.text || 'Tanya Kami' },
  footer: { label: 'Footer', sub: '' },
};

export const HOME_ITEMS = [
  { id: 'pengumuman', label: 'Pengumuman' },
  { id: 'header', label: 'Header' },
  { id: 'floating', label: 'Floating Button' },
];

/* Katalog "Tambah Bagian" seperti Plugo. */
export const SECTION_CATALOG = [
  { group: 'NAVIGATION', items: [{ id: 'informasiToko', label: 'Informasi toko' }, { id: 'daftarKategori', label: 'Daftar kategori' }, { id: 'pencarianProduk', label: 'Pencarian produk' }] },
  { group: 'PRODUCTS', items: [{ id: 'semuaProduk', label: 'Semua produk' }, { id: 'produkKategori', label: 'Daftar Produk dari 1 kategori' }, { id: 'featured', label: 'Produk terpilih' }, { id: 'produkUnggulan', label: 'Produk unggulan' }, { id: 'latest', label: 'Produk baru' }, { id: 'bundle', label: 'Produk bundle' }] },
  { group: 'CONTENT', items: [{ id: 'slideshow', label: 'Gambar sampul (Slideshow)' }, { id: 'countdown', label: 'Banner Hitung Mundur' }, { id: 'kolase', label: 'Gambar Kolase' }, { id: 'instagram', label: 'Instagram Feed' }, { id: 'waktuTerbatas', label: 'Waktu Terbatas' }, { id: 'paragraf', label: 'Paragraf' }, { id: 'gambarTeks', label: 'Gambar dengan teks' }, { id: 'videoTeks', label: 'Video dengan teks' }, { id: 'daftarLogo', label: 'Daftar logo' }, { id: 'marquee', label: 'Marquee' }, { id: 'contentGrid', label: 'Content Grid' }] },
  { group: 'INFORMATION', items: [{ id: 'namaToko', label: 'Nama Toko' }, { id: 'hashtags', label: 'Home Hashtags' }, { id: 'rating', label: 'Rating' }, { id: 'blogs', label: 'Blogs' }, { id: 'faq', label: 'FAQ' }] },
];

/* Seksi generik dari katalog (bukan 8 seksi bawaan) → panel konten minimal. */
export const GENERIC_SECTION = {
  tampilan: 'default', visible: true, judul: { ...TITLE_DEFAULT }, desain: {},
};

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

/* Gabungkan draft tersimpan dengan default (toleran struktur lama/baru). */
export function mergeDraft(raw) {
  if (!raw || typeof raw !== 'object') return structuredClone(DEFAULT_DRAFT);
  const d = structuredClone(DEFAULT_DRAFT);
  const deep = (a, b) => {
    if (!b || typeof b !== 'object') return a;
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) {
      out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof a?.[k] === 'object' ? deep(a[k], v) : v;
    }
    return out;
  };
  const merged = deep(d, raw);
  merged.order = Array.isArray(raw.order) ? raw.order : d.order;
  return merged;
}

/* Draft lama ThemePage (cuma 3 warna) → struktur baru. */
export function draftFromThemeConfig(config) {
  const raw = config && typeof config === 'object' ? config : {};
  if (raw.global || raw.sections) return mergeDraft(raw);
  const d = mergeDraft(null);
  if (raw.primary_color) { d.global.warna.brand = raw.primary_color; d.global.warna.label = raw.primary_color; }
  if (raw.secondary_color) { d.global.warna.tombol = raw.secondary_color; d.global.tombol.warna = raw.secondary_color; }
  if (raw.footer_color) d.sections.footer.latar = raw.footer_color;
  return d;
}

/* Subset yang dibaca template storefront (ZunixeStore-Frontend). */
export function toStoreSettings(draft) {
  const g = draft.global;
  const h = draft.home;
  const s = draft.sections;
  const countdownEnd = s.countdown.tanggal ? `${s.countdown.tanggal}T${s.countdown.waktu || '00:00'}` : '';
  const featuredIds = s.featured.produkIds || [];
  return {
    /* Draft utuh — storefront membaca ini dulu, kunci di bawah jadi fallback. */
    design_live: JSON.stringify(draft),
    primary_color: g.warna.brand,
    secondary_color: g.warna.tombol,
    footer_color: s.footer.latar,
    announcement_text: h.pengumuman.teksBerjalan || h.pengumuman.popup ? (h.pengumuman.teks || '') : '',
    slider_images: JSON.stringify(s.slideshow.images.filter(Boolean)),
    countdown_end: countdownEnd,
    countdown_title: s.countdown.judul || '',
    countdown_desc: s.countdown.deskripsi || '',
    /* Alias kunci yang sudah dibaca template lama & endpoint type=featured. */
    hero_title: s.countdown.judul || '',
    hero_subtitle: s.countdown.deskripsi || '',
    hero_banner_url: s.countdown.bgMode === 'image' ? (s.countdown.image || '') : '',
    featured_title: s.featured.judul?.text || 'Best Seller',
    featured_product_ids: JSON.stringify(featuredIds),
    featured_products: JSON.stringify(featuredIds),
    latest_title: s.latest.judul?.text || 'Produk Terbaru',
    latest_count: String(s.latest.jumlah ?? 10),
    faq_title: s.faq.judul?.text || 'Tanya Kami',
    footer_text_color: s.footer.teks,
    footer_cols: JSON.stringify(pick(s.footer, ['col1', 'col2', 'col3'])),
    wishlist_enabled: g.wishlist ? '1' : '0',
    bottom_nav_enabled: g.bottomNav.aktif ? '1' : '0',
    custom_css: g.customCss || '',
  };
}
