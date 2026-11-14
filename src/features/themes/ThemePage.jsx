import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, LayoutTemplate } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, Badge, Pagination, EmptyState, Modal, TextInput,
} from '../../components/ui';
import { fetchThemes, activateTheme, updateThemeConfig } from './themesSlice';
import ThemePreview from './ThemePreview';
import { themeColors } from './themeUtils';
import RowMenu from '../store-design/RowMenu';
import { useStoreSetting, formatTanggal } from '../store-design/useStoreSetting';

const MAX_DESIGNS = 5;

function storeUrlOf(store) {
  if (!store) return '';
  const host = store.domain || (store.slug ? `${store.slug}.zunixe.com` : '');
  return host ? `https://${host}` : '';
}

function ColorField({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md border border-divider cursor-pointer bg-white p-1"
        />
        <input
          type="text"
          value={value}
          aria-label={`${label} (hex)`}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="flex-1 h-10 px-3 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary uppercase"
        />
      </div>
    </div>
  );
}

export default function ThemePage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { themes, activeTheme, isLoading, error } = useSelector((s) => s.themes);
  const designs = useStoreSetting('my_designs', []);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editColors, setEditColors] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  const entries = useMemo(() => (Array.isArray(designs.value) ? designs.value : []), [designs.value]);
  const entryOf = (id) => entries.find((e) => e.themeId === id);
  const nameOf = (theme) => entryOf(theme?.id)?.name || theme?.name || 'Tanpa nama';

  // "Desain saya" = desain yang ditambahkan dari template + desain yang sedang tayang.
  const myDesigns = useMemo(() => {
    const list = entries
      .map((e) => ({ entry: e, theme: themes.find((t) => t.id === e.themeId) }))
      .filter((d) => d.theme);
    if (activeTheme && !list.some((d) => d.theme.id === activeTheme.id)) {
      list.unshift({ entry: { themeId: activeTheme.id }, theme: activeTheme });
    }
    return list;
  }, [entries, themes, activeTheme]);

  const pagedTemplates = themes.slice((page - 1) * limit, page * limit);
  const storeUrl = storeUrlOf(currentStore);

  const flash = (tone, text) => setNotice({ tone, text });

  const upsertEntry = (themeId, patch) => {
    const exists = entries.some((e) => e.themeId === themeId);
    const next = exists
      ? entries.map((e) => (e.themeId === themeId ? { ...e, ...patch } : e))
      : [...entries, { themeId, ...patch }];
    return designs.save(next);
  };

  const applyTheme = async (theme) => {
    if (!currentStore) return;
    setBusyId(theme.id);
    try {
      await dispatch(activateTheme({ storeId: currentStore.id, themeId: theme.id })).unwrap();
      await upsertEntry(theme.id, { lastUsed: new Date().toISOString() });
      flash('success', `"${nameOf(theme)}" sekarang tayang di toko Anda.`);
    } catch (err) {
      flash('danger', typeof err === 'string' ? err : 'Gagal menerapkan desain.');
    } finally {
      setBusyId(null);
    }
  };

  const adoptTemplate = async (theme) => {
    if (entryOf(theme.id) || theme.id === activeTheme?.id) return;
    if (myDesigns.length >= MAX_DESIGNS) {
      flash('danger', `Maksimal ${MAX_DESIGNS} desain. Hapus salah satu desain terlebih dahulu.`);
      return;
    }
    const ok = await upsertEntry(theme.id, { name: theme.name, addedAt: new Date().toISOString() });
    flash(ok ? 'success' : 'danger', ok ? `"${theme.name}" ditambahkan ke Desain saya.` : 'Gagal menyimpan desain.');
  };

  const removeDesign = async (themeId) => {
    const ok = await designs.save(entries.filter((e) => e.themeId !== themeId));
    if (!ok) flash('danger', 'Gagal menghapus desain.');
  };

  const openRename = (theme) => {
    setRenameTarget(theme);
    setRenameValue(nameOf(theme));
  };

  const submitRename = async (e) => {
    e?.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    const ok = await upsertEntry(renameTarget.id, { name: renameValue.trim() });
    setRenameTarget(null);
    if (!ok) flash('danger', 'Gagal menyimpan nama desain.');
  };

  const openEdit = () => {
    if (!activeTheme) return;
    const c = themeColors(activeTheme);
    setEditColors({ primary_color: c.primary_color, bg_color: c.bg_color, sidebar_color: c.sidebar_color });
    setEditOpen(true);
  };

  const colorsValid = editColors && Object.values(editColors).every((v) => /^#[0-9a-f]{6}$/i.test(v));

  const submitEdit = async () => {
    if (!activeTheme || !currentStore || !colorsValid) return;
    try {
      const config = { ...themeColors(activeTheme).raw, ...editColors };
      await dispatch(updateThemeConfig({ storeId: currentStore.id, themeId: activeTheme.id, config })).unwrap();
      await upsertEntry(activeTheme.id, { updatedAt: new Date().toISOString() });
      setEditOpen(false);
      flash('success', 'Desain toko diperbarui.');
    } catch (err) {
      flash('danger', typeof err === 'string' ? err : 'Gagal memperbarui desain.');
    }
  };

  const activeEntry = activeTheme ? entryOf(activeTheme.id) : null;
  const lastUpdated = activeEntry?.updatedAt || activeEntry?.lastUsed || activeTheme?.created_at;

  return (
    <div className="space-y-4">
      <PageHeader title="Desain & Template" subtitle="Atur tampilan website toko Anda." />

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
      <Card>
        <CardHeader title="Desain saat ini" />
        {isLoading && !activeTheme ? (
          <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />
        ) : !activeTheme ? (
          <EmptyState icon={LayoutTemplate} title="Belum ada desain" description="Pilih template di bawah untuk mulai mendesain toko Anda." className="py-8" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
            <div className="aspect-[16/9] rounded-lg border border-divider overflow-hidden">
              <ThemePreview theme={activeTheme} size="lg" />
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-neutral truncate">{nameOf(activeTheme)}</h3>
                    <Badge tone="success">Tayang</Badge>
                  </div>
                  <p className="text-xs text-subdued mt-1">Terakhir diupdate: {formatTanggal(lastUpdated)}</p>
                  {storeUrl && <p className="text-xs text-subdued mt-1 truncate">{storeUrl.replace('https://', '')}</p>}
                </div>
                <RowMenu
                  label="Opsi desain saat ini"
                  items={[
                    { label: 'Lihat Tampilan', onClick: () => setPreviewTheme(activeTheme) },
                    { label: 'Ubah nama', onClick: () => openRename(activeTheme) },
                    storeUrl && { label: 'Kunjungi toko', onClick: () => window.open(storeUrl, '_blank', 'noopener') },
                  ]}
                />
              </div>
              <Button variant="tonal" icon={Pencil} className="w-full" onClick={openEdit}>Edit Desain Toko</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Desain saya */}
      <Card padded={false}>
        <div className="px-4 pt-4">
          <CardHeader title={`Desain saya (${myDesigns.length}/${MAX_DESIGNS})`} subtitle="Simpan hingga 5 desain dan terapkan kapan saja." />
        </div>
        {myDesigns.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-subdued">Belum ada desain tersimpan. Gunakan template di bawah untuk menambahkan.</p>
        ) : (
          <ul className="divide-y divide-divider border-t border-divider">
            {myDesigns.map(({ entry, theme }) => {
              const isActive = theme.id === activeTheme?.id;
              const label = entry.name || theme.name;
              return (
                <li key={theme.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="w-24 h-14 rounded-md border border-divider overflow-hidden shrink-0">
                    <ThemePreview theme={theme} size="sm" />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral truncate">{label}</span>
                      {isActive && <Badge tone="success">Tayang</Badge>}
                    </div>
                    <p className="text-xs text-subdued mt-0.5">
                      Terakhir digunakan: {entry.lastUsed ? formatTanggal(entry.lastUsed) : isActive ? 'Sekarang' : 'Belum pernah'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => openRename(theme)} aria-label={`Ubah nama ${label}`}>Ubah</Button>
                    {!isActive && (
                      <Button variant="tonal" disabled={busyId === theme.id} onClick={() => applyTheme(theme)}>
                        {busyId === theme.id ? 'Menerapkan...' : 'Terapkan Sekarang'}
                      </Button>
                    )}
                    <RowMenu
                      label={`Opsi ${label}`}
                      items={[
                        { label: 'Lihat Tampilan', onClick: () => setPreviewTheme(theme) },
                        !isActive && entries.some((e) => e.themeId === theme.id) && { label: 'Hapus dari Desain saya', danger: true, onClick: () => removeDesign(theme.id) },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Jelajahi template */}
      <Card padded={false}>
        <div className="px-4 pt-4">
          <CardHeader title="Jelajahi Template" subtitle="Pilih template sebagai titik awal desain toko Anda." />
        </div>
        {isLoading && themes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
            {[0, 1].map((i) => <div key={i} className="h-56 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : themes.length === 0 ? (
          <EmptyState icon={LayoutTemplate} title="Belum ada template" description="Template akan tampil di sini setelah tersedia." className="py-8" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
              {pagedTemplates.map((theme) => {
                const owned = !!entryOf(theme.id) || theme.id === activeTheme?.id;
                return (
                  <div key={theme.id} className="rounded-lg border border-divider overflow-hidden">
                    <div className="aspect-[16/10] border-b border-divider">
                      <ThemePreview theme={theme} />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                      <span className="text-sm font-semibold text-neutral">{theme.name}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => setPreviewTheme(theme)}>Lihat Tampilan</Button>
                        <Button variant="tonal" disabled={owned} onClick={() => adoptTemplate(theme)}>
                          {owned ? 'Sudah dipakai' : 'Gunakan template'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination
              page={page}
              limit={limit}
              total={themes.length}
              onPage={setPage}
              onLimit={(n) => { setLimit(n); setPage(1); }}
              label="Template per halaman:"
            />
          </>
        )}
      </Card>

      {/* Modal pratinjau */}
      <Modal
        open={!!previewTheme}
        title={previewTheme ? `Tampilan: ${nameOf(previewTheme)}` : ''}
        onClose={() => setPreviewTheme(null)}
        width="max-w-3xl"
        footer={previewTheme && (
          <>
            <Button variant="secondary" onClick={() => setPreviewTheme(null)}>Tutup</Button>
            {previewTheme.id !== activeTheme?.id && (
              <Button onClick={() => { const t = previewTheme; setPreviewTheme(null); applyTheme(t); }}>Terapkan Sekarang</Button>
            )}
          </>
        )}
      >
        {previewTheme && (
          <div className="aspect-[16/10] rounded-lg border border-divider overflow-hidden">
            <ThemePreview theme={previewTheme} size="lg" />
          </div>
        )}
      </Modal>

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

      {/* Modal edit desain */}
      <Modal
        open={editOpen}
        title="Edit Desain Toko"
        onClose={() => setEditOpen(false)}
        width="max-w-2xl"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={submitEdit} disabled={!colorsValid}>Simpan</Button>
          </>
        )}
      >
        {editColors && (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
            <div className="space-y-3">
              <ColorField id="clr-primary" label="Warna utama" value={editColors.primary_color} onChange={(v) => setEditColors((c) => ({ ...c, primary_color: v }))} />
              <ColorField id="clr-bg" label="Warna latar" value={editColors.bg_color} onChange={(v) => setEditColors((c) => ({ ...c, bg_color: v }))} />
              <ColorField id="clr-header" label="Warna header" value={editColors.sidebar_color} onChange={(v) => setEditColors((c) => ({ ...c, sidebar_color: v }))} />
              {!colorsValid && <p className="text-xs text-danger">Gunakan format warna hex, mis. #4169E1.</p>}
            </div>
            <div className="aspect-[16/10] rounded-lg border border-divider overflow-hidden self-start">
              <ThemePreview colors={colorsValid ? editColors : undefined} theme={activeTheme} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
