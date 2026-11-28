import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SECTION_CATALOG, SECTION_META, GENERIC_SECTION, mergeDraft } from '../src/features/themes/editor/schema';

const read = (p) => readFileSync(p, 'utf8');

describe('katalog Tambah Bagian', () => {
  it('hanya menawarkan seksi yang dirender template storefront default', () => {
    const home = read('../ZunixeStore-Frontend/src/templates/default/pages/HomePage.jsx');
    const offered = SECTION_CATALOG.flatMap((g) => g.items.map((it) => it.id));
    // 8 seksi bawaan selalu dirender; sisanya wajib punya case di sectionEl.
    for (const id of offered) {
      expect(home, `case untuk ${id}`).toContain(`case '${id}'`);
    }
  });

  it('tidak menawarkan seksi yang belum punya kontrak data', () => {
    const offered = SECTION_CATALOG.flatMap((g) => g.items.map((it) => it.id));
    for (const id of ['instagram', 'contentGrid', 'hashtags', 'rating']) {
      expect(offered).not.toContain(id);
    }
  });

  it('semua seksi katalog punya metadata sidebar', () => {
    for (const g of SECTION_CATALOG) {
      for (const it of g.items) {
        expect(SECTION_META[it.id], `meta ${it.id}`).toBeTruthy();
      }
    }
  });

  it('seksi generik bergabung dengan draft tanpa merusak mergeDraft', () => {
    const merged = mergeDraft({ sections: { paragraf: { ...GENERIC_SECTION, teks: 'Halo', visible: false } }, order: ['namaToko', 'paragraf', 'footer'] });
    expect(merged.sections.paragraf.teks).toBe('Halo');
    expect(merged.sections.paragraf.visible).toBe(false);
    expect(merged.order).toEqual(['namaToko', 'paragraf', 'footer']);
  });

  it('panel konten punya form untuk seksi konten-driven', () => {
    const panels = read('src/features/themes/editor/panels.jsx');
    for (const id of ['paragraf', 'marquee', 'gambarTeks', 'videoTeks', 'daftarLogo', 'kolase', 'produkKategori', 'semuaProduk']) {
      expect(panels, `case panel ${id}`).toContain(`case '${id}'`);
    }
  });
});

describe('floating button', () => {
  it('schema punya kontrak lengkap home.floating', () => {
    const schema = read('src/features/themes/editor/schema.js');
    for (const k of ['aktif', 'tipe', 'teks', 'link', 'warna', 'posisi', 'seluler']) {
      expect(schema).toContain(k);
    }
  });

  it('panel floating punya kontrol tipe, posisi, warna, dan seluler', () => {
    const panels = read('src/features/themes/editor/panels.jsx');
    expect(panels).toContain('Tampilkan floating button');
    expect(panels).toContain('Tipe Tombol');
    expect(panels).toContain("'whatsapp'");
    expect(panels).toContain('Tautan Kustom');
    expect(panels).toContain('Tampilkan juga di perangkat seluler');
  });
});

describe('waktuTerbatas (flash sale)', () => {
  it('katalog menawarkan dan extras menyediakan default', () => {
    const schema = read('src/features/themes/editor/schema.js');
    expect(schema).toContain("'waktuTerbatas'");
    expect(schema).toContain('SECTION_EXTRAS');
    expect(schema).toContain('Produk waktu terbatas');
  });

  it('addSection menggabungkan extras', () => {
    const page = read('src/features/themes/editor/ThemeEditorPage.jsx');
    expect(page).toContain('SECTION_EXTRAS[id]');
  });

  it('panel punya picker produk, tanggal, dan waktu', () => {
    const panels = read('src/features/themes/editor/panels.jsx');
    expect(panels).toContain("case 'waktuTerbatas'");
    expect(panels).toContain('Tanggal Berakhir');
    expect(panels).toContain('Waktu Berakhir (WIB)');
  });
});
