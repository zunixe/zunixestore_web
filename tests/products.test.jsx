import { describe, it, expect } from 'vitest';
import { parseCsv } from '../src/features/products/ProductsPage';

describe('parseCsv', () => {
  it('mem-parse CSV sederhana', () => {
    const rows = parseCsv('sku,name,price,stock\nSKU1,Produk A,10000,5\nSKU2,Produk B,20000,3');
    expect(rows).toEqual([
      ['sku', 'name', 'price', 'stock'],
      ['SKU1', 'Produk A', '10000', '5'],
      ['SKU2', 'Produk B', '20000', '3'],
    ]);
  });
  it('menangani koma di dalam kutipan', () => {
    const rows = parseCsv('name,price\n"Kaos, besar",50000');
    expect(rows[1][0]).toBe('Kaos, besar');
  });
  it('menangani titik-koma & baris kosong', () => {
    const rows = parseCsv('name;price\nA;100\n\nB;200\n');
    expect(rows).toHaveLength(3);
    expect(rows[2][1]).toBe('200');
  });
  it('escaped quote di dalam field', () => {
    const rows = parseCsv('name\n"Kaos ""XL"" merah"');
    expect(rows[1][0]).toBe('Kaos "XL" merah');
  });
});
