import { useState } from 'react';
import {
  PageHeader, Button, Toggle, Checkbox, TextInput, SettingsSection, SettingsCard, LinkRow, Modal,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';
import { SaveActions, LoadErrorNote, NoStoreNote } from './CustomerParts';

const PREFS_KEY = 'customer_preferences';
const PREFS_DEFAULT = {
  guestCheckout: true,
  signupMethods: { email: true, phone: true },
  requireBirthdate: false,
  resellerRecruitment: false,
  chat: { enabled: false, whatsapp: '', greeting: 'Halo, ada yang bisa kami bantu?' },
};

export default function CustomerPreferencesPage() {
  const setting = useStoreSetting(PREFS_KEY, PREFS_DEFAULT);
  const v = setting.value;
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState(PREFS_DEFAULT.chat);

  const set = (patch) => setting.setValue((s) => ({ ...s, ...patch }));
  const setMethod = (k, val) => setting.setValue((s) => ({ ...s, signupMethods: { ...s.signupMethods, [k]: val } }));
  const noMethod = !v.signupMethods.email && !v.signupMethods.phone;

  const openChat = () => { setChatDraft(v.chat); setChatOpen(true); };
  const applyChat = () => { set({ chat: chatDraft }); setChatOpen(false); };
  const waInvalid = chatDraft.enabled && !/^(\+?62|0)8\d{7,12}$/.test(chatDraft.whatsapp.replace(/[\s-]/g, ''));

  return (
    <div>
      <PageHeader
        title="Pengaturan Customer"
        actions={setting.hasStore && <SaveActions setting={setting} disabled={noMethod} />}
      />
      <LoadErrorNote setting={setting} />

      {!setting.hasStore ? <NoStoreNote /> : setting.loading ? (
        <div className="h-40 rounded-xl bg-white animate-pulse" aria-label="Memuat pengaturan" />
      ) : (
        <div className="divide-y divide-divider">
          <SettingsSection title="Masuk & Daftar" description="Atur cara customer masuk, mendaftar, dan checkout di toko Anda.">
            <SettingsCard>
              <Toggle
                id="guest-checkout"
                label="Checkout Tamu"
                description="Customer dapat checkout tanpa membuat akun terlebih dahulu."
                checked={v.guestCheckout}
                onChange={(val) => set({ guestCheckout: val })}
              />
            </SettingsCard>
            <SettingsCard>
              <fieldset>
                <legend className="text-sm font-semibold text-neutral">Metode Daftar Pembeli</legend>
                <p className="text-xs text-subdued mt-1 leading-5">Pilih data yang dipakai customer untuk mendaftar dan masuk.</p>
                <div className="flex flex-col gap-2.5 mt-3">
                  <Checkbox label="Email" checked={v.signupMethods.email} onChange={(val) => setMethod('email', val)} />
                  <Checkbox label="Nomor telepon" checked={v.signupMethods.phone} onChange={(val) => setMethod('phone', val)} />
                </div>
                {noMethod && <p className="text-xs text-danger mt-2" role="alert">Pilih minimal satu metode daftar.</p>}
              </fieldset>
            </SettingsCard>
            <SettingsCard>
              <Toggle
                id="require-birthdate"
                label="Wajibkan Tanggal Lahir Pembeli"
                description="Customer wajib mengisi tanggal lahir saat mendaftar. Dibutuhkan untuk voucher ulang tahun."
                checked={v.requireBirthdate}
                onChange={(val) => set({ requireBirthdate: val })}
              />
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Rekrut Reseller" description="Kembangkan jaringan penjualan dengan merekrut customer menjadi reseller.">
            <SettingsCard>
              <Toggle
                id="reseller"
                label="Izinkan customer mengajukan diri menjadi reseller"
                description="Customer dapat mengirim pengajuan dari halaman akun. Pengajuan yang disetujui masuk ke grup customer pilihan Anda."
                checked={v.resellerRecruitment}
                onChange={(val) => set({ resellerRecruitment: val })}
              />
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Chat" description="Hubungkan tombol chat agar customer mudah bertanya sebelum membeli.">
            <LinkRow
              label="Pengaturan Chat"
              description={v.chat.enabled && v.chat.whatsapp ? `WhatsApp ${v.chat.whatsapp}` : 'Tombol chat belum aktif'}
              onClick={openChat}
            />
          </SettingsSection>
        </div>
      )}

      <Modal
        open={chatOpen}
        title="Pengaturan Chat"
        onClose={() => setChatOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setChatOpen(false)}>Batal</Button>
            <Button onClick={applyChat} disabled={waInvalid}>Terapkan</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <Toggle
            id="chat-enabled"
            label="Tampilkan tombol chat di toko"
            description="Tombol mengambang di toko yang membuka percakapan WhatsApp."
            checked={chatDraft.enabled}
            onChange={(val) => setChatDraft((d) => ({ ...d, enabled: val }))}
          />
          <TextInput
            id="chat-wa"
            label="Nomor WhatsApp"
            type="tel"
            inputMode="tel"
            placeholder="08xxxxxxxxxx"
            value={chatDraft.whatsapp}
            onChange={(e) => setChatDraft((d) => ({ ...d, whatsapp: e.target.value }))}
            hint={waInvalid ? undefined : 'Gunakan format 08xx atau +628xx.'}
            aria-invalid={waInvalid || undefined}
          />
          {waInvalid && <p className="text-xs text-danger -mt-2" role="alert">Masukkan nomor WhatsApp yang valid.</p>}
          <TextInput
            id="chat-greeting"
            label="Pesan pembuka"
            value={chatDraft.greeting}
            maxLength={120}
            onChange={(e) => setChatDraft((d) => ({ ...d, greeting: e.target.value }))}
          />
          <p className="text-xs text-subdued">Perubahan tersimpan setelah Anda klik &ldquo;Simpan&rdquo; di halaman.</p>
        </div>
      </Modal>
    </div>
  );
}
