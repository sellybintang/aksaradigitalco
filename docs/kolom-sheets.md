# Kolom Google Sheets (sheet "Klien")

Baris 1 berisi nama kolom persis seperti di bawah. Satu baris = satu klien.
Format kolom tanggal sebagai **Teks biasa** (Format → Angka → Teks biasa).

| Kolom | Contoh | Keterangan |
|---|---|---|
| `slug` | `raka-nadia` | Alamat undangan: `domainanda.com/raka-nadia`. Huruf kecil, pakai tanda `-`, tanpa spasi |
| `template` | `01-boarding-pass` | Nama folder tema |
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
| `musik` | URL file .mp3 | Opsional |
| `rekening` | `BCA\|1234567890\|Raka Pradipta` | Satu rekening per baris |
| `alamat_kado` | alamat lengkap | Opsional |

Sheet **"Ucapan"** dibuat otomatis oleh Apps Script saat ada RSVP pertama.
