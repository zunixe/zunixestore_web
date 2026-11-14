import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  PageHeader, Button, Select, Toggle, TextInput, SettingsSection, SettingsCard, LinkRow, Modal,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';

const DEFAULTS = {
  auto_cancel_days: '2',
  auto_complete_days: '14',
  extra_fee_enabled: false,
  extra_fee_name: '',
  extra_fee_amount: '',
  min_qty_enabled: false,
  min_qty: '1',
  max_qty_enabled: false,
  max_qty: '10',
  per_product_limit_enabled: false,
  unpaid_limit_enabled: false,
  unpaid_limit: '3',
  dropship_enabled: false,
  buyer_cancel_enabled: false,
  checkout_question_enabled: false,
  checkout_question: '',
  invoice_show_logo: true,
  invoice_show_notes: true,
  invoice_footer: '',
  label_size: 'a6',
  label_show_sender: true,
  label_show_products: true,
};

const CANCEL_OPTIONS = [
  { value: '1', label: '1 hari' },
  { value: '2', label: '2 hari' },
  { value: '3', label: '3 hari' },
  { value: '5', label: '5 hari' },
  { value: '7', label: '7 hari' },
  { value: 'never', label: 'Jangan batalkan otomatis' },
];

const COMPLETE_OPTIONS = [
  { value: '3', label: 'Selesai setelah 3 hari' },
  { value: '7', label: 'Selesai setelah 7 hari' },
  { value: '14', label: 'Selesai setelah 14 hari' },
  { value: '30', label: 'Selesai setelah 30 hari' },
  { value: 'never', label: 'Jangan selesaikan otomatis' },
];

const LABEL_SIZES = [
  { value: 'a6', label: 'A6 (10,5 x 14,8 cm)' },
  { value: '10x15', label: 'Thermal 10 x 15 cm' },
  { value: 'a4', label: 'A4 (4 label per halaman)' },
];

const Divider = () => <div className="border-t border-divider" />;

function PreferencesForm({ initial, onSave, persisted }) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [dialogDraft, setDialogDraft] = useState({});

  const set = (patch) => { setDraft((d) => ({ ...d, ...patch })); setFeedback(null); };
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(draft);
      setSaved(draft);
      setFeedback({
        ok: true,
        text: persisted ? 'Pengaturan pesanan berhasil disimpan.' : 'Perubahan disimpan sementara (belum ada toko aktif).',
      });
    } catch (err) {
      setFeedback({ ok: false, text: err.message || 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  const openDialog = (name) => { setDialogDraft(draft); setDialog(name); };
  const applyDialog = () => { set(dialogDraft); setDialog(null); };
  const dset = (patch) => setDialogDraft((d) => ({ ...d, ...patch }));

  const numberInput = (id, key, label) => (
    <TextInput
      id={id}
      label={label}
      type="number"
      min="1"
      suffix="Jumlah"
      value={draft[key]}
      onChange={(e) => set({ [key]: e.target.value })}
    />
  );

  const dialogFooter = (
    <>
      <Button variant="secondary" onClick={() => setDialog(null)}>Batal</Button>
      <Button onClick={applyDialog}>Terapkan</Button>
    </>
  );

  return (
    <>
      <div className="divide-y divide-divider">
        <SettingsSection
          title="Status Pesanan Otomatis"
          description="Atur kapan pesanan dibatalkan atau diselesaikan secara otomatis oleh sistem."
        >
          <SettingsCard>
            <Select
              id="pref-auto-cancel"
              label="Batalkan pesanan yang belum dibayar secara otomatis setelah"
              value={draft.auto_cancel_days}
              onChange={(v) => set({ auto_cancel_days: v })}
              options={CANCEL_OPTIONS}
              hint="Pesanan berstatus Baru yang belum dibayar akan dibatalkan dan stok produk dikembalikan."
            />
            <Select
              id="pref-auto-complete"
              label="Selesaikan pesanan secara otomatis setelah"
              value={draft.auto_complete_days}
              onChange={(v) => set({ auto_complete_days: v })}
              options={COMPLETE_OPTIONS}
              hint="Dihitung sejak pesanan berstatus Terkirim. Pembeli tetap bisa menandai pesanan selesai lebih awal."
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection
          title="Biaya Tambahan Khusus"
          description="Tambahkan biaya di luar ongkos kirim, misalnya biaya packing atau asuransi."
        >
          <SettingsCard>
            <Toggle
              id="pref-extra-fee"
              label="Kenakan biaya tambahan"
              description="Biaya tambahan akan ditampilkan dan ditambahkan ke total saat pembeli checkout."
              checked={draft.extra_fee_enabled}
              onChange={(v) => set({ extra_fee_enabled: v })}
            />
            {draft.extra_fee_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput id="pref-extra-fee-name" label="Nama biaya" placeholder="Biaya packing" value={draft.extra_fee_name} onChange={(e) => set({ extra_fee_name: e.target.value })} />
                <TextInput id="pref-extra-fee-amount" label="Nominal" type="number" min="0" suffix="Rp" value={draft.extra_fee_amount} onChange={(e) => set({ extra_fee_amount: e.target.value })} />
              </div>
            )}
          </SettingsCard>
        </SettingsSection>

        <SettingsSection
          title="Kuantitas & Batasan"
          description="Batasi jumlah produk dalam satu pesanan dan jumlah pesanan belum dibayar per pelanggan."
        >
          <SettingsCard>
            <Toggle id="pref-min-qty" label="Kuantitas minimum per pesanan" checked={draft.min_qty_enabled} onChange={(v) => set({ min_qty_enabled: v })} />
            {draft.min_qty_enabled && numberInput('pref-min-qty-value', 'min_qty', 'Minimum')}
            <Divider />
            <Toggle id="pref-max-qty" label="Kuantitas maksimum per pesanan" checked={draft.max_qty_enabled} onChange={(v) => set({ max_qty_enabled: v })} />
            {draft.max_qty_enabled && numberInput('pref-max-qty-value', 'max_qty', 'Maksimum')}
            <Divider />
            <Toggle
              id="pref-per-product"
              label="Batasi kuantitas per produk"
              description="Atur batas pembelian di halaman ubah produk masing-masing."
              checked={draft.per_product_limit_enabled}
              onChange={(v) => set({ per_product_limit_enabled: v })}
            />
            <Divider />
            <Toggle
              id="pref-unpaid-limit"
              label="Batas pesanan belum dibayar per pelanggan"
              description="Pelanggan tidak bisa membuat pesanan baru jika jumlah pesanan yang belum dibayar sudah mencapai batas."
              checked={draft.unpaid_limit_enabled}
              onChange={(v) => set({ unpaid_limit_enabled: v })}
            />
            {draft.unpaid_limit_enabled && numberInput('pref-unpaid-limit-value', 'unpaid_limit', 'Batas pesanan')}
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Pesanan Dropship" description="Izinkan reseller mengirim pesanan atas nama mereka sendiri.">
          <SettingsCard>
            <Toggle
              id="pref-dropship"
              label="Tampilkan opsi dropship saat checkout"
              description="Pembeli dapat mengisi nama dan nomor telepon pengirim yang dicetak di label pengiriman."
              checked={draft.dropship_enabled}
              onChange={(v) => set({ dropship_enabled: v })}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Izinkan Pembatalan Pesanan" description="Beri pembeli keleluasaan membatalkan pesanan sebelum diproses.">
          <SettingsCard>
            <Toggle
              id="pref-buyer-cancel"
              label="Pembeli dapat membatalkan pesanan"
              description="Pembatalan hanya bisa dilakukan selama pesanan belum dikemas."
              checked={draft.buyer_cancel_enabled}
              onChange={(v) => set({ buyer_cancel_enabled: v })}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Pertanyaan Checkout" description="Minta informasi tambahan dari pembeli saat checkout.">
          <SettingsCard>
            <Toggle
              id="pref-checkout-question"
              label="Tampilkan pertanyaan saat checkout"
              description="Jawaban pembeli akan muncul di detail pesanan."
              checked={draft.checkout_question_enabled}
              onChange={(v) => set({ checkout_question_enabled: v })}
            />
            {draft.checkout_question_enabled && (
              <TextInput
                id="pref-checkout-question-text"
                label="Pertanyaan"
                placeholder="Contoh: Ada pesan untuk kartu ucapan?"
                maxLength={120}
                value={draft.checkout_question}
                onChange={(e) => set({ checkout_question: e.target.value })}
                hint={`${(draft.checkout_question || '').length}/120`}
              />
            )}
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Faktur & Label Pengiriman" description="Atur tampilan faktur dan label pengiriman yang dicetak dari halaman pesanan.">
          <LinkRow label="Pengaturan Faktur" description="Logo, catatan, dan catatan kaki faktur" onClick={() => openDialog('invoice')} />
          <LinkRow label="Pengaturan Label Pengiriman" description="Ukuran kertas dan informasi pada label" onClick={() => openDialog('label')} />
        </SettingsSection>
      </div>

      <div className="sticky bottom-4 z-20 mt-4 px-4 py-3 bg-white rounded-xl border border-divider shadow-sm flex flex-wrap items-center justify-end gap-3">
        <div className="mr-auto text-sm" role="status" aria-live="polite">
          {feedback ? (
            <span className={feedback.ok ? 'text-success inline-flex items-center gap-1.5' : 'text-danger'}>
              {feedback.ok && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
              {feedback.text}
            </span>
          ) : dirty ? (
            <span className="text-subdued">Ada perubahan yang belum disimpan.</span>
          ) : null}
        </div>
        <Button variant="secondary" onClick={() => { setDraft(saved); setFeedback(null); }} disabled={!dirty || saving}>Batal</Button>
        <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>

      <Modal open={dialog === 'invoice'} title="Pengaturan Faktur" onClose={() => setDialog(null)} footer={dialogFooter}>
        <div className="space-y-4">
          <Toggle id="pref-inv-logo" label="Tampilkan logo toko" checked={dialogDraft.invoice_show_logo} onChange={(v) => dset({ invoice_show_logo: v })} />
          <Toggle id="pref-inv-notes" label="Tampilkan catatan pesanan" checked={dialogDraft.invoice_show_notes} onChange={(v) => dset({ invoice_show_notes: v })} />
          <TextInput
            id="pref-inv-footer"
            label="Catatan kaki faktur"
            placeholder="Terima kasih telah berbelanja!"
            value={dialogDraft.invoice_footer || ''}
            onChange={(e) => dset({ invoice_footer: e.target.value })}
          />
        </div>
      </Modal>

      <Modal open={dialog === 'label'} title="Pengaturan Label Pengiriman" onClose={() => setDialog(null)} footer={dialogFooter}>
        <div className="space-y-4">
          <Select id="pref-label-size" label="Ukuran label" value={dialogDraft.label_size || 'a6'} onChange={(v) => dset({ label_size: v })} options={LABEL_SIZES} />
          <Toggle id="pref-label-sender" label="Tampilkan nama pengirim" checked={dialogDraft.label_show_sender} onChange={(v) => dset({ label_show_sender: v })} />
          <Toggle id="pref-label-products" label="Tampilkan daftar produk" checked={dialogDraft.label_show_products} onChange={(v) => dset({ label_show_products: v })} />
        </div>
      </Modal>
    </>
  );
}

export default function OrderPreferencesPage() {
  const { value, loading, error, save, persisted } = useStoreSetting('order_preferences', DEFAULTS);

  return (
    <div>
      <PageHeader title="Pengaturan Pesanan" />
      {error && (
        <p className="text-sm text-danger mb-3" role="alert">
          Gagal memuat pengaturan tersimpan ({error}). Menampilkan nilai bawaan.
        </p>
      )}
      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <PreferencesForm initial={value} onSave={save} persisted={persisted} />
      )}
    </div>
  );
}
