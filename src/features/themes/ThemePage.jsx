import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchThemes, activateTheme } from './themesSlice';

const COLORS = [
  { name: 'Blue', primary: '#4169E0', bg: '#eff3f8', sidebar: '#f9fafb' },
  { name: 'Green', primary: '#10b981', bg: '#ecfdf5', sidebar: '#f0fdf4' },
  { name: 'Purple', primary: '#8b5cf6', bg: '#f5f3ff', sidebar: '#faf5ff' },
  { name: 'Orange', primary: '#f97316', bg: '#fff7ed', sidebar: '#fff7ed' },
  { name: 'Rose', primary: '#f43f5e', bg: '#fff1f2', sidebar: '#fff1f2' },
];

export default function ThemePage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { activeTheme } = useSelector((s) => s.themes);

  useEffect(() => {
    if (currentStore) dispatch(fetchThemes(currentStore.id));
  }, [dispatch, currentStore]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Desain Toko</h2>
      <p className="text-sm text-gray-500 mb-6">Pilih tema untuk website toko Anda</p>

      <div className="grid grid-cols-3 gap-4">
        {COLORS.map((color) => (
          <div
            key={color.name}
            onClick={() => {/* activate theme */}}
            className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="h-32" style={{ background: `linear-gradient(to bottom, ${color.sidebar} 40%, ${color.bg} 40%)` }}>
              <div className="flex h-full">
                <div className="w-1/3 border-r border-gray-200"></div>
                <div className="flex-1 p-4">
                  <div className="h-2 w-1/2 rounded mb-2" style={{ background: color.primary }}></div>
                  <div className="h-2 w-3/4 rounded mb-2 bg-gray-200"></div>
                  <div className="h-2 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">{color.name}</span>
              <div className="w-5 h-5 rounded-full" style={{ background: color.primary }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
