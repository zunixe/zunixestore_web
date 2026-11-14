import { useEffect, useState } from 'react';
import { MapPin, FileText, Globe2 } from 'lucide-react';
import { PageHeader, Card, CardHeader, StatTile } from '../../components/ui';
import LineChart from './LineChart';

/*
 * Backend belum menyediakan data pengunjung real-time, jadi semua angka ditampilkan 0
 * dan daftar ditampilkan kosong. Label waktu tetap bergerak per menit.
 */
const MINUTES = 30;

function minuteLabels(now) {
  return Array.from({ length: MINUTES }, (_, i) => {
    const d = new Date(now.getTime() - (MINUTES - 1 - i) * 60000);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });
}

function EmptyList({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center text-center py-10 text-sm text-subdued">
      <Icon className="w-8 h-8 text-gray-300 mb-2" aria-hidden="true" />
      {text}
    </div>
  );
}

export default function RealtimePage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const perMinute = Array(MINUTES).fill(0);
  const total = perMinute.reduce((a, b) => a + b, 0);
  const stats = [
    { label: 'Tampilan', value: total },
    { label: 'Rata-rata / menit', value: Math.round((total / MINUTES) * 10) / 10 },
    { label: 'Puncak', value: Math.max(...perMinute) },
    { label: 'Total', value: total },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Aktivitas Terkini"
        subtitle={`Diperbarui ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4">
        <Card>
          <CardHeader title="Users aktif" subtitle="Dalam 5 menit terakhir" />
          <div className="flex items-center gap-3">
            <span className="relative flex w-3 h-3" aria-hidden="true">
              <span className="absolute inline-flex w-full h-full rounded-full bg-gray-300" />
            </span>
            <span className="text-4xl font-bold text-neutral tabular-nums">0</span>
          </div>
          <p className="text-xs text-subdued mt-2">Belum ada pengunjung aktif di website toko.</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-divider p-3">
                <StatTile label={s.label} value={s.value} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Users per menit" subtitle="30 menit terakhir" />
          <LineChart
            variant="bar"
            integer
            ariaLabel="Grafik users per menit dalam 30 menit terakhir"
            labels={minuteLabels(now)}
            series={[{ label: 'Users', values: perMinute, color: '#4169E1' }]}
            height={240}
          />
        </Card>
      </div>

      <Card>
        <CardHeader title="Peta Pengunjung" subtitle="Sebaran wilayah pengunjung aktif" />
        <div className="relative h-64 rounded-lg bg-page overflow-hidden flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            <defs>
              <pattern id="rt-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#CBD5E1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rt-dots)" />
          </svg>
          <div className="relative flex flex-col items-center text-center bg-white/90 rounded-lg px-4 py-3">
            <MapPin className="w-6 h-6 text-primary mb-1" aria-hidden="true" />
            <span className="text-sm font-medium text-neutral">Belum ada lokasi pengunjung</span>
            <span className="text-xs text-subdued">Lokasi akan muncul saat ada pengunjung aktif.</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Halaman Teratas" subtitle="Halaman yang sedang dilihat" />
          <EmptyList icon={FileText} text="Belum ada data halaman" />
        </Card>
        <Card>
          <CardHeader title="Lokasi Teratas" subtitle="Kota asal pengunjung aktif" />
          <EmptyList icon={Globe2} text="Belum ada data lokasi" />
        </Card>
      </div>
    </div>
  );
}
