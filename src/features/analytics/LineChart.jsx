/*
 * Grafik garis/batang ringan dengan SVG inline (tanpa library chart).
 * series: [{ label, values: number[], color, dashed }]
 */
import { useEffect, useRef, useState } from 'react';

function niceStep(raw) {
  if (raw <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const r = raw / mag;
  const nice = r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10;
  return nice * mag;
}

export default function LineChart({
  labels, series, format = (v) => String(v), height = 220, ariaLabel, variant = 'line', integer = false,
}) {
  const ref = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = labels.length;
  const ticksCount = 4;
  const maxVal = Math.max(0, ...series.flatMap((s) => s.values.map((v) => Number(v) || 0)));
  let step = niceStep(maxVal / ticksCount);
  if (integer) step = Math.max(1, Math.ceil(step));
  const yMax = step * ticksCount;
  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => i * step);

  const longest = Math.max(...ticks.map((t) => format(t).length));
  const padL = Math.min(96, Math.max(28, longest * 6.5 + 10));
  const padR = 12;
  const padT = 10;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const slot = n > 0 ? plotW / n : plotW;
  const x = (i) => (variant === 'bar' ? padL + slot * (i + 0.5) : padL + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1)));
  const y = (v) => padT + plotH - ((Number(v) || 0) / yMax) * plotH;

  const maxLabels = Math.max(2, Math.floor(plotW / 64));
  const labelEvery = Math.max(1, Math.ceil(n / maxLabels));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    if (n === 0) return;
    const idx = variant === 'bar'
      ? Math.floor((px - padL) / slot)
      : Math.round(((px - padL) / plotW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, idx)));
  };

  const tipLeft = hover !== null ? Math.min(Math.max(x(hover), padL + 70), width - 80) : 0;

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="block max-w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeDasharray={t === 0 ? undefined : '3 3'} />
            <text x={padL - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#6B7280">{format(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % labelEvery === 0 ? (
          <text key={`${l}-${i}`} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="#6B7280">{l}</text>
        ) : null))}

        {hover !== null && variant === 'line' && (
          <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + plotH} stroke="#9CA3AF" strokeWidth="1" />
        )}

        {variant === 'bar'
          ? series.map((s, si) => {
            const bw = Math.max(2, (slot * 0.7) / series.length);
            return s.values.map((v, i) => {
              const h = Math.max(0, padT + plotH - y(v));
              return (
                <rect
                  key={`${si}-${i}`}
                  x={x(i) - (bw * series.length) / 2 + si * bw}
                  y={padT + plotH - h}
                  width={bw}
                  height={h}
                  rx="2"
                  fill={s.color}
                  opacity={hover === null || hover === i ? 1 : 0.5}
                />
              );
            });
          })
          : series.map((s) => {
            const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
            return (
              <g key={s.label}>
                <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dashed ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
                {hover !== null && s.values[hover] !== undefined && (
                  <circle cx={x(hover)} cy={y(s.values[hover])} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2" />
                )}
              </g>
            );
          })}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-md border border-divider bg-white px-2.5 py-1.5 text-xs shadow-sm"
          style={{ left: tipLeft }}
        >
          <div className="font-medium text-neutral mb-0.5">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-subdued whitespace-nowrap">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label}: <span className="text-neutral tabular-nums">{format(s.values[hover] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-subdued">
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-2">
          <svg width="20" height="8" aria-hidden="true">
            <line x1="1" x2="19" y1="4" y2="4" stroke={it.color} strokeWidth="2" strokeDasharray={it.dashed ? '4 3' : undefined} />
          </svg>
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
