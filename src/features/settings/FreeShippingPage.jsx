import { PackageCheck, Plus } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState } from '../../components/ui';

export default function FreeShippingPage() {
  return (
    <SettingsPageLayout title="Paket Gratis Ongkir" desc="Tingkatkan penjualan Anda melalui Paket Pengiriman Gratis.">
      <Card>
        <EmptyState
          icon={PackageCheck}
          title="Belum ada paket gratis ongkir"
          description="Buat promo gratis ongkir untuk menarik lebih banyak pembeli."
          action={<Button icon={Plus}>Buat Paket</Button>}
        />
      </Card>
    </SettingsPageLayout>
  );
}
