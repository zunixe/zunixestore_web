import { useRef, useState } from 'react';
import { Plus, History, ArrowDownToLine } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, DataTable, Modal, TextInput, Badge, formatRp,
} from '../../components/ui';
import { useStoreSetting } from '../customers/useStoreSetting';

const DEFAULTS = { transactions: [] };
const fmtDate = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function BalancePage() {
  const { value, save, status } = useStoreSetting('wallet', DEFAULTS);
  const [modal, setModal] = useState(null); // 'topup' | 'withdraw'
  const [amount, setAmount] = useState('');
  const historyRef = useRef(null);

  const txs = value?.transactions || [];
  const balance = txs.reduce((s, t) => s + t.amount, 0);
  const totalIn = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);

  const submit = async () => {
    const n = Math.round(Number(amount));
    if (!n || n <= 0) return;
    const isTopup = modal === 'topup';
    const tx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      desc: isTopup ? 'Top Up Saldo' : 'Tarik Saldo',
      amount: isTopup ? n : -n,
      status: isTopup ? 'Berhasil' : 'Diproses',
    };
    const ok = await save({ transactions: [tx, ...txs] });
    if (ok) { setModal(null); setAmount(''); }
  };

  const rows = txs.map((t) => ({
    id: t.id,
    date: fmtDate(t.date),
    desc: t.desc,
    amount: <span className={`tabular-nums font-medium ${t.amount > 0 ? 'text-success' : 'text-danger'}`}>{t.amount > 0 ? '+' : '-'}{formatRp(Math.abs(t.amount))}</span>,
    status: <Badge tone={t.status === 'Berhasil' ? 'success' : 'warning'}>{t.status}</Badge>,
  }));

  return (
    <div>
      <PageHeader title="Saldo" />
      {status.type === 'error' && <p className="mb-3 text-sm text-danger">{status.message}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
        <Card padded={false}>
          <div className="p-4">
            <p className="text-xs text-subdued font-[family-name:var(--font-label)]">Saldo Saat Ini</p>
            <p className="text-3xl font-bold text-neutral mt-1 tabular-nums">{formatRp(balance)}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button icon={Plus} onClick={() => setModal('topup')}>Top Up</Button>
              <Button variant="secondary" icon={History} onClick={() => historyRef.current?.scrollIntoView({ behavior: 'smooth' })}>Riwayat</Button>
            </div>
          </div>
          <div className="border-t border-divider" ref={historyRef}>
            <CardHeader title="Riwayat Transaksi" className="px-4 pt-4 mb-0" />
            <DataTable
              columns={[{ key: 'date', label: 'Tanggal' }, { key: 'desc', label: 'Keterangan' }, { key: 'amount', label: 'Jumlah' }, { key: 'status', label: 'Status' }]}
              rows={rows}
              emptyText="Belum ada transaksi"
              minWidth={520}
            />
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Informasi Saldo" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-subdued">Total Masuk</dt><dd className="text-neutral tabular-nums">{formatRp(totalIn)}</dd></div>
            <div className="flex justify-between"><dt className="text-subdued">Total Keluar</dt><dd className="text-neutral tabular-nums">{formatRp(totalOut)}</dd></div>
            <div className="flex justify-between border-t border-divider pt-3"><dt className="text-neutral font-medium">Saldo Tersedia</dt><dd className="font-bold text-neutral tabular-nums">{formatRp(balance)}</dd></div>
          </dl>
          <Button variant="secondary" icon={ArrowDownToLine} className="w-full mt-4" onClick={() => setModal('withdraw')} disabled={balance <= 0}>Tarik Saldo</Button>
        </Card>
      </div>

      <Modal open={!!modal} title={modal === 'topup' ? 'Top Up Saldo' : 'Tarik Saldo'} onClose={() => setModal(null)}>
        <div className="space-y-3">
          {modal === 'withdraw' && <p className="text-xs text-subdued">Saldo tersedia: {formatRp(balance)}. Penarikan diproses maks. 1x24 jam.</p>}
          <TextInput label="Jumlah (Rp)" type="number" min="1" max={modal === 'withdraw' ? balance : undefined} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button
              onClick={submit}
              disabled={!(Number(amount) > 0) || (modal === 'withdraw' && Number(amount) > balance) || status.type === 'saving'}
            >
              {modal === 'topup' ? 'Top Up' : 'Tarik'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
