import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Trash2 } from 'lucide-react';
import SettingsPageLayout from './SettingsPageLayout';
import { deleteStore } from '../stores/storeSlice';
import { Card, Button, TextInput } from '../../components/ui';

const CONFIRM = 'HAPUS TOKO';

export default function DeleteStorePage() {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);

  const handleDelete = async () => {
    if (confirmText !== CONFIRM || !currentStore) return;
    setDeleting(true);
    setError('');
    try {
      await dispatch(deleteStore(currentStore.id)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Gagal menghapus toko');
    }
    setDeleting(false);
  };

  return (
    <SettingsPageLayout title="Hapus Toko" desc="Toko, produk, integrasi & langganan kamu akan terhapus.">
      <Card className="max-w-2xl border border-danger/20">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-danger-surface flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-danger" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-danger">Tindakan ini tidak dapat dibatalkan</h2>
            <p className="text-xs text-subdued mt-1 leading-5">
              Semua data toko{currentStore?.name ? <> <span className="font-semibold text-neutral">{currentStore.name}</span></> : null}, termasuk produk, pesanan, dan pengaturan, akan dihapus permanen.
            </p>
          </div>
        </div>
        <div className="border-t border-divider my-4" />
        <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }} className="space-y-4">
          <TextInput
            id="delete-confirm"
            label={`Ketik ${CONFIRM} untuk konfirmasi`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM}
            autoComplete="off"
          />
          {error && <p className="text-xs text-danger" role="alert">{error}</p>}
          <Button type="submit" variant="danger" icon={Trash2} disabled={confirmText !== CONFIRM || deleting || !currentStore} className="w-full">
            {deleting ? 'Menghapus...' : 'Hapus Toko Permanen'}
          </Button>
        </form>
      </Card>
    </SettingsPageLayout>
  );
}
