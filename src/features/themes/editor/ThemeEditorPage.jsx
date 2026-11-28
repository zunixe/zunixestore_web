import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDown, Monitor, Smartphone, Maximize2, Undo2, Redo2, Palette, Plus, LayoutGrid,
  Megaphone, PanelTop, MousePointerClick, EyeOff, Eye, Trash2, GripVertical, X,
  ShoppingBag, ShoppingCart, ClipboardList, User, LogIn, Receipt, Home,
} from 'lucide-react';
import { fetchThemes } from '../themesSlice';
import { previewUrl } from '../themeUtils';
import { useStoreSetting } from '../../store-design/useStoreSetting';
import api from '../../../utils/api';
import {
  PAGE_OPTIONS, PAGE_PATHS, HOME_ITEMS, SECTION_META,
  GENERIC_SECTION, SECTION_EXTRAS, mergeDraft, draftFromThemeConfig, toStoreSettings,
} from './schema';
import {
  GlobalPanel, PengumumanPanel, HeaderPanel, FloatingPanel, SectionPanel, AddSectionPanel, SECTION_ICONS,
  KatalogPagePanel, DetailPagePanel, KeranjangPagePanel, EmptyPagePanel,
} from './panels';

const cx = (...c) => c.filter(Boolean).join(' ');
const HOME_ICONS = { pengumuman: Megaphone, header: PanelTop, floating: MousePointerClick };
const PAGE_ICONS = {
  'Halaman Home': Home, 'Halaman Katalog': LayoutGrid, 'Halaman Detail Produk': ShoppingBag,
  'Halaman keranjang': ShoppingCart, 'Halaman Pemesanan': ClipboardList, 'Halaman Akun': User,
  'Masuk & Daftar': LogIn, 'Halaman Order': Receipt,
};

const TOUR_STEPS = [
  { pos: 'left-[420px] top-16', title: 'Tentukan tampilan toko Anda', text: 'Menu ini memungkinkan Anda untuk menyesuaikan tampilan keseluruhan toko Anda seperti skema warna, font, tombol, dan preferensi tata letak.' },
  { pos: 'left-[420px] top-28', title: 'Pilih halaman', text: 'Ganti halaman yang ingin diedit — pratinjau ikut berpindah ke halaman tersebut.' },
  { pos: 'left-[420px] top-48', title: 'Daftar Bagian', text: 'Klik bagian untuk mengedit isinya, seret untuk mengubah urutan, atau sembunyikan lewat ikon mata.' },
  { pos: 'right-6 top-16', title: 'Toolbar', text: 'Ganti tampilan seluler/desktop/layar penuh, urungkan perubahan, lalu Simpan.' },
  { pos: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', title: 'Pratinjau Langsung', text: 'Setiap perubahan langsung terlihat di pratinjau. Klik bagian di pratinjau untuk mengeditnya.' },
];

function setIn(obj, path, value) {
  const keys = path.split('.');
  const out = { ...obj };
  let cur = out;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) { cur[k] = value; return; }
    cur[k] = (cur[k] && typeof cur[k] === 'object') ? (Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] }) : {};
    cur = cur[k];
  });
  return out;
}

export default function ThemeEditorPage() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { themes, activeTheme } = useSelector((s) => s.themes);
  // themeId bisa berupa themes.id (template) ATAU designId entri duplikat di my_designs.
  const designs = useStoreSetting('my_designs', []);
  const entries = useMemo(() => (Array.isArray(designs.value) ? designs.value : []), [designs.value]);
  const entry = useMemo(() => entries.find((e) => e.designId === themeId) || null, [entries, themeId]);
  const theme = themes.find((t) => t.id === themeId)
    || (entry ? themes.find((t) => t.id === entry.themeId) : null)
    || (activeTheme?.id === themeId ? activeTheme : null);

  const [view, setView] = useState({ type: 'root' });
  const [page, setPage] = useState('Halaman Home');
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [device, setDevice] = useState('desktop'); // mobile | desktop | full
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [tour, setTour] = useState(null);
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const frameRef = useRef(null);
  const [frameReady, setFrameReady] = useState(false);
  const productIdRef = useRef(null);

  const [history, setHistory] = useState({ past: [], present: null, future: [] });
  const draft = history.present;
  const [saved, setSaved] = useState(null);
  const draftReady = useRef(false);
  const dirty = !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);

  /* Muat tema + seed draft dari theme.config dan store_settings. */
  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  useEffect(() => {
    if (!theme || draftReady.current || !currentStore || !designs.loaded) return;
    draftReady.current = true;
    let cfg = {};
    try { cfg = JSON.parse(theme.config || '{}'); } catch { cfg = {}; }
    const init = (next) => {
      setHistory({ past: [], present: next, future: [] });
      setSaved(next);
      try { if (!localStorage.getItem(`tour_${themeId}`)) setTour('welcome'); } catch { /* abaikan */ }
    };
    api.get(`/stores/${currentStore.id}/settings`).then((res) => {
      // Nilai store_settings tersimpan sebagai JSON ("\"teks\"", "[...]") → urai dulu.
      const st = Object.fromEntries(Object.entries(res?.data || {}).map(([k, v]) => {
        if (typeof v !== 'string' || !/^["[{]/.test(v.trim())) return [k, v];
        try { return [k, JSON.parse(v)]; } catch { return [k, v]; }
      }));
      const asObj = (v) => (v && typeof v === 'object' ? v : JSON.parse(v));
      /* Prioritas draft: draft duplikat (entry.design) → design_<template> → theme.config → warna lama. */
      let base;
      let fromSaved = true;
      if (entry?.design) {
        base = mergeDraft(entry.design);
      } else if (st[`design_${theme.template}`]) {
        try { base = mergeDraft(asObj(st[`design_${theme.template}`])); } catch { base = draftFromThemeConfig(cfg); fromSaved = false; }
      } else {
        base = draftFromThemeConfig(cfg);
        fromSaved = false;
      }
      let next = { ...base };
      const arr = (v) => { if (Array.isArray(v)) return v; try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } };
      /* Draft belum pernah disimpan → isi dari pengaturan toko yang sedang tayang. */
      if (!fromSaved) {
        if (st.slider_images !== undefined) next.sections = setIn(next.sections, 'slideshow.images', arr(st.slider_images));
        if (st.announcement_text) next.home = setIn(next.home, 'pengumuman.teks', st.announcement_text);
        if (st.countdown_end) {
          const d = new Date(st.countdown_end);
          if (!Number.isNaN(d.getTime())) {
            // Tanggal & jam dalam WIB.
            const wib = new Date(d.getTime() + 7 * 3600000).toISOString();
            next.sections = setIn(next.sections, 'countdown.tanggal', wib.slice(0, 10));
            next.sections = setIn(next.sections, 'countdown.waktu', wib.slice(11, 16));
          }
        }
        const title = st.countdown_title || st.hero_title;
        if (title) next.sections = setIn(next.sections, 'countdown.judul', title);
        if (st.countdown_desc) next.sections = setIn(next.sections, 'countdown.deskripsi', st.countdown_desc);
        if (st.hero_subtitle) next.sections = setIn(next.sections, 'countdown.deskripsiSelesai', st.hero_subtitle);
        if (st.hero_banner_url) next.sections = setIn(next.sections, 'countdown.image', st.hero_banner_url);
        if (st.featured_title) next.sections = setIn(next.sections, 'featured.judul.text', st.featured_title);
        if (st.latest_title) next.sections = setIn(next.sections, 'latest.judul.text', st.latest_title);
        if (st.faq_title) next.sections = setIn(next.sections, 'faq.judul.text', st.faq_title);
        const ids = st.featured_product_ids || st.featured_products;
        if (ids) next.sections = setIn(next.sections, 'featured.produkIds', arr(ids));
        if (st.footer_cols) {
          try { const c = asObj(st.footer_cols); ['col1', 'col2', 'col3'].forEach((k) => { if (c[k]) next.sections = setIn(next.sections, `footer.${k}`, c[k]); }); } catch { /* abaikan */ }
        }
        if (st.wishlist_enabled !== undefined) next.global = setIn(next.global, 'wishlist', String(st.wishlist_enabled) === '1');
        if (st.bottom_nav_enabled !== undefined) next.global = setIn(next.global, 'bottomNav.aktif', String(st.bottom_nav_enabled) === '1');
        if (st.custom_css) next.global = setIn(next.global, 'customCss', st.custom_css);
        next = mergeDraft(next);
      }
      init(next);
    }).catch(() => init(base_fallback(cfg)));
  }, [theme, currentStore, designs.loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = useCallback((path, value) => {
    setHistory((h) => ({
      past: [...h.past.slice(-49), h.present],
      present: setIn(h.present, path, value),
      future: [],
    }));
  }, []);

  const undo = () => setHistory((h) => h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h);
  const redo = () => setHistory((h) => h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h);

  const flash = (tone, text) => { setNotice({ tone, text }); setTimeout(() => setNotice(null), 3500); };

  /* ---------- Pratinjau langsung (postMessage ke storefront ?editing=1) ---------- */
  const post = useCallback((msg) => {
    try { frameRef.current?.contentWindow?.postMessage(msg, '*'); } catch { /* abaikan */ }
  }, []);

  useEffect(() => {
    const onMsg = (e) => {
      if (!frameRef.current || e.source !== frameRef.current.contentWindow || !e.data || typeof e.data.type !== 'string') return;
      if (e.data.type === 'zx-ready') setFrameReady((n) => n + 1);
      if (e.data.type === 'zx-section-click' && e.data.id) {
        const id = e.data.id;
        if (HOME_ITEMS.some((h) => h.id === id)) setView({ type: 'home', id });
        else setView({ type: 'section', id });
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Draft terbaru → pratinjau (setiap perubahan, tanpa menyimpan).
  useEffect(() => { if (frameReady && draft) post({ type: 'zx-design', design: draft }); }, [draft, frameReady, post]);

  // Hover baris sidebar → garis tipis di pratinjau (seperti Plugo).
  const hoverOn = useCallback((id) => { if (frameReady) post({ type: 'zx-hover', id }); }, [frameReady, post]);

  // Seksi yang dibuka di sidebar → sorot + scroll di pratinjau.
  const selectedId = view.type === 'section' || view.type === 'home' ? view.id : null;
  useEffect(() => { if (frameReady) post({ type: 'zx-select', id: selectedId }); }, [selectedId, frameReady, post]);

  // Pemilih halaman → pratinjau pindah halaman.
  useEffect(() => {
    if (!frameReady) return;
    const path = PAGE_PATHS[page] || '/';
    const go = (p) => post({ type: 'zx-navigate', path: p });
    if (!path.includes('{product}')) { go(path); return; }
    if (productIdRef.current) { go(path.replace('{product}', productIdRef.current)); return; }
    api.get(`/stores/${currentStore.id}/products?limit=30&status=published`).then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.products || res.data?.items || []);
      // Produk biasa yang sudah tayang (bukan bundle), seperti pratinjau Plugo.
      const isBundle = (p) => { try { const d = typeof p.description === 'string' ? JSON.parse(p.description) : p.description; return !!d?.is_bundle; } catch { return false; } };
      const pick = list.find((p) => p.status === 'published' && !isBundle(p)) || list.find((p) => !isBundle(p)) || list[0];
      productIdRef.current = pick?.id || null;
      go(productIdRef.current ? path.replace('{product}', productIdRef.current) : '/products');
    }).catch(() => go('/products'));
  }, [page, frameReady, post, currentStore]);

  const save = async () => {
    if (!currentStore || !theme || !draft) return;
    setSaving(true);
    try {
      if (entry) {
        /* Desain duplikat punya draft sendiri di my_designs — tidak menyentuh
           kunci live sampai desain ini diterapkan lewat "Terapkan Sekarang". */
        const ok = await designs.save(entries.map((e) => (e === entry ? { ...e, design: draft } : e)));
        if (!ok) throw new Error('Gagal menyimpan desain.');
      } else {
        const body = { [`design_${theme.template}`]: JSON.stringify(draft) };
        if (theme.is_active) Object.assign(body, toStoreSettings(draft));
        await api.put(`/stores/${currentStore.id}/settings`, body);
      }
      setSaved(draft);
      flash('success', 'Desain tersimpan.');
    } catch (err) {
      flash('danger', err.message || 'Gagal menyimpan desain.');
    } finally {
      setSaving(false);
    }
  };

  /* Batal: buang semua perubahan sejak simpan terakhir (seperti Plugo). */
  const cancel = () => {
    setHistory({ past: [], present: saved, future: [] });
    setView({ type: 'root' });
    setPage('Halaman Home');
  };

  /* Navigasi panel */
  const openRoot = () => setView({ type: 'root' });
  const deleteSection = (id) => {
    setHistory((h) => ({ past: [...h.past.slice(-49), h.present], present: { ...h.present, order: h.present.order.filter((x) => x !== id) }, future: [] }));
    openRoot();
  };
  const toggleVisible = (id) => {
    const s = draft.sections[id] || {};
    patch(`sections.${id}.visible`, s.visible === false);
  };
  const addSection = (id, label) => {
    setHistory((h) => {
      let present = h.present;
      if (!present.sections[id]) present = setIn(present, `sections.${id}`, { ...GENERIC_SECTION, ...(SECTION_EXTRAS[id] || {}), customLabel: label });
      if (!present.order.includes(id)) {
        // Seksi baru masuk sebelum Footer.
        const order = [...present.order];
        const fi = order.indexOf('footer');
        order.splice(fi >= 0 ? fi : order.length, 0, id);
        present = { ...present, order };
      }
      return { past: [...h.past.slice(-49), h.present], present, future: [] };
    });
    setView({ type: 'section', id });
  };

  const moveSection = (from, to) => {
    if (from === to || from == null) return;
    setHistory((h) => {
      const order = [...h.present.order];
      order.splice(to, 0, order.splice(from, 1)[0]);
      return { past: [...h.past.slice(-49), h.present], present: { ...h.present, order }, future: [] };
    });
  };

  const endTour = () => { try { localStorage.setItem(`tour_${themeId}`, '1'); } catch { /* abaikan */ } setTour(null); };

  const frameSrc = useMemo(() => {
    const base = theme ? previewUrl(currentStore, theme) : '';
    return base ? `${base}${base.includes('?') ? '&' : '?'}editing=1` : '';
  }, [currentStore, theme]);
  const isActive = !entry && !!theme?.is_active;

  if (!draft) {
    if (themes.length > 0 && designs.loaded && !theme) {
      return (
        <div className="fixed inset-0 z-50 bg-page flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-subdued">Desain tidak ditemukan.</p>
          <button type="button" onClick={() => navigate('/settings/themes')} className="h-9 px-4 rounded-md bg-primary text-white text-sm font-medium cursor-pointer">Kembali</button>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-50 bg-page flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const sectionTitle = (id) => draft.sections[id]?.customLabel || SECTION_META[id]?.label || id;
  const sectionSub = (id) => {
    const s = draft.sections[id] || {};
    if (s.customLabel) return '';
    const f = SECTION_META[id]?.sub;
    return typeof f === 'function' ? f(s) : (f || '');
  };

  const topbarBtn = 'w-9 h-9 rounded-md flex items-center justify-center text-neutral hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const deviceBtn = (d) => cx('w-8 h-8 rounded-md flex items-center justify-center cursor-pointer', device === d ? 'bg-white text-primary shadow-sm' : 'text-subdued hover:text-neutral');
  const PageIcon = PAGE_ICONS[page] || LayoutGrid;
  const full = device === 'full';

  const pagePanel = () => {
    if (page === 'Halaman Katalog') return <KatalogPagePanel draft={draft} patch={patch} />;
    if (page === 'Halaman Detail Produk') return <DetailPagePanel draft={draft} patch={patch} />;
    if (page === 'Halaman keranjang') return <KeranjangPagePanel draft={draft} patch={patch} />;
    return <EmptyPagePanel page={page} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex overflow-hidden">
      {/* Sidebar kiri — disembunyikan di mode layar penuh */}
      <aside className={cx('shrink-0 border-r border-divider flex flex-col bg-white transition-[margin] duration-300', full ? '-ml-[400px]' : 'ml-0', 'w-[400px]')}>
        {view.type === 'root' && (
          <>
            <div className="px-3 pt-3 shrink-0">
              <button type="button" onClick={() => navigate('/settings/themes')} className="h-8 px-3 rounded-md border border-divider text-xs font-bold text-neutral hover:bg-gray-50 cursor-pointer">
                EXIT
              </button>
            </div>
            <div className="px-3 py-3 shrink-0">
              <button
                type="button"
                onClick={() => setView({ type: 'global' })}
                className="w-full h-11 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer bg-primary-surface text-primary hover:bg-primary-surface/80"
              >
                <Palette className="w-4 h-4" /> Desain Website
              </button>
            </div>
            <div className="px-3 shrink-0 relative">
              <button type="button" onClick={() => setPageMenuOpen((o) => !o)} className="w-full h-11 px-3 rounded-lg border border-divider flex items-center justify-between text-sm font-semibold text-neutral cursor-pointer">
                <span className="flex items-center gap-2"><PageIcon className="w-4 h-4 text-subdued" /> {page}</span>
                <ChevronDown className={cx('w-4 h-4 text-subdued transition-transform', pageMenuOpen && 'rotate-180')} />
              </button>
              {pageMenuOpen && (
                <div className="absolute left-3 right-3 top-12 z-20 rounded-lg border border-divider bg-white shadow-lg py-1 max-h-72 overflow-y-auto">
                  {PAGE_OPTIONS.map((p) => {
                    const Icon = PAGE_ICONS[p] || LayoutGrid;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { setPage(p); setPageMenuOpen(false); }}
                        className={cx('w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer', p === page ? 'bg-primary-surface text-primary font-medium' : 'text-neutral hover:bg-gray-50')}
                      >
                        <Icon className="w-4 h-4 text-subdued" /> {p}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Daftar isi */}
        <div className={cx('flex-1 min-h-0 flex flex-col', view.type === 'root' ? 'overflow-y-auto px-3 pb-3 mt-2' : '')}>
          {view.type === 'root' && page !== 'Halaman Home' && pagePanel()}
          {view.type === 'root' && page === 'Halaman Home' && (
            <>
              <p className="px-1 pt-1 pb-2 text-sm font-bold text-neutral">Homepage</p>
              <div className="space-y-1.5">
                {HOME_ITEMS.map((it) => {
                  const Icon = HOME_ICONS[it.id];
                  return (
                    <button key={it.id} type="button" onMouseEnter={() => hoverOn(it.id)} onMouseLeave={() => hoverOn(null)} onClick={() => { hoverOn(null); setView({ type: 'home', id: it.id }); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-neutral cursor-pointer">
                      <Icon className="w-4 h-4 text-neutral shrink-0" /> {it.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-1 pt-4 pb-2">
                <p className="text-sm font-bold text-neutral">Bagian</p>
                <button type="button" className="text-xs text-subdued inline-flex items-center gap-1 cursor-pointer">Standar <ChevronDown className="w-3.5 h-3.5" /></button>
              </div>
              <button type="button" onClick={() => setView({ type: 'add' })} className="w-full h-10 px-3 rounded-lg bg-primary-surface text-primary text-sm font-medium inline-flex items-center gap-2 cursor-pointer mb-2">
                <Plus className="w-4 h-4" /> Tambah Bagian
              </button>
              <div className="space-y-1.5">
                {draft.order.map((id, idx) => {
                  const s = draft.sections[id] || {};
                  const Icon = SECTION_ICONS[id] || LayoutGrid;
                  const sub = sectionSub(id);
                  const hidden = s.visible === false;
                  const fixed = id === 'footer';
                  return (
                    <div
                      key={id}
                      draggable={!fixed}
                      onDragStart={(e) => { dragFrom.current = idx; e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={(e) => { e.preventDefault(); if (dragOver !== id) setDragOver(id); }}
                      onDragLeave={() => setDragOver((d) => (d === id ? null : d))}
                      onDrop={(e) => { e.preventDefault(); if (!fixed) moveSection(dragFrom.current, idx); dragFrom.current = null; setDragOver(null); }}
                      onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
                      className={cx('group relative rounded-lg', dragOver === id && 'ring-2 ring-primary')}
                      onMouseEnter={() => hoverOn(id)}
                      onMouseLeave={() => hoverOn(null)}
                    >
                      <button
                        type="button"
                        onClick={() => { hoverOn(null); setView({ type: 'section', id }); }}
                        className={cx('w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-primary-surface/60 text-left cursor-pointer', hidden && 'opacity-60')}
                      >
                        <span className="relative w-5 h-5 shrink-0">
                          <Icon className="absolute inset-0 w-5 h-5 text-neutral transition-opacity group-hover:opacity-0" />
                          {!fixed && <GripVertical className="absolute inset-0 w-5 h-5 text-subdued opacity-0 group-hover:opacity-100 cursor-grab" />}
                        </span>
                        <span className="min-w-0 flex-1 pr-14">
                          <span className="block text-sm font-semibold text-neutral truncate">{sectionTitle(id)}</span>
                          {sub && <span className="block text-xs text-subdued truncate">{sub}</span>}
                        </span>
                      </button>
                      {/* Ikon hapus & sembunyikan saat hover (seperti Plugo). */}
                      {!fixed && (
                        <div className={cx('absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1', hidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                          <button type="button" onClick={() => deleteSection(id)} aria-label={`Hapus ${sectionTitle(id)}`} className="w-7 h-7 rounded-md flex items-center justify-center text-subdued hover:text-danger hover:bg-white cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => toggleVisible(id)} aria-label={hidden ? 'Tampilkan bagian' : 'Sembunyikan bagian'} className="w-7 h-7 rounded-md flex items-center justify-center text-subdued hover:text-neutral hover:bg-white cursor-pointer">
                            {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {view.type === 'global' && <GlobalPanel draft={draft} patch={patch} onBack={openRoot} />}
          {view.type === 'home' && view.id === 'pengumuman' && <PengumumanPanel draft={draft} patch={patch} onBack={openRoot} />}
          {view.type === 'home' && view.id === 'header' && <HeaderPanel draft={draft} patch={patch} onBack={openRoot} />}
          {view.type === 'home' && view.id === 'floating' && <FloatingPanel draft={draft} patch={patch} onBack={openRoot} />}
          {view.type === 'section' && (
            <SectionPanel key={view.id} id={view.id} draft={draft} patch={patch} storeId={currentStore?.id} onBack={openRoot} onDelete={() => deleteSection(view.id)} />
          )}
          {view.type === 'add' && <AddSectionPanel onBack={openRoot} onAdd={addSection} existing={draft.order} />}
        </div>
      </aside>

      {/* Area preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#EEF1F8]">
        <div className="h-14 shrink-0 bg-white border-b border-divider flex items-center justify-between px-4">
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
            <button type="button" onClick={() => setDevice('mobile')} aria-label="Tampilan seluler" title="Seluler" className={deviceBtn('mobile')}><Smartphone className="w-4 h-4" /></button>
            <button type="button" onClick={() => setDevice('desktop')} aria-label="Tampilan desktop" title="Desktop" className={deviceBtn('desktop')}><Monitor className="w-4 h-4" /></button>
            <button type="button" onClick={() => setDevice('full')} aria-label="Layar penuh" title="Layar penuh" className={deviceBtn('full')}><Maximize2 className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={undo} disabled={!history.past.length} aria-label="Urungkan" className={topbarBtn}><Undo2 className="w-4 h-4" /></button>
            <button type="button" onClick={redo} disabled={!history.future.length} aria-label="Ulangi" className={topbarBtn}><Redo2 className="w-4 h-4" /></button>
            {dirty && (
              <button type="button" onClick={cancel} className="ml-2 h-9 px-4 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary-surface cursor-pointer">
                Batal
              </button>
            )}
            <button type="button" onClick={save} disabled={saving || !dirty} className="ml-2 h-9 px-4 rounded-md bg-primary text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
        {notice && (
          <div className={cx('mx-4 mt-3 rounded-lg px-4 py-2.5 text-sm', notice.tone === 'success' ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger')}>{notice.text}</div>
        )}
        <div className={cx('flex-1 min-h-0 flex justify-center', full ? 'p-0' : 'p-4')}>
          <div
            className={cx(
              'h-full bg-white overflow-hidden transition-all duration-300',
              device === 'mobile' && 'w-[375px] rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.12)]',
              device === 'desktop' && 'w-full rounded-lg shadow-[0_1px_6px_rgba(0,0,0,0.08)]',
              full && 'w-full',
            )}
          >
            {frameSrc ? (
              <iframe ref={frameRef} key={frameSrc} src={frameSrc} title="Pratinjau toko" className="w-full h-full border-0" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-subdued">Alamat toko belum diatur — pratinjau tidak tersedia.</div>
            )}
          </div>
        </div>
        {!isActive && theme && !full && (
          <p className="px-4 pb-3 text-xs text-subdued text-center">Desain ini belum tayang — perubahan disimpan ke desain, terapkan lewat halaman Desain &amp; Template.</p>
        )}
      </div>

      {/* Tur selamat datang */}
      {tour === 'welcome' && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary-surface flex items-center justify-center">
              <Palette className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-neutral">Selamat Datang di Desain Toko!</h2>
            <p className="mt-2 text-xs text-subdued leading-relaxed">
              Tur singkat 60 detik ini akan menunjukkan dimana bisa memulai pembuatan toko online Kamu.
            </p>
            <button type="button" onClick={() => setTour(0)} className="mt-5 w-full h-9 rounded-md bg-primary text-white text-sm font-medium cursor-pointer">Mulai Tur</button>
            <button type="button" onClick={endTour} className="mt-2 text-xs text-subdued hover:text-neutral cursor-pointer">Lewati</button>
          </div>
        </div>
      )}
      {typeof tour === 'number' && TOUR_STEPS[tour] && (
        <div className="absolute inset-0 z-50 bg-black/40" onClick={endTour}>
          <div className={cx('absolute w-72 rounded-xl bg-white p-5 shadow-xl', TOUR_STEPS[tour].pos)} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-neutral">{TOUR_STEPS[tour].title}</p>
              <button type="button" onClick={endTour} className="text-subdued hover:text-neutral cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="mt-1.5 text-xs text-subdued leading-relaxed">{TOUR_STEPS[tour].text}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-subdued">{tour + 1} / {TOUR_STEPS.length}</span>
              <div className="flex gap-2">
                <button type="button" onClick={endTour} className="h-8 px-3 rounded-md border border-primary text-xs font-medium text-primary hover:bg-primary-surface cursor-pointer">Lewati</button>
                <button type="button" onClick={() => (tour + 1 < TOUR_STEPS.length ? setTour(tour + 1) : endTour())} className="h-8 px-3 rounded-md bg-primary text-white text-xs font-medium cursor-pointer">
                  {tour + 1 < TOUR_STEPS.length ? 'Lanjut' : 'Selesai'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function base_fallback(cfg) {
  return draftFromThemeConfig(cfg);
}
