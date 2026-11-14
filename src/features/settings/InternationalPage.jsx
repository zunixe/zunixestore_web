import { Globe2, Power } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState } from '../../components/ui';

export default function InternationalPage() {
  return (
    <SettingsPageLayout title="Preferensi Internasional" desc="Atur pengiriman internasional ke berbagai negara pilihan.">
      <Card>
        <EmptyState
          icon={Globe2}
          title="Penjualan internasional belum aktif"
          description="Atur pengiriman ke berbagai negara untuk menjangkau lebih banyak customer."
          action={<Button icon={Power}>Aktifkan</Button>}
        />
      </Card>
    </SettingsPageLayout>
  );
}
