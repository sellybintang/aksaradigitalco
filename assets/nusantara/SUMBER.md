# Sumber gambar tema Nusantara

Semua gambar boleh dipakai untuk keperluan komersial.

| File | Asal | Lisensi |
|---|---|---|
| `pria.webp` | [Raden Angkawijaya.jpg](https://commons.wikimedia.org/wiki/File:Raden_Angkawijaya.jpg). Ilustrasi K.G.P.A.A. Mangkunagara VII, sekitar tahun 1930. | Domain publik |
| `wanita.webp` | [Wara Srikandhi.jpg](https://commons.wikimedia.org/wiki/File:Wara_Srikandhi.jpg). Ilustrasi K.G.P.A.A. Mangkunagara VII, sekitar tahun 1930. | Domain publik |
| `gunungan.webp`, `gunungan-mini.webp` | [Wayang Kulit; Kayonan (tree of life)...](https://commons.wikimedia.org/wiki/File:Wayang_Kulit;_Kayonan_(tree_of_life),_Arjuna_and_Sumbadra_from_Java.JPG). Foto oleh pengguna Wikimedia "Hiart". | CC0 |

File asli ada di `src/`. Latarnya dihapus dengan `tools/cutout.js`:

```
node tools/cutout.js assets/nusantara/src/angkawijaya.jpg pria.png --crop 0,0,799,1390 --close 3 --paper 40,1500 --min 900
node tools/cutout.js assets/nusantara/src/srikandhi.jpg wanita.png --crop 0,0,610,1140 --close 3 --seed "354,413;396,801"
node tools/cutout.js assets/nusantara/src/gunungan.jpg gunungan.png --crop 0,40,1116,2444 --tol 150 --step 9 --min 3000 --width 800
```

## Lapisan sampul 2.5D (`layer/`)

| File | Isi |
|---|---|
| `02-joglo.webp` | Rumah joglo |
| `03-gebyok.webp` | Bingkai gebyok emas dan pilar |
| `04-ronce.webp` | Ronce melati dan janur emas |
| `05-merak-kiri.webp` | Merak kiri |
| `06-merak-kanan.webp` | Merak kanan |
| `07-bunga-gunungan.webp` | Bunga lili, pakis, dan gunungan |

- **Asal:** ilustrasi milik pemilik toko (dibuat dengan Gemini). Berkas aslinya, dengan latar putih dan ukuran 572×1024, ada di `layer/src/`.
- **Pengolahan:** dibesarkan 2× menjadi 1144×2048, lalu latar putihnya dihapus dengan perintah ini:

```
node tools/cutout.js layer/src/<file> <nama>.png --line --keep --tol 30 --step 22 --min 60 --width 1144   (tambah --bg "#ffffff" untuk gebyok)
```

- **Lapisan kertas dan gunung:** dibuat dengan CSS/SVG langsung di dalam tema, jadi tidak ada file gambarnya.
