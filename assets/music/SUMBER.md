# Sumber musik

| File | Asal | Lisensi |
|---|---|---|
| `srie-wedding.mp3` | "Srie Wedding Invitation" (`src/Srie_Wedding_Invitation.mp3`), disediakan pemilik toko | Bebas royalti (menurut pemilik toko) |
| `gending-manten.mp3` | Dibuat sendiri dengan `tools/make-music.js` | Orisinal, bebas dipakai |

Pengolahan `srie-wedding.mp3`:
- Lagu asli (23 detik) disambung 2× dengan transisi silang 3 detik, sehingga panjangnya menjadi 43 detik.
- Volume diratakan dengan loudnorm I=-16 LUFS, puncak -1.5 dB.

Perintahnya:

```
ffmpeg -i src/Srie_Wedding_Invitation.mp3 -i src/Srie_Wedding_Invitation.mp3 -filter_complex "[0][1]acrossfade=d=3:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 192k srie-wedding.mp3
```

Simpan link sumber atau bukti lisensinya di sini kalau suatu saat ada klaim.
