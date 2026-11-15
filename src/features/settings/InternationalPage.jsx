import { useState } from 'react';
import { Globe2, Power, X } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState, TextInput, Badge } from '../../components/ui';
import { useStoreSetting } from '../customers/useStoreSetting';

const DEFAULTS = { enabled: false, countries: [] };

export default function InternationalPage() {
  const { value, save, status } = useStoreSetting('international_selling', DEFAULTS);
  const [country, setCountry] = useState('');

  const toggle = () => save({ ...value, enabled: !value?.enabled });
  const addCountry = async () => {
    const c = country.trim();
    if (!c || value.countries.includes(c)) return;
    await save({ ...value, countries: [...value.countries, c] });
    setCountry('');
  };

  return (
    <SettingsPageLayout title="Preferensi Internasional" desc="Atur pengiriman internasional ke berbagai negara pilihan.">
      <Card>
        {status.type === 'error' && <p className="mb-3 text-sm text-danger">{status.message}</p>}
        {!value?.enabled ? (
          <EmptyState
            icon={Globe2}
            title="Penjualan internasional belum aktif"
            description="Atur pengiriman ke berbagai negara untuk menjangkau lebih banyak customer."
            action={<Button icon={Power} onClick={toggle}>Aktifkan</Button>}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-success" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral">Penjualan internasional aktif</span>
                <Badge tone="success">Aktif</Badge>
              </div>
              <Button variant="secondary" onClick={toggle}>Nonaktifkan</Button>
            </div>
            <TextInput
              label="Negara tujuan"
              hint="Tekan Enter untuk menambahkan negara"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCountry(); } }}
              placeholder="contoh: Malaysia"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {value.countries.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-divider px-3 py-1 text-sm text-neutral">
                  {c}
                  <button type="button" aria-label={`Hapus ${c}`} onClick={() => save({ ...value, countries: value.countries.filter((x) => x !== c) })} className="text-subdued hover:text-danger cursor-pointer">
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
              {value.countries.length === 0 && <p className="text-xs text-subdued">Belum ada negara tujuan.</p>}
            </div>
          </div>
        )}
      </Card>
    </SettingsPageLayout>
  );
}
