import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SettingsPageLayout from './SettingsPageLayout';
import api from '../../utils/api';
import { SettingsSection, SettingsCard, TextInput, Button, Badge } from '../../components/ui';
import { SaveStatus } from '../product-preferences/ProductParts';
import { updateStore } from '../stores/storeSlice';

const TITLE_MAX = 70;
const DESC_MAX = 160;

export default function DomainPage() {
  const { currentStore } = useSelector((s) => s.stores);
  const storeId = currentStore?.id;
  const dispatch = useDispatch();
  const location = useLocation();
  const [form, setForm] = useState({ storeId: null, custom_domain: '', seo_title: '', seo_description: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const timer = useRef(null);

  useEffect(() => {
    if (!storeId) return undefined;
    let cancelled = false;
    api.get(`/stores/${storeId}/settings`)
      .then((res) => {
        if (cancelled) return;
        setForm({
          storeId,
          custom_domain: currentStore?.domain || '',
          seo_title: res.data?.seo_title || '',
          seo_description: res.data?.seo_description || '',
        });
      })
      .catch(() => { if (!cancelled) setForm((f) => ({ ...f, storeId, custom_domain: currentStore?.domain || '' })); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const loading = !!storeId && form.storeId !== storeId;

  // Lompat ke seksi SEO saat dibuka dari /settings/domain#seo.
  useEffect(() => {
    if (loading || !location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, location.hash]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!storeId) return;
    setStatus({ type: 'saving', message: '' });
    try {
      const domain = form.custom_domain.trim();
      if (domain && domain !== (currentStore?.domain || '')) {
        await dispatch(updateStore({ storeId, data: { domain } })).unwrap();
      }
      await api.put(`/stores/${storeId}/settings`, {
        seo_title: form.seo_title,
        seo_description: form.seo_description,
      });
      setStatus({ type: 'saved', message: 'Tersimpan' });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus({ type: 'idle', message: '' }), 2500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan' });
    }
  };

  const saving = status.type === 'saving';
  const defaultHost = currentStore?.slug ? `${currentStore.slug}.zunixe.com` : '';
  const activeHost = currentStore?.domain || defaultHost;
  const host = form.custom_domain.trim() || activeHost;

  return (
    <SettingsPageLayout title="Domain & SEO" desc="Atur URL & SEO toko kamu." actions={<SaveStatus status={status} />}>
      <div className={`divide-y divide-divider ${loading ? 'opacity-60 pointer-events-none' : ''}`} aria-busy={loading}>
        <div id="domain" className="scroll-mt-20">
          <SettingsSection title="Domain Kustom" description="Hubungkan domain kustom untuk toko kamu (contoh: tokokamu.com). Arahkan DNS domain ke server ZunixeStore dulu.">
            <SettingsCard>
              {activeHost && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-subdued">Domain aktif</span>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-neutral truncate">{activeHost}</span>
                    <Badge tone="success">Aktif</Badge>
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <TextInput
                  id="custom-domain"
                  label="Domain kustom"
                  value={form.custom_domain}
                  onChange={set('custom_domain')}
                  placeholder="namatoko.com"
                  className="flex-1"
                />
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Hubungkan'}</Button>
              </div>
            </SettingsCard>
          </SettingsSection>
        </div>

        <div id="seo" className="scroll-mt-20">
          <SettingsSection title="SEO (Search Engine Optimization)" description="Judul dan deskripsi halaman yang tampil di hasil pencarian.">
            <SettingsCard>
              <TextInput
                id="meta-title"
                label="Judul SEO (meta title)"
                value={form.seo_title}
                onChange={set('seo_title')}
                maxLength={TITLE_MAX}
                placeholder={currentStore?.name || 'Nama toko'}
                hint={`${form.seo_title.length}/${TITLE_MAX}`}
              />
              <div>
                <label htmlFor="meta-description" className="block text-sm font-medium text-neutral mb-1.5">Deskripsi SEO (meta description)</label>
                <textarea
                  id="meta-description"
                  rows={3}
                  value={form.seo_description}
                  onChange={set('seo_description')}
                  maxLength={DESC_MAX}
                  placeholder="Deskripsi singkat tentang toko kamu untuk hasil pencarian."
                  className="w-full px-3 py-2 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary resize-none"
                />
                <p className="text-xs text-subdued mt-1.5">{form.seo_description.length}/{DESC_MAX}</p>
              </div>
              <div className="rounded-lg border border-divider p-3">
                <p className="text-xs text-subdued mb-2">Pratinjau hasil pencarian</p>
                <p className="text-xs text-success truncate">{host || 'domain-toko'}</p>
                <p className="text-base text-primary leading-6 truncate">{form.seo_title || currentStore?.name || 'Judul halaman toko'}</p>
                <p className="text-xs text-subdued leading-5 line-clamp-2">{form.seo_description || 'Deskripsi toko akan tampil di sini.'}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan SEO'}</Button>
              </div>
            </SettingsCard>
          </SettingsSection>
        </div>
      </div>
    </SettingsPageLayout>
  );
}
