# Referensi desain: dashboard admin Plugo (diamati 14 Nov 2026)

Catatan ini dipakai untuk menyamakan **tata letak, gaya, dan fitur** ZunixeStore dengan dashboard admin Plugo.
Jangan salin logo, ilustrasi, maskot, atau nama merek Plugo. Pakai merek ZunixeStore sendiri.

## Token visual

| Token | Nilai | Dipakai untuk |
|---|---|---|
| primary | `#4169E1` | tombol utama, link, menu aktif, toggle aktif |
| primary-hover | `#3457C4` | hover tombol utama |
| primary-surface | `#ECF0FC` | latar menu aktif, tombol tonal ("Edit Desain Toko") |
| page | `#EFF3F8` | latar area konten |
| sidebar | `#F9FAFB` | latar sidebar |
| card | `#FFFFFF` | kartu, `rounded-xl` (12px), tanpa shadow, padding 12–16px |
| neutral | `#1B1C20` | teks utama, judul |
| subdued | `#6B7280` | teks sekunder, label menu tidak aktif |
| divider | `#E5E7EB` | border, garis tabel |

- Font: body **Roboto** 14px; label/angka kecil **Inter** 12px (500).
- Judul halaman: 20px bold `#1B1C20` (`text-xl font-bold`).
- Judul kartu: 14px semibold.
- Header: tinggi 68px, putih, logo kiri, kotak pencarian abu-abu di tengah (`Cari apa saja...` + hint `⌘ J`), kanan: ikon chat, lonceng (badge merah jumlah), avatar toko + nama + pill paket.
- Sidebar: lebar 280px, padding horizontal 16px. Item: `px-3 py-2 rounded-lg`, ikon outline 16px + label 14px abu `#6B7280`. Aktif: latar `#ECF0FC`, teks `#4169E1`. Submenu: indent tanpa ikon, aktif dengan gaya sama. Di atas: kartu Saldo + Koin (border, rounded-lg). "Pengaturan" menempel di bawah sidebar.
- Tabel: kartu putih `rounded-lg` dengan shadow tipis. `th` 14px bold hitam `py-3 px-4`; `td` `py-2 px-4`. Kolom bisa diurutkan (ikon ↕). Checkbox di kolom pertama. Footer: "Baris per halaman: [10 ▾]  1-10 of 21" + tombol ⟨ ← → ⟩.
- Badge status: pill `rounded-full border px-3 py-1` teks 14px (mis. "Dibatalkan", "Selesai", "Regular", "Gunakan Stok"). Aktif = hijau, Tidak Aktif = abu.
- Tab: garis bawah, tab aktif teks + garis primary.
- Chip filter: pill kecil 12px dengan ▾ ("Status ▾", "Tanggal ▾") dan "Tambah filter +".
- Empty state: kartu putih, ilustrasi tengah, judul bold, deskripsi abu, tombol primary "+ Tambah …".
- Halaman pengaturan (mis. Pengaturan Pesanan): dua kolom. Kiri: judul seksi bold + deskripsi abu (sekitar 40%). Kanan: kartu putih berisi kontrol (select, toggle, input).
- Halaman indeks Pengaturan: grid 3 kolom kartu (ikon dalam lingkaran `#ECF0FC` + judul + deskripsi), dikelompokkan per judul seksi.

## Struktur menu (tanpa Aplikasi)

- **Home** `/dashboard`
- **Pesanan**: Semua pesanan `/orders` · Konfirmasi Pembayaran `/pending/payment` · Pengiriman Tertunda `/pending/shipping` · Pengaturan Pesanan `/preferences/orders` · Kalender Open Order `/open-order`
- **Produk**: Semua produk `/products` · Stok `/inventory` · Kategori `/categories` · Produk bundle `/product-bundles` · Produk unggulan `/featured-products` · Pengaturan Produk `/preferences/products`
- **Diskon**: Diskon produk `/product-promotions` · Diskon pengiriman `/shipment-promotions`
- **Customer**: Semua Customer `/buyers` · Grup Customer `/buyer-groups` · Rating `/ratings` · Loyalty `/loyalty` · Pengaturan Customer `/preferences/checkout` · Notifikasi Customer `/preferences/buyer-notifications`
- **Desain Toko**: Desain & Template `/settings/themes` · Halaman Kustom `/shop/pages` · Galeri Media `/preferences/asset-manager` · Post Blog `/news` · FAQ `/preferences/faqs` · Testimoni `/testimonials`
- **Analitik & Marketing**: Statistik Toko `/analytics` · Laporan Penjualan `/reports` · Analisis Real-time `/analytics/realtime` · Laporan Wishlist `/analytics/wishlist` · Laporan Program Loyalty `/loyalty/analytics` · Alat Pemantauan `/preferences/marketing` · Kampanye Afiliasi `/affiliate-links`
- **Aplikasi** (daftar tetap seperti sekarang)
- **Pengaturan** `/preferences` (menempel di bawah)

## Isi tiap halaman

### Home
"Halo, {nama}!" + dropdown "Hari Ini". Tiga statistik dalam satu kartu: Pengunjung Website, Total Pesanan, Total Dibayar. Kartu "Status Pesanan" (Lihat Semua) berisi dua kotak bergaris: Siap Dikirim, Terkirim (dengan ›). Kartu promosi Ads yang bisa ditutup. Kartu "Aplikasi untuk Anda" (rekomendasi 2 kolom: ikon + judul + deskripsi 2 baris). Baris bawah: "Akses Cepat" (+) dan "Website Toko" (domain, Ubah, pratinjau, tombol tonal "Edit Desain Toko", baris link toko). Kolom kanan 295px: carousel banner + kartu "Pengumuman" (Lihat Semua; item: judul, badge merah "Baru", tanggal).

### Pesanan
- **Semua pesanan**: judul + tombol "+ Buat pesanan". Kartu: tab Semua / Baru / Lunas / Dikemas / Terkirim / Selesai / Dibatalkan. Baris pencarian: dropdown "ID Pesanan ▾" + input "Cari..." + tombol "Cari". Chip: Status ▾, Tanggal ▾, Tambah filter +. Kolom: [cb], Produk (thumb), ID Pesanan ↓, Status (pill), Penerima, Tipe Pembeli (pill "Regular"), Fulfillment (kurir + "Nomor Resi: …"), Status Fulfillment (pill "Terpenuhi"/"Tidak terpenuhi"), Status Pembayaran (pill), Info Pembayaran, Subtotal (Rp + metode kecil), Dibayar pada, Ditugaskan untuk, Dibuat, Dropship. Kosong: "Order tidak ditemukan".
- **Konfirmasi pembayaran**: sama, tab Semua / Baru.
- **Pengiriman Tertunda**: sama, tab Semua / Lunas / Dikemas, chip status terisi "Lunas, Dikemas".
- **Pengaturan Pesanan** (layout pengaturan dua kolom):
  - Status Pesanan Otomatis: select "Batalkan pesanan yang belum dibayar secara otomatis setelah" (2 hari) + catatan; select "Selesaikan pesanan secara otomatis setelah" (Selesai setelah 14 hari) + catatan.
  - Biaya Tambahan Khusus: toggle "Kenakan biaya tambahan" + deskripsi.
  - Kuantitas & Batasan: toggle Kuantitas minimum per pesanan (+ input "1 Jumlah"), toggle Kuantitas maksimum per pesanan, toggle Batasi kuantitas per produk, toggle Batas pesanan belum dibayar per pelanggan + deskripsi.
  - Pesanan Dropship: toggle "Tampilkan opsi dropship saat checkout".
  - Izinkan Pembatalan Pesanan: toggle "Pembeli dapat membatalkan pesanan".
  - Pertanyaan Checkout: toggle.
  - Faktur & Label Pengiriman: baris link "Pengaturan Faktur", "Pengaturan Label Pengiriman".
- **Kalender Open Order**: di Plugo dikunci paket. Buat kalender bulanan jadwal open order + empty state "Belum ada jadwal open order" + tombol "+ Buat jadwal".

### Produk
Judul "Semua produk" + bar kuota "44 / 30" + link "Tambah Limit". Tombol: menu ⋮, "Unduh / Perbarui (Excel)", "+ Buat produk". Kartu: tab Semua, pencarian "Nama atau Kode Produk", chip Kategori ▾, Ketersediaan Apa Pun ▾, Tambah filter +. Kolom: [cb], thumb, Nama (link bergaris bawah + ikon buka), Kategori, Inventaris ("500 ada stok"), Harga, Ketersediaan Produk (pill "Gunakan Stok"), ikon edit kolom. Footer "Items per page".

### Diskon
- **Diskon Produk**: judul + ⋮ + "+ Buat diskon". Pencarian "Cari", chip Status Apa Pun ▾, Tipe Apa Pun ▾. Kolom: Nama, Kode diskon, Diskon (5%), Min. Pembelian, Kuota (80/100), Tanggal Aktif, Jumlah Produk (thumb tumpuk +40), Status (pill Aktif hijau / Tidak Aktif abu). Catatan di bawah: "Catatan: Diskon tidak bisa diaplikasikan ketika harga grosir sedang aktif."
- **Diskon pengiriman**: empty state "Tawarkan diskon pengiriman" / "Kurangi biaya pengiriman untuk mendorong pembeli menyelesaikan pembelian." / tombol "Tambahkan Diskon".

### Customer
- **Semua Customer**: tabel customer (nama, email/telepon, grup, total pesanan, total belanja, terdaftar), pencarian, tombol "+ Tambah customer".
- **Grup Customer**: tabel grup (nama grup, jumlah anggota, diskon) + "+ Buat grup".
- **Rating**: judul + tombol "Download", "Pengaturan". Banner info "Review sedang disembunyikan di toko / Nyalakan fitur review untuk tingkatkan kepercayaan dan konversi / Aktifkan Review". Kartu ringkasan: skor besar 5.0, pill "Sangat Baik", "2 Ulasan", bar distribusi 5→1 dengan jumlah, bar aspek (Kualitas Produk, Pelayanan, Kecepatan Pengiriman, Harga Produk). Chip filter Semua / Rating / Produk / Customer. Daftar ulasan: nama produk (link), tanggal, bintang, teks, nama customer + tombol "Jawab".
- **Loyalty**: program poin & tier membership; kartu pengaturan poin (poin per Rp belanja, nilai tukar poin), daftar tier, toggle aktif.
- **Pengaturan Customer** (dua kolom): Masuk & Daftar → toggle Checkout Tamu, Metode Daftar Pembeli (checkbox Email, Nomor telepon), toggle Wajibkan Tanggal Lahir Pembeli. Rekrut Reseller → toggle "Izinkan customer mengajukan diri menjadi reseller". Chat → baris "Pengaturan Chat".
- **Notifikasi Customer**: Pemberitahuan Status Pesanan (toggle per item: Petunjuk Pembayaran [Penting], Pembayaran Dikonfirmasi [Penting], Bukti Bayar Ditolak, Pesanan Dikirim [Penting], Pesanan Diubah, Pesanan Dibatalkan). Pengingat Ulasan (toggle). Pengingat pembayaran (checkbox: 1, 3, 6, 12, 24, 48, 72 jam sebelum). Pengingat Check Out Belum Selesai (select "6 jam" + textarea template). OTP.

### Desain Toko
- **Desain & Template**: "Desain saat ini" (kartu pratinjau besar, nama tema + pill "Tayang" hijau + "Terakhir diupdate", tombol tonal "Edit Desain Toko", ⋮). "Desain saya (2/5)" (baris: thumb, nama, terakhir digunakan, "Ubah", tombol tonal "Terapkan Sekarang", ⋮). "Jelajahi Template" (grid 2 kolom kartu gambar + nama + "Lihat Tampilan" + tonal "Gunakan template"; paginasi).
- **Halaman Kustom**: empty state "Buat halaman tambahan untuk toko Anda" / "Tambahkan halaman untuk FAQ, kebijakan, promosi, dan lainnya." / "+ Tambah halaman".
- **Galeri Media**: judul + "Unggah media", tab Images / Videos, tabel (thumb, Nama, Tipe, Dibuat), Items per page 20.
- **Post Blog**: judul "Artikel blog", empty state "Tulis blog" / "Bagikan wawasan, promosi, dan berita untuk menarik perhatian pembeli." / "+ Buat postingan blog".
- **FAQ**: judul + "+ Buat topik". Daftar kartu topik: judul, tag "general", pertanyaan bold + jawaban dipotong, tombol "Ubah".
- **Testimoni**: judul + "+ Buat testimoni". Tabel Judul, Produk, Tindakan. Kosong: "No data available" → "Belum ada data".

### Analitik & Marketing
- **Statistik Toko**: judul + dropdown "7 hari terakhir". Segmented control lebar: Penjualan / Produk / Customer (aktif = pill primary). "Ringkasan Statistik" + deskripsi, 6 kartu metrik (Jumlah Pembayaran, Penjualan Bersih, Laba Kotor, Total Pengeluaran, Pengunjung, Tingkat Pembelian), masing-masing dengan titik warna, nilai, dan perubahan "↑ 0%". Lalu seksi grafik garis: Jumlah Order, Nilai Penjualan, Pengeluaran, Traffic Toko, Tingkat Konversi. Tiap seksi: judul + deskripsi + kotak metrik + grafik + legenda "Periode terpilih" / "Periode sebelumnya".
- **Laporan Penjualan**: daftar kartu link: "Penjualan berdasarkan tanggal", "Penjualan berdasarkan status order".
- **Analisis Real-time**: "Aktivitas Terkini", Users aktif (5 menit), grafik users per menit 30 menit terakhir, statistik Tampilan / Rata-rata / Puncak / Total, peta wilayah (placeholder), Halaman Teratas, Lokasi Teratas (empty).
- **Laporan Wishlist**: judul + filter "Tanggal apapun" + "Download". Tabel #, Produk, Dimasukkan ke Wishlist oleh. Kosong: "Tidak ditemukan data pada rentang ini".
- **Laporan Program Loyalty**: metrik poin diberikan/ditukar, member per tier.
- **Alat Pemantauan**: kartu Facebook Pixel (input Pixel ID + counter 0/120), Google Analytics (ID Pelacakan), TikTok Pixel, Google Ads (status Terhubung + ID + tombol "Buat Pemantauan Peristiwa").
- **Kampanye Afiliasi**: empty state "Kampanye Afiliasi" / "Lihat performa kampanye Anda" / "Buat Tautan Afiliasi" + link "Pelajari lebih lanjut".

### Pengaturan (`/preferences`)
Grid kartu per seksi:
- Pembayaran & Pengiriman: Metode pembayaran, Metode pengiriman, Lokasi, Paket Gratis Ongkir, Preferensi Internasional.
- Manajemen Toko / Preferensi Toko: Pengaturan Toko, Paket Upgrade, Staf, Domain (Alamat Website), SEO (Search Engine Optimization), Aplikasi Toko Saya.
- Lainnya: Kebijakan Toko, Hapus toko.

### Subhalaman Produk
- **Stok** (`/inventory`): judul "Stok" + tombol secondary "Unduh / Perbarui (Excel)" + primary "Kelola Inventaris". Segmented control lebar dua opsi: Stok / Riwayat Inventaris. Baris filter: Select "Produk ▾" + input cari; chip lokasi (nama toko ▾), "Semua Inventaris ▾", "Kategori ▾", "Tambah filter +"; di kanan Select "Sembunyikan Detail". Tabel: Produk (thumb + nama link), Varian, Kode Varian, Ketika tidak ada stok ("Habis Terjual"), Aktif (input angka stok yang bisa diedit langsung, lebar ~80px), Ubah. Footer "Baris per halaman".
- **Kategori** (`/categories`): judul "Semua kategori" + secondary "Ubah Urutan" + primary "+ Buat kategori". Pencarian "Cari". Tabel: [cb], Nama Kategori (thumb + nama link), Produk (jumlah), Kondisi. "Items per page: 100".
- **Produk bundle** (`/product-bundles`): judul + "+ Buat produk bundel". Chip "Tipe Apa Pun ▾", "Semua produk ▾". Tabel: Nama, Harga Bundle Produk (mis. "Dapatkan Potongan 10%"), Produk (thumb tumpuk).
- **Produk unggulan** (`/featured-products`): judul + "+ Tambah produk unggulan". Teks bantu "Seret untuk mengurutkan. 10 produk teratas akan ditampilkan di rekomendasi (jika diaktifkan)." Daftar kartu baris yang bisa diseret (ikon grip, thumb, nama, tombol hapus).
- **Pengaturan Produk** (`/preferences/products`), layout pengaturan dua kolom:
  - Pengaturan Standar (judul seksi saja, deskripsi: "Produk baru akan menggunakan pengaturan ini. Produk yang sudah ada tetap memakai pengaturannya sendiri.")
  - Status Standar: radio kartu "Selalu Ada Stok" / "Gunakan Stok" (dengan sub-opsi "Ketika Tidak ada Stok gunakan:" Pre-order (PO) / Waiting List / Habis Terjual) / "Pre-order (PO)" / "Waiting List"; pilihan waktu kirim 24 jam / 48 jam / 3 hari.
  - Visibilitas Standar: toggle "Tampilkan produk baru kepada customer".
  - Stok Menipis: toggle "Kirim notifikasi ketika stok produk menipis" + input "Kirim notifikasi ketika jumlah produk" (angka).
  - Visibilitas Stok: Select "Perlihatkan stok ke" (Tidak seorangpun / Semua customer / Reseller saja).
  - Sembunyikan Produk yang Habis Terjual: toggle.
  - Teks Kustom untuk Tombol 'Beritahu Saya': input teks.
  - Foto: toggle "Aktifkan Download".
