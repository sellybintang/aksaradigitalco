// Pengaturan global. Isi apiUrl dengan URL Web App Google Apps Script setelah di-deploy.
// Selama apiUrl kosong, hanya undangan demo (folder demo-data/) yang bisa dibuka.
window.UNDANGAN_CONFIG = {
  apiUrl: '',
  brand: 'Nama Toko Anda',      // muncul kecil di footer & gambar katalog
  domain: 'tokoanda.com',       // contoh link di gambar katalog "nama tamu"
  timezone: 'Asia/Jakarta',     // untuk tombol "Simpan ke Kalender"
  defaultTheme: '01-boarding-pass',

  // Pengaturan gambar katalog Shopee (tools/render-mockups.js)
  katalog: {
    // tema yang masuk foto gabungan (produk bundel) — urutan = urutan tampil
    koleksi: ['01-boarding-pass', '03-analog-story', '08-cinema-premiere', '13-japandi', '15-cafe-menu', '18-arabesque', '09-celestial'],
    proses: '1×24 jam',   // lama pengerjaan, tampil di gambar "Cara Order"
    revisi: '2× revisi',
    aktif: '6 bulan',     // masa aktif undangan
  },
};
