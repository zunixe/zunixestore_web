import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FileText } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { Card, CardHeader, Button, Badge } from '../../components/ui';
import { SaveStatus } from '../product-preferences/ProductParts';

const POLICIES = [
  { key: 'privacy_policy', title: 'Kebijakan Privasi', desc: 'Bagaimana data customer dikumpulkan, digunakan, dan dilindungi.' },
  { key: 'terms_conditions', title: 'Syarat & Ketentuan', desc: 'Aturan dan ketentuan yang mengatur penggunaan toko kamu.' },
  { key: 'return_policy', title: 'Kebijakan Pengembalian', desc: 'Ketentuan pengembalian barang dan refund.' },
  { key: 'shipping_policy', title: 'Kebijakan Pengiriman', desc: 'Ketentuan pengiriman dan estimasi waktu.' },
];

export default function PoliciesPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const [active, setActive] = useState(POLICIES[0].key);
  const [data, setData] = useState({ storeId: null, content: {} });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const timer = useRef(null);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        const content = {};
        POLICIES.forEach((p) => { content[p.key] = res.data?.[p.key] || ''; });
        setData({ storeId, content });
      })
      .catch(() => { if (!cancelled) setData({ storeId, content: {} }); });
    return () => { cancelled = true; };
  }, [storeId]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const loading = !!storeId && data.storeId !== storeId;
  const { content } = data;
  const current = POLICIES.find((p) => p.key === active);

  const handleSave = async () => {
    if (!storeId) return;
    setStatus({ type: 'saving', message: '' });
    try {
      const body = {};
      POLICIES.forEach((p) => { body[p.key] = content[p.key] || ''; });
      await api.put(`/stores/${storeId}/settings`, body);
      setStatus({ type: 'saved', message: 'Tersimpan' });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus({ type: 'idle', message: '' }), 2500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  return (
    <SettingsPageLayout title="Kebijakan Toko" desc="Atur kebijakan toko kamu.">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
        <Card padded={false} className="p-2 self-start">
          <nav aria-label="Daftar kebijakan" className="space-y-1">
            {POLICIES.map((p) => {
              const on = active === p.key;
              const filled = !!(content[p.key] || '').trim();
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActive(p.key)}
                  aria-current={on ? 'true' : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${on ? 'bg-primary-surface' : 'hover:bg-gray-50'}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${on ? 'text-primary' : 'text-neutral'}`}>{p.title}</span>
                    {!loading && <Badge tone={filled ? 'success' : 'muted'}>{filled ? 'Terisi' : 'Kosong'}</Badge>}
                  </span>
                  <span className="block text-xs text-subdued mt-0.5 leading-5">{p.desc}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        <Card>
          <CardHeader
            title={current.title}
            subtitle={current.desc}
            action={<FileText className="w-4 h-4 text-subdued" aria-hidden="true" />}
          />
          <label htmlFor="policy-content" className="sr-only">Isi {current.title}</label>
          <textarea
            id="policy-content"
            value={content[active] || ''}
            disabled={loading}
            onChange={(e) => setData((d) => ({ ...d, content: { ...d.content, [active]: e.target.value } }))}
            rows={14}
            placeholder={loading ? 'Memuat...' : 'Tulis kebijakan di sini...'}
            className="w-full px-3 py-2 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary resize-y disabled:bg-gray-50"
          />
          <div className="flex items-center justify-end gap-3 mt-3">
            <SaveStatus status={status} />
            <Button onClick={handleSave} disabled={loading || status.type === 'saving'}>
              {status.type === 'saving' ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </Card>
      </div>
    </SettingsPageLayout>
  );
}
