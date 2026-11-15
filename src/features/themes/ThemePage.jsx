import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button, EmptyState, Modal, TextInput } from '../../components/ui';
import { fetchThemes, activateTheme } from './themesSlice';
import ThemePreview from './ThemePreview';
import { themeColors, previewUrl, storefrontUrl, formatWaktu } from './themeUtils';
import { mergeDraft, toStoreSettings } from './editor/schema';
import api from '../../utils/api';
import RowMenu from '../store-design/RowMenu';
import { useStoreSetting, newId } from '../store-design/useStoreSetting';

const MAX_DESIGNS = 5;
const PER_PAGE = 8;

/* Gambar pratinjau template (screenshot). Tanpa gambar → pratinjau generik dari warna. */
function TemplateShot({ theme, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (theme?.preview_url && !broken) {
    return (
      <img
        src={theme.preview_url}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className={`w-full h-full object-cover object-top ${className}`}
      />
    );
  }
  const c = themeColors(theme);
  return <ThemePreview colors={{ primary_color: c.primary_color, bg_color: '#FFFFFF', sidebar_color: '#FFFFFF' }} size="lg" className={className} />;
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-surface border border-success/20 px-2 py-0.5 text-[11px] text-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
      Tayang
    </span>
  );
}

export default function ThemePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentStore } = useSelector((s) => s.stores);
  const { themes, activeTheme, isLoading, error } = useSelector((s) => s.themes);
  const designs = useStoreSetting('my_designs', []);

  const [page, setPage] = useState(1);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  const entries = useMemo(() => (Array.isArray(designs.value) ? designs.value : []), [designs.value]);
  const entryOf = (id) => entries.find((e) => e.themeId === id);
  const nameOf = (theme) => entryOf(theme?.id)?.name || theme?.name || 'Tanpa nama';

  // "Desain saya" = desain yang ditambahkan dari template, selain yang sedang tayang.
  const myDesigns = useMemo(() => entries
    .map((e) => ({ entry: e, theme: themes.find((t) => t.id === e.themeId) }))
    .filter((d) => d.theme && d.theme.id !== activeTheme?.id), [entries, themes, activeTheme]);
  const designCount = myDesigns.length + (activeTheme ? 1 : 0);

  const pages = Math.max(1, Math.ceil(themes.length / PER_PAGE));
  const pagedTemplates = themes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const flash = (tone, text) => setNotice({ tone, text });

  const upsertEntry = (themeId, patch) => {
    const exists = entries.some((e) => e.themeId === themeId);
    const next = exists
      ? entries.map((e) => (e.themeId === themeId ? { ...e, ...patch } : e))
      : [...entries, { themeId, ...patch }];
    return designs.save(next);
  };

  const openPreview = (theme) => {
    if (!previewUrl(currentStore, theme)) {
      flash('danger', 'Alamat toko belum diatur, jadi tampilan belum bisa dibuka.');
      return;
    }
    navigate(`/settings/themes/preview/${theme.id}`);
  };

  /* Ambil draft desain: duplikat → entry.design; template → design_<template>. */
  const loadDraft = async (theme, entry) => {
    if (entry?.design) return entry.design;
    try {
      const res = await api.get(`/stores/${currentStore.id}/settings`);
      const st = res?.data || {};
      const raw = st[`design_${theme.template}`] || (theme.is_active ? st.design_live : null);
      if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { /* abaikan — pakai default */ }
    return null;
  };

  /* Duplikat desain → entri baru di "Desain saya" dengan draft sendiri. */
  const duplicateDesign = async (theme, entry) => {
    if (designCount >= MAX_DESIGNS) {
      flash('danger', `Maksimal ${MAX_DESIGNS} desain. Hapus salah satu desain terlebih dahulu.`);
      return;
    }
    const draft = mergeDraft(await loadDraft(theme, entry));
    const name = `Salinan ${entry?.name || theme.name}`;
    const next = [...entries, {
      designId: `d-${newId()}`,
      themeId: theme.id,
      name,
      design: draft,
      addedAt: new Date().toISOString(),
    }];
    const ok = await designs.save(next);
    flash(ok ? 'success' : 'danger', ok ? `"${name}" ditambahkan ke Desain saya.` : 'Gagal menduplikat desain.');
  };

  const applyTheme = async (theme, entry) => {
    if (!currentStore) return;
    const prev = activeTheme;
    setBusyId(entry?.designId || theme.id);
    try {
      await dispatch(activateTheme({ storeId: currentStore.id, themeId: theme.id })).unwrap();
      // Draft desain ikut ditayangkan: design_live + kunci yang dibaca storefront.
      const draft = await loadDraft(theme, entry);
      if (draft) {
        const merged = mergeDraft(draft);
        await api.put(`/stores/${currentStore.id}/settings`, {
          design_live: JSON.stringify(merged),
          ...toStoreSettings(merged),
        });
      }
      // Desain yang sebelumnya tayang tetap ada di "Desain saya".
      let next = entries;
      const touch = (id, patch) => {
        next = next.some((e) => e.themeId === id)
          ? next.map((e) => (e.themeId === id ? { ...e, ...patch } : e))
          : [...next, { themeId: id, ...patch }];
      };
      if (prev && prev.id !== theme.id) touch(prev.id, { lastUsed: new Date().toISOString() });
      touch(theme.id, { lastUsed: new Date().toISOString() });
      await designs.save(next);
      flash('success', `"${nameOf(theme)}" sekarang tayang di toko Anda.`);
    } catch (err) {
      flash('danger', typeof err === 'string' ? err : 'Gagal menerapkan desain.');
    } finally {
      setBusyId(null);
    }
  };

  const adoptTemplate = async (theme) => {
    if (theme.id === activeTheme?.id || entryOf(theme.id)) {
      flash('success', `"${theme.name}" sudah ada di Desain saya.`);
      return;
    }
    if (designCount >= MAX_DESIGNS) {
      flash('danger', `Maksimal ${MAX_DESIGNS} desain. Hapus salah satu desain terlebih dahulu.`);
      return;
    }
    const ok = await upsertEntry(theme.id, { name: theme.name, addedAt: new Date().toISOString() });
    flash(ok ? 'success' : 'danger', ok ? `"${theme.name}" ditambahkan ke Desain saya.` : 'Gagal menyimpan desain.');
  };

  const removeDesign = async (entry) => {
    const ok = await designs.save(entries.filter((e) => e !== entry));
    if (!ok) flash('danger', 'Gagal menghapus desain.');
  };

  const openRename = (theme, entry) => {
    setRenameTarget({ theme, entry });
    setRenameValue(entry?.name || nameOf(theme));
  };

  const submitRename = async (e) => {
    e?.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    const { theme, entry } = renameTarget;
    let ok;
    if (entry?.designId) {
      ok = await designs.save(entries.map((x) => (x === entry ? { ...x, name: renameValue.trim() } : x)));
    } else {
      ok = await upsertEntry(theme.id, { name: renameValue.trim() });
    }
    setRenameTarget(null);
    if (!ok) flash('danger', 'Gagal menyimpan nama desain.');
  };

  const openEdit = () => {
    if (!activeTheme) return;
    navigate(`/settings/themes/${activeTheme.id}`);
  };

  const shopUrl = storefrontUrl(currentStore);

  return (
    <div className="max-w-[1024px] mx-auto space-y-6 pb-8">
      {notice && (
        <div
          role="status"
          className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm ${notice.tone === 'success' ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger'}`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs underline cursor-pointer">Tutup</button>
        </div>
      )}
      {error && !notice && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm bg-danger-surface text-danger">{error}</div>
      )}

      {/* Desain saat ini */}
      <section>
        <h2 className="text-base font-semibold text-neutral mb-4">Desain saat ini</h2>
        {isLoading && !activeTheme ? (
          <div className="h-[260px] rounded-lg bg-gray-100 animate-pulse" />
        ) : !activeTheme ? (
          <Card variant="elevated"><EmptyState icon={LayoutTemplate} title="Belum ada desain" description="Pilih template di bawah untuk mulai mendesain toko Anda." className="py-8" /></Card>
        ) : (
          <Card padded={false} variant="elevated" className="overflow-hidden">
            <button type="button" onClick={() => openPreview(activeTheme)} className="block w-full aspect-[8/3] overflow-hidden border-b border-divider cursor-pointer" aria-label={`Lihat tampilan ${nameOf(activeTheme)}`}>
              <TemplateShot theme={activeTheme} />
            </button>
            <div className="flex flex-wrap items-center gap-3 px-4 py-4">
              <div className="flex-1 min-w-[160px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral">{nameOf(activeTheme)}</span>
                  <LiveBadge />
                </div>
                <p className="text-xs text-neutral mt-0.5">Terakhir diupdate: {formatWaktu(activeTheme.updated_at || entryOf(activeTheme.id)?.lastUsed)}</p>
              </div>
              <Button variant="tonal" size="sm" onClick={openEdit}>Edit Desain Toko</Button>
              <RowMenu
                label="Opsi desain saat ini"
                items={[
                  { label: 'Lihat Tampilan', onClick: () => openPreview(activeTheme) },
                  { label: 'Ubah nama', onClick: () => openRename(activeTheme, entryOf(activeTheme.id)) },
                  { label: 'Duplikat', onClick: () => duplicateDesign(activeTheme, entryOf(activeTheme.id)) },
                  shopUrl && { label: 'Kunjungi toko', onClick: () => window.open(shopUrl, '_blank', 'noopener') },
                ]}
              />
            </div>
          </Card>
        )}
      </section>

      {/* Desain saya */}
      <section>
        <h2 className="text-base font-semibold text-neutral mb-4">Desain saya ({designCount}/{MAX_DESIGNS})</h2>
        <Card padded={false} variant="elevated">
          {myDesigns.length === 0 ? (
            <p className="px-4 py-4 text-sm text-subdued">Belum ada desain lain. Gunakan template di bawah untuk menambahkan.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {myDesigns.map(({ entry, theme }) => {
                const label = entry.name || theme.name;
                const editorId = entry.designId || theme.id;
                return (
                  <li key={editorId} className="flex flex-wrap items-center gap-2 px-4 py-4">
                    <div className="w-14 h-10 rounded-sm overflow-hidden bg-gray-100 shrink-0"><TemplateShot theme={theme} /></div>
                    <div className="flex-1 min-w-[140px]">
                      <p className="text-sm font-medium text-neutral truncate">{label}</p>
                      <p className="text-xs text-neutral">
                        Terakhir digunakan: {entry.lastUsed ? formatWaktu(entry.lastUsed) : 'Belum pernah'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/settings/themes/${editorId}`)} aria-label={`Edit ${label}`}>Ubah</Button>
                      <Button variant="tonal" size="sm" disabled={busyId === editorId} onClick={() => applyTheme(theme, entry)}>
                        {busyId === editorId ? 'Menerapkan...' : 'Terapkan Sekarang'}
                      </Button>
                      <RowMenu
                        label={`Opsi ${label}`}
                        items={[
                          { label: 'Ubah nama', onClick: () => openRename(theme, entry) },
                          { label: 'Duplikat', onClick: () => duplicateDesign(theme, entry) },
                          { label: 'Hapus', danger: true, onClick: () => removeDesign(entry) },
                        ]}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* Jelajahi template */}
      <section>
        <h2 className="text-base font-semibold text-neutral mb-4">Jelajahi Template</h2>
        {isLoading && themes.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => <div key={i} className="h-[230px] rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : themes.length === 0 ? (
          <Card variant="elevated"><EmptyState icon={LayoutTemplate} title="Belum ada template" description="Template akan tampil di sini setelah tersedia." className="py-8" /></Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pagedTemplates.map((theme) => (
                <Card key={theme.id} padded={false} variant="elevated" className="overflow-hidden">
                  <div className="aspect-[504/179] overflow-hidden bg-gray-100">
                    <TemplateShot theme={theme} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4">
                    <span className="text-base font-semibold text-neutral">{theme.name}</span>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openPreview(theme)}>Lihat Tampilan</Button>
                      <Button variant="tonal" size="sm" onClick={() => adoptTemplate(theme)}>Gunakan template</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {pages > 1 && (
              <nav className="flex justify-center items-center gap-1 mt-4" aria-label="Halaman template">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Halaman sebelumnya"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-neutral hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: pages }, (_, k) => k + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`w-8 h-8 rounded-md text-sm cursor-pointer ${p === page ? 'bg-primary text-white' : 'text-neutral hover:bg-gray-100'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  aria-label="Halaman berikutnya"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-neutral hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      {/* Modal ubah nama */}
      <Modal
        open={!!renameTarget}
        title="Ubah nama desain"
        onClose={() => setRenameTarget(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setRenameTarget(null)}>Batal</Button>
            <Button onClick={submitRename} disabled={!renameValue.trim() || designs.saving}>Simpan</Button>
          </>
        )}
      >
        <form onSubmit={submitRename}>
          <TextInput id="design-name" label="Nama desain" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={60} autoFocus />
        </form>
      </Modal>

    </div>
  );
}
