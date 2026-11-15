import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, IconButton, Badge, EmptyState, Modal, TextInput,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';
import { usePlan } from '../subscriptions/usePlan';
import UpgradeCard from '../subscriptions/UpgradeCard';

const EMPTY = [];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const TONES = [
  { pill: 'bg-primary-surface text-primary', dot: 'bg-primary' },
  { pill: 'bg-success-surface text-success', dot: 'bg-success' },
  { pill: 'bg-warning-surface text-warning', dot: 'bg-warning' },
  { pill: 'bg-danger-surface text-danger', dot: 'bg-danger' },
];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = (s) => (s ? fromYmd(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
const newId = () => `oo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function scheduleState(s, today) {
  if (today < s.start) return { label: 'Akan datang', tone: 'primary' };
  if (today > s.end) return { label: 'Selesai', tone: 'muted' };
  return { label: 'Berlangsung', tone: 'success' };
}

function ScheduleModal({ initial, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const isEdit = !!initial.id;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Nama jadwal wajib diisi.'); return; }
    if (!form.start || !form.end) { setErr('Tanggal mulai dan selesai wajib diisi.'); return; }
    if (form.end < form.start) { setErr('Tanggal selesai tidak boleh sebelum tanggal mulai.'); return; }
    setBusy(true);
    try {
      await onSubmit({ ...form, name: form.name.trim(), id: form.id || newId() });
    } catch (ex) {
      setErr(ex.message || 'Gagal menyimpan jadwal.');
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? 'Ubah jadwal open order' : 'Buat jadwal open order'}
      onClose={onClose}
      footer={(
        <>
          {isEdit && (
            <Button variant="secondary" className="mr-auto text-danger" onClick={() => onDelete(form.id)} disabled={busy}>Hapus</Button>
          )}
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" form="open-order-form" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
      )}
    >
      <form id="open-order-form" onSubmit={submit} className="space-y-4">
        <TextInput id="oo-name" label="Nama jadwal" placeholder="Contoh: PO Batch Desember" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput id="oo-start" label="Tanggal mulai" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <TextInput id="oo-end" label="Tanggal selesai" type="date" min={form.start || undefined} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        </div>
        <TextInput
          id="oo-ship"
          label="Estimasi tanggal pengiriman"
          type="date"
          min={form.end || undefined}
          value={form.ship_date || ''}
          onChange={(e) => setForm({ ...form, ship_date: e.target.value })}
          hint="Ditampilkan ke pembeli sebagai perkiraan kapan pesanan dikirim."
        />
        <div>
          <label htmlFor="oo-note" className="block text-sm font-medium text-neutral mb-1.5">Catatan</label>
          <textarea
            id="oo-note"
            rows={3}
            value={form.note || ''}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary"
          />
        </div>
        {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      </form>
    </Modal>
  );
}

export default function OpenOrderPage() {
  const { value, loading, error, save } = useStoreSetting('open_order_schedules', EMPTY);
  const schedules = Array.isArray(value) ? value : EMPTY;
  const today = ymd(new Date());
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [editing, setEditing] = useState(null);
  const [saveError, setSaveError] = useState('');

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((lead + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, i) => new Date(year, month, i - lead + 1));

  const colorOf = (id) => TONES[Math.abs([...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)) % TONES.length];

  const openCreate = (date) => {
    const start = date || today;
    setEditing({ name: '', start, end: start, ship_date: '', note: '' });
  };

  const persist = async (next) => {
    setSaveError('');
    try {
      await save(next);
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan jadwal.');
      throw err;
    }
  };

  const submit = async (item) => {
    const exists = schedules.some((s) => s.id === item.id);
    const next = exists ? schedules.map((s) => (s.id === item.id ? item : s)) : [...schedules, item];
    await persist(next.sort((a, b) => a.start.localeCompare(b.start)));
    setEditing(null);
  };

  const remove = async (id) => {
    await persist(schedules.filter((s) => s.id !== id)).catch(() => {});
    setEditing(null);
  };

  const sorted = [...schedules].sort((a, b) => a.start.localeCompare(b.start));
  const { can, loading: planLoading } = usePlan();

  if (!planLoading && !can('open_order')) {
    return (
      <div>
        <PageHeader title="Kalender Open Order" subtitle="Atur periode pre-order agar pembeli tahu kapan pesanan dibuka dan dikirim." />
        <UpgradeCard feature="open_order" title="Kalender Open Order" description="Jadwalkan periode pre-order untuk pembeli. Fitur ini tersedia mulai paket Basic." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Kalender Open Order"
        subtitle="Atur periode pre-order agar pembeli tahu kapan pesanan dibuka dan dikirim."
        actions={<Button icon={Plus} onClick={() => openCreate()}>Buat jadwal</Button>}
      />

      {(error || saveError) && (
        <p className="text-sm text-danger mb-3" role="alert">{saveError || `Gagal memuat jadwal: ${error}`}</p>
      )}

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-base font-bold text-neutral capitalize mr-auto">{monthLabel}</h2>
          <Button variant="secondary" size="sm" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}>
            Hari ini
          </Button>
          <IconButton icon={ChevronLeft} label="Bulan sebelumnya" onClick={() => setCursor(new Date(year, month - 1, 1))} />
          <IconButton icon={ChevronRight} label="Bulan berikutnya" onClick={() => setCursor(new Date(year, month + 1, 1))} />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px] border border-divider rounded-lg overflow-hidden" aria-busy={loading}>
            <div className="grid grid-cols-7 bg-page/60 border-b border-divider">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-2 text-center text-xs font-medium text-subdued font-[family-name:var(--font-label)]">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((d) => {
                const key = ymd(d);
                const inMonth = d.getMonth() === month;
                const isToday = key === today;
                const daySchedules = sorted.filter((s) => s.start <= key && key <= s.end);
                return (
                  <div key={key} className={`min-h-[96px] border-b border-r border-divider [&:nth-child(7n)]:border-r-0 p-1.5 ${inMonth ? 'bg-white' : 'bg-gray-50/70'}`}>
                    <button
                      type="button"
                      onClick={() => openCreate(key)}
                      aria-label={`Buat jadwal mulai ${fmt(key)}`}
                      className={`w-7 h-7 rounded-full text-xs inline-flex items-center justify-center cursor-pointer hover:bg-primary-surface ${
                        isToday ? 'bg-primary text-white hover:bg-primary-hover' : inMonth ? 'text-neutral' : 'text-gray-400'
                      }`}
                    >
                      {d.getDate()}
                    </button>
                    <div className="mt-1 space-y-1">
                      {daySchedules.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setEditing(s)}
                          title={`${s.name} (${fmt(s.start)} - ${fmt(s.end)})`}
                          className={`block w-full truncate text-left text-[11px] leading-4 px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 ${colorOf(s.id).pill}`}
                        >
                          {s.name}
                        </button>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-[11px] text-subdued px-1.5">+{daySchedules.length - 3} lainnya</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Daftar jadwal" subtitle={schedules.length ? `${schedules.length} jadwal` : undefined} />
        {loading ? (
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Belum ada jadwal open order"
            description="Buat jadwal untuk membuka pre-order pada periode tertentu dan tampilkan estimasi pengiriman ke pembeli."
            action={<Button icon={Plus} onClick={() => openCreate()}>Buat jadwal</Button>}
          />
        ) : (
          <ul className="divide-y divide-divider">
            {sorted.map((s) => {
              const st = scheduleState(s, today);
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorOf(s.id).dot}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-neutral">{s.name}</div>
                    <div className="text-xs text-subdued">
                      {fmt(s.start)} - {fmt(s.end)}
                      {s.ship_date && ` · Estimasi kirim ${fmt(s.ship_date)}`}
                    </div>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>Ubah</Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {editing && (
        <ScheduleModal
          key={editing.id || 'new'}
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={submit}
          onDelete={remove}
        />
      )}
    </div>
  );
}
