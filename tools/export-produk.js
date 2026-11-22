// Menyalin foto produk (hasil render-mockups) ke folder produk Shopee per tema,
// dengan nama 1.png, 2.png, ... dan membuat deskripsi.txt (judul + deskripsi siap tempel).
// Jalankan setelah render:  node tools/export-produk.js
// File 1.png dst. yang sudah ada dipindah dulu ke subfolder "lama" (tidak dihapus).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TUJUAN = path.resolve(ROOT, '..'); // D:\undangan digital
const URUTAN = ['1-utama', '4-tampilan', '2-nama-tamu', '3-fitur', '5-cara-order'];

// folder produk → tema
const PRODUK = {
  foto1: '03-analog-story',
  foto2: '01-boarding-pass',
  foto3: '08-cinema-premiere',
  foto4: '13-japandi',
  foto5: '15-cafe-menu',
  foto6: '18-arabesque',
  foto7: '09-celestial',
};

// keunikan tiap tema (untuk deskripsi)
const KHAS = {
  '01-boarding-pass': ['Sampul berupa tiket pesawat dengan nama tamu sebagai "Passenger"', 'Efek sobek tiket saat undangan dibuka', 'Hitung mundur bergaya papan keberangkatan bandara', 'Acara tampil sebagai tiket per gate'],
  '03-analog-story': ['Nuansa kamar cuci foto film analog dengan lampu merah', 'Foto "tercuci" perlahan dari pucat menjadi berwarna', 'Galeri foto dijemur di tali dengan jepitan kayu', 'Kisah cinta dalam gulungan roll film'],
  '08-cinema-premiere': ['Sampul poster film layar lebar "Coming Soon"', 'Hitung mundur film klasik 3-2-1 saat dibuka', 'Acara tampil sebagai tiket bioskop', 'Penutup berupa credit title ala akhir film'],
  '13-japandi': ['Desain minimalis Jepang-Skandinavia yang tenang & elegan', 'Lingkaran kuas ensō & stempel inisial mempelai', 'Efek pintu geser shoji saat undangan dibuka', 'Warna natural krem, kayu & sage'],
  '15-cafe-menu': ['Sampul struk pesanan kafe bertuliskan nama tamu', 'Hitung mundur berupa cangkir kopi yang makin penuh', 'Acara tampil sebagai papan menu kafe', 'Ucapan tamu berupa sticky notes warna-warni'],
  '18-arabesque': ['Nuansa islami Maroko: hijau zamrud & emas', 'Pintu kayu berpola terbuka memperlihatkan foto mempelai', 'Bismillah, salam, ayat & doa Barakallahu lakuma', 'Lentera berayun & pola bintang zellige'],
  '09-celestial': ['Langit malam berbintang yang berkelip', 'Peta bintang berbentuk hati, unik untuk setiap pasangan', 'Fase bulan asli pada malam pernikahan Anda', 'Efek melesat ke bintang saat undangan dibuka'],
};

function readConfig() {
  const box = { window: {} };
  require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8'), box);
  return box.window.UNDANGAN_CONFIG || {};
}

function deskripsi(meta, tema, kat) {
  const judul = `Undangan Pernikahan Digital Website Tema ${meta.nama} Premium Nama Tamu RSVP Musik Maps Amplop Digital`.slice(0, 120);
  const khas = (KHAS[tema] || []).map((k) => `- ${k}`).join('\n');
  return `JUDUL PRODUK (${judul.length}/120 karakter)
${judul}

HARGA
Samakan dengan produk Undangan Premium 7 Tema.

DESKRIPSI
UNDANGAN DIGITAL WEBSITE - TEMA ${meta.nama.toUpperCase()}
${meta.tagline}. Tampil eksklusif, cukup bagikan satu link ke semua tamu.

KEISTIMEWAAN TEMA ${meta.nama.toUpperCase()}
${khas}

FITUR LENGKAP
- Nama tamu otomatis di setiap link (Kepada Yth. ...)
- Hitung mundur menuju hari H
- Detail akad & resepsi + tombol Google Maps
- Simpan tanggal ke kalender
- RSVP konfirmasi kehadiran & buku ucapan
- Amplop digital - salin nomor rekening sekali ketuk
- Galeri foto & kisah cinta
- Musik latar
- Tampilan rapi di semua HP

PROSES & KETENTUAN
- Pengerjaan ${kat.proses} setelah data lengkap
- Termasuk ${kat.revisi}
- Masa aktif undangan ${kat.aktif}

CARA ORDER
1. Checkout produk ini
2. Kirim data mempelai, jadwal acara & foto lewat chat Shopee
3. Kami kirimkan link untuk dicek
4. Undangan siap dibagikan ke tamu

Catatan: foto pada gambar produk hanya contoh. Undangan Anda memakai foto & data Anda sendiri.
`;
}

const cfg = readConfig();
const kat = Object.assign({ proses: '1×24 jam', revisi: '2× revisi', aktif: '6 bulan' }, cfg.katalog || {});

for (const [folder, tema] of Object.entries(PRODUK)) {
  const src = path.join(ROOT, 'output', 'katalog', tema);
  const dst = path.join(TUJUAN, folder);
  if (!fs.existsSync(src)) { console.log(`⚠ ${tema}: belum dirender, jalankan render-mockups.js dulu`); continue; }
  fs.mkdirSync(dst, { recursive: true });

  // pindahkan nomor lama ke subfolder "lama"
  const lama = fs.readdirSync(dst).filter((f) => /^\d+\.png$/.test(f));
  if (lama.length) {
    const arsip = path.join(dst, 'lama');
    fs.mkdirSync(arsip, { recursive: true });
    lama.forEach((f) => fs.renameSync(path.join(dst, f), path.join(arsip, f)));
  }

  URUTAN.forEach((nama, i) => fs.copyFileSync(path.join(src, nama + '.png'), path.join(dst, `${i + 1}.png`)));
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes', tema, 'meta.json'), 'utf8'));
  fs.writeFileSync(path.join(dst, 'deskripsi.txt'), deskripsi(meta, tema, kat), 'utf8');
  console.log(`✓ ${folder} ← ${meta.nama}: ${URUTAN.length} foto + deskripsi.txt`);
}
