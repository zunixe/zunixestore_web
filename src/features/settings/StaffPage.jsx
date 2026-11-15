import { useState } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState, Modal, TextInput, Select, IconButton, Badge } from '../../components/ui';
import { useStoreSetting } from '../customers/useStoreSetting';
import { usePlan } from '../subscriptions/usePlan';

const ROLES = [
  { value: 'admin', label: 'Admin — akses penuh' },
  { value: 'kasir', label: 'Kasir — pesanan & produk' },
  { value: 'viewer', label: 'Viewer — lihat saja' },
];

export default function StaffPage() {
  const { value: staff, save, status } = useStoreSetting('staff_invites', []);
  const { usage } = usePlan();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'kasir' });
  const limit = usage?.usage?.staff?.limit ?? 0;
  const full = limit > 0 && (staff?.length ?? 0) >= limit;

  const invite = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    const ok = await save([...(staff || []), { id: `st-${Date.now()}`, email, role: form.role, status: 'Menunggu' }]);
    if (ok) { setOpen(false); setForm({ email: '', role: 'kasir' }); }
  };

  return (
    <SettingsPageLayout title="Staf" desc="Kelola sumber daya manusia toko kamu.">
      <Card>
        {status.type === 'error' && <p className="mb-3 text-sm text-danger">{status.message}</p>}
        {(!staff || staff.length === 0) ? (
          <EmptyState
            icon={Users}
            title="Belum ada staf"
            description={limit === 0
              ? 'Paket Lite tidak menyertakan kursi staf. Upgrade ke Basic untuk mengundang staf.'
              : 'Undang staf untuk membantu mengelola toko kamu.'}
            action={limit === 0
              ? <Button icon={UserPlus} to="/settings/plans">Upgrade Paket</Button>
              : <Button icon={UserPlus} onClick={() => setOpen(true)}>Undang Staf</Button>}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral">{staff.length} / {limit || '∞'} kursi staf</h3>
              {full
                ? <Button variant="secondary" icon={UserPlus} to="/settings/plans">Upgrade untuk menambah</Button>
                : <Button icon={UserPlus} onClick={() => setOpen(true)}>Undang Staf</Button>}
            </div>
            <ul className="divide-y divide-divider">
              {staff.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary-surface text-primary flex items-center justify-center text-xs font-bold uppercase">{s.email[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral truncate">{s.email}</p>
                    <p className="text-xs text-subdued">{ROLES.find((r) => r.value === s.role)?.label?.split(' — ')[0] || s.role}</p>
                  </div>
                  <Badge tone={s.status === 'Menunggu' ? 'warning' : 'success'}>{s.status}</Badge>
                  <IconButton icon={Trash2} label={`Cabut undangan ${s.email}`} onClick={() => save(staff.filter((x) => x.id !== s.id))} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Modal open={open} title="Undang Staf" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <TextInput label="Email staf" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staf@toko.com" />
          <Select label="Peran" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={ROLES} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={invite} disabled={!form.email.includes('@') || status.type === 'saving'}>Kirim Undangan</Button>
          </div>
        </div>
      </Modal>
    </SettingsPageLayout>
  );
}
