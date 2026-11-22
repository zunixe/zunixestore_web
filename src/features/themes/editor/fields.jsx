import { useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Upload, Trash2, Info, Bold, Italic, Underline } from 'lucide-react';
import api from '../../../utils/api';

/* Kontrol form editor tema. Gaya mengikuti panel editor Plugo:
   label 14px semibold, toggle iOS, swatch warna 36px, select/input rounded-md. */

const cx = (...c) => c.filter(Boolean).join(' ');

export function PanelHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 px-4 h-14 border-b border-divider shrink-0">
      <button type="button" onClick={onBack} className="w-6 h-6 flex items-center justify-center text-neutral hover:text-primary cursor-pointer" aria-label="Kembali">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h3 className="text-sm font-bold text-neutral">{title}</h3>
    </div>
  );
}

export function Group({ title, children, className = '' }) {
  return (
    <div className={cx('px-4 py-4 border-b border-divider', className)}>
      {title && <h4 className="text-sm font-bold text-neutral mb-3">{title}</h4>}
      {children}
    </div>
  );
}

export function Label({ children, hint, className = '' }) {
  return (
    <p className={cx('text-sm font-medium text-neutral mb-1.5 flex items-center gap-1', className)}>
      {children}
      {hint && <Info className="w-3.5 h-3.5 text-subdued" aria-hidden="true" />}
    </p>
  );
}

/* Toggle iOS seperti di panel Plugo. */
export function ToggleIOS({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative w-10 h-[22px] rounded-full transition-colors shrink-0 cursor-pointer', checked ? 'bg-primary' : 'bg-gray-300')}
    >
      <span className={cx('absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-[3px]')} />
    </button>
  );
}

export function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-bold text-neutral">{label}</span>
      <ToggleIOS checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function CheckRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 py-1.5 cursor-pointer">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#4169e1] cursor-pointer" />
      <span className="text-sm text-neutral">{label}</span>
    </label>
  );
}

/* Segmented control abu-abu (Penuh/Rapat/Konten, Kecil/Sedang/Besar, dsb). */
export function Seg({ options, value, onChange, className = '' }) {
  return (
    <div className={cx('flex bg-gray-100 rounded-lg p-1 gap-1', className)}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const t = typeof o === 'string' ? o : o.label;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cx(
              'flex-1 h-8 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap px-1',
              active ? 'bg-white shadow-sm text-neutral' : 'text-subdued hover:text-neutral',
            )}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export function Sel({ value, onChange, options, className = '' }) {
  return (
    <div className={cx('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-3 pr-9 rounded-md border border-divider text-sm bg-white appearance-none focus:outline-none focus:border-primary cursor-pointer"
      >
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const t = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{t}</option>;
        })}
      </select>
      <ChevronDown className="w-4 h-4 text-subdued absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export function Txt({ value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cx('w-full h-10 px-3 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary', className)}
    />
  );
}

/* Swatch warna 36px dengan border, klik buka color picker. */
export function Swatch({ value, onChange, label }) {
  return (
    <label className="relative block w-9 h-9 rounded-md border border-divider overflow-hidden cursor-pointer shrink-0" style={{ background: value || '#ffffff' }} title={label}>
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
      />
    </label>
  );
}

export function ColorRow({ label, value, onChange, hint }) {
  return (
    <div className="flex items-center justify-between py-2">
      <Label className="mb-0" hint={hint}>{label}</Label>
      <Swatch value={value} onChange={onChange} label={label} />
    </div>
  );
}

/* Gambar + tombol tonal "Ubah Gambar". Upload via /api/upload. */
const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export function ImageField({ value, onChange, buttonLabel = 'Ubah Gambar' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_HOST}/api/upload`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      const data = await res.json();
      if (data?.data?.url) onChange(`${API_HOST}${data.data.url}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-divider p-3 bg-white">
      <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : null}
      </div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="h-8 px-3 rounded-md bg-primary-surface text-primary text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
        <Upload className="w-3.5 h-3.5" /> {uploading ? 'Mengunggah...' : buttonLabel}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}

export function DelSection({ onClick }) {
  return (
    <div className="px-4 py-4">
      <button type="button" onClick={onClick} className="w-full h-10 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-neutral inline-flex items-center justify-center gap-2 cursor-pointer">
        <Trash2 className="w-4 h-4" /> Hapus Bagian
      </button>
    </div>
  );
}

/* Judul seksi: select ukuran + B/I/U + posisi konten. */
export function TitleStyle({ value, onChange }) {
  const v = value || {};
  const set = (k, x) => onChange({ ...v, [k]: x });
  const TBtn = ({ k, icon: I, label }) => (
    <button
      type="button"
      onClick={() => set(k, !v[k])}
      aria-label={label}
      className={cx('w-8 h-8 rounded border text-sm flex items-center justify-center cursor-pointer', v[k] ? 'border-primary text-primary bg-primary-surface' : 'border-divider text-neutral')}
    >
      <I className="w-4 h-4" />
    </button>
  );
  return (
    <div>
      <Label>Judul</Label>
      <Txt value={v.text} onChange={(x) => set('text', x)} placeholder="Judul bagian" className="mb-2" />
      <div className="flex items-center gap-2 mb-2">
        <Sel value={v.size || 'Sedang'} onChange={(x) => set('size', x)} options={['Kecil', 'Sedang', 'Besar', 'Lebih Besar']} className="flex-1" />
        <TBtn k="bold" icon={Bold} label="Tebal" />
        <TBtn k="italic" icon={Italic} label="Miring" />
        <TBtn k="underline" icon={Underline} label="Garis bawah" />
      </div>
      <Label>Posisi Konten</Label>
      <Seg options={['Kiri', 'Tengah', 'Kanan']} value={v.posisi || 'Kiri'} onChange={(x) => set('posisi', x)} />
    </div>
  );
}

/* Slider detik dengan label nilai di kanan. */
export function SliderRow({ label, value, min = 1, max = 15, step = 1, unit = 'detik', onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[#4169e1]" />
        <span className="text-sm font-bold text-neutral whitespace-nowrap">{value} {unit}</span>
      </div>
    </div>
  );
}

/* Tab Konten/Desain/Pengaturan di panel seksi. */
export function SectionTabs({ tab, onChange }) {
  const TABS = [
    { key: 'konten', label: 'Konten' },
    { key: 'desain', label: 'Desain' },
    { key: 'pengaturan', label: 'Pengaturan' },
  ];
  return (
    <div className="flex border-b border-divider shrink-0">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cx(
            'flex-1 h-11 text-sm font-medium border-b-2 -mb-px cursor-pointer',
            tab === t.key ? 'border-primary text-primary' : 'border-transparent text-subdued hover:text-neutral',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* Accordion di panel Desain Website. */
export function Accordion({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-divider">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 h-12 text-sm font-bold text-neutral cursor-pointer">
        {title}
        <ChevronDown className={cx('w-4 h-4 text-subdued transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* Kotak jarak/padding 4 sisi (atas, kiri, kanan, bawah) seperti tab Pengaturan Plugo. */
export function BoxSpacing({ value, onChange }) {
  const v = value || {};
  const set = (k, x) => onChange({ ...v, [k]: x === '' ? '' : Number(x) });
  // Fungsi biasa (bukan komponen) agar input tidak di-remount & kehilangan fokus saat mengetik.
  const cell = (k, label) => (
    <div className="flex items-center h-8 rounded-md border border-divider bg-white px-2 w-[84px]">
      <input
        type="number"
        value={v[k] ?? ''}
        onChange={(e) => set(k, e.target.value)}
        aria-label={label}
        className="w-full min-w-0 text-xs text-center bg-transparent focus:outline-none"
      />
      <span className="text-[11px] text-subdued">px</span>
    </div>
  );
  return (
    <div className="rounded-lg bg-gray-100 p-3 grid grid-cols-3 gap-2 place-items-center">
      <span />{cell('top', 'Atas')}<span />
      {cell('left', 'Kiri')}
      <div className="h-8 w-[84px] rounded-md bg-gray-200/80 flex items-center justify-center text-[11px] text-subdued">--</div>
      {cell('right', 'Kanan')}
      <span />{cell('bottom', 'Bawah')}<span />
    </div>
  );
}

/* Ketajaman Ujung Konten: tajam / sedang / bulat. */
export function RadiusPicker({ value, onChange }) {
  const OPTS = [{ v: 'tajam', r: 'rounded-none', label: 'Tajam' }, { v: 'sedang', r: 'rounded-md', label: 'Sedang' }, { v: 'bulat', r: 'rounded-2xl', label: 'Bulat' }];
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTS.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(value === o.v ? '' : o.v)}
          aria-label={o.label}
          title={o.label}
          className={cx('h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer', value === o.v ? 'border-primary bg-primary-surface/40' : 'border-divider bg-white hover:border-gray-300')}
        >
          <span className={cx('w-8 h-8 bg-gray-400/70 border-2 border-gray-500/60', o.r)} />
        </button>
      ))}
    </div>
  );
}

/* Pemilih tampilan: grid kartu thumbnail bergaya wireframe seperti Plugo. */
export function LayoutPicker({ options, value, onChange, cols = 2 }) {
  return (
    <div className={cx('grid gap-2', cols === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-lg border-2 p-2 bg-gray-50 text-left cursor-pointer transition-colors',
            value === o.value ? 'border-primary' : 'border-divider hover:border-gray-300',
          )}
        >
          <div className="h-14 rounded bg-gray-200/70 mb-1.5 relative overflow-hidden">
            {o.icon}
          </div>
          <span className="text-[11px] text-neutral">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
