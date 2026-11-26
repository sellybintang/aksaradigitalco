// Pengaturan global. Isi apiUrl dengan URL Web App Google Apps Script setelah di-deploy.
// Selama apiUrl kosong, hanya undangan demo (folder demo-data/) yang bisa dibuka.
window.UNDANGAN_CONFIG = {
  apiUrl: '',
  brand: 'Aksara Digital',      // muncul kecil di footer & gambar katalog
  domain: 'aksaradigitalco.netlify.app', // contoh link di gambar katalog "nama tamu"
  timezone: 'Asia/Jakarta',     // untuk tombol "Simpan ke Kalender"
  defaultTheme: '01-boarding-pass',

  // Pengaturan gambar katalog Shopee (tools/render-mockups.js)
  katalog: {
    // tema yang masuk foto gabungan (produk bundel) — urutan = urutan tampil
    koleksi: ['01-boarding-pass', '03-analog-story', '08-cinema-premiere', '13-japandi', '15-cafe-menu', '18-arabesque', '09-celestial'],
    proses: '1×24 jam',   // lama pengerjaan maksimal, tampil di gambar "Cara Order"
    revisi: 'Bebas revisi',
    aktif: '1 tahun',     // masa aktif undangan
    // gambar utama: 4 keunggulan (ikon: jam|revisi|bintang|kilat|tamu|musik) & label fitur di bawah
    keunggulan: [['jam', 'Aktif 1 Tahun'], ['revisi', 'Bebas Revisi'], ['bintang', 'Gratis Foto Animasi'], ['kilat', 'Proses Cepat']],
    label: ['Unlimited Tamu', 'Nama Tamu Otomatis', 'RSVP & Ucapan', 'Amplop Digital', 'Musik & Maps'],
    // fasilitas / bonus (gambar katalog "Fasilitas" & deskripsi Shopee): [judul, keterangan]
    fasilitas: [
      ['Request Musik', 'Pakai lagu favorit kalian sendiri, tanpa biaya tambahan'],
      ['Bebas Revisi', 'Data & teks boleh direvisi sampai cocok sebelum disebar'],
      ['Maks. 1×24 Jam Jadi', 'Data lengkap hari ini, besok undangan siap dibagikan'],
      ['Nama Tamu Tanpa Batas', 'Link bernama untuk semua tamu, berapa pun jumlahnya'],
      ['Link Custom', 'Alamat undangan memakai nama kalian berdua'],
      ['Aktif 1 Tahun', 'Link tetap bisa dibuka 1 tahun sejak dikirim'],
      ['Rekap RSVP & Ucapan', 'Daftar kehadiran & ucapan tamu kami kirimkan'],
      ['Template Pesan WA', 'Teks undangan siap kirim, tinggal salin & tempel'],
    ],
  },
};
