import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader, Card, Button, Select, DataTable } from '../../components/ui';
import { downloadCsv } from './statsUtils';

/*
 * Backend belum menyimpan data wishlist; tabel tampil kosong sampai endpoint tersedia.
 */
const RANGES = [
  { value: 'all', label: 'Tanggal apapun' },
  { value: '7', label: '7 hari terakhir' },
  { value: '30', label: '30 hari terakhir' },
  { value: '90', label: '90 hari terakhir' },
];

const COLUMNS = [
  { key: 'rank', label: '#', className: 'w-12' },
  { key: 'product', label: 'Produk' },
  { key: 'count', label: 'Dimasukkan ke Wishlist oleh' },
];

export default function WishlistReportPage() {
  const [range, setRange] = useState('all');
  const rows = [];

  const exportCsv = () => downloadCsv('laporan-wishlist.csv', ['#', 'Produk', 'Dimasukkan ke Wishlist oleh'],
    rows.map((r) => [r.rank, r.product, r.count]));

  return (
    <div>
      <PageHeader
        title="Laporan Wishlist"
        actions={(
          <>
            <label htmlFor="wishlist-range" className="sr-only">Rentang tanggal</label>
            <Select id="wishlist-range" value={range} onChange={setRange} options={RANGES} className="w-48" />
            <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={rows.length === 0}>Download</Button>
          </>
        )}
      />
      <Card padded={false}>
        <DataTable columns={COLUMNS} rows={rows} emptyText="Tidak ditemukan data pada rentang ini" />
      </Card>
    </div>
  );
}
