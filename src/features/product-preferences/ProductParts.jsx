/*
 * Potongan UI kecil yang dipakai bersama oleh subhalaman Produk.
 * Komponen dasar (Button, Checkbox, SearchInput, dst.) tetap dari components/ui.
 */
import { useMemo, useState } from 'react';
import {
  ImageIcon, GripVertical, ChevronUp, ChevronDown, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { IconButton, SearchInput, Checkbox, formatRp } from '../../components/ui';
import { firstImage } from './productData';

const cx = (...c) => c.filter(Boolean).join(' ');

export function ProductThumb({ product, src, size = 'md', className = '' }) {
  const img = src !== undefined ? src : firstImage(product);
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (img) return <img src={img} alt="" className={cx(dim, 'rounded-md object-cover bg-gray-100 shrink-0', className)} />;
  return (
    <span className={cx(dim, 'rounded-md bg-gray-100 flex items-center justify-center shrink-0', className)}>
      <ImageIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
    </span>
  );
}

/* Thumbnail bertumpuk, mis. kolom "Produk" pada produk bundle. */
export function ThumbStack({ products, max = 4 }) {
  const shown = products.slice(0, max);
  const rest = products.length - shown.length;
  return (
    <div className="flex items-center" aria-label={`${products.length} produk`}>
      {shown.map((p, i) => (
        <span key={p.id} className={cx('rounded-md ring-2 ring-white', i > 0 && '-ml-2')} title={p.name}>
          <ProductThumb product={p} size="sm" />
        </span>
      ))}
      {rest > 0 && (
        <span className="-ml-2 w-8 h-8 rounded-md ring-2 ring-white bg-primary-surface text-primary text-[11px] font-medium flex items-center justify-center">
          +{rest}
        </span>
      )}
    </div>
  );
}

export function SaveStatus({ status }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs min-h-5">
      {status?.type === 'saving' && (
        <><Loader2 className="w-3.5 h-3.5 animate-spin text-subdued" aria-hidden="true" /><span className="text-subdued">Menyimpan...</span></>
      )}
      {status?.type === 'saved' && (
        <><CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden="true" /><span className="text-success">{status.message || 'Perubahan tersimpan'}</span></>
      )}
      {status?.type === 'error' && (
        <><AlertCircle className="w-3.5 h-3.5 text-danger" aria-hidden="true" /><span className="text-danger">{status.message || 'Gagal menyimpan'}</span></>
      )}
    </span>
  );
}

/*
 * Daftar yang bisa diurutkan dengan drag & drop HTML5 native, plus tombol
 * naik/turun untuk keyboard & pembaca layar.
 * items: array; getKey(item); getLabel(item) untuk teks aksesibilitas;
 * renderItem(item, index) isi baris; renderActions(item, index) tombol tambahan;
 * onReorder(nextItems).
 */
export function SortableList({ items, getKey, getLabel, renderItem, renderActions, onReorder, disabled = false, label = 'Daftar' }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [announce, setAnnounce] = useState('');

  const move = (from, to) => {
    if (from === to || from == null || to == null || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
    setAnnounce(`${getLabel(moved)} dipindah ke posisi ${to + 1} dari ${items.length}`);
  };

  const reset = () => { setDragIndex(null); setOverIndex(null); };

  return (
    <>
      <ol className="space-y-2" aria-label={label}>
        {items.map((item, i) => {
          const name = getLabel(item);
          return (
            <li
              key={getKey(item)}
              draggable={!disabled}
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(i));
              }}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
                move(from, i);
                reset();
              }}
              onDragEnd={reset}
              className={cx(
                'flex items-center gap-3 px-3 py-2 rounded-lg border bg-white transition-colors',
                !disabled && 'cursor-grab active:cursor-grabbing',
                dragIndex === i ? 'opacity-50 border-divider' : overIndex === i && dragIndex !== null ? 'border-primary bg-primary-surface/40' : 'border-divider',
              )}
            >
              <GripVertical className="w-4 h-4 text-subdued shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">{renderItem(item, i)}</div>
              <div className="flex items-center gap-0.5 shrink-0">
                <IconButton
                  icon={ChevronUp}
                  label={`Pindahkan ${name} ke atas`}
                  onClick={() => move(i, i - 1)}
                  disabled={disabled || i === 0}
                  className="w-8 h-8 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-default"
                />
                <IconButton
                  icon={ChevronDown}
                  label={`Pindahkan ${name} ke bawah`}
                  onClick={() => move(i, i + 1)}
                  disabled={disabled || i === items.length - 1}
                  className="w-8 h-8 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-default"
                />
                {renderActions?.(item, i)}
              </div>
            </li>
          );
        })}
      </ol>
      <span className="sr-only" aria-live="polite">{announce}</span>
    </>
  );
}

/* Daftar centang produk dengan pencarian, untuk modal pemilihan produk. */
export function ProductPicker({ products, selected, onChange, emptyText = 'Produk tidak ditemukan', showPrice = false }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) => p.name?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t));
  }, [products, q]);

  const toggle = (id, on) => onChange(on ? [...selected, id] : selected.filter((x) => x !== id));

  return (
    <div className="space-y-3">
      <SearchInput value={q} onChange={setQ} placeholder="Cari nama atau kode produk" />
      <div className="max-h-72 overflow-y-auto rounded-lg border border-divider divide-y divide-divider">
        {list.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-subdued">{emptyText}</p>
        ) : list.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
            <Checkbox
              checked={selected.includes(p.id)}
              onChange={(on) => toggle(p.id, on)}
              aria-label={`Pilih ${p.name}`}
            />
            <ProductThumb product={p} size="sm" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-neutral truncate">{p.name}</span>
              {(p.sku || showPrice) && (
                <span className="block text-xs text-subdued truncate">
                  {[p.sku, showPrice ? formatRp(p.price) : null].filter(Boolean).join(' · ')}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
