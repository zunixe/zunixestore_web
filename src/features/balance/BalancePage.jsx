import { Plus, History, ArrowDownToLine } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, DataTable, formatRp,
} from '../../components/ui';

const HISTORY_COLUMNS = [
  { key: 'date', label: 'Tanggal' },
  { key: 'desc', label: 'Keterangan' },
  { key: 'amount', label: 'Jumlah' },
  { key: 'status', label: 'Status' },
];

export default function BalancePage() {
  return (
    <div>
      <PageHeader title="Saldo" />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
        <Card padded={false}>
          <div className="p-4">
            <p className="text-xs text-subdued font-[family-name:var(--font-label)]">Saldo Saat Ini</p>
            <p className="text-3xl font-bold text-neutral mt-1 tabular-nums">{formatRp(0)}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button icon={Plus}>Top Up</Button>
              <Button variant="secondary" icon={History}>Riwayat</Button>
            </div>
          </div>
          <div className="border-t border-divider">
            <CardHeader title="Riwayat Transaksi" className="px-4 pt-4 mb-0" />
            <DataTable columns={HISTORY_COLUMNS} rows={[]} emptyText="Belum ada transaksi" minWidth={520} />
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Informasi Saldo" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-subdued">Total Masuk</dt><dd className="text-neutral tabular-nums">{formatRp(0)}</dd></div>
            <div className="flex justify-between"><dt className="text-subdued">Total Keluar</dt><dd className="text-neutral tabular-nums">{formatRp(0)}</dd></div>
            <div className="flex justify-between border-t border-divider pt-3"><dt className="text-neutral font-medium">Saldo Tersedia</dt><dd className="font-bold text-neutral tabular-nums">{formatRp(0)}</dd></div>
          </dl>
          <Button variant="secondary" icon={ArrowDownToLine} className="w-full mt-4">Tarik Saldo</Button>
        </Card>
      </div>
    </div>
  );
}
