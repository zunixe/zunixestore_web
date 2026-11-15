import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState, Modal, TextInput, IconButton } from '../../components/ui';
import { useStoreSetting } from '../customers/useStoreSetting';
import { usePlan } from '../subscriptions/usePlan';

export default function LocationsPage() {
  const { value: locations, save, status } = useStoreSetting('locations', []);
  const { usage } = usePlan();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const limit = usage?.usage?.locations?.limit;
  const full = limit != null && (locations?.length ?? 0) >= limit;

  const add = async () => {
    const name = form.name.trim();
    if (!name) return;
    const ok = await save([...(locations || []), { id: `loc-${Date.now()}`, name, address: form.address.trim() }]);
    if (ok) { setOpen(false); setForm({ name: '', address: '' }); }
  };

  return (
    <SettingsPageLayout title="Lokasi" desc="Kelola lokasi gudang kamu untuk kemudahan distribusi produk.">
      <Card>
        {status.type === 'error' && <p className="mb-3 text-sm text-danger">{status.message}</p>}
        {(!locations || locations.length === 0) ? (
          <EmptyState
            icon={MapPin}
            title="Belum ada lokasi gudang"
            description="Tambahkan lokasi untuk memudahkan pengaturan ongkos kirim."
            action={<Button icon={Plus} onClick={() => setOpen(true)}>Tambah Lokasi</Button>}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral">{locations.length} lokasi{limit != null ? ` / ${limit}` : ''}</h3>
              {full
                ? <Button variant="secondary" icon={Plus} to="/settings/plans">Upgrade untuk menambah</Button>
                : <Button icon={Plus} onClick={() => setOpen(true)}>Tambah Lokasi</Button>}
            </div>
            <ul className="divide-y divide-divider">
              {locations.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <MapPin className="w-4 h-4 text-subdued shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral">{l.name}</p>
                    {l.address && <p className="text-xs text-subdued truncate">{l.address}</p>}
                  </div>
                  <IconButton icon={Trash2} label={`Hapus ${l.name}`} onClick={() => save(locations.filter((x) => x.id !== l.id))} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Modal open={open} title="Tambah Lokasi" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <TextInput label="Nama lokasi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gudang Utama" />
          <TextInput label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jl. Contoh No. 1, Jakarta" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={add} disabled={!form.name.trim() || status.type === 'saving'}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </SettingsPageLayout>
  );
}
