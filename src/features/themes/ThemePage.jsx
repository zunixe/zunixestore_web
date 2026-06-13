import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchThemes, activateTheme } from './themesSlice';

const FALLBACK_COLORS = {
  't1': { primary: '#4169E0', bg: '#eff3f8', sidebar: '#f9fafb' },
  't2': { primary: '#6366f1', bg: '#1e1e2e', sidebar: '#181825' },
  't3': { primary: '#10b981', bg: '#fafafa', sidebar: '#ffffff' },
};

function parseConfig(config) {
  try { return typeof config === 'string' ? JSON.parse(config) : config; }
  catch { return {}; }
}

export default function ThemePage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { themes, activeTheme, isLoading } = useSelector((s) => s.themes);

  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  const displayThemes = themes.length > 0 ? themes : [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Desain Toko</h2>
      <p className="text-sm text-gray-500 mb-6">Pilih tema untuk website toko Anda</p>

      {isLoading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Memuat tema...</div>
      ) : displayThemes.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">Belum ada tema tersedia</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {displayThemes.map((theme) => {
            const cfg = parseConfig(theme.config);
            const colors = cfg.primary_color ? cfg : (FALLBACK_COLORS[theme.id] || { primary: '#4169E0', bg: '#eff3f8', sidebar: '#f9fafb' });
            const isActive = activeTheme?.id === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  if (!isActive && currentStore) {
                    dispatch(activateTheme({ storeId: currentStore.id, themeId: theme.id }));
                  }
                }}
                className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all border-2 ${
                  isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-blue-300'
                } ${isActive ? '' : 'hover:shadow-md'}`}
              >
                <div className="h-32 relative" style={{ background: `linear-gradient(to bottom, ${colors.sidebar} 40%, ${colors.bg} 40%)` }}>
                  <div className="flex h-full">
                    <div className="w-1/3 border-r border-gray-200" style={{ background: colors.sidebar }}></div>
                    <div className="flex-1 p-4" style={{ background: colors.bg }}>
                      <div className="h-2 w-1/2 rounded mb-2" style={{ background: colors.primary }}></div>
                      <div className="h-2 w-3/4 rounded mb-2 bg-gray-200"></div>
                      <div className="h-2 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{theme.name}</span>
                  <div className="w-5 h-5 rounded-full" style={{ background: colors.primary }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
