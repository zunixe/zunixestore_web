import { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { IconButton } from '../../components/ui';

/** Menu ⋮ kecil. items: [{ label, onClick, danger, disabled }] */
export default function RowMenu({ items, label = 'Opsi lainnya' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <IconButton icon={MoreVertical} label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-divider py-1">
          {visible.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              onClick={() => { setOpen(false); it.onClick?.(); }}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${it.danger ? 'text-danger' : 'text-neutral'}`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
