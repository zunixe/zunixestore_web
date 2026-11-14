import { useState } from 'react';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';
import {
  PageHeader, Card, Button, IconButton, Badge, EmptyState, DataTable, Modal, TextInput, Select, Toggle, Checkbox, formatRp,
} from '../../components/ui';
import { useStoreSetting } from '../orders/useStoreSetting';

const EMPTY = [];
const TYPE_OPTIONS = [
  { value: 'free', label: 'Gratis ongkir penuh' },
  { value: 'fixed', label: 'Potongan nominal (Rp)' },
  { value: 'percentage', label: 'Potongan persentase (%)' },
];
const COURIERS = ['JNE', 'J&T', 'SiCepat', 'AnterAja', 'POS Indonesia'];
const REGION_OPTIONS = [
  { value: 'all', label: 'Seluruh Indonesia' },
  { value: 'java', label: 'Pulau Jawa' },
  { value: 'outside_java', label: 'Luar Pulau Jawa' },
];
const NEW_PROMO = {
  name: '', type: 'free', value: '', max_discount: '', min_purchase: '', couriers: COURIERS, region: 'all', start_date: '', end_date: '', active: true,
};

const pad = (n) => String(n).padStart(2, '0');
const todayYmd = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmtDate = (s) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const newId = () => `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function promoValue(p) {
  if (p.type === 'free') return 'Gratis ongkir';
  if (p.type === 'percentage') return `${p.value}%${p.max_discount ? ` (maks. ${formatRp(p.max_discount)})` : ''}`;
  return formatRp(p.value);
}

function promoRange(p) {
  if (!p.start_date && !p.end_date) return 'Selalu aktif';
  if (!p.end_date) return `Mulai ${fmtDate(p.start_date)}`;
  if (!p.start_date) return `Sampai ${fmtDate(p.end_date)}`;
  return `${fmtDate(p.start_date)} - ${fmtDate(p.end_date)}`;
}

function isActive(p, today) {
  if (!p.active) return false;
  if (p.start_date && p.start_date > today) return false;
  if (p.end_date && p.end_date < today) return false;
  return true;
}

function PromoModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleCourier = (c, on) => set({ couriers: on ? [...form.couriers, c] : form.couriers.filter((x) => x !== c) });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) { setErr('Nama diskon wajib diisi.'); return; }
    if (form.type !== 'free' && !(Number(form.value) > 0)) { setErr('Nilai potongan harus lebih dari 0.'); return; }
    if (form.type === 'percentage' && Number(form.value) > 100) { setErr('Potongan persentase maksimal 100%.'); return; }
    if (form.couriers.length === 0) { setErr('Pilih minimal satu kurir.'); return; }
    if (form.start_date && form.end_date && form.end_date < form.start_date) { setErr('Tanggal selesai tidak boleh sebelum tanggal mulai.'); return; }
    setBusy(true);
    try {
      await onSubmit({ ...form, name: form.name.trim(), id: form.id || newId() });
    } catch (ex) {
      setErr(ex.message || 'Gagal menyimpan diskon pengiriman.');
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={initial.id ? 'Ubah diskon pengiriman' : 'Tambahkan diskon pengiriman'}
      onClose={onClose}
      width="max-w-xl"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" form="ship-promo-form" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
      )}
    >
      <form id="ship-promo-form" onSubmit={submit} className="space-y-4">
        <TextInput id="sp-name" label="Nama diskon" placeholder="Contoh: Gratis ongkir akhir tahun" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select id="sp-type" label="Tipe potongan" value={form.type} onChange={(v) => set({ type: v })} options={TYPE_OPTIONS} className="sm:col-span-2" />
          {form.type !== 'free' && (
            <TextInput
              id="sp-value"
              label="Nilai potongan"
              type="number"
              min="0"
              suffix={form.type === 'percentage' ? '%' : 'Rp'}
              value={form.value}
              onChange={(e) => set({ value: e.target.value })}
            />
          )}
          {form.type === 'percentage' && (
            <TextInput id="sp-max" label="Maks. potongan" type="number" min="0" suffix="Rp" value={form.max_discount} onChange={(e) => set({ max_discount: e.target.value })} />
          )}
          <TextInput id="sp-min" label="Min. pembelian" type="number" min="0" suffix="Rp" value={form.min_purchase} onChange={(e) => set({ min_purchase: e.target.value })} />
          <Select id="sp-region" label="Wilayah tujuan" value={form.region} onChange={(v) => set({ region: v })} options={REGION_OPTIONS} />
          <TextInput id="sp-start" label="Tanggal mulai" type="date" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} />
          <TextInput id="sp-end" label="Tanggal selesai" type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => set({ end_date: e.target.value })} />
        </div>
        <fieldset>
          <legend className="block text-sm font-medium text-neutral mb-2">Kurir yang berlaku</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {COURIERS.map((c) => (
              <Checkbox key={c} label={c} checked={form.couriers.includes(c)} onChange={(on) => toggleCourier(c, on)} />
            ))}
          </div>
        </fieldset>
        <Toggle id="sp-active" label="Aktifkan diskon" checked={form.active} onChange={(v) => set({ active: v })} />
        {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      </form>
    </Modal>
  );
}

export default function ShipmentPromotionsPage() {
  const { value, loading, error, save } = useStoreSetting('shipment_promotions', EMPTY);
  const promos = Array.isArray(value) ? value : EMPTY;
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState('');
  const today = todayYmd();

  const submit = async (promo) => {
    const exists = promos.some((p) => p.id === promo.id);
    await save(exists ? promos.map((p) => (p.id === promo.id ? promo : p)) : [promo, ...promos]);
    setEditing(null);
  };

  const confirmDelete = async () => {
    setActionError('');
    try {
      await save(promos.filter((p) => p.id !== deleting.id));
      setDeleting(null);
    } catch (ex) {
      setActionError(ex.message || 'Gagal menghapus diskon pengiriman.');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Nama',
      render: (p) => (
        <button type="button" onClick={() => setEditing(p)} className="font-medium text-neutral underline decoration-divider underline-offset-4 hover:text-primary hover:decoration-primary cursor-pointer text-left">
          {p.name}
        </button>
      ),
    },
    { key: 'value', label: 'Diskon', className: 'whitespace-nowrap', render: promoValue },
    { key: 'min', label: 'Min. Pembelian', className: 'whitespace-nowrap', render: (p) => (Number(p.min_purchase) ? formatRp(p.min_purchase) : '-') },
    { key: 'couriers', label: 'Kurir', render: (p) => (p.couriers.length === COURIERS.length ? 'Semua kurir' : p.couriers.join(', ')) },
    { key: 'region', label: 'Wilayah', className: 'whitespace-nowrap', render: (p) => REGION_OPTIONS.find((r) => r.value === p.region)?.label || '-' },
    { key: 'dates', label: 'Tanggal Aktif', className: 'whitespace-nowrap', render: promoRange },
    { key: 'status', label: 'Status', render: (p) => (isActive(p, today) ? <Badge tone="success">Aktif</Badge> : <Badge tone="muted">Tidak Aktif</Badge>) },
    {
      key: 'actions', label: <span className="sr-only">Aksi</span>, className: 'w-24',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton icon={Pencil} label={`Ubah ${p.name}`} onClick={() => setEditing(p)} />
          <IconButton icon={Trash2} label={`Hapus ${p.name}`} className="text-danger hover:bg-danger-surface" onClick={() => setDeleting(p)} />
        </div>
      ),
    },
  ];

  const addButton = <Button icon={Plus} onClick={() => setEditing({ ...NEW_PROMO })}>Tambahkan Diskon</Button>;

  return (
    <div>
      <PageHeader title="Diskon pengiriman" actions={promos.length > 0 ? addButton : null} />

      {(error || actionError) && (
        <p className="text-sm text-danger mb-3" role="alert">{actionError || `Gagal memuat diskon pengiriman: ${error}`}</p>
      )}

      {loading ? (
        <Card><div className="h-40 bg-gray-100 rounded animate-pulse" aria-busy="true" /></Card>
      ) : promos.length === 0 ? (
        <Card>
          <EmptyState
            icon={Truck}
            title="Tawarkan diskon pengiriman"
            description="Kurangi biaya pengiriman untuk mendorong pembeli menyelesaikan pembelian."
            action={addButton}
          />
        </Card>
      ) : (
        <Card padded={false}>
          <DataTable columns={columns} rows={promos} minWidth={960} />
        </Card>
      )}

      {editing && (
        <PromoModal key={editing.id || 'new'} initial={editing} onClose={() => setEditing(null)} onSubmit={submit} />
      )}

      <Modal
        open={!!deleting}
        title="Hapus diskon pengiriman?"
        onClose={() => setDeleting(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>Batal</Button>
            <Button variant="danger" onClick={confirmDelete}>Hapus</Button>
          </>
        )}
      >
        <p className="text-sm text-neutral">
          Diskon <strong>{deleting?.name}</strong> akan dihapus dan tidak lagi berlaku saat checkout.
        </p>
      </Modal>
    </div>
  );
}
