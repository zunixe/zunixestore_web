import SettingsPageLayout from './SettingsPageLayout';

const COURIERS = [
  { name: 'JNE', desc: 'Reguler, OKE, YES, Trucking', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { name: 'J&T', desc: 'Reguler, Economy, Express', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { name: 'SiCepat', desc: 'REG, BEST, HALU', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { name: 'AnterAja', desc: 'Same Day, Reguler', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { name: 'GoSend', desc: 'Instant, Same Day', icon: 'M4 2h12a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1a2 2 0 01-4 0H8a2 2 0 01-4 0H3a2 2 0 01-2-2V4a2 2 0 012-2z' },
];

export default function ShippingPage() {
  return (
    <SettingsPageLayout title="Metode Pengiriman" desc="Tentukan metode pengiriman yang dapat dipilih customer.">
      <div className="space-y-3">
        {COURIERS.map((courier) => (
          <div key={courier.name} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d={courier.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{courier.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{courier.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        ))}
      </div>
    </SettingsPageLayout>
  );
}
