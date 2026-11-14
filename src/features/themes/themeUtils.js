/* Util warna tema. Kunci config dari backend: primary_color, bg_color, sidebar_color. */
export const DEFAULT_CFG = { primary_color: '#4169E1', bg_color: '#EFF3F8', sidebar_color: '#F9FAFB' };

export function themeColors(theme) {
  let cfg;
  try { cfg = typeof theme?.config === 'string' ? JSON.parse(theme.config) : (theme?.config || {}); }
  catch { cfg = {}; }
  if (!cfg || typeof cfg !== 'object') cfg = {};
  return {
    primary_color: cfg.primary_color || DEFAULT_CFG.primary_color,
    bg_color: cfg.bg_color || DEFAULT_CFG.bg_color,
    sidebar_color: cfg.sidebar_color || DEFAULT_CFG.sidebar_color,
    raw: cfg,
  };
}
