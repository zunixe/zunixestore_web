import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, Image as ImageIcon, Store, BadgePercent, Star, Sparkles, Gift, CircleHelp, PanelBottom, Megaphone, PanelTop, MousePointerClick } from 'lucide-react';
import api from '../../../utils/api';
import {
  PanelHeader, Group, Label, ToggleRow, CheckRow, Seg, Sel, Txt, ColorRow,
  ImageField, DelSection, TitleStyle, SliderRow, SectionTabs, Accordion, LayoutPicker, BoxSpacing, RadiusPicker,
} from './fields';
import { LAYOUT6, PRODUCT_STYLE, IMG_EFFECT, LEBAR, FONT_OPTS, SCROLL_ANIM, SECTION_CATALOG, SECTION_META, DEFAULT_ANIM } from './schema';

const cx = (...c) => c.filter(Boolean).join(' ');

export const SECTION_ICONS = {
  pengumuman: Megaphone, header: PanelTop, floating: MousePointerClick,
  namaToko: Store, slideshow: ImageIcon, countdown: BadgePercent, featured: Star,
  latest: Sparkles, bundle: Gift, faq: CircleHelp, footer: PanelBottom,
};

/* ---------- Desain Website (gaya global) ---------- */

export function GlobalPanel({ draft, patch, onBack }) {
  const [open, setOpen] = useState('Warna');
  const g = draft.global;
  const w = g.warna;
  const setW = (k, v) => patch(`global.warna.${k}`, v);
  const GROUPS = ['Warna', 'Pasangan Font', 'Style Produk', 'Tombol', 'Tampilan', 'Wishlist', 'Navigasi Bawah', 'CSS Kustom'];

  return (
    <>
      <PanelHeader title="Desain Website" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {GROUPS.map((name) => (
          <Accordion key={name} title={name} open={open === name} onToggle={() => setOpen(open === name ? '' : name)}>
            {name === 'Warna' && (
              <div className="space-y-1">
                <ColorRow label="Warna Brand" value={w.brand} onChange={(v) => setW('brand', v)} />
                <ColorRow label="Warna Latar Belakang" value={w.latar} onChange={(v) => setW('latar', v)} />
                <div className="pt-2 border-t border-divider/60">
                  <Label hint>Warna Teks</Label>
                  <ColorRow label="Warna Font & Ikon" value={w.teks} onChange={(v) => setW('teks', v)} />
                </div>
                <div className="pt-2 border-t border-divider/60">
                  <Label hint>Warna Tombol</Label>
                  <ColorRow label="Warna Tombol" value={w.tombol} onChange={(v) => setW('tombol', v)} />
                  <ColorRow label="Warna Teks Tombol" value={w.teksTombol} onChange={(v) => setW('teksTombol', v)} />
                </div>
                <div className="pt-2 border-t border-divider/60">
                  <Label hint>Warna Label</Label>
                  <ColorRow label="Warna Label" value={w.label} onChange={(v) => setW('label', v)} />
                  <ColorRow label="Warna Teks Label" value={w.teksLabel} onChange={(v) => setW('teksLabel', v)} />
                  <ToggleRow label="Gradasi Label" checked={w.gradasiLabel} onChange={(v) => setW('gradasiLabel', v)} />
                </div>
              </div>
            )}
            {name === 'Pasangan Font' && (
              <div className="space-y-3">
                <CheckRow label="Font Kustom" checked={g.font.kustom} onChange={(v) => patch('global.font.kustom', v)} />
                <div><Label>Judul</Label><Sel value={g.font.judul} onChange={(v) => patch('global.font.judul', v)} options={FONT_OPTS} /></div>
                <div><Label>Teks / Paragraf</Label><Sel value={g.font.teks} onChange={(v) => patch('global.font.teks', v)} options={FONT_OPTS} /></div>
                <div><Label>Spasi Huruf Teks</Label><Sel value={g.font.spasiTeks} onChange={(v) => patch('global.font.spasiTeks', v)} options={['Normal', 'Rapat', 'Lebar']} /></div>
                <div><Label>Spasi Huruf Tombol</Label><Sel value={g.font.spasiTombol} onChange={(v) => patch('global.font.spasiTombol', v)} options={['Normal', 'Rapat', 'Lebar']} /></div>
              </div>
            )}
            {name === 'Style Produk' && (
              <div className="space-y-3">
                <div><Label>Rasio Foto</Label><Seg options={['1:1', '4:5']} value={g.produk.rasio} onChange={(v) => patch('global.produk.rasio', v)} /></div>
                <div><Label>Tinggi Foto</Label><Sel value={g.produk.tinggiFoto} onChange={(v) => patch('global.produk.tinggiFoto', v)} options={['Kustom', 'Pendek', 'Sedang', 'Tinggi']} /></div>
                <div><Label>Kesesuaian Gambar</Label><Seg options={['Isi', 'Asli']} value={g.produk.kesesuaian} onChange={(v) => patch('global.produk.kesesuaian', v)} /></div>
                <CheckRow label="Tampilkan persentase diskon di halaman produk" checked={g.produk.diskonPct} onChange={(v) => patch('global.produk.diskonPct', v)} />
                <CheckRow label="Tampilkan diskon otomatis sebagai label diskon ekstra" checked={g.produk.diskonLabel} onChange={(v) => patch('global.produk.diskonLabel', v)} />
                <CheckRow label="Tampilkan Deskripsi Singkat" checked={g.produk.deskripsi} onChange={(v) => patch('global.produk.deskripsi', v)} />
              </div>
            )}
            {name === 'Tombol' && (
              <div className="space-y-2">
                <ColorRow label="Warna Tombol" value={g.tombol.warna} onChange={(v) => patch('global.tombol.warna', v)} />
                <ColorRow label="Warna Teks" value={g.tombol.teks} onChange={(v) => patch('global.tombol.teks', v)} />
                <div><Label>Efek Hover Tombol</Label><Sel value={g.tombol.hover} onChange={(v) => patch('global.tombol.hover', v)} options={['Bayangan', 'Tidak ada', 'Garis bawah']} /></div>
                <div><Label>Sudut</Label><Sel value={g.tombol.sudut} onChange={(v) => patch('global.tombol.sudut', v)} options={['Sudut Kecil', 'Sudut Sedang Melengkung', 'Sudut Bulat Penuh']} /></div>
              </div>
            )}
            {name === 'Tampilan' && (
              <div>
                <Label hint>Grid</Label>
                <p className="text-xs text-subdued mb-2">Mempengaruhi area dengan beberapa kolom atau baris</p>
                <div className="space-y-2">
                  <Label>Horizontal Space</Label>
                  <div className="flex items-center gap-2"><Txt type="number" value={g.tampilan.gapX} onChange={(v) => patch('global.tampilan.gapX', Number(v))} /><span className="text-sm text-subdued">px</span></div>
                  <Label>Vertical Space</Label>
                  <div className="flex items-center gap-2"><Txt type="number" value={g.tampilan.gapY} onChange={(v) => patch('global.tampilan.gapY', Number(v))} /><span className="text-sm text-subdued">px</span></div>
                </div>
              </div>
            )}
            {name === 'Wishlist' && (
              <ToggleRow label="Memungkinkan pembeli untuk menyimpan produk ke wishlist" checked={g.wishlist} onChange={(v) => patch('global.wishlist', v)} />
            )}
            {name === 'Navigasi Bawah' && (
              <div className="space-y-2">
                <ToggleRow label="Aktifkan navigasi bawah di perangkat seluler" checked={g.bottomNav.aktif} onChange={(v) => patch('global.bottomNav.aktif', v)} />
                <div className="flex flex-wrap gap-1.5 py-1">
                  {g.bottomNav.items.map((it) => <span key={it} className="text-xs rounded-full border border-divider px-2.5 py-1 text-neutral">{it}</span>)}
                </div>
                <ColorRow label="Warna Latar Belakang" value={g.bottomNav.latar} onChange={(v) => patch('global.bottomNav.latar', v)} />
                <ColorRow label="Warna Teks" value={g.bottomNav.teks} onChange={(v) => patch('global.bottomNav.teks', v)} />
                <ColorRow label="Warna Teks Aktif" value={g.bottomNav.teksAktif} onChange={(v) => patch('global.bottomNav.teksAktif', v)} />
              </div>
            )}
            {name === 'CSS Kustom' && (
              <div>
                <Label>CSS Kustom</Label>
                <textarea
                  value={g.customCss}
                  onChange={(e) => patch('global.customCss', e.target.value)}
                  rows={5}
                  spellCheck={false}
                  className="w-full rounded-md border border-divider p-2 text-xs font-mono bg-white focus:outline-none focus:border-primary"
                  placeholder=".p-btn { font-weight: 600 }"
                />
                <p className="text-[11px] text-subdued mt-1.5">Tambahkan CSS kustom untuk menata tampilan toko Anda. Perubahan akan diterapkan secara global. Catatan: CSS disanitasi untuk keamanan.</p>
              </div>
            )}
          </Accordion>
        ))}
      </div>
    </>
  );
}

/* ---------- Seksi Homepage (tanpa tab) ---------- */

export function PengumumanPanel({ draft, patch, onBack }) {
  const p = draft.home.pengumuman;
  return (
    <>
      <PanelHeader title="Pengumuman" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4">
        <ToggleRow label="Popup Pengumuman" checked={p.popup} onChange={(v) => patch('home.pengumuman.popup', v)} />
        <ToggleRow label="Teks Berjalan" checked={p.teksBerjalan} onChange={(v) => patch('home.pengumuman.teksBerjalan', v)} />
        {(p.popup || p.teksBerjalan) && (
          <div className="pt-2">
            <Label>Teks Pengumuman</Label>
            <Txt value={p.teks} onChange={(v) => patch('home.pengumuman.teks', v)} placeholder="Get our latest products!" />
          </div>
        )}
      </div>
    </>
  );
}

export function HeaderPanel({ draft, patch, onBack }) {
  const h = draft.home.header;
  const set = (k, v) => patch(`home.header.${k}`, v);
  const POSISI_LOGO = [
    { value: 'kiri-atas', label: 'Logo kiri, menu atas' },
    { value: 'tengah-atas', label: 'Logo tengah, menu atas' },
    { value: 'kiri-inline', label: 'Logo kiri sejajar menu' },
    { value: 'kiri-bawah', label: 'Logo kiri, menu bawah' },
    { value: 'tengah-inline', label: 'Logo tengah sejajar' },
  ];
  return (
    <>
      <PanelHeader title="Header" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <Group title="Template Tata Letak">
          <Label>Lebar Konten</Label>
          <Seg options={LEBAR} value={h.lebar} onChange={(v) => set('lebar', v)} />
          <Label className="mt-4">Posisi logo di desktop</Label>
          <LayoutPicker
            cols={2}
            options={POSISI_LOGO.map((p) => ({ ...p, icon: <div className="absolute inset-2 rounded-sm bg-white/80 border border-gray-300" /> }))}
            value={h.posisiLogo}
            onChange={(v) => set('posisiLogo', v)}
          />
        </Group>
        <Group><ToggleRow label="Top Header" checked={h.topHeader} onChange={(v) => set('topHeader', v)} /></Group>
        <Group title="Logo Brand">
          <ImageField value={h.logo} onChange={(v) => set('logo', v)} />
          <Label className="mt-3">Tampilan logo toko</Label>
          <Sel value={h.tampilanLogo} onChange={(v) => set('tampilanLogo', v)} options={['Logo penuh', 'Logo saja', 'Nama saja']} />
          <Label className="mt-3">Ukuran logo</Label>
          <Seg options={['Kecil', 'Sedang', 'Besar']} value={h.ukuranLogo} onChange={(v) => set('ukuranLogo', v)} />
        </Group>
        <Group title="Daftar Menu">
          <button type="button" className="w-full h-10 rounded-md bg-primary-surface text-primary text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer">
            ☰ Edit Menu List
          </button>
          <Label className="mt-3">Posisi Menu</Label>
          <Sel value={h.posisiMenu} onChange={(v) => set('posisiMenu', v)} options={['Kanan', 'Kiri', 'Tengah']} />
        </Group>
        <Group title="Warna Latar Belakang">
          <ColorRow label="Background" value={h.latar} onChange={(v) => set('latar', v)} />
          <CheckRow label="Buat latar belakang transparan secara dinamis" checked={h.transparanDinamis} onChange={(v) => set('transparanDinamis', v)} />
        </Group>
        <Group>
          <ToggleRow label="Tampilkan Menu Samping" checked={h.menuSamping} onChange={(v) => set('menuSamping', v)} />
          <Label>Pengaturan Scroll</Label>
          <Sel value={h.scroll} onChange={(v) => set('scroll', v)} options={['Geser', 'Tetap', 'Sembunyi saat scroll']} />
          <Label className="mt-3">Efek Hover Menu</Label>
          <Sel value={h.hover} onChange={(v) => set('hover', v)} options={['Garis bawah', 'Tidak ada', 'Blok']} />
        </Group>
      </div>
    </>
  );
}

export function FloatingPanel({ draft, patch, onBack }) {
  const f = draft.home.floating;
  return (
    <>
      <PanelHeader title="Floating Button" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4">
        <ToggleRow label="Kustom" checked={f.kustom} onChange={(v) => patch('home.floating.kustom', v)} />
        <div className="border-t border-divider" />
        <ToggleRow label="Diskon" checked={f.diskon} onChange={(v) => patch('home.floating.diskon', v)} />
      </div>
    </>
  );
}

/* ---------- Tab Desain bersama untuk semua seksi ---------- */

function DesainTab({ s, patch, path, defaultAnim = 'Tanpa animasi' }) {
  const d = s.desain || {};
  const set = (k, v) => patch(`${path}.desain.${k}`, v);
  return (
    <div className="px-4 py-4 space-y-3">
      <div><Label>Font</Label><Sel value={d.font || 'Ubuntu'} onChange={(v) => set('font', v)} options={FONT_OPTS} /></div>
      <div><Label>Animasi saat Scroll</Label><Sel value={d.animasi || defaultAnim} onChange={(v) => set('animasi', v)} options={SCROLL_ANIM} /></div>
      <Seg options={['Warna Latar Belakang', 'Gambar Latar Belakang']} value={d.bgMode || 'Warna Latar Belakang'} onChange={(v) => set('bgMode', v)} />
      {d.bgMode === 'Gambar Latar Belakang'
        ? <ImageField value={d.bgImage || ''} onChange={(v) => set('bgImage', v)} />
        : <ColorRow label="Warna Latar Belakang" value={d.latar || '#FFFFFF'} onChange={(v) => set('latar', v)} />}
      <ColorRow label="Warna Utama" value={d.utama || '#DB0028'} onChange={(v) => set('utama', v)} />
      <ColorRow label="Warna Teks" value={d.teks || '#1B1C20'} onChange={(v) => set('teks', v)} />
      <button type="button" onClick={() => patch(`${path}.desain`, {})} className="text-sm font-medium text-primary hover:underline cursor-pointer">
        Atur Ulang ke Warna Global
      </button>
    </div>
  );
}

/* Tab Pengaturan (Plugo): Lebar Konten, Ketajaman Ujung Konten, Jarak, Padding. */
function PengaturanTab({ s, patch, path }) {
  const t = s.tata || {};
  const set = (k, v) => patch(`${path}.tata.${k}`, v);
  return (
    <div className="px-4 py-4 space-y-4">
      <div><Label>Lebar Konten</Label><Seg options={LEBAR} value={t.lebar || 'Penuh'} onChange={(v) => set('lebar', v)} /></div>
      <div><Label>Ketajaman Ujung Konten</Label><RadiusPicker value={t.sudut || ''} onChange={(v) => set('sudut', v)} /></div>
      <div><Label>Jarak</Label><BoxSpacing value={t.margin || { top: 0, bottom: 12 }} onChange={(v) => set('margin', v)} /></div>
      <div><Label>Padding</Label><BoxSpacing value={t.padding} onChange={(v) => set('padding', v)} /></div>
    </div>
  );
}

/* ---------- Form Konten per seksi ---------- */

function ProductPicker({ selected, onChange, storeId }) {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !storeId) return;
    api.get(`/stores/${storeId}/products?limit=50`).then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProducts(list);
    }).catch(() => {});
  }, [open, storeId]);

  const chosen = (selected || []).map(String);
  const toggle = (id) => onChange(chosen.includes(String(id)) ? chosen.filter((x) => x !== String(id)) : [...chosen, String(id)].slice(0, 12));

  return (
    <div>
      <Label>Pilih Produk</Label>
      <p className="text-xs text-subdued mb-2">Maksimal 12 produk akan ditampilkan.</p>
      <button type="button" onClick={() => setOpen(!open)} className="w-full h-9 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-neutral inline-flex items-center justify-center gap-1.5 cursor-pointer">
        <Plus className="w-4 h-4" /> Tambah Produk
      </button>
      {open && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-divider divide-y divide-divider">
          {products.length === 0 && <p className="px-3 py-3 text-xs text-subdued">Tidak ada produk.</p>}
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={chosen.includes(String(p.id))} onChange={() => toggle(p.id)} className="w-4 h-4 accent-[#4169e1]" />
              <span className="text-xs text-neutral truncate">{p.name || p.title || p.id}</span>
            </label>
          ))}
        </div>
      )}
      {chosen.length > 0 && <p className="text-xs text-subdued mt-2">{chosen.length} produk dipilih</p>}
    </div>
  );
}

const LAYOUT_ICONS = {
  grid: <div className="absolute inset-2 grid grid-cols-3 gap-1">{[...Array(6)].map((_, i) => <div key={i} className="bg-white border border-gray-300 rounded-sm" />)}</div>,
  slider: <div className="absolute inset-2 flex gap-1">{[...Array(3)].map((_, i) => <div key={i} className="flex-1 bg-white border border-gray-300 rounded-sm" />)}</div>,
  banner: <div className="absolute inset-2 bg-white border border-gray-300 rounded-sm" />,
};

function tampilanOpts(keys) {
  return LAYOUT6.map((l) => ({
    ...l,
    icon: /Banner/.test(l.value) ? LAYOUT_ICONS.banner : (/Slider|Carousel/.test(l.value) ? LAYOUT_ICONS.slider : LAYOUT_ICONS.grid),
  }));
}

/* Editor daftar gambar URL (dipakai Daftar Logo & Kolase). */
function ImageListEditor({ value, onChange }) {
  const images = Array.isArray(value) ? value : [];
  const setAt = (i, v) => onChange(images.map((x, j) => (j === i ? v : x)));
  return (
    <div>
      <button type="button" onClick={() => onChange([...images, ''])} className="w-full h-9 rounded-md bg-primary-surface text-primary text-sm font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer">
        <Plus className="w-4 h-4" /> Tambahkan Gambar
      </button>
      <div className="mt-2 space-y-1.5">
        {images.map((img, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-divider p-2">
            <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">{img && <img src={img} alt="" className="w-full h-full object-cover" />}</div>
            <Txt value={img} onChange={(v) => setAt(i, v)} placeholder={`Gambar ${i + 1} (URL)`} className="h-8 text-xs" />
            <ImageField value="" onChange={(v) => setAt(i, v)} buttonLabel="…" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="text-subdued hover:text-danger cursor-pointer" aria-label="Hapus gambar"><Trash2Icon /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionKonten({ id, s, patch, storeId }) {
  const set = (k, v) => patch(`sections.${id}.${k}`, v);
  switch (id) {
    case 'namaToko':
      return (
        <>
          <Group title="Tampilan">
            <LayoutPicker cols={1} options={[{ value: 'default', label: 'Standar', icon: <div className="absolute inset-4 rounded bg-white border border-gray-300" /> }]} value={s.tampilan} onChange={(v) => set('tampilan', v)} />
          </Group>
          <Group title="Pengaturan"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></Group>
        </>
      );
    case 'slideshow':
      return (
        <>
          <Group title="Tampilan">
            <LayoutPicker cols={1} options={[{ value: 'default', label: 'Standar', icon: LAYOUT_ICONS.slider }]} value={s.tampilan} onChange={(v) => set('tampilan', v)} />
          </Group>
          <Group title="Gambar">
            <button type="button" onClick={() => set('images', [...(s.images || []), ''])} className="w-full h-9 rounded-md bg-primary-surface text-primary text-sm font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" /> Tambahkan Gambar
            </button>
            <div className="mt-2 space-y-1.5">
              {(s.images || []).map((img, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-divider p-2">
                  <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">{img && <img src={img} alt="" className="w-full h-full object-cover" />}</div>
                  <Txt value={img} onChange={(v) => set('images', s.images.map((x, j) => (j === i ? v : x)))} placeholder={`Gambar ${i + 1} (URL)`} className="h-8 text-xs" />
                  <ImageField value="" onChange={(v) => set('images', s.images.map((x, j) => (j === i ? v : x)))} buttonLabel="…" />
                  <button type="button" onClick={() => set('images', s.images.filter((_, j) => j !== i))} className="text-subdued hover:text-danger cursor-pointer" aria-label="Hapus gambar"><Trash2Icon /></button>
                </div>
              ))}
            </div>
          </Group>
          <Group title="Pengaturan">
            <Label>Tinggi slideshow</Label>
            <Sel value={s.tinggi} onChange={(v) => set('tinggi', v)} options={['Kecil', 'Sedang', 'Besar', 'Sesuaikan dengan gambar pertama']} />
            <p className="text-[11px] text-subdued mt-1 mb-3">Opsi 'Sesuaikan dengan gambar pertama' akan menggunakan rasio asli gambar.</p>
            <SliderRow label="Ubah slide setiap" value={s.interval} min={1} max={15} value2={s.interval} onChange={(v) => set('interval', v)} />
            <div className="mt-2"><CheckRow label="Carousel" checked={s.carousel} onChange={(v) => set('carousel', v)} /></div>
            <Label className="mt-3">Tipe Navigasi Slide</Label>
            <Sel value={s.nav} onChange={(v) => set('nav', v)} options={['Sisi', 'Tengah', 'Tidak ada']} />
            <Label className="mt-3">Tipe Paginasi Slide</Label>
            <Sel value={s.paginasi} onChange={(v) => set('paginasi', v)} options={['Titik', 'Garis', 'Tidak ada']} />
          </Group>
        </>
      );
    case 'countdown':
      return (
        <>
          <Group title="Pengaturan">
            <Label>Pengaturan Latar Belakang</Label>
            <Seg options={[{ value: 'image', label: 'Use Image' }, { value: 'color', label: 'Use Background Color' }]} value={s.bgMode} onChange={(v) => set('bgMode', v)} className="mb-3" />
            {s.bgMode === 'image'
              ? <ImageField value={s.image} onChange={(v) => set('image', v)} />
              : <ColorRow label="Warna Latar Belakang" value={s.bgColor} onChange={(v) => set('bgColor', v)} />}
            <Label className="mt-3">Tinggi</Label>
            <Sel value={s.tinggi} onChange={(v) => set('tinggi', v)} options={['Kecil', 'Sedang', 'Besar']} />
            <ColorRow label="Warna Teks" value={s.warnaTeks} onChange={(v) => set('warnaTeks', v)} />
            {s.bgMode === 'image' && s.latarKonten === false && <p className="text-[11px] text-danger -mt-1">Warna ini tidak cocok untuk warna latar belakang</p>}
            <Label className="mt-3">Judul</Label>
            <Txt value={s.judul} onChange={(v) => set('judul', v)} />
            <Label className="mt-3">Deskripsi</Label>
            <Txt value={s.deskripsi} onChange={(v) => set('deskripsi', v)} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div><Label>Tanggal Banner Selesai</Label><Txt type="date" value={s.tanggal} onChange={(v) => set('tanggal', v)} /></div>
              <div><Label>Waktu</Label><Txt type="time" value={s.waktu} onChange={(v) => set('waktu', v)} /></div>
            </div>
            <div className="mt-3"><CheckRow label="Tampilkan Tombol" checked={s.tombolShow} onChange={(v) => set('tombolShow', v)} /></div>
            {s.tombolShow && (
              <>
                <Label className="mt-2">Teks Tombol</Label><Txt value={s.tombolTeks} onChange={(v) => set('tombolTeks', v)} />
                <Label className="mt-3">Tautan Tombol</Label><Txt value={s.tombolLink} onChange={(v) => set('tombolLink', v)} placeholder="https://www.zunixe.com/products" />
                <div className="grid grid-cols-2 gap-2 mt-3 items-end">
                  <Sel value={s.tombolTipe} onChange={(v) => set('tombolTipe', v)} options={['Outlined', 'Filled']} />
                  <ColorRow label="Warna Tombol" value={s.tombolWarna} onChange={(v) => set('tombolWarna', v)} />
                </div>
              </>
            )}
            <div className="mt-2"><CheckRow label="Tampilkan Latar Konten" checked={s.latarKonten} onChange={(v) => set('latarKonten', v)} /></div>
            <Label className="mt-3">Posisi Konten</Label>
            <Sel value={s.posisi} onChange={(v) => set('posisi', v)} options={['Kiri', 'Tengah', 'Kanan']} />
          </Group>
          <Group>
            <Label>Tindakan Hitung Mundur Selesai</Label>
            <Sel value={s.aksiSelesai} onChange={(v) => set('aksiSelesai', v)} options={['Ubah Konten', 'Sembunyikan Bagian', 'Tidak ada']} />
            {s.aksiSelesai === 'Ubah Konten' && (
              <>
                <Label className="mt-3">Judul Selesai</Label>
                <Txt value={s.judulSelesai} onChange={(v) => set('judulSelesai', v)} placeholder={s.judul} />
                <Label className="mt-3">Deskripsi Selesai</Label>
                <textarea
                  value={s.deskripsiSelesai || ''}
                  onChange={(e) => set('deskripsiSelesai', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-divider p-2.5 text-sm bg-white focus:outline-none focus:border-primary"
                />
                <div className="mt-2"><CheckRow label="Sembunyikan Waktu Hitung Mundur" checked={s.sembunyikanWaktu} onChange={(v) => set('sembunyikanWaktu', v)} /></div>
                <CheckRow label="Tampilkan tombol saat hitungan mundur selesai" checked={s.tombolSelesaiShow} onChange={(v) => set('tombolSelesaiShow', v)} />
                {s.tombolSelesaiShow && (
                  <>
                    <Label className="mt-2">Teks Tombol</Label><Txt value={s.tombolSelesaiTeks} onChange={(v) => set('tombolSelesaiTeks', v)} />
                    <Label className="mt-3">Tautan Tombol</Label><Txt value={s.tombolSelesaiLink} onChange={(v) => set('tombolSelesaiLink', v)} placeholder="https://www.zunixe.com/products" />
                  </>
                )}
              </>
            )}
          </Group>
        </>
      );
    case 'featured':
    case 'latest':
    case 'bundle': {
      const picker = id === 'featured' ? 'produkIds' : (id === 'bundle' ? 'bundleIds' : null);
      return (
        <>
          <Group title="Tampilan"><LayoutPicker options={tampilanOpts().filter((o) => id !== 'bundle' || o.value === 'Grid' || o.value === 'Banner - Grid')} value={s.tampilan} onChange={(v) => set('tampilan', v)} /></Group>
          {picker && (
            <Group>
              <ProductPicker selected={s[picker]} onChange={(v) => set(picker, v)} storeId={storeId} />
            </Group>
          )}
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            {id === 'latest' && (
              <>
                <Label className="mt-4">Tipe Tombol</Label>
                <Sel value={s.tombolTipe} onChange={(v) => set('tombolTipe', v)} options={['Outlined', 'Filled', 'Teks']} />
                <ColorRow label="Warna Tombol" value={s.tombolWarna} onChange={(v) => set('tombolWarna', v)} />
              </>
            )}
            <Label className="mt-4">Efek Gambar Produk</Label>
            <Sel value={s.efek} onChange={(v) => set('efek', v)} options={IMG_EFFECT} />
            <Label className="mt-3">Style Produk</Label>
            <Sel value={s.style} onChange={(v) => set('style', v)} options={PRODUCT_STYLE} />
            {(id === 'latest' || id === 'bundle') && (
              <>
                <Label className="mt-3">Produk per baris</Label>
                <Sel value={String(s.perBaris)} onChange={(v) => set('perBaris', Number(v))} options={['2', '3', '4', '5', '6']} />
              </>
            )}
            {id === 'latest' && (
              <>
                <Label className="mt-3">Jumlah Produk</Label>
                <Sel value={String(s.jumlah)} onChange={(v) => set('jumlah', Number(v))} options={['4', '6', '8', '10', '12', '16', '20']} />
              </>
            )}
            {id !== 'bundle' && (
              <>
                <Label className="mt-3">Tampilkan Deskripsi Singkat</Label>
                <Sel value={s.deskripsi} onChange={(v) => set('deskripsi', v)} options={['Standar', 'Sembunyikan', 'Selalu tampil']} />
                <div className="mt-3"><CheckRow label="Tampilkan Label Produk" checked={s.label !== false && s.label !== 'Sembunyikan'} onChange={(v) => set('label', v)} /></div>
              </>
            )}
            <div className="mt-3"><CheckRow label="Perlihatkan tombol 'Tampilkan Semua'" checked={s.tampilkanSemua} onChange={(v) => set('tampilkanSemua', v)} /></div>
          </Group>
        </>
      );
    }
    case 'faq':
      return (
        <>
          <Group title="Tampilan"><LayoutPicker options={tampilanOpts().filter((o) => o.value === 'Grid' || o.value === 'Banner - Grid')} value={s.tampilan} onChange={(v) => set('tampilan', v)} /></Group>
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            <Label className="mt-4">Kategori</Label>
            <Sel value={s.kategori} onChange={(v) => set('kategori', v)} options={[{ value: '', label: 'Select an option' }, { value: 'general', label: 'general' }]} />
            <p className="text-xs text-subdued mt-2">Anda dapat Menambahkan atau Memperbarui FAQ Anda dari menu FAQ.</p>
          </Group>
        </>
      );
    case 'footer':
      return (
        <>
          <Group title="Tampilan Baris">
            <Sel value={s.baris} onChange={(v) => set('baris', v)} options={['1 Baris', '2 Baris']} />
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-lg bg-gray-50 border border-divider p-2.5">
                  <p className="text-xs font-bold text-neutral mb-1">Column {n}</p>
                  <Txt value={s[`col${n}`]} onChange={(v) => set(`col${n}`, v)} className="h-8 text-xs" />
                </div>
              ))}
            </div>
          </Group>
          <Group title="Warna">
            <ColorRow label="Warna Latar Belakang" value={s.latar} onChange={(v) => set('latar', v)} />
            <ColorRow label="Warna Text & Icon" value={s.teks} onChange={(v) => set('teks', v)} />
          </Group>
          <Group title="Tampilan">
            <Label>Lebar Konten</Label>
            <Seg options={LEBAR} value={s.lebar} onChange={(v) => set('lebar', v)} />
            <div className="mt-3">
              <ToggleRow label="Tata Letak Seluler Cerdas" checked={s.seluler} onChange={(v) => set('seluler', v)} />
              <p className="text-[11px] text-subdued">Tata letak seluler yang sempurna, otomatis. Cukup aktifkan Tata Letak Seluler Cerdas dan desain Anda akan tampil memukau di perangkat mana pun.</p>
            </div>
          </Group>
        </>
      );
    case 'paragraf':
      return (
        <>
          <Group title="Konten">
            <Label>Teks Paragraf</Label>
            <textarea
              value={s.teks || ''}
              onChange={(e) => set('teks', e.target.value)}
              rows={6}
              className="w-full rounded-md border border-divider p-2.5 text-sm bg-white focus:outline-none focus:border-primary"
              placeholder="Tulis paragraf pembuka, pengumuman, atau cerita toko…"
            />
          </Group>
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
          </Group>
        </>
      );
    case 'marquee':
      return (
        <>
          <Group title="Konten">
            <Label>Item Marquee</Label>
            <textarea
              value={s.items || ''}
              onChange={(e) => set('items', e.target.value)}
              rows={4}
              className="w-full rounded-md border border-divider p-2.5 text-sm bg-white focus:outline-none focus:border-primary"
              placeholder={'Gratis ongkir seluruh Jawa\nGaransi 100% original\nDiskon 10% pembelian pertama'}
            />
            <p className="text-[11px] text-subdued mt-1">Satu item per baris; item berjalan berurutan dari kanan ke kiri.</p>
          </Group>
          <Group title="Pengaturan"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></Group>
        </>
      );
    case 'gambarTeks':
      return (
        <>
          <Group title="Konten">
            <Label>Gambar</Label>
            <ImageField value={s.image || ''} onChange={(v) => set('image', v)} />
            <Label className="mt-3">Posisi Gambar</Label>
            <Seg options={['Kiri', 'Kanan']} value={s.posisi || 'Kiri'} onChange={(v) => set('posisi', v)} />
            <Label className="mt-3">Teks</Label>
            <textarea
              value={s.teks || ''}
              onChange={(e) => set('teks', e.target.value)}
              rows={5}
              className="w-full rounded-md border border-divider p-2.5 text-sm bg-white focus:outline-none focus:border-primary"
            />
            <div className="mt-3"><Label>Teks Tombol (opsional)</Label><Txt value={s.tombolTeks || ''} onChange={(v) => set('tombolTeks', v)} /></div>
            <div className="mt-2"><Label>Tautan Tombol</Label><Txt value={s.tombolLink || ''} onChange={(v) => set('tombolLink', v)} placeholder="https://…" /></div>
          </Group>
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
          </Group>
        </>
      );
    case 'videoTeks':
      return (
        <>
          <Group title="Konten">
            <Label>URL Video</Label>
            <Txt value={s.videoUrl || ''} onChange={(v) => set('videoUrl', v)} placeholder="https://youtube.com/watch?v=… atau URL file .mp4" />
            <Label className="mt-3">Posisi Video</Label>
            <Seg options={['Kiri', 'Kanan']} value={s.posisi || 'Kiri'} onChange={(v) => set('posisi', v)} />
            <Label className="mt-3">Teks</Label>
            <textarea
              value={s.teks || ''}
              onChange={(e) => set('teks', e.target.value)}
              rows={5}
              className="w-full rounded-md border border-divider p-2.5 text-sm bg-white focus:outline-none focus:border-primary"
            />
          </Group>
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
          </Group>
        </>
      );
    case 'daftarLogo':
    case 'kolase':
      return (
        <>
          <Group title="Gambar">
            <ImageListEditor value={s.images} onChange={(v) => set('images', v)} />
          </Group>
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
          </Group>
        </>
      );
    case 'produkKategori':
      return (
        <>
          <Group title="Konten">
            <Label>Nama Kategori</Label>
            <Txt value={s.kategori || ''} onChange={(v) => set('kategori', v)} placeholder="Persis seperti nama kategori produk" />
            <p className="text-[11px] text-subdued mt-1">Produk dengan kategori ini ditampilkan di seksi. Lihat nama kategori di menu Produk.</p>
          </Group>
          <Group title="Pengaturan">
            <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
            <Label className="mt-3">Jumlah Produk</Label>
            <Sel value={String(s.jumlah || 10)} onChange={(v) => set('jumlah', Number(v))} options={['4', '6', '8', '10', '12', '16', '20']} />
            <Label className="mt-3">Produk per baris</Label>
            <Sel value={String(s.perBaris || 5)} onChange={(v) => set('perBaris', Number(v))} options={['2', '3', '4', '5', '6']} />
            <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
          </Group>
        </>
      );
    case 'semuaProduk':
      return (
        <Group title="Pengaturan">
          <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
          <Label className="mt-3">Jumlah Produk</Label>
          <Sel value={String(s.jumlah || 10)} onChange={(v) => set('jumlah', Number(v))} options={['4', '6', '8', '10', '12', '16', '20', '24']} />
          <Label className="mt-3">Produk per baris</Label>
          <Sel value={String(s.perBaris || 5)} onChange={(v) => set('perBaris', Number(v))} options={['2', '3', '4', '5', '6']} />
          <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
        </Group>
      );
    default:
      return (
        <Group title="Pengaturan">
          <TitleStyle value={s.judul} onChange={(v) => set('judul', v)} />
          <div className="mt-3"><CheckRow label="Perlihatkan ke customer" checked={s.visible !== false} onChange={(v) => set('visible', v)} /></div>
        </Group>
      );
  }
}

const Trash2Icon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

/* Panel seksi lengkap: header + 3 tab + Hapus Bagian. */
export function SectionPanel({ id, draft, patch, storeId, onBack, onDelete }) {
  const [tab, setTab] = useState('konten');
  const s = draft.sections[id] || {};
  const meta = SECTION_META[id];
  const title = meta ? meta.label : id;
  return (
    <>
      <PanelHeader title={title} onBack={onBack} />
      <SectionTabs tab={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto">
        {tab === 'konten' && <SectionKonten id={id} s={s} patch={patch} storeId={storeId} />}
        {tab === 'desain' && <DesainTab s={s} patch={patch} path={`sections.${id}`} defaultAnim={DEFAULT_ANIM[id]} />}
        {tab === 'pengaturan' && <PengaturanTab s={s} patch={patch} path={`sections.${id}`} />}
        {id !== 'footer' && <DelSection onClick={onDelete} />}
      </div>
    </>
  );
}

/* ---------- Pengaturan halaman selain Home (pemilih halaman) ---------- */

const PageTitle = ({ children }) => <h4 className="text-sm font-bold text-neutral pt-3 pb-2">{children}</h4>;
const Wire = ({ kind }) => {
  if (kind === 'vertical') return <div className="absolute inset-2 flex gap-1"><div className="w-3 flex flex-col gap-1">{[0, 1, 2].map((i) => <div key={i} className="flex-1 bg-gray-400/60 rounded-sm" />)}</div><div className="flex-1 bg-gray-400/60 rounded-sm" /></div>;
  if (kind === 'collage') return <div className="absolute inset-2 grid grid-cols-3 gap-1">{[0, 1, 2, 3, 4].map((i) => <div key={i} className={cx('bg-gray-400/60 rounded-sm', i < 2 && 'col-span-1')} />)}</div>;
  if (kind === 'list') return <div className="absolute inset-2 flex flex-col gap-1 justify-center">{[0, 1, 2].map((i) => <div key={i} className="h-2 bg-gray-400/60 rounded-sm" />)}</div>;
  return <div className="absolute inset-2 flex flex-col gap-1"><div className="flex-1 bg-gray-400/60 rounded-sm" /><div className="flex gap-1">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="flex-1 h-2 bg-gray-400/60 rounded-sm" />)}</div></div>;
};

export function KatalogPagePanel({ draft, patch }) {
  const k = draft.pages?.katalog || {};
  const set = (key, v) => patch(`pages.katalog.${key}`, v);
  return (
    <div className="space-y-1 pb-4">
      <PageTitle>Tampilan Kategori</PageTitle>
      <CheckRow label="Tampilkan di navigasi atas" checked={k.kategoriNavAtas} onChange={(v) => set('kategoriNavAtas', v)} />
      <p className="text-[11px] text-subdued -mt-1 pl-6">Tampilkan daftar kategori di atas judul kategori</p>
      <div className="pt-2"><Label>Judul kategori</Label><Sel value={k.judulKategori} onChange={(v) => set('judulKategori', v)} options={['Kecil', 'Sedang', 'Besar']} /></div>
      <ColorRow label="Warna judul kategori" value={k.warnaJudulKategori} onChange={(v) => set('warnaJudulKategori', v)} />
      <div><Label>Posisi</Label><Sel value={k.posisiGambar} onChange={(v) => set('posisiGambar', v)} options={['Di Dalam', 'Di Luar']} /></div>
      <div className="pt-2"><Label>Menu</Label><Seg options={['Standar', 'Kustom', 'Multi-select']} value={k.menu} onChange={(v) => set('menu', v)} /></div>
      <button type="button" className="w-full h-10 mt-2 rounded-md bg-primary-surface text-primary text-sm font-medium cursor-pointer">Tambah item menu</button>
      <div className="border-t border-divider mt-4" />
      <PageTitle>Urutkan dan filter</PageTitle>
      <div className="flex border-b border-divider">
        {['Side', 'Top', 'Modal'].map((f) => (
          <button key={f} type="button" onClick={() => set('filter', f)} className={cx('flex-1 h-9 text-sm border-b-2 -mb-px cursor-pointer', k.filter === f ? 'border-primary text-primary' : 'border-transparent text-subdued')}>{f}</button>
        ))}
      </div>
      <CheckRow label="Izinkan pembeli mengatur rentang harga" checked={k.rentangHarga} onChange={(v) => set('rentangHarga', v)} />
      <div className="border-t border-divider mt-3" />
      <PageTitle>Efek Produk</PageTitle>
      <Seg options={IMG_EFFECT} value={k.efek} onChange={(v) => set('efek', v)} />
      <div className="border-t border-divider mt-4" />
      <PageTitle>Produk Unggulan</PageTitle>
      <CheckRow label="Tampilkan Status Produk" checked={k.statusProduk} onChange={(v) => set('statusProduk', v)} />
      <CheckRow label="Perlihatkan label diskon pengiriman" checked={k.labelOngkir} onChange={(v) => set('labelOngkir', v)} />
      <CheckRow label="Beri jarak kiri dan kanan lebih di desktop" checked={k.jarakDesktop} onChange={(v) => set('jarakDesktop', v)} />
      <CheckRow label="Tampilkan Kategori yang Dipromosikan di Katalog" checked={k.kategoriPromo} onChange={(v) => set('kategoriPromo', v)} />
    </div>
  );
}

export function DetailPagePanel({ draft, patch }) {
  const d = draft.pages?.detail || {};
  const set = (key, v) => patch(`pages.detail.${key}`, v);
  const hidden = d.sembunyi || [];
  const toggle = (name) => set('sembunyi', hidden.includes(name) ? hidden.filter((x) => x !== name) : [...hidden, name]);
  const Block = ({ name }) => (
    <div className={cx('group flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-neutral', hidden.includes(name) && 'opacity-50')}>
      <span className="flex items-center gap-2"><GripIcon />{name}</span>
      <button type="button" onClick={() => toggle(name)} className="text-xs text-subdued hover:text-neutral opacity-0 group-hover:opacity-100 cursor-pointer">{hidden.includes(name) ? 'Tampilkan' : 'Sembunyikan'}</button>
    </div>
  );
  return (
    <div className="space-y-1 pb-4">
      <PageTitle>Tampilan Gambar</PageTitle>
      <LayoutPicker
        options={[{ value: 'Default', label: 'Default', icon: <Wire /> }, { value: 'Vertical', label: 'Vertical', icon: <Wire kind="vertical" /> }, { value: 'Collage', label: 'Collage', icon: <Wire kind="collage" /> }]}
        value={d.gambar}
        onChange={(v) => set('gambar', v)}
      />
      <div className="pt-2"><Label>Rasio Aspek Miniatur</Label><Sel value={d.rasio} onChange={(v) => set('rasio', v)} options={['1:1', '4:5', '3:4']} /></div>
      <CheckRow label="Beri efek perbesar pada foto produk" checked={d.zoom} onChange={(v) => set('zoom', v)} />
      <div className="border-t border-divider mt-3" />
      <PageTitle>Tampilan varian</PageTitle>
      <LayoutPicker options={[{ value: 'List', label: 'List', icon: <Wire kind="list" /> }, { value: 'Selection', label: 'Selection', icon: <Wire kind="list" /> }]} value={d.varian} onChange={(v) => set('varian', v)} />
      <PageTitle>Konten Produk</PageTitle>
      <Seg options={['Standar', 'Tab Produk']} value={d.konten} onChange={(v) => set('konten', v)} />
      <PageTitle>Bagian Atas</PageTitle>
      <div className="space-y-1.5">{(d.atas || []).map((n) => <Block key={n} name={n} />)}</div>
      <PageTitle>Bagian Bawah</PageTitle>
      <div className="space-y-1.5">{(d.bawah || []).map((n) => <Block key={n} name={n} />)}</div>
    </div>
  );
}

export function KeranjangPagePanel({ draft, patch }) {
  const k = draft.pages?.keranjang || {};
  return (
    <div className="space-y-1 pb-4">
      <PageTitle>Keranjang</PageTitle>
      <CheckRow label="Tampilkan notifikasi saat produk ditambahkan" checked={k.notifikasi} onChange={(v) => patch('pages.keranjang.notifikasi', v)} />
      <CheckRow label="Tampilkan rekomendasi produk" checked={k.rekomendasi} onChange={(v) => patch('pages.keranjang.rekomendasi', v)} />
    </div>
  );
}

export function EmptyPagePanel({ page }) {
  return (
    <div className="py-10 px-4 text-center">
      <p className="text-sm font-semibold text-neutral">{page}</p>
      <p className="mt-1 text-xs text-subdued">Halaman ini mengikuti pengaturan di Desain Website (warna, font, tombol).</p>
    </div>
  );
}

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-subdued" aria-hidden="true"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
);

/* Katalog Tambah Bagian. */
export function AddSectionPanel({ onBack, onAdd, existing }) {
  return (
    <>
      <PanelHeader title="Tambah Bagian" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {SECTION_CATALOG.map((g) => (
          <div key={g.group} className="border-b border-divider">
            <p className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-wider text-subdued">{g.group}</p>
            {g.items.map((it) => {
              const Icon = SECTION_ICONS[it.id] || LayoutGrid;
              const already = existing.includes(it.id);
              return (
                <button
                  key={it.id}
                  type="button"
                  disabled={already}
                  onClick={() => onAdd(it.id, it.label)}
                  className={cx('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm', already ? 'text-subdued/50 cursor-not-allowed' : 'text-neutral hover:bg-gray-50 cursor-pointer')}
                >
                  <Icon className="w-4 h-4 text-subdued shrink-0" />
                  {it.label}
                  {already && <span className="ml-auto text-[10px]">Terpasang</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
