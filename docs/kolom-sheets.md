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
| `akad_maps` | link Google Maps | Opsional; kalau kosong dibuat otomatis dari alamat |
| `resepsi_*` | sama seperti akad | Kosongkan `resepsi_mulai` bila tidak ada resepsi |
| `kutipan`, `kutipan_sumber` | ayat / kutipan | Opsional |
| `cerita` | `2019\|Judul\|Isi cerita` | Satu momen per baris (Alt+Enter di sel) |
| `galeri` | URL, URL, URL | Pisahkan dengan koma atau baris baru |
| `foto_sampul` | URL | Foto utama |
| `foto_berdua` | URL | Foto pasangan di bagian pembuka (opsional, dipakai sebagian tema) |
| `kredit_foto` | `@namafotografer` | Kredit fotografer di footer (opsional) |
| `tanpa_foto` | `ya` / kosong | Versi tanpa foto: foto diganti ilustrasi beranimasi (tema Nusantara: wayang). Otomatis aktif juga bila tidak ada foto sama sekali |
| `musik` | URL file .mp3 | Opsional |
| `rekening` | `BCA\|1234567890\|Raka Pradipta` | Satu rekening per baris |
| `alamat_kado` | alamat lengkap | Opsional |

| `_no_pesanan`, `_kontak`, `_paket`, `_catatan` | bebas | **Catatan admin, privat.** Semua kolom berawalan `_` tidak pernah dikirim ke website |

Sheet **"Klien"** dan **"Ucapan"** dibuat otomatis dengan fungsi `siapkanSheet()` — lihat `docs/panduan-google-sheets.md`.
