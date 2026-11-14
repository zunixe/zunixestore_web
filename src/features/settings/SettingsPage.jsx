import { Link } from 'react-router-dom';
import {
  CreditCard, Truck, MapPin, PackageCheck, Globe2, Store, Rocket, Users, Link2, SearchCheck, Smartphone, FileText, Trash2,
} from 'lucide-react';

const SETTINGS = [
  {
    title: 'Pembayaran & Pengiriman',
    items: [
      { label: 'Metode pembayaran', desc: 'Metode pembayaran yang bisa dipakai customer saat checkout.', icon: CreditCard, href: '/settings/payments' },
      { label: 'Metode pengiriman', desc: 'Tentukan metode pengiriman yang dapat dipilih customer.', icon: Truck, href: '/settings/shipping' },
      { label: 'Lokasi', desc: 'Kelola lokasi gudang kamu untuk kemudahan distribusi produk.', icon: MapPin, href: '/settings/locations' },
      { label: 'Paket Gratis Ongkir', desc: 'Tingkatkan penjualan Anda melalui Paket Pengiriman Gratis.', icon: PackageCheck, href: '/settings/free-shipping' },
      { label: 'Preferensi Internasional', desc: 'Pilih negara tempat customer bisa berbelanja, lengkap dengan mata uang dan penyesuaian harga per negara.', icon: Globe2, href: '/settings/international' },
    ],
  },
  {
    title: 'Manajemen Toko / Preferensi Toko',
    items: [
      { label: 'Pengaturan Toko', desc: 'Atur ketentuan toko online kamu.', icon: Store, href: '/profile' },
      { label: 'Paket Upgrade', desc: 'Dapatkan berbagai fitur khusus untuk kebutuhan bisnis kamu.', icon: Rocket, href: '/subscription' },
      { label: 'Staf', desc: 'Kelola sumber daya manusia toko kamu.', icon: Users, href: '/settings/staff' },
      { label: 'Domain (Alamat Website)', desc: 'Atur URL toko kamu.', icon: Link2, href: '/settings/domain' },
      { label: 'SEO (Search Engine Optimization)', desc: 'Tingkatkan judul dan deskripsi halaman yang memengaruhi hasil pencarian.', icon: SearchCheck, href: '/settings/domain#seo' },
      { label: 'Aplikasi Toko Saya', desc: 'Bagi aplikasi toko kamu & kirim update terbaru ke customer.', icon: Smartphone, href: '/settings/store-apps' },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      { label: 'Kebijakan Toko', desc: 'Lihat kebijakan dan syarat & ketentuan toko kamu.', icon: FileText, href: '/settings/policies' },
      { label: 'Hapus toko', desc: 'Toko, produk, integrasi & langganan kamu akan terhapus.', icon: Trash2, href: '/settings/delete-store', danger: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {SETTINGS.map((section) => (
        <section key={section.title}>
          <h2 className="text-xs font-semibold text-neutral mb-3">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {section.items.map(({ label, desc, icon: Icon, href, danger }) => (
              <Link
                key={label}
                to={href}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-transparent hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-danger-surface' : 'bg-primary-surface'}`}>
                  <Icon className={`w-[18px] h-[18px] ${danger ? 'text-danger' : 'text-primary'}`} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${danger ? 'text-danger' : 'text-neutral'}`}>{label}</span>
                  <span className="block text-xs text-subdued mt-1 leading-5">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
