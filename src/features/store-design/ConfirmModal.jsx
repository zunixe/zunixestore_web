import { Modal, Button } from '../../components/ui';

/** Dialog konfirmasi sederhana untuk aksi hapus. */
export default function ConfirmModal({ open, title = 'Hapus item?', message, confirmLabel = 'Hapus', onConfirm, onClose, busy }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width="max-w-md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button>
        </>
      )}
    >
      <p className="text-sm text-neutral">{message}</p>
    </Modal>
  );
}
