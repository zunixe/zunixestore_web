import { useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  PageHeader, Badge, Toggle, Checkbox, Select, SettingsSection, SettingsCard,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';
import { SaveActions, TextArea, LoadErrorNote, NoStoreNote } from './CustomerParts';

const NOTIF_KEY = 'buyer_notifications';
const NOTIF_DEFAULT = {
  orderStatus: {
    paymentInstructions: true,
    paymentConfirmed: true,
    paymentProofRejected: true,
    orderShipped: true,
    orderUpdated: false,
    orderCancelled: true,
  },
  reviewReminder: { enabled: true },
  paymentReminder: { hours: [24] },
  abandonedCheckout: {
    enabled: false,
    delay: '6',
    template: 'Hai {nama_customer}, pesanan Anda di {nama_toko} belum selesai. Total belanja {total_belanja}. Lanjutkan checkout di sini: {link_checkout}',
  },
  otp: { enabled: true, channel: 'whatsapp' },
};

const ORDER_STATUS_ITEMS = [
  { key: 'paymentInstructions', label: 'Petunjuk Pembayaran', desc: 'Dikirim setelah pesanan dibuat, berisi total dan cara bayar.', important: true },
  { key: 'paymentConfirmed', label: 'Pembayaran Dikonfirmasi', desc: 'Dikirim saat pembayaran diterima.', important: true },
  { key: 'paymentProofRejected', label: 'Bukti Bayar Ditolak', desc: 'Dikirim saat bukti transfer tidak valid.' },
  { key: 'orderShipped', label: 'Pesanan Dikirim', desc: 'Dikirim bersama nomor resi saat pesanan dikirim.', important: true },
  { key: 'orderUpdated', label: 'Pesanan Diubah', desc: 'Dikirim saat isi atau ongkir pesanan diubah.' },
  { key: 'orderCancelled', label: 'Pesanan Dibatalkan', desc: 'Dikirim saat pesanan dibatalkan.' },
];
const REMINDER_HOURS = [1, 3, 6, 12, 24, 48, 72];
const DELAY_OPTIONS = ['1', '3', '6', '12', '24'].map((h) => ({ value: h, label: `${h} jam` }));
const OTP_CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
];
const PLACEHOLDERS = ['{nama_customer}', '{nama_toko}', '{total_belanja}', '{link_checkout}'];
const TEMPLATE_MAX = 500;

function ToggleRow({ id, label, description, important, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={id} className="text-sm font-semibold text-neutral cursor-pointer">{label}</label>
          {important && <Badge tone="danger">Penting</Badge>}
        </div>
        {description && <p className="text-xs text-subdued mt-1 leading-5">{description}</p>}
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

export default function BuyerNotificationsPage() {
  const setting = useStoreSetting(NOTIF_KEY, NOTIF_DEFAULT);
  const storeName = useSelector((s) => s.stores.currentStore?.name) || 'Toko Anda';
  const v = setting.value;
  const templateRef = useRef(null);

  const setSection = (section, patch) => setting.setValue((s) => ({ ...s, [section]: { ...s[section], ...patch } }));

  const toggleHour = (h, on) => {
    const cur = new Set(v.paymentReminder.hours || []);
    if (on) cur.add(h); else cur.delete(h);
    setSection('paymentReminder', { hours: [...cur].sort((a, b) => a - b) });
  };

  const insertPlaceholder = (ph) => {
    const el = templateRef.current;
    const text = v.abandonedCheckout.template || '';
    const start = el ? el.selectionStart : text.length;
    const end = el ? el.selectionEnd : text.length;
    const next = (text.slice(0, start) + ph + text.slice(end)).slice(0, TEMPLATE_MAX);
    setSection('abandonedCheckout', { template: next });
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = Math.min(start + ph.length, next.length);
      el.setSelectionRange(pos, pos);
    });
  };

  const preview = (v.abandonedCheckout.template || '')
    .replaceAll('{nama_customer}', 'Budi')
    .replaceAll('{nama_toko}', storeName)
    .replaceAll('{total_belanja}', 'Rp 150,000')
    .replaceAll('{link_checkout}', 'https://…/checkout');

  return (
    <div>
      <PageHeader
        title="Notifikasi Customer"
        subtitle="Atur pesan otomatis yang dikirim ke customer."
        actions={setting.hasStore && <SaveActions setting={setting} />}
      />
      <LoadErrorNote setting={setting} />

      {!setting.hasStore ? <NoStoreNote /> : setting.loading ? (
        <div className="h-40 rounded-xl bg-white animate-pulse" aria-label="Memuat pengaturan" />
      ) : (
        <div className="divide-y divide-divider">
          <SettingsSection
            title="Pemberitahuan Status Pesanan"
            description="Kabari customer setiap kali status pesanan berubah. Notifikasi bertanda Penting sebaiknya tetap aktif."
          >
            <SettingsCard>
              <div className="divide-y divide-divider">
              {ORDER_STATUS_ITEMS.map((it) => (
                <ToggleRow
                  key={it.key}
                  id={`ns-${it.key}`}
                  label={it.label}
                  description={it.desc}
                  important={it.important}
                  checked={v.orderStatus[it.key]}
                  onChange={(val) => setSection('orderStatus', { [it.key]: val })}
                />
              ))}
              </div>
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Pengingat Ulasan" description="Minta customer memberi ulasan setelah pesanan selesai.">
            <SettingsCard>
              <Toggle
                id="review-reminder"
                label="Kirim pengingat ulasan"
                description="Dikirim 3 hari setelah pesanan berstatus selesai."
                checked={v.reviewReminder.enabled}
                onChange={(val) => setSection('reviewReminder', { enabled: val })}
              />
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Pengingat pembayaran" description="Ingatkan customer yang belum membayar sebelum pesanan dibatalkan otomatis.">
            <SettingsCard>
              <fieldset>
                <legend className="text-sm font-semibold text-neutral">Kirim pengingat sebelum batas waktu pembayaran</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 mt-3">
                  {REMINDER_HOURS.map((h) => (
                    <Checkbox
                      key={h}
                      label={`${h} jam`}
                      checked={(v.paymentReminder.hours || []).includes(h)}
                      onChange={(on) => toggleHour(h, on)}
                    />
                  ))}
                </div>
                <p className="text-xs text-subdued mt-3">
                  {(v.paymentReminder.hours || []).length === 0
                    ? 'Tidak ada pengingat pembayaran yang dikirim.'
                    : `${v.paymentReminder.hours.length} pengingat akan dikirim per pesanan.`}
                </p>
              </fieldset>
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Pengingat Check Out Belum Selesai" description="Ajak customer kembali menyelesaikan checkout yang tertinggal.">
            <SettingsCard>
              <Toggle
                id="abandoned-enabled"
                label="Kirim pengingat check out"
                checked={v.abandonedCheckout.enabled}
                onChange={(val) => setSection('abandonedCheckout', { enabled: val })}
              />
              <Select
                id="abandoned-delay"
                label="Kirim setelah"
                value={String(v.abandonedCheckout.delay)}
                onChange={(val) => setSection('abandonedCheckout', { delay: val })}
                options={DELAY_OPTIONS}
              />
              <div>
                <TextArea
                  id="abandoned-template"
                  label="Template pesan"
                  ref={templateRef}
                  rows={4}
                  maxLength={TEMPLATE_MAX}
                  value={v.abandonedCheckout.template}
                  onChange={(e) => setSection('abandonedCheckout', { template: e.target.value })}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex flex-wrap items-center gap-1.5" aria-label="Sisipkan variabel">
                    {PLACEHOLDERS.map((ph) => (
                      <button
                        key={ph}
                        type="button"
                        onClick={() => insertPlaceholder(ph)}
                        className="h-6 px-2 rounded-md bg-primary-surface text-primary text-xs font-mono hover:bg-[#dfe6fa] cursor-pointer"
                        aria-label={`Sisipkan ${ph}`}
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-subdued tabular-nums">
                    {(v.abandonedCheckout.template || '').length}/{TEMPLATE_MAX}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-page p-3">
                <div className="text-xs font-semibold text-neutral mb-1">Pratinjau</div>
                <p className="text-sm text-neutral leading-6 whitespace-pre-wrap break-words">{preview || '-'}</p>
              </div>
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="OTP" description="Kode verifikasi sekali pakai untuk keamanan saat customer mendaftar atau masuk.">
            <SettingsCard>
              <Toggle
                id="otp-enabled"
                label="Verifikasi OTP saat daftar & masuk"
                description="Customer memasukkan kode yang dikirim ke nomor atau email mereka."
                checked={v.otp.enabled}
                onChange={(val) => setSection('otp', { enabled: val })}
              />
              {v.otp.enabled && (
                <Select
                  id="otp-channel"
                  label="Kirim OTP melalui"
                  value={v.otp.channel}
                  onChange={(val) => setSection('otp', { channel: val })}
                  options={OTP_CHANNELS}
                />
              )}
            </SettingsCard>
          </SettingsSection>
        </div>
      )}
    </div>
  );
}
