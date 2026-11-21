// Pengaturan global. Isi apiUrl dengan URL Web App Google Apps Script setelah di-deploy.
// Selama apiUrl kosong, hanya undangan demo (folder demo-data/) yang bisa dibuka.
window.UNDANGAN_CONFIG = {
  apiUrl: '',
  brand: 'Nama Toko Anda',      // muncul kecil di footer & gambar katalog
  domain: 'tokoanda.com',       // contoh link di gambar katalog "nama tamu"
  timezone: 'Asia/Jakarta',     // untuk tombol "Simpan ke Kalender"
  defaultTheme: '01-boarding-pass',
};
