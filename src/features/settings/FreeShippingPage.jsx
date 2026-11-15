import { useState } from 'react';
import { PackageCheck, Plus, Trash2 } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState, Modal, TextInput, Select, IconButton, formatRp } from '../../components/ui';
import { useStoreSetting } from '../customers/useStoreSetting';

export default function FreeShippingPage() {
  const { value: packages, save, status } = useStoreSetting('free_shipping_packages', []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', min_purchase: '', type: 'all' });

  const add = async () => {
    if (!form.name.trim()) return;
    const ok = await save([...(packages || []), {
      id: `fsp-${Date.now()}`,
      name: form.name.trim(),
      min_purchase: Number(form.min_purchase) || 0,
      type: form.type,
      active: true,
    }]);
    if (ok) { setOpen(false); setForm({ name: '', min_purchase: '', type: 'all' }); }
  };

  return (
    <SettingsPageLayout title="Paket Gratis Ongkir" desc="Tingkatkan penjualan Anda melalui Paket Pengiriman Gratis.">
      <Card>
        {status.type === 'error' && <p className="mb-3 text-sm text-danger">{status.message}</p>}
        {(!packages || packages.length === 0) ? (
          <EmptyState
            icon={PackageCheck}
            title="Belum ada paket gratis ongkir"
            description="Buat promo gratis ongkir untuk menarik lebih banyak pembeli."
            action={<Button icon={Plus} onClick={() => setOpen(true)}>Buat Paket</Button>}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral">{packages.length} paket</h3>
              <Button icon={Plus} onClick={() => setOpen(true)}>Buat Paket</Button>
            </div>
            <ul className="divide-y divide-divider">
              {packages.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <PackageCheck className="w-4 h-4 text-subdued shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral">{p.name}</p>
                    <p className="text-xs text-subdued">
                      {p.min_purchase > 0 ? `Min. belanja ${formatRp(p.min_purchase)}` : 'Tanpa minimum'}
                      {' · '}{p.type === 'all' ? 'Semua produk' : 'Produk tertentu'}
                    </p>
                  </div>
                  <IconButton icon={Trash2} label={`Hapus ${p.name}`} onClick={() => save(packages.filter((x) => x.id !== p.id))} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Modal open={open} title="Buat Paket Gratis Ongkir" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <TextInput label="Nama paket" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gratis Ongkir Min. 100rb" />
          <TextInput label="Minimum belanja (Rp)" type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} hint="Kosongkan untuk tanpa minimum" />
          <Select
            label="Berlaku untuk"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: 'all', label: 'Semua produk' }, { value: 'selected', label: 'Produk tertentu' }]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={add} disabled={!form.name.trim() || status.type === 'saving'}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </SettingsPageLayout>
  );
}
