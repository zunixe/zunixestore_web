import { useState } from 'react';
import { Smartphone, Share2, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState } from '../../components/ui';
import { storefrontUrl } from '../themes/themeUtils';

export default function StoreAppsPage() {
  const store = useSelector((s) => s.stores.currentStore);
  const [copied, setCopied] = useState(false);
  const url = `${storefrontUrl(store)}${store?.slug ? `?store=${store.slug}` : ''}`;

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: store?.name || 'Toko', url });
      else await navigator.clipboard.writeText(url);
      if (!navigator.share) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* share dibatalkan user */ }
  };

  return (
    <SettingsPageLayout title="Aplikasi Toko Saya" desc="Bagi aplikasi toko kamu & kirim update terbaru ke customer.">
      <Card>
        <EmptyState
          icon={Smartphone}
          title="Bagikan aplikasi toko kamu ke customer"
          description={`Customer bisa mengakses toko kamu langsung dari layar beranda mereka. ${url}`}
          action={<Button icon={copied ? Check : Share2} onClick={share}>{copied ? 'Tersalin!' : 'Bagikan Aplikasi'}</Button>}
        />
      </Card>
    </SettingsPageLayout>
  );
}
