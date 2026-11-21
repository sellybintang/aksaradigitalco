# Undangan Digital

Satu website untuk semua klien: data di Google Sheets, tema di folder `themes/`,
di-hosting gratis di Cloudflare Pages.

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

| Tema | Status | Demo |
|---|---|---|
| 01 Boarding Pass | Dipakai | `/demo` |
| 03 Analog Story | Dipakai | `/demo-analog-story` |
| 08 Cinema Premiere | Dipakai | `/demo-cinema-premiere` |
| 13 Japandi | Dipakai | `/demo-japandi` |
| 15 Café Menu | Dipakai | `/demo-cafe-menu` |
| 18 Arabesque | Dipakai | `/demo-arabesque` |
| 04 Vinyl Record | Disimpan (tidak dipilih) | `/demo-vinyl-record` |
| 06 Art Gallery | Disimpan (tidak dipilih) | `/demo-art-gallery` |

Foto demo ada di `demo-data/img-private/` dan **tidak ikut di-commit** (belum ada izin publikasi
dari fotografer). Setelah clone di komputer lain, salin folder itu secara manual.

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

## Deploy ke Cloudflare Pages
1. Push repository ini ke GitHub (private).
2. Cloudflare → Workers & Pages → Create → Pages → hubungkan repo.
   Build command: *(kosong)* · Output directory: `/`
3. Jangan tambahkan file `404.html` di root: tanpa file itu Cloudflare Pages otomatis
   mengarahkan alamat seperti `/raka-nadia` ke `index.html`.
4. Pasang domain sendiri di menu Custom domains.

## Gambar katalog Shopee (otomatis)
```
node tools/render-mockups.js                  # semua tema
node tools/render-mockups.js 03-analog-story   # satu tema
```
Hasil: `output/katalog/<tema>/1-utama.png`, `2-nama-tamu.png`, `3-fitur.png` (1080×1080).
Gambar diambil dari undangan demo asli, jadi selalu sama dengan tampilan terbaru.
Warna, font, dan bagian yang ditampilkan diatur di `themes/<tema>/meta.json`.
Nama toko & domain contoh diambil dari `config.js`. Butuh Chrome atau Edge terpasang.
Pratinjau satu layout di browser: `/tools/mockup.html?theme=<tema>&layout=utama|nama-tamu|fitur`.

## Menambah tema baru
Salin folder tema yang ada, ganti nama `nn-nama-tema`, ubah `theme.js` dan `theme.css`.
Atribut perilaku (`data-open`, `data-rsvp`, `data-countdown`, dll.) dijelaskan di kepala `core/engine.js`.
