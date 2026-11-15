import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDown, Monitor, Smartphone, Maximize2, Undo2, Redo2, Palette, Plus, LayoutGrid,
  Megaphone, PanelTop, MousePointerClick, EyeOff, GripVertical, X,
} from 'lucide-react';
import { fetchThemes } from '../themesSlice';
import { themeColors, previewUrl } from '../themeUtils';
import { useStoreSetting } from '../../store-design/useStoreSetting';
import api from '../../../utils/api';
import {
  DEFAULT_DRAFT, PAGE_OPTIONS, HOME_ITEMS, SECTION_META, SECTION_CATALOG,
  GENERIC_SECTION, mergeDraft, draftFromThemeConfig, toStoreSettings,
} from './schema';
import { GlobalPanel, PengumumanPanel, HeaderPanel, FloatingPanel, SectionPanel, AddSectionPanel, SECTION_ICONS } from './panels';

const cx = (...c) => c.filter(Boolean).join(' ');
const HOME_ICONS = { pengumuman: Megaphone, header: PanelTop, floating: MousePointerClick };

const TOUR_STEPS = [
  { pos: 'left-[420px] top-24', title: 'Daftar Bagian', text: 'Atur urutan dan isi tiap bagian halaman toko kamu dari sini. Seret kartu untuk mengubah posisi.' },
  { pos: 'left-[420px] top-40', title: 'Desain Website', text: 'Ubah warna, font, gaya produk, tombol, dan CSS kustom yang berlaku ke seluruh halaman.' },
  { pos: 'right-6 top-16', title: 'Toolbar', text: 'Ganti tampilan desktop/seluler, buka di tab baru, urungkan perubahan, lalu Simpan.' },
  { pos: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', title: 'Pratinjau Langsung', text: 'Semua perubahan yang kamu simpan langsung terlihat di pratinjau toko ini.' },
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
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [device, setDevice] = useState('desktop');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [frameKey, setFrameKey] = useState(0);
  const [tour, setTour] = useState(null);
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const [history, setHistory] = useState({ past: [], present: null, future: [] });
  const draft = history.present;
  const draftReady = useRef(false);

  /* Muat tema + seed draft dari theme.config dan store_settings. */
  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  useEffect(() => {
    if (!theme || draftReady.current || !currentStore || !designs.loaded) return;
    draftReady.current = true;
    let cfg = {};
    try { cfg = JSON.parse(theme.config || '{}'); } catch { cfg = {}; }
    api.get(`/stores/${currentStore.id}/settings`).then((res) => {
      const st = res?.data || {};
      /* Prioritas draft: draft duplikat (entry.design) → design_<template> → theme.config → warna lama. */
      let base;
      if (entry?.design) {
        base = mergeDraft(entry.design);
      } else if (st[`design_${theme.template}`]) {
        try { base = mergeDraft(JSON.parse(st[`design_${theme.template}`])); } catch { base = draftFromThemeConfig(cfg); }
      } else {
        base = draftFromThemeConfig(cfg);
      }
      const next = { ...base };
      const arr = (v) => { try { const p = JSON.parse(v); return Array.isArray(p) ? p : base.sections.slideshow.images; } catch { return Array.isArray(v) ? v : base.sections.slideshow.images; } };
      if (st.slider_images !== undefined) next.sections = setIn(next.sections, 'slideshow.images', arr(st.slider_images));
      if (st.announcement_text) next.home = setIn(next.home, 'pengumuman.teks', st.announcement_text);
      if (st.announcement_text) next.home = setIn(next.home, 'pengumuman.teksBerjalan', true);
      if (st.countdown_end) {
        const d = new Date(st.countdown_end);
        if (!Number.isNaN(d.getTime())) {
          next.sections = setIn(next.sections, 'countdown.tanggal', d.toISOString().slice(0, 10));
          next.sections = setIn(next.sections, 'countdown.waktu', st.countdown_end.slice(11, 16) || '12:00');
        }
      }
      if (st.countdown_title) next.sections = setIn(next.sections, 'countdown.judul', st.countdown_title);
      if (st.featured_title) next.sections = setIn(next.sections, 'featured.judul.text', st.featured_title);
      if (st.latest_title) next.sections = setIn(next.sections, 'latest.judul.text', st.latest_title);
      if (st.faq_title) next.sections = setIn(next.sections, 'faq.judul.text', st.faq_title);
      if (st.featured_product_ids) next.sections = setIn(next.sections, 'featured.produkIds', arr(st.featured_product_ids));
      if (st.footer_cols) {
        try { const c = JSON.parse(st.footer_cols); ['col1', 'col2', 'col3'].forEach((k) => { if (c[k]) next.sections = setIn(next.sections, `footer.${k}`, c[k]); }); } catch { /* abaikan */ }
      }
      if (st.wishlist_enabled !== undefined) next.global = setIn(next.global, 'wishlist', st.wishlist_enabled === '1');
      if (st.bottom_nav_enabled !== undefined) next.global = setIn(next.global, 'bottomNav.aktif', st.bottom_nav_enabled === '1');
      if (st.custom_css) next.global = setIn(next.global, 'customCss', st.custom_css);
      setHistory({ past: [], present: next, future: [] });
      try { if (!localStorage.getItem(`tour_${themeId}`)) setTour('welcome'); } catch { /* abaikan */ }
    }).catch(() => setHistory({ past: [], present: base, future: [] }));
  }, [theme, currentStore]);

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
      setFrameKey((k) => k + 1);
      flash('success', 'Desain tersimpan.');
    } catch (err) {
      flash('danger', err.message || 'Gagal menyimpan desain.');
    } finally {
      setSaving(false);
    }
  };

  /* Navigasi panel */
  const openRoot = () => setView({ type: 'root' });
  const deleteSection = (id) => {
    setHistory((h) => ({ past: [...h.past.slice(-49), h.present], present: { ...h.present, order: h.present.order.filter((x) => x !== id) }, future: [] }));
    openRoot();
  };
  const addSection = (id, label) => {
    setHistory((h) => {
      let present = h.present;
      if (!present.sections[id]) present = setIn(present, `sections.${id}`, { ...GENERIC_SECTION, customLabel: label });
      if (!present.order.includes(id)) present = { ...present, order: [...present.order, id] };
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

  const frameSrc = useMemo(() => (theme ? previewUrl(currentStore, theme) : ''), [currentStore, theme]);
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

  return (
    <div className="fixed inset-0 z-50 bg-white flex">
      {/* Sidebar kiri */}
      <aside className="w-[400px] shrink-0 border-r border-divider flex flex-col bg-white">
        <div className="px-3 pt-3 shrink-0">
          <button type="button" onClick={() => navigate('/settings/themes')} className="h-8 px-3 rounded-md border border-divider text-xs font-bold text-neutral hover:bg-gray-50 cursor-pointer">
            EXIT
          </button>
        </div>
        <div className="px-3 py-3 shrink-0">
          <button
            type="button"
            onClick={() => setView({ type: 'global' })}
            className={cx('w-full h-11 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer', view.type === 'global' ? 'bg-primary-surface text-primary' : 'bg-primary-surface/70 text-primary')}
          >
            <Palette className="w-4 h-4" /> Desain Website
          </button>
        </div>
        <div className="px-3 shrink-0 relative">
          <button type="button" onClick={() => setPageMenuOpen((o) => !o)} className="w-full h-11 px-3 rounded-lg border border-divider flex items-center justify-between text-sm font-semibold text-neutral cursor-pointer">
            <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-subdued" /> {draft.page}</span>
            <ChevronDown className={cx('w-4 h-4 text-subdued transition-transform', pageMenuOpen && 'rotate-180')} />
          </button>
          {pageMenuOpen && (
            <div className="absolute left-3 right-3 top-12 z-20 rounded-lg border border-divider bg-white shadow-lg py-1">
              {PAGE_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setHistory((h) => ({ ...h, present: setIn(h.present, 'page', p) })); setPageMenuOpen(false); }}
                  className={cx('w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer', p === draft.page ? 'bg-primary-surface text-primary font-medium' : 'text-neutral hover:bg-gray-50')}
                >
                  <LayoutGrid className="w-4 h-4 text-subdued" /> {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Daftar isi */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 mt-2">
          {view.type === 'root' && (
            <>
              <p className="px-1 pt-1 pb-2 text-sm font-bold text-neutral">Homepage</p>
              <div className="space-y-1">
                {HOME_ITEMS.map((it) => {
                  const Icon = HOME_ICONS[it.id];
                  return (
                    <button key={it.id} type="button" onClick={() => setView({ type: 'home', id: it.id })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral hover:bg-gray-50 cursor-pointer">
                      <Icon className="w-4 h-4 text-subdued shrink-0" /> {it.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-1 pt-4 pb-2">
                <p className="text-sm font-bold text-neutral">Bagian</p>
                <button type="button" className="text-xs text-subdued inline-flex items-center gap-1 cursor-pointer">Standar <ChevronDown className="w-3.5 h-3.5" /></button>
              </div>
              <button type="button" onClick={() => setView({ type: 'add' })} className="w-full h-10 rounded-lg bg-primary-surface text-primary text-sm font-medium inline-flex items-center gap-2 cursor-pointer mb-2">
                <Plus className="w-4 h-4" /> Tambah Bagian
              </button>
              <div className="space-y-1.5">
                {draft.order.map((id, idx) => {
                  const s = draft.sections[id] || {};
                  const Icon = SECTION_ICONS[id] || LayoutGrid;
                  const sub = sectionSub(id);
                  const hidden = s.visible === false;
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => { dragFrom.current = idx; e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={(e) => { e.preventDefault(); if (dragOver !== id) setDragOver(id); }}
                      onDragLeave={() => setDragOver((d) => (d === id ? null : d))}
                      onDrop={(e) => { e.preventDefault(); moveSection(dragFrom.current, idx); dragFrom.current = null; setDragOver(null); }}
                      onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
                      className={cx('rounded-lg', dragOver === id && 'ring-2 ring-primary')}
                    >
                      <button
                        type="button"
                        onClick={() => setView({ type: 'section', id })}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-left cursor-pointer"
                      >
                        <GripVertical className="w-4 h-4 text-subdued shrink-0 cursor-grab" />
                        <Icon className="w-5 h-5 text-subdued shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-neutral truncate">{sectionTitle(id)}</span>
                          {sub && <span className="block text-xs text-subdued truncate">{sub}</span>}
                        </span>
                        {hidden && <EyeOff className="w-4 h-4 text-subdued ml-auto shrink-0" />}
                      </button>
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
            <SectionPanel id={view.id} draft={draft} patch={patch} storeId={currentStore?.id} onBack={openRoot} onDelete={() => deleteSection(view.id)} />
          )}
          {view.type === 'add' && <AddSectionPanel onBack={openRoot} onAdd={addSection} existing={draft.order} />}
        </div>
      </aside>

      {/* Area preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-page">
        <div className="h-12 shrink-0 bg-white border-b border-divider flex items-center justify-between px-3">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setDevice('desktop')} aria-label="Desktop" className={cx(topbarBtn, device === 'desktop' && 'bg-primary-surface text-primary')}><Monitor className="w-4 h-4" /></button>
            <button type="button" onClick={() => setDevice('mobile')} aria-label="Seluler" className={cx(topbarBtn, device === 'mobile' && 'bg-primary-surface text-primary')}><Smartphone className="w-4 h-4" /></button>
            <button type="button" onClick={() => frameSrc && window.open(frameSrc, '_blank', 'noopener')} aria-label="Buka di tab baru" className={topbarBtn}><Maximize2 className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={undo} disabled={!history.past.length} aria-label="Urungkan" className={topbarBtn}><Undo2 className="w-4 h-4" /></button>
            <button type="button" onClick={redo} disabled={!history.future.length} aria-label="Ulangi" className={topbarBtn}><Redo2 className="w-4 h-4" /></button>
            <button type="button" onClick={save} disabled={saving} className="ml-2 h-9 px-4 rounded-md bg-primary text-white text-sm font-medium cursor-pointer disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
        {notice && (
          <div className={cx('mx-4 mt-3 rounded-lg px-4 py-2.5 text-sm', notice.tone === 'success' ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger')}>{notice.text}</div>
        )}
        <div className="flex-1 p-4 min-h-0">
          <div className={cx('h-full bg-white rounded-lg border border-divider overflow-hidden mx-auto transition-all', device === 'mobile' ? 'max-w-[420px]' : 'max-w-none')}>
            {frameSrc ? (
              <iframe key={`${frameKey}-${device}`} src={frameSrc} title="Pratinjau toko" className="w-full h-full border-0" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-subdued">Alamat toko belum diatur — pratinjau tidak tersedia.</div>
            )}
          </div>
        </div>
        {!isActive && theme && (
          <p className="px-4 pb-3 text-xs text-subdued text-center">Desain ini belum tayang — perubahan disimpan ke desain, terapkan lewat halaman Desain &amp; Template.</p>
        )}
      </div>

      {/* Tur selamat datang */}
      {tour === 'welcome' && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary-surface flex items-center justify-center">
              <Palette className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-neutral">Selamat Datang di Desain Toko!</h2>
            <p className="mt-2 text-sm text-subdued leading-relaxed">
              Di sini kamu bisa mengatur tampilan toko: warna, font, bagian halaman, sampai CSS kustom — semuanya dengan pratinjau langsung.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="button" onClick={endTour} className="h-10 px-5 rounded-lg border border-divider text-sm font-medium text-neutral hover:bg-gray-50 cursor-pointer">Lewati</button>
              <button type="button" onClick={() => setTour(0)} className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium cursor-pointer">Mulai Tur</button>
            </div>
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
                <button type="button" onClick={endTour} className="h-8 px-3 rounded-md border border-divider text-xs font-medium text-neutral hover:bg-gray-50 cursor-pointer">Lewati</button>
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
