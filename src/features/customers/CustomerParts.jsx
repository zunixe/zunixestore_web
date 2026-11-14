/*
 * Potongan UI kecil yang dipakai bersama oleh halaman-halaman Customer.
 * Komponen dasar (Button, Card, dll.) tetap dari components/ui.jsx.
 */
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui';

export function SaveStatus({ status }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1 text-xs min-h-4">
      {status.type === 'saving' && (
        <span className="inline-flex items-center gap-1 text-subdued">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Menyimpan...
        </span>
      )}
      {status.type === 'saved' && (
        <span className="inline-flex items-center gap-1 text-success">
          <Check className="w-3.5 h-3.5" aria-hidden="true" /> {status.message}
        </span>
      )}
      {status.type === 'error' && (
        <span className="inline-flex items-center gap-1 text-danger">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> {status.message}
        </span>
      )}
    </span>
  );
}

/** Tombol "Simpan" + umpan balik status, untuk slot `actions` PageHeader. */
export function SaveActions({ setting, disabled = false, onSave }) {
  const { status, dirty, loading, save } = setting;
  return (
    <>
      <SaveStatus status={status} />
      <Button
        onClick={() => (onSave ? onSave() : save())}
        disabled={disabled || loading || status.type === 'saving' || !dirty}
      >
        {status.type === 'saving' ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </>
  );
}

export function TextArea({ label, id, hint, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral mb-1.5">{label}</label>}
      <textarea
        id={id}
        className="w-full min-h-24 px-3 py-2 rounded-md border border-divider text-sm bg-white leading-6 focus:outline-none focus:border-primary resize-y"
        {...rest}
      />
      {hint && <p className="text-xs text-subdued mt-1.5 leading-5">{hint}</p>}
    </div>
  );
}

export function LoadErrorNote({ setting }) {
  if (!setting.loadError) return null;
  return (
    <p className="text-xs text-danger mb-3" role="alert">
      Gagal memuat pengaturan dari server. Nilai bawaan ditampilkan; menyimpan akan menimpa pengaturan lama.
    </p>
  );
}

export function NoStoreNote() {
  return <p className="text-sm text-subdued">Pilih toko terlebih dahulu untuk mengatur halaman ini.</p>;
}
