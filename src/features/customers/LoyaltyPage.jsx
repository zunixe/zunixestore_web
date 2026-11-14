import { useMemo, useState } from 'react';
import { BarChart3, Pencil, Plus, Trash2, Crown, Gift } from 'lucide-react';
import {
  PageHeader, Card, Button, IconButton, Badge, Toggle, TextInput, Select, SettingsSection, SettingsCard, Modal, formatRp,
} from '../../components/ui';
import { useStoreSetting } from './useStoreSetting';
import { SaveActions, TextArea, LoadErrorNote, NoStoreNote } from './CustomerParts';
import { newId } from './buyerGroups';

const LOYALTY_KEY = 'loyalty_program';
const LOYALTY_DEFAULT = {
  enabled: false,
  earnSpend: 10000,
  earnPoints: 1,
  redeemValue: 100,
  minRedeemPoints: 100,
  expiryMonths: '12',
  tiers: [
    { id: 'bronze', name: 'Bronze', minSpend: 0, multiplier: 1, benefit: 'Kumpulkan Koin dari setiap belanja.' },
    { id: 'silver', name: 'Silver', minSpend: 1000000, multiplier: 1.25, benefit: 'Koin 1,25x dari setiap belanja.' },
    { id: 'gold', name: 'Gold', minSpend: 5000000, multiplier: 1.5, benefit: 'Koin 1,5x dan prioritas layanan.' },
  ],
  birthdayVoucher: { enabled: false, amount: 25000, validDays: 30 },
};

const EXPIRY_OPTIONS = [
  { value: '0', label: 'Tidak kedaluwarsa' },
  { value: '3', label: '3 bulan' },
  { value: '6', label: '6 bulan' },
  { value: '12', label: '12 bulan' },
  { value: '24', label: '24 bulan' },
];

const TIER_COLORS = ['bg-amber-100 text-amber-700', 'bg-gray-100 text-gray-600', 'bg-yellow-100 text-yellow-700', 'bg-primary-surface text-primary'];
const EMPTY_TIER = { name: '', minSpend: '', multiplier: '1', benefit: '' };
const num = (v) => (v === '' || v === null || v === undefined ? '' : Number(v));

export default function LoyaltyPage() {
  const setting = useStoreSetting(LOYALTY_KEY, LOYALTY_DEFAULT);
  const v = setting.value;
  const [tierModal, setTierModal] = useState(null); // null | 'new' | tier id
  const [tierForm, setTierForm] = useState(EMPTY_TIER);
  const [tierError, setTierError] = useState('');
  const [error, setError] = useState('');

  const set = (patch) => setting.setValue((s) => ({ ...s, ...patch }));
  const setBirthday = (patch) => setting.setValue((s) => ({ ...s, birthdayVoucher: { ...s.birthdayVoucher, ...patch } }));

  const tiers = useMemo(() => [...(v.tiers || [])].sort((a, b) => a.minSpend - b.minSpend), [v.tiers]);

  const example = useMemo(() => {
    const spend = 100000;
    const pts = v.earnSpend > 0 ? Math.floor(spend / v.earnSpend) * (Number(v.earnPoints) || 0) : 0;
    return { spend, pts, worth: pts * (Number(v.redeemValue) || 0) };
  }, [v.earnSpend, v.earnPoints, v.redeemValue]);

  const handleSave = () => {
    if (!(v.earnSpend > 0) || !(v.earnPoints > 0)) { setError('Isi nominal belanja dan jumlah Koin lebih dari 0.'); return; }
    if (!(v.redeemValue > 0)) { setError('Nilai tukar Koin harus lebih dari 0.'); return; }
    if (v.birthdayVoucher.enabled && !(v.birthdayVoucher.amount > 0)) { setError('Isi nilai voucher ulang tahun.'); return; }
    setError('');
    setting.save();
  };

  const openTier = (t) => {
    setTierError('');
    if (t) {
      setTierForm({ name: t.name, minSpend: String(t.minSpend), multiplier: String(t.multiplier), benefit: t.benefit || '' });
      setTierModal(t.id);
    } else {
      setTierForm(EMPTY_TIER);
      setTierModal('new');
    }
  };

  const submitTier = (e) => {
    e?.preventDefault();
    const name = tierForm.name.trim();
    const minSpend = Number(tierForm.minSpend);
    const multiplier = Number(tierForm.multiplier);
    if (!name) { setTierError('Nama tier wajib diisi.'); return; }
    if (tierForm.minSpend === '' || minSpend < 0) { setTierError('Minimal belanja harus 0 atau lebih.'); return; }
    if (!(multiplier >= 1)) { setTierError('Pengali Koin minimal 1.'); return; }
    if (tiers.some((t) => t.id !== tierModal && t.name.toLowerCase() === name.toLowerCase())) { setTierError('Nama tier sudah dipakai.'); return; }
    const data = { name, minSpend, multiplier, benefit: tierForm.benefit.trim() };
    set({
      tiers: tierModal === 'new'
        ? [...(v.tiers || []), { id: newId(), ...data }]
        : v.tiers.map((t) => (t.id === tierModal ? { ...t, ...data } : t)),
    });
    setTierModal(null);
  };

  const removeTier = (id) => set({ tiers: v.tiers.filter((t) => t.id !== id) });

  return (
    <div>
      <PageHeader
        title="Loyalty"
        subtitle="Beri Koin dan tier membership untuk mendorong customer belanja lagi."
        actions={(
          <>
            <Button variant="secondary" icon={BarChart3} to="/loyalty/analytics">Laporan</Button>
            {setting.hasStore && <SaveActions setting={setting} onSave={handleSave} />}
          </>
        )}
      />
      <LoadErrorNote setting={setting} />
      {error && <p className="text-sm text-danger mb-3" role="alert">{error}</p>}

      {!setting.hasStore ? <NoStoreNote /> : setting.loading ? (
        <div className="h-40 rounded-xl bg-white animate-pulse" aria-label="Memuat pengaturan" />
      ) : (
        <div className="divide-y divide-divider">
          <SettingsSection title="Status Program" description="Saat nonaktif, customer tidak mendapat atau menukar Koin.">
            <SettingsCard>
              <Toggle
                id="loyalty-enabled"
                label="Aktifkan program loyalty"
                description={v.enabled ? 'Program aktif. Customer mengumpulkan Koin dari setiap pesanan selesai.' : 'Program belum aktif.'}
                checked={v.enabled}
                onChange={(val) => set({ enabled: val })}
              />
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Pengaturan Koin" description="Atur berapa Koin yang didapat dari belanja, nilai tukarnya, dan masa berlakunya.">
            <SettingsCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  id="earn-spend"
                  label="Setiap belanja"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={v.earnSpend}
                  onChange={(e) => set({ earnSpend: num(e.target.value) })}
                  suffix="Rp"
                />
                <TextInput
                  id="earn-points"
                  label="Customer mendapat"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={v.earnPoints}
                  onChange={(e) => set({ earnPoints: num(e.target.value) })}
                  suffix="Koin"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  id="redeem-value"
                  label="Nilai tukar 1 Koin"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={v.redeemValue}
                  onChange={(e) => set({ redeemValue: num(e.target.value) })}
                  suffix="Rp"
                />
                <TextInput
                  id="min-redeem"
                  label="Minimal Koin untuk ditukar"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={v.minRedeemPoints}
                  onChange={(e) => set({ minRedeemPoints: num(e.target.value) })}
                  suffix="Koin"
                />
              </div>
              <Select
                id="expiry"
                label="Masa berlaku Koin"
                value={String(v.expiryMonths)}
                onChange={(val) => set({ expiryMonths: val })}
                options={EXPIRY_OPTIONS}
                hint="Dihitung sejak Koin diterima customer."
              />
              <p className="rounded-lg bg-page px-3 py-2 text-xs text-subdued leading-5">
                Contoh: belanja {formatRp(example.spend)} menghasilkan{' '}
                <span className="font-semibold text-neutral">{example.pts} Koin</span>, senilai{' '}
                <span className="font-semibold text-neutral">{formatRp(example.worth)}</span> saat ditukar (tier dasar).
              </p>
            </SettingsCard>
          </SettingsSection>

          <SettingsSection title="Tier Membership" description="Customer naik tier otomatis berdasarkan total belanja. Tier lebih tinggi mendapat Koin lebih banyak.">
            <Card padded={false}>
              {tiers.length === 0 && <p className="p-4 text-sm text-subdued">Belum ada tier.</p>}
              <ul className="divide-y divide-divider">
                {tiers.map((t, i) => (
                  <li key={t.id} className="flex items-start gap-3 p-4">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TIER_COLORS[i % TIER_COLORS.length]}`}>
                      <Crown className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-neutral">{t.name}</span>
                        <Badge tone="muted">{t.multiplier}x Koin</Badge>
                      </div>
                      <div className="text-xs text-subdued mt-0.5">
                        {t.minSpend > 0 ? `Total belanja minimal ${formatRp(t.minSpend)}` : 'Semua customer'}
                      </div>
                      {t.benefit && <div className="text-xs text-neutral mt-1">{t.benefit}</div>}
                    </div>
                    <div className="flex gap-1">
                      <IconButton icon={Pencil} label={`Ubah tier ${t.name}`} onClick={() => openTier(t)} />
                      <IconButton
                        icon={Trash2}
                        label={`Hapus tier ${t.name}`}
                        className="text-danger hover:bg-danger-surface disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={tiers.length <= 1}
                        onClick={() => removeTier(t.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-3 border-t border-divider">
                <Button variant="ghost" size="sm" icon={Plus} onClick={() => openTier(null)}>Tambah tier</Button>
              </div>
            </Card>
          </SettingsSection>

          <SettingsSection title="Voucher Ulang Tahun" description="Kirim voucher otomatis ke member di hari ulang tahunnya. Memerlukan tanggal lahir customer.">
            <SettingsCard>
              <Toggle
                id="bday-enabled"
                label="Kirim voucher ulang tahun"
                checked={v.birthdayVoucher.enabled}
                onChange={(val) => setBirthday({ enabled: val })}
              />
              {v.birthdayVoucher.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput
                    id="bday-amount"
                    label="Nilai voucher"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={v.birthdayVoucher.amount}
                    onChange={(e) => setBirthday({ amount: num(e.target.value) })}
                    suffix="Rp"
                  />
                  <TextInput
                    id="bday-valid"
                    label="Berlaku selama"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={v.birthdayVoucher.validDays}
                    onChange={(e) => setBirthday({ validDays: num(e.target.value) })}
                    suffix="hari"
                  />
                </div>
              )}
              <p className="flex items-start gap-2 text-xs text-subdued leading-5">
                <Gift className="w-4 h-4 shrink-0" aria-hidden="true" />
                Aktifkan &ldquo;Wajibkan Tanggal Lahir&rdquo; di Pengaturan Customer agar semua member mendapat voucher.
              </p>
            </SettingsCard>
          </SettingsSection>
        </div>
      )}

      <Modal
        open={tierModal !== null}
        title={tierModal === 'new' ? 'Tambah tier' : 'Ubah tier'}
        onClose={() => setTierModal(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setTierModal(null)}>Batal</Button>
            <Button type="submit" form="tier-form">Terapkan</Button>
          </>
        )}
      >
        <form id="tier-form" onSubmit={submitTier} className="space-y-4" noValidate>
          <TextInput
            id="tier-name"
            label="Nama tier"
            value={tierForm.name}
            onChange={(e) => setTierForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Platinum"
            maxLength={30}
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              id="tier-min"
              label="Minimal total belanja"
              type="number"
              min="0"
              inputMode="numeric"
              value={tierForm.minSpend}
              onChange={(e) => setTierForm((f) => ({ ...f, minSpend: e.target.value }))}
              suffix="Rp"
            />
            <TextInput
              id="tier-mult"
              label="Pengali Koin"
              type="number"
              min="1"
              step="0.05"
              value={tierForm.multiplier}
              onChange={(e) => setTierForm((f) => ({ ...f, multiplier: e.target.value }))}
              suffix="x"
            />
          </div>
          <TextArea
            id="tier-benefit"
            label="Benefit"
            value={tierForm.benefit}
            onChange={(e) => setTierForm((f) => ({ ...f, benefit: e.target.value }))}
            placeholder="Contoh: Gratis ongkir untuk semua pesanan"
            rows={2}
            maxLength={160}
          />
          {tierError && <p className="text-sm text-danger" role="alert">{tierError}</p>}
          <p className="text-xs text-subdued">Perubahan tier tersimpan setelah Anda klik &ldquo;Simpan&rdquo; di halaman.</p>
        </form>
      </Modal>
    </div>
  );
}
