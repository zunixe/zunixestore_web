import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Smartphone, Monitor } from 'lucide-react';
import { fetchThemes } from './themesSlice';
import { previewUrl } from './themeUtils';
import { useStoreSetting } from '../store-design/useStoreSetting';

const MAX_DESIGNS = 5;

/* Halaman preview template — meniru /settings/designs/templates/:id/preview milik Plugo. */
export default function TemplatePreviewPage() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { themes, activeTheme } = useSelector((s) => s.themes);
  const designs = useStoreSetting('my_designs', []);
  const theme = themes.find((t) => t.id === themeId) || (activeTheme?.id === themeId ? activeTheme : null);

  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  const frameSrc = useMemo(() => (theme ? previewUrl(currentStore, theme) : ''), [currentStore, theme]);

  const adoptTemplate = async () => {
    if (!theme || !currentStore) return;
    const entries = Array.isArray(designs.value) ? designs.value : [];
    const exists = entries.some((e) => e.themeId === theme.id) || theme.id === activeTheme?.id;
    if (exists) {
      setNotice(`"${theme.name}" sudah ada di Desain saya.`);
      return;
    }
    const count = entries.filter((e) => themes.some((t) => t.id === e.themeId)).length + (activeTheme ? 1 : 0);
    if (count >= MAX_DESIGNS) {
      setNotice(`Maksimal ${MAX_DESIGNS} desain. Hapus salah satu desain terlebih dahulu.`);
      return;
    }
    const ok = await designs.save([...entries, { themeId: theme.id, name: theme.name, addedAt: new Date().toISOString() }]);
    if (ok) navigate('/settings/themes');
    else setNotice('Gagal menyimpan desain.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Topbar ala Plugo: p-4, shadow, toggle mobile | nama | Kembali + Gunakan template */}
      <div className="p-4 flex items-center bg-white shadow z-10 flex-none">
        <button
          type="button"
          onClick={() => setMobile((m) => !m)}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-gray-100 text-neutral text-sm font-semibold hover:bg-gray-200 cursor-pointer"
        >
          {mobile ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
          {mobile ? 'Lihat versi desktop' : 'Lihat versi mobile'}
        </button>
        <div className="flex-1" />
        <div className="text-base font-bold text-neutral">{theme?.name || 'Template'}</div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/settings/themes')}
            className="h-10 px-4 rounded-md border border-divider text-sm font-medium text-neutral hover:bg-gray-50 cursor-pointer"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={adoptTemplate}
            className="h-10 px-4 rounded-md bg-primary text-white text-sm font-medium cursor-pointer"
          >
            Gunakan template
          </button>
        </div>
      </div>
      {notice && <div className="mx-4 mt-3 rounded-lg px-4 py-2.5 text-sm bg-danger-surface text-danger">{notice}</div>}
      <div className="flex-1 min-h-0 bg-page flex">
        {frameSrc ? (
          <iframe
            src={frameSrc}
            title={`Pratinjau ${theme?.name || 'template'}`}
            className={`h-full border-0 mx-auto transition-all ${mobile ? 'w-full max-w-[420px] border-x border-divider' : 'w-full'}`}
          />
        ) : (
          <div className="m-auto text-sm text-subdued">Alamat toko belum diatur — pratinjau tidak tersedia.</div>
        )}
      </div>
    </div>
  );
}
