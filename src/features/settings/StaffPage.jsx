import { Users, UserPlus } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { Card, Button, EmptyState } from '../../components/ui';

export default function StaffPage() {
  return (
    <SettingsPageLayout title="Staf" desc="Kelola sumber daya manusia toko kamu.">
      <Card>
        <EmptyState
          icon={Users}
          title="Belum ada staf"
          description="Undang staf untuk membantu mengelola toko kamu."
          action={<Button icon={UserPlus}>Undang Staf</Button>}
        />
      </Card>
    </SettingsPageLayout>
  );
}
