// Menyalin foto produk (hasil render-mockups) ke folder produk Shopee per tema,
// dengan nama 1.png, 2.png, ... dan membuat deskripsi.txt (judul + deskripsi siap tempel).
// Jalankan setelah render:  node tools/export-produk.js   (atau: node tools/export-produk.js premium / jawa/biru)
// File 1.png dst. yang sudah ada dipindah dulu ke subfolder "lama" (tidak dihapus).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TUJUAN = path.resolve(ROOT, '..'); // D:\undangan digital
const URUTAN = ['1-utama', '6-fasilitas', '4-tampilan', '2-nama-tamu', '3-fitur', '5-cara-order'];
const { execFileSync } = require('child_process');
let ff = null;
const ffmpeg = () => (ff = ff || require('./ffmpeg-path')());
const dur = (f) => {
  let s = '';
  try { execFileSync(ffmpeg(), ['-hide_banner', '-i', f], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { s = String(e.stderr || ''); }
  const m = s.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]) : 0;
};

// pasang musik ke video (gambar tidak dirender ulang): lagu pendek disambung dgn transisi 2 dtk,
// volume diratakan, fade in 1 dtk & fade out 2,5 dtk
function pasangMusik(video, musik, keluar) {
  const vd = dur(video), md = dur(musik);
  const n = Math.max(1, Math.ceil((vd + 1) / Math.max(1, md - 2)));
  const ins = []; for (let i = 0; i < n; i++) ins.push('-i', musik);
  let fc = '', prev = '[1:a]';
  for (let k = 1; k < n; k++) { fc += `${prev}[${k + 1}:a]acrossfade=d=2:c1=tri:c2=tri[a${k}];`; prev = `[a${k}]`; }
  fc += `${prev}loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=1,afade=t=out:st=${Math.max(0, vd - 2.5).toFixed(2)}:d=2.5[aud]`;
  const tmp = keluar + '.tmp.mp4';
  execFileSync(ffmpeg(), ['-v', 'error', '-y', '-i', video, ...ins, '-filter_complex', fc, '-map', '0:v', '-map', '[aud]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', tmp]);
  fs.renameSync(tmp, keluar);
}
// versi upload Shopee: 720×1280
function versiShopee(video) {
  const out = video.replace(/\.mp4$/, '-shopee.mp4');
  execFileSync(ffmpeg(), ['-v', 'error', '-y', '-i', video, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow',
    '-crf', '23', '-maxrate', '3M', '-bufsize', '6M', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
}

// folder produk → tema
const PRODUK = {
  'premium/1': '03-analog-story',
  'premium/2': '01-boarding-pass',
  'premium/3': '08-cinema-premiere',
  'premium/4': '13-japandi',
  'premium/5': '15-cafe-menu',
  'premium/6': '18-arabesque',
  'premium/7': '09-celestial',
  // format baru: <kategori>/<warna>/df (dengan foto) & /tf (tanpa foto); video di folder warna: 1.mp4 = df, 2.mp4 = tf
  'jawa/biru/df': '19-nusantara',
  'jawa/biru/tf': '19-nusantara~tanpa-foto',
  'jawa/hijau/df': '21-prambanan',
  'jawa/hijau/tf': '21-prambanan~tanpa-foto',
  'istana/hijau/df': '22-taman-istana',
  'wisteria/ungu/df': '23-lembah-wisteria',
  'danau/tosca/df': '24-danau-kembang-api',
};

// keunikan tiap tema (untuk deskripsi)
const KHAS = {
  '01-boarding-pass': ['Sampul berupa tiket pesawat dengan nama tamu sebagai "Passenger"', 'Efek sobek tiket saat undangan dibuka', 'Hitung mundur bergaya papan keberangkatan bandara', 'Acara tampil sebagai tiket per gate'],
  '03-analog-story': ['Nuansa kamar cuci foto film analog dengan lampu merah', 'Foto "tercuci" perlahan dari pucat menjadi berwarna', 'Galeri foto dijemur di tali dengan jepitan kayu', 'Kisah cinta dalam gulungan roll film'],
  '08-cinema-premiere': ['Sampul poster film layar lebar "Coming Soon"', 'Hitung mundur film klasik 3-2-1 saat dibuka', 'Acara tampil sebagai tiket bioskop', 'Penutup berupa credit title ala akhir film'],
  '13-japandi': ['Desain minimalis Jepang-Skandinavia yang tenang & elegan', 'Lingkaran kuas ensō & stempel inisial mempelai', 'Efek pintu geser shoji saat undangan dibuka', 'Warna natural krem, kayu & sage'],
  '15-cafe-menu': ['Sampul struk pesanan kafe bertuliskan nama tamu', 'Hitung mundur berupa cangkir kopi yang makin penuh', 'Acara tampil sebagai papan menu kafe', 'Ucapan tamu berupa sticky notes warna-warni'],
  '18-arabesque': ['Nuansa islami Maroko: hijau zamrud & emas', 'Pintu kayu berpola terbuka memperlihatkan foto mempelai', 'Bismillah, salam, ayat & doa Barakallahu lakuma', 'Lentera berayun & pola bintang zellige'],
  '19-nusantara': ['Nuansa keraton Jawa: biru dongker, emas antik & krem', 'Sampul ilustrasi 3D berlapis: joglo, gebyok, ronce melati & merak yang bergerak', 'Kertas batik bersobek dengan gunungan tersibak saat undangan dibuka', 'Bingkai foto mempelai, acara & galeri berukir emas ala engraving klasik'],
  '19-nusantara~tanpa-foto': ['Versi TANPA FOTO: cocok untuk mempelai yang tidak ingin memajang foto', 'Foto diganti ilustrasi pasangan berbusana adat Jawa yang bergerak halus', 'Ilustrasi berdiri di depan gunungan dalam bingkai lengkung emas', 'Tetap mewah: keraton navy & emas antik, sampul ilustrasi 3D berlapis'],
  '21-prambanan': ['Nuansa keraton Jawa: hijau zamrud, emas & krem', 'Opening segel lilin di gunungan yang terbelah saat dibuka', 'Sampul ilustrasi 3D berlapis: candi Prambanan, gebyok, kuluk & ronce melati yang bergerak', 'Bingkai gebyok emas dengan anggrek & pakis bergaya ukiran klasik'],
  '22-taman-istana': ['Nuansa taman istana: hijau botani, krem & mawar merah muda', 'Opening tirai belah dua dengan segel lilin mawar', 'Sampul ilustrasi 3D berlapis: gapura berukir, istana, bunga gantung & rumpun mawar yang bergerak', 'Halaman isi selang-seling terang & gelap berbingkai gapura dan taman istana'],
  '23-lembah-wisteria': ['Nuansa lembah air terjun: krem, hijau botani, plum & mawar', 'Sampul ilustrasi 3D berlapis: air terjun, kanopi wisteria, merpati putih, kunang-kunang & lili yang bergerak', 'Navigasi bawah mengambang (Mempelai, Acara, Kisah, Maps, RSVP) + tombol musik', 'Tombol Tambah ke Kalender (.ics), Google Maps & salin alamat; kisah cinta berbentuk kartu kubah'],
  '24-danau-kembang-api': ['Nuansa taman danau pastel: tosca, mawar & emas', 'Sampul ilustrasi 3D berlapis: danau berangsa & landmark kota, lampu taman, kembang api berkelip, kolibri & mawar', 'Kamera menyapu danau lalu mundur memperlihatkan bingkai bunga saat sampul dibuka', 'Navigasi bawah mengambang, Google Maps & salin alamat, tombol Tambah ke Kalender'],
  '21-prambanan~tanpa-foto': ['Versi TANPA FOTO: cocok untuk mempelai yang tidak ingin memajang foto', 'Foto diganti ilustrasi pasangan berbusana adat Jawa yang bergerak halus', 'Opening segel lilin di gunungan yang terbelah saat dibuka', 'Tetap mewah: hijau zamrud & emas, sampul candi Prambanan 3D berlapis'],
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

FASILITAS & BONUS (SUDAH TERMASUK)
${(kat.fasilitas || []).map(([t, d]) => `- ${t}: ${d}`).join('\n')}

FITUR LENGKAP
- Nama tamu otomatis di setiap link (Kepada Yth. ...)
- Hitung mundur menuju hari H
- Detail akad & resepsi + tombol Google Maps
- Simpan tanggal ke kalender
- RSVP konfirmasi kehadiran & buku ucapan
- Amplop digital - salin nomor rekening sekali ketuk
- ${meta.fiturGaleri || 'Galeri foto & kisah cinta'}
- Musik latar
- Tampilan rapi di semua HP

PROSES & KETENTUAN
- Pengerjaan maksimal ${kat.proses} setelah data lengkap
- ${kat.revisi} untuk perubahan data / teks sampai cocok
- Masa aktif undangan ${kat.aktif}

CARA ORDER
1. Checkout produk ini
2. Kirim data mempelai, jadwal acara & foto lewat chat Shopee
3. Kami kirimkan link untuk dicek
4. Undangan siap dibagikan ke tamu

${meta.fiturGaleri ? 'Catatan: versi ini tidak memerlukan foto. Cukup kirim data mempelai & acara.' : 'Catatan: foto pada gambar produk hanya contoh. Undangan Anda memakai foto & data Anda sendiri.'}
`;
}

const cfg = readConfig();
const kat = Object.assign({ proses: '1×24 jam', revisi: '2× revisi', aktif: '6 bulan', fasilitas: [] }, cfg.katalog || {});

// opsional: node tools/export-produk.js jawa/biru   (hanya folder/tema tertentu; awalan folder juga boleh)
const hanya = (process.argv[2] || '').split('\\').join('/');
for (const [folder, tema] of Object.entries(PRODUK)) {
  if (hanya && folder !== hanya && tema !== hanya && !folder.startsWith(hanya + '/')) continue;
  const src = path.join(ROOT, 'output', 'katalog', tema.replace('~', '-'));
  const dst = path.join(TUJUAN, folder);
  if (!fs.existsSync(src)) { console.log(`⚠ ${tema}: belum dirender, jalankan render-mockups.js dulu`); continue; }
  fs.mkdirSync(dst, { recursive: true });

  // arsipkan foto lama yang BERBEDA dari versi baru ke lama/<tanggal-jam>/ (tidak pernah menimpa arsip)
  const baru = new Map(URUTAN.map((nama, i) => [`${i + 1}.png`, path.join(src, nama + '.png')]));
  const sama = (a, b) => fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));
  const lama = fs.readdirSync(dst).filter((f) => /^\d+\.png$/.test(f) && !(baru.has(f) && sama(path.join(dst, f), baru.get(f))));
  if (lama.length) {
    const cap = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/^(\d{8})/, '$1-');
    const arsip = path.join(dst, 'lama', cap);
    fs.mkdirSync(arsip, { recursive: true });
    lama.forEach((f) => fs.renameSync(path.join(dst, f), path.join(arsip, f)));
  }

  URUTAN.forEach((nama, i) => fs.copyFileSync(path.join(src, nama + '.png'), path.join(dst, `${i + 1}.png`)));
  const [id, varian] = tema.split('~');
  const meta = Object.assign(JSON.parse(fs.readFileSync(path.join(ROOT, 'themes', id, 'meta.json'), 'utf8')),
    varian ? JSON.parse(fs.readFileSync(path.join(ROOT, 'themes', id, `meta.${varian}.json`), 'utf8')) : {});
  fs.writeFileSync(path.join(dst, 'deskripsi.txt'), deskripsi(meta, tema, kat), 'utf8');
  // video produk (bila sudah dirender) ikut disalin
  const vid = path.join(ROOT, 'output', 'video', tema.replace('~', '-') + '.mp4');
  const vidDst = /(^|\/)(df|tf)$/.test(folder) ? path.join(path.dirname(dst), folder.endsWith('/tf') ? '2.mp4' : '1.mp4') : path.join(dst, '1.mp4');
  let infoVid = '';
  if (fs.existsSync(vid)) {
    // musik pilihan: file .mp3 di folder tempat video berada (mis. premium\1\lagu.mp3) dipasang otomatis
    const mp3 = fs.readdirSync(path.dirname(vidDst)).find((f) => /\.mp3$/i.test(f));
    if (mp3) { pasangMusik(vid, path.join(path.dirname(vidDst), mp3), vidDst); infoVid = ` + ${path.basename(vidDst)} (musik: ${mp3})`; }
    else { fs.copyFileSync(vid, vidDst); infoVid = ` + ${path.basename(vidDst)}`; }
    versiShopee(vidDst);   // 720×1280 untuk upload Shopee (maks. 1280 px)
    infoVid += ` + ${path.basename(vidDst, '.mp4')}-shopee.mp4`;
  }
  console.log(`✓ ${folder} ← ${meta.nama}: ${URUTAN.length} foto + deskripsi.txt${infoVid}`);
}
