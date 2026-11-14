/*
 * Pratinjau toko generik yang digambar dari warna tema (tanpa gambar template).
 */
import { themeColors } from './themeUtils';

function isDark(hex) {
  const h = (hex || '').replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

export default function ThemePreview({ theme, colors: colorsProp, size = 'md', className = '' }) {
  const c = colorsProp || themeColors(theme);
  const dark = isDark(c.bg_color);
  const navDark = isDark(c.sidebar_color);
  const line = dark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.10)';
  const navLine = navDark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.15)';
  const card = dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
  const cols = size === 'lg' ? 4 : size === 'sm' ? 2 : 3;
  const pad = size === 'sm' ? 'p-1.5' : 'p-3';

  return (
    <div
      className={`w-full h-full overflow-hidden flex flex-col ${className}`}
      style={{ background: c.bg_color }}
      aria-hidden="true"
    >
      <div className={`flex items-center gap-2 ${size === 'sm' ? 'h-3 px-1.5' : 'h-7 px-3'}`} style={{ background: c.sidebar_color, borderBottom: `1px solid ${navLine}` }}>
        <span className={`rounded-sm ${size === 'sm' ? 'w-3 h-1.5' : 'w-8 h-2.5'}`} style={{ background: c.primary_color }} />
        <span className="flex-1" />
        {[0, 1, 2].map((i) => (
          <span key={i} className={`rounded-full ${size === 'sm' ? 'w-2 h-0.5' : 'w-6 h-1.5'}`} style={{ background: navLine }} />
        ))}
      </div>
      <div className={pad}>
        <div
          className={`rounded-md flex flex-col justify-center gap-1 ${size === 'sm' ? 'h-6 px-1.5' : size === 'lg' ? 'h-28 px-5 gap-2' : 'h-16 px-3'}`}
          style={{ background: `linear-gradient(120deg, ${c.primary_color}, ${c.primary_color}99 60%, ${c.sidebar_color})` }}
        >
          <span className={`rounded-full bg-white/90 ${size === 'sm' ? 'w-6 h-1' : 'w-1/3 h-2'}`} />
          <span className={`rounded-full bg-white/60 ${size === 'sm' ? 'w-4 h-0.5' : 'w-1/4 h-1.5'}`} />
          {size !== 'sm' && <span className="mt-1 rounded w-12 h-3 bg-white" />}
        </div>
        <div className={`grid ${size === 'sm' ? 'gap-1 mt-1' : 'gap-2 mt-3'}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className={`rounded ${size === 'sm' ? 'p-0.5' : 'p-1.5'}`} style={{ background: card, border: `1px solid ${line}` }}>
              <div className={`rounded-sm ${size === 'sm' ? 'h-3' : size === 'lg' ? 'h-20' : 'h-10'}`} style={{ background: line }} />
              {size !== 'sm' && (
                <>
                  <div className="h-1.5 w-3/4 rounded-full mt-1.5" style={{ background: line }} />
                  <div className="h-1.5 w-1/3 rounded-full mt-1" style={{ background: c.primary_color }} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
