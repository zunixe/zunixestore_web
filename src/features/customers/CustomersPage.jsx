import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { fetchCustomers } from './customersSlice';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';
import {
  PageHeader, Card, Button, Badge, SearchInput, FilterChip, DataTable, Pagination, Modal, TextInput, Select, formatRp,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';
import { BUYER_GROUPS_KEY, BUYER_GROUPS_DEFAULT, groupsOfCustomer, addMembers } from './buyerGroups';
import { TextArea } from './CustomerParts';

// Batas data yang diambil sekaligus saat filter sisi-klien (grup / riwayat belanja) aktif.
const CLIENT_FILTER_LIMIT = 500;
const EMPTY_FORM = { name: '', email: '', phone: '', address: '', groupId: '' };
const HISTORY_OPTIONS = [
  { value: 'buyer', label: 'Pernah belanja' },
  { value: 'none', label: 'Belum pernah belanja' },
];

export default function CustomersPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, isLoading, error } = useSelector((s) => s.customers);
  const groupsSetting = useStoreSetting(BUYER_GROUPS_KEY, BUYER_GROUPS_DEFAULT);
  const groups = useMemo(() => groupsSetting.value.groups || [], [groupsSetting.value]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkGroup, setBulkGroup] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clientMode = !!(groupFilter || historyFilter);

  // Pencarian diterapkan setelah pengguna berhenti mengetik.
  useEffect(() => {
    const t = setTimeout(() => setAppliedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!currentStore) return;
    const params = clientMode ? { page: 1, limit: CLIENT_FILTER_LIMIT } : { page, limit };
    if (appliedSearch) params.search = appliedSearch;
    dispatch(fetchCustomers({ storeId: currentStore.id, params }));
  }, [dispatch, currentStore, page, limit, appliedSearch, clientMode, reloadKey]);

  const filtered = useMemo(() => {
    if (!clientMode) return items;
    return items.filter((c) => {
      if (groupFilter && !groupsOfCustomer(groups, c.id).some((g) => g.id === groupFilter)) return false;
      if (historyFilter === 'buyer' && !(Number(c.total_orders) > 0)) return false;
      if (historyFilter === 'none' && Number(c.total_orders) > 0) return false;
      return true;
    });
  }, [items, clientMode, groupFilter, historyFilter, groups]);

  const rows = clientMode ? filtered.slice((page - 1) * limit, page * limit) : items;
  const rowTotal = clientMode ? filtered.length : total;

  const resetPaging = () => { setPage(1); setSelected([]); };

  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (c) => <span className="font-medium text-neutral">{c.name || '-'}</span>,
    },
    {
      key: 'contact',
      label: 'Email/Telepon',
      render: (c) => (
        <div className="min-w-0">
          <div className="truncate">{c.email || '-'}</div>
          {c.phone && <div className="text-xs text-subdued mt-0.5">{c.phone}</div>}
        </div>
      ),
    },
    {
      key: 'group',
      label: 'Grup',
      render: (c) => {
        const gs = groupsOfCustomer(groups, c.id);
        if (gs.length === 0) return <Badge tone="muted">Regular</Badge>;
        return (
          <div className="flex flex-wrap gap-1">
            {gs.map((g) => <Badge key={g.id} tone="primary">{g.name}</Badge>)}
          </div>
        );
      },
    },
    {
      key: 'total_orders',
      label: 'Total Pesanan',
      className: 'tabular-nums',
      render: (c) => Number(c.total_orders) || 0,
    },
    {
      key: 'total_spent',
      label: 'Total Belanja',
      className: 'tabular-nums whitespace-nowrap',
      render: (c) => formatRp(c.total_spent),
    },
    {
      key: 'created_at',
      label: 'Terdaftar',
      className: 'text-subdued whitespace-nowrap',
      render: (c) => (c.created_at ? formatDate(c.created_at) : '-'),
    },
  ];

  const openModal = () => { setForm(EMPTY_FORM); setFormError(''); setModalOpen(true); };
  const closeModal = () => { if (!submitting) setModalOpen(false); };
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const submitCustomer = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) { setFormError('Nama wajib diisi.'); return; }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) { setFormError('Format email tidak valid.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await api.post(`/stores/${currentStore.id}/customers`, {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      if (form.groupId && res.data?.id) {
        await groupsSetting.save({ ...groupsSetting.value, groups: addMembers(groups, form.groupId, [res.data.id]) });
      }
      setModalOpen(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormError(err.message || 'Gagal menambahkan customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyBulkGroup = async () => {
    if (!bulkGroup || selected.length === 0) return;
    const ok = await groupsSetting.save({ ...groupsSetting.value, groups: addMembers(groups, bulkGroup, selected) });
    if (ok) { setSelected([]); setBulkGroup(''); }
  };

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));

  return (
    <div>
      <PageHeader
        title="Semua Customer"
        actions={<Button icon={Plus} onClick={openModal} disabled={!currentStore}>Tambah customer</Button>}
      />

      <Card padded={false}>
        <div className="p-4 space-y-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); resetPaging(); }}
            onSubmit={() => setAppliedSearch(search.trim())}
            placeholder="Cari nama atau email customer"
          />
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="Grup"
              value={groupFilter}
              options={groupOptions}
              onChange={(v) => { setGroupFilter(v); resetPaging(); }}
            />
            <FilterChip
              label="Riwayat Belanja"
              value={historyFilter}
              options={HISTORY_OPTIONS}
              onChange={(v) => { setHistoryFilter(v); resetPaging(); }}
            />
            {groups.length === 0 && !groupsSetting.loading && (
              <span className="text-xs text-subdued">
                Belum ada grup. <Link to="/buyer-groups" className="text-primary hover:underline">Buat grup customer</Link>
              </span>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-primary-surface border-y border-divider">
            <span className="text-sm text-neutral font-medium">{selected.length} customer dipilih</span>
            {groups.length > 0 ? (
              <>
                <label htmlFor="bulk-group" className="sr-only">Grup tujuan</label>
                <Select
                  id="bulk-group"
                  value={bulkGroup}
                  onChange={setBulkGroup}
                  options={[{ value: '', label: 'Pilih grup...' }, ...groupOptions]}
                  className="w-48"
                />
                <Button size="sm" onClick={applyBulkGroup} disabled={!bulkGroup || groupsSetting.status.type === 'saving'}>
                  Masukkan ke grup
                </Button>
              </>
            ) : (
              <span className="text-xs text-subdued">Buat grup terlebih dahulu untuk mengelompokkan customer.</span>
            )}
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Batal pilih</Button>
            {groupsSetting.status.type === 'error' && (
              <span className="text-xs text-danger" role="alert">{groupsSetting.status.message}</span>
            )}
          </div>
        )}

        {error && <p className="px-4 pb-3 text-sm text-danger" role="alert">Gagal memuat customer: {error}</p>}

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          selectable
          selected={selected}
          onSelect={setSelected}
          minWidth={860}
          emptyText={appliedSearch || clientMode ? 'Customer tidak ditemukan' : 'Belum ada customer'}
        />

        <Pagination
          page={page}
          limit={limit}
          total={rowTotal}
          onPage={(p) => { setPage(p); setSelected([]); }}
          onLimit={(l) => { setLimit(l); resetPaging(); }}
        />
      </Card>

      <Modal
        open={modalOpen}
        title="Tambah customer"
        onClose={closeModal}
        footer={(
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>Batal</Button>
            <Button type="submit" form="add-customer-form" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </>
        )}
      >
        <form id="add-customer-form" onSubmit={submitCustomer} className="space-y-4" noValidate>
          <TextInput id="cust-name" label="Nama" value={form.name} onChange={setField('name')} placeholder="Nama lengkap" required autoFocus />
          <TextInput id="cust-email" label="Email" type="email" value={form.email} onChange={setField('email')} placeholder="nama@email.com" />
          <TextInput id="cust-phone" label="Nomor telepon" type="tel" value={form.phone} onChange={setField('phone')} placeholder="08xxxxxxxxxx" />
          <TextArea id="cust-address" label="Alamat" value={form.address} onChange={setField('address')} placeholder="Alamat lengkap (opsional)" rows={3} />
          {groups.length > 0 ? (
            <Select
              id="cust-group"
              label="Grup"
              value={form.groupId}
              onChange={setField('groupId')}
              options={[{ value: '', label: 'Tanpa grup (Regular)' }, ...groupOptions]}
            />
          ) : (
            <p className="flex items-center gap-2 text-xs text-subdued">
              <Users className="w-4 h-4" aria-hidden="true" /> Belum ada grup customer.
            </p>
          )}
          {formError && <p className="text-sm text-danger" role="alert">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
