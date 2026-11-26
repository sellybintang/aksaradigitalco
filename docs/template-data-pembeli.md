# Template Data Pembeli

Dipakai di langkah 3 "Kirim data" (lihat gambar Cara Order): setelah pesanan masuk, admin
mengirim pesan di bawah lewat chat Shopee. Pesan dipecah jadi 3 bagian supaya tidak
terpotong dan pembeli tidak kewalahan. Salin blok teks apa adanya.

Kalau pembeli membalas, pindahkan jawabannya ke sheet "Klien" — pemetaan kolom ada di
bagian paling bawah.

---

## Pesan 0 — Sapaan setelah pesanan masuk

```
Halo Kak, terima kasih sudah order undangan digital di Aksara Undangan 🤍

Pesanan Kakak sudah kami terima. Supaya undangannya bisa segera kami buat,
mohon isi data di 3 pesan berikut ya. Cukup salin, isi setelah tanda titik dua,
lalu kirim balik di chat ini.

Bagian yang bertanda (opsional) boleh dikosongkan.
Undangan jadi maksimal 1x24 jam setelah data lengkap, dan bebas revisi 🙏
```

## Pesan 1 — Data mempelai

```
*DATA MEMPELAI*

Tema / variasi yang dipilih:

— Mempelai Pria —
Nama lengkap + gelar:
Nama panggilan:
Nama ayah:
Nama ibu:
Instagram (opsional):

— Mempelai Wanita —
Nama lengkap + gelar:
Nama panggilan:
Nama ayah:
Nama ibu:
Instagram (opsional):

Link undangan yang diinginkan (mis. raka-nadia):
```

## Pesan 2 — Data acara

```
*DATA ACARA*

— Akad Nikah / Pemberkatan —
Nama acara (Akad Nikah / Pemberkatan / lainnya):
Hari, tanggal:
Jam mulai – selesai (tulis "selesai" bila tidak tentu):
Nama tempat:
Alamat lengkap:
Link Google Maps (opsional):

— Resepsi — (kosongkan bila tidak ada)
Hari, tanggal:
Jam mulai – selesai:
Nama tempat:
Alamat lengkap:
Link Google Maps (opsional):

Zona waktu: WIB / WITA / WIT
Link live streaming (opsional):
```

## Pesan 3 — Foto, musik & tambahan

```
*FOTO, MUSIK & TAMBAHAN*

Versi: dengan foto / tanpa foto (ilustrasi)

Foto (kirim langsung di chat ini atau lewat link Google Drive):
- Foto sampul (1 foto utama, sebaiknya portrait):
- Foto mempelai pria (opsional):
- Foto mempelai wanita (opsional):
- Foto galeri (opsional, maks. 10):
Kredit fotografer (opsional, mis. @namafotografer):

Lagu latar (judul + penyanyi, atau "bebas pilihkan"):

Ayat / kutipan (opsional, atau "bebas pilihkan"):

Love story (opsional, boleh 1–4 momen):
Tahun – judul singkat – cerita singkat
Tahun – judul singkat – cerita singkat

Amplop digital (opsional, boleh lebih dari 1):
Bank/e-wallet – no. rekening – atas nama
Bank/e-wallet – no. rekening – atas nama

Alamat kirim kado (opsional):

Catatan / permintaan khusus:
```

## Pesan 4 — Konfirmasi setelah data diterima

```
Terima kasih Kak, datanya sudah kami terima lengkap 🙏
Undangan sedang kami buat dan paling lambat besok sudah kami kirim linknya
untuk dicek. Kalau ada yang ingin diubah, tinggal kabari di chat ini ya.
```

## Pesan 5 — Kirim link undangan

```
Halo Kak, undangannya sudah jadi 🎉

Link undangan:
https://aksaradigital.pages.dev/[slug]

Contoh link dengan nama tamu:
https://aksaradigital.pages.dev/[slug]?to=Nama+Tamu

Silakan dicek dulu ya Kak — nama, tanggal, jam, alamat, dan foto.
Kalau ada yang perlu direvisi, tulis saja di chat ini.
Kalau sudah oke, kami kirimkan juga template pesan WA untuk menyebar undangan 🤍

Undangan aktif sampai: [tanggal]
```

---

## Untuk admin: jawaban → kolom sheet "Klien"

| Jawaban pembeli | Kolom sheet | Cara isi |
|---|---|---|
| No. pesanan Shopee, username | `_no_pesanan`, `_kontak` | Isi sendiri dari Shopee |
| Tema / variasi, versi paket | `template`, `_paket` | Nama folder tema, mis. `13-japandi` |
| Link undangan | `slug` | Huruf kecil, pakai `-`, tanpa spasi |
| — | `status`, `aktif_sampai` | `draft` dulu; aktif 1 tahun sejak link dikirim |
| Nama lengkap + gelar | `pria_nama`, `wanita_nama` | |
| Nama panggilan | `pria_panggilan`, `wanita_panggilan` | |
| Nama ayah & ibu | `pria_ortu`, `wanita_ortu` | `Bapak … & Ibu …` |
| Instagram | `pria_ig`, `wanita_ig` | Tanpa `@` |
| Link live streaming, zona waktu WITA/WIT | `_catatan` | Belum ada kolomnya di website — lihat catatan di bawah |
| Nama acara akad | `akad_judul` | Kosong = "Akad Nikah" |
| Tanggal + jam akad | `akad_mulai`, `akad_selesai` | Format `2027-02-14 08:00` (kolom teks biasa) |
| Tempat, alamat, maps akad | `akad_tempat`, `akad_alamat`, `akad_maps` | Maps kosong = tombol "Lihat Peta" disembunyikan |
| Data resepsi | `resepsi_*` | Kosongkan `resepsi_mulai` bila tidak ada resepsi |
| Versi tanpa foto | `tanpa_foto` | `ya` bila tanpa foto |
| Foto sampul / pria / wanita / galeri | `foto_sampul`, `pria_foto`, `wanita_foto`, `galeri` | Upload dulu, isi URL-nya; galeri dipisah koma |
| Kredit fotografer | `kredit_foto` | |
| Lagu | `musik` | URL file .mp3 |
| Ayat / kutipan | `kutipan`, `kutipan_sumber` | |
| Love story | `cerita` | `Tahun\|Judul\|Isi`, satu momen per baris (Alt+Enter) |
| Amplop digital | `rekening` | `Bank\|Nomor\|Atas nama`, satu per baris |
| Alamat kado | `alamat_kado` | |
| Catatan / permintaan khusus | `_catatan` | Privat, tidak tampil di website |

### Cek sebelum ubah `status` jadi `aktif`
- [ ] Ejaan nama + gelar sudah sama persis dengan jawaban pembeli
- [ ] Hari & tanggal cocok (cek di kalender — sering salah hari)
- [ ] Jam akad & resepsi tidak tertukar
- [ ] Link Maps membuka lokasi yang benar
- [ ] Nomor rekening sudah dicek dua kali
- [ ] Foto tampil, lagu berputar
- [ ] Buka link dengan `?to=Nama` untuk cek nama tamu

### Belum didukung website (perlu diputuskan)
- **Live streaming** — diiklankan di gambar "Fitur Undangan", tapi belum ada kolom maupun
  tampilannya di tema. Kalau pembeli mengisi link, sementara belum bisa ditampilkan.
- **Zona waktu WITA/WIT** — tombol "Simpan ke Kalender" memakai `Asia/Jakarta` (WIB) untuk
  semua klien (`config.js`). Acara di luar WIB akan tercatat jam yang salah di kalender tamu.
