# Undangan Digital

Satu website untuk semua klien: data di Google Sheets, tema di folder `themes/`,
di-hosting gratis di GitHub Pages (sellybintang.github.io/aksaradigitalco).

```
index.html            pemuat: baca slug → ambil data → muat tema
config.js             apiUrl Apps Script, nama toko, zona waktu
core/engine.js        mesin bersama (nama tamu ?to=, RSVP, musik, hitung mundur, salin, masa aktif)
core/base.css         gaya dasar bersama
themes/<nn-nama>/     theme.js (tampilan) + theme.css + README.md
demo-data/demo.json   data contoh untuk link demo katalog
apps-script/Code.gs   penghubung Google Sheets
docs/                 panduan kolom Sheets & SOP
tools/dev-server.js   server pratinjau lokal
```

## Daftar tema

Kolom `template` di Sheets diisi **kode SKU** (sama dengan produk Shopee); daftarnya di `config.js` → `sku`.
Link demo per produk: `/ad001` … `/ad011` (data di Google Sheets, lihat `docs/kolom-sheets.md`); demo lama `/demo-…` tetap jalan. Tema baru = kode berikutnya (AD012, dst.).
Nama folder lama (`01-boarding-pass`) tetap bisa dipakai. Versi tanpa foto: kolom `tanpa_foto` = ya.

| SKU | Tema | Folder | Demo |
|---|---|---|---|
| AD001 | Analog Story | `03-analog-story` | `/demo-analog-story` |
| AD002 | Boarding Pass | `01-boarding-pass` | `/demo` |
| AD003 | Cinema Premiere | `08-cinema-premiere` | `/demo-cinema-premiere` |
| AD004 | Japandi | `13-japandi` | `/demo-japandi` |
| AD005 | Café Menu | `15-cafe-menu` | `/demo-cafe-menu` |
| AD006 | Arabesque | `18-arabesque` | `/demo-arabesque` |
| AD007 | Celestial | `09-celestial` | `/demo-celestial` |
| AD008 | Nusantara (+ tanpa foto) | `19-nusantara` | `/demo-nusantara` · `/demo-nusantara-tanpa-foto` |
| AD009 | Prambanan (+ tanpa foto) | `21-prambanan` | `/demo-prambanan` · `/demo-prambanan-tanpa-foto` |
| AD010 | Taman Istana | `22-taman-istana` | `/demo-taman-istana` |
| AD011 | Lembah Wisteria | `23-lembah-wisteria` | `/demo-lembah-wisteria` |
| – | Simpanan (belum dijual): Vinyl Record, Art Gallery, Editorial, Atlas | `04`, `06`, `12`, `20` | `/demo-vinyl-record` dll. |

Foto demo ada di `demo-data/img-private/` dan ikut di-commit (dipakai demo online).

## Pratinjau di komputer
```
node tools/dev-server.js
```
Buka `http://localhost:5173/demo?to=Budi`. Ganti tema demo dengan `&theme=01-boarding-pass`.

## Alamat undangan
- Klien: `domainanda.com/<slug>?to=Nama+Tamu`
- Demo katalog: `domainanda.com/demo?theme=<tema>&to=Nama+Tamu`

## Alur order
1. Pembeli mengisi Google Form → masuk ke sheet "Klien" (lihat `docs/kolom-sheets.md`).
2. Isi `slug`, `template`, `aktif_sampai`, set `status` = `draft`, lalu cek.
3. Ubah `status` jadi `aktif` → kirim link ke pembeli. Tanpa perlu upload ulang website.

## Deploy ke GitHub Pages (dipakai sekarang)
1. Repo public: github.com/sellybintang/aksaradigitalco. Settings → Pages → Source: **GitHub Actions** (sekali saja).
2. Setiap `git push` ke `main` menjalankan `.github/workflows/pages.yml`: `node tools/deploy.js --cek --base aksaradigitalco`
   (alamat file disesuaikan ke subfolder, `404.html` = `index.html` untuk alamat `/<slug>`).
3. Link: `https://sellybintang.github.io/aksaradigitalco/<slug>?to=Nama+Tamu` · demo: `.../aksaradigitalco/demo`.

## Deploy ke Netlify (alternatif)
1. Repo: github.com/sellybintang/aksaradigitalco (private).
2. Netlify → Add new site → Import from GitHub → pilih repo. Pengaturan build dibaca otomatis dari `netlify.toml`
   (build: `node tools/deploy.js --cek`, publish: `.dist`, semua alamat diarahkan ke `index.html`).
3. Setiap `git push` ke `main` otomatis ter-deploy. Link: `aksaradigitalco.netlify.app/<slug>`.

## Deploy ke Cloudflare Pages (alternatif)
1. Push repository ini ke GitHub (private).
2. Cloudflare → Workers & Pages → Create → Pages → hubungkan repo.
   Build command: *(kosong)* · Output directory: `/`
3. Jangan tambahkan file `404.html` di root: tanpa file itu Cloudflare Pages otomatis
   mengarahkan alamat seperti `/raka-nadia` ke `index.html`.
4. Pasang domain sendiri di menu Custom domains.

## Gambar katalog Shopee (otomatis)
```
node tools/render-mockups.js pilihan           # tema yang dijual + foto gabungan (paling sering dipakai)
node tools/render-mockups.js                   # semua tema + foto gabungan
node tools/render-mockups.js 03-analog-story   # satu tema
node tools/render-mockups.js koleksi           # foto gabungan saja
```
Per tema (1 produk Shopee = 1 tema), di `output/katalog/<tema>/`:
`1-utama` (foto utama) · `2-nama-tamu` · `3-fitur` · `4-tampilan` · `5-cara-order`

Foto gabungan untuk produk bundel, di `output/katalog/_koleksi/`:
`1-kipas` · `2-grid` · `3-deret` (3 variasi foto utama)

Daftar tema yang dijual/digabung, lama proses, revisi, dan masa aktif diatur di `config.js` → `katalog`.

Video pembuka (MP4 vertikal 1080×1920, ±30 detik, untuk video produk Shopee / Reels / TikTok):
```
node tools/render-video.js                 # semua tema di config.js → katalog.koleksi
node tools/render-video.js 19-nusantara    # satu tema
```
Hasil di `output/video/<tema>.mp4`. Butuh ffmpeg (`winget install Gyan.FFmpeg`).

Siapkan folder produk Shopee per tema:
- 7 tema premium: `D:\undangan digital\premium\1` … `7` (video `1.mp4` di folder yang sama)
- tema baru: `D:\undangan digital\<kategori>\<warna>\df` (dengan foto) & `tf` (tanpa foto), video `1.mp4` / `2.mp4` di folder warna
```
node tools/export-produk.js            # semua
node tools/export-produk.js premium    # hanya premium
node tools/export-produk.js jawa/biru  # hanya satu kategori/warna
```
Mengisi `1.png`–`6.png` (urutan upload) + `deskripsi.txt` (judul & deskripsi siap tempel) + video bila sudah dirender.
Foto lama yang berbeda diarsipkan ke `lama/<tanggal-jam>/`.
Pemetaan folder → tema ada di bagian atas `tools/export-produk.js`.
Gambar diambil dari undangan demo asli, jadi selalu sama dengan tampilan terbaru.
Warna, font, dan bagian yang ditampilkan diatur di `themes/<tema>/meta.json`.
Nama toko & domain contoh diambil dari `config.js`. Butuh Chrome atau Edge terpasang.
Pratinjau satu layout di browser: `/tools/mockup.html?theme=<tema>&layout=utama|nama-tamu|fitur`.

## Menambah tema baru
Salin folder tema yang ada, ganti nama `nn-nama-tema`, ubah `theme.js` dan `theme.css`.
Atribut perilaku (`data-open`, `data-rsvp`, `data-countdown`, dll.) dijelaskan di kepala `core/engine.js`.
