import { MapPin, Plus } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState } from '../../components/ui';

export default function LocationsPage() {
  return (
    <SettingsPageLayout title="Lokasi" desc="Kelola lokasi gudang kamu untuk kemudahan distribusi produk.">
      <Card>
        <EmptyState
          icon={MapPin}
          title="Belum ada lokasi gudang"
          description="Tambahkan lokasi untuk memudahkan pengaturan ongkos kirim."
          action={<Button icon={Plus}>Tambah Lokasi</Button>}
        />
      </Card>
    </SettingsPageLayout>
  );
}
