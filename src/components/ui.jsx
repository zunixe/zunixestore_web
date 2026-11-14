/*
 * Komponen UI bersama untuk dashboard admin ZunixeStore.
 * Gaya mengikuti design-system/plugo-reference.md. Pakai komponen ini di semua halaman
 * agar tampilan konsisten; jangan menulis ulang tombol/tabel/badge di tiap halaman.
 */
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search, ArrowUpDown, Inbox, X, Info,
} from 'lucide-react';

const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- Layout halaman ---------- */

export function PageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-neutral leading-7">{title}</h1>
        {subtitle && <p className="text-sm text-subdued mt-1">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Card({ className = '', children, padded = true, ...rest }) {
  return (
    <div className={cx('bg-white rounded-xl', padded && 'p-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={cx('flex items-start justify-between gap-3 mb-3', className)}>
      <div>
        <h2 className="text-sm font-semibold text-neutral">{title}</h2>
        {subtitle && <p className="text-xs text-subdued mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Tombol ---------- */

const BTN = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white text-neutral border border-divider hover:bg-gray-50',
  tonal: 'bg-primary-surface text-primary hover:bg-[#dfe6fa]',
  ghost: 'text-primary hover:bg-primary-surface',
  danger: 'bg-danger text-white hover:bg-red-700',
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, children, className = '', to, href, ...rest }) {
  const cls = cx(
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium font-[family-name:var(--font-label)] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-3 text-sm',
    BTN[variant],
    className,
  );
  const content = (
    <>
      {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button type="button" className={cls} {...rest}>{content}</button>;
}

export function IconButton({ icon: Icon, label, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('inline-flex items-center justify-center w-9 h-9 rounded-md text-neutral hover:bg-gray-100 cursor-pointer', className)}
      {...rest}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}

/* ---------- Badge / pill ---------- */

const BADGE = {
  neutral: 'border-divider text-neutral bg-white',
  success: 'border-green-200 text-success bg-success-surface',
  danger: 'border-red-200 text-danger bg-danger-surface',
  warning: 'border-amber-200 text-warning bg-warning-surface',
  primary: 'border-blue-200 text-primary bg-primary-surface',
  muted: 'border-divider text-subdued bg-gray-50',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={cx('inline-flex items-center rounded-full border px-3 py-0.5 text-[13px] whitespace-nowrap', BADGE[tone], className)}>
      {children}
    </span>
  );
}

/* ---------- Tabs ---------- */

export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={cx('flex gap-1 border-b border-divider overflow-x-auto overflow-y-hidden', className)}>
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.value;
        const label = typeof t === 'string' ? t : t.label;
        const active = key === value;
        return (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange?.(key)}
            className={cx(
              'px-4 h-11 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer',
              active ? 'border-primary text-primary' : 'border-transparent text-neutral hover:text-primary',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="grid bg-white rounded-full p-1 gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={cx(
            'h-9 rounded-full text-sm font-medium transition-colors cursor-pointer',
            o.value === value ? 'bg-primary text-white' : 'text-neutral hover:bg-gray-50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Input ---------- */

export function SearchInput({ value, onChange, placeholder = 'Cari...', className = '', onSubmit }) {
  return (
    <form
      className={cx('relative flex-1', className)}
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
      role="search"
    >
      <Search className="w-4 h-4 text-subdued absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-9 pl-9 pr-3 rounded-md border border-divider text-sm bg-white placeholder:text-subdued focus:outline-none focus:border-primary"
      />
    </form>
  );
}

export function TextInput({ label, hint, suffix, className = '', id, ...rest }) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-neutral mb-1.5">{label}</label>}
      <div className="relative">
        <input
          id={inputId}
          className={cx('w-full h-10 px-3 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary', suffix && 'pr-16')}
          {...rest}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subdued">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-subdued mt-1.5">{hint}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, hint, className = '', id }) {
  const selectId = id || (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={className}>
      {label && <label htmlFor={selectId} className="block text-sm text-neutral mb-1.5">{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 pl-3 pr-9 rounded-md border border-divider text-sm bg-white appearance-none focus:outline-none focus:border-primary cursor-pointer"
        >
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value;
            const l = typeof o === 'string' ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <ChevronDown className="w-4 h-4 text-subdued absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
      </div>
      {hint && <p className="text-xs text-subdued mt-1.5 leading-5">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, id }) {
  const tid = id || (label ? `tg-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const sw = (
    <button
      id={tid}
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cx(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer',
        checked ? 'bg-primary' : 'bg-gray-300',
      )}
    >
      <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  );
  if (!label) return sw;
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={tid} className="text-sm font-semibold text-neutral cursor-pointer">{label}</label>
        {sw}
      </div>
      {description && <p className="text-xs text-subdued mt-1 leading-5">{description}</p>}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, ...rest }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-neutral cursor-pointer">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 accent-[#4169e1] cursor-pointer"
        {...rest}
      />
      {label}
    </label>
  );
}

/* ---------- Filter chip & dropdown menu ---------- */

export function FilterChip({ label, value, options = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cx(
          'inline-flex items-center gap-1 h-7 px-2.5 rounded-full border text-xs cursor-pointer',
          value ? 'border-primary text-primary bg-primary-surface' : 'border-divider text-neutral bg-white hover:bg-gray-50',
        )}
      >
        {selected && value ? selected.label : label}
        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {open && options.length > 0 && (
        <div className="absolute z-30 mt-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-divider py-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange?.(o.value === value ? '' : o.value); setOpen(false); }}
              className={cx('block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer', o.value === value && 'text-primary font-medium')}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddFilterChip({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 h-7 px-2.5 text-xs text-neutral hover:text-primary cursor-pointer">
      Tambah filter <Plus className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  );
}

/* ---------- Tabel ---------- */

/**
 * columns: [{ key, label, sortable, className, render: (row) => node }]
 */
export function DataTable({
  columns, rows, rowKey = 'id', selectable = false, selected = [], onSelect, loading = false,
  emptyText = 'Belum ada data', onSort, sort, minWidth,
}) {
  const allChecked = rows.length > 0 && selected.length === rows.length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr className="border-b border-divider">
            {selectable && (
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  aria-label="Pilih semua"
                  checked={allChecked}
                  onChange={(e) => onSelect?.(e.target.checked ? rows.map((r) => r[rowKey]) : [])}
                  className="w-4 h-4 accent-[#4169e1] cursor-pointer"
                />
              </th>
            )}
            {columns.map((c) => (
              <th key={c.key} className={cx('py-3 px-4 text-left font-bold text-neutral whitespace-nowrap', c.className)}>
                {c.sortable ? (
                  <button type="button" onClick={() => onSort?.(c.key)} className="inline-flex items-center gap-1 cursor-pointer hover:text-primary">
                    {c.label}
                    <ArrowUpDown className={cx('w-3.5 h-3.5', sort?.key === c.key ? 'text-primary' : 'text-gray-400')} aria-hidden="true" />
                  </button>
                ) : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <tr key={i} className="border-b border-divider">
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-4 px-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-subdued">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" aria-hidden="true" />
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r[rowKey]} className="border-b border-divider last:border-0 hover:bg-gray-50/60">
                {selectable && (
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      aria-label="Pilih baris"
                      checked={selected.includes(r[rowKey])}
                      onChange={(e) => onSelect?.(e.target.checked ? [...selected, r[rowKey]] : selected.filter((x) => x !== r[rowKey]))}
                      className="w-4 h-4 accent-[#4169e1] cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={cx('py-2.5 px-4 text-neutral align-middle', c.className)}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page = 1, limit = 10, total = 0, onPage, onLimit, label = 'Baris per halaman:' }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  const nav = (p) => onPage?.(Math.min(pages, Math.max(1, p)));
  const btn = 'w-8 h-8 inline-flex items-center justify-center rounded-md text-neutral hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-divider text-sm">
      <div className="flex items-center gap-3 text-neutral">
        <span>{label}</span>
        <select
          value={limit}
          onChange={(e) => onLimit?.(Number(e.target.value))}
          aria-label={label}
          className="h-8 px-2 rounded-md border border-divider bg-white text-sm cursor-pointer"
        >
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-subdued">{from}-{to} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Halaman pertama" className={btn} disabled={page <= 1} onClick={() => nav(1)}><ChevronsLeft className="w-4 h-4" /></button>
        <button type="button" aria-label="Halaman sebelumnya" className={btn} disabled={page <= 1} onClick={() => nav(page - 1)}><ChevronLeft className="w-4 h-4" /></button>
        <button type="button" aria-label="Halaman berikutnya" className={btn} disabled={page >= pages} onClick={() => nav(page + 1)}><ChevronRight className="w-4 h-4" /></button>
        <button type="button" aria-label="Halaman terakhir" className={btn} disabled={page >= pages} onClick={() => nav(pages)}><ChevronsRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={cx('flex flex-col items-center text-center py-14 px-6', className)}>
      <div className="w-28 h-28 rounded-full bg-primary-surface flex items-center justify-center mb-4">
        <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} aria-hidden="true" />
      </div>
      {title && <h3 className="text-base font-bold text-neutral">{title}</h3>}
      {description && <p className="text-sm text-subdued mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Pengaturan dua kolom ---------- */

export function SettingsSection({ title, description, children }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 lg:gap-8 py-5 first:pt-0">
      <div>
        <h2 className="text-sm font-bold text-neutral">{title}</h2>
        {description && <p className="text-xs text-subdued mt-1 leading-5">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function SettingsCard({ children, className = '' }) {
  return <div className={cx('bg-white rounded-xl p-4 space-y-4', className)}>{children}</div>;
}

export function LinkRow({ label, description, to, onClick }) {
  const inner = (
    <>
      <div className="min-w-0">
        <div className="text-sm font-medium text-neutral">{label}</div>
        {description && <div className="text-xs text-subdued mt-0.5">{description}</div>}
      </div>
      <ChevronRight className="w-4 h-4 text-subdued shrink-0" aria-hidden="true" />
    </>
  );
  const cls = 'flex items-center justify-between gap-3 w-full text-left px-4 py-3 rounded-lg border border-divider bg-white hover:bg-gray-50 cursor-pointer';
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

/* ---------- Statistik ---------- */

export function StatTile({ label, value, change, dot, icon: Icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs text-subdued font-[family-name:var(--font-label)]">
        {dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />}
        {Icon && (
          <span className="w-6 h-6 rounded-md bg-primary-surface flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          </span>
        )}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-xl font-bold text-neutral mt-1 tabular-nums">{value}</div>
      {change !== undefined && (
        <div className={cx('text-xs mt-0.5 tabular-nums', change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-subdued')}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '↑'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

/* ---------- Banner info ---------- */

export function InfoBanner({ title, description, action, onClose, tone = 'neutral' }) {
  return (
    <div className={cx('flex items-start gap-3 rounded-xl p-4', tone === 'primary' ? 'bg-primary-surface' : 'bg-white')}>
      <Info className="w-4 h-4 text-neutral mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <div className="text-sm font-semibold text-neutral">{title}</div>}
        {description && <div className="text-xs text-subdued mt-0.5">{description}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button type="button" aria-label="Tutup" onClick={onClose} className="text-subdued hover:text-neutral cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({ open, title, onClose, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cx('relative bg-white rounded-xl w-full shadow-xl', width)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <h2 className="text-base font-bold text-neutral">{title}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="text-subdued hover:text-neutral cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t border-divider">{footer}</div>}
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString('en-US')}`;
}
