# Sumber musik

| File | Asal | Lisensi |
|---|---|---|
| `srie-wedding.mp3` | "Srie Wedding Invitation" (`src/Srie_Wedding_Invitation.mp3`), disediakan pemilik toko | Bebas royalti (menurut pemilik toko) |
| `gending-manten.mp3` | Dibuat sendiri dengan `tools/make-music.js` | Orisinal, bebas dipakai |
| `princess-draft.mp3` | "Princess Draft" (`D:/undangan digital/istana/Princess_draft_mp3.mp3`), disediakan pemilik toko, musik tema Taman Istana | Dari pemilik toko |

Pengolahan `srie-wedding.mp3`:
- Lagu asli (23 detik) disambung 2× dengan transisi silang 3 detik, sehingga panjangnya menjadi 43 detik.
- Volume diratakan dengan loudnorm I=-16 LUFS, puncak -1.5 dB.

Perintahnya:

```
ffmpeg -i src/Srie_Wedding_Invitation.mp3 -i src/Srie_Wedding_Invitation.mp3 -filter_complex "[0][1]acrossfade=d=3:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 192k srie-wedding.mp3
```

Simpan link sumber atau bukti lisensinya di sini kalau suatu saat ada klaim.

## Musik video produk premium

File-file ini tidak ada di repositori. Masing-masing tersimpan di folder `D:\undangan digital\premium\<n>\`. Menurut pemilik toko, semuanya bebas royalti (dikonfirmasi 22-11-2026).

| Folder | Tema | File musik |
|---|---|---|
| 1 | Analog Story | Undangan_Digital_mp3.mp3 |
| 2 | Boarding Pass | Wcc_Pasuruan_-_Sidoarjo_mp3.mp3 |
| 3 | Cinema Premiere | atenaproject_mp3.mp3 |
| 4 | Japandi | haaa_mp3.mp3 (isinya sama dengan folder 3) |
| 5 | Café Menu | cipaa_mp3.mp3 |
| 6 | Arabesque | WEDDING_CONTENTCREATOR_LAMPUNG_mp3.mp3 |
| 7 | Celestial | Rona_Cinta_WCC_Bogor_mp3.mp3 |

Musik dipasang ke `1.mp4` tanpa merekam ulang video. Lagu yang lebih pendek dari video disambung dengan transisi silang 2 detik. Volume diratakan dengan loudnorm I=-16, musik muncul pelan 1 detik di awal dan memudar 2,5 detik di akhir.

Tambahan:
- `pasuruan-sidoarjo.mp3` — "Wcc Pasuruan - Sidoarjo" (`src/Wcc_Pasuruan_-_Sidoarjo.mp3`, dari `D:/undangan digital/premium/2`), disediakan pemilik toko, musik demo tema Boarding Pass. Diolah sama seperti `srie-wedding.mp3` (disambung 2× transisi 3 dtk, loudnorm I=-16 LUFS).
- Musik demo per produk (dari folder produk pemilik toko, disediakan pemilik toko). Diratakan loudnorm I=-16 LUFS; yang < 30 dtk disambung 2× seperti di atas.
  - `undangan-digital.mp3` ← `premium/1/Undangan_Digital_mp3.mp3` (AD001 Analog Story)
  - `atenaproject.mp3` ← `premium/3/atenaproject_mp3.mp3` (AD003 Cinema Premiere; file sama persis dengan `premium/4/haaa_mp3.mp3`, AD004 Japandi)
  - `cipaa.mp3` ← `premium/5/cipaa_mp3.mp3` (AD005 Café Menu)
  - `wcc-lampung.mp3` ← `premium/6/WEDDING_CONTENTCREATOR_LAMPUNG_mp3.mp3` (AD006 Arabesque)
  - `rona-cinta.mp3` ← `premium/7/Rona_Cinta_WCC_Bogor_mp3.mp3` (AD007 Celestial)
  - `senarai-vite.mp3` ← `jawa/hijau/senarai_vite_mp3.mp3` (AD009 Prambanan)
