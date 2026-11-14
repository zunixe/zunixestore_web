import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import {
  PageHeader, Card, Button, IconButton, SearchInput, DataTable, EmptyState, Modal, TextInput, Select,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';
import { BUYER_GROUPS_KEY, BUYER_GROUPS_DEFAULT, formatGroupDiscount, newId } from './buyerGroups';
import { TextArea, NoStoreNote, LoadErrorNote } from './CustomerParts';

const EMPTY_FORM = { name: '', description: '', discountType: 'percent', discountValue: '' };
const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Persentase (%)' },
  { value: 'amount', label: 'Nominal (Rp)' },
];

export default function BuyerGroupsPage() {
  const setting = useStoreSetting(BUYER_GROUPS_KEY, BUYER_GROUPS_DEFAULT);
  const groups = useMemo(() => setting.value.groups || [], [setting.value]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | group id
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const saving = setting.status.type === 'saving';
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups;
  }, [groups, query]);

  const openNew = () => { setForm(EMPTY_FORM); setFormError(''); setEditing('new'); };
  const openEdit = (g) => {
    setForm({
      name: g.name,
      description: g.description || '',
      discountType: g.discountType || 'percent',
      discountValue: g.discountValue ? String(g.discountValue) : '',
    });
    setFormError('');
    setEditing(g.id);
  };
  const closeModal = () => { if (!saving) setEditing(null); };

  const submit = async (e) => {
    e?.preventDefault();
    const name = form.name.trim();
    const value = Number(form.discountValue) || 0;
    if (!name) { setFormError('Nama grup wajib diisi.'); return; }
    if (groups.some((g) => g.id !== editing && g.name.toLowerCase() === name.toLowerCase())) {
      setFormError('Nama grup sudah dipakai.'); return;
    }
    if (value < 0 || (form.discountType === 'percent' && value > 100)) {
      setFormError('Diskon persentase harus antara 0 dan 100.'); return;
    }
    const data = { name, description: form.description.trim(), discountType: form.discountType, discountValue: value };
    const next = editing === 'new'
      ? [...groups, { id: newId(), memberIds: [], createdAt: new Date().toISOString(), ...data }]
      : groups.map((g) => (g.id === editing ? { ...g, ...data } : g));
    const ok = await setting.save({ ...setting.value, groups: next });
    if (ok) setEditing(null);
    else setFormError('Gagal menyimpan grup. Coba lagi.');
  };

  const doDelete = async () => {
    const ok = await setting.save({ ...setting.value, groups: groups.filter((g) => g.id !== confirmDelete.id) });
    if (ok) setConfirmDelete(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Nama grup',
      render: (g) => (
        <div className="min-w-0">
          <div className="font-medium text-neutral">{g.name}</div>
          {g.description && <div className="text-xs text-subdued mt-0.5 truncate max-w-xs">{g.description}</div>}
        </div>
      ),
    },
    {
      key: 'members',
      label: 'Jumlah anggota',
      className: 'tabular-nums',
      render: (g) => `${(g.memberIds || []).length} customer`,
    },
    { key: 'discount', label: 'Diskon', className: 'tabular-nums', render: (g) => formatGroupDiscount(g) },
    {
      key: 'actions',
      label: <span className="sr-only">Aksi</span>,
      className: 'w-24 text-right',
      render: (g) => (
        <div className="flex justify-end gap-1">
          <IconButton icon={Pencil} label={`Ubah grup ${g.name}`} onClick={() => openEdit(g)} />
          <IconButton icon={Trash2} label={`Hapus grup ${g.name}`} className="text-danger hover:bg-danger-surface" onClick={() => setConfirmDelete(g)} />
        </div>
      ),
    },
  ];

  const createButton = <Button icon={Plus} onClick={openNew} disabled={!setting.hasStore || setting.loading}>Buat grup</Button>;

  return (
    <div>
      <PageHeader
        title="Grup Customer"
        subtitle="Kelompokkan customer untuk memberi harga atau diskon khusus."
        actions={createButton}
      />
      <LoadErrorNote setting={setting} />

      {!setting.hasStore ? (
        <Card><NoStoreNote /></Card>
      ) : !setting.loading && groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Belum ada grup customer"
            description="Buat grup seperti Reseller atau Member VIP, lalu masukkan customer ke grup dari halaman Semua Customer."
            action={<Button icon={Plus} onClick={openNew}>Buat grup</Button>}
          />
        </Card>
      ) : (
        <Card padded={false}>
          <div className="p-4">
            <SearchInput value={query} onChange={setQuery} placeholder="Cari nama grup" />
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            loading={setting.loading}
            emptyText="Grup tidak ditemukan"
            minWidth={640}
          />
          <p className="px-4 py-3 border-t border-divider text-xs text-subdued">
            Untuk menambah anggota, pilih customer di{' '}
            <Link to="/buyers" className="text-primary hover:underline">Semua Customer</Link>{' '}
            lalu klik &ldquo;Masukkan ke grup&rdquo;.
          </p>
        </Card>
      )}

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Buat grup' : 'Ubah grup'}
        onClose={closeModal}
        footer={(
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>Batal</Button>
            <Button type="submit" form="group-form" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        <form id="group-form" onSubmit={submit} className="space-y-4" noValidate>
          <TextInput
            id="group-name"
            label="Nama grup"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Reseller"
            maxLength={60}
            autoFocus
          />
          <TextArea
            id="group-desc"
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Opsional"
            rows={2}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              id="group-discount-type"
              label="Tipe diskon"
              value={form.discountType}
              onChange={(v) => setForm((f) => ({ ...f, discountType: v }))}
              options={DISCOUNT_TYPES}
            />
            <TextInput
              id="group-discount-value"
              label="Nilai diskon"
              type="number"
              min="0"
              max={form.discountType === 'percent' ? 100 : undefined}
              inputMode="numeric"
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
              placeholder="0"
              suffix={form.discountType === 'percent' ? '%' : 'Rp'}
            />
          </div>
          {formError && <p className="text-sm text-danger" role="alert">{formError}</p>}
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        title="Hapus grup"
        onClose={() => !saving && setConfirmDelete(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={saving}>Batal</Button>
            <Button variant="danger" onClick={doDelete} disabled={saving}>{saving ? 'Menghapus...' : 'Hapus'}</Button>
          </>
        )}
      >
        <p className="text-sm text-neutral">
          Hapus grup <strong>{confirmDelete?.name}</strong>? Customer di dalamnya tidak ikut terhapus dan akan kembali menjadi Regular.
        </p>
        {setting.status.type === 'error' && <p className="text-sm text-danger mt-2" role="alert">{setting.status.message}</p>}
      </Modal>
    </div>
  );
}
