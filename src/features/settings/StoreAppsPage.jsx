import { Smartphone, Share2 } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState } from '../../components/ui';

export default function StoreAppsPage() {
  return (
    <SettingsPageLayout title="Aplikasi Toko Saya" desc="Bagi aplikasi toko kamu & kirim update terbaru ke customer.">
      <Card>
        <EmptyState
          icon={Smartphone}
          title="Bagikan aplikasi toko kamu ke customer"
          description="Customer bisa mengakses toko kamu langsung dari layar beranda mereka."
          action={<Button icon={Share2}>Bagikan Aplikasi</Button>}
        />
      </Card>
    </SettingsPageLayout>
  );
}
