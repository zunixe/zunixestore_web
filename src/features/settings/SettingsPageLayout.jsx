import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/ui';

/* Kerangka halaman detail Pengaturan: tombol kembali ke /preferences + PageHeader. */
export default function SettingsPageLayout({ title, desc, actions, children }) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <Link
          to="/preferences"
          aria-label="Kembali ke Pengaturan"
          title="Kembali ke Pengaturan"
          className="mt-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral hover:bg-white hover:text-primary shrink-0"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div className="flex-1 min-w-0">
          <PageHeader title={title} subtitle={desc} actions={actions} />
        </div>
      </div>
      {children}
    </div>
  );
}
