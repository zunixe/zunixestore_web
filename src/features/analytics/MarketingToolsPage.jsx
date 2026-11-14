import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, Badge, TextInput, Select, Modal, IconButton,
} from '../../components/ui';
import api from '../../utils/api';

/*
 * ID pemantauan disimpan di store_settings (PUT /stores/:id/settings) dengan kunci:
 * facebook_pixel_id, google_analytics_id, tiktok_pixel_id, google_ads_id, google_ads_events (JSON).
 */
const MAX = 120;
const FIELDS = [
  { key: 'facebook_pixel_id', title: 'Facebook Pixel', label: 'Pixel ID', placeholder: 'mis. 123456789012345', description: 'Pantau konversi dari iklan Facebook dan Instagram.' },
  { key: 'google_analytics_id', title: 'Google Analytics', label: 'ID Pelacakan', placeholder: 'mis. G-XXXXXXXXXX', description: 'Lihat perilaku pengunjung website toko di Google Analytics.' },
  { key: 'tiktok_pixel_id', title: 'TikTok Pixel', label: 'Pixel ID', placeholder: 'mis. CXXXXXXXXXXXXXXXXXXX', description: 'Pantau konversi dari iklan TikTok.' },
];
const EVENTS = [
  { value: 'purchase', label: 'Pembelian' },
  { value: 'begin_checkout', label: 'Mulai checkout' },
  { value: 'add_to_cart', label: 'Tambah ke keranjang' },
  { value: 'view_item', label: 'Lihat produk' },
];
const EMPTY = { facebook_pixel_id: '', google_analytics_id: '', tiktok_pixel_id: '', google_ads_id: '' };

function parseEvents(raw) {
  try { const v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}

export default function MarketingToolsPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [loaded, setLoaded] = useState({ storeId: null, values: EMPTY, events: [], error: null });
  const [draft, setDraft] = useState(null);
  const [events, setEvents] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [eventForm, setEventForm] = useState(null);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        const s = res.data || {};
        const values = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, s[k] || '']));
        setLoaded({ storeId, values, events: parseEvents(s.google_ads_events), error: null });
        setDraft(null);
        setEvents(null);
      })
      .catch((err) => { if (!cancelled) setLoaded({ storeId, values: EMPTY, events: [], error: err.message }); });
    return () => { cancelled = true; };
  }, [storeId]);

  const isLoading = !!storeId && loaded.storeId !== storeId;
  const values = draft || loaded.values;
  const eventList = events || loaded.events;
  const dirty = draft !== null || events !== null;
  const savedAdsId = loaded.values.google_ads_id;

  const setField = (k, v) => { setDraft({ ...values, [k]: v.slice(0, MAX) }); setNotice(null); };

  const save = async () => {
    if (!storeId) return;
    setSaving(true);
    setNotice(null);
    try {
      const body = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
      await api.put(`/stores/${storeId}/settings`, { ...body, google_ads_events: JSON.stringify(eventList) });
      setLoaded({ storeId, values: body, events: eventList, error: null });
      setDraft(null);
      setEvents(null);
      setNotice({ tone: 'success', text: 'Pengaturan pemantauan disimpan.' });
    } catch (err) {
      setNotice({ tone: 'danger', text: `Gagal menyimpan: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const addEvent = (e) => {
    e?.preventDefault();
    if (!eventForm?.label.trim()) return;
    setEvents([...eventList, { id: `${Date.now()}`, event: eventForm.event, label: eventForm.label.trim() }]);
    setEventForm(null);
    setNotice(null);
  };

  return (
    <div>
      <PageHeader
        title="Alat Pemantauan"
        subtitle="Hubungkan alat pemantauan untuk mengukur performa iklan dan pengunjung toko."
        actions={<Button onClick={save} disabled={!dirty || saving || !storeId}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>}
      />

      {notice && (
        <div role={notice.tone === 'success' ? 'status' : 'alert'} className={`rounded-xl px-4 py-3 text-sm mb-4 ${notice.tone === 'success' ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger'}`}>
          {notice.text}
        </div>
      )}
      {loaded.error && !notice && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm mb-4 bg-danger-surface text-danger">Gagal memuat pengaturan: {loaded.error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-busy={isLoading}>
        {FIELDS.map((f) => (
          <Card key={f.key}>
            <CardHeader
              title={f.title}
              subtitle={f.description}
              action={<Badge tone={loaded.values[f.key] ? 'success' : 'muted'}>{loaded.values[f.key] ? 'Aktif' : 'Belum diatur'}</Badge>}
            />
            <TextInput
              id={`mt-${f.key}`}
              label={f.label}
              value={values[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setField(f.key, e.target.value)}
              maxLength={MAX}
              disabled={isLoading}
              suffix={`${values[f.key].length}/${MAX}`}
            />
          </Card>
        ))}

        <Card>
          <CardHeader
            title="Google Ads"
            subtitle="Ukur konversi dari kampanye Google Ads."
            action={<Badge tone={savedAdsId ? 'success' : 'muted'}>{savedAdsId ? 'Terhubung' : 'Tidak terhubung'}</Badge>}
          />
          <TextInput
            id="mt-google_ads_id"
            label="ID Google Ads"
            value={values.google_ads_id}
            placeholder="mis. AW-123456789"
            onChange={(e) => setField('google_ads_id', e.target.value)}
            maxLength={MAX}
            disabled={isLoading}
            suffix={`${values.google_ads_id.length}/${MAX}`}
          />
          {eventList.length > 0 && (
            <ul className="mt-3 divide-y divide-divider border border-divider rounded-lg">
              {eventList.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-neutral">{EVENTS.find((x) => x.value === ev.event)?.label || ev.event}</div>
                    <div className="text-xs text-subdued truncate">Label konversi: {ev.label}</div>
                  </div>
                  <IconButton icon={Trash2} label={`Hapus peristiwa ${ev.label}`} className="text-danger" onClick={() => setEvents(eventList.filter((x) => x.id !== ev.id))} />
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="tonal"
            icon={Plus}
            className="mt-3"
            disabled={!values.google_ads_id.trim()}
            onClick={() => setEventForm({ event: 'purchase', label: '' })}
          >
            Buat Pemantauan Peristiwa
          </Button>
          {!values.google_ads_id.trim() && <p className="text-xs text-subdued mt-1.5">Isi ID Google Ads terlebih dahulu.</p>}
        </Card>
      </div>

      <Modal
        open={!!eventForm}
        title="Buat Pemantauan Peristiwa"
        onClose={() => setEventForm(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setEventForm(null)}>Batal</Button>
            <Button onClick={addEvent} disabled={!eventForm?.label.trim()}>Tambah</Button>
          </>
        )}
      >
        {eventForm && (
          <form onSubmit={addEvent} className="space-y-4">
            <Select id="ev-type" label="Peristiwa" value={eventForm.event} onChange={(v) => setEventForm({ ...eventForm, event: v })} options={EVENTS} />
            <TextInput
              id="ev-label"
              label="Label konversi"
              value={eventForm.label}
              onChange={(e) => setEventForm({ ...eventForm, label: e.target.value.slice(0, MAX) })}
              placeholder="mis. AbC-D_efG-h12_34-567"
              hint="Salin dari pengaturan konversi di akun Google Ads Anda. Klik Simpan di halaman setelah menambahkan."
              autoFocus
            />
          </form>
        )}
      </Modal>
    </div>
  );
}
