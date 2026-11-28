import { describe, it, expect, vi } from 'vitest';
import { themeColors, storefrontUrl, previewUrl, formatWaktu, DEFAULT_CFG } from '../src/features/themes/themeUtils';

describe('themeUtils', () => {
  it('themeColors: pakai config tema, fallback default', () => {
    const t = themeColors({ config: { primary_color: '#111111' } });
    expect(t.primary_color).toBe('#111111');
    const d = themeColors(null);
    expect(d.primary_color).toBe(DEFAULT_CFG.primary_color);
    expect(d.footer_color).toBe(DEFAULT_CFG.footer_color);
  });
  it('themeColors: config string JSON ter-parse', () => {
    const t = themeColors({ config: '{"primary_color":"#222222"}' });
    expect(t.primary_color).toBe('#222222');
  });
  it('storefrontUrl: fallback dev ke :5174, pakai domain kalau ada', () => {
    vi.stubEnv('VITE_STOREFRONT_URL', '');
    expect(storefrontUrl({})).toMatch(/5174|localhost/);
    const u = storefrontUrl({ slug: 'toko1' });
    expect(u).toMatch(/5174|toko1\.zunixestore\.com/);
  });
  it('previewUrl: template + slug toko di query', () => {
    const u = previewUrl({ slug: 'demo' }, { template: 'basic-shop' });
    expect(u).toContain('template=basic-shop');
    expect(u).toContain('store=demo');
  });
  it('previewUrl: menyertakan cache-bust agar iframe tidak memakai HTML lama', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const a = previewUrl({ slug: 'demo' }, { template: 'default' });
      vi.setSystemTime(new Date('2026-01-01T00:00:01Z'));
      const b = previewUrl({ slug: 'demo' }, { template: 'default' });
      const ca = new URL(a).searchParams.get('_zxv');
      const cb = new URL(b).searchParams.get('_zxv');
      expect(ca).toBeTruthy();
      expect(cb).toBeTruthy();
      expect(ca).not.toBe(cb);
    } finally {
      vi.useRealTimers();
    }
  });
  it('formatWaktu: output format "Mon D HH:MM"', () => {
    expect(formatWaktu('2026-11-14T10:05:00Z')).toMatch(/\d{2}:\d{2}/);
    expect(formatWaktu(null)).toBe('-');
  });
});
