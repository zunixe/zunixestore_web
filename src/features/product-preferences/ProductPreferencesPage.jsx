import { Save } from 'lucide-react';
import {
  PageHeader, Button, SettingsSection, SettingsCard, Toggle, TextInput, Select, InfoBanner,
} from '../../components/ui';
import { SaveStatus } from './ProductParts';
import { useStoreSetting, PRODUCT_PREF_DEFAULTS } from './productData';

/* Disimpan di pengaturan toko `product_preferences` (JSON). */

const STATUS_OPTIONS = [
  { value: 'always', label: 'Selalu Ada Stok', desc: 'Produk selalu bisa dibeli tanpa menghitung stok.' },
  { value: 'stock', label: 'Gunakan Stok', desc: 'Produk bisa dibeli selama stok masih tersedia.' },
  { value: 'preorder', label: 'Pre-order (PO)', desc: 'Customer memesan dulu, produk dikirim kemudian.' },
  { value: 'waitlist', label: 'Waiting List', desc: 'Customer mendaftar untuk diberi tahu saat produk tersedia.' },
];

const OOS_OPTIONS = [
  { value: 'preorder', label: 'Pre-order (PO)' },
  { value: 'waitlist', label: 'Waiting List' },
  { value: 'sold_out', label: 'Habis Terjual' },
];

const PO_TIMES = [
  { value: '24h', label: '24 jam' },
  { value: '48h', label: '48 jam' },
  { value: '3d', label: '3 hari' },
];

const cx = (...c) => c.filter(Boolean).join(' ');

function RadioCard({ name, value, checked, onChange, label, desc, children }) {
  const id = `${name}-${value}`;
  return (
    <div className={cx('rounded-lg border p-3 transition-colors', checked ? 'border-primary bg-primary-surface/40' : 'border-divider')}>
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="mt-0.5 w-4 h-4 accent-[#4169e1] cursor-pointer"
        />
        <span>
          <span className="block text-sm font-semibold text-neutral">{label}</span>
          {desc && <span className="block text-xs text-subdued mt-0.5 leading-5">{desc}</span>}
        </span>
      </label>
      {checked && children && <div className="mt-3 ml-7">{children}</div>}
    </div>
  );
}

function PillRadios({ name, legend, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-xs text-subdued mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          const active = value === o.value;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={cx(
                'inline-flex items-center h-8 px-3 rounded-full border text-sm cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary',
                active ? 'border-primary bg-primary-surface text-primary' : 'border-divider bg-white text-neutral hover:bg-gray-50',
              )}
            >
              <input id={id} type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ProductPreferencesPage() {
  const { value: prefs, setValue, save, status, dirty, loading, loadError, hasStore } = useStoreSetting('product_preferences', PRODUCT_PREF_DEFAULTS);
  const set = (k) => (v) => setValue((p) => ({ ...p, [k]: v }));

  const threshold = String(prefs.low_stock_threshold ?? '');
  const thresholdNum = Number(threshold);
  const thresholdInvalid = prefs.low_stock_alert && (threshold.trim() === '' || !Number.isInteger(thresholdNum) || thresholdNum < 0);

  const showPoTime = prefs.default_status === 'preorder' || (prefs.default_status === 'stock' && prefs.out_of_stock === 'preorder');

  const handleSave = () => {
    if (thresholdInvalid) return;
    save({
      ...prefs,
      low_stock_threshold: Number(prefs.low_stock_threshold) || 0,
      notify_button_text: String(prefs.notify_button_text || '').trim(),
    });
  };

  const poTime = (
    <PillRadios name="po-time" legend="Produk dikirim dalam" options={PO_TIMES} value={prefs.preorder_time} onChange={set('preorder_time')} />
  );

  return (
    <div>
      <PageHeader title="Pengaturan Produk" />

      {loadError && (
        <div className="mb-4">
          <InfoBanner title="Gagal memuat pengaturan" description="Nilai bawaan ditampilkan. Menyimpan akan menimpa pengaturan sebelumnya." />
        </div>
      )}

      <div className={cx('divide-y divide-divider', loading && 'opacity-60 pointer-events-none')} aria-busy={loading}>
        <SettingsSection
          title="Pengaturan Standar"
          description="Produk baru akan menggunakan pengaturan ini. Produk yang sudah ada tetap memakai pengaturannya sendiri."
        />

        <SettingsSection title="Status Standar" description="Ketersediaan bawaan untuk produk baru.">
          <SettingsCard>
            <fieldset className="space-y-2">
              <legend className="sr-only">Status standar produk baru</legend>
              {STATUS_OPTIONS.map((o) => (
                <RadioCard
                  key={o.value}
                  name="default-status"
                  value={o.value}
                  checked={prefs.default_status === o.value}
                  onChange={set('default_status')}
                  label={o.label}
                  desc={o.desc}
                >
                  {o.value === 'stock' && (
                    <div className="space-y-3">
                      <PillRadios
                        name="oos"
                        legend="Ketika Tidak ada Stok gunakan:"
                        options={OOS_OPTIONS}
                        value={prefs.out_of_stock}
                        onChange={set('out_of_stock')}
                      />
                      {showPoTime && poTime}
                    </div>
                  )}
                  {o.value === 'preorder' && poTime}
                </RadioCard>
              ))}
            </fieldset>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Visibilitas Standar" description="Atur apakah produk baru langsung terlihat di toko.">
          <SettingsCard>
            <Toggle
              label="Tampilkan produk baru kepada customer"
              description="Jika dimatikan, produk baru disimpan sebagai draft sampai kamu menampilkannya."
              checked={prefs.show_new_products}
              onChange={set('show_new_products')}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Stok Menipis" description="Dapatkan pemberitahuan sebelum stok produk habis.">
          <SettingsCard>
            <Toggle
              label="Kirim notifikasi ketika stok produk menipis"
              checked={prefs.low_stock_alert}
              onChange={set('low_stock_alert')}
            />
            {prefs.low_stock_alert && (
              <div>
                <TextInput
                  id="low-stock-threshold"
                  label="Kirim notifikasi ketika jumlah produk"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  suffix="atau kurang"
                  value={threshold}
                  onChange={(e) => set('low_stock_threshold')(e.target.value)}
                  aria-invalid={thresholdInvalid || undefined}
                  className="max-w-xs"
                />
                {thresholdInvalid && <p className="text-xs text-danger mt-1.5" role="alert">Masukkan bilangan bulat 0 atau lebih.</p>}
              </div>
            )}
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Visibilitas Stok" description="Pilih siapa yang bisa melihat jumlah stok di halaman produk.">
          <SettingsCard>
            <Select
              id="stock-visibility"
              label="Perlihatkan stok ke"
              value={prefs.stock_visibility}
              onChange={set('stock_visibility')}
              options={[
                { value: 'none', label: 'Tidak seorangpun' },
                { value: 'all', label: 'Semua customer' },
                { value: 'reseller', label: 'Reseller saja' },
              ]}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Sembunyikan Produk yang Habis Terjual" description="Produk dengan stok 0 tidak ditampilkan di toko.">
          <SettingsCard>
            <Toggle
              label="Sembunyikan produk yang habis terjual"
              checked={prefs.hide_sold_out}
              onChange={set('hide_sold_out')}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Teks Kustom untuk Tombol 'Beritahu Saya'" description="Teks tombol yang muncul pada produk Waiting List.">
          <SettingsCard>
            <TextInput
              id="notify-button-text"
              label="Teks tombol"
              value={prefs.notify_button_text}
              maxLength={40}
              placeholder="Beritahu Saya"
              onChange={(e) => set('notify_button_text')(e.target.value)}
              hint={`${String(prefs.notify_button_text || '').length}/40`}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Foto" description="Izinkan customer mengunduh foto produk.">
          <SettingsCard>
            <Toggle
              label="Aktifkan Download"
              checked={prefs.allow_photo_download}
              onChange={set('allow_photo_download')}
            />
          </SettingsCard>
        </SettingsSection>
      </div>

      <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-xl bg-white border border-divider shadow-sm px-4 py-3">
        {dirty && status.type === 'idle' && <span className="text-xs text-subdued">Ada perubahan yang belum disimpan</span>}
        <SaveStatus status={status} />
        <Button icon={Save} onClick={handleSave} disabled={!hasStore || loading || status.type === 'saving' || thresholdInvalid}>
          {status.type === 'saving' ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </div>
  );
}
