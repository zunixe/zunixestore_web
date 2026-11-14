import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  PageHeader, Card, Button, IconButton, Badge, SearchInput, FilterChip, DataTable, Pagination, Modal,
  TextInput, Select, Toggle, formatRp,
} from '../../components/ui';
import api from '../../utils/api';
import { fetchDiscounts, createDiscount, deleteDiscount } from './discountsSlice';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
];
const TYPE_OPTIONS = [
  { value: 'percentage', label: 'Persentase (%)' },
  { value: 'fixed_amount', label: 'Nominal (Rp)' },
];
const EMPTY_FORM = {
  code: '', type: 'percentage', value: '', max_discount: '', min_purchase: '', usage_limit: '', start_date: '', end_date: '', status: 'active',
};

const pad = (n) => String(n).padStart(2, '0');
const todayYmd = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(String(s).length === 10 ? `${s}T00:00:00` : s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const discountText = (d) => (d.type === 'percentage' ? `${d.value}%` : formatRp(d.value));
const discountName = (d) => d.name || (d.type === 'percentage' ? `Diskon ${d.value}%` : `Potongan ${formatRp(d.value)}`);

function isActive(d, today) {
  if (d.status !== 'active') return false;
  if (d.start_date && String(d.start_date).slice(0, 10) > today) return false;
  if (d.end_date && String(d.end_date).slice(0, 10) < today) return false;
  if (d.usage_limit && Number(d.usage_count || 0) >= Number(d.usage_limit)) return false;
  return true;
}

function activeRange(d) {
  if (!d.start_date && !d.end_date) return 'Selalu aktif';
  if (d.start_date && !d.end_date) return `Mulai ${fmtDate(d.start_date)}`;
  if (!d.start_date) return `Sampai ${fmtDate(d.end_date)}`;
  return `${fmtDate(d.start_date)} - ${fmtDate(d.end_date)}`;
}

function MoreMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <IconButton icon={MoreVertical} label="Opsi lainnya" aria-expanded={open} className="border border-divider bg-white" onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="absolute right-0 z-30 mt-1 min-w-[200px] bg-white rounded-lg shadow-lg border border-divider py-1">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              disabled={it.disabled}
              onClick={() => { setOpen(false); it.onClick(); }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer disabled:text-gray-400 disabled:cursor-default"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscountFormModal({ initial, onClose, onSubmit }) {
  const isEdit = !!initial.id;
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, v ?? ''])),
    start_date: initial.start_date ? String(initial.start_date).slice(0, 10) : '',
    end_date: initial.end_date ? String(initial.end_date).slice(0, 10) : '',
  }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const value = Number(form.value);
    if (!value || value <= 0) { setErr('Nilai diskon harus lebih dari 0.'); return; }
    if (form.type === 'percentage' && value > 100) { setErr('Diskon persentase maksimal 100%.'); return; }
    if (form.start_date && form.end_date && form.end_date < form.start_date) { setErr('Tanggal selesai tidak boleh sebelum tanggal mulai.'); return; }
    const num = (v) => (v === '' || v === null ? null : Number(v));
    const payload = {
      code: form.code.trim().toUpperCase() || null,
      type: form.type,
      value,
      min_purchase: num(form.min_purchase) ?? 0,
      max_discount: form.type === 'percentage' ? num(form.max_discount) : null,
      usage_limit: num(form.usage_limit),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    };
    setBusy(true);
    try {
      await onSubmit(payload);
    } catch (ex) {
      setErr(typeof ex === 'string' ? ex : ex?.message || 'Gagal menyimpan diskon.');
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? 'Ubah diskon' : 'Buat diskon'}
      onClose={onClose}
      width="max-w-xl"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" form="discount-form" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
      )}
    >
      <form id="discount-form" onSubmit={submit} className="space-y-4">
        <TextInput
          id="disc-code"
          label="Kode diskon"
          placeholder="Contoh: HEMAT10"
          value={form.code}
          onChange={(e) => set({ code: e.target.value.toUpperCase() })}
          hint="Kosongkan jika diskon berlaku otomatis tanpa kode."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select id="disc-type" label="Tipe diskon" value={form.type} onChange={(v) => set({ type: v })} options={TYPE_OPTIONS} />
          <TextInput
            id="disc-value"
            label="Nilai diskon"
            type="number"
            min="0"
            required
            suffix={form.type === 'percentage' ? '%' : 'Rp'}
            value={form.value}
            onChange={(e) => set({ value: e.target.value })}
          />
          {form.type === 'percentage' && (
            <TextInput id="disc-max" label="Maks. potongan" type="number" min="0" suffix="Rp" value={form.max_discount} onChange={(e) => set({ max_discount: e.target.value })} />
          )}
          <TextInput id="disc-min" label="Min. pembelian" type="number" min="0" suffix="Rp" value={form.min_purchase} onChange={(e) => set({ min_purchase: e.target.value })} />
          <TextInput
            id="disc-quota"
            label="Kuota"
            type="number"
            min="1"
            placeholder="Tidak terbatas"
            value={form.usage_limit}
            onChange={(e) => set({ usage_limit: e.target.value })}
          />
          <TextInput id="disc-start" label="Tanggal mulai" type="date" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} />
          <TextInput id="disc-end" label="Tanggal selesai" type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => set({ end_date: e.target.value })} />
        </div>
        <Toggle
          id="disc-status"
          label="Aktifkan diskon"
          description="Diskon nonaktif tidak bisa dipakai pembeli walaupun masih dalam periode aktif."
          checked={form.status === 'active'}
          onChange={(v) => set({ status: v ? 'active' : 'inactive' })}
        />
        {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      </form>
    </Modal>
  );
}

export default function DiscountsPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, isLoading, error } = useSelector((s) => s.discounts);
  const storeId = currentStore?.id;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => { if (storeId) dispatch(fetchDiscounts(storeId)); }, [dispatch, storeId]);

  const today = todayYmd();
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items || []).filter((d) => {
      if (q && !`${d.code || ''} ${discountName(d)}`.toLowerCase().includes(q)) return false;
      if (statusFilter && (isActive(d, today) ? 'active' : 'inactive') !== statusFilter) return false;
      if (typeFilter && d.type !== typeFilter) return false;
      return true;
    });
  }, [items, search, statusFilter, typeFilter, today]);
  const rows = filtered.slice((page - 1) * limit, page * limit);

  const refresh = () => dispatch(fetchDiscounts(storeId));

  const submitForm = async (payload) => {
    if (editing?.id) {
      await api.put(`/stores/${storeId}/discounts/${editing.id}`, payload);
      refresh();
    } else {
      const created = await dispatch(createDiscount({ storeId, data: payload })).unwrap();
      // Endpoint create belum menerima `status`; nonaktifkan lewat update bila perlu.
      if (payload.status !== 'active' && created?.id) {
        await api.put(`/stores/${storeId}/discounts/${created.id}`, { status: payload.status });
        refresh();
      }
    }
    setEditing(null);
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    setActionError('');
    try {
      await dispatch(deleteDiscount({ storeId, discountId: deleting.id })).unwrap();
      setDeleting(null);
    } catch (ex) {
      setActionError(typeof ex === 'string' ? ex : 'Gagal menghapus diskon.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const exportCsv = () => {
    const header = ['Nama', 'Kode diskon', 'Diskon', 'Min. Pembelian', 'Kuota', 'Tanggal Aktif', 'Status'];
    const lines = filtered.map((d) => [
      discountName(d), d.code || '', discountText(d), d.min_purchase || 0,
      d.usage_limit ? `${d.usage_count || 0}/${d.usage_limit}` : `${d.usage_count || 0}/-`,
      activeRange(d), isActive(d, today) ? 'Aktif' : 'Tidak Aktif',
    ]);
    const csv = [header, ...lines].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `diskon-produk-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name', label: 'Nama', className: 'whitespace-nowrap',
      render: (d) => (
        <button type="button" onClick={() => setEditing(d)} className="font-medium text-neutral underline decoration-divider underline-offset-4 hover:text-primary hover:decoration-primary cursor-pointer">
          {discountName(d)}
        </button>
      ),
    },
    { key: 'code', label: 'Kode diskon', render: (d) => (d.code ? <span className="font-mono text-[13px]">{d.code}</span> : <span className="text-subdued">Otomatis</span>) },
    {
      key: 'value', label: 'Diskon', className: 'whitespace-nowrap',
      render: (d) => (
        <div>
          <div>{discountText(d)}</div>
          {d.type === 'percentage' && d.max_discount ? <div className="text-xs text-subdued">Maks. {formatRp(d.max_discount)}</div> : null}
        </div>
      ),
    },
    { key: 'min_purchase', label: 'Min. Pembelian', className: 'whitespace-nowrap', render: (d) => (Number(d.min_purchase) ? formatRp(d.min_purchase) : '-') },
    {
      key: 'quota', label: 'Kuota', className: 'whitespace-nowrap tabular-nums',
      render: (d) => (d.usage_limit ? `${d.usage_count || 0}/${d.usage_limit}` : <span className="text-subdued">{d.usage_count || 0} / Tidak terbatas</span>),
    },
    { key: 'dates', label: 'Tanggal Aktif', className: 'whitespace-nowrap', render: activeRange },
    { key: 'products', label: 'Jumlah Produk', className: 'whitespace-nowrap', render: () => <span className="text-subdued">Semua produk</span> },
    {
      key: 'status', label: 'Status',
      render: (d) => (isActive(d, today) ? <Badge tone="success">Aktif</Badge> : <Badge tone="muted">Tidak Aktif</Badge>),
    },
    {
      key: 'actions', label: <span className="sr-only">Aksi</span>, className: 'w-24',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton icon={Pencil} label={`Ubah ${discountName(d)}`} onClick={() => setEditing(d)} />
          <IconButton icon={Trash2} label={`Hapus ${discountName(d)}`} className="text-danger hover:bg-danger-surface" onClick={() => setDeleting(d)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Diskon Produk"
        actions={(
          <>
            <MoreMenu
              items={[
                { label: 'Unduh CSV', onClick: exportCsv, disabled: filtered.length === 0 },
                { label: 'Muat ulang', onClick: refresh, disabled: !storeId },
              ]}
            />
            <Button icon={Plus} onClick={() => setEditing({})} disabled={!storeId}>Buat diskon</Button>
          </>
        )}
      />

      <Card padded={false}>
        <div className="p-4 space-y-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari" />
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip label="Status Apa Pun" value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
            <FilterChip label="Tipe Apa Pun" value={typeFilter} options={TYPE_OPTIONS} onChange={(v) => { setTypeFilter(v); setPage(1); }} />
          </div>
          {(error || actionError) && <p className="text-sm text-danger" role="alert">{actionError || `Gagal memuat diskon: ${error}`}</p>}
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          emptyText={currentStore ? 'Belum ada diskon' : 'Pilih toko terlebih dahulu'}
          minWidth={1100}
        />
        <Pagination
          page={page}
          limit={limit}
          total={filtered.length}
          onPage={setPage}
          onLimit={(l) => { setLimit(l); setPage(1); }}
          label="Items per page"
        />
      </Card>

      <p className="text-xs text-subdued mt-3">Catatan: Diskon tidak bisa diaplikasikan ketika harga grosir sedang aktif.</p>

      {editing && (
        <DiscountFormModal key={editing.id || 'new'} initial={editing} onClose={() => setEditing(null)} onSubmit={submitForm} />
      )}

      <Modal
        open={!!deleting}
        title="Hapus diskon?"
        onClose={() => setDeleting(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>Batal</Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleteBusy}>{deleteBusy ? 'Menghapus...' : 'Hapus'}</Button>
          </>
        )}
      >
        <p className="text-sm text-neutral">
          Diskon <strong>{deleting ? discountName(deleting) : ''}</strong>
          {deleting?.code ? ` (${deleting.code})` : ''} akan dihapus permanen dan tidak bisa dipakai lagi oleh pembeli.
        </p>
      </Modal>
    </div>
  );
}
