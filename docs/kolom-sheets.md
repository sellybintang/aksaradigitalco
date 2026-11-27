# Kolom Google Sheets (sheet "Klien")

Baris 1 berisi nama kolom persis seperti di bawah. Satu baris = satu klien.
Format kolom tanggal sebagai **Teks biasa** (Format → Angka → Teks biasa).

| Kolom | Contoh | Keterangan |
|---|---|---|
| `slug` | `raka-nadia` | Alamat undangan: `domainanda.com/raka-nadia`. Huruf kecil, pakai tanda `-`, tanpa spasi |
| `template` | `AD002` | Kode SKU tema (lihat `config.js` → `sku`: AD001 Analog Story · AD002 Boarding Pass · AD003 Cinema Premiere · AD004 Japandi · AD005 Café Menu · AD006 Arabesque · AD007 Celestial · AD008 Nusantara · AD009 Prambanan · AD010 Taman Istana · AD011 Lembah Wisteria). Nama folder (`01-boarding-pass`) juga masih bisa. |
| `status` | `aktif` / `draft` | `draft` = belum bisa dibuka (untuk dicek dulu) |
| `aktif_sampai` | `2027-05-14` | Setelah tanggal ini undangan otomatis berakhir |
| `pria_nama`, `wanita_nama` | `Raka Pradipta, S.T.` | Nama lengkap + gelar |
| `pria_panggilan`, `wanita_panggilan` | `Raka` | Nama panggilan |
| `pria_ortu`, `wanita_ortu` | `Bapak Hendra & Ibu Sari` | |
| `pria_foto`, `wanita_foto` | URL gambar | Kosongkan bila tanpa foto |
| `pria_ig`, `wanita_ig` | `raka.contoh` | Opsional |
| `akad_judul` | `Akad Nikah` / `Pemberkatan` | Opsional, default "Akad Nikah" |
| `akad_mulai`, `akad_selesai` | `2027-02-14 08:00` | |
| `akad_tempat`, `akad_alamat` | | |
| `akad_maps` | link Google Maps | Opsional; kalau kosong tombol "Lihat Peta" di kartu acara disembunyikan (bagian peta tema Taman Istana & Lembah Wisteria tetap memakai alamat) |
| `resepsi_*` | sama seperti akad | Kosongkan `resepsi_mulai` bila tidak ada resepsi |
| `kutipan`, `kutipan_sumber` | ayat / kutipan | Opsional |
| `cerita` | `2019\|Judul\|Isi cerita` | Satu momen per baris (Alt+Enter di sel) |
| `galeri` | URL, URL, URL | Pisahkan dengan koma atau baris baru |
| `foto_sampul` | URL | Foto utama |
| `foto_berdua` | URL | Foto pasangan di bagian pembuka (opsional, dipakai sebagian tema) |
| `kredit_foto` | `@namafotografer` | Kredit fotografer di footer (opsional) |
| `zona_waktu` | `WIB` / `WITA` / `WIT` | Label jam acara & zona tombol "Simpan ke Kalender". Kosong = WIB. Kolom boleh diletakkan di mana saja (dibaca dari nama kolom) |
| `tanpa_foto` | `ya` / kosong | Versi tanpa foto: foto diganti ilustrasi beranimasi (tema Nusantara: wayang). Otomatis aktif juga bila tidak ada foto sama sekali |
| `musik` | URL file .mp3 / link Google Drive / `/assets/music/nama.mp3` | Opsional. Kosong = lagu bawaan tema (`themes/<tema>/meta.json` → `musik`, cadangan `config.js` → `musikDefault`). Isi `-` atau `tidak` untuk tanpa musik |
| `rekening` | `BCA\|1234567890\|Raka Pradipta` | Satu rekening per baris |
| `alamat_kado` | alamat lengkap | Opsional |

| `_no_pesanan`, `_kontak`, `_paket`, `_catatan` | bebas | **Catatan admin, privat.** Semua kolom berawalan `_` tidak pernah dikirim ke website |

Sheet **"Klien"** dan **"Ucapan"** dibuat otomatis dengan fungsi `siapkanSheet()` — lihat `docs/panduan-google-sheets.md`.

## Tampilan undangan

Semua undangan & demo tampil **per halaman (slide) yang berjalan otomatis**: ±3 detik per halaman
(`config.js` → `slideDetik`), halaman yang lebih panjang dari layar digulir pelan, dan otomatisnya berjeda
saat tamu berinteraksi. Pindah halaman: ketuk kanan/kiri layar, geser, panah ‹ ›, atau menu bawah
(warna mengikuti tema). Tidak ada kolom pengaturan tampilan. Alat katalog memakai `?shot=` (foto) dan
`?rekam=1` (video) untuk mendapat halaman utuh.

## Foto & musik dari Google Drive

Kolom foto (`pria_foto`, `wanita_foto`, `foto_sampul`, `foto_berdua`, `galeri`) dan `musik` boleh diisi **link share Google Drive**
(klik kanan file → Bagikan → Akses umum: *Siapa saja yang memiliki link* → Salin link). Website mengubahnya otomatis
menjadi gambar/audio. Link langsung lain (Cloudinary, dll.) dan alamat pendek file di situs (`/assets/music/cipaa.mp3`,
`/demo-data/img-private/bp-01.jpg`) juga bisa.

## Baris demo katalog (ad001 … ad011)

Demo per produk juga berupa baris di sheet Klien: slug = kode SKU huruf kecil (`ad011`), template = SKU (`AD011`),
`aktif_sampai` = `2099-12-31`. Link demo: `…/aksaradigitalco/ad011`. Foto, musik, nama & ucapan contoh cukup diubah di Sheets.
RSVP di link demo tidak dicatat. Baris demo diisi sekali dengan fungsi `imporDemo()` di Apps Script
(sumber: `demo-data/sheet-demo.json`, dibuat dengan `node tools/sheet-demo.js`); fungsi ini hanya menambah slug yang belum ada.
Bila baris demo belum ada / Sheets gagal dimuat, website memakai data demo bawaan tema.
